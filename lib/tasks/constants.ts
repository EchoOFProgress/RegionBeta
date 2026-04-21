import { PresetTask, Task } from "./types"

export const PRESET_TASKS: PresetTask[] = [
  {
    title: "Finish quarterly report",
    priority: 85,
    description: "Complete the Q3 financial report for the board meeting",
    timeEstimate: 120,
  },
  {
    title: "Morning workout routine",
    priority: 70,
    description: "30-minute cardio and strength training session",
    timeEstimate: 30,
  },
  {
    title: "Read 30 pages of book",
    priority: 45,
    description: "Continue reading 'Atomic Habits' by James Clear",
    timeEstimate: 45,
  }
]

export const DEFAULT_TASKS: Task[] = []
