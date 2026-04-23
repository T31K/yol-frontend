'use client'

import { useState, useEffect, useCallback } from 'react'
import { getAuthToken, trigger401 } from './use-auth'
import type { Playlist } from './use-playlists'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export interface PublicPlaylistRef {
  slug: string
  playlistId: string
  name: string
  emoji?: string | null
  updatedAt: string
}

export type PublicMap = Record<string, PublicPlaylistRef>

export function publicUrl(slug: string) {
  if (typeof window === 'undefined') return `https://youtubeonloop.com/p/${slug}`
  return `${window.location.origin}/p/${slug}`
}

export function usePublicPlaylists(isLoggedIn: boolean) {
  const [publicMap, setPublicMap] = useState<PublicMap>({})

  const refresh = useCallback(async () => {
    const token = getAuthToken()
    if (!token) return
    try {
      const res = await fetch(`${API_URL}/yol/public-playlists/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.status === 401) { trigger401(); return }
      if (!res.ok) return
      const list = (await res.json()) as PublicPlaylistRef[]
      const map: PublicMap = {}
      for (const item of list) map[item.playlistId] = item
      setPublicMap(map)
    } catch {}
  }, [])

  useEffect(() => {
    if (isLoggedIn) refresh()
    else setPublicMap({})
  }, [isLoggedIn, refresh])

  const publish = useCallback(
    async (
      playlist: Playlist,
      loopPoints: Record<string, { start: string; end: string }>,
    ): Promise<string | null> => {
      const token = getAuthToken()
      if (!token) return null
      const videos = playlist.videos.map((v) => {
        const pts = loopPoints[v.videoId]
        const out: { videoId: string; title?: string; loopStart?: string; loopEnd?: string } = {
          videoId: v.videoId,
        }
        if (v.title) out.title = v.title
        if (pts?.start) out.loopStart = pts.start
        if (pts?.end) out.loopEnd = pts.end
        return out
      })
      try {
        const res = await fetch(`${API_URL}/yol/public-playlists`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            playlistId: playlist.id,
            name: playlist.name,
            emoji: playlist.emoji,
            videos,
          }),
        })
        if (res.status === 401) { trigger401(); return null }
        if (!res.ok) return null
        const json = await res.json() as { slug: string }
        setPublicMap((prev) => ({
          ...prev,
          [playlist.id]: {
            slug: json.slug,
            playlistId: playlist.id,
            name: playlist.name,
            emoji: playlist.emoji,
            updatedAt: new Date().toISOString(),
          },
        }))
        return json.slug
      } catch {
        return null
      }
    },
    [],
  )

  const unpublish = useCallback(async (playlistId: string): Promise<boolean> => {
    const token = getAuthToken()
    if (!token) return false
    const ref = publicMap[playlistId]
    if (!ref) return false
    try {
      const res = await fetch(`${API_URL}/yol/public-playlists/${encodeURIComponent(ref.slug)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.status === 401) { trigger401(); return false }
      if (!res.ok) return false
      setPublicMap((prev) => {
        const next = { ...prev }
        delete next[playlistId]
        return next
      })
      return true
    } catch {
      return false
    }
  }, [publicMap])

  return { publicMap, refresh, publish, unpublish }
}
