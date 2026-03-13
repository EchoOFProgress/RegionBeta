"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getActiveChart, saveChart, getActiveLongTermGoal } from "./storage"
import type { Chart64, BasicGoal, LongTermGoal } from "./types"
import { toast } from "@/hooks/use-toast"
import { Save, Target, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const CATEGORIES = [
  { value: "mental", label: "Mentální" },
  { value: "health", label: "Zdraví" },
  { value: "skill", label: "Dovednosti" },
  { value: "relationship", label: "Vztahy" },
  { value: "financial", label: "Finance" },
  { value: "lifestyle", label: "Životní styl" },
  { value: "learning", label: "Učení" },
  { value: "other", label: "Ostatní" },
]

interface ChartModuleProps {
  userId: string
  onComplete?: () => void
}

export function ChartModule({ userId, onComplete }: ChartModuleProps) {
  const [chart, setChart] = useState<Chart64 | null>(null)
  const [longTermGoal, setLongTermGoal] = useState<LongTermGoal | null>(null)
  const [selectedCell, setSelectedCell] = useState<string | null>(null)
  const [dialogType, setDialogType] = useState<"center" | "basic" | "action" | null>(null)
  const [editingBasicIndex, setEditingBasicIndex] = useState<number | null>(null)
  const [editingTask, setEditingTask] = useState<{ basicGoalId: string; taskIndex: number } | null>(null)

  // Form states
  const [centralGoal, setCentralGoal] = useState("")
  const [basicGoalText, setBasicGoalText] = useState("")
  const [basicGoalCategory, setBasicGoalCategory] = useState<string>("other")
  const [taskText, setTaskText] = useState("")
  const [taskCompleted, setTaskCompleted] = useState(false)

  useEffect(() => {
    const goal = getActiveLongTermGoal(userId)
    setLongTermGoal(goal)

    const existingChart = getActiveChart(userId)
    if (existingChart) {
      setChart(existingChart)
      setCentralGoal(existingChart.centralGoal)
    } else if (goal) {
      const newChart: Chart64 = {
        id: crypto.randomUUID(),
        userId: userId,
        longTermGoalId: goal.id,
        centralGoal: goal.goalDescription,
        basicGoals: [],
        actionTasks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setChart(newChart)
      setCentralGoal(goal.goalDescription)
    }
  }, [userId])

  const findNextEmptyCell = useCallback((currentChart: Chart64, type: "basic" | "action", currentIndex?: number) => {
    if (type === "basic") {
      for (let i = (currentIndex ?? -1) + 1; i < 8; i++) {
        if (!currentChart.basicGoals[i]?.text) {
          return { type: "basic" as const, index: i }
        }
      }
    } else if (type === "action" && currentIndex !== undefined) {
      const basicGoal = currentChart.basicGoals[currentIndex]
      if (basicGoal) {
        const tasks = currentChart.actionTasks.filter((t) => t.basicGoalId === basicGoal.id)
        for (let i = 0; i < 8; i++) {
          if (!tasks[i]?.text) {
            return { type: "action" as const, basicIndex: currentIndex, taskIndex: i }
          }
        }
        // If all tasks filled, find next basic goal with empty tasks
        for (let bi = currentIndex + 1; bi < 8; bi++) {
          const nextBasic = currentChart.basicGoals[bi]
          if (nextBasic) {
            const nextTasks = currentChart.actionTasks.filter((t) => t.basicGoalId === nextBasic.id)
            for (let ti = 0; ti < 8; ti++) {
              if (!nextTasks[ti]?.text) {
                return { type: "action" as const, basicIndex: bi, taskIndex: ti }
              }
            }
          }
        }
      }
    }
    return null
  }, [])

  const handleCellClick = (type: "center" | "basic" | "action", id?: string) => {
    setSelectedCell(id || null)

    if (type === "center") {
      setCentralGoal(chart?.centralGoal || "")
      setDialogType("center")
    } else if (type === "basic") {
      const match = id?.match(/basic-(\d+)/)
      if (match) {
        const index = Number.parseInt(match[1])
        const basicGoal = chart?.basicGoals[index]
        setEditingBasicIndex(index)
        setBasicGoalText(basicGoal?.text || "")
        setBasicGoalCategory(basicGoal?.category || "other")
        setDialogType("basic")
      } else if (id) {
        const basicGoal = chart?.basicGoals.find((g) => g.id === id)
        if (basicGoal) {
          const index = chart?.basicGoals.indexOf(basicGoal) ?? -1
          setEditingBasicIndex(index)
          setBasicGoalText(basicGoal.text)
          setBasicGoalCategory(basicGoal.category)
          setDialogType("basic")
        }
      }
    } else if (type === "action") {
      const match = id?.match(/action-(\d+)-(\d+)/)
      if (match) {
        const basicIndex = Number.parseInt(match[1])
        const taskIndex = Number.parseInt(match[2])
        const basicGoal = chart?.basicGoals[basicIndex]
        if (basicGoal) {
          const tasks = chart?.actionTasks.filter((t) => t.basicGoalId === basicGoal.id) || []
          const task = tasks[taskIndex]
          setEditingTask({ basicGoalId: basicGoal.id, taskIndex })
          setTaskText(task?.text || "")
          setTaskCompleted(task?.completed || false)
          setDialogType("action")
        }
      } else if (id) {
        const task = chart?.actionTasks.find((t) => t.id === id)
        if (task) {
          const tasks = chart?.actionTasks.filter((t) => t.basicGoalId === task.basicGoalId) || []
          const taskIndex = tasks.indexOf(task)
          setEditingTask({ basicGoalId: task.basicGoalId, taskIndex })
          setTaskText(task.text)
          setTaskCompleted(task.completed)
          setDialogType("action")
        }
      }
    }
  }

  const handleSaveCentralGoal = () => {
    if (!chart) return

    const updatedChart: Chart64 = {
      ...chart,
      centralGoal,
      updatedAt: new Date().toISOString(),
    }
    saveChart(updatedChart)
    setChart(updatedChart)
    setDialogType(null)
    toast({
      title: "Hlavní cíl uložen",
      description: "Váš hlavní cíl byl aktualizován.",
    })
  }

  const handleSaveBasicGoal = () => {
    if (!chart || editingBasicIndex === null) return

    const basicGoals = [...chart.basicGoals]
    const existingGoal = basicGoals[editingBasicIndex]

    if (existingGoal) {
      basicGoals[editingBasicIndex] = {
        ...existingGoal,
        text: basicGoalText,
        category: basicGoalCategory as BasicGoal["category"],
      }
    } else {
      basicGoals[editingBasicIndex] = {
        id: crypto.randomUUID(),
        text: basicGoalText,
        category: basicGoalCategory as BasicGoal["category"],
      }
    }

    const updatedChart: Chart64 = {
      ...chart,
      basicGoals,
      updatedAt: new Date().toISOString(),
    }
    saveChart(updatedChart)
    setChart(updatedChart)

    const next = findNextEmptyCell(updatedChart, "basic", editingBasicIndex)
    if (next && next.type === "basic") {
      setEditingBasicIndex(next.index)
      setBasicGoalText("")
      setBasicGoalCategory("other")
      toast({
        title: "Dílčí cíl uložen",
        description: "Pokračujte dalším cílem.",
      })
    } else {
      setDialogType(null)
      setEditingBasicIndex(null)
      toast({
        title: "Dílčí cíl uložen",
        description: "Váš dílčí cíl byl aktualizován.",
      })
    }
  }

  const handleSaveTask = () => {
    if (!chart || !editingTask) return

    const actionTasks = [...chart.actionTasks]
    const tasksForGoal = actionTasks.filter((t) => t.basicGoalId === editingTask.basicGoalId)
    const existingTask = tasksForGoal[editingTask.taskIndex]
    const wasCompleted = existingTask?.completed || false

    if (existingTask) {
      const taskIndex = actionTasks.indexOf(existingTask)
      actionTasks[taskIndex] = {
        ...existingTask,
        text: taskText,
        completed: taskCompleted,
      }
    } else {
      actionTasks.push({
        id: crypto.randomUUID(),
        basicGoalId: editingTask.basicGoalId,
        text: taskText,
        completed: taskCompleted,
      })
    }

    const updatedChart: Chart64 = {
      ...chart,
      actionTasks,
      updatedAt: new Date().toISOString(),
    }
    saveChart(updatedChart)
    setChart(updatedChart)

    const basicIndex = chart.basicGoals.findIndex((g) => g.id === editingTask.basicGoalId)
    const next = findNextEmptyCell(updatedChart, "action", basicIndex)
    if (next && next.type === "action") {
      const nextBasicGoal = updatedChart.basicGoals[next.basicIndex]
      if (nextBasicGoal) {
        setEditingTask({ basicGoalId: nextBasicGoal.id, taskIndex: next.taskIndex })
        setTaskText("")
        setTaskCompleted(false)
        toast({
          title: taskCompleted && !wasCompleted ? "Úkol splněn!" : "Úkol uložen",
          description: taskCompleted && !wasCompleted ? "Pokračujte dalším úkolem." : "Pokračujte dalším úkolem.",
        })
        return
      }
    }

    setDialogType(null)
    setEditingTask(null)
    toast({
      title: taskCompleted && !wasCompleted ? "Úkol splněn!" : "Úkol uložen",
      description: taskCompleted && !wasCompleted ? "Skvělá práce!" : "Váš úkol byl aktualizován.",
    })
  }

  const handleQuickToggle = (taskId: string) => {
    if (!chart) return

    const task = chart.actionTasks.find((t) => t.id === taskId)
    if (!task) return

    const wasCompleted = task.completed
    const actionTasks = chart.actionTasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))

    const updatedChart: Chart64 = {
      ...chart,
      actionTasks,
      updatedAt: new Date().toISOString(),
    }
    saveChart(updatedChart)
    setChart(updatedChart)

    if (!wasCompleted) {
      toast({
        title: "Úkol splněn!",
        description: "Skvělá práce!",
      })
    }
  }

  const completedTasks = chart?.actionTasks.filter((t) => t.completed).length || 0
  const totalTasks = 64
  const progress = Math.round((completedTasks / totalTasks) * 100)

  // Render the Mandala Chart grid
  const renderChartGrid = () => {
    const basicGoals = chart?.basicGoals || []
    const actionTasks = chart?.actionTasks || []

    const getBasicGoal = (index: number): BasicGoal | undefined => basicGoals[index]
    const getActionTasks = (basicGoalId: string): any[] => actionTasks.filter((t) => t.basicGoalId === basicGoalId)

    const getCategoryColor = (category?: string): string => {
      const colors: Record<string, string> = {
        mental: "bg-blue-100 border-blue-300 text-blue-800",
        health: "bg-green-100 border-green-300 text-green-800",
        skill: "bg-purple-100 border-purple-300 text-purple-800",
        relationship: "bg-pink-100 border-pink-300 text-pink-800",
        financial: "bg-yellow-100 border-yellow-300 text-yellow-800",
        lifestyle: "bg-orange-100 border-orange-300 text-orange-800",
        learning: "bg-cyan-100 border-cyan-300 text-cyan-800",
        other: "bg-gray-100 border-gray-300 text-gray-800",
      }
      return colors[category || "other"] || colors.other
    }

    const renderCell = (row: number, col: number) => {
      // Center cell (main goal)
      if (row === 4 && col === 4) {
        return (
          <div
            onClick={() => handleCellClick("center")}
            className={cn(
              "w-full h-full p-1 text-[10px] md:text-xs flex items-center justify-center text-center cursor-pointer transition-all",
              "bg-primary text-primary-foreground font-semibold rounded",
              selectedCell === "center" && "ring-2 ring-offset-2 ring-primary",
            )}
          >
            {chart?.centralGoal || "Hlavní cíl"}
          </div>
        )
      }

      const sectionRow = Math.floor(row / 3)
      const sectionCol = Math.floor(col / 3)
      const localRow = row % 3
      const localCol = col % 3

      // Center section contains basic goals in a 3x3 grid
      if (sectionRow === 1 && sectionCol === 1) {
        if (localRow === 1 && localCol === 1) {
          return null
        }

        const positionMap: Record<string, number> = {
          "0,0": 0,
          "0,1": 1,
          "0,2": 2,
          "1,0": 3,
          "1,2": 4,
          "2,0": 5,
          "2,1": 6,
          "2,2": 7,
        }
        const basicIndex = positionMap[`${localRow},${localCol}`]
        const basicGoal = getBasicGoal(basicIndex)

        return (
          <div
            onClick={() => handleCellClick("basic", basicGoal?.id || `basic-${basicIndex}`)}
            className={cn(
              "w-full h-full p-1 text-[9px] md:text-[11px] flex items-center justify-center text-center cursor-pointer transition-all border rounded",
              basicGoal ? getCategoryColor(basicGoal.category) : "bg-muted text-muted-foreground",
              selectedCell === basicGoal?.id && "ring-2 ring-offset-1 ring-primary",
            )}
          >
            {basicGoal?.text || `Cíl ${basicIndex + 1}`}
          </div>
        )
      }

      // Outer sections contain action tasks
      const sectionToBasicMap: Record<string, number> = {
        "0,0": 0,
        "0,1": 1,
        "0,2": 2,
        "1,0": 3,
        "1,2": 4,
        "2,0": 5,
        "2,1": 6,
        "2,2": 7,
      }
      const basicIndex = sectionToBasicMap[`${sectionRow},${sectionCol}`]
      if (basicIndex === undefined) return null

      const basicGoal = getBasicGoal(basicIndex)
      const tasks = basicGoal ? getActionTasks(basicGoal.id) : []

      if (localRow === 1 && localCol === 1) {
        return (
          <div
            onClick={() => handleCellClick("basic", basicGoal?.id || `basic-${basicIndex}`)}
            className={cn(
              "w-full h-full p-1 text-[9px] md:text-[11px] flex items-center justify-center text-center cursor-pointer transition-all border rounded font-medium",
              basicGoal ? getCategoryColor(basicGoal.category) : "bg-muted text-muted-foreground",
              selectedCell === basicGoal?.id && "ring-2 ring-offset-1 ring-primary",
            )}
          >
            {basicGoal?.text || `Cíl ${basicIndex + 1}`}
          </div>
        )
      }

      const taskPositionMap: Record<string, number> = {
        "0,0": 0,
        "0,1": 1,
        "0,2": 2,
        "1,0": 3,
        "1,2": 4,
        "2,0": 5,
        "2,1": 6,
        "2,2": 7,
      }
      const taskIndex = taskPositionMap[`${localRow},${localCol}`]
      const task = tasks[taskIndex]

      const handleClick = () => {
        if (task?.text && task.id) {
          // Double click - toggle completion
          handleQuickToggle(task.id)
        } else {
          // Single click - open dialog
          handleCellClick("action", task?.id || `action-${basicIndex}-${taskIndex}`)
        }
      }

      return (
        <div
          onClick={handleClick}
          className={cn(
            "w-full h-full p-0.5 text-[8px] md:text-[10px] flex items-center justify-center text-center cursor-pointer transition-all border rounded relative",
            task?.completed
              ? "bg-green-100 border-green-300 text-green-800"
              : task?.text
                ? "bg-background border-border text-foreground hover:bg-accent"
                : "bg-muted/50 border-dashed border-muted-foreground/30 text-muted-foreground hover:bg-muted",
            selectedCell === task?.id && "ring-2 ring-offset-1 ring-primary",
          )}
        >
          {task?.completed && (
            <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-bl flex items-center justify-center">
              <Check className="w-2 h-2 text-white" />
            </div>
          )}
          {task?.text || ""}
        </div>
      )
    }

    return (
      <div className="w-full max-w-2xl mx-auto aspect-square p-2">
        <div className="grid grid-cols-9 gap-0.5 md:gap-1 h-full">
          {Array.from({ length: 81 }, (_, i) => {
            const row = Math.floor(i / 9)
            const col = i % 9
            return (
              <div key={i} className="aspect-square">
                {renderCell(row, col)}
              </div>
            )
          })}
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Klikněte na buňku pro úpravu. Dvojklik na úkol pro rychlé označení jako splněný.
        </p>
      </div>
    )
  }

  if (!longTermGoal) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-6 text-center">
            <Target className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold mb-2">Nejprve nastavte dlouhodobý cíl</h2>
            <p className="text-muted-foreground mb-6">Pro vytvoření 64 Chart potřebujete mít definovaný hlavní cíl.</p>
            <Button>Nastavit cíl</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">64 Chart (Mandala)</h2>
          <p className="text-muted-foreground">Rozložte svůj cíl na 8 dílčích cílů a 64 konkrétních úkolů</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Pokrok</p>
          <p className="text-2xl font-bold text-primary">
            {completedTasks}/{totalTasks} ({progress}%)
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Váš 64 Chart</CardTitle>
          <CardDescription>
            Klikněte na buňku pro úpravu. Střed je váš hlavní cíl, kolem něj jsou dílčí cíle a akční úkoly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderChartGrid()}
        </CardContent>
      </Card>

      {/* Central Goal Dialog */}
      <Dialog open={dialogType === "center"} onOpenChange={() => setDialogType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hlavní cíl</DialogTitle>
            <DialogDescription>Váš dlouhodobý cíl, ke kterému směřuje celý plán</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Popis cíle</Label>
              <Textarea
                value={centralGoal}
                onChange={(e) => setCentralGoal(e.target.value)}
                placeholder="Váš hlavní cíl..."
                rows={3}
              />
            </div>
            <Button onClick={handleSaveCentralGoal} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Uložit
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Basic Goal Dialog */}
      <Dialog open={dialogType === "basic"} onOpenChange={() => setDialogType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dílčí cíl {editingBasicIndex !== null ? editingBasicIndex + 1 : ""}</DialogTitle>
            <DialogDescription>Jeden z 8 hlavních kroků k dosažení vašeho cíle</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Popis cíle</Label>
              <Input
                value={basicGoalText}
                onChange={(e) => setBasicGoalText(e.target.value)}
                placeholder="Např. Zlepšit slovní zásobu"
                onKeyDown={(e) => e.key === "Enter" && handleSaveBasicGoal()}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>Kategorie</Label>
              <Select value={basicGoalCategory} onValueChange={setBasicGoalCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSaveBasicGoal} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Uložit a pokračovat
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Action Task Dialog */}
      <Dialog open={dialogType === "action"} onOpenChange={() => setDialogType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Akční úkol</DialogTitle>
            <DialogDescription>Konkrétní krok, který vás přiblíží k cíli</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Popis úkolu</Label>
              <Input
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
                placeholder="Např. Naučit se 20 nových slovíček"
                onKeyDown={(e) => e.key === "Enter" && handleSaveTask()}
                autoFocus
              />
            </div>
            <button
              onClick={() => setTaskCompleted(!taskCompleted)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg border transition-all",
                taskCompleted ? "bg-green-50 border-green-300" : "border-border hover:bg-accent",
              )}
            >
              <div
                className={cn(
                  "w-6 h-6 rounded border-2 flex items-center justify-center transition-colors",
                  taskCompleted ? "bg-green-500 border-green-500" : "border-muted-foreground/50",
                )}
              >
                {taskCompleted && <Check className="w-4 h-4 text-white" />}
              </div>
              <span className="font-medium">{taskCompleted ? "Splněno" : "Označit jako splněné"}</span>
            </button>
            <Button onClick={handleSaveTask} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Uložit a pokračovat
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}