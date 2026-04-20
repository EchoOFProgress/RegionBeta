"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Target } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ExtendedHabitForm } from "@/components/extended-habit-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { storage } from "@/lib/storage"
import { useNotifications } from "@/lib/notification-context"
import { Habit, HabitType, NumericCondition, FrequencyType, HabitCompletionRecord } from "@/lib/habits/types"
import { DEFAULT_HABITS, PRESET_HABITS } from "@/lib/habits/constants"
import { getTodayString, applyAutoReset } from "@/lib/habits/utils"
import { HabitCard } from "@/components/habits/HabitCard"

export type { Habit } from "@/lib/habits/types"

export function HabitModule() {
  const { checkForNotifications } = useNotifications()
  const { toast } = useToast()

  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = storage.load("habits", DEFAULT_HABITS)
    return Array.isArray(saved) ? saved : []
  })
  const [sortBy, setSortBy] = useState<'streak' | 'name' | 'created' | 'manual'>('streak')
  const [searchTerm, setSearchTerm] = useState('')
  const [isMounted, setIsMounted] = useState(false)
  const [showExtendedForm, setShowExtendedForm] = useState(false)

  useEffect(() => { setIsMounted(true) }, [])

  useEffect(() => {
    if (isMounted) storage.save("habits", habits)
  }, [habits, isMounted])

  useEffect(() => {
    const timer = setInterval(() => { checkForNotifications?.([], habits, []) }, 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const today = getTodayString()
    const win = window as any
    if (!win.habitAutoResetLastRun || win.habitAutoResetLastRun !== today) {
      win.habitAutoResetLastRun = today
      setHabits(prev => applyAutoReset(prev))
    }
  }, [habits])

  useEffect(() => {
    const handler = (event: CustomEvent) => setHabits(event.detail)
    window.addEventListener('habitsUpdated', handler as EventListener)
    return () => window.removeEventListener('habitsUpdated', handler as EventListener)
  }, [])

  const completeHabit = (id: string, energyLevel: number, mood: number, note: string) => {
    const today = getTodayString()
    const habit = habits.find(h => h.id === id)
    if (!habit || habit.completedToday) {
      if (habit?.completedToday) toast({ title: "Already Completed", description: "You've already completed this habit today!" })
      return
    }
    const newStreak = habit.streak + 1
    const record: HabitCompletionRecord = { date: today, energyLevel, mood, note }
    setHabits(prev => prev.map(h => h.id === id ? {
      ...h, streak: newStreak, bestStreak: Math.max(newStreak, h.bestStreak),
      totalCompletions: h.totalCompletions + 1, lastCompleted: today,
      completedToday: true, completionRecords: [...(h.completionRecords || []), record]
    } : h))
    toast({ title: newStreak % 7 === 0 ? `${newStreak} Day Streak!` : "Habit Completed!", description: newStreak % 7 === 0 ? "You're on fire! Keep it up!" : `Streak: ${newStreak} days` })
  }

  const updateNumericHabit = (id: string, value: number, energyLevel: number, mood: number, note: string) => {
    const habit = habits.find(h => h.id === id)
    if (!habit) return
    let completed = false
    if (habit.numericCondition === "at-least") completed = value >= (habit.numericTarget || 0)
    else if (habit.numericCondition === "less-than") completed = value < (habit.numericTarget || 0)
    else if (habit.numericCondition === "exactly") completed = value === (habit.numericTarget || 0)

    if (completed && !habit.completedToday) {
      const today = getTodayString()
      const newStreak = habit.streak + 1
      const record: HabitCompletionRecord = { date: today, value, energyLevel, mood, note }
      setHabits(prev => prev.map(h => h.id === id ? {
        ...h, numericValue: value, completedToday: true,
        streak: newStreak, bestStreak: Math.max(newStreak, h.bestStreak),
        totalCompletions: h.totalCompletions + 1, lastCompleted: today,
        completionRecords: [...(h.completionRecords || []), record]
      } : h))
      toast({ title: newStreak % 7 === 0 ? `${newStreak} Day Streak!` : "Habit Completed!", description: newStreak % 7 === 0 ? "You're on fire!" : `Streak: ${newStreak} days` })
    } else {
      setHabits(prev => prev.map(h => h.id === id ? { ...h, numericValue: value } : h))
    }
  }

  const updateChecklistHabit = (id: string, energyLevel: number, mood: number, note: string) => {
    const habit = habits.find(h => h.id === id)
    if (!habit || habit.type !== "checklist" || !habit.checklistItems) return
    const allCompleted = habit.checklistItems.length > 0 && habit.checklistItems.every(i => i.completed)
    if (allCompleted && !habit.completedToday) {
      const today = getTodayString()
      const newStreak = habit.streak + 1
      const record: HabitCompletionRecord = { date: today, energyLevel, mood, note }
      setHabits(prev => prev.map(h => h.id === id ? {
        ...h, completedToday: true, streak: newStreak,
        bestStreak: Math.max(newStreak, h.bestStreak),
        totalCompletions: h.totalCompletions + 1, lastCompleted: today,
        completionRecords: [...(h.completionRecords || []), record]
      } : h))
      toast({ title: newStreak % 7 === 0 ? `${newStreak} Day Streak!` : "Habit Completed!", description: `Streak: ${newStreak} days` })
    }
  }

  const toggleChecklistItem = (habitId: string, itemId: string) => {
    setHabits(prev => prev.map(h =>
      h.id === habitId && h.type === "checklist"
        ? { ...h, checklistItems: (h.checklistItems || []).map(i => i.id === itemId ? { ...i, completed: !i.completed } : i) }
        : h
    ))
  }

  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id))
    toast({ title: "Habit Deleted", description: "Habit removed from your tracker" })
  }

  const saveHabit = (updated: Habit) => {
    setHabits(prev => prev.map(h => h.id === updated.id ? updated : h))
    toast({ title: "Habit Updated!", description: "Your habit has been successfully updated" })
  }

  const resetDay = () => {
    const today = getTodayString()
    setHabits(prev => prev.map(h => {
      if (h.resetSchedule === "daily") {
        if (h.lastCompleted !== today) return { ...h, completedToday: false, streak: 0 }
        return { ...h, completedToday: false }
      }
      return { ...h, completedToday: false }
    }))
    toast({ title: "Day Reset", description: "All habits are ready for today" })
  }

  const addExtendedHabit = (habitData: {
    name: string; description: string; type: HabitType;
    numericCondition?: NumericCondition; numericTarget?: number;
    reminders: string[]; frequency: FrequencyType; customDays: number[];
    resetSchedule: "daily" | "weekly" | "monthly"; color: string; icon: string;
    timeWindow?: { from: string; to: string };
    trackEnergyLevel?: boolean; trackMood?: boolean;
  }) => {
    const habit: Habit = {
      id: Date.now().toString(),
      name: habitData.name, description: habitData.description,
      streak: 0, bestStreak: 0, totalCompletions: 0,
      lastCompleted: null, completedToday: false,
      type: habitData.type, numericCondition: habitData.numericCondition,
      numericTarget: habitData.numericTarget, reminders: habitData.reminders,
      frequency: habitData.frequency, customDays: habitData.customDays,
      resetSchedule: habitData.resetSchedule, color: habitData.color,
      icon: habitData.icon, timeWindow: habitData.timeWindow,
      trackEnergyLevel: habitData.trackEnergyLevel,
      trackMood: habitData.trackMood, completionRecords: []
    }
    setHabits(prev => [...prev, habit])
    setShowExtendedForm(false)
    toast({ title: "Habit Created!", description: "Start building your streak with extended settings" })
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return
    const items = Array.from(filteredHabits)
    const [reordered] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reordered)
    setHabits(items)
    setSortBy('manual')
  }

  const filteredHabits = habits
    .filter(h => searchTerm === '' || h.name.toLowerCase().includes(searchTerm.toLowerCase()) || (h.description && h.description.toLowerCase().includes(searchTerm.toLowerCase())))
    .sort((a, b) => {
      if (sortBy === 'streak') return b.streak - a.streak
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'created') return a.id.localeCompare(b.id)
      return 0
    })

  if (!isMounted) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="py-24 text-center text-muted-foreground font-medium animate-pulse">
          Establishing Habit Trackers...
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-full sm:w-64">
                <Input
                  placeholder="Search habits..."
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
                    <SelectItem value="streak">Streak</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="created">Creation Date</SelectItem>
                    <SelectItem value="manual">Manual Order</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Dialog open={showExtendedForm} onOpenChange={setShowExtendedForm}>
                <DialogTrigger asChild>
                  <Button className="rounded-lg">
                    <Plus className="h-4 w-4 mr-2" />Add Habit
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Habit</DialogTitle>
                  </DialogHeader>
                  <ExtendedHabitForm onSubmit={addExtendedHabit} onCancel={() => setShowExtendedForm(false)} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredHabits.length > 0 ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Habits ({filteredHabits.length})</CardTitle>
              <Button variant="outline" size="sm" onClick={resetDay}>Reset Day</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredHabits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  isMounted={isMounted}
                  onComplete={completeHabit}
                  onUpdateNumeric={updateNumericHabit}
                  onToggleChecklistItem={toggleChecklistItem}
                  onUpdateChecklist={updateChecklistHabit}
                  onDelete={deleteHabit}
                  onSave={saveHabit}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No habits yet. Add your first habit to start building streaks!</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
