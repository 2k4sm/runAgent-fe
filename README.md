# runAgent — Frontend

Chat web app for the runAgent multi-agent backend.

**Stack:** Vite 8 · React 19 · TypeScript · Tailwind CSS 4 · Base UI · Zustand 5 ·
React Router 7 · Supabase (auth) · sonner.

## Setup

```sh
pnpm install
cp .env.example .env   # then fill in the values
pnpm dev               # http://localhost:5173
```

### Environment variables

| Variable                 | Description                                            |
| ------------------------ | ------------------------------------------------------ |
| `VITE_SUPABASE_URL`      | Supabase project URL (same project the backend trusts) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key                                      |
| `VITE_API_BASE_URL`      | Backend API prefix — defaults to `/api/v1` (dev proxy) |

The dev server proxies `/api` to `http://localhost:8000`, so run the backend there.

## Scripts

- `pnpm dev` — start the dev server
- `pnpm build` — type-check and build for production
- `pnpm lint` — run ESLint
- `pnpm format` — run Prettier

## Architecture

- `src/services/` — backend calls; `api.ts` attaches the Supabase JWT and handles 401/429.
- `src/stores/` — Zustand stores: `auth`, `conversation`, `chat`, `ui`.
- `src/hooks/useSSE.ts` — streaming SSE reader for the chat response.
- `src/hooks/useChat.ts` — send flow: create conversation → POST message → stream → reconcile.
- `src/components/ui/` — Base UI–backed primitives.
