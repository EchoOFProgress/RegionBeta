"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Trash2, CheckCircle2, Clock, Calendar, Zap } from "lucide-react"
import { getPriorityColor } from "@/lib/priority-colors"
import { Task } from "@/lib/tasks/types"
import { getConditionLabel, isTaskOverdue } from "@/lib/tasks/utils"

interface CompletedTaskItemProps {
  task: Task
  isMounted: boolean
  taskStyle: React.CSSProperties
  onToggle: (id: string) => void
  onUpdateNumeric: (id: string, value: number) => void
  onDelete: (id: string) => void
}

export function CompletedTaskItem({ task, isMounted, taskStyle, onToggle, onUpdateNumeric, onDelete }: CompletedTaskItemProps) {
  return (
    <div
      className="flex items-start gap-4 p-4 rounded-xl border border-border opacity-80 completed-task-bg"
      style={taskStyle}
    >
      {task.type === "boolean" ? (
        <button onClick={() => onToggle(task.id)} className="flex-shrink-0 mt-1 text-primary">
          <CheckCircle2 className="h-6 w-6" />
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
          <p className="font-semibold text-muted-foreground line-through">{task.title}</p>
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
        </div>
      </div>
      <Button
        variant="ghost" size="icon"
        onClick={() => onDelete(task.id)}
        className="flex-shrink-0 text-muted-foreground hover:text-destructive rounded-lg"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
