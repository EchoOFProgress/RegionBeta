'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'
import { useUI } from '@/lib/ui-context'

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { uiSettings } = useUI()
  
  // Map our custom themes to next-themes compatible values
  const getThemeValue = () => {
    switch (uiSettings.theme) {
      case 'default':
        return 'light'
      case 'retro-dark':
        return 'dark' // Retro dark is still a dark theme
      default:
        return 'light' // Default fallback
    }
  }

  return (
    <NextThemesProvider 
      attribute="class" 
      defaultTheme={getThemeValue()}
      themes={['light', 'dark']}
    >
      <div className={`theme-${uiSettings.theme}`}>
        {children}
      </div>
    </NextThemesProvider>
  )
}