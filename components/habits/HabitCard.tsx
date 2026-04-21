"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trash2, Flame, Settings, Sparkles, Folder, ArchiveRestore, GripVertical } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getPriorityColor, shouldGlow } from "@/lib/priority-colors"
import { HabitAnalyticsModal } from "@/components/habit-analytics-modal"
import { useToast } from "@/hooks/use-toast"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  Habit, HabitType, NumericCondition, FrequencyType, ChecklistItem
} from "@/lib/habits/types"
import {
  getConditionLabel, getProgressPercentage, calculateSuccessRate,
  calculateWeeklyCompletions
} from "@/lib/habits/utils"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"

interface HabitCardProps {
  habit: Habit
  isMounted: boolean
  onComplete: (id: string, note: string) => void
  onUpdateNumeric: (id: string, value: number, note: string) => void
  onToggleChecklistItem?: (habitId: string, itemId: string) => void
  onUpdateChecklist?: (id: string, note: string) => void
  onDelete: (id: string) => void
  onArchive?: (id: string) => void
  onUnarchive?: (id: string) => void
  onSave: (updated: Habit) => void
  habits?: Habit[]
}

export function HabitCard({
  habit, isMounted,
  onComplete, onUpdateNumeric, onToggleChecklistItem, onUpdateChecklist,
  onDelete, onArchive, onUnarchive, onSave, habits = []
}: HabitCardProps) {
  const { toast } = useToast()
  const [note, setNote] = useState("")

  const [editName, setEditName] = useState(habit.name)
  const [editDescription, setEditDescription] = useState(habit.description || "")
  const [editReminders, setEditReminders] = useState<string[]>(habit.reminders || [])
  const [editFrequency, setEditFrequency] = useState<FrequencyType>(habit.frequency || "daily")
  const [editResetSchedule, setEditResetSchedule] = useState<"daily" | "weekly" | "monthly">(habit.resetSchedule || "daily")
  const [editColor, setEditColor] = useState(habit.color || "#64748b")
  const [editIcon, setEditIcon] = useState(habit.icon || "circle")
  const [editType, setEditType] = useState<HabitType>(habit.type)
  const [editNumericCondition, setEditNumericCondition] = useState<NumericCondition>(habit.numericCondition || "at-least")
  const [editNumericTarget, setEditNumericTarget] = useState(habit.numericTarget || 1)
  const [newReminderTime, setNewReminderTime] = useState("")
  const [newChecklistItem, setNewChecklistItem] = useState("")

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: habit.id })
  const dragStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const priorityColor = getPriorityColor(50, 'habits')
  const glow = shouldGlow(50, 'habits')
  const cardStyle: React.CSSProperties = priorityColor
    ? { border: `2px solid ${priorityColor}`, ...(glow ? { boxShadow: `0 0 8px ${priorityColor}` } : {}) }
    : {}

  const handleSave = () => {
    if (!editName.trim()) return
    const isDuplicate = habits.some(h => h.id !== habit.id && h.name.toLowerCase() === editName.trim().toLowerCase())
    if (isDuplicate) {
      toast({
        title: "Duplicate Name",
        description: "Another habit with this name already exists.",
        variant: "destructive"
      })
      return
    }
    onSave({
      ...habit,
      name: editName,
      description: editDescription,
      type: editType,
      numericCondition: editType === "numeric" ? editNumericCondition : undefined,
      numericTarget: editType === "numeric" ? editNumericTarget : undefined,
      reminders: editReminders,
      frequency: editFrequency,
      resetSchedule: editResetSchedule,
      color: editColor,
      icon: editIcon,
    })
  }

  return (
    <div
      ref={setNodeRef}
      style={{ ...cardStyle, ...dragStyle }}
      className={`group relative p-4 rounded-lg border transition-all ${habit.completedToday ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-accent/50"}`}
    >
      <div 
        {...attributes} 
        {...listeners} 
        className="absolute left-[-28px] top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing p-1 text-muted-foreground/50 hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="h-5 w-5" />
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-foreground">{habit.name}</h3>
          </div>
          {habit.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{habit.description}</p>
          )}
          {habit.type === "numeric" && (
            <p className="text-xs text-muted-foreground mb-2">
              {getConditionLabel(habit.numericCondition || "at-least")} {habit.numericTarget}
            </p>
          )}


          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-1.5">
              <Flame className="h-3 w-3 text-primary" />
              <span className="text-sm font-semibold text-foreground">{isMounted ? habit.streak : "—"}</span>
              <span className="text-xs text-muted-foreground">streak</span>
            </div>
            <span className="text-border text-xs select-none">·</span>
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-foreground">{isMounted ? habit.bestStreak : "—"}</span>
              <span className="text-xs text-muted-foreground">best</span>
            </div>
            <span className="text-border text-xs select-none">·</span>
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-foreground">{isMounted ? habit.totalCompletions : "—"}</span>
              <span className="text-xs text-muted-foreground">total</span>
            </div>
            <span className="text-border text-xs select-none">·</span>
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-foreground">{isMounted ? calculateSuccessRate(habit) : "—"}%</span>
              <span className="text-xs text-muted-foreground">success</span>
            </div>
            <span className="text-border text-xs select-none">·</span>
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-foreground">{isMounted ? calculateWeeklyCompletions(habit) : "—"}</span>
              <span className="text-xs text-muted-foreground">this week</span>
            </div>
          </div>

          {habit.type === "numeric" && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>
                  {`${habit.numericValue || 0}/${habit.numericTarget || 0}`}
                </span>
                <span>{getProgressPercentage(habit)}%</span>
              </div>
              <Progress value={getProgressPercentage(habit)} className="h-2" />
            </div>
          )}


        </div>

        <div className="flex gap-2">
          {habit.type === "boolean" && (
            <Button
              onClick={() => onComplete(habit.id, note)}
              disabled={habit.completedToday}
              variant={habit.completedToday ? "secondary" : "default"}
              size="sm"
            >
              {habit.completedToday ? "Done Today" : "Complete"}
            </Button>
          )}

          {habit.type === "numeric" && (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={habit.numericValue || 0}
                onChange={(e) => onUpdateNumeric(habit.id, Number(e.target.value), note)}
                className="w-20 rounded-lg"
                min="0"
              />
            </div>
          )}

          <div className="flex gap-1">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="simple-icon-btn">
                  <Sparkles className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden">
                <div className="sr-only">Habit Analytics</div>
                <HabitAnalyticsModal habit={habit} />
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="simple-icon-btn">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Habit</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Habit Name</Label>
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label>Habit Type</Label>
                    <Select value={editType} onValueChange={(v) => setEditType(v as HabitType)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="boolean">Yes/No Habit</SelectItem>
                        <SelectItem value="numeric">Numeric Habit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {editType === "numeric" && (
                    <>
                      <div className="space-y-2">
                        <Label>Condition</Label>
                        <Select value={editNumericCondition} onValueChange={(v) => setEditNumericCondition(v as NumericCondition)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="at-least">At least</SelectItem>
                            <SelectItem value="less-than">Less than</SelectItem>
                            <SelectItem value="exactly">Exactly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Target Value</Label>
                        <Input type="number" min="1" value={editNumericTarget} onChange={(e) => setEditNumericTarget(Math.max(1, Number(e.target.value)))} />
                      </div>
                    </>
                  )}
                  <div className="space-y-2">
                    <Label>Reminders</Label>
                    <div className="flex gap-2">
                      <Input type="time" value={newReminderTime} onChange={(e) => setNewReminderTime(e.target.value)} />
                      <Button onClick={() => { if (newReminderTime) { setEditReminders([...editReminders, newReminderTime]); setNewReminderTime("") } }}>Add</Button>
                    </div>
                    {editReminders.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {editReminders.map((time, i) => (
                          <Badge key={i} variant="secondary" className="flex items-center gap-1">
                            {time}
                            <button onClick={() => setEditReminders(editReminders.filter((_, idx) => idx !== i))} className="ml-1 hover:text-destructive simple-icon-btn">×</button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <Select value={editFrequency} onValueChange={(v) => setEditFrequency(v as FrequencyType)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Auto-Reset Schedule</Label>
                    <Select value={editResetSchedule} onValueChange={(v) => setEditResetSchedule(v as "daily" | "weekly" | "monthly")}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Visual Color</Label>
                    <div className="flex items-center gap-2">
                      <Input type="color" value={editColor} onChange={(e) => setEditColor(e.target.value)} className="w-12 h-10 p-1" />
                      <Input type="text" value={editColor} onChange={(e) => setEditColor(e.target.value)} placeholder="#64748b" className="flex-1" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Icon</Label>
                    <Input value={editIcon} onChange={(e) => setEditIcon(e.target.value)} placeholder="circle" />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => {}}>Cancel</Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {onUnarchive ? (
              <Button variant="ghost" size="icon" onClick={() => onUnarchive(habit.id)} title="Restore Habit" className="simple-icon-btn">
                <ArchiveRestore className="h-4 w-4" />
              </Button>
            ) : onArchive && (
              <Button variant="ghost" size="icon" onClick={() => onArchive(habit.id)} title="Archive Habit" className="simple-icon-btn">
                <Folder className="h-4 w-4" />
              </Button>
            )}

            <DeleteConfirmationDialog onConfirm={() => onDelete(habit.id)}>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive simple-icon-btn">
                <Trash2 className="h-4 w-4" />
              </Button>
            </DeleteConfirmationDialog>
          </div>
        </div>
      </div>
    </div>
  )
}
