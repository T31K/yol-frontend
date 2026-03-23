'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Gauge,
  RefreshCw,
  RotateCcw,
  X,
  Trash2,
  Search,
  Loader2,
  ListMusic,
  Plus,
  ChevronDown,
  ChevronRight,
  Menu,
  Clock,
  Download,
  Upload,
  GripVertical,
  NotebookPen,
  Check,
  Lightbulb,
} from 'lucide-react'
import Image from 'next/image'
import { NoteEditor } from '@/components/NoteEditor'
import ReactSlider from 'react-slider'
import { useHotkeys } from 'react-hotkeys-hook'
import { Kbd } from '@/components/ui/kbd'
import { useLoopHistory } from '@/lib/use-loop-history'
import { usePlaylists } from '@/lib/use-playlists'
import { useFolders } from '@/lib/use-folders'
import { useAuth, getAuthToken, isMigrated, setMigrated, trigger401 } from '@/lib/use-auth'
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd'
import EmojiPicker, {
  EmojiClickData,
  Categories,
  EmojiStyle,
} from 'emoji-picker-react'
import { songs } from '@/data/songs'

interface YTPlayer {
  playVideo: () => void
  pauseVideo: () => void
  stopVideo: () => void
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  setPlaybackRate: (rate: number) => void
  getCurrentTime: () => number
  getDuration: () => number
  destroy: () => void
}

interface YTPlayerEvent {
  data: number
  target: YTPlayer
}

interface YTPlayerOptions {
  videoId: string
  playerVars?: {
    autoplay?: number
    start?: number
    end?: number
    rel?: number
    modestbranding?: number
    playsinline?: number
  }
  events?: {
    onStateChange?: (event: YTPlayerEvent) => void
    onReady?: () => void
  }
}

interface YTNamespace {
  Player: new (element: HTMLElement, options: YTPlayerOptions) => YTPlayer
}

declare global {
  interface Window {
    YT: YTNamespace
    onYouTubeIframeAPIReady: () => void
  }
}

interface SearchResult {
  videoId: string
  title: string
  author: string
  lengthSeconds: number
}

function isYoutubeUrl(input: string): boolean {
  return /youtube\.com|youtu\.be|^[a-zA-Z0-9_-]{11}$/.test(input)
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function Home() {
  const [url, setUrl] = useState('')
  const [videoId, setVideoId] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [noteSaveStatus, setNoteSaveStatus] = useState<
    'idle' | 'saving' | 'saved'
  >('idle')

  useEffect(() => {
    const stored = localStorage.getItem('yol-notes')
    if (stored) setNotes(JSON.parse(stored))
  }, [])

  const saveNote = useCallback((vid: string, text: string) => {
    setNotes((prev) => {
      const next = { ...prev, [vid]: text }
      localStorage.setItem('yol-notes', JSON.stringify(next))
      return next
    })
  }, [])
  const [loopCount, setLoopCount] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [sliderDisplay, setSliderDisplay] = useState<[number, number] | null>(
    null,
  )
  const [apiReady, setApiReady] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [featureOpen, setFeatureOpen] = useState(false)
  const [featureText, setFeatureText] = useState('')
  const [featureSubmitting, setFeatureSubmitting] = useState(false)
  const [featureSubmitted, setFeatureSubmitted] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const playerRef = useRef<YTPlayer | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const urlInputRef = useRef<HTMLInputElement>(null)
  const timeUpdateRef = useRef<NodeJS.Timeout | null>(null)
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef('')
  const endTimeRef = useRef('')
  const { user, isLoggedIn, sessionExpired, login, logout, dismissExpired } = useAuth()
  const { history, setHistory, flushSync: flushHistory, upsert, remove, clear } = useLoopHistory(isLoggedIn)
  const {
    playlists,
    setPlaylists,
    flushSync: flushPlaylists,
    createPlaylist,
    deletePlaylist,
    addToPlaylist,
    removeFromPlaylist,
    reorderPlaylists,
    setPlaylistEmoji,
  } = usePlaylists(isLoggedIn)
  const {
    folders,
    setFolders,
    flushSync: flushFolders,
    createFolder,
    deleteFolder,
    moveToFolder,
    reorderFolderPlaylists,
    reorderFolders,
    setFolderEmoji,
  } = useFolders(isLoggedIn)

  const API_URL_SYNC = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  useEffect(() => {
    if (!isLoggedIn) return
    const token = getAuthToken()

    if (!isMigrated()) {
      const localPlaylists = JSON.parse(localStorage.getItem('yol-playlists') || '[]')
      const localFolders = JSON.parse(localStorage.getItem('yol-folders') || '[]')
      const localHistory = JSON.parse(localStorage.getItem('yol-loop-history') || '[]')
      const hasLocal = localPlaylists.length || localFolders.length || localHistory.length

      if (hasLocal) {
        setSyncing(true)
        Promise.all([
          fetch(`${API_URL_SYNC}/yol/sync/playlists`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ data: localPlaylists }) }),
          fetch(`${API_URL_SYNC}/yol/sync/folders`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ data: localFolders }) }),
          fetch(`${API_URL_SYNC}/yol/sync/history`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ data: localHistory }) }),
        ]).then((responses) => {
          if (responses.every((r) => r.ok)) {
            localStorage.removeItem('yol-playlists')
            localStorage.removeItem('yol-folders')
            localStorage.removeItem('yol-loop-history')
            setMigrated()
            setPlaylists(localPlaylists)
            setFolders(localFolders)
            setHistory(localHistory)
          } else {
            setSyncError('Sync failed — your data is safe locally, try signing in again')
          }
        }).catch(() => {
          setSyncError('Sync failed — your data is safe locally, try signing in again')
        }).finally(() => setSyncing(false))
        return
      }
    }

    setSyncing(true)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    fetch(`${API_URL_SYNC}/yol/sync/all`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
      .then((r) => {
        if (r.status === 401) { trigger401(); return null }
        return r.json()
      })
      .then((data) => {
        if (!data) return
        setPlaylists(data.playlists ?? [])
        setFolders(data.folders ?? [])
        setHistory(data.history ?? [])
        setMigrated()
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setSyncError('Failed to load — check your connection')
      })
      .finally(() => { clearTimeout(timeout); setSyncing(false) })

    return () => controller.abort()
  }, [isLoggedIn])

  // Keep refs in sync so callbacks never stale-close over startTime/endTime
  useEffect(() => {
    startTimeRef.current = startTime
  }, [startTime])
  useEffect(() => {
    endTimeRef.current = endTime
  }, [endTime])

  const currentTitle = history.find((h) => h.videoId === videoId)?.title

  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setApiReady(true)
      return
    }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document
      .getElementsByTagName('script')[0]
      .parentNode?.insertBefore(tag, document.getElementsByTagName('script')[0])
    window.onYouTubeIframeAPIReady = () => setApiReady(true)
  }, [])

  useEffect(() => {
    if (isPlaying && playerRef.current) {
      timeUpdateRef.current = setInterval(() => {
        if (!playerRef.current) return
        const ct = playerRef.current.getCurrentTime?.() || 0
        const dur = playerRef.current.getDuration?.() || 0
        setCurrentTime(ct)
        setDuration(dur)
        // Enforce B (end) point
        const end = endTimeRef.current ? parseInt(endTimeRef.current) : 0
        if (end > 0 && ct >= end) {
          setLoopCount((prev) => prev + 1)
          playerRef.current?.seekTo(
            startTimeRef.current ? parseInt(startTimeRef.current) : 0,
            true,
          )
          playerRef.current?.playVideo()
        }
      }, 250)
    }
    return () => {
      if (timeUpdateRef.current) clearInterval(timeUpdateRef.current)
    }
  }, [isPlaying])

  const onPlayerStateChange = useCallback(
    (event: YTPlayerEvent) => {
      if (event.data === 0) {
        setLoopCount((prev) => {
          const next = prev + 1
          if (videoId) upsert(videoId, next)
          return next
        })
        playerRef.current?.seekTo(
          startTimeRef.current ? parseInt(startTimeRef.current) : 0,
          true,
        )
        playerRef.current?.playVideo()
      }
      if (event.data === 1) setIsPlaying(true)
      if (event.data === 2) setIsPlaying(false)
    },
    [videoId, upsert],
  )

  const onPlayerReady = useCallback(() => {
    if (playerRef.current) {
      setDuration(playerRef.current.getDuration?.() || 0)
    }
  }, [])

  useEffect(() => {
    if (!apiReady || !videoId || !containerRef.current) return
    if (playerRef.current) playerRef.current.destroy()
    playerRef.current = new window.YT.Player(containerRef.current, {
      videoId,
      playerVars: {
        autoplay: 1,
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
      },
      events: { onStateChange: onPlayerStateChange, onReady: onPlayerReady },
    })
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy()
        playerRef.current = null
      }
    }
  }, [apiReady, videoId, onPlayerStateChange, onPlayerReady])

  // Apply playback speed without recreating player
  useEffect(() => {
    playerRef.current?.setPlaybackRate(playbackSpeed)
  }, [playbackSpeed])

  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    if (!url.trim() || isYoutubeUrl(url) || url.length < 3) {
      setSearchResults([])
      setSearchLoading(false)
      return
    }
    setSearchLoading(true)
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${API_URL}/yol/search?q=${encodeURIComponent(url)}`,
        )
        const data = await res.json()
        setSearchResults(Array.isArray(data) ? data : [])
      } catch {
        setSearchResults([])
      } finally {
        setSearchLoading(false)
      }
    }, 400)
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    }
  }, [url])

  const fetchAndStoreTitle = useCallback(
    async (id: string, count = 0) => {
      try {
        const res = await fetch(
          `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`,
        )
        if (res.ok) {
          const d = await res.json()
          upsert(id, count, d.title)
        }
      } catch {
        /* silent */
      }
    },
    [upsert],
  )

  useEffect(() => {
    history
      .filter((i) => !i.title)
      .forEach((i) => fetchAndStoreTitle(i.videoId, i.loopCount))
  }, [history, fetchAndStoreTitle])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const id = extractVideoId(url)
    if (!id) return
    if (id === videoId) {
      setLoopCount(0)
      playerRef.current?.seekTo(startTime ? parseInt(startTime) : 0, true)
      playerRef.current?.playVideo()
    } else {
      setVideoId(id)
      setLoopCount(0)
      setIsPlaying(true)
      upsert(id, 0)
      fetchAndStoreTitle(id)
    }
  }

  const handleReset = () => {
    if (playerRef.current) {
      playerRef.current.destroy()
      playerRef.current = null
    }
    setVideoId(null)
    setUrl('')
    setLoopCount(0)
    setIsPlaying(false)
    setStartTime('')
    setEndTime('')
    setCurrentTime(0)
    setDuration(0)
  }

  const togglePlay = () =>
    isPlaying ? playerRef.current?.pauseVideo() : playerRef.current?.playVideo()
  const skipBack = () =>
    playerRef.current?.seekTo(
      Math.max(0, (playerRef.current?.getCurrentTime() || 0) - 10),
      true,
    )
  const skipForward = () =>
    playerRef.current?.seekTo(
      (playerRef.current?.getCurrentTime() || 0) + 10,
      true,
    )

  const hotkeyOpts = { preventDefault: true, ignoreEventWhen: () => false }

  useHotkeys('space', () => videoId && togglePlay(), { preventDefault: true })
  useHotkeys('left', () => videoId && skipBack(), { preventDefault: true })
  useHotkeys('right', () => videoId && skipForward(), { preventDefault: true })
  useHotkeys(
    'shift+left',
    () =>
      videoId &&
      playerRef.current?.seekTo(
        Math.max(0, (playerRef.current?.getCurrentTime() || 0) - 30),
        true,
      ),
    { preventDefault: true },
  )
  useHotkeys(
    'shift+right',
    () =>
      videoId &&
      playerRef.current?.seekTo(
        (playerRef.current?.getCurrentTime() || 0) + 30,
        true,
      ),
    { preventDefault: true },
  )
  useHotkeys(
    'equal,plus',
    () => {
      if (!videoId) return
      const i = PLAYBACK_SPEEDS.indexOf(playbackSpeed)
      const next = PLAYBACK_SPEEDS[Math.min(i + 1, PLAYBACK_SPEEDS.length - 1)]
      setPlaybackSpeed(next)
      playerRef.current?.setPlaybackRate(next)
    },
    { preventDefault: true },
  )
  useHotkeys(
    'minus',
    () => {
      if (!videoId) return
      const i = PLAYBACK_SPEEDS.indexOf(playbackSpeed)
      const prev = PLAYBACK_SPEEDS[Math.max(i - 1, 0)]
      setPlaybackSpeed(prev)
      playerRef.current?.setPlaybackRate(prev)
    },
    { preventDefault: true },
  )
  useHotkeys(
    '0',
    () => {
      if (!videoId) return
      setPlaybackSpeed(1)
      playerRef.current?.setPlaybackRate(1)
    },
    { preventDefault: true },
  )
  useHotkeys('f', (e) => {
    e.preventDefault()
    urlInputRef.current?.focus()
    urlInputRef.current?.select()
  })
  useHotkeys('shift+/', () => setHelpOpen((v) => !v), { preventDefault: true })

  void hotkeyOpts

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${Math.floor(s % 60)
      .toString()
      .padStart(2, '0')}`

  return (
    <div className="min-h-screen bg-[#FFF2EB] bg-[linear-gradient(to_right,#FFD6BA33_1px,transparent_1px),linear-gradient(to_bottom,#FFD6BA33_1px,transparent_1px)] bg-[size:45px_45px]">
      {syncing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80">
          <div className="flex flex-col items-center gap-3 rounded-base border-4 border-black bg-white p-8 shadow-base">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="font-heading text-sm">Loading your data…</p>
          </div>
        </div>
      )}
      {sessionExpired && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="flex flex-col items-center gap-4 rounded-base border-4 border-black bg-white p-8 shadow-base">
            <p className="font-heading text-lg">Session expired</p>
            <p className="text-sm text-stone-500">Please sign in again to keep syncing.</p>
            <div className="flex gap-2">
              <button onClick={dismissExpired} className="rounded-xl border-2 border-black px-4 py-2 text-sm font-bold hover:bg-bg">
                Stay offline
              </button>
              <button onClick={login} className="rounded-xl border-2 border-black bg-main px-4 py-2 text-sm font-bold hover:opacity-90">
                Sign in
              </button>
            </div>
          </div>
        </div>
      )}
      {syncError && (
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-xl border-2 border-black bg-red-100 px-4 py-3 text-sm font-bold shadow-base">
          {syncError}
          <button onClick={() => setSyncError(null)} className="ml-3 text-stone-400 hover:text-black">✕</button>
        </div>
      )}
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-[260px] p-3 transition-transform duration-200 lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-full flex-col overflow-hidden rounded-2xl border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-end border-b-2 border-black px-4 py-3">
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-stone-400 transition-colors hover:text-black"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <LibrarySidebar
            playlists={playlists}
            history={history}
            folders={folders}
            createPlaylist={createPlaylist}
            deletePlaylist={deletePlaylist}
            removeFromPlaylist={removeFromPlaylist}
            createFolder={createFolder}
            deleteFolder={deleteFolder}
            moveToFolder={moveToFolder}
            reorderPlaylists={reorderPlaylists}
            reorderFolderPlaylists={reorderFolderPlaylists}
            reorderFolders={reorderFolders}
            setPlaylistEmoji={setPlaylistEmoji}
            setFolderEmoji={setFolderEmoji}
            clear={clear}
            onPlay={(vId, title) => {
              setVideoId(vId)
              setUrl(`https://youtube.com/watch?v=${vId}`)
              setLoopCount(0)
              setIsPlaying(true)
              setSearchResults([])
              upsert(vId, 0, title)
            }}
            onRemove={remove}
            isLoggedIn={isLoggedIn}
            user={user}
            login={login}
            logout={logout}
            flushPlaylists={flushPlaylists}
            flushFolders={flushFolders}
            flushHistory={flushHistory}
            setPlaylists={setPlaylists}
            setFolders={setFolders}
            setHistory={setHistory}
          />
        </div>
      </aside>

      {/* ── THREE-COLUMN LAYOUT ───────────────────────────────────── */}
      <div className="flex min-h-screen w-full gap-4 px-4 py-4">
        {/* LEFT SIDEBAR — floating */}
        <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] shrink-0 flex-col overflow-hidden rounded-2xl border-2 border-black bg-white shadow-base lg:flex lg:w-[220px] xl:w-[260px]">
          <LibrarySidebar
            playlists={playlists}
            history={history}
            folders={folders}
            createPlaylist={createPlaylist}
            deletePlaylist={deletePlaylist}
            removeFromPlaylist={removeFromPlaylist}
            createFolder={createFolder}
            deleteFolder={deleteFolder}
            moveToFolder={moveToFolder}
            reorderPlaylists={reorderPlaylists}
            reorderFolderPlaylists={reorderFolderPlaylists}
            reorderFolders={reorderFolders}
            setPlaylistEmoji={setPlaylistEmoji}
            setFolderEmoji={setFolderEmoji}
            clear={clear}
            onPlay={(vId, title) => {
              setVideoId(vId)
              setUrl(`https://youtube.com/watch?v=${vId}`)
              setLoopCount(0)
              setIsPlaying(true)
              setSearchResults([])
              upsert(vId, 0, title)
            }}
            onRemove={remove}
            isLoggedIn={isLoggedIn}
            user={user}
            login={login}
            logout={logout}
            flushPlaylists={flushPlaylists}
            flushFolders={flushFolders}
            flushHistory={flushHistory}
            setPlaylists={setPlaylists}
            setFolders={setFolders}
            setHistory={setHistory}
          />
        </aside>

        {/* CENTER COLUMN */}
        <div className="flex min-w-0 flex-1 flex-col gap-4 p-6 pt-0">
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
            {/* Mobile library toggle */}
            {/* ── HEADER ───────────────────────────────────────────────── */}
            <div className="px-4 text-center">
              <div className="inline-block">
                <Image
                  src="/yol_logo.webp"
                  alt="YouTubeOnLoop"
                  width={780}
                  height={400}
                  className="h-14 w-auto md:h-32"
                  priority
                />
              </div>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                Play any YouTube video on loop
              </h1>
              <p className="pointer-events-none absolute mt-1.5 text-sm text-stone-500 opacity-0 md:text-base">
                Paste a link or replace{' '}
                <code className="rounded-lg border-2 border-black bg-bg/60 px-1.5 py-0.5 text-xs">
                  youtube.com
                </code>{' '}
                with{' '}
                <code className="rounded-lg border-2 border-black bg-bg/60 px-1.5 py-0.5 text-xs">
                  youtubeonloop.com
                </code>
              </p>
            </div>
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2 self-start rounded-xl border-4 border-black bg-white px-3 py-2 shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none lg:hidden"
            >
              <Menu className="h-4 w-4" />
              <span className="text-base font-bold">Library</span>
            </button>

            {/* ── FIXED VIDEO AREA (always same 16:9 size) ── */}
            <div className="overflow-hidden rounded-2xl border-2 border-black bg-white shadow-base">
              <div
                className="relative w-full [&>iframe]:absolute [&>iframe]:inset-0 [&>iframe]:h-full [&>iframe]:w-full"
                style={{ paddingBottom: '56.25%' }}
              >
                {/* YT player container — always in DOM */}
                <div ref={containerRef} className="absolute inset-0" />

                {/* Empty-state overlay — shown when no video */}
                {!videoId && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-white px-6">
                    <p className="text-center text-sm font-bold text-stone-500">
                      Search for a song
                      <br />
                      <span className="inline-flex items-center gap-3 uppercase tracking-wider">
                        <span className="inline-block h-px w-8 bg-stone-300"></span>
                        or
                        <span className="inline-block h-px w-8 bg-stone-300"></span>
                      </span>
                      <br />
                      paste a YouTube link
                    </p>
                    <form onSubmit={handleSubmit} className="w-full max-w-lg">
                      <div className="relative">
                        <div className="flex items-center gap-2 rounded-xl border-2 border-black bg-stone-100 py-2.5 pl-4 pr-14">
                          <Search className="h-4 w-4 shrink-0 text-stone-400" />
                          <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="Search songs or paste URL…"
                            autoFocus
                            className="min-w-0 flex-1 bg-transparent text-sm placeholder-stone-400 focus:outline-none"
                          />
                        </div>
                        <Button
                          type="submit"
                          className="absolute right-2 top-1/2 h-7 -translate-y-1/2 rounded-lg px-3 text-xs !shadow-none hover:!-translate-y-1/2 hover:!translate-x-0"
                        >
                          <Search className="h-3 w-3" />
                          Search
                        </Button>
                      </div>
                    </form>
                    <div className="mt-10 inline-flex flex-col gap-1.5 text-[10px]">
                      <div className="flex items-center gap-2">
                        <span className="w-20 text-left font-bold text-stone-400">
                          Paste full link
                        </span>
                        <code className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 font-mono text-stone-400">
                          youtube.com/watch?v=dQw4w9WgXcQ
                        </code>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-20 text-left font-bold text-stone-400">
                          Paste video ID
                        </span>
                        <code className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 font-mono text-stone-400">
                          dQw4w9WgXcQ
                        </code>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-20 text-left font-bold text-stone-400">
                          Search
                        </span>
                        <code className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 font-mono text-stone-400">
                          never gonna give you up
                        </code>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Search Results (shown when typing, below the video area) */}
            {(searchLoading || searchResults.length > 0) &&
              !isYoutubeUrl(url) && (
                <div className="rounded-2xl border-2 border-black bg-white shadow-base">
                  <div className="flex items-center gap-2 border-b border-black px-4 py-2">
                    <Search className="h-3.5 w-3.5" />
                    <p className="text-sm font-bold">
                      {searchLoading ? 'Searching…' : `"${url}"`}
                    </p>
                    {searchLoading && (
                      <Loader2 className="ml-auto h-4 w-4 animate-spin" />
                    )}
                  </div>
                  {!searchLoading && searchResults.length === 0 && (
                    <p className="p-4 text-center text-sm text-stone-500">
                      No results found
                    </p>
                  )}
                  <div className="divide-y-2 divide-black">
                    {searchResults.map((video) => (
                      <button
                        key={video.videoId}
                        onClick={() => {
                          setVideoId(video.videoId)
                          setUrl(`https://youtube.com/watch?v=${video.videoId}`)
                          setSearchResults([])
                          setLoopCount(0)
                          setIsPlaying(true)
                          upsert(video.videoId, 0, video.title)
                        }}
                        className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-bg"
                      >
                        <img
                          src={`https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg`}
                          alt=""
                          className="h-12 w-20 shrink-0 rounded-xl border-2 border-black object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold">
                            {video.title}
                          </p>
                          <p className="text-xs text-stone-500">
                            {video.author}
                          </p>
                          {video.lengthSeconds > 0 && (
                            <p className="text-xs text-stone-400">
                              {formatDuration(video.lengthSeconds)}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

            {/* Controls — shown only when video is loaded */}
            {videoId && (
              <>
                {/* Stats + search bar */}
                <div className="flex items-center gap-2 rounded-2xl border-4 border-black bg-white px-3 py-2 shadow-base">
                  <div className="flex shrink-0 items-center gap-1 text-xs font-bold text-stone-400">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                  <form
                    onSubmit={handleSubmit}
                    className="flex min-w-0 flex-1 items-center gap-2"
                  >
                    <input
                      ref={urlInputRef}
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="Search or paste another URL…"
                      className="min-w-0 flex-1 rounded-xl border-2 border-black px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-main"
                    />
                  </form>
                  <Button
                    type="button"
                    variant="neutral"
                    onClick={handleReset}
                    className="shrink-0 rounded-xl px-2.5 py-1.5 text-xs"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Controls */}
                <div className="rounded-2xl border-4 border-black bg-white shadow-base">
                  {/* Playback row: loop count | buttons | speed */}
                  <div className="flex items-center gap-2 px-4 py-3">
                    {/* Loop count */}
                    <div
                      className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border-2 border-black bg-main px-2.5 py-1.5 text-xs font-bold transition-all"
                      onClick={() => setLoopCount(0)}
                      title="Click to reset"
                    >
                      <RefreshCw className="h-3 w-3" />
                      {loopCount}x
                    </div>

                    <div className="flex flex-1 items-center justify-center gap-2">
                      <Button
                        variant="neutral"
                        size="icon"
                        onClick={skipBack}
                        title="Back 10s"
                        className="h-10 w-10 rounded-xl"
                      >
                        <SkipBack className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="default"
                        size="icon"
                        onClick={togglePlay}
                        title={isPlaying ? 'Pause' : 'Play'}
                        className="h-12 w-12 rounded-xl"
                      >
                        {isPlaying ? (
                          <Pause className="h-5 w-5" />
                        ) : (
                          <Play className="ml-0.5 h-5 w-5" />
                        )}
                      </Button>
                      <Button
                        variant="neutral"
                        size="icon"
                        onClick={skipForward}
                        title="Forward 10s"
                        className="h-10 w-10 rounded-xl"
                      >
                        <SkipForward className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Speed */}
                    <Select
                      value={playbackSpeed.toString()}
                      onValueChange={(v) => {
                        const s = parseFloat(v)
                        setPlaybackSpeed(s)
                        playerRef.current?.setPlaybackRate(s)
                      }}
                    >
                      <SelectTrigger className="h-9 w-20 shrink-0 rounded-xl border-2 border-black bg-white text-sm">
                        <Gauge className="h-3.5 w-3.5" />
                        <SelectValue placeholder="1x" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-2 border-black bg-white">
                        {PLAYBACK_SPEEDS.map((s) => (
                          <SelectItem key={s} value={s.toString()}>
                            {s}x
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Bottom row: A–B slider (only when video loaded) */}
                  {duration > 0 && (
                    <div className="flex items-center border-t-2 border-black px-4 pb-4 pt-2">
                      <div className="flex w-full flex-col gap-2">
                        <div className="mb-2 mb-3.5 flex justify-between text-[9px] font-bold text-stone-400">
                          <span>
                            Start{' '}
                            {formatTime(
                              sliderDisplay
                                ? sliderDisplay[0]
                                : startTime
                                  ? parseInt(startTime)
                                  : 0,
                            )}
                          </span>
                          <span>
                            End{' '}
                            {formatTime(
                              sliderDisplay
                                ? sliderDisplay[1]
                                : endTime
                                  ? parseInt(endTime)
                                  : Math.floor(duration),
                            )}
                          </span>
                        </div>
                        <ReactSlider
                          className="relative flex h-5 w-full items-center"
                          thumbClassName="h-5 w-5 rounded-full border-2 border-black bg-white cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-main z-10"
                          trackClassName="h-3 rounded-full"
                          value={
                            sliderDisplay ?? [
                              startTime ? parseInt(startTime) : 0,
                              endTime
                                ? parseInt(endTime)
                                : Math.floor(duration),
                            ]
                          }
                          min={0}
                          max={Math.floor(duration)}
                          step={1}
                          minDistance={1}
                          pearling
                          renderTrack={({ key, ...props }, state) => (
                            <div
                              key={key}
                              {...props}
                              className={`h-3 rounded-full border-2 border-black ${state.index === 1 ? 'bg-main' : 'bg-stone-100'}`}
                            />
                          )}
                          renderThumb={({ key, ...props }, state) => (
                            <div key={key} {...props}>
                              <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-bold text-stone-500">
                                {formatTime(
                                  sliderDisplay
                                    ? sliderDisplay[state.index]
                                    : state.index === 0
                                      ? startTime
                                        ? parseInt(startTime)
                                        : 0
                                      : endTime
                                        ? parseInt(endTime)
                                        : Math.floor(duration),
                                )}
                              </span>
                            </div>
                          )}
                          onChange={(values) => {
                            setSliderDisplay(values as [number, number])
                          }}
                          onAfterChange={(values) => {
                            const [start, end] = values as [number, number]
                            setSliderDisplay(null)
                            setStartTime(start === 0 ? '' : start.toString())
                            setEndTime(
                              end === Math.floor(duration)
                                ? ''
                                : end.toString(),
                            )
                            if (
                              playerRef.current &&
                              typeof playerRef.current.seekTo === 'function'
                            ) {
                              playerRef.current.seekTo(start, true)
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Add to playlist */}
                <div className="rounded-2xl border-4 border-black bg-white p-3 shadow-base">
                  <div className="flex items-center gap-2">
                    <ListMusic className="h-4 w-4 shrink-0 text-stone-400" />
                    <span className="text-sm font-bold">Add to playlist:</span>
                    <Select
                      onValueChange={(value) => {
                        if (value === '__new__') {
                          const name = prompt('New playlist name:')
                          if (name?.trim()) {
                            const id = createPlaylist(name.trim())
                            addToPlaylist(id, videoId, currentTitle)
                          }
                        } else {
                          addToPlaylist(value, videoId, currentTitle)
                        }
                      }}
                    >
                      <SelectTrigger className="h-8 w-44 rounded-xl border-2 border-black bg-white text-xs">
                        <SelectValue placeholder="Select playlist…" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-2 border-black bg-white">
                        {playlists.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="__new__">
                          + Create new playlist
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Notes */}
                {videoId && (
                  <div className="overflow-hidden rounded-2xl border-4 border-black bg-white shadow-base">
                    <div className="flex items-center gap-2 border-b-2 border-black px-4 py-2.5">
                      <NotebookPen className="h-3.5 w-3.5 shrink-0 text-stone-500" />
                      <span className="text-xs font-bold text-stone-600">
                        Notes
                      </span>
                      <div className="ml-auto flex items-center gap-1 text-[10px]">
                        {noteSaveStatus === 'saving' && (
                          <span className="text-stone-400">Saving…</span>
                        )}
                        {noteSaveStatus === 'saved' && (
                          <>
                            <Check className="h-3 w-3 text-green-500" />
                            <span className="text-green-500">Saved</span>
                          </>
                        )}
                      </div>
                    </div>
                    <NoteEditor
                      videoId={videoId}
                      initialMarkdown={notes[videoId] ?? ''}
                      onChange={(md) => saveNote(videoId, md)}
                      onSaveStatus={setNoteSaveStatus}
                    />
                  </div>
                )}
              </>
            )}
          </div>
          {/* end max-w-2xl */}
        </div>
        {/* end center */}

        {/* RIGHT ADS SIDEBAR — floating */}
        <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] shrink-0 flex-col overflow-hidden rounded-2xl border-2 border-black bg-[#FFE8CD] opacity-0 shadow-base xl:flex xl:w-[160px]">
          <div className="border-b-2 border-black px-3 py-3 text-center">
            <p className="text-xs font-bold">Advertisement</p>
          </div>
          <div className="flex flex-1 items-center justify-center p-4">
            <p className="text-center text-xs text-stone-400">
              Ads coming soon 💰
            </p>
          </div>
        </aside>
      </div>
      {/* end three-col */}

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="border-t-4 border-black bg-[#F0EAD8] px-6 py-16 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[200px_1fr]">
            <div className="flex flex-col gap-6">
              <div>
                <p className="mb-1 text-base font-bold">YouTubeOnLoop</p>
                <p className="text-xs text-stone-500">
                  Loop any YouTube video, free forever.
                </p>
              </div>
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  Navigate
                </p>
                <div className="flex flex-col gap-1">
                  {[
                    ['/', 'Home'],
                    ['/loop', 'All Loops'],
                    ['/for/guitar-practice', 'Guitar Practice'],
                    ['/for/language-learning', 'Language Learning'],
                    ['/listenonrepeat-alternative', 'ListenOnRepeat Alt.'],
                    ['/youtube-repeat', 'YouTube Repeat'],
                  ].map(([href, label]) => (
                    <a
                      key={href}
                      href={href}
                      className="text-sm text-stone-600 hover:text-black hover:underline"
                    >
                      {label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                Popular Loops
              </p>
              <div className="columns-2 gap-x-6 sm:columns-3 md:columns-4">
                {songs.map((song) => (
                  <a
                    key={song.slug}
                    href={`/loop/${song.slug}`}
                    className="block truncate py-0.5 text-sm text-stone-600 hover:text-black hover:underline"
                  >
                    {song.title}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-10 border-t-2 border-black/10 pt-5 text-center">
            <p className="text-xs text-stone-400">
              Made with ❤️ for endless loops · YouTubeOnLoop
            </p>
          </div>
        </div>
      </footer>

      {/* ── FEATURE REQUEST BUTTON ── */}
      <button
        onClick={() => { setFeatureOpen(true); setFeatureSubmitted(false); setFeatureText('') }}
        className="fixed right-5 top-5 z-50 flex items-center gap-2 rounded-xl border-2 border-black bg-white px-3 py-2 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-main hover:shadow-none"
      >
        <Lightbulb className="h-3.5 w-3.5" />
        Feature Request
      </button>

      <Dialog open={featureOpen} onOpenChange={setFeatureOpen}>
        <DialogContent className="rounded-2xl border-2 border-black bg-white shadow-none sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <Lightbulb className="h-5 w-5" />
              Request a Feature
            </DialogTitle>
          </DialogHeader>
          {featureSubmitted ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-black bg-main">
                <Check className="h-6 w-6" />
              </div>
              <p className="text-center text-sm font-bold">Thanks for the suggestion!</p>
              <p className="text-center text-xs text-stone-500">We read every request.</p>
            </div>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                if (!featureText.trim()) return
                setFeatureSubmitting(true)
                try {
                  await fetch(`${API_URL}/yol/feature-request`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: featureText.trim() }),
                  })
                  setFeatureSubmitted(true)
                } catch {
                  // silent fail — still show success to user
                  setFeatureSubmitted(true)
                } finally {
                  setFeatureSubmitting(false)
                }
              }}
              className="flex flex-col gap-3 pt-1"
            >
              <p className="text-xs text-stone-500">
                What would make YouTubeOnLoop better for you?
              </p>
              <textarea
                value={featureText}
                onChange={(e) => setFeatureText(e.target.value)}
                placeholder="e.g. Add a pitch control slider…"
                rows={4}
                className="w-full resize-none rounded-xl border-2 border-black px-3 py-2 text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-main"
                autoFocus
              />
              <button
                type="submit"
                disabled={!featureText.trim() || featureSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-black bg-main py-2.5 text-sm font-bold transition-all hover:opacity-90 active:translate-x-[1px] active:translate-y-[1px] disabled:opacity-50"
              >
                {featureSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit'}
              </button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ── HELP BUTTON ── */}
      <button
        onClick={() => setHelpOpen(true)}
        className="fixed bottom-5 right-5 z-50 flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-white text-sm font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-main hover:shadow-none"
      >
        ?
      </button>

      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="rounded-2xl border-2 border-black bg-white shadow-none sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              How to use YouTubeOnLoop
            </DialogTitle>
          </DialogHeader>
          <Tabs
            defaultValue="play"
            className="mt-1 flex flex-col"
            style={{ height: '360px' }}
          >
            <TabsList className="mb-4 grid w-full grid-cols-6 rounded-xl border-2 border-black bg-stone-100 p-0.5">
              {[
                { value: 'play', label: 'Play' },
                { value: 'loop', label: 'Loop' },
                { value: 'playlists', label: 'Playlists' },
                { value: 'history', label: 'History' },
                { value: 'data', label: 'Data' },
                { value: 'shortcuts', label: 'Shortcuts' },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-lg text-xs font-bold hover:bg-main/60 data-[state=active]:bg-main data-[state=active]:shadow-none"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="play" className="flex-1 overflow-y-auto">
              <Section title="Play a video">
                <Row
                  label="Paste a URL"
                  value="Drop any YouTube link into the search bar"
                />
                <Row
                  label="Search"
                  value="Type a song name to search directly"
                />
                <Row
                  label="URL trick"
                  value={
                    <>
                      Replace{' '}
                      <code className="rounded border border-stone-200 bg-stone-50 px-1 font-mono text-xs">
                        youtube.com
                      </code>{' '}
                      with{' '}
                      <code className="rounded border border-stone-200 bg-stone-50 px-1 font-mono text-xs">
                        youtubeonloop.com
                      </code>{' '}
                      in any YouTube URL
                    </>
                  }
                />
              </Section>
            </TabsContent>

            <TabsContent value="loop" className="flex-1 overflow-y-auto">
              <Section title="Loop controls">
                <Row
                  label="Loop count"
                  value="Shown bottom-left of controls. Click it to reset to 0."
                />
                <Row
                  label="Start / End"
                  value="Set the A–B loop points in seconds. Leave End blank to loop the full video."
                />
                <Row
                  label="Speed"
                  value="Adjust playback speed from 0.25× to 2×."
                />
                <Row label="Skip" value="← → buttons jump ±10 seconds." />
              </Section>
            </TabsContent>

            <TabsContent value="playlists" className="flex-1 overflow-y-auto">
              <Section title="Playlists">
                <Row
                  label="Add to playlist"
                  value='While a video is playing, use the "Add to playlist" dropdown below the controls.'
                />
                <Row
                  label="Open a playlist"
                  value="Click any playlist in the sidebar to see its songs. Click a song to play it."
                />
              </Section>
            </TabsContent>

            <TabsContent value="history" className="flex-1 overflow-y-auto">
              <Section title="History">
                <Row
                  label="Auto-tracked"
                  value="Every video you loop is saved to History with a loop count."
                />
                <Row
                  label="Revisit"
                  value="Click any item in the History tab to play it again."
                />
                <Row
                  label="Clear"
                  value='Use the "Clear" button in the History tab to wipe it.'
                />
              </Section>
            </TabsContent>

            <TabsContent value="data" className="flex-1 overflow-y-auto">
              <Section title="Import / Export">
                <Row
                  label="Export"
                  value='Click "Import / Export data" at the bottom of the sidebar to download a yol-data.json backup.'
                />
                <Row
                  label="Import"
                  value="Restore a backup from a previously exported file. This overwrites current data."
                />
              </Section>
            </TabsContent>

            <TabsContent value="shortcuts" className="flex-1 overflow-y-auto">
              <Section title="Keyboard Shortcuts">
                <div className="divide-y divide-stone-100">
                  {[
                    { keys: ['Space'], description: 'Play / Pause' },
                    { keys: ['←'], description: 'Skip back 10s' },
                    { keys: ['→'], description: 'Skip forward 10s' },
                    { keys: ['Shift', '←'], description: 'Skip back 30s' },
                    { keys: ['Shift', '→'], description: 'Skip forward 30s' },
                    { keys: ['+'], description: 'Speed up +0.25×' },
                    { keys: ['-'], description: 'Speed down −0.25×' },
                    { keys: ['0'], description: 'Reset speed to 1×' },
                    { keys: ['F'], description: 'Focus search / URL bar' },
                    {
                      keys: ['Shift', '/'],
                      description: 'Open / close this help dialog',
                    },
                  ].map(({ keys, description }) => (
                    <div
                      key={description}
                      className="flex items-center justify-between px-3 py-3"
                    >
                      <span className="text-sm text-stone-600">
                        {description}
                      </span>
                      <div className="flex items-center gap-1">
                        {keys.map((k, i) => (
                          <span key={i} className="flex items-center gap-1">
                            <Kbd>{k}</Kbd>
                            {i < keys.length - 1 && (
                              <span className="text-[10px] text-stone-400">
                                +
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[11px] text-stone-400">
                  Shortcuts are disabled while typing in text fields.
                </p>
              </Section>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── Help dialog sub-components ────────────────────────────────────────────────
function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-stone-400">
        {title}
      </p>
      <table
        className="w-full overflow-hidden rounded-xl border-2 border-black"
        style={{ borderCollapse: 'separate', borderSpacing: 0 }}
      >
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}
function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <tr className="border-b border-stone-300 last:border-0">
      <td className="w-36 py-3 pl-4 pr-3 align-top text-sm font-bold text-stone-700">
        {label}
      </td>
      <td className="py-3 pr-4 text-sm text-stone-500">{value}</td>
    </tr>
  )
}

// ── Shared sidebar content component ─────────────────────────────────────────
function LibrarySidebar({
  playlists,
  history,
  folders,
  createPlaylist,
  deletePlaylist,
  removeFromPlaylist,
  createFolder,
  deleteFolder,
  moveToFolder,
  reorderPlaylists,
  reorderFolderPlaylists,
  reorderFolders,
  setPlaylistEmoji,
  setFolderEmoji,
  clear,
  onPlay,
  onRemove,
  isLoggedIn,
  user,
  login,
  logout,
  flushPlaylists,
  flushFolders,
  flushHistory,
  setPlaylists,
  setFolders,
  setHistory,
}: {
  playlists: ReturnType<
    typeof import('@/lib/use-playlists').usePlaylists
  >['playlists']
  history: ReturnType<
    typeof import('@/lib/use-loop-history').useLoopHistory
  >['history']
  folders: ReturnType<typeof import('@/lib/use-folders').useFolders>['folders']
  createPlaylist: (name: string) => string
  deletePlaylist: (id: string) => void
  removeFromPlaylist: (playlistId: string, videoId: string) => void
  createFolder: (name: string) => string
  deleteFolder: (id: string) => void
  moveToFolder: (playlistId: string, folderId: string | null) => void
  reorderPlaylists: (ids: string[]) => void
  reorderFolderPlaylists: (folderId: string, ids: string[]) => void
  reorderFolders: (ids: string[]) => void
  setPlaylistEmoji: (id: string, emoji: string) => void
  setFolderEmoji: (id: string, emoji: string) => void
  clear: () => void
  onPlay: (videoId: string, title?: string) => void
  onRemove: (videoId: string) => void
  isLoggedIn: boolean
  user: import('@/lib/use-auth').AuthUser | null
  login: () => void
  logout: () => void
  flushPlaylists: () => void
  flushFolders: () => void
  flushHistory: () => void
  setPlaylists: (data: ReturnType<typeof import('@/lib/use-playlists').usePlaylists>['playlists']) => void
  setFolders: (data: ReturnType<typeof import('@/lib/use-folders').useFolders>['folders']) => void
  setHistory: (data: ReturnType<typeof import('@/lib/use-loop-history').useLoopHistory>['history']) => void
}) {
  // local UI state
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null)
  const [emojiPickerPlaylistId, setEmojiPickerPlaylistId] = useState<
    string | null
  >(null)
  const [emojiPickerFolderId, setEmojiPickerFolderId] = useState<string | null>(
    null,
  )
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [showNewPlaylist, setShowNewPlaylist] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [preDragFolderState, setPreDragFolderState] =
    useState<Set<string> | null>(null)
  const [topLevelOrder, setTopLevelOrderRaw] = useState<string[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('yol-top-order')
    setTopLevelOrderRaw(stored ? JSON.parse(stored) : [])
  }, [])

  const saveTopLevelOrder = (order: string[]) => {
    localStorage.setItem('yol-top-order', JSON.stringify(order))
    setTopLevelOrderRaw(order)
  }
  const [dialogStep, setDialogStep] = useState<'choose' | 'export' | 'import'>(
    'choose',
  )

  const toggleFolder = (id: string) =>
    setExpandedFolders((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const handleExport = () => {
    const data = { exportedAt: new Date().toISOString(), playlists, history, folders }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'yol-data.json'; a.click()
    URL.revokeObjectURL(url)
  }

  // derive uncategorized playlists (not in any folder)
  const categorizedIds = new Set(folders.flatMap((f) => f.playlistIds))
  const uncategorized = playlists.filter((p) => !categorizedIds.has(p.id))

  // unified top-level order: merge stored order with current items
  const uncatPrefixed = uncategorized.map((p) => `p-${p.id}`)
  const folderPrefixed = folders.map((f) => `f-${f.id}`)
  const allTopLevelIds = new Set([...uncatPrefixed, ...folderPrefixed])
  const orderedExisting = topLevelOrder.filter((id) => allTopLevelIds.has(id))
  const newItems = [...uncatPrefixed, ...folderPrefixed].filter(
    (id) => !orderedExisting.includes(id),
  )
  const effectiveOrder = [...orderedExisting, ...newItems]

  // if drilled into a playlist
  const activePlaylist = activePlaylistId
    ? playlists.find((p) => p.id === activePlaylistId)
    : null

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Auth — hidden until OAuth is ready */}
      {isLoggedIn && (
        <div className="px-3 pt-2">
          <div className="flex items-center gap-2 px-1 mb-2">
            {user?.avatar_url && (
              <img src={user.avatar_url} alt={user.name} className="w-7 h-7 rounded-full border-2 border-black flex-shrink-0" />
            )}
            <span className="text-xs font-bold truncate flex-1">{user?.name}</span>
            <button
              onClick={() => { flushPlaylists(); flushFolders(); flushHistory(); logout() }}
              className="text-xs font-bold text-stone-400 hover:text-black whitespace-nowrap"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
      <Tabs
        defaultValue="playlists"
        className="flex flex-1 flex-col overflow-hidden"
      >
        <TabsList className="mx-3 mb-1 mt-2 grid w-auto grid-cols-2 rounded-xl border-2 border-black bg-stone-100 p-0.5">
          <TabsTrigger
            value="playlists"
            className="ml-1 rounded-lg text-xs font-bold hover:bg-main/60 data-[state=active]:bg-main data-[state=active]:shadow-none"
            onClick={() => setActivePlaylistId(null)}
          >
            <ListMusic className="mr-1.5 h-3 w-3" />
            Playlists
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="mr-1 rounded-lg text-xs font-bold hover:bg-main/60 data-[state=active]:bg-main data-[state=active]:shadow-none"
          >
            <Clock className="mr-1.5 h-3 w-3" />
            History
          </TabsTrigger>
        </TabsList>

        {/* ── PLAYLISTS TAB ── */}
        <TabsContent
          value="playlists"
          className="mt-0 flex-1 overflow-y-auto px-1 pb-2"
        >
          {/* DRILL-DOWN: playlist songs view */}
          {activePlaylist ? (
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 px-2 py-2">
                <button
                  onClick={() => setActivePlaylistId(null)}
                  className="flex items-center gap-1 rounded-lg px-1.5 py-1 text-xs text-stone-400 transition-colors hover:bg-bg/50 hover:text-black"
                >
                  <ChevronRight className="h-3 w-3 rotate-180" />
                  Back
                </button>
                <span className="truncate text-xs font-bold text-stone-700">
                  {activePlaylist.name}
                </span>
              </div>

              {/* Move to folder select */}
              {folders.length > 0 && (
                <div className="flex items-center gap-2 px-3 pb-2">
                  <span className="shrink-0 text-[10px] text-stone-400">
                    Folder:
                  </span>
                  <Select
                    value={
                      folders.find((f) =>
                        f.playlistIds.includes(activePlaylist.id),
                      )?.id ?? 'none'
                    }
                    onValueChange={(val) =>
                      moveToFolder(
                        activePlaylist.id,
                        val === 'none' ? null : val,
                      )
                    }
                  >
                    <SelectTrigger className="h-6 flex-1 rounded-lg border border-stone-200 text-[10px]">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-2 border-black bg-white text-xs">
                      <SelectItem value="none">No folder</SelectItem>
                      {folders.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {activePlaylist.videos.length === 0 && (
                <p className="px-3 py-2 text-xs text-stone-400">
                  {`No songs yet. Add a video to this playlist while it's playing.`}
                </p>
              )}
              <div className="space-y-1 px-1">
                {activePlaylist.videos.map((v) => (
                  <div
                    key={v.videoId}
                    className="group flex items-center gap-2 rounded-xl px-2 py-1 transition-colors hover:bg-bg/50"
                  >
                    <img
                      src={`https://i.ytimg.com/vi/${v.videoId}/default.jpg`}
                      alt=""
                      className="h-8 w-11 shrink-0 rounded-lg object-cover opacity-70 transition-opacity group-hover:opacity-100"
                    />
                    <button
                      onClick={() => onPlay(v.videoId, v.title)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="truncate text-[11px] text-stone-600 transition-colors group-hover:text-black">
                        {v.title || v.videoId}
                      </p>
                    </button>
                    <button
                      onClick={() =>
                        removeFromPlaylist(activePlaylist.id, v.videoId)
                      }
                      className="shrink-0 text-stone-300 opacity-0 transition-all hover:text-red-400 group-hover:opacity-100"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* LIST VIEW: folders + playlists */
            <div className="flex flex-col gap-0.5">
              {/* Action buttons */}
              <div className="flex gap-1.5 px-2 py-1.5">
                <button
                  onClick={() => {
                    setShowNewPlaylist(true)
                    setShowNewFolder(false)
                  }}
                  className="flex flex-1 items-center justify-center gap-1 rounded-xl border-2 border-dashed border-stone-300 py-1.5 text-xs text-stone-400 transition-colors hover:border-black hover:text-black"
                >
                  <Plus className="h-3 w-3" />
                  Create New Playlist
                </button>
                {/* Folder button hidden for now */}
              </div>

              {/* New playlist input */}
              {showNewPlaylist && (
                <div className="px-2 pb-1.5">
                  <input
                    autoFocus
                    type="text"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newPlaylistName.trim()) {
                        createPlaylist(newPlaylistName.trim())
                        setNewPlaylistName('')
                        setShowNewPlaylist(false)
                      }
                      if (e.key === 'Escape') {
                        setShowNewPlaylist(false)
                        setNewPlaylistName('')
                      }
                    }}
                    placeholder="Playlist name…"
                    className="w-full rounded-xl border-2 border-black bg-bg/30 px-3 py-1.5 text-xs placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-main"
                  />
                </div>
              )}

              {/* New folder input hidden for now */}

              {/* Single DragDropContext: flat list reorder + drop into folder */}
              <DragDropContext
                onDragStart={(initial) => {
                  // When dragging a top-level playlist, auto-open all folders
                  // so their drop zones are visible
                  if (initial.draggableId.startsWith('p-')) {
                    setPreDragFolderState(new Set(expandedFolders))
                    setExpandedFolders(new Set(folders.map((f) => f.id)))
                  }
                }}
                onDragEnd={(result: DropResult) => {
                  const { source, destination, draggableId } = result

                  // Always restore folder open state after drag
                  if (preDragFolderState !== null) {
                    const restored = new Set(preDragFolderState)
                    // Keep the target folder open if dropped into one
                    if (destination?.droppableId.startsWith('folder-')) {
                      restored.add(
                        destination.droppableId.replace('folder-', ''),
                      )
                    }
                    setExpandedFolders(restored)
                    setPreDragFolderState(null)
                  }

                  if (!destination) return
                  if (
                    source.droppableId === destination.droppableId &&
                    source.index === destination.index
                  )
                    return

                  const srcIsFolder = source.droppableId.startsWith('folder-')
                  const dstIsFolder =
                    destination.droppableId.startsWith('folder-')

                  // Reorder within a folder
                  if (
                    srcIsFolder &&
                    dstIsFolder &&
                    source.droppableId === destination.droppableId
                  ) {
                    const folderId = source.droppableId.replace('folder-', '')
                    const folder = folders.find((f) => f.id === folderId)!
                    const reordered = [...folder.playlistIds]
                    const [moved] = reordered.splice(source.index, 1)
                    reordered.splice(destination.index, 0, moved)
                    reorderFolderPlaylists(folderId, reordered)
                    return
                  }

                  // Top-level playlist dropped into a folder
                  if (
                    !srcIsFolder &&
                    dstIsFolder &&
                    draggableId.startsWith('p-')
                  ) {
                    const playlistId = draggableId.slice(2)
                    const folderId = destination.droppableId.replace(
                      'folder-',
                      '',
                    )
                    moveToFolder(playlistId, folderId)
                    saveTopLevelOrder(
                      effectiveOrder.filter((id) => id !== draggableId),
                    )
                    return
                  }

                  // Playlist dragged out of folder back to top-level
                  if (
                    srcIsFolder &&
                    !dstIsFolder &&
                    draggableId.startsWith('fp-')
                  ) {
                    const playlistId = draggableId.slice(3)
                    moveToFolder(playlistId, null)
                    const newOrder = [...effectiveOrder]
                    newOrder.splice(destination.index, 0, `p-${playlistId}`)
                    saveTopLevelOrder(newOrder)
                    return
                  }

                  // Reorder top-level flat list
                  if (!srcIsFolder && !dstIsFolder) {
                    const newOrder = Array.from(effectiveOrder)
                    const [moved] = newOrder.splice(source.index, 1)
                    newOrder.splice(destination.index, 0, moved)
                    saveTopLevelOrder(newOrder)
                    const newPlaylistIds = newOrder
                      .filter((id) => id.startsWith('p-'))
                      .map((id) => id.slice(2))
                    const newFolderIds = newOrder
                      .filter((id) => id.startsWith('f-'))
                      .map((id) => id.slice(2))
                    const categorized = playlists.filter((p) =>
                      categorizedIds.has(p.id),
                    )
                    reorderPlaylists([
                      ...newPlaylistIds,
                      ...categorized.map((p) => p.id),
                    ])
                    reorderFolders(newFolderIds)
                  }
                }}
              >
                <Droppable droppableId="top-level">
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                      {effectiveOrder
                        .filter((id) => id.startsWith('p-'))
                        .map((itemId, index) => {
                          if (itemId.startsWith('p-')) {
                            const playlist = playlists.find(
                              (p) => p.id === itemId.slice(2),
                            )
                            if (!playlist) return null
                            return (
                              <Draggable
                                key={itemId}
                                draggableId={itemId}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    style={{
                                      ...provided.draggableProps.style,
                                      opacity: snapshot.isDragging ? 0.7 : 1,
                                    }}
                                  >
                                    <PlaylistRow
                                      playlist={playlist}
                                      dragHandle={provided.dragHandleProps}
                                      onOpen={() =>
                                        setActivePlaylistId(playlist.id)
                                      }
                                      onEmojiClick={() =>
                                        setEmojiPickerPlaylistId(playlist.id)
                                      }
                                    />
                                  </div>
                                )}
                              </Draggable>
                            )
                          } else {
                            const folder = folders.find(
                              (f) => f.id === itemId.slice(2),
                            )
                            if (!folder) return null
                            const folderPlaylists = folder.playlistIds
                              .map((pid) => playlists.find((p) => p.id === pid))
                              .filter(Boolean) as typeof playlists
                            const isOpen = expandedFolders.has(folder.id)
                            return (
                              <Draggable
                                key={itemId}
                                draggableId={itemId}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    style={{
                                      ...provided.draggableProps.style,
                                      opacity: snapshot.isDragging ? 0.7 : 1,
                                    }}
                                  >
                                    <div
                                      {...(provided.dragHandleProps ?? {})}
                                      className="flex cursor-grab items-center rounded-xl transition-colors hover:bg-bg/50 active:cursor-grabbing"
                                    >
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setEmojiPickerFolderId(folder.id)
                                        }}
                                        className="ml-1.5 mr-1.5 shrink-0 cursor-pointer rounded-lg p-1.5 text-base leading-none transition-colors hover:bg-stone-100"
                                        title="Change emoji"
                                      >
                                        {folder.emoji ?? '📁'}
                                      </button>
                                      <div
                                        onClick={() => toggleFolder(folder.id)}
                                        className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 py-3 pl-1 pr-3"
                                      >
                                        <span className="truncate text-xs text-stone-700">
                                          {folder.name}
                                        </span>
                                        <ChevronRight
                                          className="ml-auto h-4 w-4 shrink-0 text-stone-600 transition-transform duration-200"
                                          style={{
                                            transform: isOpen
                                              ? 'rotate(90deg)'
                                              : 'rotate(0deg)',
                                          }}
                                        />
                                      </div>
                                    </div>
                                    {/* Folder contents — always mounted when dragging so drop zone exists */}
                                    {isOpen && (
                                      <Droppable
                                        droppableId={`folder-${folder.id}`}
                                      >
                                        {(provided, snapshot) => (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`pl-3 transition-colors ${snapshot.isDraggingOver ? 'rounded-xl bg-main/20' : ''}`}
                                          >
                                            {folderPlaylists.length === 0 &&
                                              !snapshot.isDraggingOver && (
                                                <p className="px-2 py-1 text-[10px] text-stone-400">
                                                  Empty folder
                                                </p>
                                              )}
                                            {folderPlaylists.map(
                                              (playlist, idx) => (
                                                <Draggable
                                                  key={`fp-${playlist.id}`}
                                                  draggableId={`fp-${playlist.id}`}
                                                  index={idx}
                                                >
                                                  {(provided, snapshot) => (
                                                    <div
                                                      ref={provided.innerRef}
                                                      {...provided.draggableProps}
                                                      style={{
                                                        ...provided
                                                          .draggableProps.style,
                                                        opacity:
                                                          snapshot.isDragging
                                                            ? 0.7
                                                            : 1,
                                                      }}
                                                    >
                                                      <PlaylistRow
                                                        playlist={playlist}
                                                        dragHandle={
                                                          provided.dragHandleProps
                                                        }
                                                        onOpen={() =>
                                                          setActivePlaylistId(
                                                            playlist.id,
                                                          )
                                                        }
                                                        onEmojiClick={() =>
                                                          setEmojiPickerPlaylistId(
                                                            playlist.id,
                                                          )
                                                        }
                                                      />
                                                    </div>
                                                  )}
                                                </Draggable>
                                              ),
                                            )}
                                            {provided.placeholder}
                                          </div>
                                        )}
                                      </Droppable>
                                    )}
                                  </div>
                                )}
                              </Draggable>
                            )
                          }
                        })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              {playlists.length === 0 && !showNewPlaylist && (
                <p className="px-3 py-1 text-xs text-stone-400">
                  No playlists yet
                </p>
              )}
            </div>
          )}

          {/* Emoji picker dialog */}
          <Dialog
            open={!!emojiPickerPlaylistId}
            onOpenChange={(o) => {
              if (!o) setEmojiPickerPlaylistId(null)
            }}
          >
            <DialogContent className="w-fit rounded-2xl border-2 border-black bg-white p-0 shadow-none sm:max-w-fit">
              <DialogHeader className="px-4 pt-4">
                <DialogTitle className="text-sm font-bold">
                  Choose emoji
                </DialogTitle>
              </DialogHeader>
              <EmojiPicker
                onEmojiClick={(data: EmojiClickData) => {
                  if (emojiPickerPlaylistId) {
                    setPlaylistEmoji(emojiPickerPlaylistId, data.emoji)
                    setEmojiPickerPlaylistId(null)
                  }
                }}
                skinTonesDisabled
                searchDisabled
                emojiStyle={EmojiStyle.APPLE}
                previewConfig={{ showPreview: false }}
                categories={[
                  { category: Categories.SMILEYS_PEOPLE, name: 'Smileys' },
                  { category: Categories.ANIMALS_NATURE, name: 'Animals' },
                  { category: Categories.FOOD_DRINK, name: 'Food' },
                  { category: Categories.TRAVEL_PLACES, name: 'Travel' },
                  { category: Categories.ACTIVITIES, name: 'Activities' },
                  { category: Categories.OBJECTS, name: 'Objects' },
                  { category: Categories.SYMBOLS, name: 'Symbols' },
                  { category: Categories.FLAGS, name: 'Flags' },
                ]}
                height={500}
                width={480}
              />
            </DialogContent>
          </Dialog>

          {/* Folder emoji picker dialog */}
          <Dialog
            open={!!emojiPickerFolderId}
            onOpenChange={(o) => {
              if (!o) setEmojiPickerFolderId(null)
            }}
          >
            <DialogContent className="w-fit rounded-2xl border-2 border-black bg-white p-0 shadow-none sm:max-w-fit">
              <DialogHeader className="px-4 pt-4">
                <DialogTitle className="text-sm font-bold">
                  Choose emoji
                </DialogTitle>
              </DialogHeader>
              <EmojiPicker
                onEmojiClick={(data: EmojiClickData) => {
                  if (emojiPickerFolderId) {
                    setFolderEmoji(emojiPickerFolderId, data.emoji)
                    setEmojiPickerFolderId(null)
                  }
                }}
                skinTonesDisabled
                searchDisabled
                emojiStyle={EmojiStyle.APPLE}
                previewConfig={{ showPreview: false }}
                categories={[
                  { category: Categories.SMILEYS_PEOPLE, name: 'Smileys' },
                  { category: Categories.ANIMALS_NATURE, name: 'Animals' },
                  { category: Categories.FOOD_DRINK, name: 'Food' },
                  { category: Categories.TRAVEL_PLACES, name: 'Travel' },
                  { category: Categories.ACTIVITIES, name: 'Activities' },
                  { category: Categories.OBJECTS, name: 'Objects' },
                  { category: Categories.SYMBOLS, name: 'Symbols' },
                  { category: Categories.FLAGS, name: 'Flags' },
                ]}
                height={500}
                width={480}
              />
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ── HISTORY TAB ── */}
        <TabsContent
          value="history"
          className="mt-0 flex-1 overflow-y-auto px-1 pb-2"
        >
          <div className="flex items-center justify-between px-3 py-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Recent
            </span>
            {history.length > 0 && (
              <button
                onClick={clear}
                className="text-[10px] text-stone-400 transition-colors hover:text-red-400"
              >
                Clear
              </button>
            )}
          </div>
          {history.length === 0 && (
            <p className="px-3 py-1 text-xs text-stone-400">
              Nothing looped yet
            </p>
          )}
          <div className="space-y-1 px-1">
            {history.map((item) => (
              <div
                key={item.videoId}
                className="group flex items-center gap-2 rounded-xl px-2 py-1 transition-colors hover:bg-bg/50"
              >
                <img
                  src={`https://i.ytimg.com/vi/${item.videoId}/default.jpg`}
                  alt=""
                  className="h-8 w-11 shrink-0 rounded-lg object-cover opacity-70 transition-opacity group-hover:opacity-100"
                />
                <button
                  onClick={() => onPlay(item.videoId, item.title)}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="truncate text-[11px] text-stone-600 transition-colors group-hover:text-black">
                    {item.title || item.videoId}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-[10px] text-stone-400">
                    <RefreshCw className="h-2 w-2" />
                    {item.loopCount}x
                  </p>
                </button>
                <button
                  onClick={() => onRemove(item.videoId)}
                  className="shrink-0 text-stone-300 opacity-0 transition-all hover:text-red-400 group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Import / Export — fixed at bottom */}
      <div className="border-t-2 border-black p-2">
        <Dialog>
          <DialogTrigger asChild>
            <button className="flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-black bg-white py-2 text-xs font-bold text-stone-600 transition-all hover:bg-main hover:text-black active:translate-x-[1px] active:translate-y-[1px]">
              <Download className="h-3.5 w-3.5" />
              Import / Export data
            </button>
          </DialogTrigger>
          <DialogContent
            className="rounded-2xl border-2 border-black bg-white shadow-none sm:max-w-xs"
            onCloseAutoFocus={() => setDialogStep('choose')}
          >
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">
                {dialogStep === 'choose' && 'Transfer Data'}
                {dialogStep === 'export' && (
                  <button
                    onClick={() => setDialogStep('choose')}
                    className="flex items-center gap-1 text-stone-400 hover:text-black"
                  >
                    ← Export
                  </button>
                )}
                {dialogStep === 'import' && (
                  <button
                    onClick={() => setDialogStep('choose')}
                    className="flex items-center gap-1 text-stone-400 hover:text-black"
                  >
                    ← Import
                  </button>
                )}
              </DialogTitle>
            </DialogHeader>
            {dialogStep === 'choose' && (
              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={() => setDialogStep('export')}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-black py-3 text-sm font-bold transition-all hover:bg-main active:translate-x-[1px] active:translate-y-[1px]"
                >
                  <Download className="h-4 w-4" /> Export
                </button>
                <button
                  onClick={() => setDialogStep('import')}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-black py-3 text-sm font-bold transition-all hover:bg-main active:translate-x-[1px] active:translate-y-[1px]"
                >
                  <Upload className="h-4 w-4" /> Import
                </button>
              </div>
            )}
            {dialogStep === 'export' && (
              <div className="flex flex-col gap-3 pt-1">
                <p className="text-xs text-stone-500">
                  Download all your playlists, folders, and history as a JSON
                  file.
                </p>
                <button
                  onClick={handleExport}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-black py-3 text-sm font-bold transition-all hover:bg-main active:translate-x-[1px] active:translate-y-[1px]"
                >
                  <Download className="h-4 w-4" /> Download yol-data.json
                </button>
              </div>
            )}
            {dialogStep === 'import' && (
              <div className="flex flex-col gap-3 pt-1">
                <p className="text-xs text-stone-500">
                  Restore from a previously exported yol-data.json. This will
                  overwrite your current data.
                </p>
                <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-black py-3 text-sm font-bold transition-all hover:bg-main active:translate-x-[1px] active:translate-y-[1px]">
                  <Upload className="h-4 w-4" /> Choose file…
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const reader = new FileReader()
                      reader.onload = async (ev) => {
                        try {
                          const parsed = JSON.parse(ev.target?.result as string)
                          if (isLoggedIn) {
                            const confirmed = window.confirm('This will replace all your synced data. Continue?')
                            if (!confirmed) return
                            const token = getAuthToken()
                            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
                            await Promise.all([
                              fetch(`${apiUrl}/yol/sync/playlists`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ data: parsed.playlists ?? [] }) }),
                              fetch(`${apiUrl}/yol/sync/folders`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ data: parsed.folders ?? [] }) }),
                              fetch(`${apiUrl}/yol/sync/history`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ data: parsed.history ?? [] }) }),
                            ])
                            setPlaylists(parsed.playlists ?? [])
                            setFolders(parsed.folders ?? [])
                            setHistory(parsed.history ?? [])
                            window.location.reload()
                            return
                          }
                          if (parsed.playlists)
                            localStorage.setItem(
                              'yol-playlists',
                              JSON.stringify(parsed.playlists),
                            )
                          if (parsed.history)
                            localStorage.setItem(
                              'yol-loop-history',
                              JSON.stringify(parsed.history),
                            )
                          if (parsed.folders)
                            localStorage.setItem(
                              'yol-folders',
                              JSON.stringify(parsed.folders),
                            )
                          window.location.reload()
                        } catch {
                          alert(
                            'Invalid file. Please use a yol-data.json export.',
                          )
                        }
                      }
                      reader.readAsText(file)
                    }}
                  />
                </label>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

// ── Playlist row — whole row is the drag handle ───────────────────────────────
function PlaylistRow({
  playlist,
  dragHandle,
  onOpen,
  onEmojiClick,
}: {
  playlist: {
    id: string
    name: string
    emoji?: string
    videos: { videoId: string }[]
  }
  dragHandle: React.HTMLAttributes<HTMLElement> | null | undefined
  onOpen: () => void
  onEmojiClick: () => void
}) {
  return (
    <div
      {...(dragHandle ?? {})}
      className="flex cursor-grab items-center rounded-xl transition-colors hover:bg-bg/50 active:cursor-grabbing"
    >
      <button
        onClick={(e) => {
          e.stopPropagation()
          onEmojiClick()
        }}
        className="ml-1.5 mr-1.5 shrink-0 cursor-pointer rounded-lg p-1.5 text-base leading-none transition-colors hover:bg-stone-100"
        title="Change emoji"
      >
        {playlist.emoji ?? '🎵'}
      </button>
      <div
        onClick={onOpen}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 py-3 pl-1 pr-3"
      >
        <span className="truncate text-xs text-stone-700">{playlist.name}</span>
      </div>
    </div>
  )
}
