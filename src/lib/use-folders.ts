'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { getAuthToken, trigger401 } from './use-auth'

export interface Folder {
  id: string
  name: string
  emoji?: string
  createdAt: number
  playlistIds: string[]
}

const STORAGE_KEY = 'yol-folders'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const DEBOUNCE_MS = 500

function loadLocal(): Folder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveLocal(folders: Folder[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(folders))
}

async function syncToServer(folders: Folder[]) {
  const token = getAuthToken()
  if (!token) return
  const res = await fetch(`${API_URL}/yol/sync/folders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ data: folders }),
  })
  if (res.status === 401) trigger401()
}

export function useFolders(isLoggedIn: boolean) {
  const [folders, setFolders] = useState<Folder[]>([])
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!isLoggedIn) setFolders(loadLocal())
  }, [isLoggedIn])

  const persist = useCallback((next: Folder[]) => {
    if (isLoggedIn) {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => syncToServer(next), DEBOUNCE_MS)
    } else {
      saveLocal(next)
    }
  }, [isLoggedIn])

  const hydrate = useCallback((data: Folder[]) => setFolders(data), [])

  const flushSync = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
      syncToServer(folders)
    }
  }, [folders])

  const createFolder = useCallback((name: string): string => {
    const folder: Folder = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: name.trim(), createdAt: Date.now(), playlistIds: [],
    }
    setFolders((prev) => { const next = [folder, ...prev]; persist(next); return next })
    return folder.id
  }, [persist])

  const deleteFolder = useCallback((id: string) => {
    setFolders((prev) => { const next = prev.filter((f) => f.id !== id); persist(next); return next })
  }, [persist])

  const moveToFolder = useCallback((playlistId: string, folderId: string | null) => {
    setFolders((prev) => {
      const next = prev.map((f) => ({ ...f, playlistIds: f.playlistIds.filter((id) => id !== playlistId) }))
      if (folderId) {
        const idx = next.findIndex((f) => f.id === folderId)
        if (idx !== -1) next[idx] = { ...next[idx], playlistIds: [...next[idx].playlistIds, playlistId] }
      }
      persist(next)
      return next
    })
  }, [persist])

  const reorderFolderPlaylists = useCallback((folderId: string, orderedIds: string[]) => {
    setFolders((prev) => {
      const next = prev.map((f) => f.id === folderId ? { ...f, playlistIds: orderedIds } : f)
      persist(next)
      return next
    })
  }, [persist])

  const reorderFolders = useCallback((orderedIds: string[]) => {
    setFolders((prev) => {
      const map = new Map(prev.map((f) => [f.id, f]))
      const next = orderedIds.map((id) => map.get(id)).filter(Boolean) as Folder[]
      prev.forEach((f) => { if (!next.find((n) => n.id === f.id)) next.push(f) })
      persist(next)
      return next
    })
  }, [persist])

  const setFolderEmoji = useCallback((id: string, emoji: string) => {
    setFolders((prev) => { const next = prev.map((f) => (f.id === id ? { ...f, emoji } : f)); persist(next); return next })
  }, [persist])

  return { folders, setFolders: hydrate, flushSync, createFolder, deleteFolder, moveToFolder, reorderFolderPlaylists, reorderFolders, setFolderEmoji }
}
