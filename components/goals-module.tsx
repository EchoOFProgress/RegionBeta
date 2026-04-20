"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Plus, Trash2, Target, Settings, GripVertical, Circle, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { getPriorityColor, shouldGlow } from "@/lib/priority-colors"
import { DropResult } from "react-beautiful-dnd"
import { storage } from "@/lib/storage"
import { Goal } from "@/lib/goals/types"
import { GoalVisionBoard } from "@/components/goals/GoalVisionBoard"
import { GoalMilestones } from "@/components/goals/GoalMilestones"
import { GoalDependencies } from "@/components/goals/GoalDependencies"
import { GoalResources } from "@/components/goals/GoalResources"
import { GoalNotes } from "@/components/goals/GoalNotes"
import { GoalMotivation } from "@/components/goals/GoalMotivation"
import { GoalTimeline } from "@/components/goals/GoalTimeline"
import { GoalSuccessCriteria } from "@/components/goals/GoalSuccessCriteria"
import { GoalLinkedItems } from "@/components/goals/GoalLinkedItems"

const defaultGoals: Goal[] = [
  {
    id: "1", title: "Improve Physical Health",
    description: "Get in better shape through consistent exercise and healthy eating",
    progress: 60, totalItems: 5, completedItems: 3, createdAt: "2023-05-15", completed: false,
    milestones: [
      { id: "m1", title: "Lose 5kg", description: "Lose initial 5kg weight", targetDate: "2023-08-15", completed: false, linkedModules: { tasks: [], habits: [], challenges: [] } },
      { id: "m2", title: "Run 5km", description: "Able to run 5km without stopping", targetDate: "2023-09-15", completed: false, linkedModules: { tasks: [], habits: [], challenges: [] } }
    ],
    dependencies: [], dependents: [],
    successCriteria: [
      { id: "sc1", description: "Lose 5kg of body weight", isCompleted: false, targetDate: "2023-08-15", progress: 60 },
      { id: "sc2", description: "Run 5km without stopping", isCompleted: false, targetDate: "2023-09-15", progress: 30 }
    ],
    motivationTracker: {
      level: 7, lastUpdated: new Date().toISOString().split("T")[0],
      history: [{ date: new Date().toISOString().split("T")[0], level: 7, note: "Goal created" }],
      sources: [{ id: "ms1", type: "quote", content: "The only bad workout is the one that didn't happen.", description: "Inspirational quote", addedAt: new Date().toISOString().split("T")[0] }],
      triggers: ["Health improvement", "Energy boost"], barriers: ["Lack of time", "Low energy"]
    }
  },
  {
    id: "2", title: "Advance Career Skills",
    description: "Learn new programming languages and complete certifications",
    progress: 30, totalItems: 4, completedItems: 1, createdAt: "2023-10-01", completed: false,
    milestones: [{ id: "m3", title: "Complete React Course", description: "Finish advanced React course", targetDate: "2023-12-01", completed: false, linkedModules: { tasks: [], habits: [], challenges: [] } }],
    dependencies: [], dependents: [],
    successCriteria: [{ id: "sc3", description: "Complete React course with passing grade", isCompleted: false, targetDate: "2023-12-01", progress: 25 }],
    motivationTracker: {
      level: 8, lastUpdated: new Date().toISOString().split("T")[0],
      history: [{ date: new Date().toISOString().split("T")[0], level: 8, note: "Goal created" }],
      sources: [{ id: "ms2", type: "reward", content: "Job promotion", description: "Career advancement opportunity", addedAt: new Date().toISOString().split("T")[0] }],
      triggers: ["Career growth", "Skill development"], barriers: ["Time constraints", "Complex concepts"]
    }
  }
]

export function GoalsModule({ onGoalsChange, tasks = [], habits = [], challenges = [], addedModules = [] }: {
  onGoalsChange?: (goals: Goal[]) => void
  tasks?: any[]; habits?: any[]; challenges?: any[]; addedModules?: string[]
}) {
  const { user } = useAuth()
  const { toast } = useToast()

  const [goals, setGoals] = useState<Goal[]>(() => {
    if (typeof window === "undefined") return defaultGoals
    const saved = storage.load("goals", defaultGoals) as Goal[]
    return Array.isArray(saved) && saved.length > 0 ? saved : defaultGoals
  })
  const [isMounted, setIsMounted] = useState(false)
  const [sortBy, setSortBy] = useState<'progress' | 'title' | 'created' | 'manual'>('progress')
  const [searchTerm, setSearchTerm] = useState('')
  const [newGoalTitle, setNewGoalTitle] = useState("")
  const [newGoalDescription, setNewGoalDescription] = useState("")
  const [newGoalTargetDate, setNewGoalTargetDate] = useState("")
  const [newGoalMotivation, setNewGoalMotivation] = useState("")
  const [newGoalCurrentState, setNewGoalCurrentState] = useState("")
  const [newGoalDesiredState, setNewGoalDesiredState] = useState("")
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editTargetDate, setEditTargetDate] = useState("")
  const [editMotivation, setEditMotivation] = useState("")
  const [editCurrentState, setEditCurrentState] = useState("")
  const [editDesiredState, setEditDesiredState] = useState("")

  useEffect(() => { setIsMounted(true) }, [])

  useEffect(() => {
    if (isMounted) {
      storage.save("goals", goals)
      onGoalsChange?.(goals)
    }
  }, [goals, isMounted])

  const setGoalsWithCallback = (newGoals: Goal[]) => {
    setGoals(newGoals)
    onGoalsChange?.(newGoals)
  }

  const updateGoal = (updatedGoal: Goal) => {
    setGoalsWithCallback(goals.map(g => g.id === updatedGoal.id ? updatedGoal : g))
  }

  const updateAllGoals = (updater: (goals: Goal[]) => Goal[]) => {
    setGoalsWithCallback(updater(goals))
  }

  const filteredGoals = goals
    .filter(g => searchTerm === '' || g.title.toLowerCase().includes(searchTerm.toLowerCase()) || g.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'progress') return b.progress - a.progress
      if (sortBy === 'title') return a.title.localeCompare(b.title)
      if (sortBy === 'created') return a.createdAt.localeCompare(b.createdAt)
      return 0
    })

  const addGoal = () => {
    if (!newGoalTitle.trim()) {
      toast({ title: "Error", description: "Please enter a goal title", variant: "destructive" })
      return
    }
    const goal: Goal = {
      id: Date.now().toString(), title: newGoalTitle, description: newGoalDescription,
      targetDate: newGoalTargetDate, motivation: newGoalMotivation,
      currentState: newGoalCurrentState, desiredState: newGoalDesiredState,
      milestones: [], dependencies: [], dependents: [],
      resourcesList: [], notes: [], successCriteria: [],
      motivationTracker: {
        level: 7, lastUpdated: new Date().toISOString().split("T")[0],
        history: [{ date: new Date().toISOString().split("T")[0], level: 7, note: "Goal created" }],
        sources: [], triggers: [], barriers: []
      },
      progress: 0, totalItems: 0, completedItems: 0, createdAt: new Date().toISOString().split("T")[0]
    }
    setGoalsWithCallback([...goals, goal])
    setNewGoalTitle(""); setNewGoalDescription(""); setNewGoalTargetDate("")
    setNewGoalMotivation(""); setNewGoalCurrentState(""); setNewGoalDesiredState("")
    toast({ title: "Goal Added!", description: `New goal "${newGoalTitle}" created` })
  }

  const deleteGoal = (id: string) => {
    setGoalsWithCallback(goals.filter(g => g.id !== id))
    toast({ title: "Goal Deleted", description: "Goal removed from your list" })
  }

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal); setEditTitle(goal.title); setEditDescription(goal.description)
    setEditTargetDate(goal.targetDate || ""); setEditMotivation(goal.motivation || "")
    setEditCurrentState(goal.currentState || ""); setEditDesiredState(goal.desiredState || "")
  }

  const saveGoalEdits = () => {
    if (!editingGoal) return
    setGoalsWithCallback(goals.map(g => g.id === editingGoal.id
      ? { ...g, title: editTitle, description: editDescription, targetDate: editTargetDate, motivation: editMotivation, currentState: editCurrentState, desiredState: editDesiredState }
      : g
    ))
    setEditingGoal(null)
    toast({ title: "Goal Updated!", description: "Your goal has been successfully updated" })
  }

  const toggleGoalCompletion = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId)
    if (!goal) return
    setGoalsWithCallback(goals.map(g => g.id === goalId ? { ...g, completed: !g.completed } : g))
    toast({ title: `Goal ${!goal.completed ? 'Completed' : 'Marked Incomplete'}!`, description: "Goal status updated successfully" })
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index) return
    const ids = filteredGoals.map(g => g.id)
    const draggedId = ids[result.source.index]
    const targetId = ids[result.destination.index]
    const draggedIndex = goals.findIndex(g => g.id === draggedId)
    const targetIndex = goals.findIndex(g => g.id === targetId)
    if (draggedIndex === -1 || targetIndex === -1) return
    const newGoals = Array.from(goals)
    const [item] = newGoals.splice(draggedIndex, 1)
    newGoals.splice(targetIndex, 0, item)
    setGoalsWithCallback(newGoals)
    setSortBy('manual')
  }

  const getPriorityColorStyle = (): React.CSSProperties => {
    const color = getPriorityColor(50, 'goals')
    const glow = shouldGlow(50, 'goals')
    if (!color) return {}
    return { border: `2px solid ${color}`, ...(glow ? { boxShadow: `0 0 8px ${color}` } : {}) }
  }

  if (!isMounted) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="py-24 text-center text-muted-foreground font-medium animate-pulse italic">
          Visualizing Achievement Matrix...
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Input placeholder="Search goals..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full sm:w-48" />
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="border rounded-md px-3 py-2 text-sm">
                <option value="progress">Sort by Progress</option>
                <option value="title">Sort by Title</option>
                <option value="created">Sort by Created</option>
                <option value="manual">Manual Order</option>
              </select>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />Add Goal</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Create New Goal</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="goal-title">Goal Title *</Label>
                    <Input id="goal-title" placeholder="e.g., Improve physical health through exercise" value={newGoalTitle} onChange={(e) => setNewGoalTitle(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goal-description">Description</Label>
                    <Textarea id="goal-description" placeholder="Add details about this goal..." value={newGoalDescription} onChange={(e) => setNewGoalDescription(e.target.value)} rows={3} />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="goal-target-date">Target Date</Label>
                      <Input id="goal-target-date" type="date" value={newGoalTargetDate} onChange={(e) => setNewGoalTargetDate(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goal-motivation">Why is this goal important to you?</Label>
                    <Textarea id="goal-motivation" placeholder="What drives you to achieve this goal?" value={newGoalMotivation} onChange={(e) => setNewGoalMotivation(e.target.value)} rows={2} />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="goal-current-state">Current State</Label>
                      <Textarea id="goal-current-state" placeholder="Where are you now regarding this goal?" value={newGoalCurrentState} onChange={(e) => setNewGoalCurrentState(e.target.value)} rows={2} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="goal-desired-state">Desired State</Label>
                      <Textarea id="goal-desired-state" placeholder="Where do you want to be?" value={newGoalDesiredState} onChange={(e) => setNewGoalDesiredState(e.target.value)} rows={2} />
                    </div>
                  </div>
                  <Button onClick={addGoal} className="w-full"><Plus className="h-4 w-4 mr-2" />Create Goal</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {filteredGoals.length > 0 ? (
        <div className="space-y-4">
          {filteredGoals.map((goal, index) => (
            <Card key={goal.id} style={getPriorityColorStyle()}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    <div className="mt-1 text-muted-foreground">
                      <GripVertical className="h-5 w-5" />
                    </div>
                              <button onClick={() => toggleGoalCompletion(goal.id)} className="flex-shrink-0 mt-1 text-muted-foreground hover:text-primary">
                                {goal.completed ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Circle className="h-5 w-5" />}
                              </button>
                              <div>
                                <CardTitle className="flex items-center gap-2">
                                  <Target className="h-5 w-5 text-primary" />{goal.title}
                                </CardTitle>
                                <CardDescription className="mt-2">{goal.description}</CardDescription>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => handleEditGoal(goal)}>
                                    <Settings className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                  <DialogHeader><DialogTitle>Edit Goal</DialogTitle></DialogHeader>
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <Label>Goal Title</Label>
                                      <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Description</Label>
                                      <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} />
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label>Target Date</Label>
                                        <Input type="date" value={editTargetDate} onChange={(e) => setEditTargetDate(e.target.value)} />
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Why is this goal important to you?</Label>
                                      <Textarea value={editMotivation} onChange={(e) => setEditMotivation(e.target.value)} rows={2} />
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label>Current State</Label>
                                        <Textarea value={editCurrentState} onChange={(e) => setEditCurrentState(e.target.value)} rows={2} />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Desired State</Label>
                                        <Textarea value={editDesiredState} onChange={(e) => setEditDesiredState(e.target.value)} rows={2} />
                                      </div>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                      <Button variant="outline" onClick={() => setEditingGoal(null)}>Cancel</Button>
                                      <Button onClick={saveGoalEdits}>Save Changes</Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button variant="ghost" size="icon" onClick={() => deleteGoal(goal.id)} className="text-muted-foreground hover:text-destructive">
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
                              <span className="text-muted-foreground">{goal.completedItems} of {goal.totalItems} items completed</span>
                              <span className="text-muted-foreground">Created: {goal.createdAt}</span>
                            </div>
                            <GoalVisionBoard goal={goal} onUpdateGoal={updateGoal} />
                            <GoalMilestones goal={goal} onUpdateGoal={updateGoal} isMounted={isMounted} />
                            <GoalDependencies goal={goal} allGoals={goals} onUpdateGoal={updateGoal} onUpdateAllGoals={updateAllGoals} />
                            <GoalResources goal={goal} onUpdateGoal={updateGoal} />
                            <GoalNotes goal={goal} onUpdateGoal={updateGoal} />
                            <GoalMotivation goal={goal} onUpdateGoal={updateGoal} />
                            <GoalTimeline goal={goal} />
                            <GoalSuccessCriteria goal={goal} onUpdateGoal={updateGoal} />
                            <GoalLinkedItems goal={goal} tasks={tasks} habits={habits} challenges={challenges} />
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
    </div>
  )
}
