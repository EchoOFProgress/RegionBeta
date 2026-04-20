"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, TrendingUp, Palette, Target, FileText, CalendarDays } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Challenge, ChallengeGoalType } from "@/lib/challenges/types"
import { getTodayString, calculateEndDate } from "@/lib/challenges/utils"
import { cn } from "@/lib/utils"

interface Props {
  onSubmit: (challenge: Challenge) => void
  onClose: () => void
}

export function ChallengeCreateForm({ onSubmit, onClose }: Props) {
  const { toast } = useToast()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [showDescription, setShowDescription] = useState(false)
  const [duration, setDuration] = useState("7")
  const [startDate, setStartDate] = useState(getTodayString())
  const [showStartDate, setShowStartDate] = useState(false)
  const [goalType, setGoalType] = useState<ChallengeGoalType>("daily-completion")
  const [failureMode, setFailureMode] = useState<"hard" | "soft" | "retry-limit">("soft")
  const [maxFailures, setMaxFailures] = useState(3)
  const [difficulty, setDifficulty] = useState(3)
  const [showDifficulty, setShowDifficulty] = useState(false)
  const [color, setColor] = useState("#64748b")
  const [showColor, setShowColor] = useState(false)
  const [icon, setIcon] = useState("target")
  const [showIcon, setShowIcon] = useState(false)

  const handleSubmit = () => {
    if (!title.trim()) {
      toast({ title: "Error", description: "Please enter a challenge title", variant: "destructive" })
      return
    }
    if (!duration || parseInt(duration) <= 0) {
      toast({ title: "Error", description: "Please enter a valid duration", variant: "destructive" })
      return
    }
    const dur = parseInt(duration)
    const startDateStr = showStartDate ? startDate : getTodayString()
    const endDateStr = calculateEndDate(startDateStr, dur)
    onSubmit({
      id: Date.now().toString(),
      title,
      description: showDescription ? description : "",
      duration: dur,
      currentDay: 0,
      status: new Date(startDateStr) > new Date() ? "upcoming" : "active",
      startDate: startDateStr,
      endDate: endDateStr,
      lastCheckedIn: null,
      goalType,
      failureMode,
      maxFailures,
      currentFailures: 0,
      notes: {},
      difficulty: showDifficulty ? difficulty : 3,
      color: showColor ? color : "#64748b",
      icon: showIcon ? icon : "target",
      archived: false,
      dailyProgress: [],
      currentStreak: 0,
      bestStreak: 0,
      completionRecords: [],
    })
    toast({ title: "Challenge Created!", description: `Starts on ${startDateStr}` })
    onClose()
  }

  type PillDef = {
    key: string
    icon: React.ComponentType<{ className?: string }>
    label: string
    show: boolean
    toggle: () => void
  }

  const pills: PillDef[] = [
    { key: 'description', icon: FileText, label: 'Description', show: showDescription, toggle: () => setShowDescription(v => !v) },
    { key: 'startDate', icon: CalendarDays, label: 'Start Date', show: showStartDate, toggle: () => setShowStartDate(v => !v) },
    { key: 'difficulty', icon: TrendingUp, label: 'Difficulty', show: showDifficulty, toggle: () => setShowDifficulty(v => !v) },
    { key: 'color', icon: Palette, label: 'Color', show: showColor, toggle: () => setShowColor(v => !v) },
    { key: 'icon', icon: Target, label: 'Icon', show: showIcon, toggle: () => setShowIcon(v => !v) },
  ]

  const anyExpanded = pills.some(p => p.show)

  return (
    <div className="mt-4 space-y-5">

      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="challenge-title" className="text-sm font-medium">
          Challenge Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="challenge-title"
          placeholder="e.g., Morning Routine Master"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
      </div>

      {/* Duration */}
      <div className="space-y-1.5">
        <Label htmlFor="challenge-duration" className="text-sm font-medium">Duration (days)</Label>
        <Input
          id="challenge-duration"
          type="number"
          min="1"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
      </div>

      {/* Goal Type */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">Goal Type</Label>
        <Select value={goalType} onValueChange={(v) => setGoalType(v as ChallengeGoalType)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="daily-completion">Daily Completion</SelectItem>
            <SelectItem value="total-amount">Total Amount</SelectItem>
            <SelectItem value="checklist">Checklist</SelectItem>
            <SelectItem value="points">Points</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Failure Mode */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">Failure Mode</Label>
        <Select value={failureMode} onValueChange={(v) => setFailureMode(v as "hard" | "soft" | "retry-limit")}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="hard">Hard Mode — Challenge ends on first fail</SelectItem>
            <SelectItem value="soft">Soft Mode — Track failures only</SelectItem>
            <SelectItem value="retry-limit">Retry Limit — Max failures allowed</SelectItem>
          </SelectContent>
        </Select>
        {failureMode === "retry-limit" && (
          <div className="space-y-1 pt-1">
            <p className="text-xs text-muted-foreground">Maximum failures allowed</p>
            <Input
              type="number"
              min="1"
              value={maxFailures}
              onChange={(e) => setMaxFailures(parseInt(e.target.value) || 3)}
            />
          </div>
        )}
      </div>

      {/* Toggle pills */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
          Add options
        </p>
        <div className="flex flex-wrap gap-1.5">
          {pills.map(({ key, icon: Icon, label, show, toggle }) => (
            <button
              key={key}
              type="button"
              onClick={toggle}
              className={cn(
                "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-all cursor-pointer",
                show
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              )}
            >
              <Icon className="h-3 w-3" />
              {show ? "−" : "+"} {label}
            </button>
          ))}
        </div>
      </div>

      {/* Expanded sections */}
      {anyExpanded && (
        <div className="space-y-4 rounded-lg border border-border/60 p-4 bg-muted/20">

          {showDescription && (
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <FileText className="h-3.5 w-3.5" /> Description
              </Label>
              <Textarea
                placeholder="What's the goal of this challenge?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          )}

          {showStartDate && (
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" /> Start Date
              </Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
          )}

          {showDifficulty && (
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" /> Difficulty —{" "}
                <span className="text-foreground font-semibold">{difficulty}</span>
              </Label>
              <Input
                type="range" min="1" max="5"
                value={difficulty}
                onChange={(e) => setDifficulty(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Easy</span><span>Hard</span>
              </div>
            </div>
          )}

          {showColor && (
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Palette className="h-3.5 w-3.5" /> Color
              </Label>
              <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-9 px-1" />
            </div>
          )}

          {showIcon && (
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Target className="h-3.5 w-3.5" /> Icon
              </Label>
              <Select value={icon} onValueChange={setIcon}>
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

        </div>
      )}

      {/* Footer */}
      <Button onClick={handleSubmit} className="w-full">Create Challenge</Button>
    </div>
  )
}
