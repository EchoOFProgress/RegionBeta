"use client"

import { Badge } from "@/components/ui/badge"
import { Link } from "lucide-react"
import { Goal, LinkedItem } from "@/lib/goals/types"
import { getTypeColor, getIconForType } from "@/lib/goals/utils"

interface Props {
  goal: Goal
  tasks: any[]
  habits: any[]
  challenges: any[]
}

export function GoalLinkedItems({ goal, tasks, habits, challenges }: Props) {
  const linkedItems: LinkedItem[] = [
    ...tasks.filter(t => t.linkedGoalId === goal.id).map(t => ({ id: t.id, type: "task" as const, title: t.title, completed: t.completed })),
    ...habits.filter(h => h.linkedGoalId === goal.id).map(h => ({ id: h.id, type: "habit" as const, title: h.name, completed: h.completedToday || false })),
    ...challenges.filter(c => c.linkedGoalId === goal.id).map(c => ({ id: c.id, type: "challenge" as const, title: c.title, completed: c.status === "completed" }))
  ]

  return (
    <div className="pt-4 border-t border-border mt-6">
      <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
        <Link className="h-4 w-4" />
        Linked Items
      </h3>

      {linkedItems.length > 0 ? (
        <div className="space-y-3">
          {linkedItems.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
              <div className={`p-2 rounded-full ${getTypeColor(item.type)}`}>{getIconForType(item.type)}</div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{item.title}</p>
                <Badge variant="outline" className="mt-1 capitalize">{item.type}</Badge>
              </div>
              <Badge variant={item.completed ? "default" : "secondary"}>
                {item.completed ? "Completed" : "Pending"}
              </Badge>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm py-4 text-center">
          No items linked to this goal yet. Link tasks, habits, or challenges to track progress.
        </p>
      )}
    </div>
  )
}
