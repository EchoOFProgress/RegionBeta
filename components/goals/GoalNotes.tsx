"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, FileText, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Goal, NoteItem } from "@/lib/goals/types"
import { getTypeColor, getIconForType } from "@/lib/goals/utils"

interface Props {
  goal: Goal
  onUpdateGoal: (updated: Goal) => void
}

export function GoalNotes({ goal, onUpdateGoal }: Props) {
  const { toast } = useToast()
  const [newNote, setNewNote] = useState({ title: '', content: '' })

  const addNote = () => {
    if (!newNote.title.trim()) {
      toast({ title: "Error", description: "Please enter a note title", variant: "destructive" })
      return
    }
    const note: NoteItem = {
      id: Date.now().toString(),
      title: newNote.title,
      content: newNote.content,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0]
    }
    onUpdateGoal({ ...goal, notes: [...(goal.notes || []), note] })
    setNewNote({ title: '', content: '' })
    toast({ title: "Note Added!", description: `Note "${newNote.title}" added to goal` })
  }

  const deleteNote = (noteId: string) => {
    onUpdateGoal({ ...goal, notes: goal.notes?.filter(n => n.id !== noteId) })
    toast({ title: "Note Removed", description: "Note removed from goal" })
  }

  return (
    <div className="pt-4 border-t border-border mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-foreground flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Notes
        </h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-2" />Add Note</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Add Note</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="note-title">Title *</Label>
                <Input id="note-title" placeholder="Note title" value={newNote.title} onChange={(e) => setNewNote({ ...newNote, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="note-content">Content</Label>
                <Textarea id="note-content" placeholder="Write your note here..." value={newNote.content} onChange={(e) => setNewNote({ ...newNote, content: e.target.value })} rows={4} />
              </div>
              <Button onClick={addNote} className="w-full"><Plus className="h-4 w-4 mr-2" />Add Note</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {goal.notes && goal.notes.length > 0 ? (
        <div className="space-y-3">
          {goal.notes.map((note) => (
            <div key={note.id} className="p-3 rounded-lg border border-border bg-card">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${getTypeColor('note')}`}>{getIconForType('note')}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{note.title}</p>
                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{note.content}</p>
                    <div className="text-xs text-muted-foreground mt-2">
                      Created: {note.createdAt} | Updated: {note.updatedAt}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteNote(note.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm py-4 text-center">
          No notes added yet. Add notes to capture thoughts, ideas, or progress related to this goal.
        </p>
      )}
    </div>
  )
}
