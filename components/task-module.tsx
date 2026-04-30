"use client"

import { useState, useEffect } from "react"
import { logActivity } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ExtendedTaskForm } from "@/components/extended-task-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getPriorityColor, shouldGlow } from "@/lib/priority-colors"
import { useUI } from "@/lib/ui-context"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { storage } from "@/lib/storage"
import { useNotifications } from "@/lib/notification-context"
import { Task, TaskType, NumericCondition } from "@/lib/tasks/types"
import { DEFAULT_TASKS } from "@/lib/tasks/constants"
import { isTaskOverdue, calculateNewStreak, sortTasks } from "@/lib/tasks/utils"
import { ActiveTaskCard } from "@/components/tasks/ActiveTaskCard"
import { CompletedTaskItem } from "@/components/tasks/CompletedTaskItem"
import { useLanguage } from "@/lib/language-context"

export type { Task } from "@/lib/tasks/types"

export function TaskModule({
  onTasksChange,
  goals = [],
  addedModules = []
}: {
  onTasksChange?: (tasks: Task[]) => void
  goals?: { id: string; title: string }[]
  addedModules?: string[]
}) {
  const { checkForNotifications } = useNotifications()
  const { toast } = useToast()
  const { uiSettings } = useUI()
  const { t } = useLanguage()

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = storage.load("tasks", DEFAULT_TASKS)
    return Array.isArray(saved) ? saved : []
  })
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'created' | 'manual' | 'archived'>('priority')
  const [searchTerm, setSearchTerm] = useState('')
  const [isMounted, setIsMounted] = useState(false)
  const [showExtendedForm, setShowExtendedForm] = useState(false)

  useEffect(() => { setIsMounted(true) }, [])

  useEffect(() => {
    storage.save("tasks", tasks)
    onTasksChange?.(tasks)
  }, [tasks, onTasksChange])

  useEffect(() => {
    const handler = (e: CustomEvent) => setTasks(e.detail)
    window.addEventListener('tasksUpdated', handler as EventListener)
    return () => window.removeEventListener('tasksUpdated', handler as EventListener)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => { checkForNotifications?.(tasks, [], []) }, 60000)
    return () => clearInterval(timer)
  }, [])

  const getTaskStyle = (task: Task): React.CSSProperties => {
    const color = getPriorityColor(task.priority, 'tasks')
    const glow = shouldGlow(task.priority, 'tasks')
    const base: React.CSSProperties = color
      ? { border: `2px solid ${color}`, ...(glow ? { boxShadow: `0 0 8px ${color}` } : {}) }
      : {}
    if (uiSettings.highlightOverdueTasks && isTaskOverdue(task)) {
      const c = uiSettings.overdueTaskColor || '#ef4444'
      const valid = c.startsWith('#') && c.length === 7
      const r = valid ? parseInt(c.slice(1, 3), 16) : 239
      const g = valid ? parseInt(c.slice(3, 5), 16) : 68
      const b = valid ? parseInt(c.slice(5, 7), 16) : 68
      return { ...base, border: `2px solid ${valid ? c : '#ef4444'}`, backgroundColor: `rgba(${r},${g},${b},0.05)` }
    }
    return base
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setTasks(prev => {
      const reorderedTasks = Array.from(prev)
      const sourceIndex = reorderedTasks.findIndex(t => t.id === active.id)
      const destinationIndex = reorderedTasks.findIndex(t => t.id === over.id)
      if (sourceIndex === -1 || destinationIndex === -1) return prev
      const [removed] = reorderedTasks.splice(sourceIndex, 1)
      reorderedTasks.splice(destinationIndex, 0, removed)
      return reorderedTasks
    })

    setSortBy('manual')
    toast({ title: t("task.order_updated"), description: t("notif.task_order_saved") })
  }

  const toggleTask = (id: string) => {
    const today = new Date().toISOString().split('T')[0]
    setTasks(prev => prev.map(task => {
      if (task.id !== id) return task
      if (task.dependencies?.length) {
        const hasBlocked = task.dependencies.some(depId => {
          const dep = prev.find(t => t.id === depId)
          return dep && !dep.completed
        })
        if (hasBlocked && !task.completed) {
          toast({ title: t("task.cannot_complete"), description: t("task.dependencies_blocked"), variant: "destructive" })
          return task
        }
      }
      const wasCompleted = task.completed
      const updated = { ...task, completed: !task.completed }
      if (!wasCompleted && updated.completed) {
        const newStreak = calculateNewStreak(task, today)
        const newRecord = { date: today, note: `Completed task: ${task.title}` }
        updated.streak = newStreak
        updated.bestStreak = Math.max(task.bestStreak || 0, newStreak)
        updated.lastCompleted = today
        updated.completionRecords = [...(task.completionRecords || []), newRecord]
        updated.completedAt = new Date().toISOString()
        logActivity({ event_type: "task_completed", item_id: String(task.id), item_title: task.title, metadata: { streak: newStreak, priority: task.priority } })
      } else if (wasCompleted && !updated.completed) {
        updated.completedAt = undefined
      }
      return updated
    }))
  }

  const updateNumericTask = (id: string, value: number) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return
    if (task.dependencies?.length) {
      const hasBlocked = task.dependencies.some(depId => {
        const dep = tasks.find(t => t.id === depId)
        return dep && !dep.completed
      })
      if (hasBlocked) {
        toast({ title: t("task.cannot_update"), description: t("task.dependencies_blocked"), variant: "destructive" })
        return
      }
    }
    let completed = false
    if (task.numericCondition === "at-least") completed = value >= (task.numericTarget || 0)
    else if (task.numericCondition === "less-than") completed = value < (task.numericTarget || 0)
    else if (task.numericCondition === "exactly") completed = value === (task.numericTarget || 0)
    const today = new Date().toISOString().split('T')[0]
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t
      const update: Partial<Task> = { numericValue: value, completed }
      if (completed && !task.completed) {
        const newStreak = calculateNewStreak(t, today)
        update.streak = newStreak
        update.bestStreak = Math.max(t.bestStreak || 0, newStreak)
        update.lastCompleted = today
        update.completionRecords = [...(t.completionRecords || []), { date: today, value, note: `Completed: ${t.title}` }]
        update.completedAt = new Date().toISOString()
      }
      return { ...t, ...update }
    }))
    if (completed && !task.completed) toast({ title: t("notif.task_completed"), description: t("notif.task_completed_desc") || "Keep up the good work!" })
    logActivity({ event_type: "task_progress", item_id: String(task.id), item_title: task.title, metadata: { value, completed } })
  }

  const deleteTask = (id: string) => {
    const task = tasks.find(t => t.id === id)
    if (task) logActivity({ event_type: "task_deleted", item_id: String(task.id), item_title: task.title })
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const archiveTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, archived: true } : t))
    toast({ title: t("notif.challenge_archived"), description: t("challenge.archived_desc") })
  }

  const unarchiveTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, archived: false } : t))
    toast({ title: t("notif.challenge_restored"), description: t("challenge.restored_desc") })
  }

  const saveTask = (updated: Task) => {
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t))
    toast({ title: t("notif.task_updated"), description: t("notif.task_updated") })
  }

  const addExtendedTask = (taskData: {
    title: string; description: string; priority: number; dueDate?: Date;
    reminderEnabled: boolean; reminderTime?: Date;
    timeBlockStart?: string; timeBlockEnd?: string; timeBlockDate?: string;
    tags?: string[];
    linkedGoalId?: string; dependencies?: string[];
    type: "boolean" | "numeric";
    numericCondition?: "at-least" | "less-than" | "exactly";
    numericTarget?: number;
  }) => {
    const task: Task = {
      id: Date.now().toString(), title: taskData.title, priority: taskData.priority,
      completed: false, type: taskData.type, description: taskData.description,
      numericCondition: taskData.numericCondition, numericTarget: taskData.numericTarget,
      numericValue: taskData.type === "numeric" ? 0 : undefined,
      dueDate: taskData.dueDate?.toISOString(),
      linkedGoalId: taskData.linkedGoalId,
      dependencies: taskData.dependencies || [], timeBlockStart: taskData.timeBlockStart,
      timeBlockEnd: taskData.timeBlockEnd, timeBlockDate: taskData.timeBlockDate,
      tags: taskData.tags || [], createdAt: new Date().toISOString(),
      streak: 0, bestStreak: 0, completionRecords: []
    }
    setTasks(prev => [...prev, task])
    setShowExtendedForm(false)
    logActivity({ event_type: "task_created", item_id: String(task.id), item_title: task.title, metadata: { priority: task.priority, type: task.type } })
    toast({ title: t("notif.task_added"), description: `${t("notif.task_added")} "${taskData.title}"` })
  }

  const searchFilter = (t: Task) =>
    searchTerm === '' || t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()))

  const activeTasks = sortTasks(tasks.filter(t => !t.completed && !t.archived).filter(searchFilter), sortBy as any)
  const completedTasks = sortTasks(tasks.filter(t => t.completed && !t.archived).filter(searchFilter), sortBy as any)
  const archivedTasks = tasks.filter(t => t.archived).filter(searchFilter)

  if (!isMounted) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="py-24 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="text-muted-foreground font-medium">{t("task.initializing")}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="space-y-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full">
                <div className="w-full sm:w-64">
                  <Input
                    placeholder={t("Search tasks...")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="rounded-lg border-border focus:border-primary"
                  />
                </div>
                <div className="w-full sm:w-40">
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                    <SelectTrigger className="rounded-lg border-border focus:border-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="priority">{t("Priority")}</SelectItem>
                      <SelectItem value="dueDate">{t("Due Date")}</SelectItem>
                      <SelectItem value="created">{t("Creation Date")}</SelectItem>
                      <SelectItem value="manual">{t("Manual Order")}</SelectItem>
                      <SelectItem value="archived">{t("common.archive")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex-shrink-0">
                <Button
                  onClick={() => setShowExtendedForm(true)}
                  className="gap-2 rounded-lg shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span className="font-semibold">{t("Add Task")}</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Dialog open={showExtendedForm} onOpenChange={setShowExtendedForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("New Task")}</DialogTitle>
            </DialogHeader>
            <div className="pt-4">
              <ExtendedTaskForm
                onSubmit={addExtendedTask}
                onCancel={() => setShowExtendedForm(false)}
                tasks={tasks}
                goals={goals}
              />
            </div>
          </DialogContent>
        </Dialog>

        {sortBy !== 'archived' && activeTasks.length > 0 ? (
          <Card className="border-0 shadow-sm bg-transparent">
            <CardHeader className="px-0">
              <CardTitle>{t("task.active_title")}</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <SortableContext items={activeTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div>
                  {activeTasks.map((task, index) => (
                    <ActiveTaskCard
                      key={task.id}
                      task={task}
                      index={index}
                      isMounted={isMounted}
                      taskStyle={getTaskStyle(task)}
                      onToggle={toggleTask}
                      onUpdateNumeric={updateNumericTask}
                      onDelete={deleteTask}
                      onArchive={archiveTask}
                      onSave={saveTask}
                      tasks={tasks}
                    />
                  ))}
                </div>
              </SortableContext>
            </CardContent>
          </Card>
        ) : sortBy !== 'archived' && (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t("task.none_active")}</p>
            </CardContent>
          </Card>
        )}

        {completedTasks.length > 0 && sortBy !== 'archived' && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>
                {t("task.completed_title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {completedTasks.map(task => (
                  <CompletedTaskItem
                    key={task.id}
                    task={task}
                    isMounted={isMounted}
                    taskStyle={getTaskStyle(task)}
                    onToggle={toggleTask}
                    onUpdateNumeric={updateNumericTask}
                    onDelete={deleteTask}
                    onArchive={archiveTask}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {sortBy === 'archived' && archivedTasks.length > 0 && (
          <Card className="border-0 shadow-sm border-dashed border-2">
            <CardHeader>
              <CardTitle>{t("task.archived_title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {archivedTasks.map(task => (
                  <CompletedTaskItem
                    key={task.id}
                    task={task}
                    isMounted={isMounted}
                    taskStyle={getTaskStyle(task)}
                    onToggle={toggleTask}
                    onUpdateNumeric={updateNumericTask}
                    onDelete={deleteTask}
                    onUnarchive={unarchiveTask}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DndContext>
  )
}
