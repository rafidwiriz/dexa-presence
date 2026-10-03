import { createContext, useContext, useState, type ReactNode } from 'react'
import { api, setToken } from './api'
import type { Employee } from './types'

interface AuthContextValue {
  user: Employee | null
  login: (company_email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (u: Employee | null) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadUser(): Employee | null {
  const raw = localStorage.getItem('user')
  if (!raw) return null
  try { return JSON.parse(raw) as Employee } catch { return null }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<Employee | null>(loadUser)

  const login = async (company_email: string, password: string) => {
    const res = await api.login(company_email, password)
    setToken(res.accessToken)
    localStorage.setItem('user', JSON.stringify(res.employee))
    setUserState(res.employee)
  }

  const logout = () => {
    setToken(null)
    localStorage.removeItem('user')
    setUserState(null)
  }

  const setUser = (u: Employee | null) => {
    setUserState(u)
    if (u) localStorage.setItem('user', JSON.stringify(u))
    else localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
