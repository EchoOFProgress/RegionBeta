"use client"

import { createContext, useContext, useEffect, useState, type ReactNode, useCallback, useMemo } from "react"

export interface User {
  id: string
  username: string
  email: string
  created_at: string
  picture?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, username: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  // Check for existing session on app load
  useEffect(() => {
    setIsMounted(true)
    const initializeAuth = () => {
      const savedUser = localStorage.getItem("authUser")
      
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser))
        } catch (error) {
          console.error("Failed to restore session:", error)
          setUser(null)
          localStorage.removeItem("authUser")
        }
      }
      setIsLoading(false)
    }

    initializeAuth()
  }, [])


  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem("authUser")
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const userData: User = {
      id: "mock-user-id",
      email: email,
      username: email.split('@')[0],
      created_at: new Date().toISOString()
    }
    setUser(userData)
    localStorage.setItem("authUser", JSON.stringify(userData))
    return { success: true }
  }, [])

  const register = useCallback(async (email: string, password: string, username: string) => {
    return login(email, password)
  }, [login])

  const contextValue = useMemo(() => {
    // Only calculate token after mount to prevent hydration mismatch
    let token: string | null = null;
    if (isMounted && user) {
      try {
        token = btoa(JSON.stringify(user));
      } catch (e) {
        console.error("Failed to generate token:", e);
      }
    }

    return {
      user,
      token,
      isLoading: !isMounted || isLoading,
      login,
      register,
      logout,
    };
  }, [user, isMounted, isLoading, login, register, logout]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}