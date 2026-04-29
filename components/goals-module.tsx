"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Target, Settings, Circle, CheckCircle2, X, Folder, ArchiveRestore } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { storage } from "@/lib/storage"
import { Goal } from "@/lib/goals/types"
import { Task } from "@/lib/tasks/types"
import { Habit } from "@/lib/habits/types"
import { Challenge } from "@/lib/challenges/types"
import { useLanguage } from "@/lib/language-context"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { GoalCreateForm } from "@/components/goals/GoalCreateForm"

// ─── Progress helpers ────────────────────────────────────────────────────────

function getTaskProgress(task: Task): number {
  if (task.type === "numeric" && task.numericTarget && task.numericValue != null) {
    const pct = Math.round((task.numericValue / task.numericTarget) * 100)
    if (task.numericCondition === "exactly") return task.numericValue === task.numericTarget ? 100 : Math.min(99, pct)
    return Math.min(100, pct)
  }
  return task.completed ? 100 : 0
}

function getHabitProgress(habit: Habit): number {
  if (habit.successRate != null) return Math.round(habit.successRate)
  return habit.completedToday ? 100 : 0
}

function getChallengeProgress(challenge: Challenge): number {
  if (challenge.status === "completed") return 100
  if (challenge.status === "failed") return 0
  if (challenge.duration > 0) return Math.min(100, Math.round((challenge.currentDay / challenge.duration) * 100))
  return 0
}

function calcGoalProgress(goal: Goal, tasks: Task[], habits: Habit[], challenges: Challenge[]): number {
  const progresses: number[] = []
  for (const id of goal.linkedTasks) {
    const t = tasks.find(t => t.id === id)
    if (t) progresses.push(getTaskProgress(t))
  }
  for (const id of goal.linkedHabits) {
    const h = habits.find(h => h.id === id)
    if (h) progresses.push(getHabitProgress(h))
  }
  for (const id of goal.linkedChallenges) {
    const c = challenges.find(c => c.id === id)
    if (c) progresses.push(getChallengeProgress(c))
  }
  if (progresses.length === 0) return 0
  return Math.round(progresses.reduce((a, b) => a + b, 0) / progresses.length)
}

// ─── Picker helper ───────────────────────────────────────────────────────────

type PickerItem = { id: string; label: string; description?: string; type: "task"|"habit"|"challenge"; typeLabel: string }

function getPickerItems(
  goalId: string,
  goals: Goal[],
  tasks: Task[],
  habits: Habit[],
  challenges: Challenge[],
  t: (key: string) => string
): PickerItem[] {
  const goal = goals.find(g => g.id === goalId)
  if (!goal) return []
  
  const allTasks: PickerItem[] = tasks
    .filter(tk => !goal.linkedTasks.includes(tk.id))
    .map(tk => ({ id: tk.id, label: tk.title, description: tk.description, type: "task", typeLabel: t("Úkol") }))
    
  const allHabits: PickerItem[] = habits
    .filter(h => !goal.linkedHabits.includes(h.id))
    .map(h => ({ id: h.id, label: h.name, description: h.description, type: "habit", typeLabel: t("Návyk") }))
    
  const allChallenges: PickerItem[] = challenges
    .filter(c => !goal.linkedChallenges.includes(c.id))
    .map(c => ({ id: c.id, label: c.title, description: c.description, type: "challenge", typeLabel: t("Výzva") }))
    
  return [...allTasks, ...allHabits, ...allChallenges]
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function LinkedItemRow({ label, progress, onUnlink }: { label: string; progress: number; onUnlink: () => void }) {
  const { t } = useLanguage()
  return (
    <div className="flex items-center gap-2 p-2 rounded-md bg-muted/40">
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{label}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Progress value={progress} className="h-1 flex-1" />
          <span className="text-xs text-muted-foreground w-8 text-right">{progress}%</span>
        </div>
      </div>
      <DeleteConfirmationDialog 
        onConfirm={onUnlink}
        title={t("Odebrat z cíle?")}
        description={t("Tento modul nebude smazán, pouze dojde k jeho odpojení od tohoto cíle.")}
      >
        <button className="flex-shrink-0 text-muted-foreground hover:text-destructive">
          <X className="h-3.5 w-3.5" />
        </button>
      </DeleteConfirmationDialog>
    </div>
  )
}

// ─── Main module ─────────────────────────────────────────────────────────────

const defaultGoals: Goal[] = []

export function GoalsModule({
  onGoalsChange,
  tasks = [],
  habits = [],
  challenges = [],
  addedModules = [],
}: {
  onGoalsChange?: (goals: Goal[]) => void
  tasks?: Task[]
  habits?: Habit[]
  challenges?: Challenge[]
  addedModules?: string[]
}) {
  const { toast } = useToast()
  const { t } = useLanguage()

  const [goals, setGoals] = useState<Goal[]>(() => {
    if (typeof window === "undefined") return defaultGoals
    const saved = storage.load("goals", defaultGoals) as Goal[]
    return Array.isArray(saved) ? saved.map(g => ({
      ...g,
      linkedTasks: g.linkedTasks ?? [],
      linkedHabits: g.linkedHabits ?? [],
      linkedChallenges: g.linkedChallenges ?? [],
    })) : defaultGoals
  })
  const [isMounted, setIsMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'progress' | 'archived'>('progress')

  const [createOpen, setCreateOpen] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newDesc, setNewDesc] = useState("")
  const [newDate, setNewDate] = useState("")
  const [editGoalId, setEditGoalId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDesc, setEditDesc] = useState("")
  const [editDate, setEditDate] = useState("")

  const [picker, setPicker] = useState<{ open: boolean; goalId: string }>({
    open: false,
    goalId: "",
  })

  useEffect(() => { setIsMounted(true) }, [])

  useEffect(() => {
    if (isMounted) {
      storage.save("goals", goals)
      onGoalsChange?.(goals)
    }
  }, [goals, isMounted])

  useEffect(() => {
    const handler = (e: CustomEvent) => setGoals(e.detail)
    window.addEventListener('goalsUpdated', handler as EventListener)
    return () => window.removeEventListener('goalsUpdated', handler as EventListener)
  }, [])

  const setGoalsSync = (next: Goal[]) => {
    setGoals(next)
    onGoalsChange?.(next)
  }

  const addGoal = () => {
    if (!newTitle.trim()) {
      toast({ title: t("Error"), description: t("Please enter a goal title"), variant: "destructive" })
      return
    }
    if (goals.some(g => g.title.toLowerCase() === newTitle.trim().toLowerCase())) {
      toast({ title: t("Duplicate Title"), description: t("A goal with this title already exists."), variant: "destructive" })
      return
    }
    const goal: Goal = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      description: newDesc,
      targetDate: newDate || undefined,
      linkedTasks: [],
      linkedHabits: [],
      linkedChallenges: [],
      createdAt: new Date().toISOString().split("T")[0],
    }
    setGoalsSync([...goals, goal])
    setNewTitle(""); setNewDesc(""); setNewDate("")
    setCreateOpen(false)
    toast({ title: t("Goal Added!"), description: `"${goal.title}"` })
  }

  const deleteGoal = (id: string) => {
    setGoalsSync(goals.filter(g => g.id !== id))
    toast({ title: t("Goal Deleted") })
  }

  const archiveGoal = (id: string) => {
    setGoalsSync(goals.map(g => g.id === id ? { ...g, archived: true } : g))
    toast({ title: t("Goal Archived!"), description: t("Goal moved to archives.") })
  }

  const unarchiveGoal = (id: string) => {
    setGoalsSync(goals.map(g => g.id === id ? { ...g, archived: false } : g))
    toast({ title: t("Goal Restored!"), description: t("Goal restored from archives.") })
  }

  const openEdit = (goal: Goal) => {
    setEditGoalId(goal.id)
    setEditTitle(goal.title)
    setEditDesc(goal.description)
    setEditDate(goal.targetDate ?? "")
  }

  const saveEdit = () => {
    if (!editGoalId) return
    if (goals.some(g => g.id !== editGoalId && g.title.toLowerCase() === editTitle.trim().toLowerCase())) {
      toast({ title: t("Duplicate Title"), variant: "destructive" })
      return
    }
    setGoalsSync(goals.map(g => g.id === editGoalId
      ? { ...g, title: editTitle.trim(), description: editDesc, targetDate: editDate || undefined }
      : g
    ))
    setEditGoalId(null)
    toast({ title: t("Goal Updated!") })
  }

  const toggleComplete = (id: string) => {
    setGoalsSync(goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g))
  }

  const unlinkItem = (goalId: string, type: "task"|"habit"|"challenge", itemId: string) => {
    setGoalsSync(goals.map(g => {
      if (g.id !== goalId) return g
      if (type === "task") return { ...g, linkedTasks: g.linkedTasks.filter(id => id !== itemId) }
      if (type === "habit") return { ...g, linkedHabits: g.linkedHabits.filter(id => id !== itemId) }
      return { ...g, linkedChallenges: g.linkedChallenges.filter(id => id !== itemId) }
    }))
  }

  const linkItem = (itemId: string, type: "task"|"habit"|"challenge") => {
    const { goalId } = picker
    setGoalsSync(goals.map(g => {
      if (g.id !== goalId) return g
      if (type === "task") return { ...g, linkedTasks: [...g.linkedTasks, itemId] }
      if (type === "habit") return { ...g, linkedHabits: [...g.linkedHabits, itemId] }
      return { ...g, linkedChallenges: [...g.linkedChallenges, itemId] }
    }))
    setPicker(p => ({ ...p, open: false }))
  }

  const filtered = goals
    .filter(g => !g.archived && (
      !searchTerm ||
      g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ))
    .sort((a, b) => {
      if (sortBy === 'name') return a.title.localeCompare(b.title)
      if (sortBy === 'created') return a.id.localeCompare(b.id)
      if (sortBy === 'progress') {
        const pa = calcGoalProgress(a, tasks, habits, challenges)
        const pb = calcGoalProgress(b, tasks, habits, challenges)
        return pb - pa
      }
      return 0
    })

  const archivedGoals = goals.filter(g => g.archived && (
    !searchTerm ||
    g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ))

  const pickerItems = getPickerItems(picker.goalId, goals, tasks, habits, challenges, t)

  if (!isMounted) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="py-24 text-center text-muted-foreground animate-pulse italic">
          {t("Visualizing Achievement Matrix...")}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
              <div className="w-full sm:w-56">
                <Input
                  placeholder={t("Search goals...")}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="w-full sm:w-40">
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="progress">{t("Progress")}</SelectItem>
                    <SelectItem value="name">{t("Name")}</SelectItem>
                    <SelectItem value="created">{t("Created")}</SelectItem>
                    <SelectItem value="archived">{t("Zálohované")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex-shrink-0">
              <Button
                onClick={() => setCreateOpen(true)}
                className="gap-2 rounded-lg shadow-sm w-full md:w-auto"
              >
                <Plus className="h-4 w-4" />
                <span className="font-semibold">{t("Add Goal")}</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{t("New Goal")}</DialogTitle></DialogHeader>
          <div className="pt-2">
            <GoalCreateForm
              onSubmit={(goal) => {
                setGoalsSync([...goals, goal])
                setCreateOpen(false)
                toast({ title: t("Goal Added!"), description: `"${goal.title}"` })
              }}
              onCancel={() => setCreateOpen(false)}
              goals={goals}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editGoalId} onOpenChange={open => !open && setEditGoalId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{t("Edit Goal")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("Goal Title")}</Label>
              <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("Description")}</Label>
              <Textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>{t("Target Date")}</Label>
              <Input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditGoalId(null)}>{t("Cancel")}</Button>
              <Button onClick={saveEdit}>{t("Save Changes")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Picker dialog */}
      <Dialog open={picker.open} onOpenChange={open => setPicker(p => ({ ...p, open }))}>
        <DialogContent className="max-w-md max-h-[70vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("Add Module")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 pt-1">
            {pickerItems.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                {t("No available items to add")}
              </p>
            ) : pickerItems.map(item => (
              <button
                key={item.id}
                onClick={() => linkItem(item.id, item.type)}
                className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <p className="font-medium text-sm">{item.label}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider bg-accent/50 px-1 py-0.5 rounded">{item.typeLabel}</span>
                  {item.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Goal list */}
      {filtered.length === 0 && sortBy !== 'archived' ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t("No goals yet. Create your first long-term goal to get started!")}</p>
          </CardContent>
        </Card>
      ) : sortBy !== 'archived' && (
        <div className="space-y-4">
          {filtered.map(goal => {
            const progress = calcGoalProgress(goal, tasks, habits, challenges)
            const linkedTaskItems = goal.linkedTasks.map(id => tasks.find(t => t.id === id)).filter(Boolean) as Task[]
            const linkedHabitItems = goal.linkedHabits.map(id => habits.find(h => h.id === id)).filter(Boolean) as Habit[]
            const linkedChallengeItems = goal.linkedChallenges.map(id => challenges.find(c => c.id === id)).filter(Boolean) as Challenge[]

            return (
              <Card key={goal.id} className={goal.completed ? "opacity-60" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <div className="min-w-0">
                        <CardTitle className="text-base">
                          <span 
                            className={`cursor-pointer hover:text-primary transition-colors ${goal.completed ? "line-through text-muted-foreground" : ""}`}
                            onClick={() => toggleComplete(goal.id)}
                          >
                            {goal.title}
                          </span>
                        </CardTitle>
                        {goal.description && (
                          <CardDescription className="mt-1">{goal.description}</CardDescription>
                        )}
                        {goal.targetDate && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {t("Target:")} {new Date(goal.targetDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                    <div className="flex gap-1 flex-shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(goal)} title="Edit Goal" className="simple-icon-btn">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => archiveGoal(goal.id)} title="Archive Goal" className="simple-icon-btn">
                        <Folder className="h-4 w-4" />
                      </Button>
                      <DeleteConfirmationDialog onConfirm={() => deleteGoal(goal.id)}>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive simple-icon-btn">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DeleteConfirmationDialog>
                    </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{t("Progress")}</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-muted-foreground">{t("Linked Modules")}</span>
                      <Button variant="outline" size="sm" className="h-7 text-xs px-2" onClick={() => setPicker({ open: true, goalId: goal.id })}>
                        <Plus className="h-3 w-3 mr-1" />{t("Add Module")}
                      </Button>
                    </div>
                    
                    <div className="space-y-1.5">
                      {linkedTaskItems.length === 0 && linkedHabitItems.length === 0 && linkedChallengeItems.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">{t("No modules linked yet.")}</p>
                      ) : (
                        <>
                          {linkedTaskItems.map(task => (
                            <LinkedItemRow
                              key={task.id}
                              label={`✓ ${task.title}`}
                              progress={getTaskProgress(task)}
                              onUnlink={() => unlinkItem(goal.id, "task", task.id)}
                            />
                          ))}
                          {linkedHabitItems.map(habit => (
                            <LinkedItemRow
                              key={habit.id}
                              label={`↻ ${habit.name}`}
                              progress={getHabitProgress(habit)}
                              onUnlink={() => unlinkItem(goal.id, "habit", habit.id)}
                            />
                          ))}
                          {linkedChallengeItems.map(challenge => (
                            <LinkedItemRow
                              key={challenge.id}
                              label={`★ ${challenge.title}`}
                              progress={getChallengeProgress(challenge)}
                              onUnlink={() => unlinkItem(goal.id, "challenge", challenge.id)}
                            />
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {sortBy === 'archived' && archivedGoals.length > 0 && (
        <Card className="border-0 shadow-sm border-dashed border-2 bg-muted/5">
          <CardHeader>
            <CardTitle>{t("Archivované cíle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {archivedGoals.map(goal => {
              const progress = calcGoalProgress(goal, tasks, habits, challenges)
              return (
                <div key={goal.id} className="p-4 rounded-xl border border-border bg-card/50 opacity-80">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold">{goal.title}</h4>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => unarchiveGoal(goal.id)} className="h-7 w-7" title="Restore Goal">
                        <ArchiveRestore className="h-3.5 w-3.5" />
                      </Button>
                      <DeleteConfirmationDialog onConfirm={() => deleteGoal(goal.id)}>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </DeleteConfirmationDialog>
                    </div>
                  </div>
                  <Progress value={progress} className="h-1.5" />
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
