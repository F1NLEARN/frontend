import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { authApi } from '../api/auth'
import type { UserMeResponse } from '../types'

interface AuthContextValue {
  user: UserMeResponse | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (accessToken: string, refreshToken: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserMeResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchMe = useCallback(async () => {
    try {
      const { data } = await authApi.getMe()
      setUser(data.data)
    } catch {
      setUser(null)
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      fetchMe()
    } else {
      setIsLoading(false)
    }
  }, [fetchMe])

  const login = async (accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    await fetchMe()
  }

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken)
      } catch {
        // 서버 오류여도 로컬 정리 진행
      }
    }
    localStorage.clear()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
