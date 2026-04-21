// Bullet Journal App Types

export interface User {
  id: number
  username: string
  email: string
  created_at: string
  last_login?: string
}

export interface AppCategory {
  id: number
  name: string
  color: string
  user_id: number
  created_at: string
}

export type Category = 'work' | 'sleep' | 'freetime' | 'startup' | 'essentials';

export interface Task {
  id: string
  title: string
  priority: number
  completed: boolean
  type: string
  numericValue?: number
  numericCondition?: string
  numericTarget?: number
  description?: string
  dueDate?: string
  categories?: string[]
  timeEstimate?: number
  createdAt?: string
  completedAt?: string
  linkedGoalId?: string
  dependencies?: string[]
  timeBlockStart?: string
  timeBlockEnd?: string
  timeBlockDate?: string
  tags?: string[]
  isRecurring?: boolean
  recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  recurrenceEndDate?: string
  recurrenceInterval?: number
  streak?: number
  bestStreak?: number
  lastCompleted?: string
  completionRecords?: { date: string; value?: number; note?: string }[]
}

export interface Habit {
  id: string
  name: string
  streak: number
  bestStreak: number
  totalCompletions: number
  lastCompleted: string | null
  completedToday: boolean
  description?: string
  categories?: string[]
  type: string
  numericValue?: number
  numericCondition?: string
  numericTarget?: number
  reminders?: string[]
  frequency?: string
  customDays?: number[]
  checklistItems?: { id: string; name: string; completed: boolean }[]
  resetSchedule?: "daily" | "weekly" | "monthly"
  color?: string
  icon?: string
  timeWindow?: { from: string; to: string }
  completionRecords: { date: string; value?: number; note?: string }[]
  weeklyCompletions?: number
  monthlyCompletions?: number
  successRate?: number
}

export interface HabitCompletion {
  id: number
  habit_id: number
  date: string
  note?: string
  created_at: string
}

export interface ChecklistItem {
  id: number
  habit_id: number
  name: string
  completed: boolean
  created_at: string
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  duration: number;
  currentDay: number;
  status: "upcoming" | "active" | "completed" | "failed";
  startDate: string;
  endDate: string;
  lastCheckedIn: string | null;
  categories: string[];
  goalType: "daily-completion" | "total-amount" | "checklist" | "points";
  notes: { [date: string]: string };
  difficulty: number;
  icon: string;
  isPublic: boolean;
  archived: boolean;
  dailyTasks?: { day: number; task: string; done: boolean }[];
  totalAmount?: number;
  currentAmount?: number;
  dailyTarget?: number;
  dailyProgress?: number[];
  dailyNotes?: { [date: string]: string };
  linkedGoalId?: string;
  currentStreak?: number;
  bestStreak?: number;
  lastCompletedDate?: string;
  completionRecords?: { date: string; amount: number; note?: string }[];
  milestones?: {
    id: string;
    title: string;
    description: string;
    targetValue: number;
    currentValue: number;
    achieved: boolean;
    achievedDate?: string;
    color: string;
  }[];
}

// Additional types needed for LEGO components
export interface BrickData {
  day: number;
  hour: number;
  category: Category;
}

export interface WeekStats {
  startup: number;
  work: number;
  freetime: number;
  sleep: number;
  essentials: number;
}

export interface CategoryInfo {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
  quote: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  tier: 'beginner' | 'intermediate' | 'advanced' | 'legendary';
  unlocked: boolean;
  condition: (stats: WeekStats) => boolean;
  unlockDate?: string;
}

// LegoCategory has been renamed to Category for LEGO components


export type PresetType = 'default' | 'hustle' | 'freedom' | 'work' | 'sleep' | 'freetime';