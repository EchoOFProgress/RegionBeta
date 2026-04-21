"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Trash2, Target, CheckCircle2, Circle, Calendar, Clock, Folder, Settings,
  Sparkles, Trophy, Flame, Flag, Plus, TrendingUp, Palette, FileText,
  Book, Dumbbell, Award, ArchiveRestore
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Challenge, ChallengeGoalType, DailyTask, Milestone } from "@/lib/challenges/types"
import {
  getProgressPercentage, getDaysUntilStart, getDaysRemaining, getStatusColor,
  getDailyPaceNeeded, getPaceStatus, getPaceColor, getPaceIcon, calculateEndDate
} from "@/lib/challenges/utils"
import { ChallengeAnalyticsModal } from "@/components/challenge-analytics-modal"
import { getPriorityColor, shouldGlow } from "@/lib/priority-colors"
import { useLanguage } from "@/lib/language-context"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"

interface Props {
  challenge: Challenge
  onCheckIn: (id: string, amount: number, note: string) => void
  onDelete: (id: string) => void
  onArchive: (id: string) => void
  onUnarchive?: (id: string) => void
  onToggleCompletion: (id: string) => void
  onConvertToHabit: (challenge: Challenge) => void
  onUpdate: (updated: Challenge) => void
  challenges?: Challenge[]
}

export function ChallengeCard({
  challenge, onCheckIn, onDelete, onArchive, onUnarchive, onToggleCompletion, onConvertToHabit, onUpdate, challenges = []
}: Props) {
  const { toast } = useToast()
  const { t } = useLanguage()
  const [note, setNote] = useState("")

  const [editTitle, setEditTitle] = useState(challenge.title)
  const [editDescription, setEditDescription] = useState(challenge.description)
  const [editDuration, setEditDuration] = useState(challenge.duration)
  const [editStartDate, setEditStartDate] = useState(challenge.startDate)
  const [editGoalType, setEditGoalType] = useState<ChallengeGoalType>(challenge.goalType)
  const [editDifficulty, setEditDifficulty] = useState(challenge.difficulty)
  const [editIcon, setEditIcon] = useState(challenge.icon || "target")
  const [showEditDescription, setShowEditDescription] = useState(challenge.description !== "")
  const [showEditStartDate, setShowEditStartDate] = useState(false)
  const [showEditDifficulty, setShowEditDifficulty] = useState(challenge.difficulty !== 3)
  const [showEditIcon, setShowEditIcon] = useState(challenge.icon !== "target")

  const priorityStyle: React.CSSProperties = (() => {
    const color = getPriorityColor(50, 'challenges')
    const glow = shouldGlow(50, 'challenges')
    if (!color) return {}
    return { border: `2px solid ${color}`, ...(glow ? { boxShadow: `0 0 8px ${color}` } : {}) }
  })()

  const saveEdits = () => {
    if (!editTitle.trim()) return
    const isDuplicate = challenges.some(c => c.id !== challenge.id && c.title.toLowerCase() === editTitle.trim().toLowerCase())
    if (isDuplicate) {
      toast({
        title: "Duplicate Title",
        description: "Another challenge with this title already exists.",
        variant: "destructive"
      })
      return
    }
    const startDate = showEditStartDate ? editStartDate : challenge.startDate
    const endDate = calculateEndDate(startDate, editDuration)
    onUpdate({
      ...challenge,
      title: editTitle,
      description: showEditDescription ? editDescription : "",
      goalType: editGoalType,
      difficulty: showEditDifficulty ? editDifficulty : challenge.difficulty,
      icon: showEditIcon ? editIcon : challenge.icon,
      duration: editDuration,
      startDate,
      endDate,
    })
    toast({ title: "Challenge Updated!", description: "Your challenge has been successfully updated" })
  }

  const addMilestone = (title: string, targetValue: number = 0) => {
    const m: Milestone = { id: Date.now().toString(), title, description: "", targetValue, currentValue: 0, achieved: false, color: "#3b82f6" }
    onUpdate({ ...challenge, milestones: [...(challenge.milestones || []), m] })
    toast({ title: "Milestone Added", description: `"${title}" has been added.` })
  }

  const updateMilestoneValue = (milestoneId: string, value: number) => {
    onUpdate({
      ...challenge,
      milestones: challenge.milestones?.map(m => m.id === milestoneId
        ? { ...m, currentValue: value, achieved: m.targetValue > 0 ? value >= m.targetValue : m.achieved }
        : m
      )
    })
  }

  const toggleMilestone = (milestoneId: string, achieved: boolean) => {
    onUpdate({
      ...challenge,
      milestones: challenge.milestones?.map(m => m.id === milestoneId
        ? { ...m, achieved, achievedDate: achieved ? new Date().toISOString().split("T")[0] : undefined, currentValue: achieved && m.targetValue > 0 ? m.targetValue : m.currentValue }
        : m
      )
    })
  }

  const deleteMilestone = (milestoneId: string) => {
    onUpdate({ ...challenge, milestones: challenge.milestones?.filter(m => m.id !== milestoneId) })
    toast({ title: "Milestone Deleted", description: "The milestone has been removed." })
  }

  const addDailyTask = (taskText: string) => {
    if (challenge.goalType !== "checklist") return
    const newTask: DailyTask = {
      day: challenge.dailyTasks?.length ? Math.max(...challenge.dailyTasks.map(t => t.day)) + 1 : 1,
      task: taskText, done: false
    }
    onUpdate({ ...challenge, dailyTasks: [...(challenge.dailyTasks || []), newTask] })
  }

  const toggleDailyTask = (index: number) => {
    if (!challenge.dailyTasks) return
    const tasks = [...challenge.dailyTasks]
    tasks[index] = { ...tasks[index], done: !tasks[index].done }
    onUpdate({ ...challenge, dailyTasks: tasks })
  }

  const removeDailyTask = (index: number) => {
    if (!challenge.dailyTasks) return
    const tasks = [...challenge.dailyTasks]
    tasks.splice(index, 1)
    onUpdate({ ...challenge, dailyTasks: tasks })
  }

  const ChallengeIcon = () => {
    if (challenge.icon === "book") return <Book className="h-4 w-4" />
    if (challenge.icon === "dumbbell") return <Dumbbell className="h-4 w-4" />
    if (challenge.icon === "calendar") return <Calendar className="h-4 w-4" />
    if (challenge.icon === "award") return <Award className="h-4 w-4" />
    if (challenge.icon === "trending-up") return <TrendingUp className="h-4 w-4" />
    return <Target className="h-4 w-4" />
  }

  return (
    <div
      className={`p-4 rounded-lg border transition-all ${challenge.status === "completed" ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-accent/50"}`}
      style={priorityStyle}
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        {/* Left Side: Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 
              className={`font-semibold flex items-center gap-2 cursor-pointer hover:text-primary transition-colors ${challenge.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}
              onClick={() => onToggleCompletion(challenge.id)}
            >
              <ChallengeIcon />{challenge.title}
            </h3>
            <Badge className={getStatusColor(challenge.status)}>
              {t(challenge.status.charAt(0).toUpperCase() + challenge.status.slice(1))}
            </Badge>
          </div>
          
          {challenge.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{challenge.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 pt-3 border-t border-border">
            {challenge.difficulty > 3 && (
              <>
                <div className="flex text-[10px]">
                  {Array(challenge.difficulty).fill(0).map((_, i) => <span key={i}>⭐</span>)}
                </div>
                <span className="text-border text-xs select-none">·</span>
              </>
            )}

            {challenge.status === "upcoming" ? (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm font-semibold">{t("Starts in:")} {getDaysUntilStart(challenge)} {t("days")}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">{getDaysRemaining(challenge)}</span>
                <span className="text-xs text-muted-foreground">{t("days left")}</span>
              </div>
            )}

            {challenge.status === "active" && (
              <>
                <span className="text-border text-xs select-none">·</span>
                <div className={`flex items-center gap-1 ${getPaceColor(challenge)}`}>
                  <span className="mb-[1px]">{getPaceIcon(challenge)}</span>
                  <span className="text-sm font-semibold">{t(getPaceStatus(challenge))}</span>
                  <span className="text-xs text-muted-foreground">{t("pace")}</span>
                </div>
              </>
            )}

            {challenge.currentStreak && challenge.currentStreak > 0 ? (
              <>
                <span className="text-border text-xs select-none">·</span>
                <div className="flex items-center gap-1.5">
                  <Flame className="h-3 w-3 text-primary" />
                  <span className="text-sm font-semibold text-foreground">{challenge.currentStreak}</span>
                  <span className="text-xs text-muted-foreground">{t("streak")}</span>
                </div>
              </>
            ) : null}
          </div>

          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>
                {/* Progress details like HabitCard */}
                {challenge.goalType !== 'checklist' && challenge.goalType !== 'points' && challenge.dailyTasks === undefined && (() => {
                   const pace = getDailyPaceNeeded(challenge)
                   return `${pace.actualProgress.toFixed(1)} / ${(pace.dailyTarget * challenge.duration).toFixed(1)}`
                })()}
              </span>
              <span>{getProgressPercentage(challenge)}%</span>
            </div>
            <Progress value={getProgressPercentage(challenge)} className="h-2" />
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex gap-1 justify-end w-full">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="simple-icon-btn"><Sparkles className="h-4 w-4" /></Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden">
                <div className="sr-only">Challenge Analytics</div>
                <ChallengeAnalyticsModal challenge={challenge} onConvertToHabit={onConvertToHabit} />
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title="Edit Challenge" className="simple-icon-btn"><Settings className="h-4 w-4" /></Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Edit Challenge</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Challenge Title</Label>
                    <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id={`edit-desc-${challenge.id}`} checked={showEditDescription} onCheckedChange={(c) => setShowEditDescription(c as boolean)} />
                    <Label htmlFor={`edit-desc-${challenge.id}`} className="flex items-center gap-2"><FileText className="h-4 w-4" />Add Description</Label>
                  </div>
                  {showEditDescription && (
                    <div className="space-y-2 ml-6">
                      <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} />
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Duration (days)</Label>
                      <Input type="number" min="1" value={editDuration} onChange={(e) => setEditDuration(parseInt(e.target.value) || 7)} />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id={`edit-date-${challenge.id}`} checked={showEditStartDate} onCheckedChange={(c) => setShowEditStartDate(c as boolean)} />
                      <Label htmlFor={`edit-date-${challenge.id}`} className="flex items-center gap-2"><Calendar className="h-4 w-4" />Set Start Date</Label>
                    </div>
                    {showEditStartDate && (
                      <div className="space-y-2">
                        <Input type="date" value={editStartDate} onChange={(e) => setEditStartDate(e.target.value)} />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Goal Type</Label>
                    <Select value={editGoalType} onValueChange={(v) => setEditGoalType(v as ChallengeGoalType)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily-completion">Daily Completion</SelectItem>
                        <SelectItem value="total-amount">Total Amount</SelectItem>
                        <SelectItem value="checklist">Checklist</SelectItem>
                        <SelectItem value="points">Points</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id={`edit-diff-${challenge.id}`} checked={showEditDifficulty} onCheckedChange={(c) => setShowEditDifficulty(c as boolean)} />
                    <Label htmlFor={`edit-diff-${challenge.id}`} className="flex items-center gap-2"><TrendingUp className="h-4 w-4" />Set Difficulty</Label>
                  </div>
                  {showEditDifficulty && (
                    <div className="space-y-2 ml-6">
                      <Input type="range" min="1" max="5" value={editDifficulty} onChange={(e) => setEditDifficulty(parseInt(e.target.value))} />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Easy</span><span className="font-medium">{editDifficulty}</span><span>Hard</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Checkbox id={`edit-icon-${challenge.id}`} checked={showEditIcon} onCheckedChange={(c) => setShowEditIcon(c as boolean)} />
                    <Label htmlFor={`edit-icon-${challenge.id}`} className="flex items-center gap-2"><Target className="h-4 w-4" />Set Icon</Label>
                  </div>
                  {showEditIcon && (
                    <div className="space-y-2 ml-6">
                      <Select value={editIcon} onValueChange={setEditIcon}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="target">Target</SelectItem>
                          <SelectItem value="book">Book</SelectItem>
                          <SelectItem value="dumbbell">Dumbbell</SelectItem>
                          <SelectItem value="calendar">Calendar</SelectItem>
                          <SelectItem value="award">Award</SelectItem>
                          <SelectItem value="trending-up">Trending Up</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <Button onClick={saveEdits} className="w-full">Save Changes</Button>
                </div>
              </DialogContent>
            </Dialog>

            {onUnarchive ? (
              <Button variant="ghost" size="icon" onClick={() => onUnarchive(challenge.id)} title="Restore Challenge" className="simple-icon-btn">
                <ArchiveRestore className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => onArchive(challenge.id)} title="Archive Challenge" className="simple-icon-btn">
                <Folder className="h-4 w-4" />
              </Button>
            )}
            
            <DeleteConfirmationDialog onConfirm={() => onDelete(challenge.id)}>
              <Button variant="ghost" size="icon" className="simple-icon-btn">
                <Trash2 className="h-4 w-4" />
              </Button>
            </DeleteConfirmationDialog>
          </div>

          {challenge.status === "active" && (
            <div className="flex items-center gap-2 mt-2 w-full">
              <Input 
                placeholder="Add a note..." 
                value={note} 
                onChange={(e) => setNote(e.target.value)} 
                className="w-24 text-sm" 
                onClick={(e) => e.stopPropagation()} 
              />
              <Button 
                variant={challenge.lastCheckedIn === new Date().toISOString().split('T')[0] ? "secondary" : "default"}
                size="sm" 
                onClick={() => onCheckIn(challenge.id, 1, note)}
                disabled={challenge.lastCheckedIn === new Date().toISOString().split('T')[0] && challenge.goalType !== "total-amount"}
              >
                {challenge.lastCheckedIn === new Date().toISOString().split('T')[0] ? "Checked In" : "Check In"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
