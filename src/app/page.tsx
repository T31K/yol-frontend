'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
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
  RefreshCw,
  RotateCcw,
  X,
  Trash2,
  Search,
  Loader2,
  ListMusic,
  ListPlus,
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
  HelpCircle,
  LogOut,
  User,
  Settings,
  Moon,
  Sun,
  Hand,
  Shuffle,
  Link,
  Repeat,
  Repeat1,
  ChevronLeft,
  Volume2,
  VolumeX,
  Pencil,
  Share2,
  Copy,
  Globe,
} from 'lucide-react'
import Image from 'next/image'
import { NoteEditor } from '@/components/NoteEditor'
import ReactSlider from 'react-slider'
import { FaDiscord } from 'react-icons/fa'
import { useHotkeys } from 'react-hotkeys-hook'
import { Kbd } from '@/components/ui/kbd'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import { useLoopHistory } from '@/lib/use-loop-history'
import { usePlaylists } from '@/lib/use-playlists'
import { useFolders } from '@/lib/use-folders'
import { usePublicPlaylists, publicUrl } from '@/lib/use-public-playlists'
import { useLanguage } from '@/lib/use-language'
import type { Lang } from '@/lib/translations'
import {
  useAuth,
  getAuthToken,
  isMigrated,
  setMigrated,
  trigger401,
} from '@/lib/use-auth'
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
  setVolume: (volume: number) => void
  getCurrentTime: () => number
  getDuration: () => number
  getPlayerState: () => number
  getVideoData: () => { title?: string; video_id?: string; author?: string }
  destroy: () => void
  loadVideoById: (args: { videoId: string; startSeconds?: number }) => void
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

interface ChannelResult {
  channelId: string
  title: string
  thumbnail: string
}

interface ChannelVideo {
  videoId: string
  title: string
  lengthText: string
  viewCount: string
  publishedTime: string
  thumbnail: string
}

type SearchMode = 'songs' | 'channels'

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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function Home() {
  const initialVideoId = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('v') ?? undefined
    : undefined
  const { lang, setLang, t } = useLanguage()
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('yol-dark')
    if (stored === '1') {
      setDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleDark = useCallback(() => {
    setDarkMode((prev) => {
      const next = !prev
      document.documentElement.classList.toggle('dark', next)
      localStorage.setItem('yol-dark', next ? '1' : '0')
      return next
    })
  }, [])

  const [url, setUrl] = useState(initialVideoId ? `https://youtube.com/watch?v=${initialVideoId}` : '')
  const [videoId, setVideoId] = useState<string | null>(initialVideoId ?? null)
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
  const [searchMode, setSearchMode] = useState<SearchMode>('songs')
  const [channelResults, setChannelResults] = useState<ChannelResult[]>([])
  const [browsingChannel, setBrowsingChannel] = useState<{ id: string; name: string } | null>(null)
  const [channelVideos, setChannelVideos] = useState<ChannelVideo[]>([])
  const [channelSort, setChannelSort] = useState<'newest' | 'popular' | 'oldest'>('newest')
  const [channelLoading, setChannelLoading] = useState(false)
  const [addToPlaylistTarget, setAddToPlaylistTarget] =
    useState<SearchResult | null>(null)
  const [addSelectKey, setAddSelectKey] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [featureOpen, setFeatureOpen] = useState(false)
  const [featureText, setFeatureText] = useState('')
  const [featureSubmitting, setFeatureSubmitting] = useState(false)
  const [featureSubmitted, setFeatureSubmitted] = useState(false)
  const [sponsorOpen, setSponsorOpen] = useState(false)
  const [sponsorEmail, setSponsorEmail] = useState('')
  const [sponsorLink, setSponsorLink] = useState('')
  const [sponsorSubmitting, setSponsorSubmitting] = useState(false)
  const [sponsorSubmitted, setSponsorSubmitted] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null)
  const [activePlaylistIndex, setActivePlaylistIndex] = useState(0)
  const [loopPlaylistMode, setLoopPlaylistMode] = useState(false)
  const [loopSongMode, setLoopSongMode] = useState(false)
  const [shuffleMode, setShuffleMode] = useState(false)
  const [volume, setVolume] = useState(100)
  const playerRef = useRef<YTPlayer | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const queueListRef = useRef<HTMLUListElement>(null)
  const urlInputRef = useRef<HTMLInputElement>(null)
  const timeUpdateRef = useRef<NodeJS.Timeout | null>(null)
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef('')
  const endTimeRef = useRef('')
  const lastSearchQueryRef = useRef('')
  const activePlaylistIdRef = useRef<string | null>(null)
  const activePlaylistIndexRef = useRef(0)
  const loopPlaylistModeRef = useRef(false)
  const loopSongModeRef = useRef(false)
  const shuffleModeRef = useRef(false)
  const shuffleQueueRef = useRef<number[]>([])
  const volumeRef = useRef(100)
  const preMuteVolumeRef = useRef(100)
  const volumeRestoredRef = useRef(false)
  const playlistsRef = useRef<ReturnType<typeof import('@/lib/use-playlists').usePlaylists>['playlists']>([])
  const loopPointsRef = useRef<Record<string, { start: string; end: string }>>({})
  const seekCooldownRef = useRef(false)
  const internalNavRef = useRef(false)
  const videoIdRef = useRef<string | null>(null)
  const loopPointsSyncRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const {
    user,
    isLoggedIn,
    sessionExpired,
    login,
    loginWithEmail,
    register,
    logout,
    dismissExpired,
  } = useAuth()
  const {
    history,
    setHistory,
    flushSync: flushHistory,
    upsert,
    remove,
    clear,
  } = useLoopHistory(isLoggedIn)
  const {
    playlists,
    setPlaylists,
    flushSync: flushPlaylists,
    createPlaylist,
    deletePlaylist,
    addToPlaylist,
    removeFromPlaylist,
    reorderPlaylists,
    reorderVideos,
    setPlaylistEmoji,
    renameVideo,
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
  const {
    publicMap,
    publish: publishPlaylist,
    unpublish: unpublishPlaylist,
  } = usePublicPlaylists(isLoggedIn)

  const API_URL_SYNC =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  const syncLoopPointsToServer = useCallback(() => {
    if (loopPointsSyncRef.current) clearTimeout(loopPointsSyncRef.current)
    loopPointsSyncRef.current = setTimeout(() => {
      const token = getAuthToken()
      if (!token) return
      fetch(`${API_URL_SYNC}/yol/sync/loop-points`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ data: loopPointsRef.current }),
      }).then(r => { if (r.status === 401) trigger401() })
    }, 500)
  }, [API_URL_SYNC])

  useEffect(() => {
    if (!isLoggedIn) return
    const token = getAuthToken()

    if (!isMigrated()) {
      const localPlaylists = JSON.parse(
        localStorage.getItem('yol-playlists') || '[]',
      )
      const localFolders = JSON.parse(
        localStorage.getItem('yol-folders') || '[]',
      )
      const localHistory = JSON.parse(
        localStorage.getItem('yol-loop-history') || '[]',
      )
      let localLoopPoints: Record<string, { start: string; end: string }> = {}
      try {
        const raw = localStorage.getItem('yol-loop-points')
        if (raw) localLoopPoints = JSON.parse(raw)
      } catch {}
      const hasLocal =
        localPlaylists.length || localFolders.length || localHistory.length

      if (hasLocal) {
        setSyncing(true)
        Promise.all([
          fetch(`${API_URL_SYNC}/yol/sync/playlists`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ data: localPlaylists }),
          }),
          fetch(`${API_URL_SYNC}/yol/sync/folders`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ data: localFolders }),
          }),
          fetch(`${API_URL_SYNC}/yol/sync/history`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ data: localHistory }),
          }),
          fetch(`${API_URL_SYNC}/yol/sync/loop-points`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ data: localLoopPoints }),
          }),
        ])
          .then((responses) => {
            if (responses.every((r) => r.ok)) {
              localStorage.removeItem('yol-playlists')
              localStorage.removeItem('yol-folders')
              localStorage.removeItem('yol-loop-history')
              setMigrated()
              setPlaylists(localPlaylists)
              setFolders(localFolders)
              setHistory(localHistory)
            } else {
              setSyncError(
                'Sync failed — your data is safe locally, try signing in again',
              )
            }
          })
          .catch(() => {
            setSyncError(
              'Sync failed — your data is safe locally, try signing in again',
            )
          })
          .finally(() => setSyncing(false))
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
        if (r.status === 401) {
          trigger401()
          return null
        }
        return r.json()
      })
      .then((data) => {
        if (!data) return
        setPlaylists(data.playlists ?? [])
        setFolders(data.folders ?? [])
        setHistory(data.history ?? [])
        if (data.loopPoints) {
          loopPointsRef.current = data.loopPoints
          localStorage.setItem('yol-loop-points', JSON.stringify(data.loopPoints))
          // Re-apply to the currently-loaded video so sync from another device
          // takes effect immediately without needing a video reload.
          if (videoIdRef.current) {
            const pts = data.loopPoints[videoIdRef.current]
            if (pts) {
              setStartTime(pts.start ?? '')
              setEndTime(pts.end ?? '')
              startTimeRef.current = pts.start ?? ''
              endTimeRef.current = pts.end ?? ''
            }
          }
        }
        setMigrated()
      })
      .catch((err) => {
        if (err.name !== 'AbortError')
          setSyncError('Failed to load — check your connection')
      })
      .finally(() => {
        clearTimeout(timeout)
        setSyncing(false)
      })

    return () => controller.abort()
  }, [isLoggedIn])

  // Keep refs in sync so callbacks never stale-close over startTime/endTime
  useEffect(() => { videoIdRef.current = videoId }, [videoId])
  useEffect(() => {
    startTimeRef.current = startTime
  }, [startTime])
  useEffect(() => {
    endTimeRef.current = endTime
  }, [endTime])
  useEffect(() => {
    activePlaylistIdRef.current = activePlaylistId
    shuffleQueueRef.current = []
  }, [activePlaylistId])
  useEffect(() => { activePlaylistIndexRef.current = activePlaylistIndex }, [activePlaylistIndex])
  useEffect(() => { loopPlaylistModeRef.current = loopPlaylistMode }, [loopPlaylistMode])
  useEffect(() => { loopSongModeRef.current = loopSongMode }, [loopSongMode])
  useEffect(() => {
    shuffleModeRef.current = shuffleMode
    // Reset the shuffle queue when toggling — a fresh queue is built on next advance
    shuffleQueueRef.current = []
  }, [shuffleMode])
  useEffect(() => { playlistsRef.current = playlists }, [playlists])

  // Restore volume from localStorage on mount. Persistence on subsequent
  // changes happens inside updateVolume so it writes synchronously with the
  // state change instead of racing against this mount effect.
  useEffect(() => {
    const stored = localStorage.getItem('yol-volume')
    if (stored !== null) {
      const v = parseInt(stored)
      if (!isNaN(v)) {
        setVolume(v)
        volumeRef.current = v
        preMuteVolumeRef.current = v
        playerRef.current?.setVolume(v)
      }
    }
    volumeRestoredRef.current = true
  }, [])

  const updateVolume = useCallback((next: number | ((v: number) => number)) => {
    setVolume((prev) => {
      const v = typeof next === 'function' ? next(prev) : next
      volumeRef.current = v
      if (v > 0) preMuteVolumeRef.current = v
      playerRef.current?.setVolume(v)
      try { localStorage.setItem('yol-volume', v.toString()) } catch {}
      return v
    })
  }, [])

  // Load loop points from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('yol-loop-points')
    if (stored) {
      try { loopPointsRef.current = JSON.parse(stored) } catch {}
    }
  }, [])

  // Restore loop points when video changes. Sync refs synchronously in the
  // same pass so they can't be stale between the setVideoId and the ref
  // sync effects firing on the next render commit.
  useEffect(() => {
    if (!videoId) {
      setStartTime('')
      setEndTime('')
      startTimeRef.current = ''
      endTimeRef.current = ''
      return
    }
    const pts = loopPointsRef.current[videoId]
    if (pts) {
      setStartTime(pts.start)
      setEndTime(pts.end)
      startTimeRef.current = pts.start
      endTimeRef.current = pts.end
    } else {
      setStartTime('')
      setEndTime('')
      startTimeRef.current = ''
      endTimeRef.current = ''
    }
  }, [videoId])

  // Pick the next index under shuffle mode. Uses a queue of all indices so every song
  // plays once before any repeats; refills (excluding current) when exhausted.
  const pickNextShuffleIndex = useCallback((total: number, current: number): number => {
    if (total <= 1) return 0
    shuffleQueueRef.current = shuffleQueueRef.current.filter((i) => i < total)
    if (shuffleQueueRef.current.length === 0) {
      const pool: number[] = []
      for (let i = 0; i < total; i++) if (i !== current) pool.push(i)
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[pool[i], pool[j]] = [pool[j], pool[i]]
      }
      shuffleQueueRef.current = pool
    }
    return shuffleQueueRef.current.shift() as number
  }, [])

  // Advance to the next video in the active playlist. Returns true if advanced, false if playlist ended.
  const advancePlaylist = useCallback((): boolean => {
    // Loop-song mode short-circuits: caller's fallback loops the current video
    if (loopSongModeRef.current) return false
    const pid = activePlaylistIdRef.current
    const idx = activePlaylistIndexRef.current
    const plist = playlistsRef.current.find((p) => p.id === pid)
    if (!plist || plist.videos.length === 0) return false
    const total = plist.videos.length

    const loadNext = (video: { videoId: string; title?: string }, index: number) => {
      const pts = loopPointsRef.current[video.videoId]
      const startSec = pts?.start ? parseInt(pts.start) : 0
      setActivePlaylistIndex(index)
      internalNavRef.current = true
      setVideoId(video.videoId)
      setUrl(`https://youtube.com/watch?v=${video.videoId}`)
      setLoopCount(0)
      setIsPlaying(true)
      upsert(video.videoId, 0, video.title)
      // Load in existing player to avoid autoplay restrictions in background tabs
      if (playerRef.current?.loadVideoById) {
        playerRef.current.loadVideoById({ videoId: video.videoId, startSeconds: startSec })
      }
    }

    if (shuffleModeRef.current && total > 1) {
      const nextIdx = pickNextShuffleIndex(total, idx)
      loadNext(plist.videos[nextIdx], nextIdx)
      return true
    }

    const nextIdx = idx + 1
    if (nextIdx < total) {
      loadNext(plist.videos[nextIdx], nextIdx)
      return true
    } else if (loopPlaylistModeRef.current) {
      loadNext(plist.videos[0], 0)
      return true
    }
    return false
  }, [upsert, pickNextShuffleIndex])

  const prevPlaylistVideo = useCallback(() => {
    const plist = playlists.find((p) => p.id === activePlaylistId)
    if (!plist) return
    const prevIdx = activePlaylistIndex - 1
    if (prevIdx < 0) return
    const prev = plist.videos[prevIdx]
    const pts = loopPointsRef.current[prev.videoId]
    const startSec = pts?.start ? parseInt(pts.start) : 0
    setActivePlaylistIndex(prevIdx)
    internalNavRef.current = true
    setVideoId(prev.videoId)
    setUrl(`https://youtube.com/watch?v=${prev.videoId}`)
    setLoopCount(0)
    setIsPlaying(true)
    upsert(prev.videoId, 0, prev.title)
    if (playerRef.current?.loadVideoById) {
      playerRef.current.loadVideoById({ videoId: prev.videoId, startSeconds: startSec })
    }
  }, [activePlaylistId, activePlaylistIndex, playlists, upsert])

  const nextPlaylistVideo = useCallback(() => {
    const plist = playlists.find((p) => p.id === activePlaylistId)
    if (!plist || plist.videos.length === 0) return
    const total = plist.videos.length

    let nextIdx: number
    if (shuffleMode && total > 1) {
      nextIdx = pickNextShuffleIndex(total, activePlaylistIndex)
    } else {
      nextIdx = activePlaylistIndex + 1
      if (nextIdx >= total) {
        if (!loopPlaylistMode) return
        nextIdx = 0
      }
    }

    const next = plist.videos[nextIdx]
    const pts = loopPointsRef.current[next.videoId]
    const startSec = pts?.start ? parseInt(pts.start) : 0
    setActivePlaylistIndex(nextIdx)
    internalNavRef.current = true
    setVideoId(next.videoId)
    setUrl(`https://youtube.com/watch?v=${next.videoId}`)
    setLoopCount(0)
    setIsPlaying(true)
    upsert(next.videoId, 0, next.title)
    if (playerRef.current?.loadVideoById) {
      playerRef.current.loadVideoById({ videoId: next.videoId, startSeconds: startSec })
    }
  }, [activePlaylistId, activePlaylistIndex, playlists, upsert, shuffleMode, loopPlaylistMode, pickNextShuffleIndex])

  const jumpToPlaylistIndex = useCallback((index: number) => {
    const plist = playlists.find((p) => p.id === activePlaylistId)
    if (!plist || index < 0 || index >= plist.videos.length) return
    if (index === activePlaylistIndex) return
    const target = plist.videos[index]
    const pts = loopPointsRef.current[target.videoId]
    const startSec = pts?.start ? parseInt(pts.start) : 0
    setActivePlaylistIndex(index)
    internalNavRef.current = true
    setVideoId(target.videoId)
    setUrl(`https://youtube.com/watch?v=${target.videoId}`)
    setLoopCount(0)
    setIsPlaying(true)
    upsert(target.videoId, 0, target.title)
    if (playerRef.current?.loadVideoById) {
      playerRef.current.loadVideoById({ videoId: target.videoId, startSeconds: startSec })
    }
  }, [activePlaylistId, activePlaylistIndex, playlists, upsert])

  // Keep the active queue row visible WITHIN the queue's own scroll container
  // only — never scrollIntoView, which would yank the page on unrelated renders
  useEffect(() => {
    if (!activePlaylistId) return
    const ul = queueListRef.current
    if (!ul) return
    const row = ul.children[activePlaylistIndex] as HTMLElement | undefined
    if (!row) return
    const top = row.offsetTop
    const bottom = top + row.offsetHeight
    if (top < ul.scrollTop) ul.scrollTop = top
    else if (bottom > ul.scrollTop + ul.clientHeight) ul.scrollTop = bottom - ul.clientHeight
  }, [activePlaylistId, activePlaylistIndex])

  const currentTitle = history.find((h) => h.videoId === videoId)?.title

  useEffect(() => { setAddSelectKey((k) => k + 1) }, [videoId])

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

  // Poll the player while a video is loaded — do NOT gate on React's
  // isPlaying state, because YouTube can miss the PLAYING state-change event
  // (autoplay after loadVideoById, background tabs), leaving isPlaying stuck
  // at false and the B-point never enforced. Gate on the player's own state
  // instead. Read loop points from loopPointsRef (keyed by current videoId)
  // so the check can't race against stale startTimeRef/endTimeRef during a
  // video switch.
  useEffect(() => {
    if (!videoId) return
    const tick = () => {
      const p = playerRef.current
      if (!p || typeof p.getPlayerState !== 'function') return
      if (p.getPlayerState() !== 1) return // 1 = PLAYING
      const ct = p.getCurrentTime?.() || 0
      const dur = p.getDuration?.() || 0
      setCurrentTime(ct)
      setDuration(dur)
      const pts = loopPointsRef.current[videoId]
      const end = pts?.end ? parseInt(pts.end) : 0
      if (!(end > 0) || seekCooldownRef.current) return
      if (ct < end) return
      seekCooldownRef.current = true
      setTimeout(() => { seekCooldownRef.current = false }, 300)
      const start = pts?.start ? parseInt(pts.start) : 0
      if (activePlaylistIdRef.current) {
        const advanced = advancePlaylist()
        if (advanced) return
      }
      setLoopCount((prev) => prev + 1)
      p.seekTo(start, true)
      p.playVideo()
    }
    const id = setInterval(tick, 100)
    return () => clearInterval(id)
  }, [videoId, advancePlaylist])

  const onPlayerStateChange = useCallback(
    (event: YTPlayerEvent) => {
      if (event.data === 0) {
        if (activePlaylistIdRef.current) {
          const advanced = advancePlaylist()
          if (!advanced) {
            // Playlist ended with no loop — keep looping last video
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
          return
        }
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
      if (event.data === 1) {
        setIsPlaying(true)
        const title = playerRef.current?.getVideoData?.()?.title
        if (title) document.title = `${title} on Loop | YOL`
      }
      if (event.data === 2) setIsPlaying(false)
    },
    [videoId, upsert, advancePlaylist],
  )

  const onPlayerReady = useCallback(() => {
    if (playerRef.current) {
      setDuration(playerRef.current.getDuration?.() || 0)
      playerRef.current.setVolume(volumeRef.current)
      if (startTimeRef.current) {
        playerRef.current.seekTo(parseInt(startTimeRef.current), true)
      }
      const title = playerRef.current.getVideoData?.()?.title
      if (title) document.title = `${title} on Loop | YOL`
    }
  }, [])

  useEffect(() => {
    if (!videoId) {
      document.title = 'YouTube on Loop — Loop & Repeat Any YouTube Video Free'
    }
  }, [videoId])

  useEffect(() => {
    if (!apiReady || !videoId || !containerRef.current) return
    // Skip player recreation if video was loaded internally (playlist nav) —
    // reusing the existing player avoids autoplay restrictions in background tabs
    if (internalNavRef.current) {
      internalNavRef.current = false
      return
    }
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
      // Skip destroy during internal playlist navigation — player is being reused
      if (internalNavRef.current) return
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
      setChannelResults([])
      setSearchLoading(false)
      return
    }
    setSearchLoading(true)
    searchDebounceRef.current = setTimeout(async () => {
      try {
        if (searchMode === 'channels') {
          const res = await fetch(`${API_URL}/yol/search-channels?q=${encodeURIComponent(url)}`)
          const data = await res.json()
          setChannelResults(Array.isArray(data) ? data : [])
          setSearchResults([])
        } else {
          const res = await fetch(`${API_URL}/yol/search?q=${encodeURIComponent(url)}`)
          const data = await res.json()
          setSearchResults(Array.isArray(data) ? data : [])
          setChannelResults([])
        }
      } catch {
        setSearchResults([])
        setChannelResults([])
      } finally {
        setSearchLoading(false)
      }
    }, 400)
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    }
  }, [url, searchMode])

  const fetchChannelVideos = useCallback(async (channelId: string, sort: 'newest' | 'popular' | 'oldest') => {
    setChannelLoading(true)
    try {
      const res = await fetch(`${API_URL}/yol/channel-videos?url=${encodeURIComponent(`https://www.youtube.com/channel/${channelId}`)}&sort=${sort}&limit=30`)
      const data = await res.json()
      setChannelVideos(data.videos || [])
    } catch {
      setChannelVideos([])
    } finally {
      setChannelLoading(false)
    }
  }, [])

  // When browsing channel or sort changes, fetch videos
  useEffect(() => {
    if (browsingChannel) {
      fetchChannelVideos(browsingChannel.id, channelSort)
    }
  }, [browsingChannel, channelSort, fetchChannelVideos])

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
      setActivePlaylistId(null)
      setActivePlaylistIndex(0)
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
    setActivePlaylistId(null)
    setActivePlaylistIndex(0)
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
      const next = Math.min(Math.round((playbackSpeed + 0.05) * 100) / 100, 2)
      setPlaybackSpeed(next)
      playerRef.current?.setPlaybackRate(next)
    },
    { preventDefault: true },
  )
  useHotkeys(
    'minus',
    () => {
      if (!videoId) return
      const prev = Math.max(Math.round((playbackSpeed - 0.05) * 100) / 100, 0.25)
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

  const handleExport = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      playlists,
      history,
      folders,
      loopPoints: loopPointsRef.current,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'yol-data.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (file: File) => {
    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string)
        if (isLoggedIn) {
          const confirmed = window.confirm(
            'This will replace all your synced data. Continue?',
          )
          if (!confirmed) return
          const token = getAuthToken()
          const apiUrl =
            process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
          await Promise.all([
            fetch(`${apiUrl}/yol/sync/playlists`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ data: parsed.playlists ?? [] }),
            }),
            fetch(`${apiUrl}/yol/sync/folders`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ data: parsed.folders ?? [] }),
            }),
            fetch(`${apiUrl}/yol/sync/history`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ data: parsed.history ?? [] }),
            }),
            fetch(`${apiUrl}/yol/sync/loop-points`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ data: parsed.loopPoints ?? {} }),
            }),
          ])
          setPlaylists(parsed.playlists ?? [])
          setFolders(parsed.folders ?? [])
          setHistory(parsed.history ?? [])
          if (parsed.loopPoints) {
            loopPointsRef.current = parsed.loopPoints
            localStorage.setItem('yol-loop-points', JSON.stringify(parsed.loopPoints))
          }
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
          localStorage.setItem('yol-folders', JSON.stringify(parsed.folders))
        if (parsed.loopPoints)
          localStorage.setItem('yol-loop-points', JSON.stringify(parsed.loopPoints))
        window.location.reload()
      } catch {
        alert('Invalid file. Please use a yol-data.json export.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="min-h-screen bg-[#FFF2EB] bg-[linear-gradient(to_right,#FFD6BA33_1px,transparent_1px),linear-gradient(to_bottom,#FFD6BA33_1px,transparent_1px)] bg-[size:45px_45px]">
      {syncing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80">
          <div className="flex flex-col items-center gap-3 rounded-base border-4 border-black bg-white p-8 shadow-base">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm font-heading">Loading your data…</p>
          </div>
        </div>
      )}
      {sessionExpired && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="flex flex-col items-center gap-4 rounded-base border-4 border-black bg-white p-8 shadow-base">
            <p className="text-lg font-heading">Session expired</p>
            <p className="text-sm text-stone-500">
              Please sign in again to keep syncing.
            </p>
            <div className="flex gap-2">
              <button
                onClick={dismissExpired}
                className="rounded-xl border-2 border-black px-4 py-2 text-sm font-bold hover:bg-bg"
              >
                Stay offline
              </button>
              <button
                onClick={login}
                className="rounded-xl border-2 border-black bg-main px-4 py-2 text-sm font-bold hover:opacity-90"
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      )}
      {syncError && (
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-xl border-2 border-black bg-red-100 px-4 py-3 text-sm font-bold shadow-base">
          {syncError}
          <button
            onClick={() => setSyncError(null)}
            className="ml-3 text-stone-400 hover:text-black"
          >
            ✕
          </button>
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
        <div className="flex h-full flex-col overflow-hidden rounded-2xl border-4 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
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
            addToPlaylist={addToPlaylist}
            onPlay={(vId, title) => {
              setActivePlaylistId(null)
              setVideoId(vId)
              setUrl(`https://youtube.com/watch?v=${vId}`)
              setLoopCount(0)
              setIsPlaying(true)
              setSearchResults([])
              upsert(vId, 0, title)
            }}
            onPlayFromPlaylist={(playlistId, index, vId, title) => {
              setActivePlaylistId(playlistId)
              setActivePlaylistIndex(index)
              setVideoId(vId)
              setUrl(`https://youtube.com/watch?v=${vId}`)
              setLoopCount(0)
              setIsPlaying(true)
              setSearchResults([])
              upsert(vId, 0, title)
            }}
            onRemove={remove}
            reorderVideos={reorderVideos}
            renameVideo={renameVideo}
            isLoggedIn={isLoggedIn}
            publicMap={publicMap}
            publishPlaylist={publishPlaylist}
            unpublishPlaylist={unpublishPlaylist}
            getLoopPoints={() => loopPointsRef.current}
            t={t}
          />
        </div>
      </aside>

      {/* ── TOP NAVBAR ──────────────────────────────────────────── */}
      <nav className="sticky top-0 z-30 flex items-center gap-3 border-b-2 border-black bg-white px-4 py-2">
        {/* Mobile library toggle */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-white px-2.5 py-1.5 text-sm font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>
        {/* Logo */}
        <a href="/" className="hidden shrink-0 lg:block">
          <Image
            src={darkMode ? '/yol_logo_dark.webp' : '/yol_logo.webp'}
            alt="YouTube on Loop"
            width={780}
            height={400}
            className="h-9 w-auto"
          />
        </a>
        {/* Search bar */}
        <form onSubmit={handleSubmit} className="flex min-w-0 flex-1 justify-center">
          <div className="relative w-full max-w-xl">
            <div className="flex items-center gap-1 rounded-xl border-2 border-black bg-stone-100 py-1.5 pl-3 pr-1.5">
              <Search className="h-4 w-4 shrink-0 text-stone-400" />
              <input
                ref={urlInputRef}
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="min-w-0 flex-1 bg-transparent text-sm placeholder-stone-400 focus:outline-none"
              />
              <div className="hidden items-center gap-1 sm:flex">
                {(['songs', 'channels'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => { setSearchMode(mode); setBrowsingChannel(null) }}
                    className={`rounded-lg border-2 border-black px-2 py-1 text-[11px] font-bold transition-all ${searchMode === mode ? 'bg-main' : 'bg-white hover:bg-stone-50'}`}
                  >
                    {mode === 'songs' ? t.searchSongs : t.searchChannels}
                  </button>
                ))}
              </div>
              <Button
                type="submit"
                className="ml-1 h-7 shrink-0 rounded-lg px-3 text-xs !shadow-none hover:!translate-x-0 hover:!translate-y-0"
              >
                <Search className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </form>
        <a
          href="https://discord.gg/yAwv9ESCX3"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-[#5865F2] hover:text-white hover:shadow-none"
          title="Join our Discord"
        >
          <FaDiscord className="h-4 w-4" />
        </a>
        <SidebarMenu
          isLoggedIn={isLoggedIn}
          user={user}
          login={login}
          loginWithEmail={loginWithEmail}
          register={register}
          logout={() => {
            flushPlaylists()
            flushFolders()
            flushHistory()
            logout()
          }}
          onExport={handleExport}
          onHelp={() => setHelpOpen(true)}
          onImport={handleImport}
          onFeature={() => {
            setFeatureOpen(true)
            setFeatureSubmitted(false)
            setFeatureText('')
          }}
          darkMode={darkMode}
          onToggleDark={toggleDark}
          lang={lang}
          setLang={setLang}
          t={t}
        />
      </nav>

      {/* ── THREE-COLUMN LAYOUT ───────────────────────────────────── */}
      <div className="flex min-h-[calc(100vh-52px)] w-full gap-4 px-4 py-4">
        {/* LEFT SIDEBAR — floating */}
        <aside className="sticky top-[68px] hidden h-[calc(100vh-84px)] shrink-0 flex-col overflow-hidden rounded-2xl border-2 border-black bg-white shadow-base lg:flex lg:w-[220px] xl:w-[260px]">
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
            addToPlaylist={addToPlaylist}
            onPlay={(vId, title) => {
              setActivePlaylistId(null)
              setVideoId(vId)
              setUrl(`https://youtube.com/watch?v=${vId}`)
              setLoopCount(0)
              setIsPlaying(true)
              setSearchResults([])
              upsert(vId, 0, title)
            }}
            onPlayFromPlaylist={(playlistId, index, vId, title) => {
              setActivePlaylistId(playlistId)
              setActivePlaylistIndex(index)
              setVideoId(vId)
              setUrl(`https://youtube.com/watch?v=${vId}`)
              setLoopCount(0)
              setIsPlaying(true)
              setSearchResults([])
              upsert(vId, 0, title)
            }}
            onRemove={remove}
            reorderVideos={reorderVideos}
            renameVideo={renameVideo}
            isLoggedIn={isLoggedIn}
            publicMap={publicMap}
            publishPlaylist={publishPlaylist}
            unpublishPlaylist={unpublishPlaylist}
            getLoopPoints={() => loopPointsRef.current}
            t={t}
          />
        </aside>

        {/* CENTER COLUMN */}
        <div className="flex min-w-0 flex-1 flex-col gap-4 p-6 pt-0">
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
            {/* ── HEADER (shown when no video) ───────────────────────── */}
            <div className={`px-4 text-center transition-all duration-300 ${videoId ? 'hidden' : ''}`}>
              <div className="inline-block">
                <Image
                  src={darkMode ? '/yol_logo_dark.webp' : '/yol_logo.webp'}
                  alt="YouTube on Loop"
                  width={780}
                  height={400}
                  className="h-14 w-auto md:h-32"
                  priority
                />
              </div>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                YouTube on Loop
              </h1>
            </div>

            {/* Back to search + repeat counter */}
            {videoId && (
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    const q = lastSearchQueryRef.current
                    handleReset()
                    if (q) setUrl(q)
                  }}
                  className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-white px-3 py-2 text-sm font-bold shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {activePlaylistId ? 'Go to Search' : 'Back To Search'}
                </button>
                <div className="flex items-center gap-2 text-sm font-bold">
                  <span className="text-stone-500">Repeat Counter:</span>
                  <div
                    className="flex cursor-pointer items-center gap-1.5 rounded-xl border-2 border-black bg-main px-2.5 py-1.5 text-xs font-bold transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-base"
                    onClick={() => setLoopCount(0)}
                    title="Click to reset"
                  >
                    <RefreshCw className="h-3 w-3" />
                    {loopCount}x
                  </div>
                </div>
              </div>
            )}

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
                    {/* Mobile search mode toggle */}
                    <div className="flex items-center gap-1.5 sm:hidden">
                      {(['songs', 'channels'] as const).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => { setSearchMode(mode); setBrowsingChannel(null) }}
                          className={`rounded-lg border-2 border-black px-3 py-1 text-xs font-bold transition-all ${searchMode === mode ? 'bg-main shadow-base' : 'bg-white hover:bg-stone-50'}`}
                        >
                          {mode === 'songs' ? t.searchSongs : t.searchChannels}
                        </button>
                      ))}
                    </div>
                    <div className="mt-6 inline-flex flex-col gap-1.5 text-[10px]">
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

            {/* Search Results — Songs mode */}
            {searchMode === 'songs' && (searchLoading || searchResults.length > 0) &&
              !isYoutubeUrl(url) && (
                <div className="rounded-2xl border-2 border-black bg-white shadow-base">
                  <div className={`flex items-center gap-2 px-4 py-2 ${!searchLoading || searchResults.length > 0 ? 'border-b-2 border-black' : ''}`}>
                    <Search className="h-3.5 w-3.5" />
                    <p className="text-sm font-bold">
                      {searchLoading ? t.searching : `"${url}"`}
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
                      <div
                        key={video.videoId}
                        className="group flex items-center gap-3 p-3 transition-colors hover:bg-bg"
                      >
                        <button
                          onClick={() => {
                            setActivePlaylistId(null)
                            setActivePlaylistIndex(0)
                            lastSearchQueryRef.current = url
                            setVideoId(video.videoId)
                            setUrl(
                              `https://youtube.com/watch?v=${video.videoId}`,
                            )
                            setLoopCount(0)
                            setIsPlaying(true)
                            upsert(video.videoId, 0, video.title)
                          }}
                          className="flex min-w-0 flex-1 items-center gap-3 text-left"
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
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setAddToPlaylistTarget(video)
                          }}
                          className="shrink-0 rounded-lg border-2 border-black p-1.5 transition-all hover:bg-main"
                          title="Add to playlist"
                        >
                          <ListPlus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Search Results — Channels mode */}
            {searchMode === 'channels' && !browsingChannel && (searchLoading || channelResults.length > 0) &&
              !isYoutubeUrl(url) && (
                <div className="rounded-2xl border-2 border-black bg-white shadow-base">
                  <div className={`flex items-center gap-2 px-4 py-2 ${!searchLoading || channelResults.length > 0 ? 'border-b-2 border-black' : ''}`}>
                    <Search className="h-3.5 w-3.5" />
                    <p className="text-sm font-bold">
                      {searchLoading ? t.searching : `"${url}"`}
                    </p>
                    {searchLoading && (
                      <Loader2 className="ml-auto h-4 w-4 animate-spin" />
                    )}
                  </div>
                  {!searchLoading && channelResults.length === 0 && (
                    <p className="p-4 text-center text-sm text-stone-500">
                      No results found
                    </p>
                  )}
                  <div className="divide-y-2 divide-black">
                    {channelResults.map((ch) => (
                      <button
                        key={ch.channelId}
                        onClick={() => {
                          setBrowsingChannel({ id: ch.channelId, name: ch.title })
                          setChannelSort('newest')
                        }}
                        className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-bg"
                      >
                        {ch.thumbnail && (
                          <img
                            src={ch.thumbnail}
                            alt=""
                            className="h-10 w-10 shrink-0 rounded-full border-2 border-black object-cover"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold">{ch.title}</p>
                          <p className="text-xs text-stone-400">{t.browseChannel}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 shrink-0 text-stone-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

            {/* Channel Video Browser */}
            {browsingChannel && (
              <div className="rounded-2xl border-2 border-black bg-white shadow-base">
                <div className="flex items-center gap-2 border-b-2 border-black px-4 py-2">
                  <button
                    onClick={() => setBrowsingChannel(null)}
                    className="flex items-center gap-1 rounded-lg px-1.5 py-1 text-xs text-stone-400 transition-colors hover:text-black"
                  >
                    <ChevronRight className="h-3 w-3 rotate-180" />
                    {t.back}
                  </button>
                  <p className="min-w-0 flex-1 truncate text-sm font-bold">{browsingChannel.name}</p>
                </div>
                <div className="flex gap-1 border-b-2 border-black px-3 py-2">
                  {(['newest', 'popular', 'oldest'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setChannelSort(s)}
                      className={`rounded-lg border-2 border-black px-2.5 py-1 text-xs font-bold transition-all ${channelSort === s ? 'bg-main shadow-base' : 'bg-white hover:bg-stone-50'}`}
                    >
                      {s === 'newest' ? t.sortNewest : s === 'popular' ? t.sortPopular : t.sortOldest}
                    </button>
                  ))}
                </div>
                {channelLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-stone-400" />
                  </div>
                ) : channelVideos.length === 0 ? (
                  <p className="p-4 text-center text-sm text-stone-500">No videos found</p>
                ) : (
                  <div className="max-h-[400px] divide-y-2 divide-black overflow-y-auto">
                    {channelVideos.map((cv) => (
                      <div
                        key={cv.videoId}
                        className="group flex items-center gap-3 p-3 transition-colors hover:bg-bg"
                      >
                        <button
                          onClick={() => {
                            setActivePlaylistId(null)
                            setActivePlaylistIndex(0)
                            setVideoId(cv.videoId)
                            setUrl(`https://youtube.com/watch?v=${cv.videoId}`)
                            setLoopCount(0)
                            setIsPlaying(true)
                            upsert(cv.videoId, 0, cv.title)
                          }}
                          className="flex min-w-0 flex-1 items-center gap-3 text-left"
                        >
                          <img
                            src={cv.thumbnail || `https://i.ytimg.com/vi/${cv.videoId}/mqdefault.jpg`}
                            alt=""
                            className="h-12 w-20 shrink-0 rounded-xl border-2 border-black object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold">{cv.title}</p>
                            <div className="flex items-center gap-2 text-xs text-stone-400">
                              {cv.lengthText && <span>{cv.lengthText}</span>}
                              {cv.viewCount && <span>{cv.viewCount}</span>}
                            </div>
                            {cv.publishedTime && (
                              <p className="text-xs text-stone-400">{cv.publishedTime}</p>
                            )}
                          </div>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setAddToPlaylistTarget({ videoId: cv.videoId, title: cv.title, author: browsingChannel.name, lengthSeconds: 0 })
                          }}
                          className="shrink-0 rounded-lg border-2 border-black p-1.5 transition-all hover:bg-main"
                          title="Add to playlist"
                        >
                          <ListPlus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Controls — shown only when video is loaded */}
            {videoId && (
              <>

                {/* Controls */}
                <div className="rounded-2xl border-4 border-black bg-white shadow-base">
                  {/* Playback row: repeat+shuffle | buttons | speed */}
                  <div className="flex items-center gap-2 px-4 py-3">
                    {/* Repeat + Shuffle */}
                    <TooltipProvider delayDuration={200}>
                    <div className="flex shrink-0 items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => {
                              setLoopSongMode((v) => {
                                const next = !v
                                if (next) setLoopPlaylistMode(false)
                                return next
                              })
                            }}
                            className={`flex items-center justify-center rounded-xl border-2 border-black p-2 transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none ${loopSongMode ? 'bg-main shadow-base' : 'bg-white shadow-base'}`}
                          >
                            <Repeat1 className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="rounded-lg border-2 border-black bg-white text-xs font-medium">
                          {t.loopSong}
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => {
                              setLoopPlaylistMode((v) => {
                                const next = !v
                                if (next) setLoopSongMode(false)
                                return next
                              })
                            }}
                            className={`flex items-center justify-center rounded-xl border-2 border-black p-2 transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none ${loopPlaylistMode ? 'bg-main shadow-base' : 'bg-white shadow-base'}`}
                          >
                            <Repeat className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="rounded-lg border-2 border-black bg-white text-xs font-medium">
                          {t.loopPlaylist}
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setShuffleMode((v) => !v)}
                            className={`flex items-center justify-center rounded-xl border-2 border-black p-2 transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none ${shuffleMode ? 'bg-main shadow-base' : 'bg-white shadow-base'}`}
                          >
                            <Shuffle className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="rounded-lg border-2 border-black bg-white text-xs font-medium">
                          Shuffle
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    </TooltipProvider>

                    <div className="flex flex-1 items-center justify-center gap-2">
                      <Button
                        variant="neutral"
                        size="icon"
                        onClick={activePlaylistId ? prevPlaylistVideo : skipBack}
                        title={activePlaylistId ? 'Previous song' : 'Back 10s'}
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
                        onClick={activePlaylistId ? nextPlaylistVideo : skipForward}
                        title={activePlaylistId ? 'Next song' : 'Forward 10s'}
                        className="h-10 w-10 rounded-xl"
                      >
                        <SkipForward className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Speed */}
                    <div className="group/speed relative shrink-0">
                      <button
                        onClick={() => {
                          setPlaybackSpeed(1)
                          playerRef.current?.setPlaybackRate(1)
                        }}
                        className="flex h-9 items-center gap-1.5 rounded-xl border-2 border-black bg-white px-2.5 text-sm font-medium transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none shadow-base"
                        title={`Speed: ${playbackSpeed}x (click to reset)`}
                      >
                        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M 2.5 12.5 A 5.5 5.5 0 0 1 13.5 12.5" />
                          <line x1="8" y1="12.5" x2="8" y2="6" transform={`rotate(${((playbackSpeed - 0.25) / 1.75) * 180 - 90}, 8, 12.5)`} />
                          <circle cx="8" cy="12.5" r="1.2" fill="currentColor" stroke="none" />
                        </svg>
                      </button>
                      <div className="invisible opacity-0 group-hover/speed:visible group-hover/speed:opacity-100 transition-all duration-150 absolute right-0 top-full z-50 pt-1.5">
                        <div className="flex items-center gap-2.5 rounded-xl border-2 border-black bg-white px-3 py-2.5 shadow-base">
                          <ReactSlider
                            className="relative flex h-5 w-28 items-center"
                            thumbClassName="h-4 w-4 rounded-full border-2 border-black bg-white cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-main z-10"
                            min={25}
                            max={200}
                            step={5}
                            value={Math.round(playbackSpeed * 100)}
                            onChange={(v) => {
                              const s = (v as number) / 100
                              setPlaybackSpeed(s)
                              playerRef.current?.setPlaybackRate(s)
                            }}
                            renderTrack={({ key, ...props }, state) => (
                              <div
                                key={key}
                                {...props}
                                className={`h-2 rounded-full ${state.index === 0 ? 'bg-main border-2 border-black' : 'bg-stone-200 border-2 border-black'}`}
                              />
                            )}
                          />
                          <span className="text-xs font-bold tabular-nums w-8 text-right">{playbackSpeed.toFixed(2)}x</span>
                        </div>
                      </div>
                    </div>

                    {/* Volume */}
                    <div className="group relative shrink-0">
                      <button
                        onClick={() => updateVolume((v) => (v === 0 ? (preMuteVolumeRef.current || 50) : 0))}
                        className="flex h-9 items-center gap-1.5 rounded-xl border-2 border-black bg-white px-2.5 text-sm font-medium transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none shadow-base"
                        title={volume === 0 ? 'Unmute' : 'Mute'}
                      >
                        {volume === 0 ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                      </button>
                      <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-150 absolute right-0 top-full z-50 pt-1.5">
                        <div className="flex items-center gap-2.5 rounded-xl border-2 border-black bg-white px-3 py-2.5 shadow-base">
                          <ReactSlider
                            className="relative flex h-5 w-28 items-center"
                            thumbClassName="h-4 w-4 rounded-full border-2 border-black bg-white cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-main z-10"
                            min={0}
                            max={100}
                            value={volume}
                            onChange={(v) => updateVolume(v as number)}
                            renderTrack={({ key, ...props }, state) => (
                              <div
                                key={key}
                                {...props}
                                className={`h-2 rounded-full ${state.index === 0 ? 'bg-main border-2 border-black' : 'bg-stone-200 border-2 border-black'}`}
                              />
                            )}
                          />
                        </div>
                      </div>
                    </div>
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
                            const newStart = start === 0 ? '' : start.toString()
                            const newEnd = end === Math.floor(duration) ? '' : end.toString()
                            setStartTime(newStart)
                            setEndTime(newEnd)
                            if (videoId) {
                              loopPointsRef.current = { ...loopPointsRef.current, [videoId]: { start: newStart, end: newEnd } }
                              localStorage.setItem('yol-loop-points', JSON.stringify(loopPointsRef.current))
                              syncLoopPointsToServer()
                            }
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

                {/* Playlist queue (shown when playing from a playlist) */}
                {activePlaylistId && (() => {
                  const queuePlaylist = playlists.find((p) => p.id === activePlaylistId)
                  if (!queuePlaylist || queuePlaylist.videos.length === 0) return null
                  return (
                    <div className="overflow-hidden rounded-2xl border-4 border-black bg-white shadow-base">
                      <div className="flex items-center gap-2 border-b-2 border-black px-4 py-2.5">
                        <ListMusic className="h-3.5 w-3.5 shrink-0 text-stone-500" />
                        <span className="truncate text-xs font-bold text-stone-600">
                          {queuePlaylist.emoji ? `${queuePlaylist.emoji} ` : ''}{queuePlaylist.name}
                        </span>
                        <span className="ml-auto text-[10px] font-bold tabular-nums text-stone-400">
                          {activePlaylistIndex + 1} / {queuePlaylist.videos.length}
                        </span>
                      </div>
                      <ul ref={queueListRef} className="max-h-72 overflow-y-auto">
                        {queuePlaylist.videos.map((v, i) => {
                          const isCurrent = i === activePlaylistIndex
                          return (
                            <li key={`${v.videoId}-${i}`}>
                              <button
                                onClick={() => jumpToPlaylistIndex(i)}
                                className={`group flex w-full items-center gap-3 border-b-2 border-black/10 px-3 py-2 text-left transition-colors last:border-b-0 ${isCurrent ? 'bg-main' : 'bg-white hover:bg-stone-50'}`}
                              >
                                <span className={`w-6 shrink-0 text-center text-[11px] font-bold tabular-nums ${isCurrent ? 'text-black' : 'text-stone-400'}`}>
                                  {isCurrent ? (
                                    isPlaying ? (
                                      <span className="inline-flex items-end justify-center gap-[2px] h-3">
                                        <span className="w-[2px] origin-bottom bg-black animate-[eqbar_0.9s_ease-in-out_infinite] [animation-delay:-0.4s]" style={{ height: '40%' }} />
                                        <span className="w-[2px] origin-bottom bg-black animate-[eqbar_0.9s_ease-in-out_infinite] [animation-delay:-0.2s]" style={{ height: '70%' }} />
                                        <span className="w-[2px] origin-bottom bg-black animate-[eqbar_0.9s_ease-in-out_infinite]" style={{ height: '55%' }} />
                                      </span>
                                    ) : (
                                      <Play className="mx-auto h-3 w-3" />
                                    )
                                  ) : (
                                    i + 1
                                  )}
                                </span>
                                <img
                                  src={`https://i.ytimg.com/vi/${v.videoId}/default.jpg`}
                                  alt=""
                                  loading="lazy"
                                  className="h-9 w-12 shrink-0 rounded-md border-2 border-black object-cover"
                                />
                                <span className={`flex-1 truncate text-xs font-medium ${isCurrent ? 'font-bold' : 'text-stone-700'}`}>
                                  {v.title || v.videoId}
                                </span>
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )
                })()}

                {/* Add to playlist */}
                <div className="rounded-2xl border-4 border-black bg-white p-3 shadow-base">
                  <div className="flex items-center gap-2">
                    <ListMusic className="h-4 w-4 shrink-0 text-stone-400" />
                    <span className="text-sm font-bold">{t.addToPlaylistLabel}</span>
                    <Select
                      key={addSelectKey}
                      onValueChange={(value) => {
                        if (value === '__new__') {
                          const name = prompt(t.newPlaylistTitle + ':')
                          if (name?.trim()) {
                            const id = createPlaylist(name.trim())
                            addToPlaylist(id, videoId, currentTitle)
                          }
                        } else {
                          addToPlaylist(value, videoId, currentTitle)
                        }
                        setAddSelectKey((k) => k + 1)
                      }}
                    >
                      <SelectTrigger className="h-8 w-44 rounded-xl border-2 border-black bg-white text-xs">
                        <SelectValue placeholder={t.selectPlaylist} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-2 border-black bg-white">
                        {playlists.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="__new__">
                          {t.createNewPlaylist}
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
        <aside className="sticky top-[68px] hidden h-[calc(100vh-84px)] shrink-0 flex-col overflow-hidden rounded-2xl border-2 border-black bg-[#FFE8CD] shadow-base xl:flex xl:w-[180px]">
          <div className="border-b-2 border-black px-3 py-2.5 text-center">
            <p className="text-xs font-bold">Sponsors</p>
          </div>
          <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto p-2.5">
            {[
              { href: 'https://www.headshotpro.com/?via=2fa3d0', logo: '/hsp_logo.png', name: 'HeadshotPro', desc: 'Professional business headshots, without a physical photo shoot' },
              { href: 'https://lookaway.com/?via=timon', logo: '/lookaway_logo.png', name: 'LookAway', desc: 'App for smart breaks & posture nudges for healthy screen habits' },
              { href: 'https://datafa.st/?via=t31kx', logo: '/datafast_logo.png', name: 'DataFast', desc: 'Revenue-first analytics. Understand which marketing channels actually bring paying customers' },
              { href: 'https://refer.testimonial.to/timon-wong', logo: '/testimonialto_logo.svg', name: 'Testimonial', desc: 'Collect text & video testimonials from your customers in minutes — no dev needed' },
            ].map((ad) => (
              <a
                key={ad.href}
                href={ad.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[120px] flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-black bg-white px-3 py-4 text-center transition-all hover:bg-stone-50"
              >
                <img src={ad.logo} alt={ad.name} className="h-6 w-auto" />
                <p className="text-xs font-bold leading-tight">{ad.name}</p>
                <p className="text-[10px] leading-snug text-stone-500">{ad.desc}</p>
              </a>
            ))}
            {[0, 1].map((i) => (
              <button
                key={i}
                onClick={() => { setSponsorOpen(true); setSponsorSubmitted(false); setSponsorEmail(''); setSponsorLink('') }}
                className="flex min-h-[120px] w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-black/30 px-3 py-4 text-center transition-colors hover:border-black"
              >
                <span className="text-2xl">📢</span>
                <p className="text-xs font-bold leading-tight text-stone-400">Your ad here</p>
                <p className="text-[10px] leading-snug text-stone-400">Sponsor us →</p>
              </button>
            ))}
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
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  Company
                </p>
                <div className="flex flex-col gap-1">
                  {[
                    ['/about', 'About'],
                    ['/contact', 'Contact'],
                    ['/privacy', 'Privacy'],
                    ['/terms', 'Terms'],
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
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  More Tools
                </p>
                <div className="flex flex-col gap-1">
                  <a
                    href="https://profilepicture.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-stone-600 hover:text-black hover:underline"
                  >
                    ProfilePicture.ai
                  </a>
                  <a
                    href="https://calorieasy.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-stone-600 hover:text-black hover:underline"
                  >
                    Calorieasy.app
                  </a>
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

      {/* SidebarMenu moved into navbar */}

      {/* Add to playlist dialog */}
      <Dialog open={!!addToPlaylistTarget} onOpenChange={(v) => { if (!v) setAddToPlaylistTarget(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t.addToPlaylist}</DialogTitle>
          </DialogHeader>
          {addToPlaylistTarget && (
            <div className="flex flex-col gap-1 pt-1">
              {playlists.length === 0 && (
                <p className="text-sm text-stone-500">{t.noPlaylistsYet}</p>
              )}
              {playlists.map((p) => {
                const already = p.videos.some((v) => v.videoId === addToPlaylistTarget.videoId)
                return (
                  <button
                    key={p.id}
                    disabled={already}
                    onClick={() => {
                      addToPlaylist(p.id, addToPlaylistTarget.videoId, addToPlaylistTarget.title)
                      setAddToPlaylistTarget(null)
                    }}
                    className="flex w-full items-center gap-3 rounded-xl border-2 border-black px-3 py-2 text-sm font-bold transition-all hover:bg-bg disabled:opacity-40"
                  >
                    <span>{p.emoji || '🎵'}</span>
                    <span className="flex-1 truncate text-left">{p.name}</span>
                    {already && <Check className="h-3.5 w-3.5 shrink-0 text-stone-400" />}
                  </button>
                )
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

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
              <p className="text-center text-sm font-bold">
                Thanks for the suggestion!
              </p>
              <p className="text-center text-xs text-stone-500">
                We read every request.
              </p>
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
                    body: JSON.stringify({ message: featureText.trim(), variant: 'feature_request' }),
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
                {featureSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Submit'
                )}
              </button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={sponsorOpen} onOpenChange={setSponsorOpen}>
        <DialogContent className="rounded-2xl border-2 border-black bg-white shadow-none sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              Sponsor YouTube on Loop
            </DialogTitle>
          </DialogHeader>
          {sponsorSubmitted ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-black bg-main">
                <Check className="h-6 w-6" />
              </div>
              <p className="text-center text-sm font-bold">
                Thanks! We&apos;ll be in touch.
              </p>
              <p className="text-center text-xs text-stone-500">
                We&apos;ll email you with our traffic stats and payment details.
              </p>
            </div>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                if (!sponsorEmail.trim() || !sponsorLink.trim()) return
                setSponsorSubmitting(true)
                try {
                  await fetch(`${API_URL}/yol/feature-request`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: `Email: ${sponsorEmail.trim()}\nProduct: ${sponsorLink.trim()}`, variant: 'sponsor' }),
                  })
                  setSponsorSubmitted(true)
                } catch {
                  setSponsorSubmitted(true)
                } finally {
                  setSponsorSubmitting(false)
                }
              }}
              className="flex flex-col gap-3 pt-1"
            >
              <p className="text-xs text-stone-500">
                Get your product in front of thousands of music lovers. We&apos;ll email you with our traffic stats and payment details.
              </p>
              <input
                type="email"
                value={sponsorEmail}
                onChange={(e) => setSponsorEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full rounded-xl border-2 border-black px-3 py-2 text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-main"
                autoFocus
              />
              <input
                type="url"
                value={sponsorLink}
                onChange={(e) => setSponsorLink(e.target.value)}
                placeholder="https://yourproduct.com"
                required
                className="w-full rounded-xl border-2 border-black px-3 py-2 text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-main"
              />
              <button
                type="submit"
                disabled={!sponsorEmail.trim() || !sponsorLink.trim() || sponsorSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-black bg-main py-2.5 text-sm font-bold transition-all hover:opacity-90 active:translate-x-[1px] active:translate-y-[1px] disabled:opacity-50"
              >
                {sponsorSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Submit'
                )}
              </button>
            </form>
          )}
        </DialogContent>
      </Dialog>

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
                  value="Adjust playback speed from 0.25× to 2× in 0.05× steps."
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
                    { keys: ['+'], description: 'Speed up +0.05×' },
                    { keys: ['-'], description: 'Speed down −0.05×' },
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
  addToPlaylist,
  onPlay,
  onPlayFromPlaylist,
  onRemove,
  reorderVideos,
  renameVideo,
  isLoggedIn,
  publicMap,
  publishPlaylist,
  unpublishPlaylist,
  getLoopPoints,
  t,
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
  addToPlaylist: (playlistId: string, videoId: string, title?: string) => void
  onPlay: (videoId: string, title?: string) => void
  onPlayFromPlaylist: (playlistId: string, index: number, videoId: string, title?: string) => void
  onRemove: (videoId: string) => void
  reorderVideos: (playlistId: string, orderedVideoIds: string[]) => void
  renameVideo: (playlistId: string, videoId: string, newTitle: string) => void
  isLoggedIn: boolean
  publicMap: import('@/lib/use-public-playlists').PublicMap
  publishPlaylist: (
    playlist: import('@/lib/use-playlists').Playlist,
    loopPoints: Record<string, { start: string; end: string }>,
  ) => Promise<string | null>
  unpublishPlaylist: (playlistId: string) => Promise<boolean>
  getLoopPoints: () => Record<string, { start: string; end: string }>
  t: import('@/lib/translations').Translations
}) {
  // local UI state
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [shareOpenId, setShareOpenId] = useState<string | null>(null)
  const [shareBusy, setShareBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
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
  const [importOpen, setImportOpen] = useState(false)
  const [importUrl, setImportUrl] = useState('')
  const [importLoading, setImportLoading] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)

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
      <Tabs
        defaultValue="playlists"
        className="flex flex-1 flex-col overflow-hidden"
      >
        <TabsList className="grid w-full grid-cols-2 rounded-none border-b-2 border-black bg-transparent p-0 h-auto">
          <TabsTrigger
            value="playlists"
            className="rounded-none border-r-2 border-black py-2.5 text-xs font-bold data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=inactive]:text-stone-400"
            onClick={() => setActivePlaylistId(null)}
          >
            {t.playlists}
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="rounded-none py-2.5 text-xs font-bold data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=inactive]:text-stone-400"
          >
            {t.history}
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
                  {t.back}
                </button>
                <span className="min-w-0 flex-1 truncate text-xs font-bold text-stone-700">
                  {activePlaylist.name}
                </span>
                {confirmDeleteId === activePlaylist.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        deletePlaylist(activePlaylist.id)
                        setActivePlaylistId(null)
                        setConfirmDeleteId(null)
                      }}
                      className="rounded-lg bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white transition-colors hover:bg-red-600"
                    >
                      {t.deletePlaylist}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="rounded-lg px-1.5 py-0.5 text-[10px] text-stone-400 transition-colors hover:text-black"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        if (!isLoggedIn) {
                          alert(t.shareSignInPrompt)
                          return
                        }
                        setShareOpenId(shareOpenId === activePlaylist.id ? null : activePlaylist.id)
                        setCopied(false)
                      }}
                      className={`shrink-0 rounded-lg p-1 transition-colors ${
                        publicMap[activePlaylist.id]
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-stone-300 hover:bg-stone-100 hover:text-black'
                      }`}
                      title={publicMap[activePlaylist.id] ? t.shareManagePublic : t.share}
                    >
                      {publicMap[activePlaylist.id] ? (
                        <Globe className="h-3.5 w-3.5" />
                      ) : (
                        <Share2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(activePlaylist.id)}
                      className="shrink-0 rounded-lg p-1 text-stone-300 transition-colors hover:bg-red-50 hover:text-red-400"
                      title={t.deletePlaylist}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>

              {/* Share panel */}
              {shareOpenId === activePlaylist.id && (
                <div className="mx-2 mb-2 rounded-xl border-2 border-black bg-bg/50 p-2 text-xs">
                  {publicMap[activePlaylist.id] ? (
                    <>
                      <div className="mb-1.5 flex items-center gap-1 font-bold text-green-700">
                        <Globe className="h-3 w-3" /> {t.sharePublicNow}
                      </div>
                      <div className="flex items-center gap-1">
                        <input
                          readOnly
                          value={publicUrl(publicMap[activePlaylist.id].slug)}
                          onClick={(e) => (e.target as HTMLInputElement).select()}
                          className="min-w-0 flex-1 rounded border border-stone-300 bg-white px-1.5 py-1 text-[10px]"
                        />
                        <button
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(publicUrl(publicMap[activePlaylist.id].slug))
                              setCopied(true)
                              setTimeout(() => setCopied(false), 1500)
                            } catch {}
                          }}
                          className="shrink-0 rounded border border-black bg-main px-1.5 py-1 transition-all hover:translate-x-[1px] hover:translate-y-[1px]"
                          title={t.copyLink}
                        >
                          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                      <div className="mt-1.5 flex gap-1">
                        <button
                          disabled={shareBusy}
                          onClick={async () => {
                            setShareBusy(true)
                            await publishPlaylist(activePlaylist, getLoopPoints())
                            setShareBusy(false)
                          }}
                          className="flex-1 rounded border border-stone-300 bg-white px-1.5 py-1 text-[10px] hover:border-black disabled:opacity-50"
                        >
                          {shareBusy ? '…' : t.republish}
                        </button>
                        <button
                          disabled={shareBusy}
                          onClick={async () => {
                            setShareBusy(true)
                            await unpublishPlaylist(activePlaylist.id)
                            setShareBusy(false)
                            setShareOpenId(null)
                          }}
                          className="flex-1 rounded border border-stone-300 bg-white px-1.5 py-1 text-[10px] text-red-500 hover:border-red-400 disabled:opacity-50"
                        >
                          {t.unpublish}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="mb-1.5 text-stone-600">{t.shareIntro}</p>
                      <button
                        disabled={shareBusy || activePlaylist.videos.length === 0}
                        onClick={async () => {
                          setShareBusy(true)
                          await publishPlaylist(activePlaylist, getLoopPoints())
                          setShareBusy(false)
                        }}
                        className="w-full rounded border-2 border-black bg-main px-2 py-1 text-[11px] font-bold transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50"
                      >
                        {shareBusy ? '…' : activePlaylist.videos.length === 0 ? t.shareNeedsVideos : t.makePublic}
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Move to folder select */}
              {folders.length > 0 && (
                <div className="flex items-center gap-2 px-3 pb-2">
                  <span className="shrink-0 text-[10px] text-stone-400">
                    {t.folder}
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
                      <SelectItem value="none">{t.noFolder}</SelectItem>
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
                  {t.noSongsYet}
                </p>
              )}
              <DragDropContext
                onDragEnd={({ source, destination }) => {
                  if (!destination || source.index === destination.index) return
                  const reordered = [...activePlaylist.videos]
                  const [moved] = reordered.splice(source.index, 1)
                  reordered.splice(destination.index, 0, moved)
                  reorderVideos(activePlaylist.id, reordered.map((v) => v.videoId))
                }}
              >
                <Droppable droppableId="videos">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="space-y-1 px-1"
                    >
                      {activePlaylist.videos.map((v, idx) => (
                        <Draggable key={v.videoId} draggableId={v.videoId} index={idx}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              style={{ ...provided.draggableProps.style, opacity: snapshot.isDragging ? 0.7 : 1 }}
                              className="group flex items-center gap-2 rounded-xl px-2 py-1 transition-colors hover:bg-bg/50"
                            >
                              <div
                                {...provided.dragHandleProps}
                                className="shrink-0 cursor-grab text-stone-300 hover:text-stone-500 active:cursor-grabbing"
                              >
                                <GripVertical className="h-3 w-3" />
                              </div>
                              <img
                                src={`https://i.ytimg.com/vi/${v.videoId}/default.jpg`}
                                alt=""
                                className="h-8 w-11 shrink-0 rounded-lg object-cover opacity-70 transition-opacity group-hover:opacity-100"
                              />
                              {editingVideoId === v.videoId ? (
                                <form
                                  className="min-w-0 flex-1"
                                  onSubmit={(e) => {
                                    e.preventDefault()
                                    if (editingTitle.trim()) {
                                      renameVideo(activePlaylist.id, v.videoId, editingTitle.trim())
                                    }
                                    setEditingVideoId(null)
                                  }}
                                >
                                  <input
                                    autoFocus
                                    type="text"
                                    value={editingTitle}
                                    onChange={(e) => setEditingTitle(e.target.value)}
                                    onBlur={() => {
                                      if (editingTitle.trim()) {
                                        renameVideo(activePlaylist.id, v.videoId, editingTitle.trim())
                                      }
                                      setEditingVideoId(null)
                                    }}
                                    onKeyDown={(e) => { if (e.key === 'Escape') setEditingVideoId(null) }}
                                    className="w-full rounded-lg border border-stone-300 px-1.5 py-0.5 text-[11px] focus:border-black focus:outline-none"
                                  />
                                </form>
                              ) : (
                                <button
                                  onClick={() => onPlayFromPlaylist(activePlaylist.id, idx, v.videoId, v.title)}
                                  className="min-w-0 flex-1 text-left"
                                >
                                  <p className="truncate text-[11px] text-stone-600 transition-colors group-hover:text-black">
                                    {v.title || v.videoId}
                                  </p>
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setEditingVideoId(v.videoId)
                                  setEditingTitle(v.title || v.videoId)
                                }}
                                className="shrink-0 text-stone-300 opacity-0 transition-all hover:text-stone-500 group-hover:opacity-100"
                                title={t.renameSong}
                              >
                                <Pencil className="h-2.5 w-2.5" />
                              </button>
                              <button
                                onClick={() => removeFromPlaylist(activePlaylist.id, v.videoId)}
                                className="shrink-0 text-stone-300 opacity-0 transition-all hover:text-red-400 group-hover:opacity-100"
                              >
                                <X className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          ) : (
            /* LIST VIEW: folders + playlists */
            <div className="flex flex-col gap-0.5">
              {/* Action buttons */}
              <div className="flex gap-1.5 px-2 py-1.5">
                <button
                  onClick={() => {
                    setShowNewPlaylist(true)
                    setNewPlaylistName('')
                  }}
                  className="flex flex-1 items-center justify-center gap-1 rounded-xl border-2 border-dashed border-stone-300 py-1.5 text-xs text-stone-400 transition-colors hover:border-black hover:text-black"
                >
                  <Plus className="h-3 w-3" />
                  {t.newPlaylist}
                </button>
                <button
                  onClick={() => {
                    setImportOpen(true)
                    setImportUrl('')
                    setImportError(null)
                  }}
                  className="flex flex-1 items-center justify-center gap-1 rounded-xl border-2 border-dashed border-stone-300 py-1.5 text-xs text-stone-400 transition-colors hover:border-black hover:text-black"
                >
                  <Link className="h-3 w-3" />
                  {t.import}
                </button>
              </div>

              {/* Import playlist dialog */}
              <Dialog open={importOpen} onOpenChange={(v) => { setImportOpen(v); if (!v) setImportError(null) }}>
                <DialogContent className="max-w-sm">
                  <DialogHeader>
                    <DialogTitle>{t.importPlaylistTitle}</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col gap-3 pt-1">
                    <input
                      type="text"
                      value={importUrl}
                      onChange={(e) => { setImportUrl(e.target.value); setImportError(null) }}
                      placeholder={t.importPlaceholder}
                      className="w-full rounded-base border-2 border-black px-3 py-2 text-sm"
                    />
                    {importError && (
                      <p className="text-xs text-red-500">{importError}</p>
                    )}
                    <Button
                      disabled={importLoading || !importUrl.trim()}
                      onClick={async () => {
                        let playlistId: string | null = null
                        try {
                          const u = new URL(importUrl.trim())
                          playlistId = u.searchParams.get('list')
                        } catch {
                          if (/^PL[A-Za-z0-9_-]+$/.test(importUrl.trim())) {
                            playlistId = importUrl.trim()
                          }
                        }
                        if (!playlistId) {
                          setImportError(t.importInvalidUrl)
                          return
                        }
                        setImportLoading(true)
                        setImportError(null)
                        try {
                          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
                          const res = await fetch(`${API_URL}/yol/import-playlist?id=${encodeURIComponent(playlistId)}`)
                          const data = await res.json()
                          if (!res.ok) { setImportError(data.error || t.importFailed); return }
                          const name = `${t.importedOn} ${new Date().toLocaleDateString()}`
                          const id = createPlaylist(name)
                          for (const v of data.videos) {
                            addToPlaylist(id, v.videoId, v.title)
                          }
                          setImportOpen(false)
                          setActivePlaylistId(id)
                        } catch {
                          setImportError(t.importNetworkError)
                        } finally {
                          setImportLoading(false)
                        }
                      }}
                    >
                      {importLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t.import}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* New playlist dialog */}
              <Dialog
                open={showNewPlaylist}
                onOpenChange={(v) => {
                  setShowNewPlaylist(v)
                  if (!v) setNewPlaylistName('')
                }}
              >
                <DialogContent className="max-w-sm">
                  <DialogHeader>
                    <DialogTitle>{t.newPlaylistTitle}</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      if (!newPlaylistName.trim()) return
                      createPlaylist(newPlaylistName.trim())
                      setNewPlaylistName('')
                      setShowNewPlaylist(false)
                    }}
                    className="flex flex-col gap-3 pt-1"
                  >
                    <input
                      autoFocus
                      type="text"
                      value={newPlaylistName}
                      onChange={(e) => setNewPlaylistName(e.target.value)}
                      placeholder={t.playlistNamePlaceholder}
                      className="rounded-xl border-2 border-black px-3 py-2 text-sm placeholder-stone-400 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!newPlaylistName.trim()}
                      className="rounded-xl border-2 border-black bg-main py-2 text-sm font-bold transition-all hover:opacity-90 disabled:opacity-40"
                    >
                      {t.create}
                    </button>
                  </form>
                </DialogContent>
              </Dialog>

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
                  {t.noPlaylists}
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
    </div>
  )
}

// ── Sidebar menu — single button → dropdown to the right ─────────────────────
function SidebarMenu({
  isLoggedIn,
  user,
  login,
  loginWithEmail,
  register,
  logout,
  onExport,
  onImport,
  onHelp,
  onFeature,
  darkMode,
  onToggleDark,
  lang,
  setLang,
  t,
}: {
  isLoggedIn: boolean
  user: import('@/lib/use-auth').AuthUser | null
  login: () => void
  loginWithEmail: (email: string, password: string) => Promise<string | null>
  register: (email: string, password: string) => Promise<string | null>
  logout: () => void
  onExport: () => void
  onImport: (file: File) => void
  onHelp: () => void
  onFeature: () => void
  darkMode: boolean
  onToggleDark: () => void
  lang: Lang
  setLang: (l: Lang) => void
  t: import('@/lib/translations').Translations
}) {
  const [open, setOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [dataOpen, setDataOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [pos, setPos] = useState({ top: 0, right: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (
        !dropRef.current?.contains(e.target as Node) &&
        !btnRef.current?.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleToggle = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right })
    }
    setOpen((v) => !v)
  }

  // Keep dropdown aligned if window resizes
  useEffect(() => {
    if (!open || !btnRef.current) return
    const update = () => {
      const rect = btnRef.current!.getBoundingClientRect()
      setPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right })
    }
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [open])

  async function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const err =
      authMode === 'login'
        ? await loginWithEmail(email, password)
        : await register(email, password)
    setLoading(false)
    if (err) {
      setError(err)
      return
    }
    setAuthOpen(false)
    setEmail('')
    setPassword('')
  }

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleToggle}
        className="flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl border-2 border-black bg-white pl-2.5 pr-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-main hover:shadow-none"
        title={t.settings}
      >
        <Settings className="h-4 w-4 shrink-0" />
        <span className="text-sm font-bold">{t.settings}</span>
      </button>

      {/* Dialog lives outside the portal so it persists when dropdown closes */}
      <Dialog
        open={authOpen}
        onOpenChange={(v) => {
          setAuthOpen(v)
          if (!v) {
            setError(null)
            setEmail('')
            setPassword('')
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {authMode === 'login' ? t.signIn : t.createAccount}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                login()
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-black px-3 py-2 text-sm font-bold transition-all hover:bg-bg"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {t.continueWithGoogle}
            </button>
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-stone-200" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                or
              </span>
              <div className="h-px flex-1 bg-stone-200" />
            </div>
          </div>
          <form onSubmit={handleAuthSubmit} className="flex flex-col gap-3">
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`flex-1 rounded-xl border-2 border-black py-1.5 text-xs font-bold transition-all ${authMode === 'login' ? 'bg-main' : 'hover:bg-bg'}`}
              >
                {t.signIn}
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={`flex-1 rounded-xl border-2 border-black py-1.5 text-xs font-bold transition-all ${authMode === 'register' ? 'bg-main' : 'hover:bg-bg'}`}
              >
                {t.register}
              </button>
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.email}
              required
              autoFocus
              className="rounded-xl border-2 border-black px-3 py-2 text-sm focus:outline-none"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.passwordMin}
              required
              minLength={6}
              className="rounded-xl border-2 border-black px-3 py-2 text-sm focus:outline-none"
            />
            {error && <p className="text-xs font-bold text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl border-2 border-black bg-main py-2 text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
            >
              {loading
                ? '…'
                : authMode === 'login'
                  ? t.signIn
                  : t.createAccount}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={dataOpen} onOpenChange={setDataOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.manageDataTitle}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-1">
            <div className="flex flex-col gap-1">
              <p className="text-xs text-stone-500">{t.exportDesc}</p>
              <button
                onClick={() => {
                  onExport()
                  setDataOpen(false)
                }}
                className="flex w-full items-center gap-2 rounded-xl border-2 border-black px-4 py-2.5 text-sm font-bold transition-all hover:bg-bg"
              >
                <Download className="h-4 w-4 shrink-0" />
                {t.exportBackup}
              </button>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs text-stone-500">{t.importDesc}</p>
              <label className="flex w-full cursor-pointer items-center gap-2 rounded-xl border-2 border-black px-4 py-2.5 text-sm font-bold transition-all hover:bg-bg">
                <Upload className="h-4 w-4 shrink-0" />
                {t.importBackup}
                <input
                  ref={fileRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) {
                      onImport(f)
                      setDataOpen(false)
                    }
                    e.target.value = ''
                  }}
                />
              </label>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={dropRef}
            style={{ top: pos.top, right: pos.right }}
            className="fixed z-50 w-48 overflow-hidden rounded-2xl border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="p-2">
              {isLoggedIn ? (
                <>
                  <p className="flex items-center gap-1.5 px-2 py-1.5 text-sm font-bold text-stone-500">
                    <Hand className="h-3.5 w-3.5 shrink-0 animate-wave" />
                    Hi, {user?.name?.split(' ')[0] || user?.email}
                  </p>
                  <button
                    onClick={() => {
                      logout()
                      setOpen(false)
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-xs font-bold transition-all hover:bg-stone-100"
                  >
                    <LogOut className="h-4 w-4 shrink-0 text-stone-500" />
                    {t.signOut}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setAuthOpen(true)
                    setOpen(false)
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-xs font-bold transition-all hover:bg-stone-100"
                >
                  <User className="h-4 w-4 shrink-0 text-stone-500" />
                  {t.logIn}
                </button>
              )}
              <button
                onClick={() => {
                  setDataOpen(true)
                  setOpen(false)
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-xs font-bold transition-all hover:bg-stone-100"
              >
                <Download className="h-4 w-4 shrink-0 text-stone-500" />
                {t.manageData}
              </button>
              <button
                onClick={() => {
                  onHelp()
                  setOpen(false)
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-xs font-bold transition-all hover:bg-stone-100"
              >
                <HelpCircle className="h-4 w-4 shrink-0 text-stone-500" />
                {t.helpShortcuts}
              </button>
              <button
                onClick={() => {
                  onFeature()
                  setOpen(false)
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-xs font-bold transition-all hover:bg-stone-100"
              >
                <Lightbulb className="h-4 w-4 shrink-0 text-stone-500" />
                {t.featureRequests}
              </button>
              <button
                onClick={onToggleDark}
                className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-xs font-bold transition-all hover:bg-stone-100"
              >
                {darkMode ? (
                  <Sun className="h-4 w-4 shrink-0 text-stone-500" />
                ) : (
                  <Moon className="h-4 w-4 shrink-0 text-stone-500" />
                )}
                {darkMode ? t.lightMode : t.darkMode}
              </button>
              <div className="mt-1 border-t border-stone-100 pt-1">
                <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-stone-400">{t.language}</p>
                <div className="flex gap-1 px-2">
                  {(['en', 'de', 'ja', 'fr'] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLang(l)}
                      className={`flex-1 rounded-lg py-1 text-xs font-bold transition-all ${lang === l ? 'bg-main border-2 border-black' : 'border-2 border-stone-200 hover:border-black'}`}
                    >
                      {l === 'en' ? '🇺🇸' : l === 'de' ? '🇩🇪' : l === 'ja' ? '🇯🇵' : '🇫🇷'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
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
