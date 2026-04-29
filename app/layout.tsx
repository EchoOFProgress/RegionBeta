import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Roboto_Mono, Barlow_Condensed, Cormorant_Garamond, Jost, Orbitron, Share_Tech_Mono } from "next/font/google"
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
import "./globals-mobile.css"
import "./globals-footer.css"
import Script from "next/script"
import { Footer } from "@/components/Footer"
import { AuthGuard } from "@/components/auth/AuthGuard"

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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#ffffff",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable} ${barlowCondensed.variable} ${cormorantGaramond.variable} ${jost.variable} ${orbitron.variable} ${shareTechMono.variable}`}>
      <head>
        {/* Anti-Flash Script: Injects the theme before any rendering occurs */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('insight-theme') || 'brutalist.css';
                  var link = document.createElement('link');
                  link.id = 'insight-global-theme-link';
                  link.rel = 'stylesheet';
                  link.href = '/insight-themes/' + theme;
                  document.head.appendChild(link);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <AuthProvider>
          <UIProvider>
            <CategoryProvider>
              <NotificationProvider>
                <LanguageProvider>
                  <GlobalThemeProvider>
                    <AuthGuard>
                      <div className="flex flex-col min-h-screen">
                        <div className="flex-grow">
                          {children}
                        </div>
                        <Footer />
                      </div>
                    </AuthGuard>
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
      </body>
    </html>
  )
}