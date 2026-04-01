# YOL Auth + Sync Design
**Date:** 2026-03-23

## Overview
Add optional Google OAuth login to YOL. Guests continue using localStorage unchanged. Logged-in users sync playlists, folders, and history to harmonize-server (PostgreSQL). Import/export JSON works for both modes.

---

## Auth Flow

1. User clicks "Sign in with Google" in YOL
2. YOL redirects browser to `https://api.t31k.cloud/yol/auth/google?redirect=https://youtubeonloop.com`
3. harmonize-server initiates Google OAuth → user approves → Google calls callback on harmonize-server
4. harmonize-server creates/finds user in `users` table → issues JWT → redirects to `https://youtubeonloop.com?token=<JWT>`
5. YOL reads `?token` from URL, stores in `localStorage` as `yol-auth-token`, removes from URL
6. YOL decodes JWT payload (base64, no signature verification needed client-side) for `name`, `avatar_url`, `email`

**YOL needs no Google Client ID** — harmonize-server handles the full OAuth dance.

### JWT payload schema
```json
{ "sub": "<user_id>", "email": "...", "name": "...", "avatar_url": "...", "iat": 0, "exp": 0 }
```

---

## harmonize-server Changes

### Env vars (add to `.env`)
```
YOL_GOOGLE_CLIENT_ID=...
YOL_GOOGLE_CLIENT_SECRET=...
YOL_CALLBACK_URL=https://api.t31k.cloud/auth/google/callback
```
(`JWT_SECRET` already exists)

### New DB tables
```sql
users (id, google_id, email, name, avatar_url, created_at)
yol_playlists (id, user_id, data JSONB, updated_at)
yol_folders   (id, user_id, data JSONB, updated_at)
yol_history   (id, user_id, data JSONB, updated_at)
```
Each user has one row per table (full array stored as JSONB — simple v1 approach).

### New endpoints (all in `routes/yol.js`)
```
GET  /yol/auth/google           → redirect to Google (accepts ?redirect= param, stored in state)
GET  /yol/auth/google/callback  → handle callback, issue JWT, redirect to YOL with ?token=JWT
GET  /yol/auth/me               → return user info { id, email, name, avatar_url } from JWT
POST /yol/sync/playlists        → upsert full playlists array for user
POST /yol/sync/folders          → upsert full folders array for user
POST /yol/sync/history          → upsert full history array for user
GET  /yol/sync/all              → return { playlists, folders, history } for user
```
All `/yol/sync/*` and `/yol/auth/me` endpoints require `Authorization: Bearer <jwt>`. Return 401 on invalid/expired token.

Existing YOL routes (`/yol/search`, `/yol/feature-request`) also moved into `routes/yol.js`.

### Local development
Add `http://localhost:3001/yol/auth/google/callback` to Google Cloud Console authorized redirect URIs.
Use `YOL_CALLBACK_URL=http://localhost:3001/yol/auth/google/callback` in local `.env`.

---

## YOL Changes

### Storage keys
```
yol-auth-token      → JWT string (cleared on logout)
yol-auth-migrated   → "true" flag (set after first-login migration completes, prevents re-upload on reload)
yol-playlists       → kept empty [] when logged in
yol-folders         → kept empty [] when logged in
yol-loop-history    → kept empty [] when logged in
```

### `useAuth` hook (`src/lib/use-auth.ts`)
- On mount: read `yol-auth-token`, decode payload, expose `{ user, isLoggedIn }`
- `login()` → redirect to `API_URL/auth/google?redirect=<current origin>`
- `logout()` → cancel pending debounced writes, clear `yol-auth-token`, set `isLoggedIn = false`
- `handleAuthCallback()` → read `?token` from URL, store in localStorage, strip from URL
- On any 401 from sync endpoints: clear `yol-auth-token`, show "Session expired — sign in again" modal with a "Sign in" button that calls `login()`

### `usePlaylists` / `useFolders` / `useLoopHistory` hooks
- If logged in: read/write server; each hook has its own independent 500ms debounce timer
- If guest: read/write localStorage exactly as today
- On logout: cancel debounced timers, flush any pending writes first

### First login — has local data
1. Check: JWT present + `yol-auth-migrated` not set + localStorage has data
2. Upload all three via `/yol/sync/*` — best-effort (fire all three in parallel)
3. If all succeed: clear localStorage keys, set `yol-auth-migrated = "true"`
4. If any fail: keep localStorage intact, show warning "Sync failed — your data is safe locally, try signing in again"

### First login — no local data
- Fetch `/yol/sync/all`, hydrate state (empty arrays if new user)
- Set `yol-auth-migrated = "true"`

### Returning user (reload)
- On app mount: if JWT valid → show spinner → fetch `/yol/sync/all` → hydrate state → hide spinner
- If fetch times out (10s) or fails → show "Failed to load — check your connection"
- Spinner blocks UI until data loads

### Header
- Logged in: show Google avatar + "Sign out" button
- Guest: show "Sign in" button

### Import / Export
- **Guest**: unchanged (localStorage)
- **Logged in export**: read from in-memory server state, download as `yol-data.json`
- **Logged in import**: show confirmation "This will replace all your data. Continue?" → POST to all three `/yol/sync/*` endpoints

---

## Scenarios

| Scenario | Behaviour |
|----------|-----------|
| Guest | localStorage only, no change |
| First login, no local data | Fetch server (empty for new user) |
| First login, has local data | Upload local → server (parallel), clear localStorage on success |
| Returning user | Pull from server on mount |
| Logged-in adds/edits | Write to server (500ms debounce per hook) |
| Logged-in logs out | Flush pending writes, clear JWT, isLoggedIn = false |
| Session expired (401) | Clear JWT, show re-login modal |
| Logged-in exports JSON | Export from in-memory server state |
| Logged-in imports JSON | Confirm → POST to server (replaces all data) |
| Guest imports JSON | Load into localStorage (unchanged) |

---

## Out of Scope (v1)
- Email/password login
- Offline fallback
- Two-device conflict resolution
- Browser extension auth
