import { PrismaAdapter } from '@next-auth/prisma-adapter'
import type { NextAuthOptions } from 'next-auth'
import type { DefaultSession } from 'next-auth'
import { db } from './db'

// Extend NextAuth types
declare module 'next-auth' {
  interface Session {
    user: { id: string } & DefaultSession['user']
  }
}

const REGION = (process.env.BLIZZARD_REGION ?? 'eu') as 'eu' | 'us' | 'kr' | 'tw'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),

  providers: [
    {
      id: 'battlenet',
      name: 'Battle.net',
      type: 'oauth',
      // Battle.net's OIDC discovery endpoint returns 403, so we specify
      // all endpoints manually. We still request the openid scope (id_token
      // is issued) but let NextAuth call userinfo for the profile — this
      // sidesteps the iss-validation error without losing the openid grant.
      authorization: {
        url: `https://${REGION}.battle.net/oauth/authorize`,
        // Without "openid" scope Battle.net does NOT issue an id_token,
        // so NextAuth never tries to validate its `iss` claim.
        // sub + battletag are available on the userinfo endpoint anyway.
        params: { scope: 'wow.profile' },
      },
      token:    `https://${REGION}.battle.net/oauth/token`,
      userinfo: `https://${REGION}.battle.net/oauth/userinfo`,
      checks: ['state'],
      clientId:     process.env.BLIZZARD_CLIENT_ID!,
      clientSecret: process.env.BLIZZARD_CLIENT_SECRET!,
      profile(profile: { sub: string; battletag: string }) {
        return {
          id:    String(profile.sub),
          name:  profile.battletag,
          email: null,
          image: null,
        }
      },
    },
  ],

  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: { ...session.user, id: user.id },
    }),
  },

  events: {
    // NextAuth does NOT update access_token on re-login for existing accounts.
    // We do it manually here so the stored token is always fresh.
    async signIn({ account }) {
      if (account?.provider === 'battlenet' && account.access_token) {
        await db.account.updateMany({
          where: {
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          },
          data: {
            access_token: account.access_token,
            expires_at:   account.expires_at ?? null,
          },
        })
      }
    },
  },

  pages: {
    signIn: '/',
    error: '/',
  },
}
