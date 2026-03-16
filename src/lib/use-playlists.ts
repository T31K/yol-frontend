'use client'

import { useState, useEffect, useCallback } from 'react'

export interface PlaylistVideo {
  videoId: string
  title?: string
  addedAt: number
}

export interface Playlist {
  id: string
  name: string
  createdAt: number
  videos: PlaylistVideo[]
}

const STORAGE_KEY = 'yol-playlists'

function load(): Playlist[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function save(playlists: Playlist[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(playlists))
}

export function usePlaylists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([])

  useEffect(() => {
    setPlaylists(load())
  }, [])

  const createPlaylist = useCallback((name: string): string => {
    const playlist: Playlist = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: name.trim(),
      createdAt: Date.now(),
      videos: [],
    }
    setPlaylists((prev) => {
      const next = [playlist, ...prev]
      save(next)
      return next
    })
    return playlist.id
  }, [])

  const deletePlaylist = useCallback((id: string) => {
    setPlaylists((prev) => {
      const next = prev.filter((p) => p.id !== id)
      save(next)
      return next
    })
  }, [])

  const addToPlaylist = useCallback((playlistId: string, videoId: string, title?: string) => {
    setPlaylists((prev) => {
      const next = prev.map((p) => {
        if (p.id !== playlistId) return p
        if (p.videos.some((v) => v.videoId === videoId)) return p
        return { ...p, videos: [...p.videos, { videoId, title, addedAt: Date.now() }] }
      })
      save(next)
      return next
    })
  }, [])

  const removeFromPlaylist = useCallback((playlistId: string, videoId: string) => {
    setPlaylists((prev) => {
      const next = prev.map((p) => {
        if (p.id !== playlistId) return p
        return { ...p, videos: p.videos.filter((v) => v.videoId !== videoId) }
      })
      save(next)
      return next
    })
  }, [])

  return { playlists, createPlaylist, deletePlaylist, addToPlaylist, removeFromPlaylist }
}
