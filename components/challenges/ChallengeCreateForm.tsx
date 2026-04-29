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
import { useLanguage } from "@/lib/language-context"

interface Props {
  onSubmit: (challenge: Challenge) => void
  onClose: () => void
  challenges?: Challenge[]
}

export function ChallengeCreateForm({ onSubmit, onClose, challenges = [] }: Props) {
  const { toast } = useToast()
  const { t } = useLanguage()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [showDescription, setShowDescription] = useState(false)
  const [duration, setDuration] = useState("7")
  const [startDate, setStartDate] = useState(getTodayString())
  const [showStartDate, setShowStartDate] = useState(false)
  const [goalType, setGoalType] = useState<ChallengeGoalType>("daily-completion")
  const [difficulty, setDifficulty] = useState(3)
  const [showDifficulty, setShowDifficulty] = useState(false)
  const [icon, setIcon] = useState("target")
  const [showIcon, setShowIcon] = useState(false)

  const handleSubmit = () => {
    if (!title.trim()) {
      toast({ title: t("notif.error"), description: t("challenge.enter_title"), variant: "destructive" })
      return
    }
    const isDuplicate = challenges.some(c => c.title.toLowerCase() === title.trim().toLowerCase())
    if (isDuplicate) {
      toast({
        title: t("challenge.duplicate_title"),
        description: t("challenge.duplicate_desc"),
        variant: "destructive"
      })
      return
    }
    if (!duration || parseInt(duration) <= 0) {
      toast({ title: t("notif.error"), description: t("challenge.invalid_duration"), variant: "destructive" })
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
      notes: {},
      difficulty: showDifficulty ? difficulty : 3,
      icon: showIcon ? icon : "target",
      archived: false,
      dailyProgress: [],
      currentStreak: 0,
      bestStreak: 0,
      completionRecords: [],
    })
    toast({ title: t("notif.challenge_added"), description: `${t("challenge.starts_on")} ${startDateStr}` })
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
    { key: 'description', icon: FileText, label: t('common.description'), show: showDescription, toggle: () => setShowDescription(v => !v) },
    { key: 'startDate', icon: CalendarDays, label: t('challenge.start_date'), show: showStartDate, toggle: () => setShowStartDate(v => !v) },
    { key: 'difficulty', icon: TrendingUp, label: t('common.difficulty'), show: showDifficulty, toggle: () => setShowDifficulty(v => !v) },
    { key: 'icon', icon: Target, label: t('common.icon'), show: showIcon, toggle: () => setShowIcon(v => !v) },
  ]

  const anyExpanded = pills.some(p => p.show)

  return (
    <div className="mt-4 space-y-5">

      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="challenge-title" className="text-sm font-medium">
          {t('common.title')}
        </Label>
        <Input
          id="challenge-title"
          placeholder={t("challenge.placeholder_title")}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
      </div>

      {/* Duration */}
      <div className="space-y-1.5">
        <Label htmlFor="challenge-duration" className="text-sm font-medium">{t('challenge.duration_days')}</Label>
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
        <Label className="text-sm font-medium">{t('common.type')}</Label>
        <Select value={goalType} onValueChange={(v) => setGoalType(v as ChallengeGoalType)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="daily-completion">{t("challenge.goal_daily")}</SelectItem>
            <SelectItem value="total-amount">{t("challenge.goal_total")}</SelectItem>
            <SelectItem value="checklist">{t("challenge.goal_checklist")}</SelectItem>
            <SelectItem value="points">{t("challenge.goal_points")}</SelectItem>
          </SelectContent>
        </Select>
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
                <FileText className="h-3.5 w-3.5" /> {t('common.description')}
              </Label>
              <Textarea
                placeholder={t("challenge.placeholder_desc")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          )}

          {showStartDate && (
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" /> {t('challenge.start_date')}
              </Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
          )}

          {showDifficulty && (
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" /> {t('common.difficulty')} —{" "}
                <span className="text-foreground font-semibold">{difficulty}</span>
              </Label>
              <Input
                type="range" min="1" max="5"
                value={difficulty}
                onChange={(e) => setDifficulty(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t("challenge.difficulty_easy")}</span><span>{t("challenge.difficulty_hard")}</span>
              </div>
            </div>
          )}



          {showIcon && (
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Target className="h-3.5 w-3.5" /> {t('common.icon')}
              </Label>
              <Select value={icon} onValueChange={setIcon}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="target">{t("challenge.icon_target")}</SelectItem>
                  <SelectItem value="book">{t("challenge.icon_book")}</SelectItem>
                  <SelectItem value="dumbbell">{t("challenge.icon_dumbbell")}</SelectItem>
                  <SelectItem value="calendar">{t("challenge.icon_calendar")}</SelectItem>
                  <SelectItem value="award">{t("challenge.icon_award")}</SelectItem>
                  <SelectItem value="trending-up">{t("challenge.icon_trending")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

        </div>
      )}

      {/* Footer */}
      <Button onClick={handleSubmit} className="w-full">{t('notif.challenge_added').split('!')[0]}</Button>
    </div>
  )
}
