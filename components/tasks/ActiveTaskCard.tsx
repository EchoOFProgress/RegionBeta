"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Trash2, Circle, Settings, Sparkles, GripVertical, Clock, Calendar, Zap, Flame, Trophy } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Draggable } from "react-beautiful-dnd"
import { getPriorityColor } from "@/lib/priority-colors"
import { TaskAnalyticsModal } from "@/components/task-analytics-modal"
import { Task, TaskType, NumericCondition } from "@/lib/tasks/types"
import { getConditionLabel, isTaskOverdue } from "@/lib/tasks/utils"

interface ActiveTaskCardProps {
  task: Task
  index: number
  isMounted: boolean
  taskStyle: React.CSSProperties
  onToggle: (id: string) => void
  onUpdateNumeric: (id: string, value: number) => void
  onDelete: (id: string) => void
  onSave: (updated: Task) => void
}

export function ActiveTaskCard({
  task, index, isMounted, taskStyle,
  onToggle, onUpdateNumeric, onDelete, onSave
}: ActiveTaskCardProps) {
  const [editTitle, setEditTitle] = useState(task.title)
  const [editDescription, setEditDescription] = useState(task.description || "")
  const [editPriority, setEditPriority] = useState(task.priority)
  const [editType, setEditType] = useState<TaskType>(task.type)
  const [editNumericCondition, setEditNumericCondition] = useState<NumericCondition>(task.numericCondition || "at-least")
  const [editNumericTarget, setEditNumericTarget] = useState(task.numericTarget || 1)
  const [editTimeEstimate, setEditTimeEstimate] = useState<number | undefined>(task.timeEstimate)
  const [editEnergyLevel, setEditEnergyLevel] = useState(task.energyLevel || 5)

  const handleSave = () => {
    onSave({
      ...task,
      title: editTitle,
      description: editDescription,
      priority: editPriority,
      type: editType,
      numericCondition: editType === "numeric" ? editNumericCondition : undefined,
      numericTarget: editType === "numeric" ? editNumericTarget : undefined,
      timeEstimate: editTimeEstimate,
      energyLevel: editEnergyLevel,
    })
  }

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <div ref={provided.innerRef} {...provided.draggableProps} className="mb-4">
          <Card className="border-2 hover:shadow-md transition-all duration-200" style={taskStyle}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div {...provided.dragHandleProps} className="mt-1 cursor-move text-muted-foreground hover:text-foreground">
                  <GripVertical className="h-5 w-5" />
                </div>

                {task.type === "boolean" ? (
                  <button onClick={() => onToggle(task.id)} className="flex-shrink-0 mt-1 text-muted-foreground hover:text-primary">
                    <Circle className="h-5 w-5" />
                  </button>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="number"
                      value={task.numericValue || 0}
                      onChange={(e) => onUpdateNumeric(task.id, Number(e.target.value))}
                      className="w-20 rounded-lg"
                      min="0"
                    />
                    <span className="text-sm text-muted-foreground">
                      {getConditionLabel(task.numericCondition || "at-least")} {task.numericTarget}
                    </span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-medium ${task.priority >= 67 ? 'text-foreground' : 'text-muted-foreground'}`}>
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
                    <Badge
                      variant="outline"
                      className="text-xs"
                      style={{ borderColor: getPriorityColor(task.priority, 'tasks'), color: getPriorityColor(task.priority, 'tasks') }}
                    >
                      {task.priority}
                    </Badge>
                    {task.energyLevel && (
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        <Zap className="h-3 w-3" />{task.energyLevel}/10
                      </Badge>
                    )}
                    {task.streak && task.streak > 0 && (
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        <Flame className="h-3 w-3" />{task.streak} day streak
                      </Badge>
                    )}
                    {task.bestStreak && task.bestStreak > 0 && task.bestStreak !== task.streak && (
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        <Trophy className="h-3 w-3" />Best: {task.bestStreak}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-1">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon"><Sparkles className="h-4 w-4" /></Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden">
                      <div className="sr-only">Task Analytics</div>
                      <TaskAnalyticsModal task={task} />
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-lg">
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
                        <div className="space-y-2">
                          <Label>Energy Level (1-10)</Label>
                          <Input
                            type="range" min="1" max="10" value={editEnergyLevel}
                            onChange={(e) => setEditEnergyLevel(Number(e.target.value))}
                            className="w-full rounded-lg"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Low Energy</span>
                            <span className="font-medium">{editEnergyLevel}</span>
                            <span>High Energy</span>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <Button variant="outline" className="rounded-lg">Cancel</Button>
                          <Button onClick={handleSave} className="rounded-lg">Save Changes</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="ghost" size="icon"
                    onClick={() => onDelete(task.id)}
                    className="flex-shrink-0 text-muted-foreground hover:text-destructive rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  )
}
