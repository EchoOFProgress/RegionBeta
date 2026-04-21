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
import { useLanguage } from "@/lib/language-context"
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

export type { Habit } from "@/lib/habits/types"

export function HabitModule() {
  const { checkForNotifications } = useNotifications()
  const { toast } = useToast()
  const { t } = useLanguage()

  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = storage.load("habits", DEFAULT_HABITS)
    return Array.isArray(saved) ? saved : []
  })
  const [sortBy, setSortBy] = useState<'streak' | 'name' | 'created' | 'manual' | 'archived'>('streak')
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
    const checkReset = () => {
      const today = getTodayString()
      const win = window as any
      if (!win.habitAutoResetLastRun || win.habitAutoResetLastRun !== today) {
        win.habitAutoResetLastRun = today
        setHabits(prev => applyAutoReset(prev))
      }
    }
    // Check right away
    checkReset()
    // Then check every minute
    const resetTimer = setInterval(checkReset, 60000)
    return () => clearInterval(resetTimer)
  }, []) // Handle daily reset smoothly even across midnight

  useEffect(() => {
    const handler = (event: CustomEvent) => setHabits(event.detail)
    window.addEventListener('habitsUpdated', handler as EventListener)
    return () => window.removeEventListener('habitsUpdated', handler as EventListener)
  }, [])

  const completeHabit = (id: string, note: string) => {
    const today = getTodayString()
    const habit = habits.find(h => h.id === id)
    if (!habit || habit.completedToday) {
      if (habit?.completedToday) toast({ title: "Already Completed", description: "You've already completed this habit today!" })
      return
    }
    const newStreak = habit.streak + 1
    const record: HabitCompletionRecord = { date: today, note }
    setHabits(prev => prev.map(h => h.id === id ? {
      ...h, streak: newStreak, bestStreak: Math.max(newStreak, h.bestStreak),
      totalCompletions: h.totalCompletions + 1, lastCompleted: today,
      completedToday: true, completionRecords: [...(h.completionRecords || []), record]
    } : h))
    toast({ title: newStreak % 7 === 0 ? `${newStreak} Day Streak!` : "Habit Completed!", description: newStreak % 7 === 0 ? "You're on fire! Keep it up!" : `Streak: ${newStreak} days` })
  }

  const updateNumericHabit = (id: string, value: number, note: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h

      let completed = false
      if (h.numericCondition === "at-least") completed = value >= (h.numericTarget || 0)
      else if (h.numericCondition === "less-than") completed = value < (h.numericTarget || 0)
      else if (h.numericCondition === "exactly") completed = value === (h.numericTarget || 0)

      const today = getTodayString()
      
      // If just became completed
      if (completed && !h.completedToday) {
        const newStreak = h.streak + 1
        const record: HabitCompletionRecord = { date: today, value, note }
        toast({ 
          title: newStreak % 7 === 0 ? `${newStreak} Day Streak!` : "Habit Completed!", 
          description: newStreak % 7 === 0 ? "You're on fire!" : `Streak: ${newStreak} days` 
        })
        return {
          ...h, numericValue: value, completedToday: true,
          streak: newStreak, bestStreak: Math.max(newStreak, h.bestStreak),
          totalCompletions: h.totalCompletions + 1, lastCompleted: today,
          completionRecords: [...(h.completionRecords || []), record]
        }
      } 
      // If was completed but now un-completed (value dropped below target)
      else if (!completed && h.completedToday && h.lastCompleted === today) {
        const newStreak = Math.max(0, h.streak - 1)
        toast({ 
          title: "Habit Un-completed", 
          description: "Value is below target. Streak adjusted.",
          variant: "destructive"
        })
        return {
          ...h, numericValue: value, completedToday: false,
          streak: newStreak,
          totalCompletions: Math.max(0, h.totalCompletions - 1),
          completionRecords: (h.completionRecords || []).filter(r => r.date !== today)
        }
      }
      
      // Regular value update (already completed or not yet completed)
      if (h.numericValue !== value) {
        return { ...h, numericValue: value }
      }
      return h
    }))
  }

  const updateChecklistHabit = (id: string, note: string) => {
    const habit = habits.find(h => h.id === id)
    if (!habit || habit.type !== "checklist" || !habit.checklistItems) return
    const allCompleted = habit.checklistItems.length > 0 && habit.checklistItems.every(i => i.completed)
    if (allCompleted && !habit.completedToday) {
      const today = getTodayString()
      const newStreak = habit.streak + 1
      const record: HabitCompletionRecord = { date: today, note }
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
    toast({ title: t("Habit Deleted"), description: t("Habit removed from your tracker") })
  }

  const archiveHabit = (id: string) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, archived: true } : h))
    toast({ title: t("Habit Archived!"), description: t("Habit moved to archives.") })
  }

  const unarchiveHabit = (id: string) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, archived: false } : h))
    toast({ title: t("Habit Restored!"), description: t("Habit restored from archives.") })
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
      completionRecords: []
    }
    setHabits(prev => [...prev, habit])
    setShowExtendedForm(false)
    toast({ title: "Habit Created!", description: "Start building your streak with extended settings" })
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setHabits((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)
        const newItems = [...items]
        const [moved] = newItems.splice(oldIndex, 1)
        newItems.splice(newIndex, 0, moved)
        return newItems
      })
      setSortBy('manual')
    }
  }

  const filteredHabits = habits
    .filter(h => !h.archived && (searchTerm === '' || h.name.toLowerCase().includes(searchTerm.toLowerCase()) || (h.description && h.description.toLowerCase().includes(searchTerm.toLowerCase()))))
    .sort((a, b) => {
      if (sortBy === 'streak') return b.streak - a.streak
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'created') return a.id.localeCompare(b.id)
      return 0
    })

  const archivedHabits = habits
    .filter(h => h.archived && (searchTerm === '' || h.name.toLowerCase().includes(searchTerm.toLowerCase()) || (h.description && h.description.toLowerCase().includes(searchTerm.toLowerCase()))))

  if (!isMounted) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="py-24 text-center text-muted-foreground font-medium animate-pulse">
          {t("Establishing Habit Trackers...")}
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
                  placeholder={t("Search habits...")}
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
                    <SelectItem value="streak">{t("Streak")}</SelectItem>
                    <SelectItem value="name">{t("Name")}</SelectItem>
                    <SelectItem value="created">{t("Creation Date")}</SelectItem>
                    <SelectItem value="manual">{t("Manual Order")}</SelectItem>
                    <SelectItem value="archived">{t("Zálohované")}</SelectItem>
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
                <span className="font-semibold">{t("Add Habit")}</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showExtendedForm} onOpenChange={setShowExtendedForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("New Habit")}</DialogTitle>
          </DialogHeader>
          <div className="pt-4">
            <ExtendedHabitForm
              onSubmit={addExtendedHabit}
              onCancel={() => setShowExtendedForm(false)}
              habits={habits}
            />
          </div>
        </DialogContent>
      </Dialog>

      {filteredHabits.length > 0 && sortBy !== 'archived' ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t("Vaše návyky")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-0">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={filteredHabits.map(h => h.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3 md:pl-8 pl-6">
                  {filteredHabits.map((habit, index) => (
                    <HabitCard
                      key={habit.id}
                      habit={habit}
                      isMounted={isMounted}
                      onComplete={completeHabit}
                      onUpdateNumeric={updateNumericHabit}
                      onToggleChecklistItem={toggleChecklistItem}
                      onUpdateChecklist={updateChecklistHabit}
                      onDelete={deleteHabit}
                      onArchive={archiveHabit}
                      onSave={saveHabit}
                      habits={habits}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </CardContent>
        </Card>
      ) : sortBy !== 'archived' && (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t("No habits yet. Add your first habit to start building streaks!")}</p>
          </CardContent>
        </Card>
      )}

      {sortBy === 'archived' && archivedHabits.length > 0 && (
        <Card className="border-0 shadow-sm border-dashed border-2">
          <CardHeader>
            <CardTitle>{t("Archivované návyky")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {archivedHabits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  isMounted={isMounted}
                  onComplete={completeHabit}
                  onUpdateNumeric={updateNumericHabit}
                  onToggleChecklistItem={toggleChecklistItem}
                  onUpdateChecklist={updateChecklistHabit}
                  onDelete={deleteHabit}
                  onUnarchive={unarchiveHabit}
                  onSave={saveHabit}
                  habits={habits}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
