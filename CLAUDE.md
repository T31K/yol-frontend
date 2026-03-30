# YOL — Claude Code Instructions

## What is YOL?

YOL (You Only Loop) is a YouTube looping web app. Users can:
- Loop any YouTube video with precise A/B loop points
- Control playback speed
- Set a repeat count (loop N times then stop)
- Create and manage playlists with drag-to-reorder
- Organize playlists into folders
- Import YouTube playlists via link
- Shuffle playlists
- Track watch history
- Sign in with Google to sync data across devices
- Use the app in EN, DE, JA, or FR

## Stack

- **Frontend**: Next.js 14 (app router), TypeScript, Tailwind CSS (neobrutalism theme)
- **Drag-and-drop**: `@hello-pangea/dnd`
- **Auth**: Google OAuth (production), email/password
- **Backend**: Custom API at `process.env.NEXT_PUBLIC_API_URL` (default `http://localhost:3001`)
- **i18n**: Custom `useLanguage` hook + flat translation objects in `src/lib/translations.ts`
- **State**: React hooks, localStorage for guests, server sync for logged-in users
- **Admin panel**: `/admin` — password-protected page to manage feature requests

## Key Files

- `src/app/page.tsx` — entire app UI (~2900+ lines, single component file)
- `src/lib/use-playlists.ts` — playlist CRUD + reorder + server sync
- `src/lib/use-folders.ts` — folder CRUD + server sync
- `src/lib/use-auth.ts` — auth token management
- `src/lib/use-language.ts` — language selection (persisted to localStorage)
- `src/lib/translations.ts` — all translation strings (EN/DE/JA/FR)
- `FEATURES.md` — feature status table

## On Session Start ("dev")

**IMPORTANT: Never connect to the database directly. Never read DB credentials from ~/.zshrc or any file. All DB access goes through the harmonize-server API.**

When the user says **"dev"** (or starts a dev session):

1. Fetch pending requests from the admin API:
   ```
   GET {NEXT_PUBLIC_API_URL}/yol/admin/requests
   Authorization: Bearer {YOL_ADMIN_SECRET}
   ```
   The secret is in `harmonize-server/.env` as `YOL_ADMIN_SECRET`. Use `curl` or similar to call the endpoint.
2. Skip any requests with status `future` — ignore them entirely.
3. If there are no pending requests, say "No new requests — time to do some marketing!" and stop.
4. For each pending request, rate it **1–10 on simplicity** (10 = trivial, 1 = huge).
5. If simplicity >= 6: plan carefully, implement it, push, update the request status via `PATCH {NEXT_PUBLIC_API_URL}/yol/admin/requests/{id}` with `{ "status": "done" }`, update `FEATURES.md` — no need to show the plan or ask first.
6. If simplicity < 6: briefly describe your approach and ask before implementing.
7. After implementing, always run `pnpm run build` to verify before pushing.

## General Rules

- Always run `pnpm run build` before pushing.
- Keep `FEATURES.md` up to date after any feature work.
- Update `yol_requests` status via the admin API after implementing (`done`) or deciding not to (`dismissed`). Never write to the DB directly.
- Don't add dependencies without asking.
- Don't refactor code outside the scope of the task.
- Prefer editing `page.tsx` over creating new component files unless the component is clearly reusable.
