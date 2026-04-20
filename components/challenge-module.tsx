"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Target } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { storage } from "@/lib/storage"
import { useNotifications } from "@/lib/notification-context"
import { Challenge } from "@/lib/challenges/types"
import { getTodayString, calculateEndDate, getProgressPercentage } from "@/lib/challenges/utils"
import { PRESET_CHALLENGES } from "@/lib/challenges/constants"
import { ChallengeCard } from "@/components/challenges/ChallengeCard"
import { ChallengeCreateForm } from "@/components/challenges/ChallengeCreateForm"

export type { Milestone, Challenge } from "@/lib/challenges/types"

export function ChallengeModule() {
  const { checkForNotifications } = useNotifications()
  const { toast } = useToast()

  const [challenges, setChallenges] = useState<Challenge[]>(() => storage.load("challenges", []))
  const [sortBy, setSortBy] = useState<'progress' | 'name' | 'created' | 'manual'>('progress')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCustomForm, setShowCustomForm] = useState(false)

  useEffect(() => {
    storage.save("challenges", challenges)
  }, [challenges])

  useEffect(() => {
    const timer = setInterval(() => {
      checkForNotifications?.([], [], [])
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  const activeChallenges = challenges
    .filter(c => !c.archived && (
      searchTerm === '' ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
    ))
    .sort((a, b) => {
      if (sortBy === 'progress') return getProgressPercentage(b) - getProgressPercentage(a)
      if (sortBy === 'name') return a.title.localeCompare(b.title)
      if (sortBy === 'created') return a.id.localeCompare(b.id)
      return 0
    })

  const addChallenge = (challenge: Challenge) => {
    setChallenges(prev => [...prev, challenge])
  }

  const addPresetChallenge = (preset: typeof PRESET_CHALLENGES[0]) => {
    const startDate = getTodayString()
    const endDate = calculateEndDate(startDate, preset.duration)
    setChallenges(prev => [...prev, {
      id: Date.now().toString(),
      title: preset.title,
      description: preset.description,
      duration: preset.duration,
      currentDay: 0,
      status: "active",
      startDate,
      endDate,
      lastCheckedIn: null,
      goalType: "daily-completion",
      failureMode: "soft",
      currentFailures: 0,
      notes: {},
      difficulty: 3,
      color: "#64748b",
      icon: "target",
      archived: false,
      dailyProgress: [],
      currentStreak: 0,
      bestStreak: 0,
      completionRecords: [],
    }])
    toast({ title: "Challenge Added!", description: `"${preset.title}" added to your list` })
  }

  const updateChallenge = (updated: Challenge) => {
    setChallenges(prev => prev.map(c => c.id === updated.id ? updated : c))
  }

  const checkInChallenge = (id: string, energyLevel: number, note: string) => {
    const today = getTodayString()
    const challenge = challenges.find(c => c.id === id)
    if (!challenge) return
    if (challenge.lastCheckedIn === today && challenge.goalType !== "total-amount") {
      toast({ title: "Already Checked In", description: "You've already checked in today!" })
      return
    }
    const amount = challenge.goalType === "total-amount" ? energyLevel : 1
    const newRecord = { date: today, amount, energyLevel, note }
    const newStreak = (challenge.currentStreak || 0) + 1
    const newBestStreak = Math.max(newStreak, challenge.bestStreak || 0)
    const isComplete = challenge.currentDay + 1 >= challenge.duration
    setChallenges(prev => prev.map(c => c.id === id ? {
      ...c,
      currentDay: c.currentDay + 1,
      lastCheckedIn: today,
      lastCompletedDate: today,
      currentStreak: newStreak,
      bestStreak: newBestStreak,
      dailyProgress: [...(c.dailyProgress || []), amount],
      completionRecords: [...(c.completionRecords || []), newRecord],
      status: isComplete ? "completed" : c.status,
      notes: note ? { ...c.notes, [today]: note } : c.notes,
    } : c))
    toast({ title: "Check-in Successful", description: "Your progress has been saved." })
  }

  const deleteChallenge = (id: string) => {
    setChallenges(prev => prev.filter(c => c.id !== id))
    toast({ title: "Challenge Deleted", description: "Challenge removed successfully" })
  }

  const archiveChallenge = (id: string) => {
    setChallenges(prev => prev.map(c => c.id === id ? { ...c, archived: true } : c))
    toast({ title: "Challenge Archived!", description: "Challenge has been moved to archived section" })
  }

  const toggleChallengeCompletion = (id: string) => {
    const challenge = challenges.find(c => c.id === id)
    if (!challenge) return
    const newStatus = challenge.status === "completed" ? "active" : "completed"
    setChallenges(prev => prev.map(c => c.id === id ? {
      ...c,
      status: newStatus,
      currentDay: newStatus === "completed" ? c.duration : c.currentDay,
      lastCompletedDate: newStatus === "completed" ? getTodayString() : undefined,
    } : c))
    toast({
      title: `Challenge ${challenge.status === 'completed' ? 'Marked Incomplete' : 'Completed'}!`,
      description: "Challenge status updated successfully"
    })
  }

  const convertChallengeToHabit = (challenge: Challenge) => {
    const newHabit = {
      id: Date.now().toString(),
      name: challenge.title,
      streak: challenge.currentStreak || 0,
      bestStreak: challenge.bestStreak || 0,
      totalCompletions: challenge.currentDay || 0,
      lastCompleted: challenge.lastCheckedIn,
      completedToday: challenge.lastCheckedIn === getTodayString(),
      description: challenge.description,
      type: "boolean" as const,
      frequency: "daily" as const,
      resetSchedule: "daily" as const,
      color: challenge.color || "#64748b",
      icon: challenge.icon || "circle",
      completionRecords: (challenge.completionRecords || []).map(r => ({ date: r.date, energyLevel: r.energyLevel })),
    }
    const savedHabits = storage.load("habits", [])
    storage.save("habits", [...savedHabits, newHabit])
    setChallenges(prev => prev.filter(c => c.id !== challenge.id))
    window.dispatchEvent(new CustomEvent("habitsUpdated", { detail: [...savedHabits, newHabit] }))
    toast({ title: "Converted to Habit!", description: `"${challenge.title}" is now a habit.` })
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-full sm:w-64">
                <Input
                  placeholder="Search challenges..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-lg border-border focus:border-primary"
                />
              </div>
              <div className="w-full sm:w-40">
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                  <SelectTrigger className="rounded-lg border-border focus:border-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="progress">Progress</SelectItem>
                    <SelectItem value="name">Title</SelectItem>
                    <SelectItem value="created">Creation Date</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Dialog open={showCustomForm} onOpenChange={setShowCustomForm}>
                <DialogTrigger asChild>
                  <Button className="rounded-lg">
                    <Plus className="h-4 w-4 mr-2" />Add Challenge
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Custom Challenge</DialogTitle>
                  </DialogHeader>
                  <ChallengeCreateForm
                    onSubmit={addChallenge}
                    onClose={() => setShowCustomForm(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {activeChallenges.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Your Challenges ({activeChallenges.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeChallenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  onCheckIn={checkInChallenge}
                  onDelete={deleteChallenge}
                  onArchive={archiveChallenge}
                  onToggleCompletion={toggleChallengeCompletion}
                  onConvertToHabit={convertChallengeToHabit}
                  onUpdate={updateChallenge}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No challenges yet. Create your first challenge to get started!</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
