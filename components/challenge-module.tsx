"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Plus,
  Trash2,
  Target,
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  Folder,
  Settings,
  Sparkles,
  Trophy,
  GripVertical,
  Book,
  Dumbbell,
  Award,
  TrendingUp,
  Tags,
  Users,
  FileText,
  Palette,
  Flame,
  Flag
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
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
import { ChallengeAnalyticsModal } from "@/components/challenge-analytics-modal"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { useCategories } from "@/lib/category-context"
import { storage } from "@/lib/storage"
import { useNotifications } from "@/lib/notification-context"
import { ProjectStatistics } from "@/components/project-statistics"
import { useAuth } from "@/lib/auth-context"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

type Category = {
  id: string
  name: string
  color: string
  description?: string
}

type ChallengeStatus = "upcoming" | "active" | "completed" | "failed"

type ChallengeGoalType = "daily-completion" | "total-amount" | "checklist" | "points"

type DailyTask = {
  day: number
  task: string
  done: boolean
}

// Define Habit-related types for conversion functionality
interface HabitCompletionRecord {
  date: string // YYYY-MM-DD
  value?: number // For numeric habits
  energyLevel?: number // Energy level (1-10) used to complete
  mood?: number // Mood rating (1-5)
  note?: string
}

interface Habit {
  id: string
  name: string
  streak: number
  bestStreak: number
  totalCompletions: number
  lastCompleted: string | null
  completedToday: boolean
  description?: string
  categories?: string[]
  type: 'boolean' | 'numeric' | 'checklist'
  numericValue?: number
  numericCondition?: 'at-least' | 'less-than' | 'exactly'
  numericTarget?: number
  reminders?: string[] // Array of time strings for notifications
  frequency?: 'daily' | 'weekly' | 'monthly' | 'custom'
  customDays?: number[] // For custom frequency (0-6 for Sun-Sat)
  checklistItems?: { id: string; name: string; completed: boolean }[]
  resetSchedule?: "daily" | "weekly" | "monthly" // Auto-reset behavior
  color?: string // Hex color code for visual identification
  icon?: string // Icon name for visual identification
  timeWindow?: { // Time window for habit completion
    from: string // Time in HH:MM format
    to: string // Time in HH: MM format
  }
  completionRecords: HabitCompletionRecord[] // Historical completion data
  weeklyCompletions?: number // Number of completions in the current week
  monthlyCompletions?: number // Number of completions in the current month
  successRate?: number // Overall success rate percentage
}

export type Milestone = {
  id: string
  title: string
  description: string
  targetValue: number
  currentValue: number
  achieved: boolean
  achievedDate?: string
  color: string
}

export type Challenge = {
  id: string
  title: string
  description: string
  duration: number
  currentDay: number
  status: ChallengeStatus
  startDate: string
  endDate: string
  lastCheckedIn: string | null
  categories: string[]
  goalType: ChallengeGoalType
  failureMode: "hard" | "soft" | "retry-limit"
  maxFailures?: number
  currentFailures: number
  notes: { [date: string]: string }
  difficulty: number
  color: string
  icon: string

  archived: boolean
  dailyTasks?: DailyTask[]
  // Progress tracking fields
  totalAmount?: number // For total-amount goal type
  currentAmount?: number // For total-amount goal type
  dailyTarget?: number // For daily pace calculation
  dailyProgress?: number[] // Daily progress amounts
  dailyNotes?: { [date: string]: string } // Daily notes
  dailyEnergy?: { [date: string]: number } // Daily energy levels
  // Link to goals
  linkedGoalId?: string // ID of the goal this challenge is linked to
  // Streak tracking
  currentStreak?: number // Current consecutive days of completion
  bestStreak?: number // Best streak achieved during this challenge
  lastCompletedDate?: string // Date of last completion
  completionRecords?: { date: string; amount: number; energyLevel?: number; note?: string }[] // Historical completion data
  milestones?: Milestone[] // Challenge milestones
}

const PRESET_CHALLENGES = [
  {
    title: "7-Day Productivity Sprint",
    description: "Complete at least 3 tasks daily for 7 days",
    duration: 7
  },
  {
    title: "30-Day Habit Builder",
    description: "Maintain a 30-day streak on any habit",
    duration: 30
  },
  {
    title: "Weekend Warrior",
    description: "Complete 5 high-priority tasks this weekend",
    duration: 2
  },
  {
    title: "Early Bird Challenge",
    description: "Wake up before 7 AM for 14 days",
    duration: 14
  },
]

export function ChallengeModule() {
  const { categories } = useCategories()
  const { checkForNotifications } = useNotifications()
  const { token } = useAuth()
  const { toast } = useToast()

  const getTodayString = () => {
    return new Date().toISOString().split("T")[0]
  }

  // Helper function to calculate end date based on start date and duration
  const calculateEndDate = (startDate: string, duration: number) => {
    const start = new Date(startDate)
    const end = new Date(start)
    end.setDate(end.getDate() + duration)
    return end.toISOString().split("T")[0]
  }

  // Helper function to calculate progress percentage for a challenge
  const getProgressPercentage = (challenge: Challenge) => {
    if (challenge.duration <= 0) return 0
    return Math.round((challenge.currentDay / challenge.duration) * 100)
  }

  // Helper function to get days until start
  const getDaysUntilStart = (challenge: Challenge) => {
    const today = new Date()
    const startDate = new Date(challenge.startDate)
    const diffTime = startDate.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // Helper function to get days remaining
  const getDaysRemaining = (challenge: Challenge) => {
    const today = new Date()
    const endDate = new Date(challenge.endDate)
    const diffTime = endDate.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // Helper function to get status color
  const getStatusColor = (status: ChallengeStatus) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800"
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-purple-100 text-purple-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Helper function to calculate daily pace needed
  const getDailyPaceNeeded = (challenge: Challenge) => {
    const startDate = new Date(challenge.startDate);
    const endDate = new Date(challenge.endDate);
    const totalDuration = challenge.duration;

    // Calculate days elapsed since start
    const today = new Date();
    const daysSinceStart = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // For now, assume 100% represents total goal amount
    const totalGoal = 100; // This could be configurable
    const dailyTarget = totalGoal / totalDuration;

    // Calculate how much should have been completed by now
    const expectedCompleted = daysSinceStart > 0 ? daysSinceStart * dailyTarget : 0;

    // Calculate actual progress
    const actualProgress = challenge.currentDay * dailyTarget;

    return {
      dailyTarget,
      expectedCompleted,
      actualProgress,
      daysBehind: expectedCompleted > actualProgress ? expectedCompleted - actualProgress : 0,
      daysAhead: actualProgress > expectedCompleted ? actualProgress - expectedCompleted : 0,
      pace: expectedCompleted > 0 ? (actualProgress / expectedCompleted) * 100 : 100 // Percentage of pace
    };
  };

  // Helper function to get pace status
  const getPaceStatus = (challenge: Challenge) => {
    const pace = getDailyPaceNeeded(challenge);
    if (pace.pace > 110) return 'ahead';
    if (pace.pace < 90) return 'behind';
    return 'on track';
  };

  // Helper function to get pace color
  const getPaceColor = (challenge: Challenge) => {
    const status = getPaceStatus(challenge);
    switch (status) {
      case 'ahead':
        return 'text-green-600';
      case 'behind':
        return 'text-red-600';
      case 'on track':
      default:
        return 'text-blue-600';
    }
  };

  // Helper function to get pace icon
  const getPaceIcon = (challenge: Challenge) => {
    const status = getPaceStatus(challenge);
    switch (status) {
      case 'ahead':
        return '📈';
      case 'behind':
        return '📉';
      case 'on track':
      default:
        return '➡️';
    }
  };

  // Helper function to calculate completion rate
  const getCompletionRate = (challenge: Challenge) => {
    if (!challenge.dailyProgress) return 0;
    const completedDays = challenge.dailyProgress.filter(d => d > 0).length;
    return challenge.dailyProgress.length > 0 ? Math.round((completedDays / challenge.dailyProgress.length) * 100) : 0;
  }

  // Helper function to get priority color style
  const getPriorityColorStyle = (categories?: string[]) => {
    // For challenges, we'll use a default priority of 50 for color calculation
    const color = getPriorityColor(50, 'challenges', categories);
    const glow = shouldGlow(50, 'challenges', categories);

    if (!color) return {};

    const style: React.CSSProperties = {
      border: `2px solid ${color}`
    };

    if (glow) {
      style.boxShadow = `0 0 8px ${color}`;
    }

    return style;
  };

  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch projects from the backend
  useEffect(() => {
    const fetchProjects = async () => {
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`${API_BASE_URL}/projects`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          setChallenges(data)
        } else {
          console.error("Failed to fetch projects")
        }
      } catch (error) {
        console.error("Error fetching projects:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [token])

  // State for energy level and notes when checking in
  const [challengeEnergyLevels, setChallengeEnergyLevels] = useState<Record<string, number>>({})
  const [challengeNotes, setChallengeNotes] = useState<Record<string, string>>({})
  const [sortBy, setSortBy] = useState<'progress' | 'name' | 'created' | 'manual'>('progress')
  const [filterByCategory, setFilterByCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [customTitle, setCustomTitle] = useState("")
  const [customDescription, setCustomDescription] = useState("")
  const [showCustomDescription, setShowCustomDescription] = useState<boolean>(false)
  const [showCustomCategories, setShowCustomCategories] = useState<boolean>(false)
  const [showCustomStartDate, setShowCustomStartDate] = useState<boolean>(false)
  const [showCustomDifficulty, setShowCustomDifficulty] = useState<boolean>(false)
  const [showCustomColor, setShowCustomColor] = useState<boolean>(false)
  const [showCustomIcon, setShowCustomIcon] = useState<boolean>(false)

  const [showEditDescription, setShowEditDescription] = useState<boolean>(false)
  const [showEditCategories, setShowEditCategories] = useState<boolean>(false)
  const [showEditStartDate, setShowEditStartDate] = useState<boolean>(false)
  const [showEditDifficulty, setShowEditDifficulty] = useState<boolean>(false)
  const [showEditColor, setShowEditColor] = useState<boolean>(false)
  const [showEditIcon, setShowEditIcon] = useState<boolean>(false)

  const [customDuration, setCustomDuration] = useState<string>("7")
  const [customStartDate, setCustomStartDate] = useState("")
  const [customCategories, setCustomCategories] = useState<string[]>([])
  const [customGoalType, setCustomGoalType] = useState<ChallengeGoalType>("daily-completion")
  const [customFailureMode, setCustomFailureMode] = useState<"hard" | "soft" | "retry-limit">("soft")
  const [customMaxFailures, setCustomMaxFailures] = useState<number>(3)
  const [customDifficulty, setCustomDifficulty] = useState<number>(3)
  const [customIcon, setCustomIcon] = useState<string>("target")

  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editDuration, setEditDuration] = useState(7)
  const [editStartDate, setEditStartDate] = useState("")
  const [editCategories, setEditCategories] = useState<string[]>([])
  const [editGoalType, setEditGoalType] = useState<ChallengeGoalType>("daily-completion")
  const [editFailureMode, setEditFailureMode] = useState<"hard" | "soft" | "retry-limit">("soft")
  const [editMaxFailures, setEditMaxFailures] = useState<number>(3)
  const [editDifficulty, setEditDifficulty] = useState<number>(3)
  const [editColor, setEditColor] = useState<string>("#64748b")

  // Milestone management state
  const [showMilestones, setShowMilestones] = useState(false)
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("")
  const [newMilestoneDescription, setNewMilestoneDescription] = useState("")
  const [newMilestoneTarget, setNewMilestoneTarget] = useState<number>(10)
  const [newMilestoneColor, setNewMilestoneColor] = useState<string>("#3b82f6")

  // Edit milestone state
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null)
  const [editMilestoneTitle, setEditMilestoneTitle] = useState("")
  const [editMilestoneDescription, setEditMilestoneDescription] = useState("")
  const [editMilestoneTarget, setEditMilestoneTarget] = useState<number>(10)
  const [editMilestoneColor, setEditMilestoneColor] = useState<string>("#3b82f6")
  const [editIcon, setEditIcon] = useState<string>("target")

  const [editDailyTasks, setEditDailyTasks] = useState<DailyTask[]>([])

  // Effect to handle external changes to challenges (e.g., from other modules)
  useEffect(() => {
    const handleChallengesUpdated = (e: CustomEvent) => {
      setChallenges(e.detail);
    };

    window.addEventListener('challengesUpdated', handleChallengesUpdated as EventListener);

    return () => {
      window.removeEventListener('challengesUpdated', handleChallengesUpdated as EventListener);
    };
  }, []);

  // Effect to check for notifications when challenges change
  useEffect(() => {
  }, [challenges]);

  // Handle drag and drop
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(activeChallenges);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update the challenges state with the new order
    setChallenges(items);
    setSortBy('manual'); // Switch to manual sorting mode
  }

  // Filter and sort challenges
  const activeChallenges = challenges
    .filter((c) => filterByCategory === 'all' || (c.categories && c.categories.includes(filterByCategory)))
    .filter((c) => searchTerm === '' || c.title.toLowerCase().includes(searchTerm.toLowerCase()) || (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase())))
    .sort((a, b) => {
      if (sortBy === 'progress') {
        return getProgressPercentage(b) - getProgressPercentage(a);
      } else if (sortBy === 'name') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'created') {
        return a.id.localeCompare(b.id);
      } else if (sortBy === 'manual') {
        return 0;
      }
      return 0;
    });

  const addPresetChallenge = async (preset: typeof PRESET_CHALLENGES[0]) => {
    if (!token) {
      toast({
        title: "Error",
        description: "You must be logged in to add a challenge.",
        variant: "destructive",
      })
      return
    }

    const startDate = getTodayString()
    const endDate = calculateEndDate(startDate, preset.duration)

    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: preset.title,
          description: preset.description,
          duration: preset.duration,
          start_date: startDate,
          end_date: endDate,
          status: "active",
          color: "#64748b",
          icon: "target"
        })
      })

      if (response.ok) {
        const newProject = await response.json()
        setChallenges([...challenges, newProject])
        toast({
          title: "Challenge Added!",
          description: `"${preset.title}" added to your list`,
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to add challenge to server",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding preset project:", error)
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      })
    }
  }

  const addCustomChallenge = async () => {
    if (!customTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a challenge title",
        variant: "destructive",
      })
      return
    }

    if (!customDuration || parseInt(customDuration) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid duration",
        variant: "destructive",
      })
      return
    }

    if (!token) {
      toast({
        title: "Error",
        description: "You must be logged in to create a challenge.",
        variant: "destructive",
      });
      return;
    }

    const duration = parseInt(customDuration)
    const startDateStr = showCustomStartDate ? customStartDate : getTodayString()
    const endDateStr = calculateEndDate(startDateStr, duration)

    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: customTitle,
          description: showCustomDescription ? customDescription : "",
          duration,
          start_date: startDateStr,
          end_date: endDateStr,
          categories: showCustomCategories ? customCategories : [],
          goal_type: customGoalType,
          failure_mode: customFailureMode,
          max_failures: customMaxFailures,
          difficulty: showCustomDifficulty ? customDifficulty : 3,
          color: showCustomColor ? customColor : "#64748b",
          icon: showCustomIcon ? customIcon : "target",
          status: new Date(startDateStr) > new Date() ? "upcoming" : "active"
        })
      })

      if (response.ok) {
        const newProject = await response.json()
        setChallenges([...challenges, newProject])
        setCustomTitle("")
        setCustomDescription("")
        setCustomDuration("7")
        setCustomStartDate(getTodayString())
        setCustomCategories([])
        setSelectedCategory("")
        setShowCustomForm(false)
        // Reset optional feature flags
        setShowCustomDescription(false)
        setShowCustomCategories(false)
        setShowCustomStartDate(false)
        setShowCustomDifficulty(false)
        setShowCustomColor(false)
        setShowCustomIcon(false)
        // Reset new fields
        setCustomGoalType("daily-completion")
        setCustomFailureMode("soft")
        setCustomMaxFailures(3)
        setCustomDifficulty(3)
        setCustomColor("#64748b")
        setCustomIcon("target")
        toast({
          title: "Custom Challenge Created!",
          description: `Challenge will start on ${startDateStr}`,
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to create challenge on server",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating project:", error)
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      })
    }
  }

  const checkInChallenge = async (id: string, energyLevel: number, note: string) => {
    if (!token) {
      toast({
        title: "Error",
        description: "You must be logged in to check in.",
        variant: "destructive",
      });
      return;
    }

    const today = getTodayString()
    const challenge = challenges.find((c) => c.id === id)
    if (!challenge) return

    if (challenge.lastCheckedIn === today && challenge.goalType !== "total-amount") {
      toast({
        title: "Already Checked In",
        description: "You've already checked in today!",
      })
      return
    }

    const amount = challenge.goalType === "total-amount" ? energyLevel : 1

    try {
      const response = await fetch(`${API_BASE_URL}/projects/${id}/log`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount,
          date: today,
          note,
          energy_level: energyLevel
        })
      })

      if (response.ok) {
        // Refresh projects to get updated streaks and progress from backend
        const projectsResponse = await fetch(`${API_BASE_URL}/projects`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })
        if (projectsResponse.ok) {
          const data = await projectsResponse.json()
          setChallenges(data)
        }

        toast({
          title: "Check-in Successful",
          description: "Your progress has been saved.",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to save check-in on server",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error logging progress:", error)
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      })
    }
  }

  const deleteChallenge = async (id: string) => {
    if (!token) {
      toast({
        title: "Error",
        description: "You must be logged in to delete a challenge.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        setChallenges(challenges.filter((c) => c.id !== id))
        toast({
          title: "Challenge Deleted",
          description: "Challenge removed successfully",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to delete challenge on server",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting project:", error)
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      })
    }
  }

  // Function to convert a challenge to a habit calling the backend
  const convertChallengeToHabit = async (challenge: Challenge) => {
    if (!token) {
      toast({
        title: "Error",
        description: "You must be logged in to convert a challenge.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/projects/${challenge.id}/convert`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();

        // Update local state: remove the converted challenge
        setChallenges(challenges.filter(c => c.id !== challenge.id));

        toast({
          title: "Success",
          description: "Challenge converted to habit successfully!",
        });

        // Trigger habit module refresh
        window.dispatchEvent(new CustomEvent('habitsUpdated'));
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to convert challenge",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error converting project:", error);
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    }
  }

  // Function to add a milestone to a challenge
  const addMilestone = async (challengeId: string, title: string, targetValue: number = 0, color: string = "#3b82f6") => {
    if (!token) return

    try {
      const response = await fetch(`${API_BASE_URL}/projects/${challengeId}/milestones`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          target_value: targetValue,
          color
        })
      })

      if (response.ok) {
        const newMilestone = await response.json()
        setChallenges(challenges.map(c => {
          if (c.id === challengeId) {
            return { ...c, milestones: [...(c.milestones || []), newMilestone] }
          }
          return c
        }))
        toast({
          title: "Milestone Added",
          description: `"${title}" has been added to your challenge.`
        })
      }
    } catch (error) {
      console.error("Error adding milestone:", error)
    }
  }

  // Function to toggle milestone achievement
  const toggleMilestone = async (challengeId: string, milestoneId: string, achieved: boolean) => {
    if (!token) return

    try {
      const response = await fetch(`${API_BASE_URL}/milestones/${milestoneId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ achieved })
      })

      if (response.ok) {
        const updatedMilestone = await response.json()
        setChallenges(challenges.map(c => {
          if (c.id === challengeId) {
            return {
              ...c,
              milestones: c.milestones?.map(m => m.id === milestoneId ? updatedMilestone : m)
            }
          }
          return c
        }))
      }
    } catch (error) {
      console.error("Error updating milestone:", error)
    }
  }

  // Function to delete a milestone
  const deleteMilestone = async (challengeId: string, milestoneId: string) => {
    if (!token) return

    try {
      const response = await fetch(`${API_BASE_URL}/milestones/${milestoneId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        setChallenges(challenges.map(c => {
          if (c.id === challengeId) {
            return {
              ...c,
              milestones: c.milestones?.filter(m => m.id !== milestoneId)
            }
          }
          return c
        }))
        toast({
          title: "Milestone Deleted",
          description: "The milestone has been removed."
        })
      }
    } catch (error) {
      console.error("Error deleting milestone:", error)
    }
  }

  // Function to add a daily task to a challenge
  const addDailyTask = (challengeId: string, taskText: string) => {
    setChallenges(challenges.map(challenge => {
      if (challenge.id === challengeId && challenge.goalType === "checklist") {
        const newTask: DailyTask = {
          day: challenge.dailyTasks?.length ? Math.max(...challenge.dailyTasks.map(t => t.day)) + 1 : 1,
          task: taskText,
          done: false
        }
        return {
          ...challenge,
          dailyTasks: [...(challenge.dailyTasks || []), newTask]
        }
      }
      return challenge
    }))
  }

  // Function to toggle a daily task completion
  const toggleDailyTask = (challengeId: string, taskIndex: number) => {
    setChallenges(challenges.map(challenge => {
      if (challenge.id === challengeId && challenge.goalType === "checklist" && challenge.dailyTasks) {
        const updatedTasks = [...challenge.dailyTasks]
        updatedTasks[taskIndex] = {
          ...updatedTasks[taskIndex],
          done: !updatedTasks[taskIndex].done
        }
        return {
          ...challenge,
          dailyTasks: updatedTasks
        }
      }
      return challenge
    }))
  }

  // Function to remove a daily task
  const removeDailyTask = (challengeId: string, taskIndex: number) => {
    setChallenges(challenges.map(challenge => {
      if (challenge.id === challengeId && challenge.goalType === "checklist" && challenge.dailyTasks) {
        const updatedTasks = [...challenge.dailyTasks]
        updatedTasks.splice(taskIndex, 1)
        return {
          ...challenge,
          dailyTasks: updatedTasks
        }
      }
      return challenge
    }))
  }

  // Function to add a note to a challenge
  const addChallengeNote = (challengeId: string, date: string, note: string) => {
    setChallenges(challenges.map(challenge => {
      if (challenge.id === challengeId) {
        return {
          ...challenge,
          notes: {
            ...challenge.notes,
            [date]: note
          }
        }
      }
      return challenge
    }))
  }

  // Function to fail a challenge (based on failure rules)
  const failChallenge = (challengeId: string) => {
    setChallenges(challenges.map(challenge => {
      if (challenge.id === challengeId) {
        let newStatus: ChallengeStatus = challenge.status
        let newCurrentFailures = challenge.currentFailures

        // Apply failure rules
        switch (challenge.failureMode) {
          case "hard":
            newStatus = "failed"
            break
          case "soft":
            newCurrentFailures += 1
            break
          case "retry-limit":
            newCurrentFailures += 1
            if (challenge.maxFailures && newCurrentFailures >= challenge.maxFailures) {
              newStatus = "failed"
            }
            break
        }

        return {
          ...challenge,
          status: newStatus,
          currentFailures: newCurrentFailures
        }
      }
      return challenge
    }))

    toast({
      title: "Challenge Failed",
      description: "You've failed to meet the requirements for this challenge.",
    })
  }

  // Function to restart a challenge
  const restartChallenge = (challengeId: string) => {
    setChallenges(challenges.map(challenge => {
      if (challenge.id === challengeId) {
        const today = getTodayString()
        const endDate = calculateEndDate(today, challenge.duration)

        return {
          ...challenge,
          currentDay: 0,
          status: "active",
          startDate: today,
          endDate,
          lastCheckedIn: null,
          currentFailures: 0,
          notes: {},
          // Reset streak data
          currentStreak: 0,
          bestStreak: challenge.bestStreak, // Keep best streak achieved
          lastCompletedDate: undefined,
          completionRecords: []
        }
      }
      return challenge
    }))

    toast({
      title: "Challenge Restarted!",
      description: "Challenge has been reset and started again.",
    })
  }

  // Function to toggle challenge completion status
  const toggleChallengeCompletion = (challengeId: string) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return;

    setChallenges(challenges.map(challenge => {
      if (challenge.id === challengeId) {
        const newStatus = challenge.status === "completed" ? "active" : "completed";
        const today = getTodayString();

        return {
          ...challenge,
          status: newStatus,
          // Update completion-related fields
          currentDay: newStatus === "completed" ? challenge.duration : challenge.currentDay,
          lastCompletedDate: newStatus === "completed" ? today : undefined,
        };
      }
      return challenge;
    }));

    toast({
      title: `Challenge ${challenge.status === 'completed' ? 'Marked Incomplete' : 'Completed'}!`,
      description: `Challenge status updated successfully`,
    });
  };


  // Function to update milestone progress
  const updateMilestoneProgress = (challengeId: string, milestoneId: string, value: number) => {
    setChallenges(challenges.map(challenge => {
      if (challenge.id === challengeId && challenge.milestones) {
        const updatedMilestones = challenge.milestones.map(milestone => {
          if (milestone.id === milestoneId) {
            const newCurrentValue = Math.min(value, milestone.targetValue);
            const newAchieved = newCurrentValue >= milestone.targetValue;
            const newAchievedDate = newAchieved && !milestone.achieved ? new Date().toISOString().split('T')[0] : milestone.achievedDate;

            return {
              ...milestone,
              currentValue: newCurrentValue,
              achieved: newAchieved,
              achievedDate: newAchievedDate
            };
          }
          return milestone;
        });

        return {
          ...challenge,
          milestones: updatedMilestones
        };
      }
      return challenge;
    }));
  };

  // Function to remove a milestone from a challenge
  const removeMilestone = (challengeId: string, milestoneId: string) => {
    setChallenges(challenges.map(challenge => {
      if (challenge.id === challengeId && challenge.milestones) {
        const updatedMilestones = challenge.milestones.filter(milestone => milestone.id !== milestoneId);
        return {
          ...challenge,
          milestones: updatedMilestones
        };
      }
      return challenge;
    }));

    toast({
      title: "Milestone Removed",
      description: "Milestone has been removed from the challenge",
    });
  };

  // Function to edit a milestone
  const editMilestone = (challengeId: string, milestone: Milestone) => {
    setChallenges(challenges.map(challenge => {
      if (challenge.id === challengeId && challenge.milestones) {
        const updatedMilestones = challenge.milestones.map(m => {
          if (m.id === milestone.id) {
            return {
              ...m,
              title: milestone.title,
              description: milestone.description,
              targetValue: milestone.targetValue,
              color: milestone.color
            };
          }
          return m;
        });

        return {
          ...challenge,
          milestones: updatedMilestones
        };
      }
      return challenge;
    }));

    toast({
      title: "Milestone Updated!",
      description: `Milestone "${milestone.title}" has been updated`,
    });
  };

  // Function to archive a challenge
  const archiveChallenge = (challengeId: string) => {
    setChallenges(challenges.map(challenge => {
      if (challenge.id === challengeId) {
        return {
          ...challenge,
          archived: true
        }
      }
      return challenge
    }))
    toast({
      title: "Challenge Archived!",
      description: "Challenge has been moved to archived section",
    })
  }

  // Function to unarchive a challenge
  const unarchiveChallenge = (challengeId: string) => {
    setChallenges(challenges.map(challenge => {
      if (challenge.id === challengeId) {
        return {
          ...challenge,
          archived: false
        }
      }
      return challenge
    }))
    toast({
      title: "Challenge Unarchived!",
      description: "Challenge has been moved back to active section",
    })
  }

  const handleEditChallenge = (challenge: Challenge) => {
    setEditingChallenge(challenge)
    setEditTitle(challenge.title)
    setEditDescription(challenge.description)
    setEditCategories(challenge.categories || [])
    // Initialize optional feature flags for editing
    setShowEditDescription(challenge.description !== "")
    setShowEditCategories(challenge.categories && challenge.categories.length > 0)
    setShowEditStartDate(challenge.startDate !== "")
    setShowEditDifficulty(challenge.difficulty !== 3)
    setShowEditColor(challenge.color !== "#64748b")
    setShowEditIcon(challenge.icon !== "target")
    // Initialize new fields for editing
    setEditGoalType(challenge.goalType)
    setEditFailureMode(challenge.failureMode)
    setEditMaxFailures(challenge.maxFailures || 3)
    setEditDifficulty(challenge.difficulty)
    setEditColor(challenge.color || "#64748b")
    setEditIcon(challenge.icon || "target")
    setEditDailyTasks(challenge.dailyTasks || [])
    setEditDuration(challenge.duration)
    setEditStartDate(challenge.startDate)
  }

  const saveChallengeEdits = async () => {
    if (editingChallenge && token) {
      const endDate = calculateEndDate(editStartDate, editDuration)

      try {
        const response = await fetch(`${API_BASE_URL}/projects/${editingChallenge.id}`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            title: editTitle,
            description: showEditDescription ? editDescription : "",
            goal_type: editGoalType,
            failure_mode: editFailureMode,
            max_failures: editMaxFailures,
            difficulty: showEditDifficulty ? editDifficulty : 3,
            color: showEditColor ? editColor : "#64748b",
            icon: showEditIcon ? editIcon : "target",
            categories: showEditCategories ? editCategories : [],
            duration: editDuration,
            start_date: showEditStartDate ? editStartDate : getTodayString(),
            end_date: endDate,
            status: editingChallenge.status
          })
        })

        if (response.ok) {
          const updatedProject = await response.json()
          setChallenges(challenges.map(c => c.id === editingChallenge.id ? updatedProject : c))
          setEditingChallenge(null)
          toast({
            title: "Challenge Updated!",
            description: "Your challenge has been successfully updated",
          })
        } else {
          toast({
            title: "Error",
            description: "Failed to update challenge on server",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error updating project:", error)
        toast({
          title: "Error",
          description: "Network error occurred",
          variant: "destructive",
        })
      }
    }
  }

  const completedChallenges = challenges.filter((c) => c.status === "completed")
  const failedChallenges = challenges.filter((c) => c.status === "failed")
  const archivedChallenges = challenges.filter((c) => c.archived)
  const totalChallengesCompleted = completedChallenges.length

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
                  placeholder="Search challenges..."
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
                    <SelectItem value="progress">Progress</SelectItem>
                    <SelectItem value="name">Title</SelectItem>
                    <SelectItem value="created">Creation Date</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
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

            {/* Add Challenge Button */}
            <div>
              <Dialog open={showCustomForm} onOpenChange={setShowCustomForm}>
                <DialogTrigger asChild>
                  <Button className="rounded-lg">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Challenge
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Custom Challenge</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4 p-4 rounded-lg border border-border bg-muted/50 space-y-4 max-h-96 overflow-y-auto">
                    {/* Challenge form content */}
                    <div className="space-y-2">
                      <Label htmlFor="custom-title">Challenge Title</Label>
                      <Input
                        id="custom-title"
                        placeholder="e.g., Morning Routine Master"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="show-description"
                        checked={showCustomDescription}
                        onCheckedChange={(checked) => setShowCustomDescription(checked as boolean)}
                      />
                      <Label htmlFor="show-description" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Add Description
                      </Label>
                    </div>
                    {showCustomDescription && (
                      <div className="space-y-2 ml-6">
                        <Label htmlFor="custom-description">Description</Label>
                        <Textarea
                          id="custom-description"
                          placeholder="What's the goal of this challenge?"
                          value={customDescription}
                          onChange={(e) => setCustomDescription(e.target.value)}
                          rows={3}
                        />
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="custom-duration">Duration (days)</Label>
                        <Input
                          id="custom-duration"
                          type="number"
                          min="1"
                          value={customDuration}
                          onChange={(e) => setCustomDuration(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="show-start-date"
                            checked={showCustomStartDate}
                            onCheckedChange={(checked) => setShowCustomStartDate(checked as boolean)}
                          />
                          <Label htmlFor="show-start-date" className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Set Start Date
                          </Label>
                        </div>
                        {showCustomStartDate && (
                          <div className="space-y-2">
                            <Label htmlFor="custom-start-date">Start Date</Label>
                            <Input
                              id="custom-start-date"
                              type="date"
                              value={customStartDate}
                              onChange={(e) => setCustomStartDate(e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Goal Type */}
                    <div className="space-y-2">
                      <Label htmlFor="custom-goal-type">Goal Type</Label>
                      <Select value={customGoalType} onValueChange={(value) => setCustomGoalType(value as ChallengeGoalType)}>
                        <SelectTrigger id="custom-goal-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily-completion">Daily Completion</SelectItem>
                          <SelectItem value="total-amount">Total Amount</SelectItem>
                          <SelectItem value="checklist">Checklist</SelectItem>
                          <SelectItem value="points">Points</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Failure Mode */}
                    <div className="space-y-2">
                      <Label htmlFor="custom-failure-mode">Failure Mode</Label>
                      <Select value={customFailureMode} onValueChange={(value) => setCustomFailureMode(value as "hard" | "soft" | "retry-limit")}>
                        <SelectTrigger id="custom-failure-mode">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hard">Hard Mode (Fail = Challenge Ends)</SelectItem>
                          <SelectItem value="soft">Soft Mode (Track Failures)</SelectItem>
                          <SelectItem value="retry-limit">Retry Limit (Max Failures Allowed)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Max Failures (only shown for retry-limit mode) */}
                    {customFailureMode === "retry-limit" && (
                      <div className="space-y-2">
                        <Label htmlFor="custom-max-failures">Maximum Failures Allowed</Label>
                        <Input
                          id="custom-max-failures"
                          type="number"
                          min="1"
                          value={customMaxFailures}
                          onChange={(e) => setCustomMaxFailures(parseInt(e.target.value) || 3)}
                        />
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="show-difficulty"
                        checked={showCustomDifficulty}
                        onCheckedChange={(checked) => setShowCustomDifficulty(checked as boolean)}
                      />
                      <Label htmlFor="show-difficulty" className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Set Difficulty
                      </Label>
                    </div>
                    {showCustomDifficulty && (
                      <div className="space-y-2 ml-6">
                        <Label htmlFor="custom-difficulty">Difficulty (1-5)</Label>
                        <Input
                          id="custom-difficulty"
                          type="range"
                          min="1"
                          max="5"
                          value={customDifficulty}
                          onChange={(e) => setCustomDifficulty(parseInt(e.target.value) || 3)}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Easy</span>
                          <span className="font-medium">{customDifficulty}</span>
                          <span>Hard</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="show-color"
                        checked={showCustomColor}
                        onCheckedChange={(checked) => setShowCustomColor(checked as boolean)}
                      />
                      <Label htmlFor="show-color" className="flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        Set Color
                      </Label>
                    </div>
                    {showCustomColor && (
                      <div className="space-y-2 ml-6">
                        <Label htmlFor="custom-color">Challenge Color</Label>
                        <Input
                          id="custom-color"
                          type="color"
                          value={customColor}
                          onChange={(e) => setCustomColor(e.target.value)}
                        />
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="show-icon"
                        checked={showCustomIcon}
                        onCheckedChange={(checked) => setShowCustomIcon(checked as boolean)}
                      />
                      <Label htmlFor="show-icon" className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Set Icon
                      </Label>
                    </div>
                    {showCustomIcon && (
                      <div className="space-y-2 ml-6">
                        <Label htmlFor="custom-icon">Icon</Label>
                        <Select value={customIcon} onValueChange={(value) => setCustomIcon(value)}>
                          <SelectTrigger id="custom-icon">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="target">Target</SelectItem>
                            <SelectItem value="book">Book</SelectItem>
                            <SelectItem value="dumbbell">Dumbbell</SelectItem>
                            <SelectItem value="calendar">Calendar</SelectItem>
                            <SelectItem value="award">Award</SelectItem>
                            <SelectItem value="trending-up">Trending Up</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}



                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="show-categories"
                        checked={showCustomCategories}
                        onCheckedChange={(checked) => setShowCustomCategories(checked as boolean)}
                      />
                      <Label htmlFor="show-categories" className="flex items-center gap-2">
                        <Tags className="h-4 w-4" />
                        Add Categories
                      </Label>
                    </div>
                    {showCustomCategories && (
                      <div className="space-y-2 ml-6">
                        <Label>Categories</Label>
                        <div className="flex flex-wrap gap-2">
                          {categories.map((category) => (
                            <Badge
                              key={category.id.toString()}
                              variant={customCategories.includes(category.name) ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() => {
                                if (customCategories.includes(category.name)) {
                                  setCustomCategories(customCategories.filter(c => c !== category.name))
                                } else {
                                  setCustomCategories([...customCategories, category.name])
                                }
                              }}
                            >
                              <Tags className="h-3 w-3 mr-1" />
                              {category.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button onClick={addCustomChallenge} className="w-full">
                      Create Challenge
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Challenges List */}
      {activeChallenges.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Your Challenges ({activeChallenges.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeChallenges.map((challenge: Challenge) => (
                <div key={challenge.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow" style={getPriorityColorStyle(challenge.categories)}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-start gap-2">
                      <button
                        onClick={() => toggleChallengeCompletion(challenge.id)}
                        className="flex-shrink-0 mt-1 text-muted-foreground hover:text-primary"
                      >
                        {challenge.status === "completed" ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </button>
                      <div>
                        <h3 className="font-semibold flex items-center gap-2">
                          {challenge.icon === "target" && <Target className="h-4 w-4" />}
                          {challenge.icon === "book" && <Book className="h-4 w-4" />}
                          {challenge.icon === "dumbbell" && <Dumbbell className="h-4 w-4" />}
                          {challenge.icon === "calendar" && <Calendar className="h-4 w-4" />}
                          {challenge.icon === "award" && <Award className="h-4 w-4" />}
                          {challenge.icon === "trending-up" && <TrendingUp className="h-4 w-4" />}
                          {challenge.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{challenge.description}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(challenge.status)}>
                      {challenge.status.charAt(0).toUpperCase() + challenge.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {challenge.categories.map((categoryName: string) => {
                      const category = categories.find(c => c.name === categoryName);
                      return (
                        <Badge key={categoryName} variant="secondary" className="text-xs">
                          <Tags className="h-3 w-3 mr-1" />
                          {categoryName}
                        </Badge>
                      );
                    })}
                    {challenge.difficulty > 3 && (
                      <Badge variant="outline" className="text-xs">
                        {Array(challenge.difficulty).fill(0).map((_, i) => (
                          <span key={i}>⭐</span>
                        ))}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {challenge.status === "upcoming" ? (
                        (() => {
                          const daysUntilStart = getDaysUntilStart(challenge)
                          return (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Starts in: {daysUntilStart} days
                            </Badge>
                          )
                        })()
                      ) : (
                        (() => {
                          const daysRemaining = getDaysRemaining(challenge)
                          return (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {daysRemaining} days remaining
                            </Badge>
                          )
                        })()
                      )}
                    </div>

                    {/* Pace Information */}
                    {challenge.status === "active" && (
                      <Badge variant="outline" className={`flex items-center gap-1 ${getPaceColor(challenge)}`}>
                        <span>{getPaceIcon(challenge)}</span>
                        <span>{getPaceStatus(challenge)}</span>
                      </Badge>
                    )}
                  </div>

                  {/* Daily Pace Stats */}
                  {challenge.status === "active" && (
                    <div className="text-xs text-muted-foreground mb-2">
                      <div className="flex justify-between">
                        <span>Daily Pace:</span>
                        <span className={getPaceColor(challenge)}>{getPaceStatus(challenge)}</span>
                      </div>
                      {(() => {
                        const pace = getDailyPaceNeeded(challenge);
                        return (
                          <div className="grid grid-cols-2 gap-1">
                            <span>Target: {pace.dailyTarget.toFixed(1)}/day</span>
                            <span>Expected: {pace.expectedCompleted.toFixed(1)}</span>
                            <span>Actual: {pace.actualProgress.toFixed(1)}</span>
                            <span className={pace.daysBehind > 0 ? 'text-red-600' : 'text-green-600'}>
                              {pace.daysBehind > 0 ? `Behind: ${pace.daysBehind.toFixed(1)}` : `Ahead: ${pace.daysAhead.toFixed(1)}`}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Streak Information */}
                  {challenge.currentStreak && challenge.currentStreak > 0 && (
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        <Flame className="h-3 w-3" />
                        Current Streak: {challenge.currentStreak} days
                      </Badge>
                      {challenge.bestStreak && challenge.bestStreak > 0 && challenge.bestStreak !== challenge.currentStreak && (
                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                          <Trophy className="h-3 w-3" />
                          Best: {challenge.bestStreak} days
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Milestones Section */}
                  <div className="mt-4 pt-4 border-t space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                        <Flag className="h-3 w-3" />
                        Milestones
                      </h4>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Plus className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Milestone</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                              <Label>Title</Label>
                              <Input id={`new-milestone-title-${challenge.id}`} placeholder="e.g., Reach 50% progress" />
                            </div>
                            <div className="space-y-2">
                              <Label>Target Value (optional)</Label>
                              <Input id={`new-milestone-target-${challenge.id}`} type="number" placeholder="0" />
                            </div>
                            <Button
                              className="w-full"
                              onClick={() => {
                                const title = (document.getElementById(`new-milestone-title-${challenge.id}`) as HTMLInputElement).value;
                                const target = parseFloat((document.getElementById(`new-milestone-target-${challenge.id}`) as HTMLInputElement).value) || 0;
                                if (title) addMilestone(challenge.id, title, target);
                              }}
                            >
                              Add Milestone
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="space-y-1">
                      {challenge.milestones?.map((milestone) => (
                        <div key={milestone.id} className="flex items-center justify-between group">
                          <div className="flex items-center gap-2 flex-1">
                            <Checkbox
                              checked={milestone.achieved}
                              onCheckedChange={(checked) => toggleMilestone(challenge.id, milestone.id, checked as boolean)}
                              className="h-3.5 w-3.5"
                            />
                            <span className={`text-xs ${milestone.achieved ? 'line-through text-muted-foreground' : ''}`}>
                              {milestone.title}
                            </span>
                            {milestone.targetValue > 0 && (
                              <Badge variant="outline" className="text-[10px] h-4 px-1">
                                goal: {milestone.targetValue}
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => deleteMilestone(challenge.id, milestone.id)}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      ))}
                      {(!challenge.milestones || challenge.milestones.length === 0) && (
                        <p className="text-[10px] text-muted-foreground italic">No milestones set</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1">
                    {/* Analytics Button */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Sparkles className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden">
                        <div className="sr-only">Challenge Analytics</div>
                        <ChallengeAnalyticsModal challenge={challenge} onConvertToHabit={convertChallengeToHabit} />
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditChallenge(challenge)}
                          title="Edit Challenge"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Edit Challenge</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                          <div className="space-y-2">
                            <Label htmlFor="edit-title">Challenge Title</Label>
                            <Input
                              id="edit-title"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="show-edit-description"
                              checked={showEditDescription}
                              onCheckedChange={(checked) => setShowEditDescription(checked as boolean)}
                            />
                            <Label htmlFor="show-edit-description" className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Add Description
                            </Label>
                          </div>
                          {showEditDescription && (
                            <div className="space-y-2 ml-6">
                              <Label htmlFor="edit-description">Description</Label>
                              <Textarea
                                id="edit-description"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                rows={3}
                              />
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-duration">Duration (days)</Label>
                              <Input
                                id="edit-duration"
                                type="number"
                                min="1"
                                value={editDuration}
                                onChange={(e) => setEditDuration(parseInt(e.target.value) || 7)}
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="show-edit-start-date"
                                checked={showEditStartDate}
                                onCheckedChange={(checked) => setShowEditStartDate(checked as boolean)}
                              />
                              <Label htmlFor="show-edit-start-date" className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Set Start Date
                              </Label>
                            </div>
                            {showEditStartDate && (
                              <div className="space-y-2">
                                <Label htmlFor="edit-start-date">Start Date</Label>
                                <Input
                                  id="edit-start-date"
                                  type="date"
                                  value={editStartDate}
                                  onChange={(e) => setEditStartDate(e.target.value)}
                                />
                              </div>
                            )}
                          </div>

                          {/* Goal Type */}
                          <div className="space-y-2">
                            <Label htmlFor="edit-goal-type">Goal Type</Label>
                            <Select value={editGoalType} onValueChange={(value) => setEditGoalType(value as ChallengeGoalType)}>
                              <SelectTrigger id="edit-goal-type">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="daily-completion">Daily Completion</SelectItem>
                                <SelectItem value="total-amount">Total Amount</SelectItem>
                                <SelectItem value="checklist">Checklist</SelectItem>
                                <SelectItem value="points">Points</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Failure Mode */}
                          <div className="space-y-2">
                            <Label htmlFor="edit-failure-mode">Failure Mode</Label>
                            <Select value={editFailureMode} onValueChange={(value) => setEditFailureMode(value as "hard" | "soft" | "retry-limit")}>
                              <SelectTrigger id="edit-failure-mode">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="hard">Hard Mode (Fail = Challenge Ends)</SelectItem>
                                <SelectItem value="soft">Soft Mode (Track Failures)</SelectItem>
                                <SelectItem value="retry-limit">Retry Limit (Max Failures Allowed)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Max Failures (only shown for retry-limit mode) */}
                          {editFailureMode === "retry-limit" && (
                            <div className="space-y-2">
                              <Label htmlFor="edit-max-failures">Maximum Failures Allowed</Label>
                              <Input
                                id="edit-max-failures"
                                type="number"
                                min="1"
                                value={editMaxFailures}
                                onChange={(e) => setEditMaxFailures(parseInt(e.target.value) || 3)}
                              />
                            </div>
                          )}

                          {/* Difficulty */}
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="show-edit-difficulty"
                              checked={showEditDifficulty}
                              onCheckedChange={(checked) => setShowEditDifficulty(checked as boolean)}
                            />
                            <Label htmlFor="show-edit-difficulty" className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4" />
                              Set Difficulty
                            </Label>
                          </div>
                          {showEditDifficulty && (
                            <div className="space-y-2 ml-6">
                              <Label htmlFor="edit-difficulty">Difficulty (1-5)</Label>
                              <Input
                                id="edit-difficulty"
                                type="range"
                                min="1"
                                max="5"
                                value={editDifficulty}
                                onChange={(e) => setEditDifficulty(parseInt(e.target.value) || 3)}
                              />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Easy</span>
                                <span className="font-medium">{editDifficulty}</span>
                                <span>Hard</span>
                              </div>
                            </div>
                          )}

                          {/* Color Picker */}
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="show-edit-color"
                              checked={showEditColor}
                              onCheckedChange={(checked) => setShowEditColor(checked as boolean)}
                            />
                            <Label htmlFor="show-edit-color" className="flex items-center gap-2">
                              <Palette className="h-4 w-4" />
                              Set Color
                            </Label>
                          </div>
                          {showEditColor && (
                            <div className="space-y-2 ml-6">
                              <Label htmlFor="edit-color">Challenge Color</Label>
                              <Input
                                id="edit-color"
                                type="color"
                                value={editColor}
                                onChange={(e) => setEditColor(e.target.value)}
                              />
                            </div>
                          )}

                          {/* Icon Selector */}
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="show-edit-icon"
                              checked={showEditIcon}
                              onCheckedChange={(checked) => setShowEditIcon(checked as boolean)}
                            />
                            <Label htmlFor="show-edit-icon" className="flex items-center gap-2">
                              <Target className="h-4 w-4" />
                              Set Icon
                            </Label>
                          </div>
                          {showEditIcon && (
                            <div className="space-y-2 ml-6">
                              <Label htmlFor="edit-icon">Icon</Label>
                              <Select value={editIcon} onValueChange={(value) => setEditIcon(value)}>
                                <SelectTrigger id="edit-icon">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="target">Target</SelectItem>
                                  <SelectItem value="book">Book</SelectItem>
                                  <SelectItem value="dumbbell">Dumbbell</SelectItem>
                                  <SelectItem value="calendar">Calendar</SelectItem>
                                  <SelectItem value="award">Award</SelectItem>
                                  <SelectItem value="trending-up">Trending Up</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}


                          {/* Categories */}
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="show-edit-categories"
                              checked={showEditCategories}
                              onCheckedChange={(checked) => setShowEditCategories(checked as boolean)}
                            />
                            <Label htmlFor="show-edit-categories" className="flex items-center gap-2">
                              <Tags className="h-4 w-4" />
                              Add Categories
                            </Label>
                          </div>
                          {showEditCategories && (
                            <div className="space-y-2 ml-6">
                              <Label>Categories</Label>
                              <div className="flex flex-wrap gap-2">
                                {categories.map((category) => (
                                  <Badge
                                    key={category.id.toString()}
                                    variant={editCategories.includes(category.name) ? "default" : "outline"}
                                    className="cursor-pointer"
                                    onClick={() => {
                                      if (editCategories.includes(category.name)) {
                                        setEditCategories(editCategories.filter(c => c !== category.name));
                                      } else {
                                        setEditCategories([...editCategories, category.name]);
                                      }
                                    }}
                                  >
                                    <Tags className="h-3 w-3 mr-1" />
                                    {category.name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          <Button onClick={saveChallengeEdits} className="w-full">
                            Save Changes
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {challenge.status === "active" && (
                      <div className="space-y-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => checkInChallenge(challenge.id, challengeEnergyLevels[challenge.id] || 5, challengeNotes[challenge.id] || "")}
                          title="Check In"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <span>Energy: {challengeEnergyLevels[challenge.id] || 5}/10</span>
                        </div>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                            <button
                              key={level}
                              className={`w-6 h-6 rounded-sm text-xs ${challengeEnergyLevels[challenge.id] === level ? 'bg-primary text-primary-foreground' : 'border'}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setChallengeEnergyLevels({ ...challengeEnergyLevels, [challenge.id]: level })
                              }}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                        <Input
                          placeholder="Note..."
                          value={challengeNotes[challenge.id] || ""}
                          onChange={(e) => {
                            setChallengeNotes({ ...challengeNotes, [challenge.id]: e.target.value })
                          }}
                          className="text-xs"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => archiveChallenge(challenge.id)}
                      title="Archive Challenge"
                    >
                      <Folder className="h-4 w-4" />
                    </Button>

                    <Button variant="ghost" size="icon" onClick={() => deleteChallenge(challenge.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span>{getProgressPercentage(challenge)}%</span>
                    </div>
                    <Progress value={getProgressPercentage(challenge)} className="h-2" />
                  </div>

                  {/* Daily Tasks for Checklist Challenges */}
                  {challenge.goalType === "checklist" && challenge.dailyTasks && challenge.dailyTasks.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <h4 className="font-medium text-sm">Daily Tasks</h4>
                      {challenge.dailyTasks.map((task: DailyTask, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={task.done}
                            onChange={() => toggleDailyTask(challenge.id, index)}
                            className="h-4 w-4"
                          />
                          <span className={`flex-1 text-sm ${task.done ? "line-through text-muted-foreground" : ""}`}>
                            {task.task}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeDailyTask(challenge.id, index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Daily Task for Checklist Challenges */}
                  {challenge.goalType === "checklist" && (
                    <div className="mt-3 flex gap-2">
                      <Input
                        type="text"
                        placeholder="Add daily task..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && e.currentTarget.value.trim()) {
                            addDailyTask(challenge.id, e.currentTarget.value)
                            e.currentTarget.value = ""
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement
                          if (input && input.value.trim()) {
                            addDailyTask(challenge.id, input.value)
                            input.value = ""
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  )}

                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No challenges yet. Create your first challenge to get started!</p>
          </CardContent>
        </Card>
      )}

      {/* Preset Challenges at the Bottom */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Quick Start Challenges
          </CardTitle>
          <CardDescription>Preset challenges to help you get started quickly</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRESET_CHALLENGES.map((preset, index) => (
              <div
                key={index}
                className="p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                onClick={() => addPresetChallenge(preset)}
              >
                <div className="flex items-start gap-3">
                  <div className="bg-secondary p-2 rounded-lg">
                    <Target className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{preset.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{preset.description}</p>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {preset.duration} days
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button className="w-full mt-3" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Start Challenge
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
