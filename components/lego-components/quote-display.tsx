"use client"

import { useEffect, useState } from "react"
import { QUOTES } from "@/lib/constants"

interface QuoteDisplayProps {
  level: "low" | "medium" | "high" | "legendary"
}

export function QuoteDisplay({ level }: QuoteDisplayProps) {
  const [quote, setQuote] = useState("")
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const quotes = QUOTES[level]
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
    setQuote(randomQuote)
    setIsAnimating(true)

    const timer = setTimeout(() => setIsAnimating(false), 500)
    return () => clearTimeout(timer)
  }, [level])

  // Change quote periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const quotes = QUOTES[level]
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
      setIsAnimating(true)
      setTimeout(() => {
        setQuote(randomQuote)
        setIsAnimating(false)
      }, 300)
    }, 15000)

    return () => clearInterval(interval)
  }, [level])

  return (
    <div className="text-center py-4 px-6 bg-gradient-to-r from-yellow-400/10 via-orange-400/10 to-yellow-400/10 rounded-xl border border-yellow-400/20">
      <p
        className={cn(
          "text-lg sm:text-xl font-medium italic transition-all duration-300",
          isAnimating ? "opacity-0 transform translate-y-2" : "opacity-100 transform translate-y-0",
        )}
      >
        "{quote}"
      </p>
      <p className="text-xs text-muted-foreground mt-2">— Monish Pabrai's Dando Framework</p>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
