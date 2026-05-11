# Hiretics Landing Page

Standalone Next.js 15 project containing only the marketing landing page, ready to deploy to Vercel independently from the main app.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | Recommended | URL of the main Hiretics app, e.g. `https://app.hiretics.com`. CTA buttons (`Log in`, `Try for free`, `Subscribe`, `Get started free`) on the landing page link to `${NEXT_PUBLIC_APP_URL}/signin` and `${NEXT_PUBLIC_APP_URL}/signup`. If unset, CTAs fall back to `#`. |

For local testing, copy `.env.example` to `.env.local` and fill it in.

## Deploy to Vercel

1. Push this folder to its own GitHub repo (or push the parent monorepo).
2. In Vercel, **Add New Project** → import the repo.
3. If the parent `Hiretics-new` repo is imported, set the **Root Directory** to `landing/` in the Vercel project settings.
4. Framework preset: **Next.js** (auto-detected).
5. Under **Environment Variables**, add `NEXT_PUBLIC_APP_URL` pointing to the main app URL.
6. Deploy.

Build command, output directory, install command — leave at defaults; Next.js handles everything.

## Structure

```
landing/
├─ public/                images used by the page
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx       root layout + ThemeProvider
│  │  ├─ providers.tsx    next-themes wrapper
│  │  ├─ page.tsx         renders LandingPage
│  │  └─ globals.css      Tailwind v4 + theme tokens
│  └─ components/
│     └─ LandingPage.tsx  the page itself
├─ next.config.ts
├─ postcss.config.mjs
├─ tsconfig.json
└─ package.json
```
