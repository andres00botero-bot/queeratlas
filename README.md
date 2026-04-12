# Queer Atlas

Global queer discovery atlas for cities, venues, events, guides, and member signal.

## Local setup

1. Install dependencies:
```bash
npm install
```

2. Copy env template:
```bash
cp .env.example .env.local
```

3. Start dev server:
```bash
npm run dev
```

## Environment variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_MAPBOX_TOKEN`
- `NEXT_PUBLIC_SENTRY_DSN` (optional, but recommended for production)

## Production safety net

### Error tracking (Sentry)

Sentry is integrated via `@sentry/nextjs`.

To enable it:

1. Create project in Sentry.
2. Copy browser DSN.
3. Set `NEXT_PUBLIC_SENTRY_DSN` in Vercel Environment Variables.
4. Redeploy.

### Uptime monitor

Health endpoint:

- `/api/health`

Expected response:

```json
{ "ok": true, "service": "queer-atlas", "status": "healthy" }
```

Use this endpoint in UptimeRobot / Better Stack / Pingdom with a 1-minute check.

## SEO & indexing

- `src/app/sitemap.js` generates dynamic sitemap (including city pages).
- `src/app/robots.js` points bots to sitemap and blocks member-only pages from indexing.
- `src/app/layout.js` includes canonical metadata and JSON-LD Website schema.

## Smoke-test checklist (live)

1. Home loads and search opens city/event results.
2. `/cities` lists all cities and country filters work.
3. City page map, venue panel, event panel, and reviews work.
4. `/events` shows city + off-grid events and date filtering.
5. Login/logout works (Google and email).
6. Member gating works for favorites/contribute/community.
7. Report from city/community appears in admin Safety Inbox.
8. Block/unblock content reflects across city/community/events/favorites.
9. `/terms`, `/privacy`, `/community-policy` open without errors.
10. `/api/health`, `/sitemap.xml`, and `/robots.txt` return 200.
