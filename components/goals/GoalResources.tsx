"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Link, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Goal, ResourceItem } from "@/lib/goals/types"
import { getTypeColor, getIconForType } from "@/lib/goals/utils"

interface Props {
  goal: Goal
  onUpdateGoal: (updated: Goal) => void
}

export function GoalResources({ goal, onUpdateGoal }: Props) {
  const { toast } = useToast()
  const [newResource, setNewResource] = useState<{
    type: ResourceItem['type']; name: string; url?: string; description?: string
  }>({ type: 'document', name: '' })

  const addResource = () => {
    if (!newResource.name.trim()) {
      toast({ title: "Error", description: "Please enter a resource name", variant: "destructive" })
      return
    }
    const resource: ResourceItem = {
      id: Date.now().toString(),
      type: newResource.type,
      name: newResource.name,
      url: newResource.url,
      description: newResource.description,
      addedAt: new Date().toISOString().split("T")[0]
    }
    onUpdateGoal({ ...goal, resourcesList: [...(goal.resourcesList || []), resource] })
    setNewResource({ type: 'document', name: '', url: '', description: '' })
    toast({ title: "Resource Added!", description: `Resource "${newResource.name}" added to goal` })
  }

  const deleteResource = (resourceId: string) => {
    onUpdateGoal({ ...goal, resourcesList: goal.resourcesList?.filter(r => r.id !== resourceId) })
    toast({ title: "Resource Removed", description: "Resource removed from goal" })
  }

  return (
    <div className="pt-4 border-t border-border mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-foreground flex items-center gap-2">
          <Link className="h-4 w-4" />
          Resources
        </h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-2" />Add Resource</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Add Resource</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resource-type">Type</Label>
                <select
                  id="resource-type"
                  value={newResource.type}
                  onChange={(e) => setNewResource({ ...newResource, type: e.target.value as ResourceItem['type'] })}
                  className="border rounded-md px-3 py-2 text-sm w-full"
                >
                  <option value="document">Document</option>
                  <option value="link">Link</option>
                  <option value="budget">Budget</option>
                  <option value="contact">Contact</option>
                  <option value="equipment">Equipment</option>
                  <option value="learning">Learning Material</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="resource-name">Name *</Label>
                <Input id="resource-name" placeholder="Enter resource name" value={newResource.name} onChange={(e) => setNewResource({ ...newResource, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resource-url">URL (Optional)</Label>
                <Input id="resource-url" placeholder="https://example.com" value={newResource.url || ''} onChange={(e) => setNewResource({ ...newResource, url: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resource-description">Description (Optional)</Label>
                <Textarea id="resource-description" placeholder="Add details about this resource..." value={newResource.description || ''} onChange={(e) => setNewResource({ ...newResource, description: e.target.value })} rows={2} />
              </div>
              <Button onClick={addResource} className="w-full"><Plus className="h-4 w-4 mr-2" />Add Resource</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {goal.resourcesList && goal.resourcesList.length > 0 ? (
        <div className="space-y-3">
          {goal.resourcesList.map((resource) => (
            <div key={resource.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
              <div className={`p-2 rounded-full ${getTypeColor('resource')}`}>{getIconForType('resource')}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{resource.name}</p>
                {resource.description && <p className="text-xs text-muted-foreground mt-1 truncate">{resource.description}</p>}
                <Badge variant="outline" className="mt-1 capitalize">{resource.type}</Badge>
                {resource.url && (
                  <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline block mt-1">
                    {resource.url}
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{resource.addedAt}</span>
                <Button variant="ghost" size="icon" onClick={() => deleteResource(resource.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm py-4 text-center">
          No resources added yet. Add documents, links, contacts, or other resources to support this goal.
        </p>
      )}
    </div>
  )
}
