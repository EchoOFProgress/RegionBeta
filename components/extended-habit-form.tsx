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
import { useLanguage } from "@/lib/language-context"
import { useToast } from "@/hooks/use-toast"

type HabitType = "boolean" | "numeric"
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
  }) => void
  onCancel: () => void
  habits?: { id: string; name: string }[]
}

export function ExtendedHabitForm({ onSubmit, onCancel, habits = [] }: ExtendedHabitFormProps) {
  const { toast } = useToast()
  const { t } = useLanguage()
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
  const [showCustomDays, setShowCustomDays] = useState(false)
  const [showVisualSettings, setShowVisualSettings] = useState(false)
  const [showStatistics, setShowStatistics] = useState(false)

  useEffect(() => {
    const prefs = getUserPreferences()
    prefs.extendedHabitForm.showDescription = showDescription
    prefs.extendedHabitForm.showType = showType
    prefs.extendedHabitForm.showNumeric = showNumeric
    prefs.extendedHabitForm.showReminders = showReminders
    prefs.extendedHabitForm.showFrequency = showFrequency
    prefs.extendedHabitForm.showCustomDays = showCustomDays
    prefs.extendedHabitForm.showVisualSettings = showVisualSettings
    prefs.extendedHabitForm.showStatistics = showStatistics
    saveUserPreferences(prefs)
  }, [showDescription, showType, showNumeric, showReminders, showFrequency,
      showCustomDays, showVisualSettings, showStatistics])

  const toggleCustomDay = (day: number) => {
    setCustomDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    )
  }

  const handleSubmit = () => {
    if (!name.trim()) return
    const isDuplicate = habits.some(h => h.name.toLowerCase() === name.trim().toLowerCase())
    if (isDuplicate) {
      toast({
        title: t("habit.duplicate_name"),
        description: t("habit.duplicate_name_desc"),
        variant: "destructive"
      })
      return
    }
    onSubmit({
      name,
      description: showDescription ? description : "",
      type: showType ? type : "boolean",
      numericCondition: showType && type === "numeric" ? numericCondition : undefined,
      numericTarget: showType && type === "numeric" ? numericTarget : undefined,
      reminders: showReminders ? reminders : [],
      frequency: showFrequency ? frequency : "daily",
      customDays: showFrequency && frequency === "custom" && showCustomDays ? customDays : [],
      resetSchedule: "daily",
      color: "#64748b",
      icon: "circle",
    })
  }

  const dayLabels = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]

  type PillDef = {
    key: string
    icon: React.ComponentType<{ className?: string }>
    label: string
    show: boolean
    toggle: () => void
  }

  const pills: PillDef[] = [
    { key: 'description', icon: FileText, label: t('common.description'), show: showDescription, toggle: () => setShowDescription(v => !v) },
    { key: 'type', icon: Shapes, label: t('common.type'), show: showType, toggle: () => setShowType(v => !v) },
    { key: 'frequency', icon: Repeat, label: t('habit.freq_daily').split(' ')[0], show: showFrequency, toggle: () => setShowFrequency(v => !v) },
    { key: 'reminders', icon: Bell, label: t('common.notifications') || t('Reminders'), show: showReminders, toggle: () => setShowReminders(v => !v) },
  ]

  const anyExpanded = pills.some(p => p.show)

  return (
    <div className="space-y-5">

      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="habit-name" className="text-sm font-medium">
          {t('common.title')}
        </Label>
        <Input
          id="habit-name"
          placeholder={t("habit.placeholder_name")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </div>

      {/* Toggle pills */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
          {t('habit.add_options')}
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
                <FileText className="h-3.5 w-3.5" /> {t("common.description")}
              </Label>
              <Textarea
                placeholder={t("habit.placeholder_desc")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          )}

          {showType && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <Shapes className="h-3.5 w-3.5" /> {t("common.type")}
                </Label>
                <Select value={type} onValueChange={(v: HabitType) => setType(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="boolean">{t("habit.type_boolean")}</SelectItem>
                    <SelectItem value="numeric">{t("habit.type_numeric")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {type === "numeric" && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">{t("common.status")}</Label>
                    <Select value={numericCondition} onValueChange={(v: any) => setNumericCondition(v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="at-least">{t("habit.goal_at_least")}</SelectItem>
                        <SelectItem value="less-than">{t("habit.goal_less_than")}</SelectItem>
                        <SelectItem value="exactly">{t("habit.goal_exactly")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">{t("common.value")}</Label>
                    <Input
                      type="number"
                      value={numericTarget}
                      onChange={(e) => setNumericTarget(Number(e.target.value))}
                    />
                  </div>
                </div>
              )}
            </div>
          )}



          {showFrequency && (
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Repeat className="h-3.5 w-3.5" /> {t("habit.freq_daily").split(' ')[0]}
              </Label>
              <RadioGroup value={frequency} onValueChange={(v) => setFrequency(v as FrequencyType)} className="space-y-1.5">
                {["daily", "weekly", "monthly", "custom"].map(f => (
                  <div key={f} className="flex items-center gap-2">
                    <RadioGroupItem value={f} id={`freq-${f}`} />
                    <Label htmlFor={`freq-${f}`} className="text-sm font-normal capitalize cursor-pointer">{t(`habit.freq_${f}`)}</Label>
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
                    {showCustomDays ? "−" : "+"} {t("habit.select_days")}
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
                          {t(`day.${day}`)}
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
                <Bell className="h-3.5 w-3.5" /> {t("common.notifications")}
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
                  {t("Add")}
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
                        className="hover:text-destructive ml-0.5 leading-none simple-icon-btn"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* Footer */}
      <div className="flex justify-end gap-2 pt-2 border-t">
        <Button variant="outline" onClick={onCancel}>{t('common.cancel')}</Button>
        <Button onClick={handleSubmit} disabled={!name.trim()}>{t('notif.habit_created').split('!')[0]}</Button>
      </div>
    </div>
  )
}
