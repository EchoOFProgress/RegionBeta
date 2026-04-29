"use client"

import { createContext, useContext, useEffect, useState, type ReactNode, useCallback, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import type { Session } from "@supabase/supabase-js"

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

// Helper: convert Supabase session user to our User type
function toAppUser(supabaseUser: NonNullable<Session["user"]>): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? "",
    username:
      (supabaseUser.user_metadata?.username as string) ||
      supabaseUser.email?.split("@")[0] ||
      "user",
    created_at: supabaseUser.created_at,
    picture: (supabaseUser.user_metadata?.avatar_url as string) || undefined,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 1. Check existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("[auth] Initial session check:", session?.user?.email || "no session")
      if (session?.user) {
        setUser(toAppUser(session.user))
        setToken(session.access_token)
      }
      setIsLoading(false)
    })

    // 2. Listen for auth state changes (login / logout / token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("[auth] Auth state changed:", event, session?.user?.email || "no user")
        if (session?.user) {
          setUser(toAppUser(session.user))
          setToken(session.access_token)
        } else {
          setUser(null)
          setToken(null)
        }
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    console.log("[auth] Attempting login for:", email)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    
    if (error) {
      console.warn("[auth] Login error:", error.message)
      setIsLoading(false)
      return { success: false, error: error.message }
    }
    
    console.log("[auth] Login successful for:", data.user?.email)
    // We don't call setUser here, onAuthStateChange will do it
    return { success: true }
  }, [])

  const register = useCallback(async (email: string, password: string, username: string) => {
    setIsLoading(true)
    console.log("[auth] Attempting register for:", email)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    })
    
    if (error) {
      console.warn("[auth] Register error:", error.message)
      setIsLoading(false)
      return { success: false, error: error.message }
    }

    console.log("[auth] Register successful. Session present:", !!data.session)
    // If confirmation is needed, data.session will be null
    if (!data.session) {
      setIsLoading(false)
      return { success: true, message: "Please check your email to confirm registration." }
    }

    return { success: true }
  }, [])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setToken(null)
  }, [])

  const contextValue = useMemo(
    () => ({ user, token, isLoading, login, register, logout }),
    [user, token, isLoading, login, register, logout]
  )

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