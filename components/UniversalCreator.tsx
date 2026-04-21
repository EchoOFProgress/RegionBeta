"use client"

import { useState } from "react"
import { Plus, CheckSquare, Target, Zap, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/lib/language-context"
import { useToast } from "@/hooks/use-toast"
import { storage } from "@/lib/storage"

// Forms
import { ExtendedTaskForm } from "@/components/extended-task-form"
import { ExtendedHabitForm } from "@/components/extended-habit-form"
import { ChallengeCreateForm } from "@/components/challenges/ChallengeCreateForm"
import { GoalCreateForm } from "@/components/goals/GoalCreateForm"

export function UniversalCreator() {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [activeForm, setActiveForm] = useState<"task" | "habit" | "challenge" | "goal" | null>(null)

  const handleOpenForm = (type: "task" | "habit" | "challenge" | "goal") => {
    setActiveForm(type)
    setOpen(true)
  }

  const handleTaskSubmit = (taskData: any) => {
    const existing = storage.load("tasks", [])
    const newTask = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      completed: false,
      type: taskData.type || "boolean",
      streak: 0,
      bestStreak: 0,
      completionRecords: []
    }
    const updated = [...existing, newTask]
    storage.save("tasks", updated)
    window.dispatchEvent(new CustomEvent("tasksUpdated", { detail: updated }))
    setOpen(false)
    toast({ title: t("Task Added!"), description: `"${taskData.title}"` })
  }

  const handleHabitSubmit = (habitData: any) => {
    const existing = storage.load("habits", [])
    const newHabit = {
      ...habitData,
      id: Date.now().toString(),
      streak: 0,
      bestStreak: 0,
      totalCompletions: 0,
      lastCompleted: null,
      completedToday: false,
      completionRecords: []
    }
    const updated = [...existing, newHabit]
    storage.save("habits", updated)
    window.dispatchEvent(new CustomEvent("habitsUpdated", { detail: updated }))
    setOpen(false)
    toast({ title: t("Habit Created!"), description: `"${habitData.name}"` })
  }

  const handleChallengeSubmit = (challenge: any) => {
    const existing = storage.load("challenges", [])
    const updated = [...existing, challenge]
    storage.save("challenges", updated)
    window.dispatchEvent(new CustomEvent("challengesUpdated", { detail: updated }))
    setOpen(false)
    toast({ title: t("Challenge Added!"), description: `"${challenge.title}"` })
  }

  const handleGoalSubmit = (goal: any) => {
    const existing = storage.load("goals", [])
    const updated = [...existing, goal]
    storage.save("goals", updated)
    window.dispatchEvent(new CustomEvent("goalsUpdated", { detail: updated }))
    setOpen(false)
    toast({ title: t("Goal Added!"), description: `"${goal.title}"` })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="default" className="gap-2 rounded-lg shadow-lg hover:shadow-xl transition-all h-10 px-4">
            <Plus className="h-4 w-4" />
            <span className="font-semibold">{t("Add Module")}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 overflow-hidden">
          <DropdownMenuItem onClick={() => handleOpenForm("task")} className="gap-3 py-3 cursor-pointer">
            <CheckSquare className="h-4 w-4 text-blue-500" />
            <span>{t("New Task")}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleOpenForm("habit")} className="gap-3 py-3 cursor-pointer">
            <Target className="h-4 w-4 text-orange-500" />
            <span>{t("New Habit")}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleOpenForm("challenge")} className="gap-3 py-3 cursor-pointer">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span>{t("New Challenge")}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleOpenForm("goal")} className="gap-3 py-3 cursor-pointer border-t">
            <Trophy className="h-4 w-4 text-purple-500" />
            <span>{t("New Goal")}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {activeForm === "task" && t("New Task")}
              {activeForm === "habit" && t("New Habit")}
              {activeForm === "challenge" && t("New Challenge")}
              {activeForm === "goal" && t("New Goal")}
            </DialogTitle>
          </DialogHeader>
          
          <div className="pt-4">
            {activeForm === "task" && (
              <ExtendedTaskForm 
                onSubmit={handleTaskSubmit} 
                onCancel={() => setOpen(false)}
                tasks={storage.load("tasks", [])}
                goals={storage.load("goals", [])}
              />
            )}
            {activeForm === "habit" && (
              <ExtendedHabitForm 
                onSubmit={handleHabitSubmit} 
                onCancel={() => setOpen(false)} 
                habits={storage.load("habits", [])}
              />
            )}
            {activeForm === "challenge" && (
              <ChallengeCreateForm 
                onSubmit={handleChallengeSubmit} 
                onClose={() => setOpen(false)}
                challenges={storage.load("challenges", [])}
              />
            )}
            {activeForm === "goal" && (
              <GoalCreateForm 
                onSubmit={handleGoalSubmit} 
                onCancel={() => setOpen(false)}
                goals={storage.load("goals", [])}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
