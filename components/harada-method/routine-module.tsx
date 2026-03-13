"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { getActiveRoutineSheet, saveRoutineSheet } from "./storage"
import type { RoutineCheckSheet, RoutineTask, RoutineCheckEntry } from "./types"
import { toast } from "@/hooks/use-toast"
import { Plus, Sun, Cloud, Moon, Trash2, ChevronLeft, ChevronRight, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const DEFAULT_TASKS: RoutineTask[] = [
  { id: "1", name: "Ranní cvičení", category: "morning", isCustom: false },
  { id: "2", name: "Zdravá snídaně", category: "morning", isCustom: false },
  { id: "3", name: "Plánování dne", category: "morning", isCustom: false },
  { id: "4", name: "Pracovní blok (focus)", category: "afternoon", isCustom: false },
  { id: "5", name: "Přestávka na procházku", category: "afternoon", isCustom: false },
  { id: "6", name: "Učení/rozvoj", category: "afternoon", isCustom: false },
  { id: "7", name: "Reflexe dne", category: "evening", isCustom: false },
  { id: "8", name: "Příprava na další den", category: "evening", isCustom: false },
  { id: "9", name: "Relaxace bez obrazovek", category: "evening", isCustom: false },
]

interface RoutineModuleProps {
  userId: string
  onComplete?: () => void
}

export function RoutineModule({ userId, onComplete }: RoutineModuleProps) {
  const [sheet, setSheet] = useState<RoutineCheckSheet | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [newTaskName, setNewTaskName] = useState("")
  const [newTaskCategory, setNewTaskCategory] = useState<"morning" | "afternoon" | "evening">("morning")
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    const existingSheet = getActiveRoutineSheet(userId)
    if (existingSheet) {
      setSheet(existingSheet)
    } else {
      const newSheet: RoutineCheckSheet = {
        id: crypto.randomUUID(),
        userId: userId,
        tasks: DEFAULT_TASKS,
        entries: [],
        createdAt: new Date().toISOString(),
      }
      saveRoutineSheet(newSheet)
      setSheet(newSheet)
    }
  }, [userId])

  const handleToggleTask = (taskId: string) => {
    if (!sheet) return

    const existingEntry = sheet.entries.find((e) => e.taskId === taskId && e.date === selectedDate)

    let updatedEntries: RoutineCheckEntry[]

    if (existingEntry) {
      updatedEntries = sheet.entries.map((e) =>
        e.taskId === taskId && e.date === selectedDate ? { ...e, completed: !e.completed } : e,
      )
    } else {
      updatedEntries = [...sheet.entries, { date: selectedDate, taskId, completed: true }]
    }

    const updatedSheet: RoutineCheckSheet = {
      ...sheet,
      entries: updatedEntries,
    }

    saveRoutineSheet(updatedSheet)
    setSheet(updatedSheet)

    toast({
      title: "Rutina aktualizována",
      description: "Váš pokrok byl uložen.",
    })
  }

  const handleAddTask = () => {
    if (!newTaskName.trim() || !sheet) return

    const newTask: RoutineTask = {
      id: crypto.randomUUID(),
      name: newTaskName.trim(),
      category: newTaskCategory,
      isCustom: true,
    }

    const updatedSheet: RoutineCheckSheet = {
      ...sheet,
      tasks: [...sheet.tasks, newTask],
    }

    saveRoutineSheet(updatedSheet)
    setSheet(updatedSheet)
    setNewTaskName("")
    setDialogOpen(false)
    toast({
      title: "Rutina přidána",
      description: "Nová rutina byla přidána do vašeho plánu.",
    })
  }

  const handleDeleteTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent row click when deleting
    if (!sheet) return

    const updatedSheet: RoutineCheckSheet = {
      ...sheet,
      tasks: sheet.tasks.filter((t) => t.id !== taskId),
      entries: sheet.entries.filter((e) => e.taskId !== taskId),
    }

    saveRoutineSheet(updatedSheet)
    setSheet(updatedSheet)
    toast({
      title: "Rutina odstraněna",
      description: "Rutina byla odebrána z vašeho plánu.",
    })
  }

  const changeDate = (days: number) => {
    const date = new Date(selectedDate)
    date.setDate(date.getDate() + days)
    setSelectedDate(date.toISOString().split("T")[0])
  }

  const isTaskCompleted = (taskId: string) => {
    if (!sheet) return false
    return sheet.entries.some((e) => e.taskId === taskId && e.date === selectedDate && e.completed)
  }

  const getTasksByCategory = (category: "morning" | "afternoon" | "evening") => {
    if (!sheet) return []
    return sheet.tasks.filter((t) => t.category === category)
  }

  const getCategoryProgress = (category: "morning" | "afternoon" | "evening") => {
    const tasks = getTasksByCategory(category)
    if (tasks.length === 0) return 0
    const completed = tasks.filter((t) => isTaskCompleted(t.id)).length
    return Math.round((completed / tasks.length) * 100)
  }

  const totalProgress = (() => {
    if (!sheet || sheet.tasks.length === 0) return 0
    const completed = sheet.tasks.filter((t) => isTaskCompleted(t.id)).length
    return Math.round((completed / sheet.tasks.length) * 100)
  })()

  const categories = [
    { key: "morning" as const, label: "Ráno", icon: Sun, color: "text-yellow-500" },
    { key: "afternoon" as const, label: "Odpoledne", icon: Cloud, color: "text-blue-500" },
    { key: "evening" as const, label: "Večer", icon: Moon, color: "text-purple-500" },
  ]

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date().toISOString().split("T")[0]
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split("T")[0]

    if (dateStr === today) return "Dnes"
    if (dateStr === yesterdayStr) return "Včera"

    return date.toLocaleDateString("cs-CZ", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Denní rutiny</h2>
          <p className="text-muted-foreground">Sledujte své každodenní návyky a budujte disciplínu</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Přidat rutinu
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Přidat novou rutinu</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Název</Label>
                <Input
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  placeholder="Např. Meditace"
                  onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                />
              </div>
              <div className="space-y-2">
                <Label>Část dne</Label>
                <Select value={newTaskCategory} onValueChange={(v) => setNewTaskCategory(v as typeof newTaskCategory)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Ráno</SelectItem>
                    <SelectItem value="afternoon">Odpoledne</SelectItem>
                    <SelectItem value="evening">Večer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddTask} className="w-full">
                Přidat
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={() => changeDate(-1)}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="text-center">
              <p className="font-semibold">{formatDate(selectedDate)}</p>
              <p className="text-sm text-muted-foreground">{selectedDate}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => changeDate(1)}
              disabled={selectedDate >= new Date().toISOString().split("T")[0]}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Celkový pokrok</span>
              <span className="font-medium">{totalProgress}%</span>
            </div>
            <Progress value={totalProgress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card key={category.key}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <category.icon className={`w-5 h-5 ${category.color}`} />
                {category.label}
              </CardTitle>
              <CardDescription>{getCategoryProgress(category.key)}% dokončeno</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {getTasksByCategory(category.key).map((task) => {
                const completed = isTaskCompleted(task.id)
                return (
                  <div
                    key={task.id}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-lg border transition-all text-left",
                      completed ? "bg-green-50 border-green-200" : "border-border hover:bg-accent cursor-pointer",
                    )}
                    onClick={() => handleToggleTask(task.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                          completed ? "bg-green-500 border-green-500" : "border-muted-foreground/50",
                        )}
                      >
                        {completed && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className={cn(completed && "line-through text-muted-foreground")}>{task.name}</span>
                    </div>
                    {task.isCustom && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={(e) => handleDeleteTask(task.id, e)}
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                )
              })}
              {getTasksByCategory(category.key).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Žádné rutiny</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}