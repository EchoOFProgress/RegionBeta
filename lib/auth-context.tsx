"use client"

import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from "react"
import type { User } from "@/lib/types"

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// API base URL - in production, this should come from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Check for existing session on app load
  useEffect(() => {
    const initializeAuth = async () => {
      // Only run in browser environment
      if (typeof window !== 'undefined') {
        const savedToken = localStorage.getItem("authToken")
        const savedUser = localStorage.getItem("authUser")
        
        if (savedToken && savedUser) {
          try {
            setToken(savedToken)
            setUser(JSON.parse(savedUser))
            
            // Verify token is still valid
            await refreshUser()
          } catch (error) {
            console.error("Failed to restore session:", error)
            // Reset state to ensure clean state after error
            setUser(null)
            setToken(null)
            if (typeof window !== 'undefined') {
              localStorage.removeItem("authToken")
              localStorage.removeItem("authUser")
            }
          }
        }
      }
      setIsLoading(false)
    }

    initializeAuth()
  }, [])

  const refreshUser = useCallback(async () => {
    if (!token || isRefreshing) return
    setIsRefreshing(true)
    
    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })
      
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        // Only run in browser environment
        if (typeof window !== 'undefined') {
          localStorage.setItem("authUser", JSON.stringify(userData))
        }
      } else {
        // Only logout if the response is specifically unauthorized
        if (response.status === 401) {
          logout()
        }
      }
    } catch (error) {
      console.error("Failed to refresh user:", error)
      logout()
    } finally {
      setIsRefreshing(false)
    }
  }, [token, isRefreshing])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username: email, password }) // Backend currently expects username field
      })

      if (response.ok) {
        const data = await response.json()
        setToken(data.token)
        setUser(data.user)
        
        // Save to localStorage
        // Only run in browser environment
        if (typeof window !== 'undefined') {
          localStorage.setItem("authToken", data.token)
          localStorage.setItem("authUser", JSON.stringify(data.user))
        }
        
        return { success: true }
      } else {
        const errorData = await response.json()
        return { success: false, error: errorData.error || "Login failed" }
      }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: "Network error occurred" }
    }
  }, [])

  const register = useCallback(async (username: string, email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, email, password })
      })

      if (response.ok) {
        const data = await response.json()
        setToken(data.token)
        setUser(data.user)
        
        // Save to localStorage
        localStorage.setItem("authToken", data.token)
        localStorage.setItem("authUser", JSON.stringify(data.user))
        
        return { success: true }
      } else {
        const errorData = await response.json()
        return { success: false, error: errorData.error || "Registration failed" }
      }
    } catch (error) {
      console.error("Registration error:", error)
      return { success: false, error: "Network error occurred" }
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      localStorage.removeItem("authToken")
      localStorage.removeItem("authUser")
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        refreshUser
      }}
    >
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