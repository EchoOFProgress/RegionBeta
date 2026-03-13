import type { CategoryInfo, Achievement, BrickData, Category } from "./types"

export const DAYS = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"]
export const DAYS_FULL = ["Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota", "Neděle"]

export const TIME_SLOTS = [
  "00-02",
  "02-04",
  "04-06",
  "06-08",
  "08-10",
  "10-12",
  "12-14",
  "14-16",
  "16-18",
  "18-20",
  "20-22",
  "22-24",
]

export const CATEGORIES: Record<Category, CategoryInfo> = {
  sleep: {
    id: "sleep",
    name: "Spánek",
    emoji: "😴",
    color: "bg-slate-700 dark:bg-slate-800",
    description: "8 hodin denně - NEKOMPROMISNÍ!",
    quote: "Spánek není volitelný, bro! 💤",
  },
  work: {
    id: "work",
    name: "Práce",
    emoji: "💼",
    color: "bg-blue-500 dark:bg-blue-600",
    description: "9-to-5 job - někdo jiný platí tvůj nájem",
    quote: "Some other yo-yo is paying your rent 🤑",
  },
  essentials: {
    id: "essentials",
    name: "Nutnosti",
    emoji: "🍽️",
    color: "bg-purple-500 dark:bg-purple-600",
    description: "Jídlo, sprcha, commute, domácnost",
    quote: "Zkrať commute = více času pro startup!",
  },
  freetime: {
    id: "freetime",
    name: "Volný čas",
    emoji: "📱",
    color: "bg-orange-500 dark:bg-orange-600",
    description: "Netflix, social media, gaming...",
    quote: "We don't need no free time - yellow is better!",
  },
  startup: {
    id: "startup",
    name: "Startup",
    emoji: "🚀",
    color: "bg-yellow-400 dark:bg-yellow-500",
    description: "Tvoje baby, tvoje vášeň, tvoje svoboda!",
    quote: "You're having an orgasm every hour 💀",
  },
}

export const CATEGORY_ORDER: Category[] = ["sleep", "work", "essentials", "freetime", "startup"]

// Default week preset - typical 9-to-5 worker
export const DEFAULT_PRESET: BrickData[] = generatePreset("default")
export const HUSTLE_PRESET: BrickData[] = generatePreset("hustle")
export const FREEDOM_PRESET: BrickData[] = generatePreset("freedom")

function generatePreset(type: "default" | "hustle" | "freedom"): BrickData[] {
  const bricks: BrickData[] = []

  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 12; hour++) {
      let category: Category = "freetime"
      const isWeekend = day >= 5

      // Sleep: 00-08 (slots 0-3)
      if (hour <= 3) {
        category = "sleep"
      }
      // Work hours: 08-12, 14-18 on weekdays (slots 4-5, 7-8)
      else if (!isWeekend && (hour === 4 || hour === 5 || hour === 7 || hour === 8)) {
        category = type === "freedom" ? "startup" : "work"
      }
      // Lunch/commute (slot 6: 12-14)
      else if (hour === 6) {
        category = type === "freedom" ? "startup" : "essentials"
      }
      // Evening essentials (slot 9: 18-20)
      else if (hour === 9) {
        if (type === "freedom") {
          category = "startup"
        } else {
          category = "essentials"
        }
      }
      // Weekend essentials
      else if (isWeekend && (hour === 4 || hour === 5)) {
        if (type === "freedom") {
          category = "startup"
        } else if (type === "hustle") {
          category = "startup"
        } else {
          category = "essentials"
        }
      }
      // Free time / startup time
      else {
        if (type === "freedom") {
          category = hour === 10 || hour === 11 ? "essentials" : "startup"
        } else if (type === "hustle") {
          // Evening startup time on weekdays
          if (!isWeekend && (hour === 10 || hour === 11)) {
            category = "startup"
          } else if (isWeekend && hour >= 6) {
            category = hour === 9 ? "essentials" : "startup"
          } else {
            category = "freetime"
          }
        } else {
          category = "freetime"
        }
      }

      bricks.push({ day, hour, category })
    }
  }

  return bricks
}

export const QUOTES = {
  low: [
    "Yellow is more exciting than orange! 🟨",
    "Some other yo-yo is paying your rent 🤑",
    "Getting your music out matters! 🎵",
    "Start somewhere. Start now. 🚀",
    "Netflix can wait, your dreams can't ⏰",
  ],
  medium: [
    "You're 50% there, keep pushing! 💪",
    "Netflix can wait, your future can't ⏰",
    "Just above firing level, perfect 😏",
    "The grind is temporary, freedom is forever 🎯",
    "Every hour counts towards your dream! ⭐",
  ],
  high: [
    "This is where champions are made 🏆",
    "9 months and you're FREE 🎆",
    "You're making progress every hour! 💪",
    "The startup life chose you! 🔥",
    "Winners are built in the hours others waste 💎",
  ],
  legendary: [
    "BEAST MODE ACTIVATED 🔥🔥🔥",
    "Bill Gates started like this 👑",
    "Welcome to the 1% club 💎",
    "You're not working, you're building legacy 🏰",
    "Monish would be SO proud right now! 🦄",
  ],
}

export const ACHIEVEMENTS: Achievement[] = [
  // Beginner Tier
  {
    id: "first_yellow",
    name: "First Yellow",
    description: "První startup hodina",
    emoji: "🥉",
    tier: "beginner",
    unlocked: false,
    condition: (stats) => stats.startup >= 2,
  },
  {
    id: "ten_club",
    name: "10 Club",
    description: "10h startup za týden",
    emoji: "🎯",
    tier: "beginner",
    unlocked: false,
    condition: (stats) => stats.startup >= 10,
  },
  {
    id: "early_bird",
    name: "Early Bird",
    description: "Startup před prací (06-08)",
    emoji: "🌅",
    tier: "beginner",
    unlocked: false,
    condition: () => false, // Checked separately
  },
  {
    id: "night_owl",
    name: "Night Owl",
    description: "Startup po 22:00",
    emoji: "🌙",
    tier: "beginner",
    unlocked: false,
    condition: () => false, // Checked separately
  },
  // Intermediate Tier
  {
    id: "twenty_club",
    name: "20 Club",
    description: "20h startup za týden - serious mode!",
    emoji: "🥈",
    tier: "intermediate",
    unlocked: false,
    condition: (stats) => stats.startup >= 20,
  },
  {
    id: "weekend_warrior",
    name: "Weekend Warrior",
    description: "10h+ startup o víkendu",
    emoji: "💪",
    tier: "intermediate",
    unlocked: false,
    condition: () => false, // Checked separately
  },
  {
    id: "no_netflix_day",
    name: "No Netflix Day",
    description: "0h volného času za den",
    emoji: "📵",
    tier: "intermediate",
    unlocked: false,
    condition: () => false, // Checked separately
  },
  // Advanced Tier
  {
    id: "thirty_club",
    name: "30 Club",
    description: "30h startup za týden - beast mode!",
    emoji: "🥇",
    tier: "advanced",
    unlocked: false,
    condition: (stats) => stats.startup >= 30,
  },
  {
    id: "no_netflix_week",
    name: "No Netflix Week",
    description: "0h volného času za celý týden",
    emoji: "🚀",
    tier: "advanced",
    unlocked: false,
    condition: (stats) => stats.freetime === 0,
  },
  {
    id: "balanced_grinder",
    name: "Balanced Grinder",
    description: "Full-time práce + 20h startup",
    emoji: "💎",
    tier: "advanced",
    unlocked: false,
    condition: (stats) => stats.work >= 40 && stats.startup >= 20,
  },
  // Legendary Tier
  {
    id: "forty_club",
    name: "40 Club",
    description: "40h+ startup za týden",
    emoji: "🏆",
    tier: "legendary",
    unlocked: false,
    condition: (stats) => stats.startup >= 40,
  },
  {
    id: "full_freedom",
    name: "Full Freedom",
    description: "0h práce, 60h+ startup",
    emoji: "🎆",
    tier: "legendary",
    unlocked: false,
    condition: (stats) => stats.work === 0 && stats.startup >= 60,
  },
  {
    id: "monish_proud",
    name: "Monish Would Be Proud",
    description: "Dokonalá Dando execution",
    emoji: "🦄",
    tier: "legendary",
    unlocked: false,
    condition: (stats) => stats.startup >= 80 && stats.sleep >= 56,
  },
]
