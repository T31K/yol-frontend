'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Play, Pause, SkipBack, SkipForward, Save, Check } from 'lucide-react'
import type { PublicVideo } from './page'

interface YTPlayer {
  playVideo: () => void
  pauseVideo: () => void
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  getCurrentTime: () => number
  getDuration: () => number
  destroy: () => void
}

interface YTPlayerEvent {
  data: number
}

interface PublicPlaylist {
  slug: string
  name: string
  emoji?: string | null
  videos: PublicVideo[]
}

export default function PublicPlaylistPlayer({ playlist }: { playlist: PublicPlaylist }) {
  const router = useRouter()
  const [activeIdx, setActiveIdx] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [apiReady, setApiReady] = useState(false)
  const [savedState, setSavedState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const playerRef = useRef<YTPlayer | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const activeIdxRef = useRef(0)

  const activeVideo = playlist.videos[activeIdx]

  useEffect(() => {
    activeIdxRef.current = activeIdx
  }, [activeIdx])

  // Load YT iframe API
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setApiReady(true)
      return
    }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.body.appendChild(tag)
    window.onYouTubeIframeAPIReady = () => setApiReady(true)
  }, [])

  const onPlayerStateChange = useCallback((event: YTPlayerEvent) => {
    if (event.data === 0) {
      // ended → loop the same video using its loop points
      const v = playlist.videos[activeIdxRef.current]
      const start = v?.loopStart ? parseInt(v.loopStart) : 0
      playerRef.current?.seekTo(start, true)
      playerRef.current?.playVideo()
    }
    if (event.data === 1) setIsPlaying(true)
    if (event.data === 2) setIsPlaying(false)
  }, [playlist.videos])

  // Build / rebuild player when active video changes or API ready
  useEffect(() => {
    if (!apiReady || !containerRef.current || !activeVideo) return
    if (playerRef.current) {
      playerRef.current.destroy()
      playerRef.current = null
    }
    const start = activeVideo.loopStart ? parseInt(activeVideo.loopStart) : 0
    const end = activeVideo.loopEnd ? parseInt(activeVideo.loopEnd) : undefined

    playerRef.current = new window.YT.Player(containerRef.current, {
      videoId: activeVideo.videoId,
      playerVars: {
        autoplay: 0,
        start,
        end,
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
      },
      events: { onStateChange: onPlayerStateChange },
    })

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy()
        playerRef.current = null
      }
    }
  }, [apiReady, activeVideo, onPlayerStateChange])

  const togglePlay = () => {
    if (isPlaying) playerRef.current?.pauseVideo()
    else playerRef.current?.playVideo()
  }

  const playIdx = (idx: number) => {
    if (idx < 0 || idx >= playlist.videos.length) return
    setActiveIdx(idx)
  }

  const prev = () => playIdx(activeIdx - 1)
  const next = () => playIdx(activeIdx + 1)

  const handleSave = () => {
    if (savedState !== 'idle') return
    setSavedState('saving')
    try {
      // Merge into local playlists
      const STORAGE_KEY = 'yol-playlists'
      const LOOP_KEY = 'yol-loop-points'
      type Stored = { id: string; name: string; emoji?: string; createdAt: number; videos: { videoId: string; title?: string; addedAt: number }[] }
      const raw = localStorage.getItem(STORAGE_KEY)
      const existing: Stored[] = raw ? JSON.parse(raw) : []
      const newPlaylist: Stored = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: playlist.name,
        emoji: playlist.emoji || undefined,
        createdAt: Date.now(),
        videos: playlist.videos.map((v) => ({
          videoId: v.videoId,
          title: v.title,
          addedAt: Date.now(),
        })),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify([newPlaylist, ...existing]))

      // Merge loop points (don't overwrite existing personal points)
      const lpRaw = localStorage.getItem(LOOP_KEY)
      const loopPoints: Record<string, { start: string; end: string }> = lpRaw ? JSON.parse(lpRaw) : {}
      for (const v of playlist.videos) {
        if (loopPoints[v.videoId]) continue
        if (v.loopStart || v.loopEnd) {
          loopPoints[v.videoId] = { start: v.loopStart || '', end: v.loopEnd || '' }
        }
      }
      localStorage.setItem(LOOP_KEY, JSON.stringify(loopPoints))

      setSavedState('saved')
      setTimeout(() => router.push('/'), 800)
    } catch (e) {
      console.error('Save failed', e)
      setSavedState('idle')
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Player + controls */}
      <div className="md:col-span-2 space-y-3">
        <div className="overflow-hidden rounded-base border-4 border-black bg-black shadow-base">
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <div ref={containerRef} className="absolute left-0 top-0 h-full w-full" />
          </div>
        </div>

        <div className="rounded-base border-4 border-black bg-white p-3 shadow-base">
          <div className="flex items-center justify-between gap-3">
            <p className="min-w-0 flex-1 truncate text-sm font-heading">
              {activeVideo?.title || activeVideo?.videoId}
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <Button variant="neutral" size="icon" onClick={prev} title="Previous" className="h-10 w-10" disabled={activeIdx === 0}>
                <SkipBack className="h-5 w-5" />
              </Button>
              <Button variant="default" size="icon" onClick={togglePlay} title={isPlaying ? 'Pause' : 'Play'} className="h-12 w-12">
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="ml-1 h-6 w-6" />}
              </Button>
              <Button variant="neutral" size="icon" onClick={next} title="Next" className="h-10 w-10" disabled={activeIdx >= playlist.videos.length - 1}>
                <SkipForward className="h-5 w-5" />
              </Button>
            </div>
          </div>
          {(activeVideo?.loopStart || activeVideo?.loopEnd) && (
            <p className="mt-2 text-xs font-base text-gray-500">
              Looping {activeVideo.loopStart || '0'}s → {activeVideo.loopEnd || 'end'}s
            </p>
          )}
        </div>

        {/* Save CTA */}
        <button
          onClick={handleSave}
          disabled={savedState !== 'idle'}
          className="w-full rounded-base border-4 border-black bg-main px-6 py-3 font-heading shadow-base transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none disabled:opacity-70 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-base"
        >
          {savedState === 'saved' ? (
            <span className="inline-flex items-center gap-2"><Check className="h-5 w-5" /> Saved! Opening app…</span>
          ) : savedState === 'saving' ? (
            'Saving…'
          ) : (
            <span className="inline-flex items-center gap-2"><Save className="h-5 w-5" /> Save to my playlists</span>
          )}
        </button>
      </div>

      {/* Sidebar — track list */}
      <div className="rounded-base border-4 border-black bg-white p-3 shadow-base">
        <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-stone-500">
          Up next ({playlist.videos.length})
        </p>
        <div className="max-h-[480px] space-y-1 overflow-y-auto">
          {playlist.videos.map((v, i) => (
            <button
              key={v.videoId}
              onClick={() => playIdx(i)}
              className={`flex w-full items-center gap-2 rounded-lg p-1.5 text-left transition-colors ${
                i === activeIdx ? 'bg-main' : 'hover:bg-stone-100'
              }`}
            >
              <img
                src={`https://i.ytimg.com/vi/${v.videoId}/default.jpg`}
                alt=""
                className="h-9 w-12 shrink-0 rounded object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-heading">{v.title || v.videoId}</p>
                {(v.loopStart || v.loopEnd) && (
                  <p className="truncate text-[10px] text-stone-500">
                    {v.loopStart || '0'}s → {v.loopEnd || 'end'}s
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
