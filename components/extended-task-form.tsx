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
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  CalendarIcon, BellIcon, FileText, Flag, CalendarDays,
  Target, Zap, Tags, Clock, RotateCcw, Shapes
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { getUserPreferences, saveUserPreferences } from "@/lib/user-preferences"
import { useLanguage } from "@/lib/language-context"
import { useToast } from "@/hooks/use-toast"

interface ExtendedTaskFormProps {
  onSubmit: (task: {
    title: string
    description: string
    priority: number
    dueDate?: Date
    reminderEnabled: boolean
    reminderTime?: Date
    linkedGoalId?: string
    dependencies?: string[]
    timeBlockStart?: string
    timeBlockEnd?: string
    timeBlockDate?: string
    tags?: string[]
    type: "boolean" | "numeric"
    numericCondition?: "at-least" | "less-than" | "exactly"
    numericTarget?: number
  }) => void
  onCancel: () => void
  goals?: { id: string; title: string }[]
  tasks?: { id: string; title: string }[]
}

export function ExtendedTaskForm({
  onSubmit, onCancel, goals = [], tasks = [], addedModules = []
}: ExtendedTaskFormProps & { addedModules?: string[] }) {
  const { toast } = useToast()
  const { t } = useLanguage()
  const [title, setTitle] = useState("")
  const [showDescription, setShowDescription] = useState(false)
  const [description, setDescription] = useState("")
  const [showPriority, setShowPriority] = useState(false)
  const [priority, setPriority] = useState(50)
  const [showDueDate, setShowDueDate] = useState(false)
  const [dueDate, setDueDate] = useState<Date | undefined>()
  const [showReminder, setShowReminder] = useState(false)
  const [reminderEnabled, setReminderEnabled] = useState(false)
  const [reminderTime, setReminderTime] = useState<Date | undefined>()
  const [showLinkedGoal, setShowLinkedGoal] = useState(false)
  const [linkedGoalId, setLinkedGoalId] = useState<string | undefined>(undefined)
  const [showDependencies, setShowDependencies] = useState(false)
  const [selectedDependencies, setSelectedDependencies] = useState<string[]>([])

  const [showTimeBlock, setShowTimeBlock] = useState(false)
  const [timeBlockStart, setTimeBlockStart] = useState<string>("")
  const [timeBlockEnd, setTimeBlockEnd] = useState<string>("")
  const [timeBlockDate, setTimeBlockDate] = useState<string>("")
  const [showTags, setShowTags] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedTag, setSelectedTag] = useState<string>("")
  const [showType, setShowType] = useState(false)
  const [taskType, setTaskType] = useState<"boolean" | "numeric">("boolean")
  const [numericCondition, setNumericCondition] = useState<"at-least" | "less-than" | "exactly">("at-least")
  const [numericTarget, setNumericTarget] = useState<number>(1)

  useEffect(() => {
    const prefs = getUserPreferences()
    prefs.extendedTaskForm.showDescription = showDescription
    prefs.extendedTaskForm.showPriority = showPriority
    prefs.extendedTaskForm.showDueDate = showDueDate
    prefs.extendedTaskForm.showReminder = showReminder
    prefs.extendedTaskForm.showLinkedGoal = showLinkedGoal
    prefs.extendedTaskForm.showDependencies = showDependencies
    prefs.extendedTaskForm.showTimeBlock = showTimeBlock
    prefs.extendedTaskForm.showTags = showTags
    saveUserPreferences(prefs)
  }, [showDescription, showPriority, showDueDate, showReminder,
      showLinkedGoal, showDependencies, showTimeBlock, showTags])

  const handleAddTag = () => {
    if (selectedTag && selectedTag !== "__new__" && !selectedTags.includes(selectedTag)) {
      setSelectedTags([...selectedTags, selectedTag])
      setSelectedTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove))
  }

  const handleSubmit = () => {
    if (!title.trim()) return
    const isDuplicate = tasks.some(t => t.title.toLowerCase() === title.trim().toLowerCase())
    if (isDuplicate) {
      toast({
        title: t("Duplicate Title"),
        description: t("A task with this title already exists."),
        variant: "destructive"
      })
      return
    }
    onSubmit({
      title,
      description: showDescription ? description : "",
      priority: showPriority ? priority : 50,
      dueDate: showDueDate ? dueDate : undefined,
      reminderEnabled: showReminder ? reminderEnabled : false,
      reminderTime: (showReminder && reminderEnabled) ? reminderTime : undefined,
      linkedGoalId: showLinkedGoal ? linkedGoalId : undefined,
      dependencies: showDependencies ? selectedDependencies : [],
      timeBlockStart: showTimeBlock ? timeBlockStart : undefined,
      timeBlockEnd: showTimeBlock ? timeBlockEnd : undefined,
      timeBlockDate: showTimeBlock ? timeBlockDate : undefined,
      tags: showTags ? selectedTags : [],
      type: showType ? taskType : "boolean",
      numericCondition: (showType && taskType === "numeric") ? numericCondition : undefined,
      numericTarget: (showType && taskType === "numeric") ? numericTarget : undefined
    })
  }

  type PillDef = {
    key: string
    icon: React.ComponentType<{ className?: string }>
    label: string
    show: boolean
    toggle: () => void
  }

  const pills: PillDef[] = [
    { key: 'description', icon: FileText, label: t('Description'), show: showDescription, toggle: () => setShowDescription(v => !v) },
    { key: 'priority', icon: Flag, label: t('Priority'), show: showPriority, toggle: () => setShowPriority(v => !v) },
    { key: 'dueDate', icon: CalendarDays, label: t('Due Date'), show: showDueDate, toggle: () => setShowDueDate(v => !v) },
    { key: 'reminder', icon: BellIcon, label: t('Reminder'), show: showReminder, toggle: () => setShowReminder(v => !v) },
    { key: 'tags', icon: Tags, label: t('Tags'), show: showTags, toggle: () => setShowTags(v => !v) },
    { key: 'timeBlock', icon: CalendarDays, label: t('Time Block'), show: showTimeBlock, toggle: () => setShowTimeBlock(v => !v) },
    ...(goals.length > 0 && addedModules.includes('goals') ? [
      { key: 'goal', icon: Target, label: t('Link Goal'), show: showLinkedGoal, toggle: () => setShowLinkedGoal(v => !v) } as PillDef
    ] : []),
    { key: 'dependencies', icon: Tags, label: t('Dependencies'), show: showDependencies, toggle: () => setShowDependencies(v => !v) },
    { key: 'type', icon: Shapes, label: t('Task Type'), show: showType, toggle: () => setShowType(v => !v) },
  ]

  const anyExpanded = pills.some(p => p.show)

  return (
    <div className="space-y-5">

      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="task-title" className="text-sm font-medium">
          {t('Task Title')}
        </Label>
        <Input
          id="task-title"
          placeholder={t("What needs to be done?")}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
      </div>

      {/* Toggle pills */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
          {t('Add options')}
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
                <FileText className="h-3.5 w-3.5" /> {t("Description")}
              </Label>
              <Textarea
                placeholder={t("Add details...")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          )}

          {showPriority && (
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Flag className="h-3.5 w-3.5" /> {t("Priority (1–100)")}
              </Label>
              <Input
                type="number" min="1" max="100"
                value={priority}
                onChange={(e) => setPriority(Math.min(100, Math.max(1, Number(e.target.value))))}
              />
              <p className="text-xs text-muted-foreground">{t("1–33 Low · 34–66 Medium · 67–100 High")}</p>
            </div>
          )}

          {showDueDate && (
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" /> {t("Due Date")}
              </Label>
              <Popover modal={true}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !dueDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : t("Select date")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {showReminder && (
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <BellIcon className="h-3.5 w-3.5" /> {t("Reminder")}
              </Label>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="reminder-enabled"
                  checked={reminderEnabled}
                  onCheckedChange={(c) => setReminderEnabled(c as boolean)}
                />
                <Label htmlFor="reminder-enabled" className="text-sm font-normal cursor-pointer">
                  {t("Enable reminder")}
                </Label>
              </div>
              {reminderEnabled && (
                <Input
                  type="time"
                  value={reminderTime ? format(reminderTime, "HH:mm") : ""}
                  onChange={(e) => {
                    const [h, m] = e.target.value.split(":").map(Number)
                    const d = new Date(); d.setHours(h, m)
                    setReminderTime(d)
                  }}
                />
              )}
            </div>
          )}



          {showTags && (
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Tags className="h-3.5 w-3.5" /> {t("Tags")}
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder={t("Type a tag...")}
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && selectedTag.trim()) { handleAddTag(); e.preventDefault() }
                  }}
                />
                <Button type="button" variant="outline" onClick={handleAddTag} disabled={!selectedTag.trim()}>
                  {t("Add")}
                </Button>
              </div>
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedTags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground rounded-full px-2.5 py-0.5 text-xs"
                    >
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive ml-0.5 leading-none simple-icon-btn">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {showLinkedGoal && goals.length > 0 && addedModules.includes('goals') && (
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Target className="h-3.5 w-3.5" /> {t("Link Goal")}
              </Label>
              <Select value={linkedGoalId || ""} onValueChange={setLinkedGoalId}>
                <SelectTrigger><SelectValue placeholder={t("Select a goal")} /></SelectTrigger>
                <SelectContent>
                  {goals.map(g => <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          {showDependencies && (
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Tags className="h-3.5 w-3.5" /> {t("Dependencies")}
              </Label>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {tasks.filter(t => t.id !== "").map(task => (
                  <div key={task.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`dep-${task.id}`}
                      checked={selectedDependencies.includes(task.id)}
                      onCheckedChange={(c) => {
                        if (c) setSelectedDependencies([...selectedDependencies, task.id])
                        else setSelectedDependencies(selectedDependencies.filter(id => id !== task.id))
                      }}
                    />
                    <Label htmlFor={`dep-${task.id}`} className="text-sm font-normal cursor-pointer">
                      {task.title}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showTimeBlock && (
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" /> {t("Time Block")}
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{t("Date")}</p>
                  <Input type="date" value={timeBlockDate} onChange={(e) => setTimeBlockDate(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{t("Start")}</p>
                  <Input type="time" value={timeBlockStart} onChange={(e) => setTimeBlockStart(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{t("End")}</p>
                  <Input type="time" value={timeBlockEnd} onChange={(e) => setTimeBlockEnd(e.target.value)} />
                </div>
              </div>
            </div>
          )}


          {showType && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <Shapes className="h-3.5 w-3.5" /> {t("Task Type")}
                </Label>
                <Select value={taskType} onValueChange={(v: "boolean" | "numeric") => setTaskType(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="boolean">{t("Done / Not Done")}</SelectItem>
                    <SelectItem value="numeric">{t("Numeric Goal")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {taskType === "numeric" && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">{t("Goal Mode")}</Label>
                    <Select value={numericCondition} onValueChange={(v: any) => setNumericCondition(v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="at-least">{t("At least")}</SelectItem>
                        <SelectItem value="less-than">{t("Less than")}</SelectItem>
                        <SelectItem value="exactly">{t("Exactly")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">{t("Target Value")}</Label>
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

        </div>
      )}

      {/* Footer */}
      <div className="flex justify-end gap-2 pt-2 border-t">
        <Button variant="outline" onClick={onCancel}>{t('Cancel')}</Button>
        <Button onClick={handleSubmit} disabled={!title.trim()}>{t('Create Task')}</Button>
      </div>
    </div>
  )
}
