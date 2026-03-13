'use client'

import { useState, useEffect, useCallback } from 'react'

export interface LoopHistoryItem {
  videoId: string
  loopCount: number
  lastPlayed: number // timestamp
}

const STORAGE_KEY = 'yol-loop-history'
const MAX_ITEMS = 20

function loadHistory(): LoopHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveHistory(items: LoopHistoryItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)))
}

export function useLoopHistory() {
  const [history, setHistory] = useState<LoopHistoryItem[]>([])

  useEffect(() => {
    setHistory(loadHistory())
  }, [])

  const upsert = useCallback((videoId: string, loopCount: number) => {
    setHistory((prev) => {
      const next = prev.filter((h) => h.videoId !== videoId)
      next.unshift({ videoId, loopCount, lastPlayed: Date.now() })
      const trimmed = next.slice(0, MAX_ITEMS)
      saveHistory(trimmed)
      return trimmed
    })
  }, [])

  const remove = useCallback((videoId: string) => {
    setHistory((prev) => {
      const next = prev.filter((h) => h.videoId !== videoId)
      saveHistory(next)
      return next
    })
  }, [])

  const clear = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setHistory([])
  }, [])

  return { history, upsert, remove, clear }
}
