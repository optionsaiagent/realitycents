# RealityCents — Frontend (Vercel)

React/Vite single-page application for [realitycents.com](https://realitycents.com). This package is designed for deployment on **Vercel** as a static site.

## Architecture

- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite 7
- **Styling:** Tailwind CSS 4 + shadcn/ui components
- **Routing:** Wouter (client-side SPA routing)
- **API Client:** tRPC + React Query (connects to the Railway backend)
- **Deployment:** Vercel (static build)

## Pages Included

| Route | Page |
|-------|------|
| `/` | Home |
| `/about` | About Jay Miller |
| `/knowledge-base` | Knowledge Base (article listing) |
| `/knowledge-base/:slug` | Individual articles |
| `/calculator` | Basic Mortgage Calculator |
| `/advanced-calculator` | Advanced Calculator (Conv/VA/FHA/Jumbo) |
| `/affordability-calculator` | What Can I Afford? |
| `/rent-vs-buy` | Rent vs. Buy Calculator |
| `/buydown-calculator` | Temporary Buydown Calculator |
| `/military-calculator` | Military Buying Power Calculator |
| `/loan-compare` | Loan Comparison Tool |
| `/va-approved-condos-oahu` | VA Approved Condos |
| `/guide` | Homebuying Guide |
| `/frequently-asked-questions` | FAQ (canonical) |
| `/contact` | Contact |

### Redirects

- `/faq` → `/frequently-asked-questions` (301)
- `/agents`, `/agent-hub`, `/agent-toolkit`, `/for-agents`, `/dealsync` → `/` (301)

## Local Development

```bash
# Install dependencies
pnpm install

# Create .env.local from example
cp .env.example .env.local
# Edit .env.local with your Railway backend URL

# Start dev server
pnpm dev
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Railway backend URL (e.g., `https://realitycents-api.up.railway.app`) | Yes |
| `VITE_OAUTH_PORTAL_URL` | OAuth portal URL | For admin login |
| `VITE_APP_ID` | OAuth app ID | For admin login |
| `VITE_ANALYTICS_ENDPOINT` | Analytics endpoint | Optional |
| `VITE_ANALYTICS_WEBSITE_ID` | Analytics website ID | Optional |

## Deployment to Vercel

### Option 1: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel deploy --prod
```

### Option 2: Git Integration

1. Push this directory to a GitHub/GitLab repository
2. Import the repository in the [Vercel Dashboard](https://vercel.com/new)
3. Vercel will auto-detect the Vite framework
4. Set environment variables in the Vercel project settings
5. Deploy

### Vercel Configuration

The `vercel.json` file handles:
- SPA routing (all paths rewrite to `index.html`)
- Asset caching (1 year for hashed assets)
- 301 redirects for old/removed routes

## Build

```bash
pnpm run build
# Output: dist/
```

The build output is a static directory ready to be served by any CDN or static host.
