import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'render.worldofwarcraft.com' },
      { protocol: 'https', hostname: 'wow.zamimg.com' },
    ],
  },
}

export default withNextIntl(nextConfig)
