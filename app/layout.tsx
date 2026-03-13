import type React from "react"
import type { Metadata } from "next"
import { Inter, Roboto_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { CategoryProvider } from "@/lib/category-context"
import { UIProvider } from "@/lib/ui-context"
import { AuthProvider } from "@/lib/auth-context"
import { NotificationProvider } from "@/lib/notification-context"
import "./globals.css"
import "./globals-modern.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
})

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono"
})

export const metadata: Metadata = {
  title: "Region Beta",
  description: "By Knowing Destination you know the most effective way to get there",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable}`}>
      <body className={`font-sans antialiased min-h-screen bg-background text-foreground`}>
        <AuthProvider>
          <UIProvider>
            <CategoryProvider>
              <NotificationProvider>
                <div className="min-h-screen flex flex-col">
                  {children}
                </div>
              </NotificationProvider>
            </CategoryProvider>
          </UIProvider>
        </AuthProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}