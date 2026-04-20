"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Target, CheckSquare, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Goal, SuccessCriteria } from "@/lib/goals/types"
import { updateGoalProgress } from "@/lib/goals/utils"

interface Props {
  goal: Goal
  onUpdateGoal: (updated: Goal) => void
}

export function GoalSuccessCriteria({ goal, onUpdateGoal }: Props) {
  const { toast } = useToast()
  const [newCriteria, setNewCriteria] = useState<{ description: string; targetDate?: string; progress?: number }>({ description: '' })

  const addCriteria = () => {
    if (!newCriteria.description.trim()) {
      toast({ title: "Error", description: "Please enter a success criteria description", variant: "destructive" })
      return
    }
    const item: SuccessCriteria = {
      id: Date.now().toString(),
      description: newCriteria.description,
      isCompleted: false,
      targetDate: newCriteria.targetDate,
      progress: newCriteria.progress || 0
    }
    onUpdateGoal(updateGoalProgress({ ...goal, successCriteria: [...(goal.successCriteria || []), item] }))
    setNewCriteria({ description: '', targetDate: undefined, progress: undefined })
    toast({ title: "Success Criteria Added!", description: "Success criteria added to goal" })
  }

  const deleteCriteria = (criteriaId: string) => {
    onUpdateGoal(updateGoalProgress({ ...goal, successCriteria: goal.successCriteria?.filter(c => c.id !== criteriaId) }))
    toast({ title: "Success Criteria Removed", description: "Success criteria removed from goal" })
  }

  const toggleCriteria = (criteriaId: string) => {
    const updated = goal.successCriteria?.map(c =>
      c.id === criteriaId
        ? { ...c, isCompleted: !c.isCompleted, completedDate: !c.isCompleted ? new Date().toISOString().split("T")[0] : undefined }
        : c
    )
    onUpdateGoal(updateGoalProgress({ ...goal, successCriteria: updated }))
    toast({ title: "Success Criteria Updated!", description: "Success criteria completion status updated" })
  }

  return (
    <div className="pt-4 border-t border-border mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-foreground flex items-center gap-2">
          <Target className="h-4 w-4" />
          Success Criteria
        </h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-2" />Add Criteria</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Add Success Criteria</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="criteria-description">Description *</Label>
                <Textarea
                  id="criteria-description"
                  placeholder="Define a measurable success criteria..."
                  value={newCriteria.description}
                  onChange={(e) => setNewCriteria({ ...newCriteria, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="criteria-target-date">Target Date (Optional)</Label>
                  <Input
                    id="criteria-target-date"
                    type="date"
                    value={newCriteria.targetDate || ''}
                    onChange={(e) => setNewCriteria({ ...newCriteria, targetDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="criteria-progress">Progress (0-100%)</Label>
                  <Input
                    id="criteria-progress"
                    type="number"
                    min="0"
                    max="100"
                    value={newCriteria.progress || ''}
                    onChange={(e) => setNewCriteria({ ...newCriteria, progress: parseInt(e.target.value) || 0 })}
                    placeholder="0-100"
                  />
                </div>
              </div>
              <Button onClick={addCriteria} className="w-full"><Plus className="h-4 w-4 mr-2" />Add Success Criteria</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {goal.successCriteria && goal.successCriteria.length > 0 ? (
        <div className="space-y-3">
          {goal.successCriteria.map((criteria) => (
            <div key={criteria.id} className="p-3 rounded-lg border border-border bg-card">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${criteria.isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}>
                    {criteria.isCompleted
                      ? <CheckSquare className="h-4 w-4 text-white" />
                      : <Target className="h-4 w-4 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${criteria.isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {criteria.description}
                    </p>
                    {criteria.targetDate && (
                      <p className="text-xs text-muted-foreground mt-1" suppressHydrationWarning>
                        Target: {new Date(criteria.targetDate).toLocaleDateString()}
                      </p>
                    )}
                    {criteria.progress !== undefined && criteria.progress !== null && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Progress</span>
                          <span>{criteria.progress}%</span>
                        </div>
                        <Progress value={criteria.progress} className="h-2" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => toggleCriteria(criteria.id)} className="text-muted-foreground hover:text-foreground">
                    {criteria.isCompleted
                      ? <CheckSquare className="h-4 w-4 text-green-500" />
                      : <div className="w-4 h-4 border rounded-sm" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteCriteria(criteria.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm py-4 text-center">
          No success criteria defined yet. Add measurable criteria to define when this goal is achieved.
        </p>
      )}
    </div>
  )
}
