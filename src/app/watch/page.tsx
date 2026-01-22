'use client'

import { useState, useRef, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'
import Image from 'next/image'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Gauge,
  RefreshCw,
  Loader2
} from 'lucide-react'

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

const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

function WatchContent() {
  const searchParams = useSearchParams()
  const videoId = searchParams.get('v')
  const startParam = searchParams.get('t') || searchParams.get('start') || ''

  const [loopCount, setLoopCount] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [startTime, setStartTime] = useState(startParam)
  const [endTime, setEndTime] = useState('')
  const [apiReady, setApiReady] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const playerRef = useRef<YTPlayer | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

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
    let interval: NodeJS.Timeout | null = null
    if (isPlaying && playerRef.current) {
      interval = setInterval(() => {
        if (playerRef.current) {
          setCurrentTime(playerRef.current.getCurrentTime?.() || 0)
          setDuration(playerRef.current.getDuration?.() || 0)
        }
      }, 500)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying])

  // Handle video state changes
  const onPlayerStateChange = useCallback((event: YTPlayerEvent) => {
    if (event.data === 0) { // ENDED
      setLoopCount(prev => prev + 1)
      const start = startTime ? parseInt(startTime) : 0
      playerRef.current?.seekTo(start, true)
      playerRef.current?.playVideo()
    }
    if (event.data === 1) { // PLAYING
      setIsPlaying(true)
    }
    if (event.data === 2) { // PAUSED
      setIsPlaying(false)
    }
  }, [startTime])

  const onPlayerReady = useCallback(() => {
    if (playerRef.current) {
      setDuration(playerRef.current.getDuration?.() || 0)
      playerRef.current.setPlaybackRate(playbackSpeed)
    }
  }, [playbackSpeed])

  // Create player when video ID is available
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
  }, [apiReady, videoId, startTime, endTime, onPlayerStateChange, onPlayerReady])

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

  // No video ID provided
  if (!videoId) {
    return (
      <main className="min-h-screen bg-bg p-4 md:p-8 flex flex-col items-center justify-center bg-[linear-gradient(to_right,#ffffff55_1px,transparent_1px),linear-gradient(to_bottom,#ffffff55_1px,transparent_1px)] bg-[size:70px_70px]">
        <Link href="/" className="mb-8">
          <Image
            src="/logo.webp"
            alt="YouTubeOnLoop"
            width={200}
            height={57}
            className="h-14 w-auto"
          />
        </Link>
        <div className="bg-white border-4 border-black shadow-base p-8 md:p-12 rounded-base text-center max-w-lg">
          <div className="text-6xl mb-4">🔗</div>
          <h1 className="text-2xl font-heading mb-4">No Video ID Found</h1>
          <p className="text-gray-600 font-base mb-6">
            Replace <code className="bg-bg px-2 py-1 rounded border border-black">youtube.com</code> with <code className="bg-main px-2 py-1 rounded border border-black">youtubeonloop.com</code> in any YouTube URL to loop it!
          </p>
          <div className="bg-bg border-2 border-black p-4 rounded-base text-left mb-6">
            <p className="text-sm font-mono break-all">
              <span className="text-gray-500">youtube.com</span>/watch?v=VIDEO_ID
              <br />
              ↓
              <br />
              <span className="text-main font-bold">youtubeonloop.com</span>/watch?v=VIDEO_ID
            </p>
          </div>
          <Link href="/">
            <Button size="lg">
              Go to Homepage
            </Button>
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-bg p-4 md:p-8 bg-[linear-gradient(to_right,#ffffff55_1px,transparent_1px),linear-gradient(to_bottom,#ffffff55_1px,transparent_1px)] bg-[size:70px_70px]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Image
              src="/logo.webp"
              alt="YouTubeOnLoop"
              width={160}
              height={45}
              className="h-10 md:h-12 w-auto"
            />
          </Link>
          <h1 className="sr-only">Watch & Loop Video - YouTubeOnLoop</h1>
          <div className="bg-main border-4 border-black shadow-base px-4 py-2 rounded-base">
            <span className="font-heading flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Looping Mode
            </span>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex flex-wrap gap-4 justify-center mb-4">
          <div
            className="bg-main border-4 border-black shadow-base px-6 py-3 rounded-base cursor-pointer hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all"
            onClick={resetLoopCount}
            title="Click to reset"
          >
            <span className="font-heading text-xl flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Loop Count: <span className="text-2xl font-bold">{loopCount}</span>
            </span>
          </div>
          <div className="bg-white border-4 border-black shadow-base px-6 py-3 rounded-base">
            <span className="font-heading text-xl flex items-center gap-2">
              {isPlaying ? <Play className="w-5 h-5 fill-current" /> : <Pause className="w-5 h-5" />}
              {isPlaying ? 'Playing' : 'Paused'}
            </span>
          </div>
          <div className="bg-white border-4 border-black shadow-base px-6 py-3 rounded-base">
            <span className="font-heading text-lg">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Video Container */}
        <div className="bg-black border-4 border-black shadow-base rounded-base overflow-hidden">
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <div
              ref={containerRef}
              className="absolute top-0 left-0 w-full h-full"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white border-4 border-black shadow-base p-4 rounded-base mt-4">
          <div className="flex items-center justify-between">
            {/* Spacer for centering */}
            <div className="w-24 hidden md:block" />

            {/* Center controls */}
            <div className="flex items-center gap-2 md:gap-3">
              <Button
                variant="neutral"
                size="icon"
                onClick={skipBack}
                title="Back 10s"
                className="w-12 h-12"
              >
                <SkipBack className="w-5 h-5" />
              </Button>

              <Button
                variant="default"
                size="icon"
                onClick={togglePlay}
                title={isPlaying ? 'Pause' : 'Play'}
                className="w-14 h-14"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-1" />
                )}
              </Button>

              <Button
                variant="neutral"
                size="icon"
                onClick={skipForward}
                title="Forward 10s"
                className="w-12 h-12"
              >
                <SkipForward className="w-5 h-5" />
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
              <SelectTrigger className="w-24 h-12 border-2 border-black bg-white">
                <Gauge className="w-4 h-4" />
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

          {/* Loop section controls */}
          <div className="mt-4 pt-4 border-t-2 border-black flex flex-wrap gap-4 items-center justify-center">
            <div className="flex items-center gap-2">
              <label className="font-heading text-sm">Start (sec):</label>
              <input
                type="number"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="0"
                min="0"
                className="w-20 px-2 py-1 border-2 border-black rounded-base text-center"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="font-heading text-sm">End (sec):</label>
              <input
                type="number"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="∞"
                min="0"
                className="w-20 px-2 py-1 border-2 border-black rounded-base text-center"
              />
            </div>
          </div>
        </div>

        {/* Tip */}
        <div className="bg-yellow-300 border-4 border-black shadow-base p-4 rounded-base rotate-[0.5deg] mt-4">
          <p className="font-heading text-sm">
            💡 <strong>Pro tip:</strong> Bookmark this page to quickly loop this video anytime!
          </p>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <p className="text-sm text-gray-600 font-base">
            Made with ❤️ for endless loops
          </p>
        </footer>
      </div>
    </main>
  )
}

function LoadingState() {
  return (
    <main className="min-h-screen bg-bg p-4 md:p-8 flex items-center justify-center bg-[linear-gradient(to_right,#ffffff55_1px,transparent_1px),linear-gradient(to_bottom,#ffffff55_1px,transparent_1px)] bg-[size:70px_70px]">
      <div className="bg-white border-4 border-black shadow-base p-8 rounded-base text-center">
        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
        <p className="font-heading text-lg">Loading video...</p>
      </div>
    </main>
  )
}

export default function WatchPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <WatchContent />
    </Suspense>
  )
}
