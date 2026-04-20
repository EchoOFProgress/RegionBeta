"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Target, Settings, Trash2, CheckSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Goal, Milestone } from "@/lib/goals/types"
import { updateGoalProgress, getTypeColor, getIconForType } from "@/lib/goals/utils"

interface Props {
  goal: Goal
  onUpdateGoal: (updated: Goal) => void
  isMounted: boolean
}

export function GoalMilestones({ goal, onUpdateGoal, isMounted }: Props) {
  const { toast } = useToast()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [targetDate, setTargetDate] = useState("")
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editTargetDate, setEditTargetDate] = useState("")

  const addMilestone = () => {
    if (!title.trim()) {
      toast({ title: "Error", description: "Please enter a milestone title", variant: "destructive" })
      return
    }
    const milestone: Milestone = {
      id: Date.now().toString(),
      title,
      description,
      targetDate,
      completed: false,
      linkedModules: { tasks: [], habits: [], challenges: [] }
    }
    onUpdateGoal(updateGoalProgress({ ...goal, milestones: [...(goal.milestones || []), milestone] }))
    setTitle(""); setDescription(""); setTargetDate("")
    toast({ title: "Milestone Added!", description: `Milestone "${title}" added to goal` })
  }

  const deleteMilestone = (milestoneId: string) => {
    onUpdateGoal(updateGoalProgress({ ...goal, milestones: goal.milestones?.filter(m => m.id !== milestoneId) }))
    toast({ title: "Milestone Deleted", description: "Milestone removed from goal" })
  }

  const toggleMilestone = (milestoneId: string) => {
    const updated = goal.milestones?.map(m =>
      m.id === milestoneId
        ? { ...m, completed: !m.completed, completedDate: !m.completed ? new Date().toISOString().split("T")[0] : undefined }
        : m
    )
    onUpdateGoal(updateGoalProgress({ ...goal, milestones: updated }))
    toast({ title: "Milestone Updated!", description: "Milestone completion status updated" })
  }

  const openEdit = (milestone: Milestone) => {
    setEditingMilestone(milestone)
    setEditTitle(milestone.title)
    setEditDescription(milestone.description)
    setEditTargetDate(milestone.targetDate || "")
  }

  const saveEdit = () => {
    if (!editingMilestone) return
    const updated = goal.milestones?.map(m =>
      m.id === editingMilestone.id
        ? { ...m, title: editTitle, description: editDescription, targetDate: editTargetDate }
        : m
    )
    onUpdateGoal(updateGoalProgress({ ...goal, milestones: updated }))
    setEditingMilestone(null)
    toast({ title: "Milestone Updated!", description: "Milestone details updated successfully" })
  }

  return (
    <div className="pt-4 border-t border-border mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-foreground flex items-center gap-2">
          <Target className="h-4 w-4" />
          Milestones
        </h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-2" />Add Milestone</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Add New Milestone</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="milestone-title">Title *</Label>
                <Input id="milestone-title" placeholder="e.g., Complete first phase" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="milestone-description">Description</Label>
                <Textarea id="milestone-description" placeholder="Describe this milestone..." value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="milestone-target-date">Target Date</Label>
                <Input id="milestone-target-date" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
              </div>
              <Button onClick={addMilestone} className="w-full"><Plus className="h-4 w-4 mr-2" />Add Milestone</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {goal.milestones && goal.milestones.length > 0 ? (
        <div className="space-y-3">
          {goal.milestones.map((milestone) => (
            <div key={milestone.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
              <div className={`p-2 rounded-full ${getTypeColor('milestone')}`}>{getIconForType('milestone')}</div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${milestone.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{milestone.title}</p>
                <p className="text-xs text-muted-foreground mt-1 truncate">{milestone.description}</p>
                {milestone.targetDate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Target: {isMounted ? new Date(milestone.targetDate).toLocaleDateString('en-US') : "..."}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={milestone.completed ? "default" : "secondary"}>
                  {milestone.completed ? "Completed" : "Pending"}
                </Badge>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(milestone)}>
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Edit Milestone</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Title *</Label>
                        <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={2} />
                      </div>
                      <div className="space-y-2">
                        <Label>Target Date</Label>
                        <Input type="date" value={editTargetDate} onChange={(e) => setEditTargetDate(e.target.value)} />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setEditingMilestone(null)}>Cancel</Button>
                        <Button onClick={saveEdit}>Save Changes</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="ghost" size="icon" onClick={() => toggleMilestone(milestone.id)} className="text-muted-foreground hover:text-foreground">
                  {milestone.completed ? <CheckSquare className="h-4 w-4 text-green-500" /> : <div className="w-4 h-4 border rounded-sm" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => deleteMilestone(milestone.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm py-4 text-center">
          No milestones yet. Add milestones to track progress toward your goal.
        </p>
      )}
    </div>
  )
}
