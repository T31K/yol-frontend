'use client'

import { useState, useEffect, useCallback } from 'react'

export interface Folder {
  id: string
  name: string
  emoji?: string
  createdAt: number
  playlistIds: string[]
}

const STORAGE_KEY = 'yol-folders'

function load(): Folder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function save(folders: Folder[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(folders))
}

export function useFolders() {
  const [folders, setFolders] = useState<Folder[]>([])

  useEffect(() => {
    setFolders(load())
  }, [])

  const createFolder = useCallback((name: string): string => {
    const folder: Folder = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: name.trim(),
      createdAt: Date.now(),
      playlistIds: [],
    }
    setFolders((prev) => {
      const next = [folder, ...prev]
      save(next)
      return next
    })
    return folder.id
  }, [])

  const deleteFolder = useCallback((id: string) => {
    setFolders((prev) => {
      const next = prev.filter((f) => f.id !== id)
      save(next)
      return next
    })
  }, [])

  const moveToFolder = useCallback((playlistId: string, folderId: string | null) => {
    setFolders((prev) => {
      const next = prev.map((f) => ({
        ...f,
        playlistIds: f.playlistIds.filter((id) => id !== playlistId),
      }))
      if (folderId) {
        const idx = next.findIndex((f) => f.id === folderId)
        if (idx !== -1) next[idx] = { ...next[idx], playlistIds: [...next[idx].playlistIds, playlistId] }
      }
      save(next)
      return next
    })
  }, [])

  const reorderFolderPlaylists = useCallback((folderId: string, orderedIds: string[]) => {
    setFolders((prev) => {
      const next = prev.map((f) =>
        f.id === folderId ? { ...f, playlistIds: orderedIds } : f
      )
      save(next)
      return next
    })
  }, [])

  const reorderFolders = useCallback((orderedIds: string[]) => {
    setFolders((prev) => {
      const map = new Map(prev.map((f) => [f.id, f]))
      const next = orderedIds.map((id) => map.get(id)).filter(Boolean) as Folder[]
      prev.forEach((f) => { if (!next.find((n) => n.id === f.id)) next.push(f) })
      save(next)
      return next
    })
  }, [])

  const setFolderEmoji = useCallback((id: string, emoji: string) => {
    setFolders((prev) => {
      const next = prev.map((f) => (f.id === id ? { ...f, emoji } : f))
      save(next)
      return next
    })
  }, [])

  return { folders, createFolder, deleteFolder, moveToFolder, reorderFolderPlaylists, reorderFolders, setFolderEmoji }
}
