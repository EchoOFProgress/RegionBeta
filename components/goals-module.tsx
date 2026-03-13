"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, Trash2, Target, CheckSquare, Flame, Zap, Link, Settings, GripVertical, Calendar, X, FileText, Heart, Shield, TrendingUp, Clock, Circle, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { getPriorityColor, shouldGlow } from "@/lib/priority-colors"
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis
} from "recharts"

type Milestone = {
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

type GoalDependency = {
  id: string
  type: 'must-complete-before' | 'parallel' | 'sequential' | 'blocking'
}

type ResourceItem = {
  id: string
  type: 'document' | 'link' | 'budget' | 'contact' | 'equipment' | 'learning'
  name: string
  url?: string
  description?: string
  addedAt: string
}

type NoteItem = {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

type SuccessCriteria = {
  id: string
  description: string
  isCompleted: boolean
  targetDate?: string
  completedDate?: string
  progress?: number // For measurable criteria
}

type MotivationSource = {
  id: string
  type: 'personal' | 'external' | 'visual' | 'quote' | 'reward'
  content: string
  description?: string
  addedAt: string
}

type MotivationTracker = {
  level?: number // 1-10 scale
  lastUpdated?: string
  history?: { date: string; level: number; note?: string }[] // Track motivation over time
  sources?: MotivationSource[] // Sources of motivation
  triggers?: string[] // What triggers motivation
  barriers?: string[] // What blocks motivation
}

type VisionItem = {
  id: string
  type: 'image' | 'quote' | 'note'
  content: string
  caption?: string
  addedAt: string
}

type Goal = {
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
  categories?: string[]
  linkedTasks?: string[]
  linkedHabits?: string[]
  linkedChallenges?: string[]
  // Harada Method specific fields
  obstacles?: string[]
  resources?: string[] // This is for the Harada method resources
  supporters?: string[]
  // Link to real habits and tasks
  dailyHabits?: string[] // Store IDs of linked habits
  weeklyMilestones?: string[] // Store IDs of linked tasks
  monthlyTargets?: string[] // Store IDs of linked tasks
  longTermGoalId?: string // Link to Harada Method long-term goal
  // Milestones/Sub-Goals
  milestones?: Milestone[]
  // Vision Board
  visionBoard?: VisionItem[]
  // Dependencies & Prerequisites
  dependencies?: GoalDependency[]
  dependents?: string[] // IDs of goals that depend on this one
  // Resources & Notes
  resourcesList?: ResourceItem[]
  notes?: NoteItem[]
  // Success Criteria
  successCriteria?: SuccessCriteria[]
  // Motivation System
  motivationTracker?: MotivationTracker
  // Completion tracking
  completed?: boolean
}
type LinkedItem = {
  id: string
  type: "task" | "habit" | "challenge"
  title: string
  completed: boolean
}

import { useAuth } from "@/lib/auth-context"
import { isHaradaEnabled } from "@/lib/user-preferences"

export function GoalsModule({ onGoalsChange, tasks = [], habits = [], challenges = [], haradaGoals = [], addedModules = [] }: { onGoalsChange?: (goals: Goal[]) => void; tasks?: any[]; habits?: any[]; challenges?: any[]; haradaGoals?: any[]; addedModules?: string[] }) {
  const { user } = useAuth()
  const [showHaradaFields, setShowHaradaFields] = useState(false)
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: "1",
      title: "Improve Physical Health",
      description: "Get in better shape through consistent exercise and healthy eating",
      progress: 60,
      totalItems: 5,
      completedItems: 3,
      createdAt: "2023-05-15",
      categories: ["Health"],
      completed: false,
      milestones: [
        {
          id: "m1",
          title: "Lose 5kg",
          description: "Lose initial 5kg weight",
          targetDate: "2023-08-15",
          completed: false,
          linkedModules: {
            tasks: [],
            habits: [],
            challenges: []
          }
        },
        {
          id: "m2",
          title: "Run 5km",
          description: "Able to run 5km without stopping",
          targetDate: "2023-09-15",
          completed: false,
          linkedModules: {
            tasks: [],
            habits: [],
            challenges: []
          }
        }
      ],
    
      dependencies: [],
      dependents: [],
      successCriteria: [
        {
          id: "sc1",
          description: "Lose 5kg of body weight",
          isCompleted: false,
          targetDate: "2023-08-15",
          progress: 60
        },
        {
          id: "sc2",
          description: "Run 5km without stopping",
          isCompleted: false,
          targetDate: "2023-09-15",
          progress: 30
        }
      ],
      motivationTracker: {
        level: 7,
        lastUpdated: new Date().toISOString().split("T")[0],
        history: [{ date: new Date().toISOString().split("T")[0], level: 7, note: "Goal created" }],
        sources: [
          { id: "ms1", type: "quote", content: "The only bad workout is the one that didn't happen.", description: "Inspirational quote", addedAt: new Date().toISOString().split("T")[0] }
        ],
        triggers: ["Health improvement", "Energy boost"],
        barriers: ["Lack of time", "Low energy"]
      }
    },
    {
      id: "2",
      title: "Advance Career Skills",
      description: "Learn new programming languages and complete certifications",
      progress: 30,
      totalItems: 4,
      completedItems: 1,
      createdAt: "2023-10-01",
      categories: ["Work", "Learning"],
      completed: false,
      milestones: [
        {
          id: "m3",
          title: "Complete React Course",
          description: "Finish advanced React course",
          targetDate: "2023-12-01",
          completed: false,
          linkedModules: {
            tasks: [],
            habits: [],
            challenges: []
          }
        }
      ],
  
      dependencies: [],
      dependents: [],
      successCriteria: [
        {
          id: "sc3",
          description: "Complete React course with passing grade",
          isCompleted: false,
          targetDate: "2023-12-01",
          progress: 25
        }
      ],
      // Motivation System
      motivationTracker: {
        level: 8,
        lastUpdated: new Date().toISOString().split("T")[0],
        history: [{ date: new Date().toISOString().split("T")[0], level: 8, note: "Goal created" }],
        sources: [
          { id: "ms2", type: "reward", content: "Job promotion", description: "Career advancement opportunity", addedAt: new Date().toISOString().split("T")[0] }
        ],
        triggers: ["Career growth", "Skill development"],
        barriers: ["Time constraints", "Complex concepts"]
      }
    }
  ])
  
  // Filter tasks that are linked to this goal
  const getLinkedTasks = (goalId: string) => {
    return tasks.filter(task => task.linkedGoalId === goalId);
  };
  
  // Filter habits that are linked to this goal
  const getLinkedHabits = (goalId: string) => {
    return habits.filter(habit => habit.linkedGoalId === goalId);
  };
  
  // Filter challenges that are linked to this goal
  const getLinkedChallenges = (goalId: string) => {
    return challenges.filter(challenge => challenge.linkedGoalId === goalId);
  };
  
  // Get all linked items (tasks, habits, challenges) for a goal
  const getLinkedItems = (goalId: string) => {
    const linkedTasks = getLinkedTasks(goalId).map(task => ({
      id: task.id,
      type: "task" as const,
      title: task.title,
      completed: task.completed
    }));
    
    const linkedHabits = getLinkedHabits(goalId).map(habit => ({
      id: habit.id,
      type: "habit" as const,
      title: habit.name,
      completed: habit.completedToday || false
    }));
    
    const linkedChallenges = getLinkedChallenges(goalId).map(challenge => ({
      id: challenge.id,
      type: "challenge" as const,
      title: challenge.title,
      completed: challenge.status === "completed"
    }));
    
    return [...linkedTasks, ...linkedHabits, ...linkedChallenges];
  };
  
  const [newGoalTitle, setNewGoalTitle] = useState("")
  const [newGoalDescription, setNewGoalDescription] = useState("")
  const [newGoalTargetDate, setNewGoalTargetDate] = useState("")
  const [newGoalMotivation, setNewGoalMotivation] = useState("")
  const [newGoalCurrentState, setNewGoalCurrentState] = useState("")
  const [newGoalDesiredState, setNewGoalDesiredState] = useState("")
  // Harada Method fields
  const [newGoalObstacles, setNewGoalObstacles] = useState<string[]>([""])
  const [newGoalResources, setNewGoalResources] = useState<string[]>([""])
  const [newGoalSupporters, setNewGoalSupporters] = useState<string[]>([""])
  // For linking to real habits and tasks
  const [newGoalDailyHabits, setNewGoalDailyHabits] = useState<{ id: string; name: string; type: 'habit' }[]>([])
  const [newGoalWeeklyMilestones, setNewGoalWeeklyMilestones] = useState<{ id: string; name: string; type: 'task' }[]>([])
  const [newGoalMonthlyTargets, setNewGoalMonthlyTargets] = useState<{ id: string; name: string; type: 'task' }[]>([])
  
  // State for linking to Harada goal
  const [newGoalHaradaLink, setNewGoalHaradaLink] = useState<string>("")
  
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editTargetDate, setEditTargetDate] = useState("")
  const [editMotivation, setEditMotivation] = useState("")
  const [editCurrentState, setEditCurrentState] = useState("")
  const [editDesiredState, setEditDesiredState] = useState("")
  // Harada Method fields for editing
  const [editObstacles, setEditObstacles] = useState<string[]>([""])
  const [editResources, setEditResources] = useState<string[]>([""])
  const [editSupporters, setEditSupporters] = useState<string[]>([""])
  // For linking to real habits and tasks
  const [editDailyHabits, setEditDailyHabits] = useState<{ id: string; name: string; type: 'habit' }[]>([])
  const [editWeeklyMilestones, setEditWeeklyMilestones] = useState<{ id: string; name: string; type: 'task' }[]>([])
  const [editMonthlyTargets, setEditMonthlyTargets] = useState<{ id: string; name: string; type: 'task' }[]>([])
  
  // State for managing milestones
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("")
  const [newMilestoneDescription, setNewMilestoneDescription] = useState("")
  const [newMilestoneTargetDate, setNewMilestoneTargetDate] = useState("")
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null)
  const [editMilestoneTitle, setEditMilestoneTitle] = useState("")
  const [editMilestoneDescription, setEditMilestoneDescription] = useState("")
  const [editMilestoneTargetDate, setEditMilestoneTargetDate] = useState("")
  
  // State for managing dependencies
  const [newDependencyGoalId, setNewDependencyGoalId] = useState("")
  const [newDependencyType, setNewDependencyType] = useState<'must-complete-before' | 'parallel' | 'sequential' | 'blocking'>("must-complete-before")
  
  // State for managing resources
  const [newResource, setNewResource] = useState<{ type: 'document' | 'link' | 'budget' | 'contact' | 'equipment' | 'learning', name: string, url?: string, description?: string }>({ type: 'document', name: '' })
  
  // State for managing notes
  const [newNote, setNewNote] = useState<{ title: string, content: string }>({ title: '', content: '' })
  
  // State for managing vision board items
  const [newVisionItem, setNewVisionItem] = useState<{ type: 'image' | 'quote' | 'note', content: string, caption?: string }>({ type: 'image', content: '', caption: '' })
  
  const [sortBy, setSortBy] = useState<'progress' | 'title' | 'created' | 'manual'>('progress')
  const [filterByCategory, setFilterByCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const { toast } = useToast()

  // Check if Harada Method is enabled
  useEffect(() => {
    // Check if user has Harada Method enabled in their preferences
    const haradaEnabled = isHaradaEnabled(addedModules);
    setShowHaradaFields(haradaEnabled);
  }, [addedModules]);
  
  // Custom setter that also calls the callback
  const setGoalsWithCallback = (newGoals: Goal[]) => {
    setGoals(newGoals);
    if (onGoalsChange) {
      onGoalsChange(newGoals);
    }
  };

  // Filter and sort goals
  const filteredGoals = goals
    .filter((g) => filterByCategory === 'all' || (g.categories && g.categories.includes(filterByCategory)))
    .filter((g) => searchTerm === '' || g.title.toLowerCase().includes(searchTerm.toLowerCase()) || (g.description && g.description.toLowerCase().includes(searchTerm.toLowerCase())))
    .sort((a, b) => {
      if (sortBy === 'progress') {
        return b.progress - a.progress;
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'created') {
        return a.createdAt.localeCompare(b.createdAt);
      }
      // For manual sorting, we preserve the current order
      return 0;
    });

  const addGoal = () => {
    if (!newGoalTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a goal title",
        variant: "destructive",
      })
      return
    }

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoalTitle,
      description: newGoalDescription,
      targetDate: newGoalTargetDate,
      motivation: newGoalMotivation,
      currentState: newGoalCurrentState,
      desiredState: newGoalDesiredState,
      // Harada Method fields
      obstacles: newGoalObstacles.filter(o => o.trim() !== ""),
      resources: newGoalResources.filter(r => r.trim() !== ""),
      supporters: newGoalSupporters.filter(s => s.trim() !== ""),
      // Link to real habits and tasks
      dailyHabits: newGoalDailyHabits.map(h => h.id), // Store only the IDs
      weeklyMilestones: newGoalWeeklyMilestones.map(w => w.id), // Store only the IDs
      monthlyTargets: newGoalMonthlyTargets.map(m => m.id), // Store only the IDs
      // Link to Harada goal if selected
      longTermGoalId: newGoalHaradaLink || undefined,
      // Milestones
      milestones: [],
      // Dependencies & Prerequisites
      dependencies: [],
      dependents: [],
      // Resources & Notes
      resourcesList: [],
      notes: [],
      // Success Criteria
      successCriteria: [],
      // Motivation System
      motivationTracker: {
        level: 7,
        lastUpdated: new Date().toISOString().split("T")[0],
        history: [{ date: new Date().toISOString().split("T")[0], level: 7, note: "Goal created" }],
        sources: [
          { id: "ms1", type: "quote", content: "The only bad workout is the one that didn't happen.", description: "Inspirational quote", addedAt: new Date().toISOString().split("T")[0] }
        ],
        triggers: ["Health improvement", "Energy boost"],
        barriers: ["Lack of time", "Low energy"]
      },
      progress: 0,
      totalItems: 0,
      completedItems: 0,
      createdAt: new Date().toISOString().split("T")[0],
    }
    setGoalsWithCallback([...goals, goal])
    setNewGoalTitle("")
    setNewGoalDescription("")
    setNewGoalTargetDate("")
    setNewGoalMotivation("")
    setNewGoalCurrentState("")
    setNewGoalDesiredState("")
    // Reset Harada Method fields
    setNewGoalObstacles([""])
    setNewGoalResources([""])
    setNewGoalSupporters([""])
    setNewGoalDailyHabits([])
    setNewGoalWeeklyMilestones([])
    setNewGoalMonthlyTargets([])
    setNewGoalHaradaLink("")
    toast({
      title: "Goal Added!",
      description: `New goal "${newGoalTitle}" created`,
    })
  }
  
  const updateGoalProgress = (goal: Goal): Goal => {
    // Calculate progress based on success criteria
    const totalCriteria = goal.successCriteria?.length || 0;
    const completedCriteria = goal.successCriteria?.filter(c => c.isCompleted).length || 0;
    
    // Calculate progress based on milestones
    const totalMilestones = goal.milestones?.length || 0;
    const completedMilestones = goal.milestones?.filter(m => m.completed).length || 0;
    
    // Calculate overall progress (for now, using success criteria as primary measure)
    const totalItems = totalCriteria + totalMilestones;
    const completedItems = completedCriteria + completedMilestones;
    
    const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    
    return {
      ...goal,
      progress,
      totalItems,
      completedItems
    };
  }

  const deleteGoal = (id: string) => {
    setGoalsWithCallback(goals.filter((goal) => goal.id !== id))
    toast({
      title: "Goal Deleted",
      description: "Goal removed from your list",
    })
  }

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal)
    setEditTitle(goal.title)
    setEditDescription(goal.description)
    setEditTargetDate(goal.targetDate || "")
    setEditMotivation(goal.motivation || "")
    setEditCurrentState(goal.currentState || "")
    setEditDesiredState(goal.desiredState || "")
    // Harada Method fields
    setEditObstacles(goal.obstacles || [""])
    setEditResources(goal.resources || [""])
    setEditSupporters(goal.supporters || [""])
    // Convert stored IDs to habit/task objects for editing
    const dailyHabits = goal.dailyHabits?.map(id => {
      const habit = habits.find(h => h.id === id);
      return habit ? { id: habit.id, name: habit.name, type: 'habit' as const } : { id: '', name: '', type: 'habit' as const };
    }) || [];
    
    const weeklyMilestones = goal.weeklyMilestones?.map(id => {
      const task = tasks.find(t => t.id === id);
      return task ? { id: task.id, name: task.title, type: 'task' as const } : { id: '', name: '', type: 'task' as const };
    }) || [];
    
    const monthlyTargets = goal.monthlyTargets?.map((id: string) => {
      const task = tasks.find(t => t.id === id);
      return task ? { id: task.id, name: task.title, type: 'task' as const } : { id: '', name: '', type: 'task' as const };
    }) || [];
    
    setEditDailyHabits(dailyHabits)
    setEditWeeklyMilestones(weeklyMilestones)
    setEditMonthlyTargets(monthlyTargets)
  }
  const saveGoalEdits = () => {
    if (editingGoal) {
      const updatedGoals = goals.map(goal => 
        goal.id === editingGoal.id 
          ? { 
              ...goal, 
              title: editTitle,
              description: editDescription,
              targetDate: editTargetDate,
              motivation: editMotivation,
              currentState: editCurrentState,
              desiredState: editDesiredState,
              // Harada Method fields
              obstacles: editObstacles.filter(o => o.trim() !== ""),
              resources: editResources.filter(r => r.trim() !== ""),
              supporters: editSupporters.filter(s => s.trim() !== ""),
              // Link to real habits and tasks - store only the IDs
              dailyHabits: editDailyHabits.filter(h => h.id !== "").map(h => h.id),
              weeklyMilestones: editWeeklyMilestones.filter(w => w.id !== "").map(w => w.id),
              monthlyTargets: editMonthlyTargets.filter(m => m.id !== "").map(m => m.id),
              // Preserve milestones
              milestones: goal.milestones,
              // Preserve vision board
              visionBoard: goal.visionBoard,
              // Preserve dependencies
              dependencies: goal.dependencies,
              dependents: goal.dependents,
              // Link to Harada goal if selected
              longTermGoalId: editingGoal.longTermGoalId || undefined
            } 
          : goal
      )
      setGoalsWithCallback(updatedGoals)
      setEditingGoal(null)
      toast({
        title: "Goal Updated!",
        description: "Your goal has been successfully updated",
      })
    }
  }

  // Helper functions for Harada Method array fields in creation form
  const handleArrayAdd = (field: "obstacles" | "resources" | "supporters" | "dailyHabits" | "weeklyMilestones" | "monthlyTargets") => {
    switch (field) {
      case "obstacles":
        setNewGoalObstacles([...newGoalObstacles, ""]);
        break;
      case "resources":
        setNewGoalResources([...newGoalResources, ""]);
        break;
      case "supporters":
        setNewGoalSupporters([...newGoalSupporters, ""]);
        break;
      case "dailyHabits":
        // For daily habits, we link to existing habits
        if (habits.length > 0) {
          // Add a default habit if available
          setNewGoalDailyHabits([...newGoalDailyHabits, { id: habits[0].id, name: habits[0].name, type: 'habit' }]);
        } else {
          // If no habits exist, add an empty placeholder
          setNewGoalDailyHabits([...newGoalDailyHabits, { id: '', name: '', type: 'habit' }]);
        }
        break;
      case "weeklyMilestones":
        // For weekly milestones, we link to existing tasks
        if (tasks.length > 0) {
          // Add a default task if available
          setNewGoalWeeklyMilestones([...newGoalWeeklyMilestones, { id: tasks[0].id, name: tasks[0].title, type: 'task' }]);
        } else {
          // If no tasks exist, add an empty placeholder
          setNewGoalWeeklyMilestones([...newGoalWeeklyMilestones, { id: '', name: '', type: 'task' }]);
        }
        break;
      case "monthlyTargets":
        // For monthly targets, we link to existing tasks
        if (tasks.length > 0) {
          // Add a default task if available
          setNewGoalMonthlyTargets([...newGoalMonthlyTargets, { id: tasks[0].id, name: tasks[0].title, type: 'task' }]);
        } else {
          // If no tasks exist, add an empty placeholder
          setNewGoalMonthlyTargets([...newGoalMonthlyTargets, { id: '', name: '', type: 'task' }]);
        }
        break;
    }
  };

  const handleArrayRemove = (field: "obstacles" | "resources" | "supporters" | "dailyHabits" | "weeklyMilestones" | "monthlyTargets", index: number) => {
    switch (field) {
      case "obstacles":
        if (newGoalObstacles.length > 1) {
          setNewGoalObstacles(newGoalObstacles.filter((_, i) => i !== index));
        }
        break;
      case "resources":
        if (newGoalResources.length > 1) {
          setNewGoalResources(newGoalResources.filter((_, i) => i !== index));
        }
        break;
      case "supporters":
        if (newGoalSupporters.length > 1) {
          setNewGoalSupporters(newGoalSupporters.filter((_, i) => i !== index));
        }
        break;
      case "dailyHabits":
        if (newGoalDailyHabits.length > 1) {
          setNewGoalDailyHabits(newGoalDailyHabits.filter((_, i) => i !== index));
        }
        break;
      case "weeklyMilestones":
        if (newGoalWeeklyMilestones.length > 1) {
          setNewGoalWeeklyMilestones(newGoalWeeklyMilestones.filter((_, i) => i !== index));
        }
        break;
      case "monthlyTargets":
        if (newGoalMonthlyTargets.length > 1) {
          setNewGoalMonthlyTargets(newGoalMonthlyTargets.filter((_, i) => i !== index));
        }
        break;
    }
  };

  const handleArrayChange = (field: "obstacles" | "resources" | "supporters" | "dailyHabits" | "weeklyMilestones" | "monthlyTargets", index: number, value: string) => {
    switch (field) {
      case "obstacles":
        const newObstacles = [...newGoalObstacles];
        newObstacles[index] = value;
        setNewGoalObstacles(newObstacles);
        break;
      case "resources":
        const newResources = [...newGoalResources];
        newResources[index] = value;
        setNewGoalResources(newResources);
        break;
      case "supporters":
        const newSupporters = [...newGoalSupporters];
        newSupporters[index] = value;
        setNewGoalSupporters(newSupporters);
        break;
      case "dailyHabits":
        // For daily habits, we need to update the habit ID
        const newDailyHabits = [...newGoalDailyHabits];
        const selectedHabit = habits.find(h => h.id === value);
        if (selectedHabit) {
          newDailyHabits[index] = { id: selectedHabit.id, name: selectedHabit.name, type: 'habit' };
        } else {
          newDailyHabits[index] = { id: '', name: '', type: 'habit' };
        }
        setNewGoalDailyHabits(newDailyHabits);
        break;
      case "weeklyMilestones":
        // For weekly milestones, we need to update the task ID
        const newWeeklyMilestones = [...newGoalWeeklyMilestones];
        const selectedTaskWeekly = tasks.find(t => t.id === value);
        if (selectedTaskWeekly) {
          newWeeklyMilestones[index] = { id: selectedTaskWeekly.id, name: selectedTaskWeekly.title, type: 'task' };
        } else {
          newWeeklyMilestones[index] = { id: '', name: '', type: 'task' };
        }
        setNewGoalWeeklyMilestones(newWeeklyMilestones);
        break;
      case "monthlyTargets":
        // For monthly targets, we need to update the task ID
        const newMonthlyTargets = [...newGoalMonthlyTargets];
        const selectedTaskMonthly = tasks.find(t => t.id === value);
        if (selectedTaskMonthly) {
          newMonthlyTargets[index] = { id: selectedTaskMonthly.id, name: selectedTaskMonthly.title, type: 'task' };
        } else {
          newMonthlyTargets[index] = { id: '', name: '', type: 'task' };
        }
        setNewGoalMonthlyTargets(newMonthlyTargets);
        break;
    }
  };

  // Handle drag and drop
  const handleDragEnd = (result: DropResult) => {
    // Type-safe check for destination
    if (!result.destination) return;
    
    // Make sure we're working with valid indices
    if (result.destination.index === result.source.index) return;
    
    // Map filtered goals to their original indices in the goals array
    const filteredGoalsIds = filteredGoals.map(g => g.id);
    const draggedGoalId = filteredGoalsIds[result.source.index];
    const targetGoalId = filteredGoalsIds[result.destination.index];
    
    // Find the actual indices in the goals array
    const draggedIndex = goals.findIndex(g => g.id === draggedGoalId);
    const targetIndex = goals.findIndex(g => g.id === targetGoalId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    // Reorder the actual goals array
    const newGoals = Array.from(goals);
    const [reorderedItem] = newGoals.splice(draggedIndex, 1);
    newGoals.splice(targetIndex, 0, reorderedItem);
    
    // Update the goals state with the new order
    setGoalsWithCallback(newGoals);
    setSortBy('manual'); // Switch to manual sorting mode
  }

  const getPriorityColorStyle = (categories?: string[]) => {
    // For goals, we'll use a default priority of 50 for color calculation
    const color = getPriorityColor(50, 'goals', categories);
    const glow = shouldGlow(50, 'goals', categories);
    
    if (!color) return {};
    
    const style: React.CSSProperties = {
      border: `2px solid ${color}`
    };
    
    if (glow) {
      style.boxShadow = `0 0 8px ${color}`;
    }
    
    return style;
  };
  
  // Milestone management functions
  const addMilestoneToGoal = (goalId: string) => {
    if (!newMilestoneTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a milestone title",
        variant: "destructive",
      });
      return;
    }
    
    const newMilestone: Milestone = {
      id: Date.now().toString(),
      title: newMilestoneTitle,
      description: newMilestoneDescription,
      targetDate: newMilestoneTargetDate,
      completed: false,
      linkedModules: {
        tasks: [],
        habits: [],
        challenges: []
      }
    };
    
    setGoalsWithCallback(
      goals.map(goal => 
        goal.id === goalId 
          ? updateGoalProgress({ ...goal, milestones: [...(goal.milestones || []), newMilestone] })
          : goal
      )
    );
    
    // Reset form
    setNewMilestoneTitle("");
    setNewMilestoneDescription("");
    setNewMilestoneTargetDate("");
    
    toast({
      title: "Milestone Added!",
      description: `Milestone "${newMilestoneTitle}" added to goal`,
    });
  };
  
  const deleteMilestoneFromGoal = (goalId: string, milestoneId: string) => {
    setGoalsWithCallback(
      goals.map(goal => 
        goal.id === goalId 
          ? updateGoalProgress({ ...goal, milestones: goal.milestones?.filter(m => m.id !== milestoneId) })
          : goal
      )
    );
    
    toast({
      title: "Milestone Deleted",
      description: "Milestone removed from goal",
    });
  };
  
  const toggleMilestoneCompletion = (goalId: string, milestoneId: string) => {
    setGoalsWithCallback(
      goals.map(goal => {
        if (goal.id === goalId && goal.milestones) {
          const updatedMilestones = goal.milestones.map(milestone => {
            if (milestone.id === milestoneId) {
              return {
                ...milestone,
                completed: !milestone.completed,
                completedDate: !milestone.completed ? new Date().toISOString().split("T")[0] : undefined
              };
            }
            return milestone;
          });
          
          return updateGoalProgress({ ...goal, milestones: updatedMilestones });
        }
        return goal;
      })
    );
    
    toast({
      title: "Milestone Updated!",
      description: "Milestone completion status updated",
    });
  };
  
  const handleEditMilestone = (milestone: Milestone) => {
    setEditingMilestone(milestone);
    setEditMilestoneTitle(milestone.title);
    setEditMilestoneDescription(milestone.description);
    setEditMilestoneTargetDate(milestone.targetDate || "");
  };
  
  const saveMilestoneEdits = (goalId: string) => {
    if (editingMilestone) {
      setGoalsWithCallback(
        goals.map(goal => {
          if (goal.id === goalId && goal.milestones) {
            const updatedMilestones = goal.milestones.map(milestone => 
              milestone.id === editingMilestone.id 
                ? { 
                    ...milestone, 
                    title: editMilestoneTitle,
                    description: editMilestoneDescription,
                    targetDate: editMilestoneTargetDate
                  }
                : milestone
            );
            
            return updateGoalProgress({ ...goal, milestones: updatedMilestones });
          }
          return goal;
        })
      );
      
      setEditingMilestone(null);
      toast({
        title: "Milestone Updated!",
        description: "Milestone details updated successfully",
      });
    }
  };
  
  // Vision Board functions
  const addVisionItemToGoal = (goalId: string) => {
    if (!newVisionItem.content.trim()) {
      toast({
        title: "Error",
        description: "Please enter content for the vision item",
        variant: "destructive",
      });
      return;
    }
    
    const visionItem: VisionItem = {
      id: Date.now().toString(),
      type: newVisionItem.type,
      content: newVisionItem.content,
      caption: newVisionItem.caption,
      addedAt: new Date().toISOString().split("T")[0]
    };
    
    setGoalsWithCallback(
      goals.map(goal => 
        goal.id === goalId 
          ? { ...goal, visionBoard: [...(goal.visionBoard || []), visionItem] }
          : goal
      )
    );
    
    // Reset form
    setNewVisionItem({ type: 'image', content: '', caption: '' });
    
    toast({
      title: "Vision Item Added!",
      description: "Vision item added to goal vision board",
    });
  };
  
  const deleteVisionItemFromGoal = (goalId: string, itemId: string) => {
    setGoalsWithCallback(
      goals.map(goal => 
        goal.id === goalId 
          ? { ...goal, visionBoard: goal.visionBoard?.filter(v => v.id !== itemId) }
          : goal
      )
    );
    
    toast({
      title: "Vision Item Removed",
      description: "Vision item removed from vision board",
    });
  };
  
  // Dependency management functions
  const addDependencyToGoal = (goalId: string) => {
    if (!newDependencyGoalId) {
      toast({
        title: "Error",
        description: "Please select a goal to create dependency",
        variant: "destructive",
      });
      return;
    }
    
    // Check if dependency already exists
    const goal = goals.find(g => g.id === goalId);
    if (goal && goal.dependencies?.some(d => d.id === newDependencyGoalId)) {
      toast({
        title: "Error",
        description: "This dependency already exists",
        variant: "destructive",
      });
      return;
    }
    
    const newDependency: GoalDependency = {
      id: newDependencyGoalId,
      type: newDependencyType
    };
    
    // Update the current goal with the new dependency
    setGoalsWithCallback(
      goals.map(goal => 
        goal.id === goalId 
          ? { ...goal, dependencies: [...(goal.dependencies || []), newDependency] }
          : goal
      )
    );
    
    // Also update the dependent goal to include this goal as a dependent
    setGoalsWithCallback(
      goals.map(goal => 
        goal.id === newDependencyGoalId 
          ? { ...goal, dependents: [...(goal.dependents || []), goalId] }
          : goal
      )
    );
    
    // Reset form
    setNewDependencyGoalId("");
    setNewDependencyType("must-complete-before");
    
    toast({
      title: "Dependency Added!",
      description: "Dependency relationship created successfully",
    });
  };
  
  const removeDependencyFromGoal = (goalId: string, dependencyId: string) => {
    // Update the current goal to remove the dependency
    setGoalsWithCallback(
      goals.map(goal => 
        goal.id === goalId 
          ? { ...goal, dependencies: goal.dependencies?.filter(d => d.id !== dependencyId) }
          : goal
      )
    );
    
    // Also update the dependent goal to remove this goal from its dependents
    setGoalsWithCallback(
      goals.map(goal => 
        goal.id === dependencyId 
          ? { ...goal, dependents: goal.dependents?.filter(d => d !== goalId) }
          : goal
      )
    );
    
    toast({
      title: "Dependency Removed",
      description: "Dependency relationship removed successfully",
    });
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "task":
        return <CheckSquare className="h-4 w-4" />
      case "habit":
        return <Flame className="h-4 w-4" />
      case "challenge":
        return <Zap className="h-4 w-4" />
      case "milestone":
        return <Target className="h-4 w-4" />
      case "resource":
        return <Link className="h-4 w-4" />
      case "note":
        return <FileText className="h-4 w-4" />
      default:
        return <Target className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "task":
        return "bg-blue-500"
      case "habit":
        return "bg-green-500"
      case "challenge":
        return "bg-purple-500"
      case "milestone":
        return "bg-yellow-500"
      case "dependency":
        return "bg-red-500"
      case "resource":
        return "bg-indigo-500"
      case "note":
        return "bg-blue-300"
      default:
        return "bg-gray-500"
    }
  }

  // Resource management functions
  const addResourceToGoal = (goalId: string) => {
    if (!newResource.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a resource name",
        variant: "destructive",
      });
      return;
    }
    
    const resourceItem: ResourceItem = {
      id: Date.now().toString(),
      type: newResource.type,
      name: newResource.name,
      url: newResource.url,
      description: newResource.description,
      addedAt: new Date().toISOString().split("T")[0]
    };
    
    setGoalsWithCallback(
      goals.map(goal => 
        goal.id === goalId 
          ? { ...goal, resourcesList: [...(goal.resourcesList || []), resourceItem] }
          : goal
      )
    );
    
    // Reset form
    setNewResource({ type: 'document', name: '', url: '', description: '' });
    
    toast({
      title: "Resource Added!",
      description: `Resource "${newResource.name}" added to goal`,
    });
  };
  
  const deleteResourceFromGoal = (goalId: string, resourceId: string) => {
    setGoalsWithCallback(
      goals.map(goal => 
        goal.id === goalId 
          ? { ...goal, resourcesList: goal.resourcesList?.filter(r => r.id !== resourceId) }
          : goal
      )
    );
    
    toast({
      title: "Resource Removed",
      description: "Resource removed from goal",
    });
  };
  
  // Note management functions
  const addNoteToGoal = (goalId: string) => {
    if (!newNote.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a note title",
        variant: "destructive",
      });
      return;
    }
    
    const noteItem: NoteItem = {
      id: Date.now().toString(),
      title: newNote.title,
      content: newNote.content,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0]
    };
    
    setGoalsWithCallback(
      goals.map(goal => 
        goal.id === goalId 
          ? { ...goal, notes: [...(goal.notes || []), noteItem] }
          : goal
      )
    );
    
    // Reset form
    setNewNote({ title: '', content: '' });
    
    toast({
      title: "Note Added!",
      description: `Note "${newNote.title}" added to goal`,
    });
  };
  
  const deleteNoteFromGoal = (goalId: string, noteId: string) => {
    setGoalsWithCallback(
      goals.map(goal => 
        goal.id === goalId 
          ? { ...goal, notes: goal.notes?.filter(n => n.id !== noteId) }
          : goal
      )
    );
    
    toast({
      title: "Note Removed",
      description: "Note removed from goal",
    });
  };
  
  const updateNoteInGoal = (goalId: string, noteId: string, updatedNote: Partial<NoteItem>) => {
    setGoalsWithCallback(
      goals.map(goal => {
        if (goal.id === goalId && goal.notes) {
          const updatedNotes = goal.notes.map(note => 
            note.id === noteId 
              ? { ...note, ...updatedNote, updatedAt: new Date().toISOString().split("T")[0] }
              : note
          );
          
          return { ...goal, notes: updatedNotes };
        }
        return goal;
      })
    );
    
    toast({
      title: "Note Updated!",
      description: "Note updated successfully",
    });
  };
  
  // Success Criteria management functions
  const [newSuccessCriteria, setNewSuccessCriteria] = useState<{ description: string, targetDate?: string, progress?: number }>({ description: '' });
  
  const addSuccessCriteriaToGoal = (goalId: string) => {
    if (!newSuccessCriteria.description.trim()) {
      toast({
        title: "Error",
        description: "Please enter a success criteria description",
        variant: "destructive",
      });
      return;
    }
    
    const criteriaItem: SuccessCriteria = {
      id: Date.now().toString(),
      description: newSuccessCriteria.description,
      isCompleted: false,
      targetDate: newSuccessCriteria.targetDate,
      progress: newSuccessCriteria.progress || 0
    };
    
    setGoalsWithCallback(
      goals.map(goal => 
        goal.id === goalId 
          ? updateGoalProgress({ ...goal, successCriteria: [...(goal.successCriteria || []), criteriaItem] })
          : goal
      )
    );
    
    // Reset form
    setNewSuccessCriteria({ description: '', targetDate: undefined, progress: undefined });
    
    toast({
      title: "Success Criteria Added!",
      description: "Success criteria added to goal",
    });
  };
  
  const deleteSuccessCriteriaFromGoal = (goalId: string, criteriaId: string) => {
    setGoalsWithCallback(
      goals.map(goal => 
        goal.id === goalId 
          ? updateGoalProgress({ ...goal, successCriteria: goal.successCriteria?.filter(c => c.id !== criteriaId) })
          : goal
      )
    );
    
    toast({
      title: "Success Criteria Removed",
      description: "Success criteria removed from goal",
    });
  };
  
  const toggleSuccessCriteriaCompletion = (goalId: string, criteriaId: string) => {
    setGoalsWithCallback(
      goals.map(goal => {
        if (goal.id === goalId && goal.successCriteria) {
          const updatedCriteria = goal.successCriteria.map(criteria => {
            if (criteria.id === criteriaId) {
              return {
                ...criteria,
                isCompleted: !criteria.isCompleted,
                completedDate: !criteria.isCompleted ? new Date().toISOString().split("T")[0] : undefined
              };
            }
            return criteria;
          });
          
          return updateGoalProgress({ ...goal, successCriteria: updatedCriteria });
        }
        return goal;
      })
    );
    
    toast({
      title: "Success Criteria Updated!",
      description: "Success criteria completion status updated",
    });
  };
  
  const updateSuccessCriteriaProgress = (goalId: string, criteriaId: string, progress: number) => {
    setGoalsWithCallback(
      goals.map(goal => {
        if (goal.id === goalId && goal.successCriteria) {
          const updatedCriteria = goal.successCriteria.map(criteria => {
            if (criteria.id === criteriaId) {
              return {
                ...criteria,
                progress: Math.min(100, Math.max(0, progress)) // Ensure progress is between 0 and 100
              };
            }
            return criteria;
          });
          
          return updateGoalProgress({ ...goal, successCriteria: updatedCriteria });
        }
        return goal;
      })
    );
  };
  
  // Motivation System functions
  const [newMotivationSource, setNewMotivationSource] = useState<{ type: 'personal' | 'external' | 'visual' | 'quote' | 'reward', content: string, description?: string }>({ type: 'quote', content: '' });
  
  const updateMotivationLevel = (goalId: string, level: number, note?: string) => {
    setGoalsWithCallback(
      goals.map(goal => {
        if (goal.id === goalId) {
          const newEntry = {
            date: new Date().toISOString().split("T")[0],
            level,
            note
          };
            
          const existingTracker = goal.motivationTracker || {
            level: 5,
            lastUpdated: new Date().toISOString().split("T")[0],
            history: [],
            sources: [],
            triggers: [],
            barriers: []
          };
            
          const updatedTracker = {
            ...existingTracker,
            level,
            lastUpdated: new Date().toISOString().split("T")[0],
            history: [
              ...(existingTracker.history || []),
              newEntry
            ]
          };
            
          return { 
            ...goal, 
            motivationTracker: updatedTracker 
          };
        }
        return goal;
      })
    );
      
    toast({
      title: "Motivation Updated!",
      description: `Motivation level updated to ${level}/10`,
    });
  };
  
  const addMotivationSource = (goalId: string) => {
    if (!newMotivationSource.content.trim()) {
      toast({
        title: "Error",
        description: "Please enter motivation source content",
        variant: "destructive",
      });
      return;
    }
    
    const sourceItem: MotivationSource = {
      id: Date.now().toString(),
      type: newMotivationSource.type,
      content: newMotivationSource.content,
      description: newMotivationSource.description,
      addedAt: new Date().toISOString().split("T")[0]
    };
    
    setGoalsWithCallback(
      goals.map(goal => {
        if (goal.id === goalId) {
          const existingTracker = goal.motivationTracker || {
            level: 5,
            lastUpdated: new Date().toISOString().split("T")[0],
            history: [],
            sources: [],
            triggers: [],
            barriers: []
          };
          
          const updatedTracker = {
            ...existingTracker,
            sources: [
              ...(existingTracker.sources || []),
              sourceItem
            ]
          };
          
          return { 
            ...goal, 
            motivationTracker: updatedTracker 
          };
        }
        return goal;
      })
    );
    
    // Reset form
    setNewMotivationSource({ type: 'quote', content: '', description: '' });
    
    toast({
      title: "Motivation Source Added!",
      description: "New motivation source added to goal",
    });
  };
  
  const removeMotivationSource = (goalId: string, sourceId: string) => {
    setGoalsWithCallback(
      goals.map(goal => {
        if (goal.id === goalId && goal.motivationTracker) {
          const existingTracker = goal.motivationTracker || {
            level: 5,
            lastUpdated: new Date().toISOString().split("T")[0],
            history: [],
            sources: [],
            triggers: [],
            barriers: []
          };
          
          const updatedTracker = {
            ...existingTracker,
            sources: existingTracker.sources?.filter(s => s.id !== sourceId)
          };
          
          return { 
            ...goal, 
            motivationTracker: updatedTracker 
          };
        }
        return goal;
      })
    );
    
    toast({
      title: "Motivation Source Removed",
      description: "Motivation source removed from goal",
    });
  };
  
  const addMotivationTrigger = (goalId: string, trigger: string) => {
    if (!trigger.trim()) return;
    
    setGoalsWithCallback(
      goals.map(goal => {
        if (goal.id === goalId) {
          const existingTracker = goal.motivationTracker || {
            level: 5,
            lastUpdated: new Date().toISOString().split("T")[0],
            history: [],
            sources: [],
            triggers: [],
            barriers: []
          };
          
          const updatedTracker = {
            ...existingTracker,
            triggers: [
              ...(existingTracker.triggers || []),
              trigger
            ]
          };
          
          return { 
            ...goal, 
            motivationTracker: updatedTracker 
          };
        }
        return goal;
      })
    );
  };
  
  const removeMotivationTrigger = (goalId: string, trigger: string) => {
    setGoalsWithCallback(
      goals.map(goal => {
        if (goal.id === goalId && goal.motivationTracker) {
          const existingTracker = goal.motivationTracker || {
            level: 5,
            lastUpdated: new Date().toISOString().split("T")[0],
            history: [],
            sources: [],
            triggers: [],
            barriers: []
          };
          
          const updatedTracker = {
            ...existingTracker,
            triggers: existingTracker.triggers?.filter(t => t !== trigger)
          };
          
          return { 
            ...goal, 
            motivationTracker: updatedTracker 
          };
        }
        return goal;
      })
    );
  };
  
  const addMotivationBarrier = (goalId: string, barrier: string) => {
    if (!barrier.trim()) return;
    
    setGoalsWithCallback(
      goals.map(goal => {
        if (goal.id === goalId) {
          const existingTracker = goal.motivationTracker || {
            level: 5,
            lastUpdated: new Date().toISOString().split("T")[0],
            history: [],
            sources: [],
            triggers: [],
            barriers: []
          };
          
          const updatedTracker = {
            ...existingTracker,
            barriers: [
              ...(existingTracker.barriers || []),
              barrier
            ]
          };
          
          return { 
            ...goal, 
            motivationTracker: updatedTracker 
          };
        }
        return goal;
      })
    );
  };
  
  const removeMotivationBarrier = (goalId: string, barrier: string) => {
    setGoalsWithCallback(
      goals.map(goal => {
        if (goal.id === goalId && goal.motivationTracker) {
          const existingTracker = goal.motivationTracker || {
            level: 5,
            lastUpdated: new Date().toISOString().split("T")[0],
            history: [],
            sources: [],
            triggers: [],
            barriers: []
          };
          
          const updatedTracker = {
            ...existingTracker,
            barriers: existingTracker.barriers?.filter(b => b !== barrier)
          };
          
          return { 
            ...goal, 
            motivationTracker: updatedTracker 
          };
        }
        return goal;
      })
    );
  };
  
  const toggleGoalCompletion = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    
    setGoalsWithCallback(
      goals.map(goal => {
        if (goal.id === goalId) {
          return {
            ...goal,
            completed: !goal.completed
          };
        }
        return goal;
      })
    );
    
    toast({
      title: `Goal ${!goal.completed ? 'Completed' : 'Marked Incomplete'}!`,
      description: `Goal status updated successfully`,
    });
  };

  // Helper function to render array fields for Harada Method
  const renderArrayField = (field: "obstacles" | "resources" | "supporters" | "dailyHabits" | "weeklyMilestones" | "monthlyTargets", label: string, placeholder: string, values: any[], onChange: (index: number, value: string) => void, onRemove: (index: number) => void, onAdd: () => void) => {
    // Render different UI based on the field type
    if (field === "dailyHabits" || field === "weeklyMilestones" || field === "monthlyTargets") {
      return (
        <div className="space-y-2">
          <Label>{label}</Label>
          {values.map((value, index) => {
            let options = [];
            if (field === "dailyHabits") {
              options = habits;
            } else {
              options = tasks; // For both weeklyMilestones and monthlyTargets
            }
            
            return (
              <div key={index} className="flex gap-2">
                <select
                  value={value.id || ""}
                  onChange={(e) => onChange(index, e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm w-full"
                >
                  <option value="">Select a {field === "dailyHabits" ? "habit" : "task"}</option>
                  {options.map((item: any) => (
                    <option key={item.id} value={item.id}>
                      {item.title || item.name || item.text}
                    </option>
                  ))}
                </select>
                {values.length > 1 && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onRemove(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            );
          })}
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={onAdd}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>
      );
    } else {
      // For obstacles, resources, and supporters, use the original text input
      return (
        <div className="space-y-2">
          <Label>{label}</Label>
          {values.map((value, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={value}
                onChange={(e) => onChange(index, e.target.value)}
                placeholder={placeholder}
              />
              {values.length > 1 && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onRemove(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={onAdd}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>
      );
    }
  };
  
  // Timeline Visualization Helper Functions
  const generateTimelineData = (goal: Goal) => {
    const data = [];
    
    // Add start point
    data.push({
      date: goal.createdAt,
      progress: 0,
      type: 'start'
    });
    
    // Add milestone points
    if (goal.milestones) {
      goal.milestones.forEach(milestone => {
        if (milestone.completed && milestone.completedDate) {
          // Estimate progress based on milestone completion
          const estimatedProgress = Math.min(100, Math.floor(Math.random() * 40) + 60); // 60-100%
          data.push({
            date: milestone.completedDate,
            progress: estimatedProgress,
            type: 'milestone',
            title: milestone.title
          });
        }
      });
    }
    
    // Add current progress point
    data.push({
      date: new Date().toISOString().split('T')[0],
      progress: goal.progress,
      type: 'current'
    });
    
    // Sort by date
    return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };
  
  const generateMilestoneData = (goal: Goal) => {
    if (!goal.milestones) return [];
    
    return goal.milestones.map(milestone => ({
      date: milestone.targetDate || new Date().toISOString().split('T')[0],
      progress: milestone.completed ? 100 : Math.floor(Math.random() * 30) + 70, // 70-100% for target
      title: milestone.title,
      completed: milestone.completed,
      type: 'milestone'
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Sorting and Add Button */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Input
                placeholder="Search goals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-48"
              />
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'progress' | 'title' | 'created' | 'manual')}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="progress">Sort by Progress</option>
                <option value="title">Sort by Title</option>
                <option value="created">Sort by Created</option>
                <option value="manual">Manual Order</option>
              </select>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Goal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Goal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="goal-title">Goal Title *</Label>
                    <Input
                      id="goal-title"
                      placeholder="e.g., Improve physical health through exercise"
                      value={newGoalTitle}
                      onChange={(e) => setNewGoalTitle(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="goal-description">Description</Label>
                    <Textarea
                      id="goal-description"
                      placeholder="Add details about this goal..."
                      value={newGoalDescription}
                      onChange={(e) => setNewGoalDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="goal-target-date">Target Date</Label>
                      <Input
                        id="goal-target-date"
                        type="date"
                        value={newGoalTargetDate}
                        onChange={(e) => setNewGoalTargetDate(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="goal-motivation">Why is this goal important to you?</Label>
                    <Textarea
                      id="goal-motivation"
                      placeholder="What drives you to achieve this goal?"
                      value={newGoalMotivation}
                      onChange={(e) => setNewGoalMotivation(e.target.value)}
                      rows={2}
                    />
                  </div>
                  
                  {/* Link to Harada Method Goal if enabled */}
                  {showHaradaFields && haradaGoals.length > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="harada-goal-link">Link to Harada Goal</Label>
                      <select
                        id="harada-goal-link"
                        value={newGoalHaradaLink}
                        onChange={(e) => setNewGoalHaradaLink(e.target.value)}
                        className="border rounded-md px-3 py-2 text-sm w-full"
                      >
                        <option value="">Select a Harada goal (optional)</option>
                        {haradaGoals.map((haradaGoal: any) => (
                          <option key={haradaGoal.id} value={haradaGoal.id}>
                            {haradaGoal.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="goal-current-state">Current State</Label>
                      <Textarea
                        id="goal-current-state"
                        placeholder="Where are you now regarding this goal?"
                        value={newGoalCurrentState}
                        onChange={(e) => setNewGoalCurrentState(e.target.value)}
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="goal-desired-state">Desired State</Label>
                      <Textarea
                        id="goal-desired-state"
                        placeholder="Where do you want to be?"
                        value={newGoalDesiredState}
                        onChange={(e) => setNewGoalDesiredState(e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                  
                  {/* Harada Method Fields - Only show if Harada is enabled */}
                  {showHaradaFields && (
                    <div className="space-y-6">
                      <div className="border-t pt-4">
                        <h3 className="font-medium text-lg mb-3">Harada Method Planning</h3>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                          <Card>
                            <CardHeader>
                              <CardTitle>Obstacles & Resources</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              {renderArrayField(
                                "obstacles",
                                "Potential Obstacles",
                                "e.g., Lack of time, fear of failure",
                                newGoalObstacles,
                                (index, value) => handleArrayChange("obstacles", index, value),
                                (index) => handleArrayRemove("obstacles", index),
                                () => handleArrayAdd("obstacles")
                              )}
                              
                              {renderArrayField(
                                "resources",
                                "Available Resources",
                                "e.g., Online courses, mentor",
                                newGoalResources,
                                (index, value) => handleArrayChange("resources", index, value),
                                (index) => handleArrayRemove("resources", index),
                                () => handleArrayAdd("resources")
                              )}
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardHeader>
                              <CardTitle>Support Network</CardTitle>
                            </CardHeader>
                            <CardContent>
                              {renderArrayField(
                                "supporters",
                                "Supporters",
                                "e.g., Family member, colleague",
                                newGoalSupporters,
                                (index, value) => handleArrayChange("supporters", index, value),
                                (index) => handleArrayRemove("supporters", index),
                                () => handleArrayAdd("supporters")
                              )}
                            </CardContent>
                          </Card>
                        </div>
                        
                        <Card className="mt-6">
                          <CardHeader>
                            <CardTitle>Action Plan</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {renderArrayField(
                              "dailyHabits",
                              "Daily Habits",
                              "e.g., 30 minutes study time",
                              newGoalDailyHabits,
                              (index, value) => handleArrayChange("dailyHabits", index, value),
                              (index) => handleArrayRemove("dailyHabits", index),
                              () => handleArrayAdd("dailyHabits")
                            )}
                            
                            {renderArrayField(
                              "weeklyMilestones",
                              "Weekly Milestones",
                              "e.g., Complete one lesson",
                              newGoalWeeklyMilestones,
                              (index, value) => handleArrayChange("weeklyMilestones", index, value),
                              (index) => handleArrayRemove("weeklyMilestones", index),
                              () => handleArrayAdd("weeklyMilestones")
                            )}
                            
                            {renderArrayField(
                              "monthlyTargets",
                              "Monthly Targets",
                              "e.g., Pass practice test",
                              newGoalMonthlyTargets,
                              (index, value) => handleArrayChange("monthlyTargets", index, value),
                              (index) => handleArrayRemove("monthlyTargets", index),
                              () => handleArrayAdd("monthlyTargets")
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-3 sticky bottom-0 bg-background pt-4 border-t">
                    <Button variant="outline" onClick={() => {
                      // Reset form
                      setNewGoalTitle("");
                      setNewGoalDescription("");
                      setNewGoalTargetDate("");
                      setNewGoalMotivation("");
                      setNewGoalCurrentState("");
                      setNewGoalDesiredState("");
                      setNewGoalObstacles([""]);
                      setNewGoalResources([""]);
                      setNewGoalSupporters([""]);
                      setNewGoalDailyHabits([]);
                      setNewGoalWeeklyMilestones([]);
                      setNewGoalMonthlyTargets([]);
                    }}>
                      Cancel
                    </Button>
                    <Button onClick={addGoal} disabled={!newGoalTitle.trim()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Goal
                    </Button>
                  </div>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Goal
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Goals List */}
      {filteredGoals.length > 0 ? (
        <div className="space-y-4">
          {filteredGoals.map((goal, index) => (
            <Card 
              key={goal.id}
              style={getPriorityColorStyle(goal.categories)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    <div className="mt-1 text-muted-foreground">
                      <GripVertical className="h-5 w-5" />
                    </div>
                    <button 
                      onClick={() => toggleGoalCompletion(goal.id)} 
                      className="flex-shrink-0 mt-1 text-muted-foreground hover:text-primary"
                    >
                      {goal.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        {goal.title}
                      </CardTitle>
                      <CardDescription className="mt-2">{goal.description}</CardDescription>
                      {goal.categories && goal.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {goal.categories.map((cat, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditGoal(goal)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Edit Goal</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-title">Goal Title</Label>
                            <Input
                              id="edit-title"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
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
                          
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-target-date">Target Date</Label>
                              <Input
                                id="edit-target-date"
                                type="date"
                                value={editTargetDate}
                                onChange={(e) => setEditTargetDate(e.target.value)}
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="edit-motivation">Why is this goal important to you?</Label>
                            <Textarea
                              id="edit-motivation"
                              placeholder="What drives you to achieve this goal?"
                              value={editMotivation}
                              onChange={(e) => setEditMotivation(e.target.value)}
                              rows={2}
                            />
                          </div>
                          
                          {/* Link to Harada Method Goal if enabled */}
                          {showHaradaFields && haradaGoals.length > 0 && (
                            <div className="space-y-2">
                              <Label htmlFor="edit-harada-goal-link">Link to Harada Goal</Label>
                              <select
                                id="edit-harada-goal-link"
                                value={editingGoal?.longTermGoalId || ""}
                                onChange={(e) => {
                                  const updatedGoal = { ...editingGoal!, longTermGoalId: e.target.value };
                                  setEditingGoal(updatedGoal);
                                }}
                                className="border rounded-md px-3 py-2 text-sm w-full"
                              >
                                <option value="">Select a Harada goal (optional)</option>
                                {haradaGoals.map((haradaGoal: any) => (
                                  <option key={haradaGoal.id} value={haradaGoal.id}>
                                    {haradaGoal.title}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                          
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-current-state">Current State</Label>
                              <Textarea
                                id="edit-current-state"
                                placeholder="Where are you now regarding this goal?"
                                value={editCurrentState}
                                onChange={(e) => setEditCurrentState(e.target.value)}
                                rows={2}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-desired-state">Desired State</Label>
                              <Textarea
                                id="edit-desired-state"
                                placeholder="Where do you want to be?"
                                value={editDesiredState}
                                onChange={(e) => setEditDesiredState(e.target.value)}
                                rows={2}
                              />
                            </div>
                          </div>
                          
                          {/* Harada Method Fields - Only show if Harada is enabled */}
                          {showHaradaFields && (
                            <div className="space-y-6">
                              <div className="border-t pt-4">
                                <h3 className="font-medium text-lg mb-3">Harada Method Planning</h3>
                                                      
                                <div className="grid md:grid-cols-2 gap-6">
                                  <Card>
                                    <CardHeader>
                                      <CardTitle>Obstacles & Resources</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                      {renderArrayField(
                                        "obstacles",
                                        "Potential Obstacles",
                                        "e.g., Lack of time, fear of failure",
                                        editObstacles,
                                        (index, value) => {
                                          const newObstacles = [...editObstacles];
                                          newObstacles[index] = value;
                                          setEditObstacles(newObstacles);
                                        },
                                        (index) => {
                                          if (editObstacles.length > 1) {
                                            setEditObstacles(editObstacles.filter((_, i) => i !== index));
                                          }
                                        },
                                        () => setEditObstacles([...editObstacles, ""])
                                      )}
                                                            
                                      {renderArrayField(
                                        "resources",
                                        "Available Resources",
                                        "e.g., Online courses, mentor",
                                        editResources,
                                        (index, value) => {
                                          const newResources = [...editResources];
                                          newResources[index] = value;
                                          setEditResources(newResources);
                                        },
                                        (index) => {
                                          if (editResources.length > 1) {
                                            setEditResources(editResources.filter((_, i) => i !== index));
                                          }
                                        },
                                        () => setEditResources([...editResources, ""])
                                      )}
                                    </CardContent>
                                  </Card>
                                                        
                                  <Card>
                                    <CardHeader>
                                      <CardTitle>Support Network</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      {renderArrayField(
                                        "supporters",
                                        "Supporters",
                                        "e.g., Family member, colleague",
                                        editSupporters,
                                        (index, value) => {
                                          const newSupporters = [...editSupporters];
                                          newSupporters[index] = value;
                                          setEditSupporters(newSupporters);
                                        },
                                        (index) => {
                                          if (editSupporters.length > 1) {
                                            setEditSupporters(editSupporters.filter((_, i) => i !== index));
                                          }
                                        },
                                        () => setEditSupporters([...editSupporters, ""])
                                      )}
                                    </CardContent>
                                  </Card>
                                </div>
                                                      
                                <Card className="mt-6">
                                  <CardHeader>
                                    <CardTitle>Action Plan</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    {renderArrayField(
                                      "dailyHabits",
                                      "Daily Habits",
                                      "e.g., 30 minutes study time",
                                      editDailyHabits,
                                      (index, value) => {
                                        const newDailyHabits = [...editDailyHabits];
                                        const selectedHabit = habits.find(h => h.id === value);
                                        if (selectedHabit) {
                                          newDailyHabits[index] = { id: selectedHabit.id, name: selectedHabit.name, type: 'habit' };
                                        } else {
                                          newDailyHabits[index] = { id: '', name: '', type: 'habit' };
                                        }
                                        setEditDailyHabits(newDailyHabits);
                                      },
                                      (index) => {
                                        if (editDailyHabits.length > 1) {
                                          setEditDailyHabits(editDailyHabits.filter((_, i) => i !== index));
                                        }
                                      },
                                      () => setEditDailyHabits([...editDailyHabits, { id: '', name: '', type: 'habit' }])
                                    )}
                                                          
                                    {renderArrayField(
                                      "weeklyMilestones",
                                      "Weekly Milestones",
                                      "e.g., Complete one lesson",
                                      editWeeklyMilestones,
                                      (index, value) => {
                                        const newWeeklyMilestones = [...editWeeklyMilestones];
                                        const selectedTaskWeekly = tasks.find(t => t.id === value);
                                        if (selectedTaskWeekly) {
                                          newWeeklyMilestones[index] = { id: selectedTaskWeekly.id, name: selectedTaskWeekly.title, type: 'task' };
                                        } else {
                                          newWeeklyMilestones[index] = { id: '', name: '', type: 'task' };
                                        }
                                        setEditWeeklyMilestones(newWeeklyMilestones);
                                      },
                                      (index) => {
                                        if (editWeeklyMilestones.length > 1) {
                                          setEditWeeklyMilestones(editWeeklyMilestones.filter((_, i) => i !== index));
                                        }
                                      },
                                      () => setEditWeeklyMilestones([...editWeeklyMilestones, { id: '', name: '', type: 'task' }])
                                    )}
                                                          
                                    {renderArrayField(
                                      "monthlyTargets",
                                      "Monthly Targets",
                                      "e.g., Pass practice test",
                                      editMonthlyTargets,
                                      (index, value) => {
                                        const newMonthlyTargets = [...editMonthlyTargets];
                                        const selectedTaskMonthly = tasks.find(t => t.id === value);
                                        if (selectedTaskMonthly) {
                                          newMonthlyTargets[index] = { id: selectedTaskMonthly.id, name: selectedTaskMonthly.title, type: 'task' };
                                        } else {
                                          newMonthlyTargets[index] = { id: '', name: '', type: 'task' };
                                        }
                                        setEditMonthlyTargets(newMonthlyTargets);
                                      },
                                      (index) => {
                                        if (editMonthlyTargets.length > 1) {
                                          setEditMonthlyTargets(editMonthlyTargets.filter((_, i) => i !== index));
                                        }
                                      },
                                      () => setEditMonthlyTargets([...editMonthlyTargets, { id: '', name: '', type: 'task' }])
                                    )}
                                  </CardContent>
                                </Card>
                              </div>
                            </div>
                          )}
                                                
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setEditingGoal(null)}>
                              Cancel
                            </Button>
                            <Button onClick={saveGoalEdits}>
                              Save Changes
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteGoal(goal.id)}
                      className="flex-shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {goal.completedItems} of {goal.totalItems} items completed
                    </span>
                    <span className="text-muted-foreground">
                      Created: {goal.createdAt}
                    </span>
                  </div>
                  
                  {/* Vision Board Section */}
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-foreground flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Vision Board
                      </h3>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Vision
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Add to Vision Board</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="vision-type">Type</Label>
                              <select
                                id="vision-type"
                                value={newVisionItem.type}
                                onChange={(e) => setNewVisionItem({...newVisionItem, type: e.target.value as 'image' | 'quote' | 'note'})}
                                className="border rounded-md px-3 py-2 text-sm w-full"
                              >
                                <option value="image">Image</option>
                                <option value="quote">Quote</option>
                                <option value="note">Note</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="vision-content">Content</Label>
                              {newVisionItem.type === 'image' ? (
                                <Input
                                  id="vision-content"
                                  placeholder="Enter image URL"
                                  value={newVisionItem.content}
                                  onChange={(e) => setNewVisionItem({...newVisionItem, content: e.target.value})}
                                />
                              ) : (
                                <Textarea
                                  id="vision-content"
                                  placeholder={newVisionItem.type === 'quote' ? "Enter your inspiring quote" : "Enter your note"}
                                  value={newVisionItem.content}
                                  onChange={(e) => setNewVisionItem({...newVisionItem, content: e.target.value})}
                                  rows={3}
                                />
                              )}
                            </div>
                            {newVisionItem.type === 'image' && (
                              <div className="space-y-2">
                                <Label htmlFor="vision-caption">Caption (Optional)</Label>
                                <Input
                                  id="vision-caption"
                                  placeholder="Add a caption for your image"
                                  value={newVisionItem.caption || ''}
                                  onChange={(e) => setNewVisionItem({...newVisionItem, caption: e.target.value})}
                                />
                              </div>
                            )}
                            <Button 
                              onClick={() => addVisionItemToGoal(goal.id)}
                              className="w-full"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add to Vision Board
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                                      
                    {goal.visionBoard && goal.visionBoard.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {goal.visionBoard.map((item) => (
                          <div 
                            key={item.id} 
                            className="rounded-lg border border-border bg-card p-4 relative group"
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => deleteVisionItemFromGoal(goal.id, item.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            {item.type === 'image' ? (
                              <div className="flex flex-col items-center">
                                <img 
                                  src={item.content} 
                                  alt={item.caption || "Vision board item"}
                                  className="w-full h-32 object-cover rounded-md mb-2"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
                                  }}
                                />
                                {item.caption && (
                                  <p className="text-sm text-center text-muted-foreground mt-1">
                                    {item.caption}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div className="flex flex-col">
                                <div className="flex items-start gap-2">
                                  <div className="mt-1 text-primary">
                                    {item.type === 'quote' ? '“' : '📝'}
                                  </div>
                                  <p className="text-sm">
                                    {item.content}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm py-4 text-center">
                        No vision items yet. Add inspiring images, quotes, or notes to your vision board.
                      </p>
                    )}
                  </div>
                                    
                  {/* Milestones Section */}
                  <div className="pt-4 border-t border-border mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-foreground flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Milestones
                      </h3>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Milestone
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Add New Milestone</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="milestone-title">Title *</Label>
                              <Input
                                id="milestone-title"
                                placeholder="e.g., Complete first phase"
                                value={newMilestoneTitle}
                                onChange={(e) => setNewMilestoneTitle(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="milestone-description">Description</Label>
                              <Textarea
                                id="milestone-description"
                                placeholder="Describe this milestone..."
                                value={newMilestoneDescription}
                                onChange={(e) => setNewMilestoneDescription(e.target.value)}
                                rows={2}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="milestone-target-date">Target Date</Label>
                              <Input
                                id="milestone-target-date"
                                type="date"
                                value={newMilestoneTargetDate}
                                onChange={(e) => setNewMilestoneTargetDate(e.target.value)}
                              />
                            </div>
                            <Button 
                              onClick={() => addMilestoneToGoal(goal.id)}
                              className="w-full"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Milestone
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                                      
                    {goal.milestones && goal.milestones.length > 0 ? (
                      <div className="space-y-3">
                        {goal.milestones.map((milestone) => (
                          <div 
                            key={milestone.id} 
                            className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card"
                          >
                            <div className={`p-2 rounded-full ${getTypeColor('milestone')}`}>
                              {getIconForType('milestone')}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${milestone.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                {milestone.title}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1 truncate">
                                {milestone.description}
                              </p>
                              {milestone.targetDate && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Target: {new Date(milestone.targetDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={milestone.completed ? "default" : "secondary"}>
                                {milestone.completed ? "Completed" : "Pending"}
                              </Badge>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => handleEditMilestone(milestone)}
                                  >
                                    <Settings className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>Edit Milestone</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-milestone-title">Title *</Label>
                                      <Input
                                        id="edit-milestone-title"
                                        value={editMilestoneTitle}
                                        onChange={(e) => setEditMilestoneTitle(e.target.value)}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-milestone-description">Description</Label>
                                      <Textarea
                                        id="edit-milestone-description"
                                        value={editMilestoneDescription}
                                        onChange={(e) => setEditMilestoneDescription(e.target.value)}
                                        rows={2}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-milestone-target-date">Target Date</Label>
                                      <Input
                                        id="edit-milestone-target-date"
                                        type="date"
                                        value={editMilestoneTargetDate}
                                        onChange={(e) => setEditMilestoneTargetDate(e.target.value)}
                                      />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                      <Button 
                                        variant="outline" 
                                        onClick={() => setEditingMilestone(null)}
                                      >
                                        Cancel
                                      </Button>
                                      <Button 
                                        onClick={() => saveMilestoneEdits(goal.id)}
                                      >
                                        Save Changes
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleMilestoneCompletion(goal.id, milestone.id)}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                {milestone.completed ? (
                                  <CheckSquare className="h-4 w-4 text-green-500" />
                                ) : (
                                  <div className="w-4 h-4 border rounded-sm" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteMilestoneFromGoal(goal.id, milestone.id)}
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm py-4 text-center">
                        No milestones yet. Add milestones to track progress toward your goal.
                      </p>
                    )}
                  </div>
                                    
                  {/* Dependencies & Prerequisites */}
                  <div className="pt-4 border-t border-border mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-foreground flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Dependencies & Prerequisites
                      </h3>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Dependency
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Add Dependency</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="dependency-goal">Goal to Depend On</Label>
                              <select
                                id="dependency-goal"
                                value={newDependencyGoalId}
                                onChange={(e) => setNewDependencyGoalId(e.target.value)}
                                className="border rounded-md px-3 py-2 text-sm w-full"
                              >
                                <option value="">Select a goal</option>
                                {goals.filter(g => g.id !== goal.id).map(g => (
                                  <option key={g.id} value={g.id}>
                                    {g.title}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="dependency-type">Dependency Type</Label>
                              <select
                                id="dependency-type"
                                value={newDependencyType}
                                onChange={(e) => setNewDependencyType(e.target.value as 'must-complete-before' | 'parallel' | 'sequential' | 'blocking')}
                                className="border rounded-md px-3 py-2 text-sm w-full"
                              >
                                <option value="must-complete-before">Must complete before</option>
                                <option value="parallel">Parallel (can work on together)</option>
                                <option value="sequential">Sequential (one after another)</option>
                                <option value="blocking">Blocking (conflicts with this)</option>
                              </select>
                            </div>
                            <Button 
                              onClick={() => addDependencyToGoal(goal.id)}
                              className="w-full"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Dependency
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                                      
                    {goal.dependencies && goal.dependencies.length > 0 ? (
                      <div className="space-y-3">
                        {goal.dependencies.map((dependency) => {
                          const depGoal = goals.find(g => g.id === dependency.id);
                          return (
                            <div 
                              key={dependency.id} 
                              className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card"
                            >
                              <div className={`p-2 rounded-full ${getTypeColor('dependency')}`}>
                                {getIconForType('dependency')}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-foreground">
                                  {depGoal ? depGoal.title : `Goal ${dependency.id}`}
                                </p>
                                <Badge variant="outline" className="mt-1 capitalize">
                                  {dependency.type.replace('-', ' ')}
                                </Badge>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeDependencyFromGoal(goal.id, dependency.id)}
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm py-4 text-center">
                        No dependencies yet. Add goals that this goal depends on or conflicts with.
                      </p>
                    )}
                  </div>
                                    
                  {/* Resources Section */}
                  <div className="pt-4 border-t border-border mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-foreground flex items-center gap-2">
                        <Link className="h-4 w-4" />
                        Resources
                      </h3>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Resource
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Add Resource</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="resource-type">Type</Label>
                              <select
                                id="resource-type"
                                value={newResource.type}
                                onChange={(e) => setNewResource({...newResource, type: e.target.value as 'document' | 'link' | 'budget' | 'contact' | 'equipment' | 'learning'})}
                                className="border rounded-md px-3 py-2 text-sm w-full"
                              >
                                <option value="document">Document</option>
                                <option value="link">Link</option>
                                <option value="budget">Budget</option>
                                <option value="contact">Contact</option>
                                <option value="equipment">Equipment</option>
                                <option value="learning">Learning Material</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="resource-name">Name *</Label>
                              <Input
                                id="resource-name"
                                placeholder="Enter resource name"
                                value={newResource.name}
                                onChange={(e) => setNewResource({...newResource, name: e.target.value})}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="resource-url">URL (Optional)</Label>
                              <Input
                                id="resource-url"
                                placeholder="https://example.com"
                                value={newResource.url || ''}
                                onChange={(e) => setNewResource({...newResource, url: e.target.value})}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="resource-description">Description (Optional)</Label>
                              <Textarea
                                id="resource-description"
                                placeholder="Add details about this resource..."
                                value={newResource.description || ''}
                                onChange={(e) => setNewResource({...newResource, description: e.target.value})}
                                rows={2}
                              />
                            </div>
                            <Button 
                              onClick={() => addResourceToGoal(goal.id)}
                              className="w-full"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Resource
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                                      
                    {goal.resourcesList && goal.resourcesList.length > 0 ? (
                      <div className="space-y-3">
                        {goal.resourcesList.map((resource) => (
                          <div 
                            key={resource.id} 
                            className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card"
                          >
                            <div className={`p-2 rounded-full ${getTypeColor('resource')}`}>
                              {getIconForType('resource')}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-foreground">
                                {resource.name}
                              </p>
                              {resource.description && (
                                <p className="text-xs text-muted-foreground mt-1 truncate">
                                  {resource.description}
                                </p>
                              )}
                              <Badge variant="outline" className="mt-1 capitalize">
                                {resource.type}
                              </Badge>
                              {resource.url && (
                                <a 
                                  href={resource.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-500 hover:underline block mt-1"
                                >
                                  {resource.url}
                                </a>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {resource.addedAt}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteResourceFromGoal(goal.id, resource.id)}
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm py-4 text-center">
                        No resources added yet. Add documents, links, contacts, or other resources to support this goal.
                      </p>
                    )}
                  </div>
                                    
                  {/* Notes Section */}
                  <div className="pt-4 border-t border-border mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-foreground flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Notes
                      </h3>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Note
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Add Note</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="note-title">Title *</Label>
                              <Input
                                id="note-title"
                                placeholder="Note title"
                                value={newNote.title}
                                onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="note-content">Content</Label>
                              <Textarea
                                id="note-content"
                                placeholder="Write your note here..."
                                value={newNote.content}
                                onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                                rows={4}
                              />
                            </div>
                            <Button 
                              onClick={() => addNoteToGoal(goal.id)}
                              className="w-full"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Note
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                                      
                    {goal.notes && goal.notes.length > 0 ? (
                      <div className="space-y-3">
                        {goal.notes.map((note) => (
                          <div 
                            key={note.id} 
                            className="p-3 rounded-lg border border-border bg-card"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-full ${getTypeColor('note')}`}>
                                  {getIconForType('note')}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground">
                                    {note.title}
                                  </p>
                                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">
                                    {note.content}
                                  </p>
                                  <div className="text-xs text-muted-foreground mt-2">
                                    Created: {note.createdAt} | Updated: {note.updatedAt}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteNoteFromGoal(goal.id, note.id)}
                                  className="text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm py-4 text-center">
                        No notes added yet. Add notes to capture thoughts, ideas, or progress related to this goal.
                      </p>
                    )}
                  </div>
                                    
                  {/* Motivation Tracker Section */}
                  <div className="pt-4 border-t border-border mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-foreground flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Motivation Tracker
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          Level: {goal.motivationTracker?.level || 5}/10
                        </span>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              Update Level
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-sm">
                            <DialogHeader>
                              <DialogTitle>Update Motivation Level</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>Motivation Level (1-10)</Label>
                                <div className="flex items-center gap-2">
                                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                                    <Button
                                      key={level}
                                      variant={goal.motivationTracker?.level === level ? "default" : "outline"}
                                      size="sm"
                                      className="w-8 h-8 p-0"
                                      onClick={() => updateMotivationLevel(goal.id, level, `Updated to ${level}/10`)}
                                    >
                                      {level}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="motivation-note">Note (Optional)</Label>
                                <Textarea
                                  id="motivation-note"
                                  placeholder="Add a note about your motivation level..."
                                  rows={2}
                                  onChange={(e) => {
                                    const note = e.target.value;
                                    if (note.trim()) {
                                      updateMotivationLevel(goal.id, goal.motivationTracker?.level || 5, note);
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Current Motivation</span>
                        <span className="font-medium">{goal.motivationTracker?.level || 5}/10</span>
                      </div>
                      <Progress 
                        value={goal.motivationTracker?.level ? goal.motivationTracker.level * 10 : 50} 
                        className="h-2" 
                        style={{
                          background: `linear-gradient(90deg, 
                            ${goal.motivationTracker?.level && goal.motivationTracker.level < 4 ? '#ef4444' : 
                            goal.motivationTracker?.level && goal.motivationTracker.level < 7 ? '#f59e0b' : '#10b981'} 0%, 
                            ${goal.motivationTracker?.level && goal.motivationTracker.level < 4 ? '#ef4444' : 
                            goal.motivationTracker?.level && goal.motivationTracker.level < 7 ? '#f59e0b' : '#10b981'} 
                            ${(goal.motivationTracker?.level || 5) * 10}%, 
                            #e5e7eb ${(goal.motivationTracker?.level || 5) * 10}%, #e5e7eb 100%)`
                        }}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                          <Heart className="h-4 w-4 text-red-500" />
                          Sources
                        </h4>
                        <div className="space-y-2">
                          {(goal.motivationTracker?.sources || []).map((source) => (
                            <div key={source.id} className="flex items-start justify-between p-2 bg-muted rounded">
                              <div className="flex-1">
                                <p className="text-sm font-medium">{source.content}</p>
                                <p className="text-xs text-muted-foreground">{source.description}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeMotivationSource(goal.id, source.id)}
                                className="text-destructive h-6 w-6 p-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="mt-2 w-full">
                              <Plus className="h-4 w-4 mr-2" />
                              Add Source
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Add Motivation Source</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="source-type">Type</Label>
                                <select
                                  id="source-type"
                                  value={newMotivationSource.type}
                                  onChange={(e) => setNewMotivationSource({...newMotivationSource, type: e.target.value as any})}
                                  className="border rounded-md px-3 py-2 text-sm w-full"
                                >
                                  <option value="personal">Personal</option>
                                  <option value="external">External</option>
                                  <option value="visual">Visual</option>
                                  <option value="quote">Quote</option>
                                  <option value="reward">Reward</option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="source-content">Content *</Label>
                                <Textarea
                                  id="source-content"
                                  placeholder="Enter your motivation source..."
                                  value={newMotivationSource.content}
                                  onChange={(e) => setNewMotivationSource({...newMotivationSource, content: e.target.value})}
                                  rows={2}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="source-description">Description (Optional)</Label>
                                <Input
                                  id="source-description"
                                  placeholder="Add a description..."
                                  value={newMotivationSource.description || ''}
                                  onChange={(e) => setNewMotivationSource({...newMotivationSource, description: e.target.value})}
                                />
                              </div>
                              <Button 
                                onClick={() => addMotivationSource(goal.id)}
                                className="w-full"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Motivation Source
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                          <Zap className="h-4 w-4 text-yellow-500" />
                          Triggers
                        </h4>
                        <div className="space-y-2">
                          {(goal.motivationTracker?.triggers || []).map((trigger, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                              <span className="text-sm">{trigger}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeMotivationTrigger(goal.id, trigger)}
                                className="text-destructive h-6 w-6 p-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Input
                            placeholder="Add trigger..."
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                const target = e.target as HTMLInputElement;
                                if (target.value.trim()) {
                                  addMotivationTrigger(goal.id, target.value);
                                  target.value = '';
                                }
                              }
                            }}
                          />
                          <Button 
                            onClick={(e) => {
                              const input = e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement;
                              if (input && input.value.trim()) {
                                addMotivationTrigger(goal.id, input.value);
                                input.value = '';
                              }
                            }}
                            size="sm"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                          <Shield className="h-4 w-4 text-blue-500" />
                          Barriers
                        </h4>
                        <div className="space-y-2">
                          {(goal.motivationTracker?.barriers || []).map((barrier, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                              <span className="text-sm">{barrier}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeMotivationBarrier(goal.id, barrier)}
                                className="text-destructive h-6 w-6 p-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Input
                            placeholder="Add barrier..."
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                const target = e.target as HTMLInputElement;
                                if (target.value.trim()) {
                                  addMotivationBarrier(goal.id, target.value);
                                  target.value = '';
                                }
                              }
                            }}
                          />
                          <Button 
                            onClick={(e) => {
                              const input = e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement;
                              if (input && input.value.trim()) {
                                addMotivationBarrier(goal.id, input.value);
                                input.value = '';
                              }
                            }}
                            size="sm"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Timeline Visualization Section */}
                  <div className="pt-4 border-t border-border mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-foreground flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Timeline Visualization
                      </h3>
                      <Button variant="outline" size="sm" onClick={() => {
                        // Timeline view toggle functionality
                      }}>
                        <TrendingUp className="h-4 w-4 mr-2" />
                        View Full Timeline
                      </Button>
                    </div>
                    
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="date" 
                            name="Date"
                            tickFormatter={(value) => {
                              const date = new Date(value);
                              return `${date.getMonth()+1}/${date.getDate()}`;
                            }}
                          />
                          <YAxis 
                            dataKey="progress" 
                            name="Progress"
                            domain={[0, 100]}
                            tickFormatter={(value) => `${value}%`}
                          />
                          <Tooltip 
                            formatter={(value, name, props) => [
                              `${value}%`, 'Progress'
                            ]}
                            labelFormatter={(label) => {
                              const date = new Date(label);
                              return date.toLocaleDateString();
                            }}
                          />
                          
                          {/* Progress line */}
                          <Line
                            type="monotone"
                            data={generateTimelineData(goal)}
                            dataKey="progress"
                            name="Progress"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                          
                          {/* Milestones as scatter points */}
                          <Scatter
                            name="Milestones"
                            data={generateMilestoneData(goal)}
                            fill="#10b981"
                            shape="triangle"
                          />
                          
                          {/* Current position marker */}
                          <Scatter
                            name="Current"
                            data={[{ date: new Date().toISOString(), progress: goal.progress, type: 'current' }]}
                            fill="#ef4444"
                            shape="star"
                          />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {/* Timeline Legend */}
                    <div className="flex flex-wrap gap-4 mt-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span>Progress trend</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-0 h-0 border-l-4 border-r-4 border-b-6 border-transparent border-b-green-500"></div>
                        <span>Milestones</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 transform rotate-45"></div>
                        <span>Current position</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Success Criteria Section */}
                  <div className="pt-4 border-t border-border mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-foreground flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Success Criteria
                      </h3>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Criteria
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Add Success Criteria</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="criteria-description">Description *</Label>
                              <Textarea
                                id="criteria-description"
                                placeholder="Define a measurable success criteria..."
                                value={newSuccessCriteria.description}
                                onChange={(e) => setNewSuccessCriteria({...newSuccessCriteria, description: e.target.value})}
                                rows={2}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="criteria-target-date">Target Date (Optional)</Label>
                                <Input
                                  id="criteria-target-date"
                                  type="date"
                                  value={newSuccessCriteria.targetDate || ''}
                                  onChange={(e) => setNewSuccessCriteria({...newSuccessCriteria, targetDate: e.target.value})}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="criteria-progress">Progress (0-100%)</Label>
                                <Input
                                  id="criteria-progress"
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={newSuccessCriteria.progress || ''}
                                  onChange={(e) => setNewSuccessCriteria({...newSuccessCriteria, progress: parseInt(e.target.value) || 0})}
                                  placeholder="0-100"
                                />
                              </div>
                            </div>
                            <Button 
                              onClick={() => addSuccessCriteriaToGoal(goal.id)}
                              className="w-full"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Success Criteria
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                                      
                    {goal.successCriteria && goal.successCriteria.length > 0 ? (
                      <div className="space-y-3">
                        {goal.successCriteria.map((criteria) => (
                          <div 
                            key={criteria.id} 
                            className="p-3 rounded-lg border border-border bg-card"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-full ${criteria.isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}>
                                  {criteria.isCompleted ? <CheckSquare className="h-4 w-4 text-white" /> : <Target className="h-4 w-4 text-white" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm ${criteria.isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                    {criteria.description}
                                  </p>
                                  {criteria.targetDate && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Target: {new Date(criteria.targetDate).toLocaleDateString()}
                                    </p>
                                  )}
                                  {criteria.progress !== undefined && criteria.progress !== null && (
                                    <div className="mt-2">
                                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                        <span>Progress</span>
                                        <span>{criteria.progress}%</span>
                                      </div>
                                      <Progress value={criteria.progress} className="h-2" />
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => toggleSuccessCriteriaCompletion(goal.id, criteria.id)}
                                  className="text-muted-foreground hover:text-foreground"
                                >
                                  {criteria.isCompleted ? (
                                    <CheckSquare className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <div className="w-4 h-4 border rounded-sm" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteSuccessCriteriaFromGoal(goal.id, criteria.id)}
                                  className="text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm py-4 text-center">
                        No success criteria defined yet. Add measurable criteria to define when this goal is achieved.
                      </p>
                    )}
                  </div>
                                    
                  {/* Linked Items */}
                  <div className="pt-4 border-t border-border mt-6">
                    <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                      <Link className="h-4 w-4" />
                      Linked Items
                    </h3>
                                      
                    {getLinkedItems(goal.id).length > 0 ? (
                      <div className="space-y-3">
                        {getLinkedItems(goal.id).map((item: LinkedItem) => (
                          <div 
                            key={item.id} 
                            className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card"
                          >
                            <div className={`p-2 rounded-full ${getTypeColor(item.type)}`}>
                              {getIconForType(item.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                {item.title}
                              </p>
                              <Badge variant="outline" className="mt-1 capitalize">
                                {item.type}
                              </Badge>
                            </div>
                            <Badge variant={item.completed ? "default" : "secondary"}>
                              {item.completed ? "Completed" : "Pending"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm py-4 text-center">
                        No items linked to this goal yet. Link tasks, habits, or challenges to track progress.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No goals yet. Create your first long-term goal to get started!</p>
          </CardContent>
        </Card>
      )}

      {/* Preset Goals Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Quick Start Goals
          </CardTitle>
          <CardDescription>Jumpstart your productivity with these preset goals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Daily Exercise Routine", description: "Establish a consistent daily workout habit" },
              { title: "Read More Books", description: "Complete 12 books this year" },
              { title: "Learn a New Language", description: "Achieve conversational fluency in Spanish" },
              { title: "Financial Savings Goal", description: "Save $5,000 for emergency fund" },
              { title: "Meditation Practice", description: "Develop mindfulness through daily meditation" },
              { title: "Professional Certification", description: "Complete AWS certification course" }
            ].map((preset, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground">{preset.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{preset.description}</p>
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Goal
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}