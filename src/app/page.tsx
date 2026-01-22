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
  RotateCcw
} from 'lucide-react'
import Image from 'next/image'

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
  }, [apiReady, videoId, startTime, endTime, onPlayerStateChange, onPlayerReady])

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
    <main className="min-h-screen bg-white p-4 md:p-8 bg-[linear-gradient(to_right,#00000018_1px,transparent_1px),linear-gradient(to_bottom,#00000018_1px,transparent_1px)] bg-[size:45px_45px]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-block mb-4">
            <Image
              src="/logo.webp"
              alt="YouTubeOnLoop - Loop Any YouTube Video"
              width={780}
              height={400}
              className="h-16 md:h-20 w-auto"
              priority
              />
          </div>
          <h1 className="text-3xl md:text-4xl font-heading tracking-tight">Play any Youtube video on loop</h1>
          <p className="text-lg md:text-xl font-base mt-2">
            Paste a YouTube link or just replace youtube.com with <code className="bg-bg/60 px-1.5 py-0.5 rounded border border-gray-400">youtubeonloop.com</code> in any YouTube URL
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="bg-white border-4 border-black shadow-base p-4 md:p-6 rounded-base">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste YouTube URL here..."
                className="flex-1 px-4 py-3 text-lg border-4 border-black rounded-base focus:outline-none focus:ring-4 focus:ring-main font-base"
              />
              <Button type="submit" size="lg" className="text-lg font-heading">
                <Play className="w-5 h-5 mr-2" />
                Play & Repeat
              </Button>
            </div>

            {/* Optional time controls */}
            <div className="mt-4 flex flex-wrap gap-4 items-center">
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
              {videoId && (
                <Button
                  type="button"
                  variant="neutral"
                  onClick={handleReset}
                  className="ml-auto"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
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
            <div className="flex flex-wrap gap-4 justify-center">
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
              <div className="bg-white border-4 border-black shadow-base px-6 py-3 rounded-base ">
                <span className="font-heading text-lg">
                  <span className='inline-block min-w-12'>{formatTime(currentTime)} </span>/ {formatTime(duration)}
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
            <div className="bg-white border-4 border-black shadow-base p-4 rounded-base">
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
            </div>

            {/* Tips */}
            <div className="bg-yellow-300 border-4 border-black shadow-base p-4 rounded-base rotate-[0.5deg]">
              <p className="font-heading text-sm">
                💡 <strong>Tip:</strong> Click the loop counter to reset it. Use start/end times to repeat a specific section!
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!videoId && (
          <div className="bg-white border-4 border-black shadow-base p-8 md:p-12 rounded-base text-center">
            <div className="text-6xl mb-4">📺</div>
            <h2 className="text-2xl font-heading mb-2">No video yet</h2>
            <p className="text-gray-600 font-base">
              Paste a YouTube URL above to start looping!
            </p>
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              <span className="bg-bg border-2 border-black px-3 py-1 rounded-base text-sm">
                youtube.com/watch?v=...
              </span>
              <span className="bg-bg border-2 border-black px-3 py-1 rounded-base text-sm">
                youtu.be/...
              </span>
              <span className="bg-bg border-2 border-black px-3 py-1 rounded-base text-sm">
                Video ID
              </span>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center">
          <p className="text-sm text-gray-600 font-base">
            Made with ❤️ for endless loops
          </p>
        </footer>
      </div>
    </main>
  )
}
