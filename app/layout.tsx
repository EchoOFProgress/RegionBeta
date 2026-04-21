import type React from "react"
import type { Metadata } from "next"
import { Inter, Roboto_Mono, Barlow_Condensed, Cormorant_Garamond, Jost, Orbitron, Share_Tech_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { CategoryProvider } from "@/lib/category-context"
import { UIProvider } from "@/lib/ui-context"
import { AuthProvider } from "@/lib/auth-context"
import { NotificationProvider } from "@/lib/notification-context"
import { LanguageProvider } from "@/lib/language-context"
import GlobalThemeProvider from "@/components/GlobalThemeProvider"
import "./globals.css"
import "./globals-base.css"
import "./globals-utilities.css"
import "./globals-shell.css"
import Script from "next/script"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
})

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono"
})

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-barlow-condensed"
})

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant-garamond"
})

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost"
})

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron"
})

const shareTechMono = Share_Tech_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-share-tech-mono"
})

export const metadata: Metadata = {
  title: "Region Beta",
  description: "By Knowing YOUR destination you know the most effective way to get there",
  generator: "v0.app",
  icons: {
    icon: "/favicon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable} ${barlowCondensed.variable} ${cormorantGaramond.variable} ${jost.variable} ${orbitron.variable} ${shareTechMono.variable}`}>
      <body>
        <AuthProvider>
          <UIProvider>
            <CategoryProvider>
              <NotificationProvider>
                <LanguageProvider>
                  <GlobalThemeProvider>
                    <div>
                      {children}
                    </div>
                  </GlobalThemeProvider>
                </LanguageProvider>
              </NotificationProvider>
            </CategoryProvider>
          </UIProvider>
        </AuthProvider>
        <Toaster />
        <Script
          src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"
          strategy="lazyOnload"
        />
        <Script 
          src="https://accounts.google.com/gsi/client" 
          strategy="beforeInteractive" 
        />
        <Analytics />
      </body>
    </html>
  )
}