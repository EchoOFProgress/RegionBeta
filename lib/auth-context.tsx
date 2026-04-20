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
  loginWithGoogle: (credential: string) => Promise<{ success: boolean; error?: string }>
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

  const loginWithGoogle = useCallback(async (credential: string) => {
    try {
      // Parse the JWT token returning from Google
      const base64Url = credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const payload = JSON.parse(jsonPayload);
      
      const userData: User = {
          id: payload.sub,
          email: payload.email,
          username: payload.name,
          picture: payload.picture,
          created_at: new Date().toISOString()
      };

      setUser(userData);
      localStorage.setItem("authUser", JSON.stringify(userData))
      
      return { success: true }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: "Nepodařilo se přihlásit pomocí Google." }
    }
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
      loginWithGoogle,
      logout,
    };
  }, [user, isMounted, isLoading, login, register, loginWithGoogle, logout]);

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