# RealityCents — Backend (Railway)

Express/tRPC API server with Drizzle ORM for [realitycents.com](https://realitycents.com). This package is designed for deployment on **Railway**.

## Architecture

- **Runtime:** Node.js 22 (ESM)
- **Framework:** Express 4
- **API Layer:** tRPC v11 (with superjson transformer)
- **Database:** MySQL (TiDB Cloud) via Drizzle ORM
- **Auth:** JWT sessions + OAuth callback
- **Storage:** S3-compatible object storage (via Forge proxy)
- **Deployment:** Railway (Nixpacks)

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Health check (returns `{ status: "ok" }`) |
| `POST /api/trpc/*` | tRPC batch endpoint |
| `GET /api/oauth/callback` | OAuth callback handler |

### tRPC Procedures

| Procedure | Type | Description |
|-----------|------|-------------|
| `system.health` | Query | Server health check |
| `auth.me` | Query | Get current user |
| `auth.logout` | Mutation | Clear session |
| `shortUrl.create` | Mutation | Create share link |
| `shortUrl.resolve` | Query | Resolve share link |
| `toolkit.register` | Mutation | Register agent |
| `toolkit.checkAgent` | Query | Check agent email |
| `toolkit.updateProfile` | Mutation | Update agent profile |
| `toolkit.uploadLogo` | Mutation | Upload agent logo |
| `toolkit.removeLogo` | Mutation | Remove agent logo |
| `toolkit.getResources` | Query | List toolkit resources |
| `toolkit.downloadResource` | Mutation | Download branded PDF |
| `toolkit.adminGetAgents` | Query | Admin: list agents |
| `toolkit.adminGetStats` | Query | Admin: download stats |
| `toolkit.adminGetNewsletterStats` | Query | Admin: newsletter count |
| `toolkit.adminExportCsv` | Query | Admin: export CSV |

## Local Development

```bash
# Install dependencies
npm install

# Create .env from example
cp .env.example .env
# Edit .env with your database URL and other secrets

# Run database migrations
npm run db:push

# Start dev server (with hot reload)
npm run dev
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | MySQL connection string | Yes |
| `FRONTEND_URL` | Vercel frontend URL (for CORS + OAuth redirect) | Yes |
| `PORT` | Server port (default: 3000) | No |
| `JWT_SECRET` | Secret for signing session JWTs | Yes |
| `OAUTH_SERVER_URL` | OAuth server base URL | Yes |
| `VITE_APP_ID` | OAuth application ID | Yes |
| `OWNER_OPEN_ID` | Owner's OAuth open ID (for admin role) | Yes |
| `BUILT_IN_FORGE_API_URL` | Storage proxy URL | Yes |
| `BUILT_IN_FORGE_API_KEY` | Storage proxy API key | Yes |

## Deployment to Railway

### Option 1: Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# Deploy
railway up
```

### Option 2: Git Integration

1. Push this directory to a GitHub repository
2. Create a new project in [Railway Dashboard](https://railway.app/new)
3. Connect the GitHub repository
4. Set environment variables in Railway project settings
5. Railway will auto-detect Node.js and deploy

### Railway Configuration

The `railway.json` file configures:
- Build command: `npm run build` (esbuild → `dist/index.js`)
- Start command: `npm run start`
- Health check: `GET /health`
- Auto-restart on failure

A `Procfile` is also included as an alternative.

## Database

The project uses Drizzle ORM with MySQL. Schema is defined in `drizzle/schema.ts`.

### Tables

- `users` — OAuth user accounts
- `short_urls` — Loan comparison share links
- `toolkit_agents` — Registered real estate agents
- `toolkit_resources` — Downloadable PDF resources
- `toolkit_downloads` — Download audit log

### Running Migrations

```bash
# Generate migration SQL from schema changes
npm run db:generate

# Apply migrations
npm run db:migrate
```

## Build

```bash
npm run build
# Output: dist/index.js (single ESM bundle)
```
