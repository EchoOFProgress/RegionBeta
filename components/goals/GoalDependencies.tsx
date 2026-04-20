"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Target, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Goal, GoalDependency } from "@/lib/goals/types"
import { getTypeColor, getIconForType } from "@/lib/goals/utils"

interface Props {
  goal: Goal
  allGoals: Goal[]
  onUpdateGoal: (updated: Goal) => void
  onUpdateAllGoals: (updater: (goals: Goal[]) => Goal[]) => void
}

export function GoalDependencies({ goal, allGoals, onUpdateGoal, onUpdateAllGoals }: Props) {
  const { toast } = useToast()
  const [depGoalId, setDepGoalId] = useState("")
  const [depType, setDepType] = useState<GoalDependency['type']>("must-complete-before")

  const addDependency = () => {
    if (!depGoalId) {
      toast({ title: "Error", description: "Please select a goal to create dependency", variant: "destructive" })
      return
    }
    if (goal.dependencies?.some(d => d.id === depGoalId)) {
      toast({ title: "Error", description: "This dependency already exists", variant: "destructive" })
      return
    }
    const dep: GoalDependency = { id: depGoalId, type: depType }
    onUpdateAllGoals(goals => goals.map(g => {
      if (g.id === goal.id) return { ...g, dependencies: [...(g.dependencies || []), dep] }
      if (g.id === depGoalId) return { ...g, dependents: [...(g.dependents || []), goal.id] }
      return g
    }))
    setDepGoalId(""); setDepType("must-complete-before")
    toast({ title: "Dependency Added!", description: "Dependency relationship created successfully" })
  }

  const removeDependency = (dependencyId: string) => {
    onUpdateAllGoals(goals => goals.map(g => {
      if (g.id === goal.id) return { ...g, dependencies: g.dependencies?.filter(d => d.id !== dependencyId) }
      if (g.id === dependencyId) return { ...g, dependents: g.dependents?.filter(d => d !== goal.id) }
      return g
    }))
    toast({ title: "Dependency Removed", description: "Dependency relationship removed successfully" })
  }

  return (
    <div className="pt-4 border-t border-border mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-foreground flex items-center gap-2">
          <Target className="h-4 w-4" />
          Dependencies & Prerequisites
        </h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-2" />Add Dependency</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Add Dependency</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dependency-goal">Goal to Depend On</Label>
                <select
                  id="dependency-goal"
                  value={depGoalId}
                  onChange={(e) => setDepGoalId(e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm w-full"
                >
                  <option value="">Select a goal</option>
                  {allGoals.filter(g => g.id !== goal.id).map(g => (
                    <option key={g.id} value={g.id}>{g.title}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dependency-type">Dependency Type</Label>
                <select
                  id="dependency-type"
                  value={depType}
                  onChange={(e) => setDepType(e.target.value as GoalDependency['type'])}
                  className="border rounded-md px-3 py-2 text-sm w-full"
                >
                  <option value="must-complete-before">Must complete before</option>
                  <option value="parallel">Parallel (can work on together)</option>
                  <option value="sequential">Sequential (one after another)</option>
                  <option value="blocking">Blocking (conflicts with this)</option>
                </select>
              </div>
              <Button onClick={addDependency} className="w-full">
                <Plus className="h-4 w-4 mr-2" />Add Dependency
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {goal.dependencies && goal.dependencies.length > 0 ? (
        <div className="space-y-3">
          {goal.dependencies.map((dependency) => {
            const depGoal = allGoals.find(g => g.id === dependency.id)
            return (
              <div key={dependency.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
                <div className={`p-2 rounded-full ${getTypeColor('dependency')}`}>{getIconForType('dependency')}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{depGoal ? depGoal.title : `Goal ${dependency.id}`}</p>
                  <Badge variant="outline" className="mt-1 capitalize">{dependency.type.replace('-', ' ')}</Badge>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeDependency(dependency.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm py-4 text-center">
          No dependencies yet. Add goals that this goal depends on or conflicts with.
        </p>
      )}
    </div>
  )
}
