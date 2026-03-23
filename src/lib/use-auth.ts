'use client'

import { useState, useEffect, useCallback } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const TOKEN_KEY = 'yol-auth-token'
const MIGRATED_KEY = 'yol-auth-migrated'

export interface AuthUser {
  sub: string
  email: string
  name: string
  avatar_url: string
  exp: number
}

function decodeJwt(token: string): AuthUser | null {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return null
  }
}

function isExpired(user: AuthUser): boolean {
  return Date.now() / 1000 > user.exp
}

function getStoredUser(): AuthUser | null {
  try {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return null
    const user = decodeJwt(token)
    if (!user || isExpired(user)) {
      localStorage.removeItem(TOKEN_KEY)
      return null
    }
    return user
  } catch {
    return null
  }
}

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function isMigrated(): boolean {
  try {
    return localStorage.getItem(MIGRATED_KEY) === 'true'
  } catch {
    return false
  }
}

export function setMigrated() {
  try {
    localStorage.setItem(MIGRATED_KEY, 'true')
  } catch {}
}

let _on401: (() => void) | null = null
export function setOn401Handler(fn: () => void) { _on401 = fn }
export function trigger401() { _on401?.() }

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [sessionExpired, setSessionExpired] = useState(false)

  // Handle ?token= in URL on mount (OAuth callback)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const error = params.get('error')

    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
      params.delete('token')
      const newUrl = window.location.pathname + (params.toString() ? `?${params}` : '')
      window.history.replaceState({}, '', newUrl)
    }

    if (error === 'auth_failed') {
      params.delete('error')
      const newUrl = window.location.pathname + (params.toString() ? `?${params}` : '')
      window.history.replaceState({}, '', newUrl)
    }

    setUser(getStoredUser())
  }, [])

  // Register 401 handler
  useEffect(() => {
    setOn401Handler(() => {
      localStorage.removeItem(TOKEN_KEY)
      setUser(null)
      setSessionExpired(true)
    })
    return () => setOn401Handler(() => {})
  }, [])

  const login = useCallback(() => {
    const redirect = window.location.origin
    window.location.href = `${API_URL}/yol/auth/google?redirect=${encodeURIComponent(redirect)}`
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
    setSessionExpired(false)
  }, [])

  const dismissExpired = useCallback(() => {
    setSessionExpired(false)
  }, [])

  return {
    user,
    isLoggedIn: !!user,
    sessionExpired,
    login,
    logout,
    dismissExpired,
  }
}
