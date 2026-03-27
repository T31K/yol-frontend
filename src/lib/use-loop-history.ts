'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { getAuthToken, trigger401 } from './use-auth'

export interface LoopHistoryItem {
  videoId: string
  loopCount: number
  lastPlayed: number
  title?: string
}

const STORAGE_KEY = 'yol-loop-history'
const MAX_ITEMS = 20
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const DEBOUNCE_MS = 500

function loadLocal(): LoopHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveLocal(items: LoopHistoryItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)))
}

async function syncToServer(items: LoopHistoryItem[]) {
  const token = getAuthToken()
  if (!token) return
  const res = await fetch(`${API_URL}/yol/sync/history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ data: items }),
  })
  if (res.status === 401) trigger401()
}

export function getStoredLoopCount(videoId: string): number {
  const items = loadLocal()
  return items.find((h) => h.videoId === videoId)?.loopCount ?? 0
}

export function useLoopHistory(isLoggedIn: boolean) {
  const [history, setHistory] = useState<LoopHistoryItem[]>([])
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!isLoggedIn) setHistory(loadLocal())
  }, [isLoggedIn])

  const persist = useCallback((next: LoopHistoryItem[]) => {
    if (isLoggedIn) {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => syncToServer(next), DEBOUNCE_MS)
    } else {
      saveLocal(next)
    }
  }, [isLoggedIn])

  const hydrate = useCallback((data: LoopHistoryItem[]) => setHistory(data), [])

  const flushSync = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
      syncToServer(history)
    }
  }, [history])

  const upsert = useCallback((videoId: string, loopCount: number, title?: string) => {
    setHistory((prev) => {
      const existing = prev.find((h) => h.videoId === videoId)
      const next = prev.filter((h) => h.videoId !== videoId)
      next.unshift({ videoId, loopCount, lastPlayed: Date.now(), title: title ?? existing?.title })
      const trimmed = next.slice(0, MAX_ITEMS)
      persist(trimmed)
      return trimmed
    })
  }, [persist])

  const remove = useCallback((videoId: string) => {
    setHistory((prev) => {
      const next = prev.filter((h) => h.videoId !== videoId)
      persist(next)
      return next
    })
  }, [persist])

  const clear = useCallback(() => {
    if (isLoggedIn) {
      syncToServer([])
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
    setHistory([])
  }, [isLoggedIn])

  return { history, setHistory: hydrate, flushSync, upsert, remove, clear }
}
