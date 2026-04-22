"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trash2, Square, Settings, Sparkles, GripVertical, Clock, Calendar, Zap, Flame, Trophy, CheckCircle2, Folder, ArchiveRestore } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { getPriorityColor } from "@/lib/priority-colors"
import { TaskAnalyticsModal } from "@/components/task-analytics-modal"
import { Task, TaskType, NumericCondition } from "@/lib/tasks/types"
import { getConditionLabel, isTaskOverdue, getProgressPercentage } from "@/lib/tasks/utils"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"

interface ActiveTaskCardProps {
  task: Task
  index: number
  isMounted: boolean
  taskStyle: React.CSSProperties
  onToggle: (id: string) => void
  onUpdateNumeric: (id: string, value: number) => void
  onDelete: (id: string) => void
  onArchive?: (id: string) => void
  onUnarchive?: (id: string) => void
  onSave: (updated: Task) => void
  tasks?: Task[]
}

export function ActiveTaskCard({
  task, index, isMounted, taskStyle,
  onToggle, onUpdateNumeric, onDelete, onArchive, onUnarchive, onSave, tasks = []
}: ActiveTaskCardProps) {
  const { toast } = useToast()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })
  const dragStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }
  const [editTitle, setEditTitle] = useState(task.title)
  const [editDescription, setEditDescription] = useState(task.description || "")
  const [editPriority, setEditPriority] = useState(task.priority)
  const [editType, setEditType] = useState<TaskType>(task.type)
  const [editNumericCondition, setEditNumericCondition] = useState<NumericCondition>(task.numericCondition || "at-least")
  const [editNumericTarget, setEditNumericTarget] = useState(task.numericTarget || 1)
  const [editTimeEstimate, setEditTimeEstimate] = useState<number | undefined>(task.timeEstimate)

  const handleSave = () => {
    if (!editTitle.trim()) return
    const isDuplicate = tasks.some(t => t.id !== task.id && t.title.toLowerCase() === editTitle.trim().toLowerCase())
    if (isDuplicate) {
      toast({
        title: "Duplicate Title",
        description: "Another task with this title already exists.",
        variant: "destructive"
      })
      return
    }
    onSave({
      ...task,
      title: editTitle,
      description: editDescription,
      priority: editPriority,
      type: editType,
      numericCondition: editType === "numeric" ? editNumericCondition : undefined,
      numericTarget: editType === "numeric" ? editNumericTarget : undefined,
      timeEstimate: editTimeEstimate,
    })
  }

  return (
    <div ref={setNodeRef} style={dragStyle} {...attributes} className="mb-4">
      <Card className="border-2 hover:shadow-md transition-all duration-200" style={taskStyle}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div {...listeners} className="mt-1 cursor-move text-muted-foreground hover:text-foreground touch-none">
              <GripVertical className="h-5 w-5" />
            </div>



                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p 
                      className={`font-medium transition-colors ${task.priority >= 67 ? 'text-foreground' : 'text-muted-foreground'}`}
                    >
                      {task.title}
                    </p>
                    {isTaskOverdue(task) && <Badge variant="destructive" className="text-xs">Overdue</Badge>}
                    {task.timeEstimate && (
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {task.timeEstimate >= 60 ? `${Math.floor(task.timeEstimate / 60)}h ${task.timeEstimate % 60}m` : `${task.timeEstimate}m`}
                      </Badge>
                    )}
                  </div>
                  {task.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {task.dueDate && (
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {isMounted ? new Date(task.dueDate).toLocaleDateString('en-US') : "..."}
                      </Badge>
                    )}
                  {task.tags?.map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>

                {task.type === "numeric" && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>{task.numericValue || 0} / {task.numericTarget}</span>
                      <span>{getProgressPercentage(task)}%</span>
                    </div>
                    <Progress value={getProgressPercentage(task)} className="h-1.5" />
                  </div>
                )}
              </div>

                <div className="flex items-center gap-2">
                  {task.type === "boolean" && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onToggle(task.id)}
                      className="text-muted-foreground hover:text-primary simple-icon-btn h-8 w-8"
                    >
                      <Square className="h-5 w-5" />
                    </Button>
                  )}
                  
                  {task.type === "numeric" && (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={task.numericValue || 0}
                        onChange={(e) => onUpdateNumeric(task.id, Number(e.target.value))}
                        className="w-24 h-8 text-xs rounded-lg font-medium px-2"
                        min="0"
                      />
                    </div>
                  )}

                  <div className="flex gap-1 ml-1 border-l pl-2 border-border/50">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="simple-icon-btn"><Sparkles className="h-4 w-4" /></Button>
                    </DialogTrigger>
                    <DialogContent className="w-full max-w-[95vw] md:max-w-4xl xl:max-w-6xl max-h-[90vh] p-0 overflow-hidden">
                      <div className="sr-only">Task Analytics</div>
                      <TaskAnalyticsModal task={task} />
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-lg simple-icon-btn">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader><DialogTitle>Edit Task</DialogTitle></DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Task Title</Label>
                          <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="rounded-lg" />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} className="rounded-lg" />
                        </div>
                        <div className="space-y-2">
                          <Label>Priority (1-100)</Label>
                          <Input
                            type="number" min="1" max="100" value={editPriority}
                            onChange={(e) => setEditPriority(Math.min(100, Math.max(1, Number(e.target.value))))}
                            className="rounded-lg"
                          />
                          <p className="text-xs text-muted-foreground">1-33 (Low), 34-66 (Medium), 67-100 (High)</p>
                        </div>
                        <div className="space-y-2">
                          <Label>Task Type</Label>
                          <Select value={editType} onValueChange={(v) => setEditType(v as TaskType)}>
                            <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="boolean">Yes/No Task</SelectItem>
                              <SelectItem value="numeric">Numeric Task</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {editType === "numeric" && (
                          <>
                            <div className="space-y-2">
                              <Label>Condition</Label>
                              <Select value={editNumericCondition} onValueChange={(v) => setEditNumericCondition(v as NumericCondition)}>
                                <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="at-least">At least</SelectItem>
                                  <SelectItem value="less-than">Less than</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Target Value</Label>
                              <Input type="number" min="1" value={editNumericTarget} onChange={(e) => setEditNumericTarget(Math.max(1, Number(e.target.value)))} className="rounded-lg" />
                            </div>
                          </>
                        )}
                        <div className="space-y-2">
                          <Label>Time Estimate (minutes)</Label>
                          <Input
                            type="number" min="0" value={editTimeEstimate || ""}
                            onChange={(e) => setEditTimeEstimate(e.target.value ? Number(e.target.value) : undefined)}
                            placeholder="Enter time estimate in minutes" className="rounded-lg"
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <Button variant="outline" className="rounded-lg">Cancel</Button>
                          <Button onClick={handleSave} className="rounded-lg">Save Changes</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {onUnarchive ? (
                    <Button variant="ghost" size="icon" onClick={() => onUnarchive(task.id)} title="Restore Task" className="simple-icon-btn">
                      <ArchiveRestore className="h-4 w-4" />
                    </Button>
                  ) : onArchive && (
                    <Button variant="ghost" size="icon" onClick={() => onArchive(task.id)} title="Archive Task" className="simple-icon-btn">
                      <Folder className="h-4 w-4" />
                    </Button>
                  )}

                  <DeleteConfirmationDialog onConfirm={() => onDelete(task.id)}>
                    <Button
                      variant="ghost" size="icon"
                      className="flex-shrink-0 text-muted-foreground hover:text-destructive rounded-lg simple-icon-btn"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </DeleteConfirmationDialog>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
    </div>
  )
}
