import type {
  User,
  SelfRelianceAssessment,
  LongTermGoal,
  Chart64,
  RoutineCheckSheet,
  DiaryEntry,
  Achievement,
  UserStats,
} from "./types"

const STORAGE_KEYS = {
  USER: "harada_user",
  ASSESSMENTS: "harada_assessments",
  LONG_TERM_GOALS: "harada_long_term_goals",
  CHARTS: "harada_charts",
  ROUTINE_SHEETS: "harada_routine_sheets",
  DIARY_ENTRIES: "harada_diary_entries",
  ACHIEVEMENTS: "harada_achievements",
  STATS: "harada_stats",
}

// Generic storage helpers
function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue
  const item = localStorage.getItem(key)
  return item ? JSON.parse(item) : defaultValue
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(value))
}

// User
export function getUser(): User | null {
  return getItem<User | null>(STORAGE_KEYS.USER, null)
}

export function setUser(user: User): void {
  setItem(STORAGE_KEYS.USER, user)
}

export function createUser(name: string, email: string): User {
  const user: User = {
    id: crypto.randomUUID(),
    name,
    email,
    createdAt: new Date().toISOString(),
  }
  setUser(user)
  initializeStats(user.id)
  initializeAchievements(user.id)
  return user
}

// Assessments
export function getAssessments(): SelfRelianceAssessment[] {
  return getItem<SelfRelianceAssessment[]>(STORAGE_KEYS.ASSESSMENTS, [])
}

export function saveAssessment(assessment: SelfRelianceAssessment): void {
  const assessments = getAssessments()
  assessments.push(assessment)
  setItem(STORAGE_KEYS.ASSESSMENTS, assessments)
  updateStats({ assessmentsCompleted: 1 })
}

export function getLatestAssessment(userId: string): SelfRelianceAssessment | null {
  const assessments = getAssessments().filter((a) => a.userId === userId)
  return assessments.length > 0 ? assessments[assessments.length - 1] : null
}

// Long-Term Goals
export function getLongTermGoals(): LongTermGoal[] {
  return getItem<LongTermGoal[]>(STORAGE_KEYS.LONG_TERM_GOALS, [])
}

export function saveLongTermGoal(goal: LongTermGoal): void {
  const goals = getLongTermGoals()
  const existingIndex = goals.findIndex((g) => g.id === goal.id)
  if (existingIndex >= 0) {
    goals[existingIndex] = goal
  } else {
    goals.push(goal)
  }
  setItem(STORAGE_KEYS.LONG_TERM_GOALS, goals)
}

export function getActiveLongTermGoal(userId: string): LongTermGoal | null {
  const goals = getLongTermGoals().filter((g) => g.userId === userId)
  return goals.length > 0 ? goals[goals.length - 1] : null
}

// Chart 64
export function getCharts(): Chart64[] {
  return getItem<Chart64[]>(STORAGE_KEYS.CHARTS, [])
}

export function saveChart(chart: Chart64): void {
  const charts = getCharts()
  const existingIndex = charts.findIndex((c) => c.id === chart.id)
  if (existingIndex >= 0) {
    charts[existingIndex] = chart
  } else {
    charts.push(chart)
  }
  setItem(STORAGE_KEYS.CHARTS, charts)
}

export function getActiveChart(userId: string): Chart64 | null {
  const charts = getCharts().filter((c) => c.userId === userId)
  return charts.length > 0 ? charts[charts.length - 1] : null
}

// Routine Check Sheet
export function getRoutineSheets(): RoutineCheckSheet[] {
  return getItem<RoutineCheckSheet[]>(STORAGE_KEYS.ROUTINE_SHEETS, [])
}

export function saveRoutineSheet(sheet: RoutineCheckSheet): void {
  const sheets = getRoutineSheets()
  const existingIndex = sheets.findIndex((s) => s.id === sheet.id)
  if (existingIndex >= 0) {
    sheets[existingIndex] = sheet
  } else {
    sheets.push(sheet)
  }
  setItem(STORAGE_KEYS.ROUTINE_SHEETS, sheets)
}

export function getActiveRoutineSheet(userId: string): RoutineCheckSheet | null {
  const sheets = getRoutineSheets().filter((s) => s.userId === userId)
  return sheets.length > 0 ? sheets[sheets.length - 1] : null
}

// Diary Entries
export function getDiaryEntries(): DiaryEntry[] {
  return getItem<DiaryEntry[]>(STORAGE_KEYS.DIARY_ENTRIES, [])
}

export function saveDiaryEntry(entry: DiaryEntry): void {
  const entries = getDiaryEntries()
  const existingIndex = entries.findIndex((e) => e.id === entry.id)
  if (existingIndex >= 0) {
    entries[existingIndex] = entry
  } else {
    entries.push(entry)
    updateStats({ diaryEntries: 1 })
  }
  setItem(STORAGE_KEYS.DIARY_ENTRIES, entries)
  checkAndUpdateStreak()
}

export function getDiaryEntriesForUser(userId: string): DiaryEntry[] {
  return getDiaryEntries().filter((e) => e.userId === userId)
}

export function getTodayDiaryEntry(userId: string): DiaryEntry | null {
  const today = new Date().toISOString().split("T")[0]
  return getDiaryEntries().find((e) => e.userId === userId && e.date === today) || null
}

// Stats
export function getStats(): UserStats {
  return getItem<UserStats>(STORAGE_KEYS.STATS, {
    totalDays: 0,
    currentStreak: 0,
    longestStreak: 0,
    tasksCompleted: 0,
    diaryEntries: 0,
    assessmentsCompleted: 0,
    goalsAchieved: 0,
    points: 0,
    level: 1,
  })
}

export function initializeStats(userId: string): void {
  const stats: UserStats = {
    totalDays: 0,
    currentStreak: 0,
    longestStreak: 0,
    tasksCompleted: 0,
    diaryEntries: 0,
    assessmentsCompleted: 0,
    goalsAchieved: 0,
    points: 0,
    level: 1,
  }
  setItem(STORAGE_KEYS.STATS, stats)
}

export function updateStats(updates: Partial<UserStats>): void {
  const stats = getStats()
  Object.keys(updates).forEach((key) => {
    const k = key as keyof UserStats
    if (typeof stats[k] === "number" && typeof updates[k] === "number") {
      ;(stats[k] as number) += updates[k] as number
    }
  })
  // Calculate level based on points
  stats.level = Math.floor(stats.points / 100) + 1
  setItem(STORAGE_KEYS.STATS, stats)
}

export function addPoints(points: number): void {
  updateStats({ points })
  checkAchievements()
}

function checkAndUpdateStreak(): void {
  const stats = getStats()
  const entries = getDiaryEntries()
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const todayStr = today.toISOString().split("T")[0]
  const yesterdayStr = yesterday.toISOString().split("T")[0]

  const hasTodayEntry = entries.some((e) => e.date === todayStr)
  const hasYesterdayEntry = entries.some((e) => e.date === yesterdayStr)

  if (hasTodayEntry) {
    if (hasYesterdayEntry || stats.currentStreak === 0) {
      stats.currentStreak += 1
      stats.totalDays += 1
    }
    if (stats.currentStreak > stats.longestStreak) {
      stats.longestStreak = stats.currentStreak
    }
  } else if (!hasYesterdayEntry) {
    stats.currentStreak = 0
  }

  setItem(STORAGE_KEYS.STATS, stats)
}

// Achievements
export function getAchievements(): Achievement[] {
  return getItem<Achievement[]>(STORAGE_KEYS.ACHIEVEMENTS, [])
}

export function initializeAchievements(userId: string): void {
  const achievements: Achievement[] = [
    {
      id: "first_assessment",
      name: "Sebepoznání",
      description: "Dokončete první sebehodnocení",
      icon: "🎯",
      category: "milestone",
      requirement: 1,
      progress: 0,
    },
    {
      id: "first_goal",
      name: "Vizionář",
      description: "Vytvořte svůj první dlouhodobý cíl",
      icon: "🌟",
      category: "milestone",
      requirement: 1,
      progress: 0,
    },
    {
      id: "chart_complete",
      name: "Architekt",
      description: "Vyplňte kompletní 64 Chart",
      icon: "📊",
      category: "completion",
      requirement: 1,
      progress: 0,
    },
    {
      id: "streak_7",
      name: "Týdenní válečník",
      description: "7 dní v řadě",
      icon: "🔥",
      category: "streak",
      requirement: 7,
      progress: 0,
    },
    {
      id: "streak_30",
      name: "Měsíční mistr",
      description: "30 dní v řadě",
      icon: "💪",
      category: "streak",
      requirement: 30,
      progress: 0,
    },
    {
      id: "diary_10",
      name: "Kronikář",
      description: "Napište 10 deníkových záznamů",
      icon: "📝",
      category: "completion",
      requirement: 10,
      progress: 0,
    },
    {
      id: "tasks_50",
      name: "Výkonný",
      description: "Dokončete 50 úkolů",
      icon: "✅",
      category: "completion",
      requirement: 50,
      progress: 0,
    },
    {
      id: "level_5",
      name: "Postupující",
      description: "Dosáhněte úrovně 5",
      icon: "⬆️",
      category: "milestone",
      requirement: 5,
      progress: 0,
    },
  ]
  setItem(STORAGE_KEYS.ACHIEVEMENTS, achievements)
}

export function checkAchievements(): Achievement[] {
  const stats = getStats()
  const achievements = getAchievements()
  const newlyUnlocked: Achievement[] = []

  achievements.forEach((achievement) => {
    if (achievement.unlockedAt) return

    let progress = 0
    switch (achievement.id) {
      case "first_assessment":
        progress = stats.assessmentsCompleted
        break
      case "first_goal":
        progress = getLongTermGoals().length
        break
      case "chart_complete":
        progress = getCharts().filter((c) => c.actionTasks.length === 64).length
        break
      case "streak_7":
      case "streak_30":
        progress = stats.currentStreak
        break
      case "diary_10":
        progress = stats.diaryEntries
        break
      case "tasks_50":
        progress = stats.tasksCompleted
        break
      case "level_5":
        progress = stats.level
        break
    }

    achievement.progress = progress
    if (progress >= achievement.requirement && !achievement.unlockedAt) {
      achievement.unlockedAt = new Date().toISOString()
      newlyUnlocked.push(achievement)
    }
  })

  setItem(STORAGE_KEYS.ACHIEVEMENTS, achievements)
  return newlyUnlocked
}

// Clear all data (for testing/reset)
export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key)
  })
}