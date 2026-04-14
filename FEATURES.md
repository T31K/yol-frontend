# YOL — Feature Tracker

## Implemented

| # | Feature | Notes |
|---|---------|-------|
| ✅ | YouTube looping with A/B loop points | Core feature |
| ✅ | Playback speed control | |
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
| ✅ | Volume control | Slider in controls, persisted to localStorage |
| ✅ | Shuffle mode (persistent toggle) | Shuffle button stays on; advances to random tracks; works with loop playlist |
| ✅ | Delete playlists | Trash icon in playlist drill-down view with inline confirmation |
| ✅ | Rename songs in playlist | Pencil icon on hover for inline title editing |
| ✅ | Channel search & video browsing | Search for YouTube channels, browse their videos (Latest/Popular/Oldest), play or add to playlists |
| ✅ | Background tab playback fix | Playlist/shuffle advances play next video even when tab is not focused |

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
