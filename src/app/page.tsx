'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
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
} from 'lucide-react'
import Image from 'next/image'
import { useLoopHistory } from '@/lib/use-loop-history'

// YouTube IFrame API types
interface YTPlayer {
  playVideo: () => void
  pauseVideo: () => void
  stopVideo: () => void
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  mute: () => void
  unMute: () => void
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
    mute?: number
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
  const playerRef = useRef<YTPlayer | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const timeUpdateRef = useRef<NodeJS.Timeout | null>(null)
  const { history, upsert, remove, clear } = useLoopHistory()

  // Load YouTube IFrame API
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setApiReady(true)
      return
    }

    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

    window.onYouTubeIframeAPIReady = () => {
      setApiReady(true)
    }
  }, [])

  // Update current time
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
      if (timeUpdateRef.current) {
        clearInterval(timeUpdateRef.current)
      }
    }
  }, [isPlaying])

  // Handle video state changes
  const onPlayerStateChange = useCallback(
    (event: YTPlayerEvent) => {
      if (event.data === 0) {
        // ENDED
        setLoopCount((prev) => {
          const next = prev + 1
          if (videoId) upsert(videoId, next)
          return next
        })
        const start = startTime ? parseInt(startTime) : 0
        playerRef.current?.seekTo(start, true)
        playerRef.current?.playVideo()
      }
      if (event.data === 1) {
        // PLAYING
        setIsPlaying(true)
      }
      if (event.data === 2) {
        // PAUSED
        setIsPlaying(false)
      }
    },
    [startTime, videoId, upsert],
  )

  const onPlayerReady = useCallback(() => {
    if (playerRef.current) {
      setDuration(playerRef.current.getDuration?.() || 0)
      playerRef.current.setPlaybackRate(playbackSpeed)
    }
  }, [playbackSpeed])

  // Create player when video ID changes
  useEffect(() => {
    if (!apiReady || !videoId || !containerRef.current) return

    if (playerRef.current) {
      playerRef.current.destroy()
    }

    const start = startTime ? parseInt(startTime) : 0
    const end = endTime ? parseInt(endTime) : undefined

    playerRef.current = new window.YT.Player(containerRef.current, {
      videoId: videoId,
      playerVars: {
        autoplay: 1,
        start: start,
        end: end,
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
      },
      events: {
        onStateChange: onPlayerStateChange,
        onReady: onPlayerReady,
      },
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const id = extractVideoId(url)
    if (id) {
      if (id === videoId) {
        setLoopCount(0)
        const start = startTime ? parseInt(startTime) : 0
        playerRef.current?.seekTo(start, true)
        playerRef.current?.playVideo()
      } else {
        setVideoId(id)
        setLoopCount(0)
        setIsPlaying(true)
        upsert(id, 0)
      }
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

  // Control functions
  const togglePlay = () => {
    if (isPlaying) {
      playerRef.current?.pauseVideo()
    } else {
      playerRef.current?.playVideo()
    }
  }

  const skipBack = () => {
    const current = playerRef.current?.getCurrentTime() || 0
    playerRef.current?.seekTo(Math.max(0, current - 10), true)
  }

  const skipForward = () => {
    const current = playerRef.current?.getCurrentTime() || 0
    playerRef.current?.seekTo(current + 10, true)
  }

  const resetLoopCount = () => {
    setLoopCount(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <main className="min-h-screen bg-white bg-[linear-gradient(to_right,#00000018_1px,transparent_1px),linear-gradient(to_bottom,#00000018_1px,transparent_1px)] bg-[size:45px_45px] p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center md:mb-12">
          <div className="mb-4 inline-block">
            <Image
              src="/logo.webp"
              alt="YouTubeOnLoop - Loop Any YouTube Video"
              width={780}
              height={400}
              className="h-16 w-auto md:h-20"
              priority
            />
          </div>
          <h1 className="text-3xl font-heading tracking-tight md:text-4xl">
            Play any Youtube video on loop
          </h1>
          <p className="mt-2 text-lg font-base md:text-xl">
            Paste a YouTube link or just replace youtube.com with{' '}
            <code className="rounded border border-gray-400 bg-bg/60 px-1.5 py-0.5">
              youtubeonloop.com
            </code>{' '}
            in any YouTube URL
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="rounded-base border-4 border-black bg-white p-4 shadow-base md:p-6">
            <div className="flex flex-col items-center gap-4 md:flex-row md:items-center">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste YouTube URL here..."
                className="w-full flex-1 rounded-base border-4 border-black px-4 py-3 text-lg font-base focus:outline-none focus:ring-4 focus:ring-main"
              />
              <Button type="submit" size="lg" className="text-lg font-heading">
                <Play className="mr-2 h-5 w-5" />
                Play & Repeat
              </Button>
            </div>

            {/* Optional time controls */}
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-heading">Start (sec):</label>
                <input
                  type="number"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-20 rounded-base border-2 border-black px-2 py-1 text-center"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-heading">End (sec):</label>
                <input
                  type="number"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  placeholder="∞"
                  min="0"
                  className="w-20 rounded-base border-2 border-black px-2 py-1 text-center"
                />
              </div>
              {videoId && (
                <Button
                  type="button"
                  variant="neutral"
                  onClick={handleReset}
                  className="ml-auto"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </form>

        {/* Video Player */}
        {videoId && (
          <div className="space-y-4">
            {/* Stats Bar */}
            <div className="flex flex-wrap justify-center gap-4">
              <div
                className="cursor-pointer rounded-base border-4 border-black bg-main px-6 py-3 shadow-base transition-all hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none"
                onClick={resetLoopCount}
                title="Click to reset"
              >
                <span className="flex items-center gap-2 text-xl font-heading">
                  <RefreshCw className="h-5 w-5" />
                  Loop Count:{' '}
                  <span className="text-2xl font-bold">{loopCount}</span>
                </span>
              </div>
              <div className="rounded-base border-4 border-black bg-white px-6 py-3 shadow-base">
                <span className="flex items-center gap-2 text-xl font-heading">
                  {isPlaying ? (
                    <Play className="h-5 w-5 fill-current" />
                  ) : (
                    <Pause className="h-5 w-5" />
                  )}
                  {isPlaying ? 'Playing' : 'Paused'}
                </span>
              </div>
              <div className="rounded-base border-4 border-black bg-white px-6 py-3 shadow-base ">
                <span className="text-lg font-heading">
                  <span className="inline-block min-w-12">
                    {formatTime(currentTime)}{' '}
                  </span>
                  / {formatTime(duration)}
                </span>
              </div>
            </div>

            {/* Video Container */}
            <div className="overflow-hidden rounded-base border-4 border-black bg-black shadow-base">
              <div
                className="relative w-full"
                style={{ paddingBottom: '56.25%' }}
              >
                <div
                  ref={containerRef}
                  className="absolute left-0 top-0 h-full w-full"
                />
              </div>
            </div>

            {/* Controls */}
            <div className="rounded-base border-4 border-black bg-white p-4 shadow-base">
              <div className="flex items-center justify-between">
                {/* Spacer for centering */}
                <div className="hidden w-24 md:block" />

                {/* Center controls */}
                <div className="flex items-center gap-2 md:gap-3">
                  <Button
                    variant="neutral"
                    size="icon"
                    onClick={skipBack}
                    title="Back 10s"
                    className="h-12 w-12"
                  >
                    <SkipBack className="h-5 w-5" />
                  </Button>

                  <Button
                    variant="default"
                    size="icon"
                    onClick={togglePlay}
                    title={isPlaying ? 'Pause' : 'Play'}
                    className="h-14 w-14"
                  >
                    {isPlaying ? (
                      <Pause className="h-6 w-6" />
                    ) : (
                      <Play className="ml-1 h-6 w-6" />
                    )}
                  </Button>

                  <Button
                    variant="neutral"
                    size="icon"
                    onClick={skipForward}
                    title="Forward 10s"
                    className="h-12 w-12"
                  >
                    <SkipForward className="h-5 w-5" />
                  </Button>
                </div>

                {/* Speed Select - Right */}
                <Select
                  value={playbackSpeed.toString()}
                  onValueChange={(value) => {
                    const speed = parseFloat(value)
                    setPlaybackSpeed(speed)
                    playerRef.current?.setPlaybackRate(speed)
                  }}
                >
                  <SelectTrigger className="h-12 w-24 border-2 border-black bg-white">
                    <Gauge className="h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-2 border-black bg-white">
                    {PLAYBACK_SPEEDS.map((speed) => (
                      <SelectItem key={speed} value={speed.toString()}>
                        {speed}x
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tips */}
            <div className="rotate-[0.5deg] rounded-base border-4 border-black bg-yellow-300 p-4 shadow-base">
              <p className="text-sm font-heading">
                💡 <strong>Tip:</strong> Click the loop counter to reset it. Use
                start/end times to repeat a specific section!
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!videoId && (
          <div className="rounded-base border-4 border-black bg-white p-8 text-center shadow-base md:p-12">
            <div className="mb-4 text-6xl">📺</div>
            <h2 className="mb-2 text-2xl font-heading">No video yet</h2>
            <p className="font-base text-gray-600">
              Paste a YouTube URL above to start looping!
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <span className="rounded-base border-2 border-black bg-bg px-3 py-1 text-sm">
                youtube.com/watch?v=...
              </span>
              <span className="rounded-base border-2 border-black bg-bg px-3 py-1 text-sm">
                youtu.be/...
              </span>
              <span className="rounded-base border-2 border-black bg-bg px-3 py-1 text-sm">
                Video ID
              </span>
            </div>
          </div>
        )}

        {/* Loop History */}
        {history.length > 0 && (
          <div className="mt-8 rounded-base border-4 border-black bg-white p-4 shadow-base md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-heading">Recently Looped</h2>
              <Button
                variant="neutral"
                size="sm"
                onClick={clear}
                className="text-xs"
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Clear All
              </Button>
            </div>
            <div className="space-y-2">
              {history.map((item) => (
                <div
                  key={item.videoId}
                  className="flex items-center gap-3 rounded-base border-2 border-black p-2 transition-all hover:bg-bg"
                >
                  <img
                    src={`https://i.ytimg.com/vi/${item.videoId}/default.jpg`}
                    alt=""
                    className="h-12 w-16 shrink-0 rounded border border-black object-cover"
                  />
                  <button
                    onClick={() => {
                      setUrl(`https://youtube.com/watch?v=${item.videoId}`)
                      setVideoId(item.videoId)
                      setLoopCount(0)
                      setIsPlaying(true)
                    }}
                    className="flex-1 text-left text-sm font-base text-gray-700 hover:text-black truncate"
                  >
                    {item.videoId}
                  </button>
                  <div className="flex shrink-0 items-center gap-1 rounded-base border-2 border-black bg-main px-2 py-1">
                    <RefreshCw className="h-3 w-3" />
                    <span className="text-sm font-heading">{item.loopCount}</span>
                  </div>
                  <button
                    onClick={() => remove(item.videoId)}
                    className="shrink-0 rounded p-1 text-gray-400 hover:bg-red-100 hover:text-red-600"
                    title="Remove"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12">
          <div className="mb-6 rounded-base border-4 border-black bg-[#FFECD2] p-4 shadow-base">
            <p className="mb-3 text-center text-sm font-heading">Popular uses</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="/for/guitar-practice"
                className="rounded-base border-2 border-black bg-white px-3 py-1 text-sm font-heading shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              >
                🎸 Guitar Practice
              </a>
              <a
                href="/for/language-learning"
                className="rounded-base border-2 border-black bg-white px-3 py-1 text-sm font-heading shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              >
                🗣 Language Learning
              </a>
              <a
                href="/listenonrepeat-alternative"
                className="rounded-base border-2 border-black bg-white px-3 py-1 text-sm font-heading shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              >
                🔁 ListenOnRepeat Alternative
              </a>
            </div>
            <p className="mb-2 mt-4 text-center text-sm font-heading">Popular loops</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="/loop/bohemian-rhapsody" className="rounded-base border-2 border-black bg-white px-3 py-1 text-sm font-heading shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">Bohemian Rhapsody</a>
              <a href="/loop/despacito" className="rounded-base border-2 border-black bg-white px-3 py-1 text-sm font-heading shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">Despacito</a>
              <a href="/loop/blinding-lights" className="rounded-base border-2 border-black bg-white px-3 py-1 text-sm font-heading shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">Blinding Lights</a>
              <a href="/loop/lofi-hip-hop-radio" className="rounded-base border-2 border-black bg-white px-3 py-1 text-sm font-heading shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">Lo-fi Radio</a>
              <a href="/loop/shape-of-you" className="rounded-base border-2 border-black bg-white px-3 py-1 text-sm font-heading shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">Shape of You</a>
              <a href="/loop/dynamite" className="rounded-base border-2 border-black bg-white px-3 py-1 text-sm font-heading shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">Dynamite</a>
              <a href="/loop" className="rounded-base border-2 border-black bg-main px-3 py-1 text-sm font-heading shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">Browse all →</a>
            </div>
          </div>
          <p className="text-center text-sm font-base text-gray-600">
            Made with ❤️ for endless loops
          </p>
        </footer>
      </div>
    </main>
  )
}
