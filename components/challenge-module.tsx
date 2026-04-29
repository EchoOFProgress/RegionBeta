"use client"

import { useState, useEffect } from "react"
import { logActivity } from "@/lib/db"
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
import { useLanguage } from "@/lib/language-context"

export type { Milestone, Challenge } from "@/lib/challenges/types"

export function ChallengeModule() {
  const { checkForNotifications } = useNotifications()
  const { toast } = useToast()
  const { t } = useLanguage()

  const [challenges, setChallenges] = useState<Challenge[]>(() => storage.load("challenges", []))
  const [sortBy, setSortBy] = useState<'progress' | 'name' | 'created' | 'manual' | 'archived'>('progress')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCustomForm, setShowCustomForm] = useState(false)

  useEffect(() => {
    storage.save("challenges", challenges)
  }, [challenges])

  useEffect(() => {
    const handler = (e: CustomEvent) => setChallenges(e.detail)
    window.addEventListener('challengesUpdated', handler as EventListener)
    return () => window.removeEventListener('challengesUpdated', handler as EventListener)
  }, [])

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

  const archivedChallenges = challenges.filter(c => c.archived && (
    searchTerm === '' ||
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
  ))

  const addChallenge = (challenge: Challenge) => {
    setChallenges(prev => [...prev, challenge])
    logActivity({ event_type: "challenge_created", item_id: String(challenge.id), item_title: challenge.title, metadata: { duration: challenge.duration, goalType: challenge.goalType } })
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
      notes: {},
      difficulty: 3,
      icon: "target",
      archived: false,
      dailyProgress: [],
      currentStreak: 0,
      bestStreak: 0,
      completionRecords: [],
    }])
    toast({ title: t("notif.challenge_added"), description: `"${preset.title}" ${t("notif.challenge_added")}` })
  }

  const updateChallenge = (updated: Challenge) => {
    setChallenges(prev => prev.map(c => c.id === updated.id ? updated : c))
  }

  const checkInChallenge = (id: string, amount: number, note: string) => {
    const today = getTodayString()
    const challenge = challenges.find(c => c.id === id)
    if (!challenge) return
    if (challenge.lastCheckedIn === today && challenge.goalType !== "total-amount") {
      toast({ title: t("habit.already_completed"), description: t("habit.already_completed") })
      return
    }
    const newRecord = { date: today, amount, note }
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
    toast({ title: t("challenge.checkin_success"), description: t("challenge.progress_saved") })
    logActivity({ event_type: isComplete ? "challenge_completed" : "challenge_checkin", item_id: String(id), item_title: challenge.title, metadata: { day: challenge.currentDay + 1, streak: newStreak, amount } })
  }

  const deleteChallenge = (id: string) => {
    const challenge = challenges.find(c => c.id === id)
    if (challenge) logActivity({ event_type: "challenge_deleted", item_id: String(id), item_title: challenge.title })
    setChallenges(prev => prev.filter(c => c.id !== id))
    toast({ title: t("notif.challenge_deleted"), description: t("notif.challenge_deleted") })
  }

  const archiveChallenge = (id: string) => {
    setChallenges(prev => prev.map(c => c.id === id ? { ...c, archived: true } : c))
    toast({ title: t("notif.challenge_archived"), description: t("challenge.archived_desc") })
  }

  const unarchiveChallenge = (id: string) => {
    setChallenges(prev => prev.map(c => c.id === id ? { ...c, archived: false } : c))
    toast({ title: t("notif.challenge_restored"), description: t("challenge.restored_desc") })
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
      title: `${t("nav.challenges")} ${challenge.status === 'completed' ? t("common.status") : t("notif.task_completed")}!`,
      description: t("challenge.status_updated")
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
      color: "#64748b",
      icon: challenge.icon || "circle",
      completionRecords: (challenge.completionRecords || []).map(r => ({ date: r.date })),
    }
    const savedHabits = storage.load("habits", []) as any[]
    const isDuplicate = savedHabits.some(h => h.name.toLowerCase() === challenge.title.toLowerCase())
    if (isDuplicate) {
      toast({
        title: t("Cannot Convert"),
        description: t("A habit with this name already exists."),
        variant: "destructive"
      })
      return
    }
    storage.save("habits", [...savedHabits, newHabit])
    setChallenges(prev => prev.filter(c => c.id !== challenge.id))
    window.dispatchEvent(new CustomEvent("habitsUpdated", { detail: [...savedHabits, newHabit] }))
    toast({ title: t("challenge.converted_habit"), description: `"${challenge.title}" ${t("challenge.converted_habit")}` })
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-full sm:w-64">
                <Input
                  placeholder={t("nav.challenges") + "..."}
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
                    <SelectItem value="progress">{t("Progress")}</SelectItem>
                    <SelectItem value="name">{t("Title")}</SelectItem>
                    <SelectItem value="created">{t("Creation Date")}</SelectItem>
                    <SelectItem value="manual">{t("Manual")}</SelectItem>
                    <SelectItem value="archived">{t("common.archive")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex-shrink-0">
              <Button
                onClick={() => setShowCustomForm(true)}
                className="gap-2 rounded-lg shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span className="font-semibold">{t("Add Challenge")}</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showCustomForm} onOpenChange={setShowCustomForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("New Challenge")}</DialogTitle>
          </DialogHeader>
          <div className="pt-4">
            <ChallengeCreateForm
              onSubmit={addChallenge}
              onClose={() => setShowCustomForm(false)}
              challenges={challenges}
            />
          </div>
        </DialogContent>
      </Dialog>

      {activeChallenges.length > 0 && sortBy !== 'archived' ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("nav.challenges")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
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
                  challenges={challenges}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : sortBy !== 'archived' && (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t("challenge.none_active") || "No challenges yet."}</p>
          </CardContent>
        </Card>
      )}

      {sortBy === 'archived' && archivedChallenges.length > 0 && (
        <Card className="border-0 shadow-sm border-dashed border-2">
          <CardHeader>
            <CardTitle>{t("task.archived_title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {archivedChallenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  onCheckIn={checkInChallenge}
                  onDelete={deleteChallenge}
                  onArchive={archiveChallenge}
                  onUnarchive={unarchiveChallenge}
                  onToggleCompletion={toggleChallengeCompletion}
                  onConvertToHabit={convertChallengeToHabit}
                  onUpdate={updateChallenge}
                  challenges={challenges}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
