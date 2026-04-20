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
  Book, Dumbbell, Award
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Challenge, ChallengeGoalType, DailyTask, Milestone } from "@/lib/challenges/types"
import {
  getProgressPercentage, getDaysUntilStart, getDaysRemaining, getStatusColor,
  getDailyPaceNeeded, getPaceStatus, getPaceColor, getPaceIcon, calculateEndDate
} from "@/lib/challenges/utils"
import { ChallengeAnalyticsModal } from "@/components/challenge-analytics-modal"
import { getPriorityColor, shouldGlow } from "@/lib/priority-colors"

interface Props {
  challenge: Challenge
  onCheckIn: (id: string, energy: number, note: string) => void
  onDelete: (id: string) => void
  onArchive: (id: string) => void
  onToggleCompletion: (id: string) => void
  onConvertToHabit: (challenge: Challenge) => void
  onUpdate: (updated: Challenge) => void
}

export function ChallengeCard({
  challenge, onCheckIn, onDelete, onArchive, onToggleCompletion, onConvertToHabit, onUpdate
}: Props) {
  const { toast } = useToast()
  const [energyLevel, setEnergyLevel] = useState(5)
  const [note, setNote] = useState("")

  const [editTitle, setEditTitle] = useState(challenge.title)
  const [editDescription, setEditDescription] = useState(challenge.description)
  const [editDuration, setEditDuration] = useState(challenge.duration)
  const [editStartDate, setEditStartDate] = useState(challenge.startDate)
  const [editGoalType, setEditGoalType] = useState<ChallengeGoalType>(challenge.goalType)
  const [editFailureMode, setEditFailureMode] = useState(challenge.failureMode)
  const [editMaxFailures, setEditMaxFailures] = useState(challenge.maxFailures || 3)
  const [editDifficulty, setEditDifficulty] = useState(challenge.difficulty)
  const [editColor, setEditColor] = useState(challenge.color || "#64748b")
  const [editIcon, setEditIcon] = useState(challenge.icon || "target")
  const [showEditDescription, setShowEditDescription] = useState(challenge.description !== "")
  const [showEditStartDate, setShowEditStartDate] = useState(false)
  const [showEditDifficulty, setShowEditDifficulty] = useState(challenge.difficulty !== 3)
  const [showEditColor, setShowEditColor] = useState(challenge.color !== "#64748b")
  const [showEditIcon, setShowEditIcon] = useState(challenge.icon !== "target")

  const priorityStyle: React.CSSProperties = (() => {
    const color = getPriorityColor(50, 'challenges')
    const glow = shouldGlow(50, 'challenges')
    if (!color) return {}
    return { border: `2px solid ${color}`, ...(glow ? { boxShadow: `0 0 8px ${color}` } : {}) }
  })()

  const saveEdits = () => {
    const startDate = showEditStartDate ? editStartDate : challenge.startDate
    const endDate = calculateEndDate(startDate, editDuration)
    onUpdate({
      ...challenge,
      title: editTitle,
      description: showEditDescription ? editDescription : "",
      goalType: editGoalType,
      failureMode: editFailureMode,
      maxFailures: editMaxFailures,
      difficulty: showEditDifficulty ? editDifficulty : challenge.difficulty,
      color: showEditColor ? editColor : challenge.color,
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

  const toggleMilestone = (milestoneId: string, achieved: boolean) => {
    onUpdate({
      ...challenge,
      milestones: challenge.milestones?.map(m => m.id === milestoneId
        ? { ...m, achieved, achievedDate: achieved ? new Date().toISOString().split("T")[0] : undefined }
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
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow" style={priorityStyle}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-start gap-2">
          <button onClick={() => onToggleCompletion(challenge.id)} className="flex-shrink-0 mt-1 text-muted-foreground hover:text-primary">
            {challenge.status === "completed" ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Circle className="h-5 w-5" />}
          </button>
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <ChallengeIcon />{challenge.title}
            </h3>
            <p className="text-sm text-muted-foreground">{challenge.description}</p>
          </div>
        </div>
        <Badge className={getStatusColor(challenge.status)}>
          {challenge.status.charAt(0).toUpperCase() + challenge.status.slice(1)}
        </Badge>
      </div>

      {challenge.difficulty > 3 && (
        <div className="flex flex-wrap gap-1 mb-3">
          <Badge variant="outline" className="text-xs">
            {Array(challenge.difficulty).fill(0).map((_, i) => <span key={i}>⭐</span>)}
          </Badge>
        </div>
      )}

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {challenge.status === "upcoming" ? (
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />Starts in: {getDaysUntilStart(challenge)} days
            </Badge>
          ) : (
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />{getDaysRemaining(challenge)} days remaining
            </Badge>
          )}
        </div>
        {challenge.status === "active" && (
          <Badge variant="outline" className={`flex items-center gap-1 ${getPaceColor(challenge)}`}>
            <span>{getPaceIcon(challenge)}</span>
            <span>{getPaceStatus(challenge)}</span>
          </Badge>
        )}
      </div>

      {challenge.status === "active" && (
        <div className="text-xs text-muted-foreground mb-2">
          <div className="flex justify-between">
            <span>Daily Pace:</span>
            <span className={getPaceColor(challenge)}>{getPaceStatus(challenge)}</span>
          </div>
          {(() => {
            const pace = getDailyPaceNeeded(challenge)
            return (
              <div className="grid grid-cols-2 gap-1">
                <span>Target: {pace.dailyTarget.toFixed(1)}/day</span>
                <span>Expected: {pace.expectedCompleted.toFixed(1)}</span>
                <span>Actual: {pace.actualProgress.toFixed(1)}</span>
                <span className={pace.daysBehind > 0 ? 'text-red-600' : 'text-green-600'}>
                  {pace.daysBehind > 0 ? `Behind: ${pace.daysBehind.toFixed(1)}` : `Ahead: ${pace.daysAhead.toFixed(1)}`}
                </span>
              </div>
            )
          })()}
        </div>
      )}

      {challenge.currentStreak && challenge.currentStreak > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-xs flex items-center gap-1">
            <Flame className="h-3 w-3" />Current Streak: {challenge.currentStreak} days
          </Badge>
          {challenge.bestStreak && challenge.bestStreak > 0 && challenge.bestStreak !== challenge.currentStreak && (
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <Trophy className="h-3 w-3" />Best: {challenge.bestStreak} days
            </Badge>
          )}
        </div>
      )}

      {/* Milestones */}
      <div className="mt-4 pt-4 border-t space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Flag className="h-3 w-3" />Milestones
          </h4>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0"><Plus className="h-3 w-3" /></Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Add Milestone</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input id={`ms-title-${challenge.id}`} placeholder="e.g., Reach 50% progress" />
                </div>
                <div className="space-y-2">
                  <Label>Target Value (optional)</Label>
                  <Input id={`ms-target-${challenge.id}`} type="number" placeholder="0" />
                </div>
                <Button className="w-full" onClick={() => {
                  const title = (document.getElementById(`ms-title-${challenge.id}`) as HTMLInputElement)?.value
                  const target = parseFloat((document.getElementById(`ms-target-${challenge.id}`) as HTMLInputElement)?.value) || 0
                  if (title) addMilestone(title, target)
                }}>Add Milestone</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="space-y-1">
          {challenge.milestones?.map((m) => (
            <div key={m.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-2 flex-1">
                <Checkbox checked={m.achieved} onCheckedChange={(checked) => toggleMilestone(m.id, checked as boolean)} className="h-3.5 w-3.5" />
                <span className={`text-xs ${m.achieved ? 'line-through text-muted-foreground' : ''}`}>{m.title}</span>
                {m.targetValue > 0 && <Badge variant="outline" className="text-[10px] h-4 px-1">goal: {m.targetValue}</Badge>}
              </div>
              <Button variant="ghost" size="sm" className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteMilestone(m.id)}>
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            </div>
          ))}
          {(!challenge.milestones || challenge.milestones.length === 0) && (
            <p className="text-[10px] text-muted-foreground italic">No milestones set</p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-1 mt-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon"><Sparkles className="h-4 w-4" /></Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden">
            <div className="sr-only">Challenge Analytics</div>
            <ChallengeAnalyticsModal challenge={challenge} onConvertToHabit={onConvertToHabit} />
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" title="Edit Challenge"><Settings className="h-4 w-4" /></Button>
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
              <div className="space-y-2">
                <Label>Failure Mode</Label>
                <Select value={editFailureMode} onValueChange={(v) => setEditFailureMode(v as "hard" | "soft" | "retry-limit")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hard">Hard Mode</SelectItem>
                    <SelectItem value="soft">Soft Mode</SelectItem>
                    <SelectItem value="retry-limit">Retry Limit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editFailureMode === "retry-limit" && (
                <div className="space-y-2">
                  <Label>Maximum Failures Allowed</Label>
                  <Input type="number" min="1" value={editMaxFailures} onChange={(e) => setEditMaxFailures(parseInt(e.target.value) || 3)} />
                </div>
              )}
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
                <Checkbox id={`edit-color-${challenge.id}`} checked={showEditColor} onCheckedChange={(c) => setShowEditColor(c as boolean)} />
                <Label htmlFor={`edit-color-${challenge.id}`} className="flex items-center gap-2"><Palette className="h-4 w-4" />Set Color</Label>
              </div>
              {showEditColor && (
                <div className="space-y-2 ml-6">
                  <Input type="color" value={editColor} onChange={(e) => setEditColor(e.target.value)} />
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

        {challenge.status === "active" && (
          <div className="space-y-2">
            <Button variant="ghost" size="icon" onClick={() => onCheckIn(challenge.id, energyLevel, note)} title="Check In">
              <CheckCircle2 className="h-4 w-4" />
            </Button>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <span>Energy: {energyLevel}/10</span>
            </div>
            <div className="flex gap-1">
              {[1,2,3,4,5,6,7,8,9,10].map(l => (
                <button key={l}
                  className={`w-6 h-6 rounded-sm text-xs ${energyLevel === l ? 'bg-primary text-primary-foreground' : 'border'}`}
                  onClick={(e) => { e.stopPropagation(); setEnergyLevel(l) }}
                >{l}</button>
              ))}
            </div>
            <Input placeholder="Note..." value={note} onChange={(e) => setNote(e.target.value)} className="text-xs" onClick={(e) => e.stopPropagation()} />
          </div>
        )}

        <Button variant="ghost" size="icon" onClick={() => onArchive(challenge.id)} title="Archive Challenge">
          <Folder className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(challenge.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="mb-3 mt-2">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Progress</span><span>{getProgressPercentage(challenge)}%</span>
        </div>
        <Progress value={getProgressPercentage(challenge)} className="h-2" />
      </div>

      {challenge.goalType === "checklist" && challenge.dailyTasks && challenge.dailyTasks.length > 0 && (
        <div className="mt-3 space-y-2">
          <h4 className="font-medium text-sm">Daily Tasks</h4>
          {challenge.dailyTasks.map((task, index) => (
            <div key={index} className="flex items-center gap-2">
              <input type="checkbox" checked={task.done} onChange={() => toggleDailyTask(index)} className="h-4 w-4" />
              <span className={`flex-1 text-sm ${task.done ? "line-through text-muted-foreground" : ""}`}>{task.task}</span>
              <Button variant="ghost" size="icon" onClick={() => removeDailyTask(index)}><Trash2 className="h-3 w-3" /></Button>
            </div>
          ))}
        </div>
      )}

      {challenge.goalType === "checklist" && (
        <div className="mt-3 flex gap-2">
          <Input
            type="text"
            placeholder="Add daily task..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.currentTarget.value.trim()) {
                addDailyTask(e.currentTarget.value); e.currentTarget.value = ""
              }
            }}
          />
          <Button size="sm" onClick={(e) => {
            const input = e.currentTarget.previousElementSibling as HTMLInputElement
            if (input?.value.trim()) { addDailyTask(input.value); input.value = "" }
          }}>Add</Button>
        </div>
      )}
    </div>
  )
}
