"use client"

import { useRouter } from "next/navigation"
import type { ReactNode } from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

export interface AppUser {
  id: string
  email: string
  displayName?: string
  role?: string
}

interface AuthContextType {
  user: AppUser | null
  loading: boolean
  login: (email: string, pass: string) => Promise<void>
  register: (email: string, pass: string, displayName: string) => Promise<void>
  logout: () => Promise<void>
  updateUser: (data: Partial<AppUser>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Try cached user first for instant UI
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('appUser')
      if (cached) {
        try { setUser(JSON.parse(cached)) } catch { localStorage.removeItem('appUser') }
      }
    }
    // Verify session with server
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.user) {
          setUser(data.user)
          localStorage.setItem('appUser', JSON.stringify(data.user))
        } else {
          setUser(null)
          localStorage.removeItem('appUser')
        }
      })
      .catch(() => {/* server unreachable, keep cached */})
      .finally(() => setLoading(false))
  }, [])

  const login = async (email: string, pass: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Не удалось войти')
      const loggedInUser: AppUser = result.user
      setUser(loggedInUser)
      localStorage.setItem('appUser', JSON.stringify(loggedInUser))
      toast({ title: 'Добро пожаловать!', description: loggedInUser.displayName || loggedInUser.email })
      router.push(loggedInUser.role === 'admin' ? '/admin' : '/')
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Ошибка входа', description: error.message })
      setUser(null)
      localStorage.removeItem('appUser')
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, pass: string, displayName: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass, displayName }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Не удалось зарегистрироваться')
      // Автоматически входим после регистрации
      const newUser: AppUser = result.user
      setUser(newUser)
      localStorage.setItem('appUser', JSON.stringify(newUser))
      toast({ title: 'Добро пожаловать!', description: 'Аккаунт создан и вход выполнен.' })
      router.push(newUser.role === 'admin' ? '/admin' : '/')
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Ошибка регистрации', description: error.message })
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    localStorage.removeItem('appUser')
    toast({ title: 'Выход выполнен' })
    router.push('/auth/login')
  }

  const updateUser = (data: Partial<AppUser>) => {
    setUser(prev => {
      if (!prev) return prev
      const updated = { ...prev, ...data }
      localStorage.setItem('appUser', JSON.stringify(updated))
      return updated
    })
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) throw new Error('useAuth must be used within AuthProvider')
  return context
}
