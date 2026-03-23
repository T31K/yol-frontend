'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { getAuthToken, trigger401 } from './use-auth'

export interface PlaylistVideo {
  videoId: string
  title?: string
  addedAt: number
}

export interface Playlist {
  id: string
  name: string
  emoji?: string
  createdAt: number
  videos: PlaylistVideo[]
}

const STORAGE_KEY = 'yol-playlists'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const DEBOUNCE_MS = 500

function loadLocal(): Playlist[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveLocal(playlists: Playlist[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(playlists))
}

async function syncToServer(playlists: Playlist[]) {
  const token = getAuthToken()
  if (!token) return
  const res = await fetch(`${API_URL}/yol/sync/playlists`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ data: playlists }),
  })
  if (res.status === 401) trigger401()
}

export function usePlaylists(isLoggedIn: boolean) {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!isLoggedIn) {
      setPlaylists(loadLocal())
    }
  }, [isLoggedIn])

  const persist = useCallback((next: Playlist[]) => {
    if (isLoggedIn) {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => syncToServer(next), DEBOUNCE_MS)
    } else {
      saveLocal(next)
    }
  }, [isLoggedIn])

  const hydrate = useCallback((data: Playlist[]) => {
    setPlaylists(data)
  }, [])

  const flushSync = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
      syncToServer(playlists)
    }
  }, [playlists])

  const createPlaylist = useCallback((name: string): string => {
    const playlist: Playlist = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: name.trim(), createdAt: Date.now(), videos: [],
    }
    setPlaylists((prev) => { const next = [playlist, ...prev]; persist(next); return next })
    return playlist.id
  }, [persist])

  const deletePlaylist = useCallback((id: string) => {
    setPlaylists((prev) => { const next = prev.filter((p) => p.id !== id); persist(next); return next })
  }, [persist])

  const addToPlaylist = useCallback((playlistId: string, videoId: string, title?: string) => {
    setPlaylists((prev) => {
      const next = prev.map((p) => {
        if (p.id !== playlistId) return p
        if (p.videos.some((v) => v.videoId === videoId)) return p
        return { ...p, videos: [...p.videos, { videoId, title, addedAt: Date.now() }] }
      })
      persist(next)
      return next
    })
  }, [persist])

  const removeFromPlaylist = useCallback((playlistId: string, videoId: string) => {
    setPlaylists((prev) => {
      const next = prev.map((p) => {
        if (p.id !== playlistId) return p
        return { ...p, videos: p.videos.filter((v) => v.videoId !== videoId) }
      })
      persist(next)
      return next
    })
  }, [persist])

  const setPlaylistEmoji = useCallback((id: string, emoji: string) => {
    setPlaylists((prev) => { const next = prev.map((p) => (p.id === id ? { ...p, emoji } : p)); persist(next); return next })
  }, [persist])

  const reorderPlaylists = useCallback((orderedIds: string[]) => {
    setPlaylists((prev) => {
      const map = new Map(prev.map((p) => [p.id, p]))
      const next = orderedIds.map((id) => map.get(id)).filter(Boolean) as Playlist[]
      prev.forEach((p) => { if (!next.find((n) => n.id === p.id)) next.push(p) })
      persist(next)
      return next
    })
  }, [persist])

  return { playlists, setPlaylists: hydrate, flushSync, createPlaylist, deletePlaylist, addToPlaylist, removeFromPlaylist, reorderPlaylists, setPlaylistEmoji }
}
