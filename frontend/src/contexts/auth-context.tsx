'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { apiJson, getToken, setToken, clearToken } from '@/lib/api'

export type User = {
  id: number
  full_name: string
  email: string
  broker_name?: string | null
}

type AuthContextValue = {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (fullName: string, email: string, password: string, brokerName?: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

type TokenResponse = {
  access_token: string
  user: User
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setIsLoading(false)
      return
    }
    apiJson<User>('/api/auth/me')
      .then(setUser)
      .catch(() => {
        clearToken()
        setUser(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  async function login(email: string, password: string) {
    const data = await apiJson<TokenResponse>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    setToken(data.access_token)
    setUser(data.user)
  }

  async function signup(fullName: string, email: string, password: string, brokerName?: string) {
    const data = await apiJson<TokenResponse>('/api/auth/signup', {
      method: 'POST',
      body: { full_name: fullName, email, password, broker_name: brokerName || undefined },
    })
    setToken(data.access_token)
    setUser(data.user)
  }

  function logout() {
    clearToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
