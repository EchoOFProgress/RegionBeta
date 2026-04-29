"use client"

import { useAuth } from "@/lib/auth-context"
import { EmailLoginForm } from "./EmailLoginForm"
import { Loader2 } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { useCloudSync } from "@/hooks/useCloudSync"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const { t } = useLanguage()
  useCloudSync()

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium animate-pulse">Region Beta initializing...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto">
        <div className="w-full max-w-md bg-card border-2 border-primary/20 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
          <div className="p-6 sm:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-primary/10 text-primary rounded-xl text-2xl sm:text-3xl font-black uppercase tracking-tighter mb-4 sm:mb-6">
                Region Beta
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                By knowing YOUR destination you know the most effective way to get there.
              </p>
            </div>
            
            <div className="space-y-6">
              <EmailLoginForm />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
