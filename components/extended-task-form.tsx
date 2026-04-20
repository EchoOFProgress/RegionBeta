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
  Target, Zap, Tags, Clock, RotateCcw
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { getUserPreferences, saveUserPreferences } from "@/lib/user-preferences"

interface ExtendedTaskFormProps {
  onSubmit: (task: {
    title: string
    description: string
    priority: number
    dueDate?: Date
    reminderEnabled: boolean
    reminderTime?: Date
    timeEstimate?: number
    energyLevel?: number
    linkedGoalId?: string
    dependencies?: string[]
    timeBlockStart?: string
    timeBlockEnd?: string
    timeBlockDate?: string
    isRecurring?: boolean
    recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'yearly'
    recurrenceEndDate?: string
    recurrenceInterval?: number
    tags?: string[]
  }) => void
  onCancel: () => void
  goals?: { id: string; title: string }[]
  tasks?: { id: string; title: string }[]
}

export function ExtendedTaskForm({
  onSubmit, onCancel, goals = [], tasks = [], addedModules = []
}: ExtendedTaskFormProps & { addedModules?: string[] }) {
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
  const [showTimeEstimate, setShowTimeEstimate] = useState(false)
  const [timeEstimate, setTimeEstimate] = useState<number | undefined>(undefined)
  const [showEnergyLevel, setShowEnergyLevel] = useState(false)
  const [energyLevel, setEnergyLevel] = useState<number>(5)
  const [showLinkedGoal, setShowLinkedGoal] = useState(false)
  const [linkedGoalId, setLinkedGoalId] = useState<string | undefined>(undefined)
  const [showDependencies, setShowDependencies] = useState(false)
  const [selectedDependencies, setSelectedDependencies] = useState<string[]>([])
  const [showTimeBlock, setShowTimeBlock] = useState(false)
  const [timeBlockStart, setTimeBlockStart] = useState<string>("")
  const [timeBlockEnd, setTimeBlockEnd] = useState<string>("")
  const [timeBlockDate, setTimeBlockDate] = useState<string>("")
  const [showRecurrence, setShowRecurrence] = useState(false)
  const [recurrencePattern, setRecurrencePattern] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>("weekly")
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<string>("")
  const [recurrenceInterval, setRecurrenceInterval] = useState<number>(1)
  const [showTags, setShowTags] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedTag, setSelectedTag] = useState<string>("")

  useEffect(() => {
    const prefs = getUserPreferences()
    prefs.extendedTaskForm.showDescription = showDescription
    prefs.extendedTaskForm.showPriority = showPriority
    prefs.extendedTaskForm.showDueDate = showDueDate
    prefs.extendedTaskForm.showReminder = showReminder
    prefs.extendedTaskForm.showTimeEstimate = showTimeEstimate
    prefs.extendedTaskForm.showLinkedGoal = showLinkedGoal
    prefs.extendedTaskForm.showEnergyLevel = showEnergyLevel
    prefs.extendedTaskForm.showDependencies = showDependencies
    prefs.extendedTaskForm.showTimeBlock = showTimeBlock
    prefs.extendedTaskForm.showRecurrence = showRecurrence
    prefs.extendedTaskForm.showTags = showTags
    saveUserPreferences(prefs)
  }, [showDescription, showPriority, showDueDate, showReminder, showTimeEstimate,
      showLinkedGoal, showEnergyLevel, showDependencies, showTimeBlock, showRecurrence, showTags])

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
    onSubmit({
      title,
      description: showDescription ? description : "",
      priority: showPriority ? priority : 50,
      dueDate: showDueDate ? dueDate : undefined,
      reminderEnabled: showReminder ? reminderEnabled : false,
      reminderTime: (showReminder && reminderEnabled) ? reminderTime : undefined,
      timeEstimate: showTimeEstimate ? timeEstimate : undefined,
      energyLevel: showEnergyLevel ? energyLevel : 5,
      linkedGoalId: showLinkedGoal ? linkedGoalId : undefined,
      dependencies: showDependencies ? selectedDependencies : [],
      timeBlockStart: showTimeBlock ? timeBlockStart : undefined,
      timeBlockEnd: showTimeBlock ? timeBlockEnd : undefined,
      timeBlockDate: showTimeBlock ? timeBlockDate : undefined,
      isRecurring: showRecurrence,
      recurrencePattern: showRecurrence ? recurrencePattern : undefined,
      recurrenceEndDate: showRecurrence ? recurrenceEndDate : undefined,
      recurrenceInterval: showRecurrence ? recurrenceInterval : undefined,
      tags: showTags ? selectedTags : []
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
    { key: 'description', icon: FileText, label: 'Description', show: showDescription, toggle: () => setShowDescription(v => !v) },
    { key: 'priority', icon: Flag, label: 'Priority', show: showPriority, toggle: () => setShowPriority(v => !v) },
    { key: 'dueDate', icon: CalendarDays, label: 'Due Date', show: showDueDate, toggle: () => setShowDueDate(v => !v) },
    { key: 'reminder', icon: BellIcon, label: 'Reminder', show: showReminder, toggle: () => setShowReminder(v => !v) },
    { key: 'timeEstimate', icon: Clock, label: 'Time Estimate', show: showTimeEstimate, toggle: () => setShowTimeEstimate(v => !v) },
    { key: 'energy', icon: Zap, label: 'Energy', show: showEnergyLevel, toggle: () => setShowEnergyLevel(v => !v) },
    { key: 'tags', icon: Tags, label: 'Tags', show: showTags, toggle: () => setShowTags(v => !v) },
    { key: 'timeBlock', icon: CalendarDays, label: 'Time Block', show: showTimeBlock, toggle: () => setShowTimeBlock(v => !v) },
    { key: 'recurring', icon: RotateCcw, label: 'Recurring', show: showRecurrence, toggle: () => setShowRecurrence(v => !v) },
    ...(goals.length > 0 && addedModules.includes('goals') ? [
      { key: 'goal', icon: Target, label: 'Link Goal', show: showLinkedGoal, toggle: () => setShowLinkedGoal(v => !v) } as PillDef
    ] : []),
    { key: 'dependencies', icon: Tags, label: 'Dependencies', show: showDependencies, toggle: () => setShowDependencies(v => !v) },
  ]

  const anyExpanded = pills.some(p => p.show)

  return (
    <div className="space-y-5">

      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="task-title" className="text-sm font-medium">
          Task Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="task-title"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
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
                placeholder="Add details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          )}

          {showPriority && (
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Flag className="h-3.5 w-3.5" /> Priority (1–100)
              </Label>
              <Input
                type="number" min="1" max="100"
                value={priority}
                onChange={(e) => setPriority(Math.min(100, Math.max(1, Number(e.target.value))))}
              />
              <p className="text-xs text-muted-foreground">1–33 Low · 34–66 Medium · 67–100 High</p>
            </div>
          )}

          {showDueDate && (
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" /> Due Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !dueDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : "Select date"}
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
                <BellIcon className="h-3.5 w-3.5" /> Reminder
              </Label>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="reminder-enabled"
                  checked={reminderEnabled}
                  onCheckedChange={(c) => setReminderEnabled(c as boolean)}
                />
                <Label htmlFor="reminder-enabled" className="text-sm font-normal cursor-pointer">
                  Enable reminder
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

          {showTimeEstimate && (
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Clock className="h-3.5 w-3.5" /> Time Estimate (minutes)
              </Label>
              <Input
                type="number" min="0"
                value={timeEstimate ?? ""}
                onChange={(e) => setTimeEstimate(Number(e.target.value))}
                placeholder="e.g. 30"
              />
            </div>
          )}

          {showEnergyLevel && (
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Zap className="h-3.5 w-3.5" /> Energy Level —{" "}
                <span className="text-foreground font-semibold">{energyLevel}</span>
              </Label>
              <Input
                type="range" min="1" max="10"
                value={energyLevel}
                onChange={(e) => setEnergyLevel(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Low</span><span>High</span>
              </div>
            </div>
          )}

          {showTags && (
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Tags className="h-3.5 w-3.5" /> Tags
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Type a tag..."
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && selectedTag.trim()) { handleAddTag(); e.preventDefault() }
                  }}
                />
                <Button type="button" variant="outline" onClick={handleAddTag} disabled={!selectedTag.trim()}>
                  Add
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
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive ml-0.5 leading-none">
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
                <Target className="h-3.5 w-3.5" /> Link to Goal
              </Label>
              <Select value={linkedGoalId || ""} onValueChange={setLinkedGoalId}>
                <SelectTrigger><SelectValue placeholder="Select a goal" /></SelectTrigger>
                <SelectContent>
                  {goals.map(g => <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          {showDependencies && (
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Tags className="h-3.5 w-3.5" /> Dependencies
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
                <CalendarDays className="h-3.5 w-3.5" /> Time Block
              </Label>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Date</p>
                  <Input type="date" value={timeBlockDate} onChange={(e) => setTimeBlockDate(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Start</p>
                  <Input type="time" value={timeBlockStart} onChange={(e) => setTimeBlockStart(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">End</p>
                  <Input type="time" value={timeBlockEnd} onChange={(e) => setTimeBlockEnd(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {showRecurrence && (
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <RotateCcw className="h-3.5 w-3.5" /> Recurring
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Pattern</p>
                  <Select value={recurrencePattern} onValueChange={(v: 'daily'|'weekly'|'monthly'|'yearly') => setRecurrencePattern(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Every (N)</p>
                  <Input
                    type="number" min="1"
                    value={recurrenceInterval}
                    onChange={(e) => setRecurrenceInterval(Math.max(1, Number(e.target.value)))}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">End Date (optional)</p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start font-normal text-left", !recurrenceEndDate && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {recurrenceEndDate ? format(new Date(recurrenceEndDate), "PPP") : "No end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={recurrenceEndDate ? new Date(recurrenceEndDate) : undefined}
                      onSelect={(d) => setRecurrenceEndDate(d ? d.toISOString().split('T')[0] : "")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Footer */}
      <div className="flex justify-end gap-2 pt-2 border-t">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={!title.trim()}>Create Task</Button>
      </div>
    </div>
  )
}
