"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"

interface UISettings {
  theme: string
  styleMode: 'legacy' | 'modern' // Add style mode
  overdueTaskColor: string
  highlightOverdueTasks: boolean
}

interface UIContextType {
  uiSettings: UISettings
  updateUISettings: (settings: Partial<UISettings>) => void
}

const UIContext = createContext<UIContextType | undefined>(undefined)

export function UIProvider({ children }: { children: ReactNode }) {
  const [uiSettings, setUiSettings] = useState<UISettings>({
    theme: 'default',
    styleMode: 'legacy', // Default to legacy for now
    overdueTaskColor: '#ef4444',
    highlightOverdueTasks: true
  })

  // Load settings from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUiSettings = localStorage.getItem('uiSettings')
      if (savedUiSettings) {
        try {
          const parsed = JSON.parse(savedUiSettings)
          // Ensure styleMode exists in parsed settings
          if (!parsed.styleMode) parsed.styleMode = 'legacy'
          setUiSettings(parsed)
        } catch (e) {
          console.error('Failed to parse UI settings', e)
        }
      }
    }
  }, [])

  // Apply style mode class to html element
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement
      root.classList.remove('style-legacy', 'style-modern')
      root.classList.add(`style-${uiSettings.styleMode}`)
    }
  }, [uiSettings.styleMode])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('uiSettings', JSON.stringify(uiSettings))
    }
  }, [uiSettings])

  const updateUISettings = (settings: Partial<UISettings>) => {
    setUiSettings(prev => ({ ...prev, ...settings }))
  }

  return (
    <UIContext.Provider value={{ uiSettings, updateUISettings }}>
      {children}
    </UIContext.Provider>
  )
}

export function useUI() {
  const context = useContext(UIContext)
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider')
  }
  return context
}