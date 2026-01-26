import { create } from 'zustand'
import type { Student, Teacher } from '../types/index'

interface AuthState {
  user: (Student | Teacher | null)
  token: (string | null)
  isAuthenticated: boolean
  setUser: (user: Student | Teacher | null) => void
  setToken: (token: string | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: (() => {
    try {
      const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('user') : null
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })(),
  token: typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null,
  isAuthenticated: typeof localStorage !== 'undefined' ? !!localStorage.getItem('token') : false,
  setUser: (user: Student | Teacher | null) => {
    set({ user })
    if (typeof localStorage !== 'undefined') {
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
      } else {
        localStorage.removeItem('user')
      }
    }
  },
  setToken: (token: string | null) => {
    set({ token, isAuthenticated: !!token })
    if (typeof localStorage !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token)
      } else {
        localStorage.removeItem('token')
      }
    }
  },
  logout: () => {
    set({ user: null, token: null, isAuthenticated: false })
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    }
  },
}))

