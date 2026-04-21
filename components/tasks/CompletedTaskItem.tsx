"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trash2, CheckSquare, Clock, Calendar, Zap, Folder, ArchiveRestore } from "lucide-react"
import { getPriorityColor } from "@/lib/priority-colors"
import { Task } from "@/lib/tasks/types"
import { getConditionLabel, isTaskOverdue, getProgressPercentage } from "@/lib/tasks/utils"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"

interface CompletedTaskItemProps {
  task: Task
  isMounted: boolean
  taskStyle: React.CSSProperties
  onToggle: (id: string) => void
  onUpdateNumeric: (id: string, value: number) => void
  onDelete: (id: string) => void
  onArchive?: (id: string) => void
  onUnarchive?: (id: string) => void
}

export function CompletedTaskItem({ task, isMounted, taskStyle, onToggle, onUpdateNumeric, onDelete, onArchive, onUnarchive }: CompletedTaskItemProps) {
  return (
    <div
      className="flex items-start gap-4 p-4 rounded-xl border border-border opacity-80 completed-task-bg"
      style={taskStyle}
    >
      {task.type === "boolean" ? (
        <button onClick={() => onToggle(task.id)} className="flex-shrink-0 mt-1 text-primary">
          <CheckSquare className="h-6 w-6" />
        </button>
      ) : (
        <div className="flex items-center gap-2 mt-1">
          <Input
            type="number"
            value={task.numericValue || 0}
            onChange={(e) => onUpdateNumeric(task.id, Number(e.target.value))}
            className="w-24 h-8 text-xs rounded-lg font-medium px-2"
            min="0"
          />
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
      <div className="flex items-center gap-1">
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
  )
}
