# YOL — Claude Code Instructions

## What is YOL?

YOL (Youtube On Loop) is a YouTube looping web app. Users can:
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

1. **Fetch from BOTH sources in parallel:**
   - Pending feature requests: `node feature.js` — hits `GET https://api.t31k.cloud/yol/admin/requests?variant=feature_request` with the admin bearer token and prints JSON. Always use this script — do NOT call the API with curl (it hangs on HTTP/2). For sponsor requests, run `node feature.js sponsor`.
   - Open Discord `#feedback` forum threads: `node discord.js inbox` — lists every active forum thread that is **not** tagged `closed`, with id, title, tags, and first message. These are user feedback posted directly in Discord (so they have no admin DB id).
2. Skip any feature-request rows with status `future` — ignore them entirely.
3. **Cross-check Discord threads against the admin requests + `FEATURES.md`.** If an open Discord thread is already represented (same idea), don't double-process it — just note it. Otherwise treat it as a new pending item.
4. If there are no pending items from EITHER source, say "No new requests — time to do some marketing!" and stop.
5. For each pending item, rate it **1–10 on complexity** (10 = huge, 1 = trivial).
6. **Posting to Discord:**
   - For admin-DB requests, post to the forum BEFORE implementing: `node discord.js thread "<concise title>" "<original request quoted with >>" "feature,new"` (or `bug,new` for bug reports). The script prints the new thread ID — remember it for the shipped reply. Keep the title short and problem-focused.
   - For items that came from Discord directly, the thread already exists — skip thread creation and reuse the thread id from `inbox`.
7. If complexity <= 6: plan carefully, implement it, push, update `FEATURES.md` — no need to show the plan or ask first.
8. If complexity > 6: briefly describe your approach and ask before implementing.
9. Always run `pnpm run build` to verify before pushing.
10. **After shipping**, for each thread (whether you created it or it came from Discord):
    - Post a reply with what was shipped: `node discord.js reply <thread_id> "Shipped! 🚀\n\n<short note on what changed>"`
    - Swap tags to closed: `node discord.js tags <thread_id> "feature,closed"` (or `bug,closed`).
11. If the item came from the admin DB, mark it done: `node feature.js done <id>`. To dismiss instead, run `node feature.js dismiss <id>` (in that case skip the shipped reply, or post a short "not moving forward" note before closing tags). Discord-only items have no admin DB id — closing the Discord thread is enough.

## Frontend & Design

This is a customer-facing product. Visual quality and UX simplicity directly affect retention.

- **Always use the `frontend-design` skill** before implementing any UI changes.
- **KISS** — keep every interaction obvious. If a user has to think, it's too complex.
- Prefer fewer, bolder UI choices over many small options.
- No over-engineering: simple flows, clear affordances, minimal cognitive load.
- The neobrutalism theme is the foundation — stay consistent with it.

## General Rules

- Always run `pnpm run build` before pushing.
- Keep `FEATURES.md` up to date after any feature work.
- Update `yol_requests` status via the admin API after implementing (`done`) or deciding not to (`dismissed`). Never write to the DB directly.
- Don't add dependencies without asking.
- Don't refactor code outside the scope of the task.
- Prefer editing `page.tsx` over creating new component files unless the component is clearly reusable.
