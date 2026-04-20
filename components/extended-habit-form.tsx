"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CalendarIcon, TagIcon, FileText, Shapes, Repeat, Target, Bell, RotateCcw, Palette, Clock, Zap, Smile } from "lucide-react"
import { cn } from "@/lib/utils"
import { getUserPreferences, saveUserPreferences } from "@/lib/user-preferences"

type HabitType = "boolean" | "numeric" | "checklist"
type FrequencyType = "daily" | "weekly" | "monthly" | "custom"
type GoalMode = "at-least" | "less-than" | "exactly" | "any"
type NumericCondition = "at-least" | "less-than" | "exactly"

interface ExtendedHabitFormProps {
  onSubmit: (habit: {
    name: string
    description: string
    type: HabitType
    numericCondition?: NumericCondition
    numericTarget?: number
    reminders: string[]
    frequency: FrequencyType
    customDays: number[]
    resetSchedule: "daily" | "weekly" | "monthly"
    color: string
    icon: string
    timeWindow?: { from: string; to: string }
    trackEnergyLevel?: boolean
    trackMood?: boolean
  }) => void
  onCancel: () => void
}

export function ExtendedHabitForm({ onSubmit, onCancel }: ExtendedHabitFormProps) {
  const [name, setName] = useState("")
  const [showDescription, setShowDescription] = useState(false)
  const [description, setDescription] = useState("")
  const [showType, setShowType] = useState(false)
  const [type, setType] = useState<HabitType>("boolean")
  const [showNumeric, setShowNumeric] = useState(false)
  const [numericCondition, setNumericCondition] = useState<NumericCondition>("at-least")
  const [numericTarget, setNumericTarget] = useState(1)
  const [showReminders, setShowReminders] = useState(false)
  const [reminders, setReminders] = useState<string[]>([])
  const [newReminderTime, setNewReminderTime] = useState("")
  const [showFrequency, setShowFrequency] = useState(false)
  const [frequency, setFrequency] = useState<FrequencyType>("daily")
  const [customDays, setCustomDays] = useState<number[]>([])
  const [showResetSchedule, setShowResetSchedule] = useState(false)
  const [resetSchedule, setResetSchedule] = useState<"daily" | "weekly" | "monthly">("daily")
  const [showColor, setShowColor] = useState(false)
  const [color, setColor] = useState("#64748b")
  const [showIcon, setShowIcon] = useState(false)
  const [icon, setIcon] = useState("circle")
  const [showTimeWindow, setShowTimeWindow] = useState(false)
  const [timeWindowFrom, setTimeWindowFrom] = useState("")
  const [timeWindowTo, setTimeWindowTo] = useState("")
  const [showGoal, setShowGoal] = useState(false)
  const [goalMode, setGoalMode] = useState<GoalMode>("at-least")
  const [goalValue, setGoalValue] = useState(1)
  const [showCustomDays, setShowCustomDays] = useState(false)
  const [showVisualSettings, setShowVisualSettings] = useState(false)
  const [showStatistics, setShowStatistics] = useState(false)
  const [showEnergyLevel, setShowEnergyLevel] = useState(false)
  const [showMoodTracking, setShowMoodTracking] = useState(false)

  useEffect(() => {
    const prefs = getUserPreferences()
    prefs.extendedHabitForm.showDescription = showDescription
    prefs.extendedHabitForm.showType = showType
    prefs.extendedHabitForm.showNumeric = showNumeric
    prefs.extendedHabitForm.showReminders = showReminders
    prefs.extendedHabitForm.showFrequency = showFrequency
    prefs.extendedHabitForm.showResetSchedule = showResetSchedule
    prefs.extendedHabitForm.showColor = showColor
    prefs.extendedHabitForm.showIcon = showIcon
    prefs.extendedHabitForm.showTimeWindow = showTimeWindow
    prefs.extendedHabitForm.showGoal = showGoal
    prefs.extendedHabitForm.showCustomDays = showCustomDays
    prefs.extendedHabitForm.showVisualSettings = showVisualSettings
    prefs.extendedHabitForm.showStatistics = showStatistics
    prefs.extendedHabitForm.showEnergyLevel = showEnergyLevel
    prefs.extendedHabitForm.showMoodTracking = showMoodTracking
    saveUserPreferences(prefs)
  }, [showDescription, showType, showNumeric, showReminders, showFrequency,
      showResetSchedule, showColor, showIcon, showTimeWindow, showGoal,
      showCustomDays, showVisualSettings, showStatistics, showEnergyLevel, showMoodTracking])

  const toggleCustomDay = (day: number) => {
    setCustomDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    )
  }

  const handleSubmit = () => {
    if (!name.trim()) return
    onSubmit({
      name,
      description: showDescription ? description : "",
      type: showType ? type : "boolean",
      numericCondition: showType && type === "numeric" && showNumeric ? numericCondition : undefined,
      numericTarget: showType && type === "numeric" && showNumeric ? numericTarget : undefined,
      reminders: showReminders ? reminders : [],
      frequency: showFrequency ? frequency : "daily",
      customDays: showFrequency && frequency === "custom" && showCustomDays ? customDays : [],
      resetSchedule: showResetSchedule ? resetSchedule : "daily",
      color: showVisualSettings ? color : "#64748b",
      icon: showVisualSettings ? icon : "circle",
      timeWindow: showTimeWindow && timeWindowFrom && timeWindowTo
        ? { from: timeWindowFrom, to: timeWindowTo }
        : undefined,
      trackEnergyLevel: showEnergyLevel,
      trackMood: showMoodTracking
    })
  }

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  type PillDef = {
    key: string
    icon: React.ComponentType<{ className?: string }>
    label: string
    show: boolean
    toggle: () => void
  }

  const pills: PillDef[] = [
    { key: 'description', icon: FileText, label: 'Description', show: showDescription, toggle: () => setShowDescription(v => !v) },
    { key: 'type', icon: Shapes, label: 'Habit Type', show: showType, toggle: () => setShowType(v => !v) },
    { key: 'frequency', icon: Repeat, label: 'Frequency', show: showFrequency, toggle: () => setShowFrequency(v => !v) },
    { key: 'reminders', icon: Bell, label: 'Reminders', show: showReminders, toggle: () => setShowReminders(v => !v) },
    { key: 'reset', icon: RotateCcw, label: 'Reset Schedule', show: showResetSchedule, toggle: () => setShowResetSchedule(v => !v) },
    { key: 'visual', icon: Palette, label: 'Color & Icon', show: showVisualSettings, toggle: () => setShowVisualSettings(v => !v) },
    { key: 'timeWindow', icon: Clock, label: 'Time Window', show: showTimeWindow, toggle: () => setShowTimeWindow(v => !v) },
    { key: 'energy', icon: Zap, label: 'Track Energy', show: showEnergyLevel, toggle: () => setShowEnergyLevel(v => !v) },
    { key: 'mood', icon: Smile, label: 'Track Mood', show: showMoodTracking, toggle: () => setShowMoodTracking(v => !v) },
  ]

  const anyExpanded = pills.some(p => p.show)

  return (
    <div className="space-y-5">

      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="habit-name" className="text-sm font-medium">
          Habit Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="habit-name"
          placeholder="e.g., Morning meditation, Read 30 minutes..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
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
                placeholder="Add details about this habit..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          )}

          {showType && (
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Shapes className="h-3.5 w-3.5" /> Habit Type
              </Label>
              <RadioGroup value={type} onValueChange={(v) => setType(v as HabitType)} className="space-y-1.5">
                {[
                  { value: "boolean", label: "Done / Not Done" },
                  { value: "numeric", label: "Numeric Goal (e.g. 30 min)" },
                  { value: "checklist", label: "Checklist (multiple items)" },
                ].map(opt => (
                  <div key={opt.value} className="flex items-center gap-2">
                    <RadioGroupItem value={opt.value} id={`type-${opt.value}`} />
                    <Label htmlFor={`type-${opt.value}`} className="text-sm font-normal cursor-pointer">
                      {opt.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {type === "numeric" && (
                <div className="mt-2 pt-2 border-t border-border/40 space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowGoal(v => !v)}
                    className={cn(
                      "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-all cursor-pointer",
                      showGoal
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                    )}
                  >
                    <Target className="h-3 w-3" />
                    {showGoal ? "−" : "+"} Goal Tracking
                  </button>

                  {showGoal && (
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Goal Mode</p>
                        <Select value={goalMode} onValueChange={(v) => setGoalMode(v as GoalMode)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="at-least">At least</SelectItem>
                            <SelectItem value="less-than">Less than</SelectItem>
                            <SelectItem value="exactly">Exactly</SelectItem>
                            <SelectItem value="any">Any value</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Target Value</p>
                        <Input
                          type="number" min="1"
                          value={goalValue}
                          onChange={(e) => setGoalValue(Number(e.target.value))}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {showFrequency && (
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Repeat className="h-3.5 w-3.5" /> Frequency
              </Label>
              <RadioGroup value={frequency} onValueChange={(v) => setFrequency(v as FrequencyType)} className="space-y-1.5">
                {["daily", "weekly", "monthly", "custom"].map(f => (
                  <div key={f} className="flex items-center gap-2">
                    <RadioGroupItem value={f} id={`freq-${f}`} />
                    <Label htmlFor={`freq-${f}`} className="text-sm font-normal capitalize cursor-pointer">{f}</Label>
                  </div>
                ))}
              </RadioGroup>

              {frequency === "custom" && (
                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowCustomDays(v => !v)}
                    className={cn(
                      "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-all cursor-pointer",
                      showCustomDays
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                    )}
                  >
                    {showCustomDays ? "−" : "+"} Select Days
                  </button>
                  {showCustomDays && (
                    <div className="flex gap-1.5 flex-wrap">
                      {dayLabels.map((day, i) => (
                        <Button
                          key={day}
                          type="button"
                          variant={customDays.includes(i) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleCustomDay(i)}
                          className="w-10 h-8 p-0 text-xs"
                        >
                          {day}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {showReminders && (
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Bell className="h-3.5 w-3.5" /> Reminders
              </Label>
              <div className="flex gap-2">
                <Input
                  type="time"
                  value={newReminderTime}
                  onChange={(e) => setNewReminderTime(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (newReminderTime) { setReminders([...reminders, newReminderTime]); setNewReminderTime("") }
                  }}
                >
                  Add
                </Button>
              </div>
              {reminders.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {reminders.map((time, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground rounded-full px-2.5 py-0.5 text-xs"
                    >
                      {time}
                      <button
                        type="button"
                        onClick={() => setReminders(reminders.filter((_, idx) => idx !== i))}
                        className="hover:text-destructive ml-0.5 leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {showResetSchedule && (
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <RotateCcw className="h-3.5 w-3.5" /> Reset Schedule
              </Label>
              <RadioGroup
                value={resetSchedule}
                onValueChange={(v) => setResetSchedule(v as "daily" | "weekly" | "monthly")}
                className="space-y-1.5"
              >
                {["daily", "weekly", "monthly"].map(s => (
                  <div key={s} className="flex items-center gap-2">
                    <RadioGroupItem value={s} id={`reset-${s}`} />
                    <Label htmlFor={`reset-${s}`} className="text-sm font-normal capitalize cursor-pointer">{s}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {showVisualSettings && (
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Palette className="h-3.5 w-3.5" /> Color & Icon
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Color</p>
                  <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-9 px-1" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Icon</p>
                  <Select value={icon} onValueChange={setIcon}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["circle","star","heart","book","dumbbell","droplets","pen-tool","sun","moon"].map(i => (
                        <SelectItem key={i} value={i} className="capitalize">{i}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {showTimeWindow && (
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Clock className="h-3.5 w-3.5" /> Time Window
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">From</p>
                  <Input type="time" value={timeWindowFrom} onChange={(e) => setTimeWindowFrom(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">To</p>
                  <Input type="time" value={timeWindowTo} onChange={(e) => setTimeWindowTo(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {showEnergyLevel && (
            <div className="flex items-center gap-2 py-1">
              <Zap className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm">Track Energy Level (1–10) after each completion</span>
            </div>
          )}

          {showMoodTracking && (
            <div className="flex items-center gap-2 py-1">
              <Smile className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm">Track Mood (1–5) after each completion</span>
            </div>
          )}

        </div>
      )}

      {/* Footer */}
      <div className="flex justify-end gap-2 pt-2 border-t">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={!name.trim()}>Create Habit</Button>
      </div>
    </div>
  )
}
