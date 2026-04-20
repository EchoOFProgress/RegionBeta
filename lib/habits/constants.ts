import { Habit } from "./types"

export const PRESET_HABITS = [
  {
    name: "Daily meditation",
    description: "10 minutes of mindfulness meditation each morning"
  },
  {
    name: "Drink 8 glasses of water",
    description: "Stay hydrated throughout the day"
  },
  {
    name: "Read for 30 minutes",
    description: "Improve knowledge and vocabulary"
  }
]

export const DEFAULT_HABITS: Habit[] = [
  {
    id: "1",
    name: "Morning workout",
    streak: 15,
    bestStreak: 22,
    totalCompletions: 45,
    lastCompleted: new Date().toISOString().split("T")[0],
    completedToday: true,
    description: "30-minute cardio and strength training",
    type: "boolean",
    reminders: ["07:00"],
    frequency: "daily",
    resetSchedule: "daily",
    color: "#3b82f6",
    icon: "dumbbell",
    completionRecords: []
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
    type: "boolean",
    reminders: ["21:00"],
    frequency: "daily",
    resetSchedule: "daily",
    color: "#8b5cf6",
    icon: "pen-tool",
    completionRecords: []
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
    type: "boolean",
    reminders: ["09:00", "12:00", "15:00"],
    frequency: "daily",
    resetSchedule: "daily",
    color: "#06b6d4",
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
    type: "boolean",
    reminders: ["19:00"],
    frequency: "daily",
    resetSchedule: "daily",
    color: "#10b981",
    icon: "book",
    completionRecords: []
  }
]
