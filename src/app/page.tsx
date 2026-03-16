'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
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
} from 'lucide-react'
import Image from 'next/image'
import { useLoopHistory } from '@/lib/use-loop-history'
import { usePlaylists } from '@/lib/use-playlists'
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

export default function Home() {
  const [url, setUrl] = useState('')
  const [videoId, setVideoId] = useState<string | null>(null)
  const [loopCount, setLoopCount] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [apiReady, setApiReady] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [expandedPlaylist, setExpandedPlaylist] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const playerRef = useRef<YTPlayer | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const timeUpdateRef = useRef<NodeJS.Timeout | null>(null)
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null)
  const { history, upsert, remove, clear } = useLoopHistory()
  const {
    playlists,
    createPlaylist,
    deletePlaylist,
    addToPlaylist,
    removeFromPlaylist,
  } = usePlaylists()

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
        if (playerRef.current) {
          setCurrentTime(playerRef.current.getCurrentTime?.() || 0)
          setDuration(playerRef.current.getDuration?.() || 0)
        }
      }, 500)
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
        playerRef.current?.seekTo(startTime ? parseInt(startTime) : 0, true)
        playerRef.current?.playVideo()
      }
      if (event.data === 1) setIsPlaying(true)
      if (event.data === 2) setIsPlaying(false)
    },
    [startTime, videoId, upsert],
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
        start: startTime ? parseInt(startTime) : 0,
        end: endTime ? parseInt(endTime) : undefined,
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
  }, [
    apiReady,
    videoId,
    startTime,
    endTime,
    onPlayerStateChange,
    onPlayerReady,
  ])

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
          `http://localhost:3001/yol/search?q=${encodeURIComponent(url)}`,
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
  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${Math.floor(s % 60)
      .toString()
      .padStart(2, '0')}`

  return (
    <div className="min-h-screen bg-[#F7F2E8] bg-[linear-gradient(to_right,#DBA97922_1px,transparent_1px),linear-gradient(to_bottom,#DBA97922_1px,transparent_1px)] bg-[size:45px_45px]">
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
          <div className="flex items-center justify-between border-b-2 border-black px-4 py-3">
            <span className="text-base font-bold">Library</span>
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
            expandedPlaylist={expandedPlaylist}
            newPlaylistName={newPlaylistName}
            setNewPlaylistName={setNewPlaylistName}
            setExpandedPlaylist={setExpandedPlaylist}
            createPlaylist={createPlaylist}
            deletePlaylist={deletePlaylist}
            removeFromPlaylist={removeFromPlaylist}
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
          />
        </div>
      </aside>

      {/* ── THREE-COLUMN LAYOUT ───────────────────────────────────── */}
      <div className="flex min-h-screen w-full gap-4 px-4 py-4">
        {/* LEFT SIDEBAR — floating */}
        <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] shrink-0 flex-col overflow-hidden rounded-2xl border-2 border-black bg-white shadow-base lg:flex lg:w-[220px] xl:w-[260px]">
          <div className="flex items-center border-b-2 border-black px-4 py-3">
            <span className="text-base font-bold">Library</span>
          </div>
          <LibrarySidebar
            playlists={playlists}
            history={history}
            expandedPlaylist={expandedPlaylist}
            newPlaylistName={newPlaylistName}
            setNewPlaylistName={setNewPlaylistName}
            setExpandedPlaylist={setExpandedPlaylist}
            createPlaylist={createPlaylist}
            deletePlaylist={deletePlaylist}
            removeFromPlaylist={removeFromPlaylist}
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
          />
        </aside>

        {/* CENTER COLUMN */}
        <div className="flex min-w-0 flex-1 flex-col gap-4 p-6">
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
            {/* Mobile library toggle */}
            {/* ── HEADER ───────────────────────────────────────────────── */}
            <div className="px-4 pb-2 pt-8 text-center">
              <div className="mb-3 inline-block">
                <Image
                  src="/logo.webp"
                  alt="YouTubeOnLoop"
                  width={780}
                  height={400}
                  className="h-14 w-auto md:h-16"
                  priority
                />
              </div>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                Play any YouTube video on loop
              </h1>
              <p className="mt-1.5 text-sm text-stone-500 md:text-base">
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
                      Search for a song<br /><span className="inline-flex items-center gap-3 uppercase tracking-wider"><span className="inline-block h-px w-8 bg-stone-300"></span>or<span className="inline-block h-px w-8 bg-stone-300"></span></span><br />paste a YouTube link
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
                  {/* Center: playback buttons */}
                  <div className="flex items-center justify-center gap-2 px-4 py-3">
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

                  {/* Bottom row: loop count | start/end | speed */}
                  <div className="grid grid-cols-3 items-center px-4 py-2.5">
                    {/* Left: loop count */}
                    <div className="flex justify-start">
                      <div
                        className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border-2 border-black bg-main px-2.5 py-1.5 text-xs font-bold shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                        onClick={() => setLoopCount(0)}
                        title="Click to reset"
                      >
                        <RefreshCw className="h-3 w-3" />
                        {loopCount}x
                      </div>
                    </div>
                    {/* Center: start/end */}
                    <div className="flex items-end justify-center gap-3">
                      <div className="flex flex-col items-center gap-1">
                        <label className="text-xs font-bold text-stone-400">
                          Start
                        </label>
                        <Input
                          type="number"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          placeholder="0"
                          min="0"
                          className="h-10 w-20 text-center text-sm"
                        />
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <label className="text-xs font-bold text-stone-400">
                          End
                        </label>
                        <Input
                          type="number"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          placeholder="∞"
                          min="0"
                          className="h-10 w-20 text-center text-sm"
                        />
                      </div>
                    </div>
                    {/* Right: speed */}
                    <div className="flex justify-end">
                      <Select
                        value={playbackSpeed.toString()}
                        onValueChange={(v) => {
                          const s = parseFloat(v)
                          setPlaybackSpeed(s)
                          playerRef.current?.setPlaybackRate(s)
                        }}
                      >
                        <SelectTrigger className="h-10 w-32 rounded-xl border-2 border-black bg-white text-sm">
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
                  </div>
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
              </>
            )}
          </div>
          {/* end max-w-2xl */}
        </div>
        {/* end center */}

        {/* RIGHT ADS SIDEBAR — floating */}
        <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] shrink-0 flex-col overflow-hidden rounded-2xl border-2 border-black bg-[#E8EFCF] opacity-0 shadow-base xl:flex xl:w-[160px]">
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
    </div>
  )
}

// ── Shared sidebar content component ─────────────────────────────────────────
function LibrarySidebar({
  playlists,
  history,
  expandedPlaylist,
  newPlaylistName,
  setNewPlaylistName,
  setExpandedPlaylist,
  createPlaylist,
  deletePlaylist,
  removeFromPlaylist,
  clear,
  onPlay,
  onRemove,
}: {
  playlists: ReturnType<
    typeof import('@/lib/use-playlists').usePlaylists
  >['playlists']
  history: ReturnType<
    typeof import('@/lib/use-loop-history').useLoopHistory
  >['history']
  expandedPlaylist: string | null
  newPlaylistName: string
  setNewPlaylistName: (v: string) => void
  setExpandedPlaylist: (v: string | null) => void
  createPlaylist: (name: string) => string
  deletePlaylist: (id: string) => void
  removeFromPlaylist: (playlistId: string, videoId: string) => void
  clear: () => void
  onPlay: (videoId: string, title?: string) => void
  onRemove: (videoId: string) => void
}) {
  return (
    <div className="flex-1 overflow-y-auto">
      <Accordion type="multiple" defaultValue={['playlists', 'history']}>
        {/* Playlists */}
        <AccordionItem value="playlists" className="border-none shadow-none">
          <AccordionTrigger className="bg-transparent px-3 py-2 text-xs font-bold text-stone-600">
            <div className="flex w-full items-center justify-between pr-2">
              <span className="flex items-center gap-1.5">
                <ListMusic className="h-3 w-3" />
                Playlists
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setExpandedPlaylist('__new__')
                }}
                className="text-stone-400 transition-colors hover:text-black"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-1 pt-2">
            {expandedPlaylist === '__new__' && (
              <div className="mb-2">
                <input
                  autoFocus
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newPlaylistName.trim()) {
                      createPlaylist(newPlaylistName)
                      setNewPlaylistName('')
                      setExpandedPlaylist(null)
                    }
                    if (e.key === 'Escape') {
                      setExpandedPlaylist(null)
                      setNewPlaylistName('')
                    }
                  }}
                  placeholder="Playlist name…"
                  className="w-full rounded-xl border-2 border-black bg-bg/30 px-3 py-1.5 text-xs placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-main"
                />
              </div>
            )}
            {playlists.length === 0 && expandedPlaylist !== '__new__' && (
              <p className="py-1 text-xs text-stone-400">No playlists yet</p>
            )}
            <div className="space-y-0.5">
              {playlists.map((playlist) => (
                <div key={playlist.id}>
                  <div className="flex items-center rounded-xl transition-colors hover:bg-bg/50">
                    <button
                      onClick={() =>
                        setExpandedPlaylist(
                          expandedPlaylist === playlist.id ? null : playlist.id,
                        )
                      }
                      className="flex min-w-0 flex-1 items-center gap-2 px-2 py-1.5"
                    >
                      {expandedPlaylist === playlist.id ? (
                        <ChevronDown className="h-3 w-3 shrink-0 text-stone-400" />
                      ) : (
                        <ChevronRight className="h-3 w-3 shrink-0 text-stone-400" />
                      )}
                      <span className="truncate text-xs text-stone-700">
                        {playlist.name}
                      </span>
                      <span className="ml-auto shrink-0 text-[10px] text-stone-400">
                        {playlist.videos.length}
                      </span>
                    </button>
                    <button
                      onClick={() => deletePlaylist(playlist.id)}
                      className="px-2 py-1.5 text-stone-300 transition-colors hover:text-red-400"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  {expandedPlaylist === playlist.id && (
                    <div className="space-y-1 py-1 pl-2">
                      {playlist.videos.length === 0 && (
                        <p className="py-1 text-[10px] text-stone-400">Empty</p>
                      )}
                      {playlist.videos.map((v) => (
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
                              removeFromPlaylist(playlist.id, v.videoId)
                            }
                            className="shrink-0 text-stone-300 opacity-0 transition-all hover:text-red-400 group-hover:opacity-100"
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        <div className="border-y-2 border-black">
          {/* History */}
          <AccordionItem
            value="history"
            className="border-t-2 border-none shadow-none"
          >
            <AccordionTrigger className="bg-transparent px-3 py-2 text-xs font-bold text-stone-600">
              <div className="flex w-full items-center justify-between pr-2">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  History
                </span>
                {history.length > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      clear()
                    }}
                    className="text-[10px] normal-case tracking-normal text-stone-400 transition-colors hover:text-red-400"
                  >
                    Clear
                  </button>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-1 pt-2">
              {history.length === 0 && (
                <p className="py-1 text-xs text-stone-400">
                  Nothing looped yet
                </p>
              )}
              <div className="space-y-1">
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
            </AccordionContent>
          </AccordionItem>
        </div>
      </Accordion>
    </div>
  )
}
