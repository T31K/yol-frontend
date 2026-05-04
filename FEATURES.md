# YOL — Feature Tracker

## Implemented

| # | Feature | Notes |
|---|---------|-------|
| ✅ | YouTube looping with A/B loop points | Core feature |
| ✅ | Playback speed control | Icon-only hover slider, 0.05x steps (0.25×–2×), dynamic speedometer icon |
| ✅ | Repeat count (loop N times then stop) | Persists across reloads |
| ✅ | Create & manage playlists | |
| ✅ | Drag-to-reorder videos within a playlist | Using @hello-pangea/dnd |
| ✅ | Organize playlists into folders | |
| ✅ | Import YouTube playlist via link | |
| ✅ | Shuffle playlist | |
| ✅ | Watch history | |
| ✅ | Google OAuth sign-in | Production |
| ✅ | Cloud sync for logged-in users | Playlists, folders, history |
| ✅ | Dark mode | |
| ✅ | Add video to playlist from search results | ListPlus button on each result |
| ✅ | i18n: EN, DE, JA, FR | Language selector in settings dropdown |
| ✅ | Export / import data backup | JSON file |
| ✅ | Keyboard shortcuts | F = focus search, Space = play/pause, etc. |
| ✅ | /watch page | Pre-loads video from URL param |
| ✅ | Save A/B loop points per video | Persists to localStorage, syncs across devices for logged-in users |
| ✅ | Loop playlist mode | Context bar with prev/next nav + loop toggle when playing from a playlist |
| ✅ | Volume control & memory | Slider in controls, persisted to localStorage; mute/unmute restores previous level |
| ✅ | Shuffle mode (persistent toggle) | Shuffle button stays on; uses Fisher-Yates queue so every song plays once before any repeat |
| ✅ | Loop song mode | Repeat1 toggle beside loop playlist; loops current video in place when playing from a playlist; mutually exclusive with loop playlist |
| ✅ | Delete playlists | Trash icon in playlist drill-down view with inline confirmation |
| ✅ | Rename songs in playlist | Pencil icon on hover for inline title editing |
| ✅ | Channel search & video browsing | Search for YouTube channels, browse their videos (Latest/Popular/Oldest), play or add to playlists |
| ✅ | Background tab playback fix | Playlist/shuffle advances play next video even when tab is not focused |
| ✅ | GEO foundation: schema, legal, llms.txt | Site-wide Organization/WebSite/WebApplication JSON-LD; /about, /contact, /privacy, /terms; public/llms.txt; robots.ts AI-crawler allowlist; security headers in next.config.mjs |
| ✅ | Public playlists — share + pSEO | Per-playlist Make Public toggle (login required); SSR /p/[slug] pages with embedded player + sidebar + Save to my playlists CTA; /playlists discovery index; sitemap auto-includes public slugs; loop points snapshotted into the public version |
| ✅ | Dynamic page title with video name | document.title updates to "{video title} on Loop \| YOL" so bookmarks show what they point to |
| ✅ | Playlist queue below video | When playing from a playlist, a scrollable queue with thumbnails shows under the controls; current row highlighted with animated EQ bars; click any row to jump |

## Pending (from user requests)

| DB ID | Feature | Simplicity (1–10) | Status |
|-------|---------|-------------------|--------|
| 36 | Browser extension — opens YOL with current YouTube tab's video | 2 | pending |

## Backlog (not yet requested, worth considering)

| Feature | Notes |
|---------|-------|
| Drag-to-reorder playlists in sidebar | UI only, state exists |
| pSEO pages | More loop/[slug] pages for SEO |
| Fix A/B loop start time edge case | Minor bug |
