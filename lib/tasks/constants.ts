import { PresetTask, Task } from "./types"

export const PRESET_TASKS: PresetTask[] = [
  {
    title: "Finish quarterly report",
    priority: 85,
    description: "Complete the Q3 financial report for the board meeting",
    timeEstimate: 120,
    energyLevel: 8
  },
  {
    title: "Morning workout routine",
    priority: 70,
    description: "30-minute cardio and strength training session",
    timeEstimate: 30,
    energyLevel: 7
  },
  {
    title: "Read 30 pages of book",
    priority: 45,
    description: "Continue reading 'Atomic Habits' by James Clear",
    timeEstimate: 45,
    energyLevel: 3
  }
]

export const DEFAULT_TASKS: Task[] = [
  {
    id: "1",
    title: "Complete project proposal",
    priority: 90,
    completed: false,
    type: "boolean",
    description: "Finish the client proposal document and send for review",
    dueDate: "2023-11-10",
    timeEstimate: 90,
    energyLevel: 7,
    tags: [],
    streak: 0,
    bestStreak: 0,
    completionRecords: []
  },
  {
    id: "2",
    title: "Team meeting preparation",
    priority: 65,
    completed: true,
    type: "boolean",
    description: "Prepare agenda and materials for tomorrow's team meeting",
    timeEstimate: 30,
    energyLevel: 5,
    tags: [],
    streak: 1,
    bestStreak: 1,
    lastCompleted: new Date().toISOString().split('T')[0],
    completionRecords: [{ date: new Date().toISOString().split('T')[0], energyLevel: 5 }]
  },
  {
    id: "3",
    title: "Buy groceries",
    priority: 30,
    completed: false,
    type: "boolean",
    description: "Milk, bread, fruits, and vegetables",
    timeEstimate: 45,
    energyLevel: 3,
    tags: [],
    streak: 0,
    bestStreak: 0,
    completionRecords: []
  },
  {
    id: "4",
    title: "Call dentist for appointment",
    priority: 40,
    completed: false,
    type: "boolean",
    description: "Schedule annual checkup",
    timeEstimate: 15,
    energyLevel: 4,
    tags: [],
    streak: 0,
    bestStreak: 0,
    completionRecords: []
  }
]
