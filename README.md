# WoW Weekly Planner

A web application for **World of Warcraft** players to plan their weekly character activities. After logging in via Battle.net, characters are automatically imported from the account. The app then tracks Vault progress, Mythic+ runs, raid bosses, and Delves for the current weekly reset — along with a priority list of activities based on the character's average item level.

## Features

- Login via **Battle.net OAuth**
- Automatic import of all WoW characters from a Battle.net account
- **Vault Tracker** – visualizes progress in The Great Vault (M+, Raid, Delves)
- Tracking of Mythic+ runs, raid bosses, and Delves
- Auto-generated **priority list** of weekly activities based on character ilvl
- Manual or auto-sync with the Blizzard API
- **Czech and English** language support (switcher in the header)

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router, Turbopack) |
| UI | [React 19](https://react.dev/), [Tailwind CSS 3](https://tailwindcss.com/) |
| Language | TypeScript 5 |
| Auth | [NextAuth v4](https://next-auth.js.org/) – Battle.net OAuth |
| ORM | [Prisma 5](https://www.prisma.io/) |
| Database | SQLite (development) / PostgreSQL (production) |
| i18n | [next-intl 4](https://next-intl-docs.vercel.app/) |
| Blizzard API | [Battle.net REST API](https://develop.battle.net/documentation) |

## Prerequisites

- **Node.js** 20+
- **npm** 10+ (or pnpm / yarn)
- A Battle.net developer application – see [develop.battle.net](https://develop.battle.net/access/clients)
- PostgreSQL (for production) or Docker (see below)

## Environment Setup

Copy the example file and fill in your values:

```bash
cp .env.local.example .env.local
```

Contents of `.env.local`:

```env
# Battle.net OAuth App (https://develop.battle.net/access/clients)
BLIZZARD_CLIENT_ID=your_client_id
BLIZZARD_CLIENT_SECRET=your_client_secret
BLIZZARD_REGION=eu        # eu | us | kr | tw

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=                      # generate with: openssl rand -base64 32

# Database
# SQLite (dev):    file:./prisma/dev.db
# PostgreSQL:      postgresql://postgres:postgres@localhost:5432/wow_planner
DATABASE_URL=file:./prisma/dev.db
```

### Creating a Battle.net Application

1. Go to [develop.battle.net/access/clients](https://develop.battle.net/access/clients)
2. Create a new application
3. Add the following to **Redirect URIs**: `http://localhost:3000/api/auth/callback/battlenet`
4. Copy the **Client ID** and **Client Secret** into `.env.local`

## Installation & Running

```bash
# 1. Install dependencies
npm install

# 2. Generate the Prisma client
npm run db:generate

# 3. Push the database schema
npm run db:push

# 4. Start the development server
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

## Database

### SQLite (default for development)

No installation required. Set `DATABASE_URL=file:./prisma/dev.db` and run `npm run db:push`.

### PostgreSQL via Docker

```bash
# Start the PostgreSQL container
docker compose up -d

# Set in .env.local:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/wow_planner

# Push the schema
npm run db:push
```

### Prisma Studio (data browser)

```bash
npm run db:studio
```

Opens at [http://localhost:5555](http://localhost:5555).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Development server with Turbopack HMR |
| `npm run build` | Production build |
| `npm run start` | Start the production build |
| `npm run lint` | ESLint check |
| `npm run db:generate` | Generate the Prisma client |
| `npm run db:push` | Sync schema to the database |
| `npm run db:studio` | Open Prisma Studio |

## Project Structure

```
src/
├── app/
│   ├── [locale]/               # Localized pages (cs, en)
│   │   ├── page.tsx            # Landing page / sign in
│   │   ├── dashboard/          # Overview of tracked characters
│   │   ├── characters/         # Character list and selection
│   │   └── character/[id]/     # Character detail + weekly planner
│   └── api/
│       ├── auth/               # NextAuth endpoints
│       ├── characters/         # Character CRUD + Blizzard API sync
│       └── weekly/             # Weekly state persistence
├── components/
│   ├── layout/                 # Header, UserPanel, LanguageSwitcher
│   ├── planner/                # WeeklyPlanner, VaultTracker, PriorityList
│   ├── character/              # CharacterCard, ClassBadge, TrackingToggle
│   └── ui/                     # Button, Card, Badge, ProgressBar
├── lib/
│   ├── blizzard/               # Blizzard API client and types
│   ├── auth.ts                 # NextAuth configuration
│   ├── db.ts                   # Prisma client singleton
│   ├── vault.ts                # Vault calculation logic
│   ├── priorities.ts           # Activity priority generation
│   └── crafting.ts             # Crafting logic
├── i18n/                       # next-intl configuration
messages/
├── cs.json                     # Czech translations
└── en.json                     # English translations
prisma/
└── schema.prisma               # Database schema
docker-compose.yml              # PostgreSQL for local development
```

## Database Schema

- **User** – player authenticated via Battle.net
- **Character** – WoW character (name, realm, class, spec, ilvl)
- **WeeklyState** – per-character weekly activity state (M+ runs, raid bosses, Delves, completed tasks)
- **AhSnapshot** – Auction House commodity price snapshots
- **Account / Session / VerificationToken** – NextAuth required tables
