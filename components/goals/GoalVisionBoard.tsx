"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Target, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Goal, VisionItem } from "@/lib/goals/types"

interface Props {
  goal: Goal
  onUpdateGoal: (updated: Goal) => void
}

export function GoalVisionBoard({ goal, onUpdateGoal }: Props) {
  const { toast } = useToast()
  const [newItem, setNewItem] = useState<{ type: 'image' | 'quote' | 'note'; content: string; caption?: string }>({
    type: 'image', content: '', caption: ''
  })

  const addItem = () => {
    if (!newItem.content.trim()) {
      toast({ title: "Error", description: "Please enter content for the vision item", variant: "destructive" })
      return
    }
    const item: VisionItem = {
      id: Date.now().toString(),
      type: newItem.type,
      content: newItem.content,
      caption: newItem.caption,
      addedAt: new Date().toISOString().split("T")[0]
    }
    onUpdateGoal({ ...goal, visionBoard: [...(goal.visionBoard || []), item] })
    setNewItem({ type: 'image', content: '', caption: '' })
    toast({ title: "Vision Item Added!", description: "Vision item added to goal vision board" })
  }

  const deleteItem = (itemId: string) => {
    onUpdateGoal({ ...goal, visionBoard: goal.visionBoard?.filter(v => v.id !== itemId) })
    toast({ title: "Vision Item Removed", description: "Vision item removed from vision board" })
  }

  return (
    <div className="pt-4 border-t border-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-foreground flex items-center gap-2">
          <Target className="h-4 w-4" />
          Vision Board
        </h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Vision
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add to Vision Board</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vision-type">Type</Label>
                <select
                  id="vision-type"
                  value={newItem.type}
                  onChange={(e) => setNewItem({ ...newItem, type: e.target.value as 'image' | 'quote' | 'note' })}
                  className="border rounded-md px-3 py-2 text-sm w-full"
                >
                  <option value="image">Image</option>
                  <option value="quote">Quote</option>
                  <option value="note">Note</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vision-content">Content</Label>
                {newItem.type === 'image' ? (
                  <Input
                    id="vision-content"
                    placeholder="Enter image URL"
                    value={newItem.content}
                    onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
                  />
                ) : (
                  <Textarea
                    id="vision-content"
                    placeholder={newItem.type === 'quote' ? "Enter your inspiring quote" : "Enter your note"}
                    value={newItem.content}
                    onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
                    rows={3}
                  />
                )}
              </div>
              {newItem.type === 'image' && (
                <div className="space-y-2">
                  <Label htmlFor="vision-caption">Caption (Optional)</Label>
                  <Input
                    id="vision-caption"
                    placeholder="Add a caption for your image"
                    value={newItem.caption || ''}
                    onChange={(e) => setNewItem({ ...newItem, caption: e.target.value })}
                  />
                </div>
              )}
              <Button onClick={addItem} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add to Vision Board
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {goal.visionBoard && goal.visionBoard.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {goal.visionBoard.map((item) => (
            <div key={item.id} className="rounded-lg border border-border bg-card p-4 relative group">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => deleteItem(item.id)}
              >
                <X className="h-4 w-4" />
              </Button>
              {item.type === 'image' ? (
                <div className="flex flex-col items-center">
                  <img
                    src={item.content}
                    alt={item.caption || "Vision board item"}
                    className="w-full h-32 object-cover rounded-md mb-2"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>'
                    }}
                  />
                  {item.caption && <p className="text-sm text-center text-muted-foreground mt-1">{item.caption}</p>}
                </div>
              ) : (
                <div className="flex flex-col">
                  <div className="flex items-start gap-2">
                    <div className="mt-1 text-primary">{item.type === 'quote' ? '"' : '📝'}</div>
                    <p className="text-sm">{item.content}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm py-4 text-center">
          No vision items yet. Add inspiring images, quotes, or notes to your vision board.
        </p>
      )}
    </div>
  )
}
