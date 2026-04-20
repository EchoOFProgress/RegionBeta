export type Milestone = {
  id: string
  title: string
  description: string
  targetDate?: string
  completed: boolean
  completedDate?: string
  linkedModules?: {
    tasks: string[]
    habits: string[]
    challenges: string[]
  }
}

export type GoalDependency = {
  id: string
  type: 'must-complete-before' | 'parallel' | 'sequential' | 'blocking'
}

export type ResourceItem = {
  id: string
  type: 'document' | 'link' | 'budget' | 'contact' | 'equipment' | 'learning'
  name: string
  url?: string
  description?: string
  addedAt: string
}

export type NoteItem = {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

export type SuccessCriteria = {
  id: string
  description: string
  isCompleted: boolean
  targetDate?: string
  completedDate?: string
  progress?: number
}

export type MotivationSource = {
  id: string
  type: 'personal' | 'external' | 'visual' | 'quote' | 'reward'
  content: string
  description?: string
  addedAt: string
}

export type MotivationTracker = {
  level?: number
  lastUpdated?: string
  history?: { date: string; level: number; note?: string }[]
  sources?: MotivationSource[]
  triggers?: string[]
  barriers?: string[]
}

export type VisionItem = {
  id: string
  type: 'image' | 'quote' | 'note'
  content: string
  caption?: string
  addedAt: string
}

export type Goal = {
  id: string
  title: string
  description: string
  progress: number
  totalItems: number
  completedItems: number
  createdAt: string
  targetDate?: string
  motivation?: string
  currentState?: string
  desiredState?: string
  linkedTasks?: string[]
  linkedHabits?: string[]
  linkedChallenges?: string[]
  milestones?: Milestone[]
  visionBoard?: VisionItem[]
  dependencies?: GoalDependency[]
  dependents?: string[]
  resourcesList?: ResourceItem[]
  notes?: NoteItem[]
  successCriteria?: SuccessCriteria[]
  motivationTracker?: MotivationTracker
  completed?: boolean
}

export type LinkedItem = {
  id: string
  type: "task" | "habit" | "challenge"
  title: string
  completed: boolean
}
