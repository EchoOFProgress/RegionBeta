"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, Trash2, Flame, Target, Calendar, Settings, Circle, Sparkles, GripVertical } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ExtendedHabitForm } from "@/components/extended-habit-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { getPriorityColor, shouldGlow } from "@/lib/priority-colors"
import { useCategories } from "@/lib/category-context"
import { HabitAnalyticsModal } from "@/components/habit-analytics-modal"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { storage } from "@/lib/storage"
import { useNotifications } from "@/lib/notification-context"

type HabitType = "boolean" | "numeric" | "checklist"
type NumericCondition = "at-least" | "less-than" | "exactly"
type FrequencyType = "daily" | "weekly" | "monthly" | "custom"

type ChecklistItem = {
  id: string
  name: string
  completed: boolean
}

type DailyLog = {
  date: string // YYYY-MM-DD
  note: string
}

type HabitCompletionRecord = {
  date: string // YYYY-MM-DD
  value?: number // For numeric habits
  energyLevel?: number // Energy level (1-10) used to complete
  mood?: number // Mood rating (1-5)
  note?: string
}

type Habit = {
  id: string
  name: string
  streak: number
  bestStreak: number
  totalCompletions: number
  lastCompleted: string | null
  completedToday: boolean
  description?: string
  categories?: string[]
  type: HabitType
  numericValue?: number
  numericCondition?: NumericCondition
  numericTarget?: number
  // New features
  reminders?: string[] // Array of time strings for notifications
  frequency?: FrequencyType
  customDays?: number[] // For custom frequency (0-6 for Sun-Sat)
  checklistItems?: ChecklistItem[]
  resetSchedule?: "daily" | "weekly" | "monthly" // Auto-reset behavior
  // Additional features
  color?: string // Hex color code for visual identification
  icon?: string // Icon name for visual identification
  timeWindow?: { // Time window for habit completion
    from: string // Time in HH:MM format
    to: string // Time in HH: MM format
  }
  // Enhanced statistics
  completionRecords: HabitCompletionRecord[] // Historical completion data
  weeklyCompletions?: number // Number of completions in the current week
  monthlyCompletions?: number // Number of completions in the current month
  successRate?: number // Overall success rate percentage
  trackEnergyLevel?: boolean // Whether to track energy level
  trackMood?: boolean // Whether to track mood
}

const PRESET_HABITS = [
  {
    name: "Daily meditation",
    description: "10 minutes of mindfulness meditation each morning",
    categories: ["Personal", "Health"]
  },
  {
    name: "Drink 8 glasses of water",
    description: "Stay hydrated throughout the day",
    categories: ["Health"]
  },
  {
    name: "Read for 30 minutes",
    description: "Improve knowledge and vocabulary",
    categories: ["Learning"]
  }
]

export function HabitModule() {
  const { categories } = useCategories()
  const { checkForNotifications } = useNotifications()
  const [habits, setHabits] = useState<Habit[]>([
    {
      id: "1",
      name: "Morning workout",
      streak: 15,
      bestStreak: 22,
      totalCompletions: 45,
      lastCompleted: new Date().toISOString().split("T")[0],
      completedToday: true,
      description: "30-minute cardio and strength training",
      categories: ["Health", "Personal"],
      type: "boolean",
      reminders: ["07:00"],
      frequency: "daily",
      resetSchedule: "daily",
      color: "#3b82f6", // blue
      icon: "dumbbell",
      completionRecords: [
        { date: new Date().toISOString().split("T")[0], energyLevel: 7, mood: 4, note: "Great energy today" },
        { date: new Date(Date.now() - 86400000).toISOString().split("T")[0], energyLevel: 6, mood: 3 }
      ]
    },
    {
      id: "2",
      name: "Evening journaling",
      streak: 8,
      bestStreak: 12,
      totalCompletions: 28,
      lastCompleted: null,
      completedToday: false,
      description: "Write down thoughts and reflections",
      categories: ["Personal"],
      type: "boolean",
      reminders: ["21:00"],
      frequency: "daily",
      resetSchedule: "daily",
      color: "#8b5cf6", // purple
      icon: "pen-tool",
      completionRecords: [
        { date: new Date(Date.now() - 86400000).toISOString().split("T")[0], energyLevel: 4, mood: 5, note: "Had a lot to reflect on" }
      ]
    },
    {
      id: "3",
      name: "Drink water",
      streak: 5,
      bestStreak: 10,
      totalCompletions: 20,
      lastCompleted: null,
      completedToday: false,
      description: "8 glasses of water daily",
      categories: ["Health"],
      type: "boolean",
      reminders: ["09:00", "12:00", "15:00"],
      frequency: "daily",
      resetSchedule: "daily",
      color: "#06b6d4", // cyan
      icon: "droplets",
      completionRecords: []
    },
    {
      id: "4",
      name: "Read books",
      streak: 12,
      bestStreak: 12,
      totalCompletions: 35,
      lastCompleted: new Date().toISOString().split("T")[0],
      completedToday: true,
      description: "Read at least 20 pages daily",
      categories: ["Learning"],
      type: "boolean",
      reminders: ["19:00"],
      frequency: "daily",
      resetSchedule: "daily",
      color: "#10b981", // green
      icon: "book",
      completionRecords: [
        { date: new Date().toISOString().split("T")[0], energyLevel: 5, mood: 4 },
        { date: new Date(Date.now() - 86400000).toISOString().split("T")[0], energyLevel: 6, mood: 4, note: "Finished an interesting chapter" }
      ]
    }
  ])
  const [sortBy, setSortBy] = useState<'streak' | 'name' | 'created' | 'manual'>('streak')
  const [filterByCategory, setFilterByCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [newHabitName, setNewHabitName] = useState("")
  const [showExtendedForm, setShowExtendedForm] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editType, setEditType] = useState<HabitType>("boolean")
  const [editNumericValue, setEditNumericValue] = useState(0)
  const [editNumericCondition, setEditNumericCondition] = useState<NumericCondition>("at-least")
  const [editNumericTarget, setEditNumericTarget] = useState(1)
  // New state variables for editing
  const [editReminders, setEditReminders] = useState<string[]>([])
  const [editFrequency, setEditFrequency] = useState<FrequencyType>("daily")
  const [editCustomDays, setEditCustomDays] = useState<number[]>([])
  const [editResetSchedule, setEditResetSchedule] = useState<"daily" | "weekly" | "monthly">("daily")
  const [editChecklistItems, setEditChecklistItems] = useState<ChecklistItem[]>([])
  const [newReminderTime, setNewReminderTime] = useState("")
  const [newChecklistItem, setNewChecklistItem] = useState("")
  // Additional state variables for editing
  const [editColor, setEditColor] = useState("#64748b")
  const [editIcon, setEditIcon] = useState("circle")
  const [editTimeWindowFrom, setEditTimeWindowFrom] = useState("")
  const [editTimeWindowTo, setEditTimeWindowTo] = useState("")
  // Daily logs state
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([])
  const [newLogNote, setNewLogNote] = useState("")
  // State for energy level, mood, and notes when completing habits
  const [habitEnergyLevels, setHabitEnergyLevels] = useState<Record<string, number>>({})
  const [habitMoodLevels, setHabitMoodLevels] = useState<Record<string, number>>({})
  const [habitNotes, setHabitNotes] = useState<Record<string, string>>({})
  const { toast } = useToast()

  // Handle drag and drop
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(filteredHabits);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update the habits state with the new order
    setHabits(items);
    setSortBy('manual'); // Switch to manual sorting mode
  }

  const getTodayString = () => {
    return new Date().toISOString().split("T")[0]
  }

  // Daily log functions
  const addDailyLog = () => {
    if (!newLogNote.trim()) return
    
    const today = getTodayString()
    const existingLogIndex = dailyLogs.findIndex(log => log.date === today)
    
    if (existingLogIndex >= 0) {
      // Update existing log
      const updatedLogs = [...dailyLogs]
      updatedLogs[existingLogIndex] = { ...updatedLogs[existingLogIndex], note: newLogNote }
      setDailyLogs(updatedLogs)
    } else {
      // Add new log
      setDailyLogs([...dailyLogs, { date: today, note: newLogNote }])
    }
    
    setNewLogNote("")
    toast({
      title: "Daily Log Updated",
      description: "Your note for today has been saved",
    })
  }

  const getTodaysLog = () => {
    const today = getTodayString()
    return dailyLogs.find(log => log.date === today)
  }

  const deleteDailyLog = (date: string) => {
    setDailyLogs(dailyLogs.filter(log => log.date !== date))
    toast({
      title: "Daily Log Deleted",
      description: "Your note has been removed",
    })
  }

  const addPresetHabit = (preset: (typeof PRESET_HABITS)[0]) => {
    const habit: Habit = {
      id: Date.now().toString(),
      name: preset.name,
      streak: 0,
      bestStreak: 0,
      totalCompletions: 0,
      lastCompleted: null,
      completedToday: false,
      description: preset.description,
      categories: preset.categories,
      type: "boolean",
      reminders: [],
      frequency: "daily",
      resetSchedule: "daily",
      color: "#64748b", // default gray
      icon: "circle",
      completionRecords: []
    }

    setHabits([...habits, habit])
    toast({
      title: "Habit Added!",
      description: `New habit "${preset.name}" created`,
    })
  }

  const addHabit = () => {
    if (!newHabitName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a habit name",
        variant: "destructive",
      })
      return
    }

    const habit: Habit = {
      id: Date.now().toString(),
      name: newHabitName,
      streak: 0,
      bestStreak: 0,
      totalCompletions: 0,
      lastCompleted: null,
      completedToday: false,
      type: "boolean",
      reminders: [],
      frequency: "daily",
      resetSchedule: "daily",
      color: "#64748b", // default gray
      icon: "circle",
      completionRecords: []
    }

    setHabits([...habits, habit])
    setNewHabitName("")
    toast({
      title: "Habit Created!",
      description: "Start building your streak today",
    })
  }

  const addExtendedHabit = (habitData: {
    name: string;
    description: string;
    type: HabitType;
    numericCondition?: NumericCondition;
    numericTarget?: number;
    categories: string[];
    reminders: string[];
    frequency: FrequencyType;
    customDays: number[];
    resetSchedule: "daily" | "weekly" | "monthly";
    color: string;
    icon: string;
    timeWindow?: { from: string; to: string };
    trackEnergyLevel?: boolean;
    trackMood?: boolean;
  }) => {
    const habit: Habit = {
      id: Date.now().toString(),
      name: habitData.name,
      streak: 0,
      bestStreak: 0,
      totalCompletions: 0,
      lastCompleted: null,
      completedToday: false,
      description: habitData.description,
      categories: habitData.categories,
      type: habitData.type,
      numericCondition: habitData.numericCondition,
      numericTarget: habitData.numericTarget,
      reminders: habitData.reminders,
      frequency: habitData.frequency,
      customDays: habitData.customDays,
      resetSchedule: habitData.resetSchedule,
      color: habitData.color,
      icon: habitData.icon,
      timeWindow: habitData.timeWindow,
      trackEnergyLevel: habitData.trackEnergyLevel,
      trackMood: habitData.trackMood,
      completionRecords: []
    }

    setHabits([...habits, habit])
    setShowExtendedForm(false)
    toast({
      title: "Habit Created!",
      description: "Start building your streak with extended settings",
    })
  }

  const completeHabit = (id: string, energyLevel: number = 5, mood: number = 3, note: string = "") => {
    const today = getTodayString()
    const habit = habits.find((h) => h.id === id)
    if (!habit) return

    if (habit.completedToday) {
      toast({
        title: "Already Completed",
        description: "You've already completed this habit today!",
      })
      return
    }

    const newStreak = habit.streak + 1
    const newBestStreak = Math.max(newStreak, habit.bestStreak)
    
    // Add completion record
    const newCompletionRecord: HabitCompletionRecord = {
      date: today,
      energyLevel,
      mood,
      note
    }

    const updatedHabits = habits.map((h) =>
      h.id === id
        ? {
            ...h,
            streak: newStreak,
            bestStreak: newBestStreak,
            totalCompletions: h.totalCompletions + 1,
            lastCompleted: today,
            completedToday: true,
            completionRecords: [...(h.completionRecords || []), newCompletionRecord]
          }
        : h,
    )

    setHabits(updatedHabits)

    if (newStreak % 7 === 0) {
      toast({
        title: `${newStreak} Day Streak!`,
        description: "You're on fire! Keep it up!",
      })
    } else {
      toast({
        title: "Habit Completed!",
        description: `Streak: ${newStreak} days`,
      })
    }
  }

  const updateNumericHabit = (id: string, value: number, energyLevel: number = 5, mood: number = 3, note: string = "") => {
    const habit = habits.find((h) => h.id === id)
    if (!habit) return

    let completed = false
    if (habit.numericCondition === "at-least") {
      completed = value >= (habit.numericTarget || 0)
    } else if (habit.numericCondition === "less-than") {
      completed = value < (habit.numericTarget || 0)
    } else if (habit.numericCondition === "exactly") {
      completed = value === (habit.numericTarget || 0)
    }

    if (completed && !habit.completedToday) {
      const today = getTodayString()
      const newStreak = habit.streak + 1
      const newBestStreak = Math.max(newStreak, habit.bestStreak)
      
      // Add completion record
      const newCompletionRecord: HabitCompletionRecord = {
        date: today,
        value: value,
        energyLevel,
        mood,
        note
      }

      const updatedHabits = habits.map((h) =>
        h.id === id
          ? {
              ...h,
              numericValue: value,
              completedToday: true,
              streak: newStreak,
              bestStreak: newBestStreak,
              totalCompletions: h.totalCompletions + 1,
              lastCompleted: today,
              completionRecords: [...(h.completionRecords || []), newCompletionRecord]
            }
          : h,
      )

      setHabits(updatedHabits)

      if (newStreak % 7 === 0) {
        toast({
          title: `${newStreak} Day Streak!`,
          description: "You're on fire! Keep it up!",
        })
      } else {
        toast({
          title: "Habit Completed!",
          description: `Streak: ${newStreak} days`,
        })
      }
    } else {
      const updatedHabits = habits.map((h) =>
        h.id === id
          ? {
              ...h,
              numericValue: value,
            }
          : h,
      )
      setHabits(updatedHabits)
    }
  }

  // Function to update checklist habit completion
  const updateChecklistHabit = (id: string, energyLevel: number = 5, mood: number = 3, note: string = "") => {
    const habit = habits.find((h) => h.id === id)
    if (!habit || habit.type !== "checklist" || !habit.checklistItems) return

    // Check if all items are completed
    const allCompleted = habit.checklistItems.length > 0 && 
      habit.checklistItems.every(item => item.completed)

    if (allCompleted && !habit.completedToday) {
      const today = getTodayString()
      const newStreak = habit.streak + 1
      const newBestStreak = Math.max(newStreak, habit.bestStreak)
      
      // Add completion record
      const newCompletionRecord: HabitCompletionRecord = {
        date: today,
        energyLevel,
        mood,
        note
      }

      const updatedHabits = habits.map((h) =>
        h.id === id
          ? {
              ...h,
              completedToday: true,
              streak: newStreak,
              bestStreak: newBestStreak,
              totalCompletions: h.totalCompletions + 1,
              lastCompleted: today,
              completionRecords: [...(h.completionRecords || []), newCompletionRecord]
            }
          : h,
      )

      setHabits(updatedHabits)

      if (newStreak % 7 === 0) {
        toast({
          title: `${newStreak} Day Streak!`,
          description: "You're on fire! Keep it up!",
        })
      } else {
        toast({
          title: "Habit Completed!",
          description: `Streak: ${newStreak} days`,
        })
      }
    }
  }

  const deleteHabit = (id: string) => {
    setHabits(habits.filter((h) => h.id !== id))
    toast({
      title: "Habit Deleted",
      description: "Habit removed from your tracker",
    })
  }

  const resetDay = () => {
    const today = getTodayString()
    const updatedHabits = habits.map((h) => {
      // For daily reset schedule, reset all habits
      if (h.resetSchedule === "daily") {
        if (h.lastCompleted !== today) {
          return { ...h, completedToday: false, streak: 0 }
        }
        return { ...h, completedToday: false }
      }
      // For other schedules, just reset today's completion status
      return { ...h, completedToday: false }
    })
    setHabits(updatedHabits)
    toast({
      title: "Day Reset",
      description: "All habits are ready for today",
    })
  }

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit)
    setEditName(habit.name)
    setEditDescription(habit.description || "")
    setEditType(habit.type)
    setEditNumericValue(habit.numericValue || 0)
    setEditNumericCondition(habit.numericCondition || "at-least")
    setEditNumericTarget(habit.numericTarget || 1)
    // Initialize new fields for editing
    setEditReminders(habit.reminders || [])
    setEditFrequency(habit.frequency || "daily")
    setEditCustomDays(habit.customDays || [])
    setEditResetSchedule(habit.resetSchedule || "daily")
    setEditChecklistItems(habit.checklistItems || [])
    setNewChecklistItem("")
    // Initialize additional fields for editing
    setEditColor(habit.color || "#64748b")
    setEditIcon(habit.icon || "circle")
    setEditTimeWindowFrom(habit.timeWindow?.from || "")
    setEditTimeWindowTo(habit.timeWindow?.to || "")
  }

  const saveHabitEdits = () => {
    if (editingHabit) {
      const updatedHabits = habits.map(habit => 
        habit.id === editingHabit.id 
          ? { 
              ...habit, 
              name: editName,
              description: editDescription,
              type: editType,
              numericValue: editType === "numeric" ? editNumericValue : undefined,
              numericCondition: editType === "numeric" ? editNumericCondition : undefined,
              numericTarget: editType === "numeric" ? editNumericTarget : undefined,
              reminders: editReminders,
              frequency: editFrequency,
              customDays: editCustomDays,
              resetSchedule: editResetSchedule,
              checklistItems: editType === "checklist" ? editChecklistItems : habit.checklistItems,
              color: editColor,
              icon: editIcon,
              timeWindow: editTimeWindowFrom && editTimeWindowTo ? 
                { from: editTimeWindowFrom, to: editTimeWindowTo } : 
                undefined
            } 
          : habit
      )
      setHabits(updatedHabits)
      setEditingHabit(null)
      toast({
        title: "Habit Updated!",
        description: "Your habit has been successfully updated",
      })
    }
  }

  const getPriorityColorStyle = (categories?: string[]) => {
    // For habits, we'll use a default priority of 50 for color calculation
    const color = getPriorityColor(50, 'habits', categories);
    const glow = shouldGlow(50, 'habits', categories);
    
    if (!color) return {};
    
    const style: React.CSSProperties = {
      border: `2px solid ${color}`
    };
    
    if (glow) {
      style.boxShadow = `0 0 8px ${color}`;
    }
    
    return style;
  };

  const getConditionLabel = (condition: NumericCondition) => {
    switch (condition) {
      case "at-least": return "At least"
      case "less-than": return "Less than"
      case "exactly": return "Exactly"
      default: return ""
    }
  }

  // Function to add a reminder time
  const addReminder = (habitId: string, time: string) => {
    setHabits(habits.map(habit => 
      habit.id === habitId 
        ? { ...habit, reminders: [...(habit.reminders || []), time] } 
        : habit
    ));
  };

  // Function to remove a reminder time
  const removeReminder = (habitId: string, time: string) => {
    setHabits(habits.map(habit => 
      habit.id === habitId 
        ? { ...habit, reminders: (habit.reminders || []).filter(t => t !== time) } 
        : habit
    ));
  };

  // Function to add a checklist item
  const addChecklistItem = (habitId: string, itemName: string) => {
    setHabits(habits.map(habit => 
      habit.id === habitId && habit.type === "checklist"
        ? { 
            ...habit, 
            checklistItems: [
              ...(habit.checklistItems || []), 
              { id: Date.now().toString(), name: itemName, completed: false }
            ] 
          } 
        : habit
    ));
  };

  // Function to toggle a checklist item
  const toggleChecklistItem = (habitId: string, itemId: string) => {
    setHabits(habits.map(habit => 
      habit.id === habitId && habit.type === "checklist"
        ? { 
            ...habit, 
            checklistItems: (habit.checklistItems || []).map(item => 
              item.id === itemId ? { ...item, completed: !item.completed } : item
            )
          } 
        : habit
    ));
  };

  // Function to remove a checklist item
  const removeChecklistItem = (habitId: string, itemId: string) => {
    setHabits(habits.map(habit => 
      habit.id === habitId && habit.type === "checklist"
        ? { 
            ...habit, 
            checklistItems: (habit.checklistItems || []).filter(item => item.id !== itemId)
          } 
        : habit
    ));
  };

  // Function to calculate progress for numeric and checklist habits
  const getProgressPercentage = (habit: Habit): number => {
    if (habit.type === "numeric" && habit.numericTarget && habit.numericTarget > 0) {
      const currentValue = habit.numericValue || 0;
      return Math.min(100, Math.round((currentValue / habit.numericTarget) * 100));
    }
    
    if (habit.type === "checklist" && habit.checklistItems && habit.checklistItems.length > 0) {
      const completedItems = habit.checklistItems.filter(item => item.completed).length;
      return Math.round((completedItems / habit.checklistItems.length) * 100);
    }
    
    return 0;
  };

  // Function to handle auto-reset behavior
  const handleAutoReset = () => {
    const today = new Date();
    const todayString = today.toISOString().split("T")[0];
    
    // Get start of week (Monday)
    const startOfWeek = new Date(today);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday
    startOfWeek.setDate(diff);
    const startOfWeekString = startOfWeek.toISOString().split("T")[0];
    
    // Get start of month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfMonthString = startOfMonth.toISOString().split("T")[0];
    
    setHabits(habits.map(habit => {
      // Skip if already reset today
      if (habit.lastCompleted === todayString) return habit;
      
      // Handle reset based on schedule
      if (habit.resetSchedule === "daily") {
        if (habit.type === "boolean") {
          return { ...habit, completedToday: false };
        } else if (habit.type === "numeric") {
          return { ...habit, numericValue: 0 };
        } else if (habit.type === "checklist" && habit.checklistItems) {
          return { 
            ...habit, 
            checklistItems: habit.checklistItems.map(item => ({ ...item, completed: false }))
          };
        }
      } else if (habit.resetSchedule === "weekly") {
        // Reset if last completed date is before start of current week
        if (!habit.lastCompleted || habit.lastCompleted < startOfWeekString) {
          if (habit.type === "boolean") {
            return { ...habit, completedToday: false };
          } else if (habit.type === "numeric") {
            return { ...habit, numericValue: 0 };
          } else if (habit.type === "checklist" && habit.checklistItems) {
            return { 
              ...habit, 
              checklistItems: habit.checklistItems.map(item => ({ ...item, completed: false }))
            };
          }
        }
      } else if (habit.resetSchedule === "monthly") {
        // Reset if last completed date is before start of current month
        if (!habit.lastCompleted || habit.lastCompleted < startOfMonthString) {
          if (habit.type === "boolean") {
            return { ...habit, completedToday: false };
          } else if (habit.type === "numeric") {
            return { ...habit, numericValue: 0 };
          } else if (habit.type === "checklist" && habit.checklistItems) {
            return { 
              ...habit, 
              checklistItems: habit.checklistItems.map(item => ({ ...item, completed: false }))
            };
          }
        }
      }
      
      return habit;
    }));
  };

  // Run auto-reset on component mount and when date changes
  useEffect(() => {
    const today = getTodayString();
    // Only run auto-reset if it hasn't been run for today
    const win = window as any;
    if (!win.habitAutoResetLastRun || win.habitAutoResetLastRun !== today) {
      win.habitAutoResetLastRun = today;
      handleAutoReset();
    }
  }, [habits]); // Monitor habits to detect when state updates occur
  
  // Listen for changes to habits from other modules (e.g., challenge to habit conversion)
  useEffect(() => {
    const handleHabitsUpdate = (event: CustomEvent) => {
      setHabits(event.detail);
    };
    
    window.addEventListener('habitsUpdated', handleHabitsUpdate as EventListener);
    
    return () => {
      window.removeEventListener('habitsUpdated', handleHabitsUpdate as EventListener);
    };
  }, []);

  // Add daily note for a habit
  const addDailyNote = (habitId: string, note: string) => {
    const today = getTodayString();
    const updatedHabits = habits.map(habit => {
      if (habit.id === habitId) {
        // For simplicity, we'll store the note directly in the habit
        // In a real app, this would be stored separately
        return {
          ...habit,
          dailyNotes: {
            ...(habit as any).dailyNotes || {},
            [today]: note
          }
        };
      }
      return habit;
    });
    setHabits(updatedHabits);
  };

  // Get daily note for a habit
  const getDailyNote = (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return "";
    const today = getTodayString();
    return (habit as any).dailyNotes?.[today] || "";
  };

  // Calculate success rate for a habit
  const calculateSuccessRate = (habit: Habit) => {
    if (habit.totalCompletions === 0) return 0;
    // For simplicity, we'll calculate based on total completions vs streak
    // In a real app, this would be based on actual tracked days
    const totalDays = Math.max(habit.totalCompletions, habit.bestStreak);
    return totalDays > 0 ? Math.round((habit.totalCompletions / totalDays) * 100) : 0;
  };
  
  // Calculate weekly completions
  const calculateWeeklyCompletions = (habit: Habit) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return habit.completionRecords.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= oneWeekAgo;
    }).length;
  };
  
  // Calculate monthly completions
  const calculateMonthlyCompletions = (habit: Habit) => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    return habit.completionRecords.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= oneMonthAgo;
    }).length;
  };
  
  // Calculate average energy level for a habit
  const calculateAvgEnergyLevel = (habit: Habit) => {
    if (!habit.completionRecords || habit.completionRecords.length === 0) return 0;
    
    const totalEnergy = habit.completionRecords.reduce((sum, record) => {
      return sum + (record.energyLevel || 0);
    }, 0);
    
    return Math.round(totalEnergy / habit.completionRecords.length);
  };
  
  // Calculate average mood for a habit
  const calculateAvgMood = (habit: Habit) => {
    if (!habit.completionRecords || habit.completionRecords.length === 0) return 0;
    
    const totalMood = habit.completionRecords.reduce((sum, record) => {
      return sum + (record.mood || 0);
    }, 0);
    
    return Math.round(totalMood / habit.completionRecords.length);
  };

  const totalStreakDays = habits.reduce((sum, h) => sum + h.streak, 0)
  const completedToday = habits.filter((h) => h.completedToday).length
  const completionRate = habits.length > 0 ? (completedToday / habits.length) * 100 : 0

  // Filter and sort habits
  const filteredHabits = habits
    .filter((h) => filterByCategory === 'all' || (h.categories && h.categories.includes(filterByCategory)))
    .filter((h) => searchTerm === '' || h.name.toLowerCase().includes(searchTerm.toLowerCase()) || (h.description && h.description.toLowerCase().includes(searchTerm.toLowerCase())))
    .sort((a, b) => {
      if (sortBy === 'streak') {
        return b.streak - a.streak;
      } else if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'created') {
        return a.id.localeCompare(b.id);
      }
      // For manual sorting, we preserve the current order
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* Top Bar with Sorting and Add Button */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Search */}
              <div className="w-full sm:w-64">
                <Input
                  placeholder="Search habits..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-lg border-border focus:border-primary"
                />
              </div>
              
              {/* Sort By */}
              <div className="w-full sm:w-40">
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                  <SelectTrigger className="rounded-lg border-border focus:border-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="streak">Streak</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="created">Creation Date</SelectItem>
                    <SelectItem value="manual">Manual Order</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Filter by Category */}
              <div className="w-full sm:w-40">
                <Select value={filterByCategory} onValueChange={(value) => setFilterByCategory(value)}>
                  <SelectTrigger className="rounded-lg border-border focus:border-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category: any) => (
                      <SelectItem key={category.id} value={category.name}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Add Habit Button */}
            <div>
              <Dialog open={showExtendedForm} onOpenChange={setShowExtendedForm}>
                <DialogTrigger asChild>
                  <Button className="rounded-lg">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Habit
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Habit</DialogTitle>
                  </DialogHeader>
                  <ExtendedHabitForm 
                    onSubmit={addExtendedHabit} 
                    onCancel={() => setShowExtendedForm(false)} 
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Habits List */}
      {filteredHabits.length > 0 ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Habits ({filteredHabits.length})</CardTitle>
              <Button variant="outline" size="sm" onClick={resetDay}>
                Reset Day
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredHabits.map((habit) => (
                <div
                  key={habit.id}
                  className={`p-4 rounded-lg border transition-all ${
                    habit.completedToday ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-accent/50"
                  }`}
                  style={getPriorityColorStyle(habit.categories)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {habit.color && (
                          <div 
                            className="w-4 h-4 rounded-full border border-border" 
                            style={{ backgroundColor: habit.color }}
                          />
                        )}
                        {habit.icon && (
                          <div className="text-muted-foreground">
                            <Circle className="h-4 w-4" />
                          </div>
                        )}
                        <h3 className="font-semibold text-foreground">{habit.name}</h3>
                      </div>
                      {habit.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {habit.description}
                        </p>
                      )}
                      {habit.type === "numeric" && (
                        <p className="text-xs text-muted-foreground mb-2">
                          {getConditionLabel(habit.numericCondition || "at-least")} {habit.numericTarget}
                        </p>
                      )}
                      {habit.timeWindow && (
                        <p className="text-xs text-muted-foreground mb-2">
                          Time window: {habit.timeWindow.from} - {habit.timeWindow.to}
                        </p>
                      )}
                      {habit.type === "checklist" && habit.checklistItems && habit.checklistItems.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {habit.checklistItems.map((item) => (
                            <div key={item.id} className="flex items-center gap-2">
                              <input 
                                type="checkbox" 
                                checked={item.completed}
                                onChange={() => {
                                  toggleChecklistItem(habit.id, item.id);
                                  // Check if all items are now completed to trigger habit completion
                                  setTimeout(() => {
                                    const updatedHabit = habits.find(h => h.id === habit.id);
                                    if (updatedHabit && updatedHabit.type === "checklist" && updatedHabit.checklistItems) {
                                      const allCompleted = updatedHabit.checklistItems.length > 0 && 
                                        updatedHabit.checklistItems.every(i => i.completed);
                                      if (allCompleted) {
                                        updateChecklistHabit(habit.id, habitEnergyLevels[habit.id] || 5, habitMoodLevels[habit.id] || 3, habitNotes[habit.id] || "");
                                      }
                                    }
                                  }, 0);
                                }}
                                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                              />
                              <span className={item.completed ? "line-through text-muted-foreground" : ""}>
                                {item.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {habit.categories && habit.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {habit.categories.map((cat, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Flame className="h-3 w-3" />
                          {habit.streak} day streak
                        </Badge>
                        <Badge variant="outline">Best: {habit.bestStreak}</Badge>
                        <Badge variant="outline">Total: {habit.totalCompletions}</Badge>
                        <Badge variant="outline">Success: {calculateSuccessRate(habit)}%</Badge>
                        <Badge variant="outline">This Week: {calculateWeeklyCompletions(habit)}</Badge>
                        <Badge variant="outline">Avg Energy: {calculateAvgEnergyLevel(habit)}/10</Badge>
                        <Badge variant="outline">Avg Mood: {calculateAvgMood(habit)}/5</Badge>
                      </div>
                      {/* Progress bar for numeric and checklist habits */}
                      {(habit.type === "numeric" || habit.type === "checklist") && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>
                              {habit.type === "numeric" 
                                ? `${habit.numericValue || 0}/${habit.numericTarget || 0}`
                                : `${habit.checklistItems?.filter(item => item.completed).length || 0}/${habit.checklistItems?.length || 0} items`
                              }
                            </span>
                            <span>{getProgressPercentage(habit)}%</span>
                          </div>
                          <Progress value={getProgressPercentage(habit)} className="h-2" />
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {habit.type === "boolean" ? (
                        <Button
                          onClick={() => completeHabit(habit.id, habitEnergyLevels[habit.id] || 5, habitMoodLevels[habit.id] || 3, habitNotes[habit.id] || "")}
                          disabled={habit.completedToday}
                          variant={habit.completedToday ? "secondary" : "default"}
                          size="sm"
                        >
                          {habit.completedToday ? "Done Today" : "Complete"}
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={habit.numericValue || 0}
                            onChange={(e) => updateNumericHabit(habit.id, Number(e.target.value), habitEnergyLevels[habit.id] || 5, habitMoodLevels[habit.id] || 3, habitNotes[habit.id] || "")}
                            className="w-20"
                            min="0"
                          />
                          <Button
                            onClick={() => updateNumericHabit(habit.id, habit.numericValue || 0, habitEnergyLevels[habit.id] || 5, habitMoodLevels[habit.id] || 3, habitNotes[habit.id] || "")}
                            size="sm"
                          >
                            Update
                          </Button>
                        </div>
                      )}
                      <div className="flex gap-1">
                        {/* Analytics Button */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Sparkles className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden">
                            <div className="sr-only">Habit Analytics</div>
                            <HabitAnalyticsModal habit={habit} />
                          </DialogContent>
                        </Dialog>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEditHabit(habit)}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Edit Habit</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit-name">Habit Name</Label>
                                <Input
                                  id="edit-name"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea
                                  id="edit-description"
                                  value={editDescription}
                                  onChange={(e) => setEditDescription(e.target.value)}
                                  rows={3}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-type">Habit Type</Label>
                                <Select value={editType} onValueChange={(value) => setEditType(value as HabitType)}>
                                  <SelectTrigger id="edit-type">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="boolean">Yes/No Habit</SelectItem>
                                    <SelectItem value="numeric">Numeric Habit</SelectItem>
                                    <SelectItem value="checklist">Checklist Habit</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              {editType === "numeric" && (
                                <>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-condition">Condition</Label>
                                    <Select value={editNumericCondition} onValueChange={(value) => setEditNumericCondition(value as NumericCondition)}>
                                      <SelectTrigger id="edit-condition">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="at-least">At least</SelectItem>
                                        <SelectItem value="less-than">Less than</SelectItem>
                                        <SelectItem value="exactly">Exactly</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-target">Target Value</Label>
                                    <Input
                                      id="edit-target"
                                      type="number"
                                      min="1"
                                      value={editNumericTarget}
                                      onChange={(e) => setEditNumericTarget(Math.max(1, Number(e.target.value)))}
                                    />
                                  </div>
                                </>
                              )}
                              {/* Reminders Section */}
                              <div className="space-y-2">
                                <Label>Reminders</Label>
                                <div className="flex gap-2">
                                  <Input
                                    type="time"
                                    id="reminder-time"
                                    value={newReminderTime}
                                    onChange={(e) => setNewReminderTime(e.target.value)}
                                  />
                                  <Button 
                                    onClick={() => {
                                      if (newReminderTime) {
                                        setEditReminders([...editReminders, newReminderTime]);
                                        setNewReminderTime("");
                                      }
                                    }}
                                  >
                                    Add
                                  </Button>
                                </div>
                                {editReminders.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {editReminders.map((time, index) => (
                                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                        {time}
                                        <button 
                                          onClick={() => setEditReminders(editReminders.filter((_, i) => i !== index))}
                                          className="ml-1 hover:text-destructive"
                                        >
                                          ×
                                        </button>
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                              {/* Frequency Section */}
                              <div className="space-y-2">
                                <Label htmlFor="edit-frequency">Frequency</Label>
                                <Select value={editFrequency} onValueChange={(value) => setEditFrequency(value as FrequencyType)}>
                                  <SelectTrigger id="edit-frequency">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="custom">Custom</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              {/* Reset Schedule Section */}
                              <div className="space-y-2">
                                <Label htmlFor="edit-reset-schedule">Auto-Reset Schedule</Label>
                                <Select value={editResetSchedule} onValueChange={(value) => setEditResetSchedule(value as "daily" | "weekly" | "monthly")}>
                                  <SelectTrigger id="edit-reset-schedule">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              {/* Checklist Items Section (for checklist habits) */}
                              {editType === "checklist" && (
                                <div className="space-y-2">
                                  <Label>Checklist Items</Label>
                                  {/* Add new checklist item */}
                                  <div className="flex gap-2">
                                    <Input
                                      type="text"
                                      placeholder="New checklist item..."
                                      value={newChecklistItem}
                                      onChange={(e) => setNewChecklistItem(e.target.value)}
                                    />
                                    <Button 
                                      onClick={() => {
                                        if (newChecklistItem.trim()) {
                                          setEditChecklistItems([
                                            ...editChecklistItems, 
                                            { id: Date.now().toString(), name: newChecklistItem, completed: false }
                                          ]);
                                          setNewChecklistItem("");
                                        }
                                      }}
                                    >
                                      Add
                                    </Button>
                                  </div>
                                  {/* Existing checklist items */}
                                  {editChecklistItems.length > 0 && (
                                    <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                                      {editChecklistItems.map((item, index) => (
                                        <div key={item.id} className="flex items-center gap-2">
                                          <input 
                                            type="checkbox" 
                                            checked={item.completed}
                                            onChange={(e) => {
                                              const updatedItems = [...editChecklistItems];
                                              updatedItems[index] = { ...item, completed: e.target.checked };
                                              setEditChecklistItems(updatedItems);
                                            }}
                                            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                                          />
                                          <Input
                                            type="text"
                                            value={item.name}
                                            onChange={(e) => {
                                              const updatedItems = [...editChecklistItems];
                                              updatedItems[index] = { ...item, name: e.target.value };
                                              setEditChecklistItems(updatedItems);
                                            }}
                                            className="flex-1"
                                          />
                                          <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-5 w-5 text-muted-foreground hover:text-destructive"
                                            onClick={() => {
                                              setEditChecklistItems(editChecklistItems.filter((_, i) => i !== index));
                                            }}
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                              {/* Visual Color Section */}
                              <div className="space-y-2">
                                <Label htmlFor="edit-color">Visual Color</Label>
                                <div className="flex items-center gap-2">
                                  <Input
                                    id="edit-color"
                                    type="color"
                                    value={editColor}
                                    onChange={(e) => setEditColor(e.target.value)}
                                    className="w-12 h-10 p-1"
                                  />
                                  <Input
                                    type="text"
                                    value={editColor}
                                    onChange={(e) => setEditColor(e.target.value)}
                                    placeholder="#64748b"
                                    className="flex-1"
                                  />
                                </div>
                              </div>
                              {/* Icon Section */}
                              <div className="space-y-2">
                                <Label htmlFor="edit-icon">Icon</Label>
                                <Input
                                  id="edit-icon"
                                  type="text"
                                  value={editIcon}
                                  onChange={(e) => setEditIcon(e.target.value)}
                                  placeholder="circle"
                                />
                              </div>
                              {/* Time Window Section */}
                              <div className="space-y-2">
                                <Label>Time Window</Label>
                                <div className="flex gap-2">
                                  <div className="flex-1">
                                    <Label htmlFor="time-window-from" className="text-xs">From</Label>
                                    <Input
                                      id="time-window-from"
                                      type="time"
                                      value={editTimeWindowFrom}
                                      onChange={(e) => setEditTimeWindowFrom(e.target.value)}
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <Label htmlFor="time-window-to" className="text-xs">To</Label>
                                    <Input
                                      id="time-window-to"
                                      type="time"
                                      value={editTimeWindowTo}
                                      onChange={(e) => setEditTimeWindowTo(e.target.value)}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setEditingHabit(null)}>
                                  Cancel
                                </Button>
                                <Button onClick={saveHabitEdits}>
                                  Save Changes
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteHabit(habit.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No habits yet. Add your first habit to start building streaks!</p>
          </CardContent>
        </Card>
      )}

      {/* Preset Habits at the Bottom */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Quick Start Habits
          </CardTitle>
          <CardDescription>Preset habits to help you get started quickly</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PRESET_HABITS.map((preset, index) => (
              <div
                key={index}
                className="p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                onClick={() => addPresetHabit(preset)}
              >
                <h4 className="font-semibold text-foreground">{preset.name}</h4>
                <p className="text-sm text-muted-foreground mt-2">{preset.description}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {preset.categories.map((cat, catIndex) => (
                    <Badge key={catIndex} variant="outline" className="text-xs px-2 py-1">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
