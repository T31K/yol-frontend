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
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
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

// Window.YT is declared globally in src/app/page.tsx
declare const window: Window & {
  YT: { Player: new (element: HTMLElement, options: object) => YTPlayer }
  onYouTubeIframeAPIReady: () => void
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

export default function YoutubeRepeatPage() {
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
  const { upsert } = useLoopHistory()

  useEffect(() => {
    if (window.YT && window.YT.Player) { setApiReady(true); return }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.getElementsByTagName('script')[0].parentNode?.insertBefore(tag, document.getElementsByTagName('script')[0])
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
    return () => { if (timeUpdateRef.current) clearInterval(timeUpdateRef.current) }
  }, [isPlaying])

  const onPlayerStateChange = useCallback((event: YTPlayerEvent) => {
    if (event.data === 0) {
      setLoopCount((prev) => {
        const next = prev + 1
        if (videoId) upsert(videoId, next)
        return next
      })
      const start = startTime ? parseInt(startTime) : 0
      playerRef.current?.seekTo(start, true)
      playerRef.current?.playVideo()
    }
    if (event.data === 1) setIsPlaying(true)
    if (event.data === 2) setIsPlaying(false)
  }, [startTime, videoId, upsert])

  const onPlayerReady = useCallback(() => {
    if (playerRef.current) {
      setDuration(playerRef.current.getDuration?.() || 0)
      playerRef.current.setPlaybackRate(playbackSpeed)
    }
  }, [playbackSpeed])

  useEffect(() => {
    if (!apiReady || !videoId || !containerRef.current) return
    if (playerRef.current) playerRef.current.destroy()

    const start = startTime ? parseInt(startTime) : 0
    const end = endTime ? parseInt(endTime) : undefined

    playerRef.current = new window.YT.Player(containerRef.current, {
      videoId,
      playerVars: { autoplay: 1, start, end, rel: 0, modestbranding: 1, playsinline: 1 },
      events: { onStateChange: onPlayerStateChange, onReady: onPlayerReady },
    })

    return () => {
      if (playerRef.current) { playerRef.current.destroy(); playerRef.current = null }
    }
  }, [apiReady, videoId, startTime, endTime, onPlayerStateChange, onPlayerReady])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const id = extractVideoId(url)
    if (id) {
      if (id === videoId) {
        setLoopCount(0)
        playerRef.current?.seekTo(startTime ? parseInt(startTime) : 0, true)
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
    if (playerRef.current) { playerRef.current.destroy(); playerRef.current = null }
    setVideoId(null); setUrl(''); setLoopCount(0); setIsPlaying(false)
    setStartTime(''); setEndTime(''); setCurrentTime(0); setDuration(0)
  }

  const togglePlay = () => { isPlaying ? playerRef.current?.pauseVideo() : playerRef.current?.playVideo() }
  const skipBack = () => playerRef.current?.seekTo(Math.max(0, (playerRef.current?.getCurrentTime() || 0) - 10), true)
  const skipForward = () => playerRef.current?.seekTo((playerRef.current?.getCurrentTime() || 0) + 10, true)

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <main className="min-h-screen bg-white bg-[linear-gradient(to_right,#00000018_1px,transparent_1px),linear-gradient(to_bottom,#00000018_1px,transparent_1px)] bg-[size:45px_45px] p-4 md:p-8">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-8 text-center md:mb-10">
          <Link href="/" className="mb-4 inline-block">
            <Image src="/logo.webp" alt="YouTubeOnLoop" width={780} height={400} className="h-16 w-auto md:h-20" priority />
          </Link>
          <h1 className="text-3xl font-heading tracking-tight md:text-4xl">
            YouTube Repeat — Loop Any Video Instantly
          </h1>
          <p className="mt-2 text-lg font-base md:text-xl">
            Paste a YouTube link to put it on repeat. Or replace{' '}
            <code className="rounded border border-gray-400 bg-bg/60 px-1.5 py-0.5">youtube.com</code>{' '}
            with{' '}
            <code className="rounded border border-gray-400 bg-bg/60 px-1.5 py-0.5">youtubeonloop.com</code>{' '}
            in any URL.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="rounded-base border-4 border-black bg-white p-4 shadow-base md:p-6">
            <div className="flex flex-col items-center gap-4 md:flex-row">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste YouTube URL here..."
                className="w-full flex-1 rounded-base border-4 border-black px-4 py-3 text-lg font-base focus:outline-none focus:ring-4 focus:ring-main"
              />
              <Button type="submit" size="lg" className="text-lg font-heading">
                <RefreshCw className="mr-2 h-5 w-5" />
                Repeat
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-heading">Start (sec):</label>
                <input type="number" value={startTime} onChange={(e) => setStartTime(e.target.value)} placeholder="0" min="0" className="w-20 rounded-base border-2 border-black px-2 py-1 text-center" />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-heading">End (sec):</label>
                <input type="number" value={endTime} onChange={(e) => setEndTime(e.target.value)} placeholder="∞" min="0" className="w-20 rounded-base border-2 border-black px-2 py-1 text-center" />
              </div>
              {videoId && (
                <Button type="button" variant="neutral" onClick={handleReset} className="ml-auto">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </form>

        {/* Player */}
        {videoId && (
          <div className="mb-10 space-y-4">
            <div className="flex flex-wrap justify-center gap-4">
              <div className="cursor-pointer rounded-base border-4 border-black bg-main px-6 py-3 shadow-base transition-all hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none" onClick={() => setLoopCount(0)} title="Click to reset">
                <span className="flex items-center gap-2 text-xl font-heading">
                  <RefreshCw className="h-5 w-5" />
                  Loop Count: <span className="text-2xl font-bold">{loopCount}</span>
                </span>
              </div>
              <div className="rounded-base border-4 border-black bg-white px-6 py-3 shadow-base">
                <span className="flex items-center gap-2 text-xl font-heading">
                  {isPlaying ? <Play className="h-5 w-5 fill-current" /> : <Pause className="h-5 w-5" />}
                  {isPlaying ? 'Playing' : 'Paused'}
                </span>
              </div>
              <div className="rounded-base border-4 border-black bg-white px-6 py-3 shadow-base">
                <span className="text-lg font-heading">{formatTime(currentTime)} / {formatTime(duration)}</span>
              </div>
            </div>

            <div className="overflow-hidden rounded-base border-4 border-black bg-black shadow-base">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <div ref={containerRef} className="absolute left-0 top-0 h-full w-full" />
              </div>
            </div>

            <div className="rounded-base border-4 border-black bg-white p-4 shadow-base">
              <div className="flex items-center justify-between">
                <div className="hidden w-24 md:block" />
                <div className="flex items-center gap-2 md:gap-3">
                  <Button variant="neutral" size="icon" onClick={skipBack} title="Back 10s" className="h-12 w-12"><SkipBack className="h-5 w-5" /></Button>
                  <Button variant="default" size="icon" onClick={togglePlay} title={isPlaying ? 'Pause' : 'Play'} className="h-14 w-14">
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="ml-1 h-6 w-6" />}
                  </Button>
                  <Button variant="neutral" size="icon" onClick={skipForward} title="Forward 10s" className="h-12 w-12"><SkipForward className="h-5 w-5" /></Button>
                </div>
                <Select value={playbackSpeed.toString()} onValueChange={(v) => { const s = parseFloat(v); setPlaybackSpeed(s); playerRef.current?.setPlaybackRate(s) }}>
                  <SelectTrigger className="h-12 w-24 border-2 border-black bg-white"><Gauge className="h-4 w-4" /><SelectValue /></SelectTrigger>
                  <SelectContent className="border-2 border-black bg-white">
                    {PLAYBACK_SPEEDS.map((s) => <SelectItem key={s} value={s.toString()}>{s}x</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rotate-[0.5deg] rounded-base border-4 border-black bg-yellow-300 p-4 shadow-base">
              <p className="text-sm font-heading">
                💡 <strong>Tip:</strong> Set start/end times to repeat just one section. Great for practicing a guitar riff or memorizing a phrase.
              </p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!videoId && (
          <div className="mb-10 rounded-base border-4 border-black bg-white p-8 text-center shadow-base md:p-12">
            <div className="mb-4 text-6xl">🔁</div>
            <h2 className="mb-2 text-2xl font-heading">Paste any YouTube URL above</h2>
            <p className="font-base text-gray-600">It will play on repeat automatically — no settings needed.</p>
          </div>
        )}

        {/* How it works */}
        <div className="mb-6 rounded-base border-4 border-black bg-white p-6 shadow-base">
          <h2 className="mb-4 text-2xl font-heading">How to Put a YouTube Video on Repeat</h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-base border-2 border-black bg-main font-heading text-lg">1</span>
              <div>
                <p className="font-heading">Copy any YouTube URL</p>
                <p className="text-sm font-base text-gray-600">Open a YouTube video and copy the link from your browser&apos;s address bar.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-base border-2 border-black bg-main font-heading text-lg">2</span>
              <div>
                <p className="font-heading">Paste it above — or swap the domain</p>
                <p className="text-sm font-base text-gray-600">
                  Paste the URL and hit Repeat. Or just replace <code className="rounded border border-gray-300 bg-gray-100 px-1 text-xs">youtube.com</code> with <code className="rounded border border-black bg-main/30 px-1 text-xs">youtubeonloop.com</code> directly in the URL bar.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-base border-2 border-black bg-main font-heading text-lg">3</span>
              <div>
                <p className="font-heading">Video loops forever</p>
                <p className="text-sm font-base text-gray-600">The video repeats automatically. Use Start/End times to loop a specific section.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Use cases */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-base border-4 border-black bg-white p-4 shadow-base">
            <p className="mb-1 text-lg font-heading">🎸 Musicians</p>
            <p className="text-sm font-base text-gray-600">Loop a riff or solo to practice it bar by bar.</p>
          </div>
          <div className="rounded-base border-4 border-black bg-white p-4 shadow-base">
            <p className="mb-1 text-lg font-heading">🗣 Language Learners</p>
            <p className="text-sm font-base text-gray-600">Repeat a dialogue or phrase until your pronunciation is perfect.</p>
          </div>
          <div className="rounded-base border-4 border-black bg-white p-4 shadow-base">
            <p className="mb-1 text-lg font-heading">🎧 Music Fans</p>
            <p className="text-sm font-base text-gray-600">That one song you can&apos;t stop listening to? Loop it without touching anything.</p>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-6 rounded-base border-4 border-black bg-white p-6 shadow-base">
          <h2 className="mb-4 text-2xl font-heading">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-heading">Does YouTube have a built-in repeat button?</h3>
              <p className="mt-1 text-sm font-base text-gray-600">
                YouTube has a right-click &quot;Loop&quot; option on desktop, but it&apos;s buried and unavailable on mobile. YouTubeOnLoop works on all devices and gives you more control — like looping a specific time range.
              </p>
            </div>
            <div>
              <h3 className="font-heading">How do I repeat a YouTube video on my phone?</h3>
              <p className="mt-1 text-sm font-base text-gray-600">
                Open the video on YouTube, copy the URL, then paste it here. Or just change <code className="rounded border border-gray-300 bg-gray-100 px-1 text-xs">youtube.com</code> to <code className="rounded border border-black bg-main/30 px-1 text-xs">youtubeonloop.com</code> in your mobile browser.
              </p>
            </div>
            <div>
              <h3 className="font-heading">Can I loop just a part of a video?</h3>
              <p className="mt-1 text-sm font-base text-gray-600">
                Yes. Use the Start and End fields (in seconds) to set a specific section. The player will repeat only that segment — useful for music practice or language study.
              </p>
            </div>
            <div>
              <h3 className="font-heading">Is this free?</h3>
              <p className="mt-1 text-sm font-base text-gray-600">
                Completely free. No account, no subscription, no ads on the player.
              </p>
            </div>
            <div>
              <h3 className="font-heading">What happened to ListenOnRepeat?</h3>
              <p className="mt-1 text-sm font-base text-gray-600">
                ListenOnRepeat.com is currently offline — DNS resolves to nothing. YouTubeOnLoop is the best working alternative with the same URL-swap trick and full loop controls.{' '}
                <Link href="/listenonrepeat-alternative" className="font-heading underline decoration-2 underline-offset-2 hover:text-main">
                  Read more about the ListenOnRepeat alternative →
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Popular loops */}
        <div className="mb-8 rounded-base border-4 border-black bg-[#FFECD2] p-6 shadow-base">
          <h2 className="mb-3 text-xl font-heading">Popular Loops to Try</h2>
          <div className="flex flex-wrap gap-2">
            <Link href="/loop/bohemian-rhapsody" className="rounded-base border-2 border-black bg-white px-3 py-1 text-sm font-heading shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">Bohemian Rhapsody</Link>
            <Link href="/loop/blinding-lights" className="rounded-base border-2 border-black bg-white px-3 py-1 text-sm font-heading shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">Blinding Lights</Link>
            <Link href="/loop/lofi-hip-hop-radio" className="rounded-base border-2 border-black bg-white px-3 py-1 text-sm font-heading shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">Lo-fi Radio</Link>
            <Link href="/loop/despacito" className="rounded-base border-2 border-black bg-white px-3 py-1 text-sm font-heading shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">Despacito</Link>
            <Link href="/loop/shape-of-you" className="rounded-base border-2 border-black bg-white px-3 py-1 text-sm font-heading shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">Shape of You</Link>
            <Link href="/loop" className="rounded-base border-2 border-black bg-main px-3 py-1 text-sm font-heading shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">Browse all →</Link>
          </div>
        </div>

        <footer className="mt-8 text-center">
          <Link href="/" className="text-sm font-heading underline hover:text-main">← Back to YouTubeOnLoop</Link>
          <p className="mt-2 text-sm font-base text-gray-500">Made with ❤️ for endless loops</p>
        </footer>

      </div>
    </main>
  )
}
