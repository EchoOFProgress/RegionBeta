"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Zap, Heart, Shield, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Goal, MotivationSource, MotivationTracker } from "@/lib/goals/types"

interface Props {
  goal: Goal
  onUpdateGoal: (updated: Goal) => void
}

function getOrCreateTracker(goal: Goal): MotivationTracker {
  return goal.motivationTracker || {
    level: 5, lastUpdated: new Date().toISOString().split("T")[0],
    history: [], sources: [], triggers: [], barriers: []
  }
}

export function GoalMotivation({ goal, onUpdateGoal }: Props) {
  const { toast } = useToast()
  const [newSource, setNewSource] = useState<{ type: MotivationSource['type']; content: string; description?: string }>({
    type: 'quote', content: ''
  })

  const updateLevel = (level: number, note?: string) => {
    const tracker = getOrCreateTracker(goal)
    onUpdateGoal({
      ...goal,
      motivationTracker: {
        ...tracker,
        level,
        lastUpdated: new Date().toISOString().split("T")[0],
        history: [...(tracker.history || []), { date: new Date().toISOString().split("T")[0], level, note }]
      }
    })
    toast({ title: "Motivation Updated!", description: `Motivation level updated to ${level}/10` })
  }

  const addSource = () => {
    if (!newSource.content.trim()) {
      toast({ title: "Error", description: "Please enter motivation source content", variant: "destructive" })
      return
    }
    const tracker = getOrCreateTracker(goal)
    const source: MotivationSource = {
      id: Date.now().toString(), type: newSource.type, content: newSource.content,
      description: newSource.description, addedAt: new Date().toISOString().split("T")[0]
    }
    onUpdateGoal({ ...goal, motivationTracker: { ...tracker, sources: [...(tracker.sources || []), source] } })
    setNewSource({ type: 'quote', content: '', description: '' })
    toast({ title: "Motivation Source Added!", description: "New motivation source added to goal" })
  }

  const removeSource = (sourceId: string) => {
    const tracker = getOrCreateTracker(goal)
    onUpdateGoal({ ...goal, motivationTracker: { ...tracker, sources: tracker.sources?.filter(s => s.id !== sourceId) } })
    toast({ title: "Motivation Source Removed", description: "Motivation source removed from goal" })
  }

  const addTrigger = (trigger: string) => {
    if (!trigger.trim()) return
    const tracker = getOrCreateTracker(goal)
    onUpdateGoal({ ...goal, motivationTracker: { ...tracker, triggers: [...(tracker.triggers || []), trigger] } })
  }

  const removeTrigger = (trigger: string) => {
    const tracker = getOrCreateTracker(goal)
    onUpdateGoal({ ...goal, motivationTracker: { ...tracker, triggers: tracker.triggers?.filter(t => t !== trigger) } })
  }

  const addBarrier = (barrier: string) => {
    if (!barrier.trim()) return
    const tracker = getOrCreateTracker(goal)
    onUpdateGoal({ ...goal, motivationTracker: { ...tracker, barriers: [...(tracker.barriers || []), barrier] } })
  }

  const removeBarrier = (barrier: string) => {
    const tracker = getOrCreateTracker(goal)
    onUpdateGoal({ ...goal, motivationTracker: { ...tracker, barriers: tracker.barriers?.filter(b => b !== barrier) } })
  }

  const level = goal.motivationTracker?.level || 5
  const motivColor = level < 4 ? '#ef4444' : level < 7 ? '#f59e0b' : '#10b981'

  return (
    <div className="pt-4 border-t border-border mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-foreground flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Motivation Tracker
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Level: {level}/10</span>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">Update Level</Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader><DialogTitle>Update Motivation Level</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Motivation Level (1-10)</Label>
                  <div className="flex items-center gap-2">
                    {[1,2,3,4,5,6,7,8,9,10].map(l => (
                      <Button
                        key={l}
                        variant={level === l ? "default" : "outline"}
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => updateLevel(l, `Updated to ${l}/10`)}
                      >{l}</Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motivation-note">Note (Optional)</Label>
                  <Textarea
                    id="motivation-note"
                    placeholder="Add a note about your motivation level..."
                    rows={2}
                    onChange={(e) => { if (e.target.value.trim()) updateLevel(level, e.target.value) }}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-muted-foreground">Current Motivation</span>
          <span className="font-medium">{level}/10</span>
        </div>
        <Progress
          value={level * 10}
          className="h-2"
          style={{ background: `linear-gradient(90deg, ${motivColor} 0%, ${motivColor} ${level * 10}%, #e5e7eb ${level * 10}%, #e5e7eb 100%)` }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sources */}
        <div>
          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
            <Heart className="h-4 w-4 text-red-500" />Sources
          </h4>
          <div className="space-y-2">
            {(goal.motivationTracker?.sources || []).map((source) => (
              <div key={source.id} className="flex items-start justify-between p-2 bg-muted rounded">
                <div className="flex-1">
                  <p className="text-sm font-medium">{source.content}</p>
                  <p className="text-xs text-muted-foreground">{source.description}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeSource(source.id)} className="text-destructive h-6 w-6 p-0">
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="mt-2 w-full"><Plus className="h-4 w-4 mr-2" />Add Source</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Add Motivation Source</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <select
                    value={newSource.type}
                    onChange={(e) => setNewSource({ ...newSource, type: e.target.value as MotivationSource['type'] })}
                    className="border rounded-md px-3 py-2 text-sm w-full"
                  >
                    <option value="personal">Personal</option>
                    <option value="external">External</option>
                    <option value="visual">Visual</option>
                    <option value="quote">Quote</option>
                    <option value="reward">Reward</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Content *</Label>
                  <Textarea placeholder="Enter your motivation source..." value={newSource.content} onChange={(e) => setNewSource({ ...newSource, content: e.target.value })} rows={2} />
                </div>
                <div className="space-y-2">
                  <Label>Description (Optional)</Label>
                  <Input placeholder="Add a description..." value={newSource.description || ''} onChange={(e) => setNewSource({ ...newSource, description: e.target.value })} />
                </div>
                <Button onClick={addSource} className="w-full"><Plus className="h-4 w-4 mr-2" />Add Motivation Source</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Triggers */}
        <div>
          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />Triggers
          </h4>
          <div className="space-y-2">
            {(goal.motivationTracker?.triggers || []).map((trigger, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-sm">{trigger}</span>
                <Button variant="ghost" size="sm" onClick={() => removeTrigger(trigger)} className="text-destructive h-6 w-6 p-0">
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <Input
              placeholder="Add trigger..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') { addTrigger((e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = '' }
              }}
            />
            <Button onClick={(e) => {
              const input = e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement
              if (input?.value.trim()) { addTrigger(input.value); input.value = '' }
            }} size="sm"><Plus className="h-4 w-4" /></Button>
          </div>
        </div>

        {/* Barriers */}
        <div>
          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-500" />Barriers
          </h4>
          <div className="space-y-2">
            {(goal.motivationTracker?.barriers || []).map((barrier, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-sm">{barrier}</span>
                <Button variant="ghost" size="sm" onClick={() => removeBarrier(barrier)} className="text-destructive h-6 w-6 p-0">
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <Input
              placeholder="Add barrier..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') { addBarrier((e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = '' }
              }}
            />
            <Button onClick={(e) => {
              const input = e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement
              if (input?.value.trim()) { addBarrier(input.value); input.value = '' }
            }} size="sm"><Plus className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
    </div>
  )
}
