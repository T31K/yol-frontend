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
} from 'lucide-react'
import { useLoopHistory } from '@/lib/use-loop-history'

interface YTPlayer {
  playVideo: () => void
  pauseVideo: () => void
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  setPlaybackRate: (rate: number) => void
  getCurrentTime: () => number
  getDuration: () => number
  destroy: () => void
}

interface YTPlayerEvent {
  data: number
}

const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

export default function LoopPlayer({ videoId }: { videoId: string }) {
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
  const { upsert } = useLoopHistory(false)

  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setApiReady(true)
      return
    }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
    window.onYouTubeIframeAPIReady = () => setApiReady(true)
  }, [])

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

  const onPlayerStateChange = useCallback(
    (event: YTPlayerEvent) => {
      if (event.data === 0) {
        setLoopCount((prev) => {
          const next = prev + 1
          upsert(videoId, next)
          return next
        })
        const start = startTime ? parseInt(startTime) : 0
        playerRef.current?.seekTo(start, true)
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
      playerRef.current.setPlaybackRate(playbackSpeed)
    }
  }, [playbackSpeed])

  useEffect(() => {
    if (!apiReady || !containerRef.current) return
    if (playerRef.current) playerRef.current.destroy()

    const start = startTime ? parseInt(startTime) : 0
    const end = endTime ? parseInt(endTime) : undefined

    playerRef.current = new window.YT.Player(containerRef.current, {
      videoId,
      playerVars: {
        autoplay: 0,
        start,
        end,
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
      },
      events: { onStateChange: onPlayerStateChange, onReady: onPlayerReady },
    })

    upsert(videoId, 0)

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
    upsert,
  ])

  const togglePlay = () => {
    if (isPlaying) playerRef.current?.pauseVideo()
    else playerRef.current?.playVideo()
  }

  const skipBack = () => {
    const cur = playerRef.current?.getCurrentTime() || 0
    playerRef.current?.seekTo(Math.max(0, cur - 10), true)
  }

  const skipForward = () => {
    const cur = playerRef.current?.getCurrentTime() || 0
    playerRef.current?.seekTo(cur + 10, true)
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex flex-wrap justify-center gap-3">
        <div
          className="cursor-pointer rounded-base border-4 border-black bg-main px-5 py-2 shadow-base transition-all hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none"
          onClick={() => setLoopCount(0)}
          title="Click to reset"
        >
          <span className="flex items-center gap-2 text-lg font-heading">
            <RefreshCw className="h-4 w-4" />
            Loops: <span className="text-xl font-bold">{loopCount}</span>
          </span>
        </div>
        <div className="rounded-base border-4 border-black bg-white px-5 py-2 shadow-base">
          <span className="flex items-center gap-2 text-lg font-heading">
            {isPlaying ? (
              <Play className="h-4 w-4 fill-current" />
            ) : (
              <Pause className="h-4 w-4" />
            )}
            {isPlaying ? 'Playing' : 'Paused'}
          </span>
        </div>
        <div className="rounded-base border-4 border-black bg-white px-5 py-2 shadow-base">
          <span className="text-base font-heading">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Video */}
      <div className="overflow-hidden rounded-base border-4 border-black bg-black shadow-base">
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <div
            ref={containerRef}
            className="absolute left-0 top-0 h-full w-full"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="rounded-base border-4 border-black bg-white p-4 shadow-base">
        <div className="flex items-center justify-between">
          <div className="hidden w-24 md:block" />
          <div className="flex items-center gap-2 md:gap-3">
            <Button
              variant="neutral"
              size="icon"
              onClick={skipBack}
              title="Back 10s"
              className="h-11 w-11"
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button
              variant="default"
              size="icon"
              onClick={togglePlay}
              title={isPlaying ? 'Pause' : 'Play'}
              className="h-13 w-13"
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
              className="h-11 w-11"
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>
          <Select
            value={playbackSpeed.toString()}
            onValueChange={(v) => {
              const speed = parseFloat(v)
              setPlaybackSpeed(speed)
              playerRef.current?.setPlaybackRate(speed)
            }}
          >
            <SelectTrigger className="h-11 w-24 border-2 border-black bg-white">
              <Gauge className="h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-2 border-black bg-white">
              {PLAYBACK_SPEEDS.map((s) => (
                <SelectItem key={s} value={s.toString()}>
                  {s}x
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Time controls */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-4 border-t-2 border-black pt-3">
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
        </div>
      </div>
    </div>
  )
}
