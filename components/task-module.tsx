"use client"

import { useState, useEffect } from "react"
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
import { DragDropContext, Droppable } from "react-beautiful-dnd"
import { storage } from "@/lib/storage"
import { useNotifications } from "@/lib/notification-context"
import { Task, TaskType, NumericCondition } from "@/lib/tasks/types"
import { DEFAULT_TASKS } from "@/lib/tasks/constants"
import { isTaskOverdue, calculateNewStreak, sortTasks } from "@/lib/tasks/utils"
import { ActiveTaskCard } from "@/components/tasks/ActiveTaskCard"
import { CompletedTaskItem } from "@/components/tasks/CompletedTaskItem"

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

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = storage.load("tasks", DEFAULT_TASKS)
    return Array.isArray(saved) ? saved : []
  })
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'created' | 'manual'>('priority')
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

  const handleDragEnd = (result: any) => {
    if (!result.destination) return
    const items = Array.from(activeTasks)
    const [reordered] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reordered)
    setTasks([...items, ...tasks.filter(t => t.completed)])
    setSortBy('manual')
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
          toast({ title: "Cannot Complete Task", description: "This task has uncompleted dependencies.", variant: "destructive" })
          return task
        }
      }
      const wasCompleted = task.completed
      const updated = { ...task, completed: !task.completed }
      if (!wasCompleted && updated.completed) {
        const newStreak = calculateNewStreak(task, today)
        const newRecord = { date: today, energyLevel: task.energyLevel, note: `Completed task: ${task.title}` }
        updated.streak = newStreak
        updated.bestStreak = Math.max(task.bestStreak || 0, newStreak)
        updated.lastCompleted = today
        updated.completionRecords = [...(task.completionRecords || []), newRecord]
        updated.completedAt = new Date().toISOString()
        if (task.isRecurring && task.recurrencePattern) {
          const next = new Date()
          const interval = task.recurrenceInterval || 1
          switch (task.recurrencePattern) {
            case 'daily': next.setDate(next.getDate() + interval); break
            case 'weekly': next.setDate(next.getDate() + 7 * interval); break
            case 'monthly': next.setMonth(next.getMonth() + interval); break
            case 'yearly': next.setFullYear(next.getFullYear() + interval); break
          }
          if (!task.recurrenceEndDate || next <= new Date(task.recurrenceEndDate)) {
            const newTask: Task = {
              ...task, id: `${task.id}-${Date.now()}`, completed: false,
              createdAt: new Date().toISOString(), completedAt: undefined,
              lastCompleted: undefined, streak: 0,
              bestStreak: task.bestStreak, completionRecords: []
            }
            setTimeout(() => setTasks(p => [...p, newTask]), 0)
            toast({ title: "Recurring Task Created!", description: `Next occurrence of "${task.title}" added` })
          }
        }
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
        toast({ title: "Cannot Update Task", description: "Uncompleted dependencies must be finished first.", variant: "destructive" })
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
        update.completionRecords = [...(t.completionRecords || []), { date: today, value, energyLevel: t.energyLevel, note: `Completed: ${t.title}` }]
        update.completedAt = new Date().toISOString()
      }
      return { ...t, ...update }
    }))
    if (completed && !task.completed) toast({ title: "Task Completed!", description: "Keep up the good work!" })
  }

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
    toast({ title: "Task Deleted", description: "Task removed from your list" })
  }

  const saveTask = (updated: Task) => {
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t))
    toast({ title: "Task Updated!", description: "Your task has been successfully updated" })
  }

  const addExtendedTask = (taskData: {
    title: string; description: string; priority: number; dueDate?: Date;
    reminderEnabled: boolean; reminderTime?: Date; timeEstimate?: number;
    energyLevel?: number; linkedGoalId?: string; dependencies?: string[];
    timeBlockStart?: string; timeBlockEnd?: string; timeBlockDate?: string;
    isRecurring?: boolean; recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    recurrenceEndDate?: string; recurrenceInterval?: number; tags?: string[];
  }) => {
    const task: Task = {
      id: Date.now().toString(), title: taskData.title, priority: taskData.priority,
      completed: false, type: "boolean", description: taskData.description,
      dueDate: taskData.dueDate?.toISOString(), timeEstimate: taskData.timeEstimate,
      energyLevel: taskData.energyLevel, linkedGoalId: taskData.linkedGoalId,
      dependencies: taskData.dependencies || [], timeBlockStart: taskData.timeBlockStart,
      timeBlockEnd: taskData.timeBlockEnd, timeBlockDate: taskData.timeBlockDate,
      tags: taskData.tags || [], isRecurring: taskData.isRecurring,
      recurrencePattern: taskData.recurrencePattern, recurrenceEndDate: taskData.recurrenceEndDate,
      recurrenceInterval: taskData.recurrenceInterval || 1, createdAt: new Date().toISOString(),
      streak: 0, bestStreak: 0, completionRecords: []
    }
    setTasks(prev => [...prev, task])
    setShowExtendedForm(false)
    toast({ title: "Task Added!", description: `New task "${taskData.title}" created` })
  }

  const searchFilter = (t: Task) =>
    searchTerm === '' || t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()))

  const activeTasks = sortTasks(tasks.filter(t => !t.completed).filter(searchFilter), sortBy)
  const completedTasks = sortTasks(tasks.filter(t => t.completed).filter(searchFilter), sortBy)

  if (!isMounted) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="py-24 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="text-muted-foreground font-medium">Initializing Task Engine...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="space-y-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full">
                <div className="w-full sm:w-64">
                  <Input
                    placeholder="Search tasks..."
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
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="dueDate">Due Date</SelectItem>
                      <SelectItem value="created">Creation Date</SelectItem>
                      <SelectItem value="manual">Manual Order</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Dialog open={showExtendedForm} onOpenChange={setShowExtendedForm}>
                  <DialogTrigger asChild>
                    <Button className="rounded-lg"><Plus className="h-4 w-4 mr-2" />Add Task</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Create New Task</DialogTitle></DialogHeader>
                    <ExtendedTaskForm
                      onSubmit={addExtendedTask}
                      onCancel={() => setShowExtendedForm(false)}
                      goals={goals}
                      tasks={tasks}
                      addedModules={addedModules}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {activeTasks.length > 0 ? (
          <Droppable droppableId="tasks" isDropDisabled={false} isCombineEnabled={false} ignoreContainerClipping={false}>
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
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
                    onSave={saveTask}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No active tasks. Add your first task to get started!</p>
            </CardContent>
          </Card>
        )}

        {completedTasks.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Completed Tasks ({completedTasks.length})
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
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DragDropContext>
  )
}
