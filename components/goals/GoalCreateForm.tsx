"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { useToast } from "@/hooks/use-toast"
import { Goal } from "@/lib/goals/types"

interface GoalCreateFormProps {
  onSubmit: (goal: Goal) => void
  onCancel: () => void
  goals?: Goal[]
}

export function GoalCreateForm({ onSubmit, onCancel, goals = [] }: GoalCreateFormProps) {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [targetDate, setTargetDate] = useState("")

  const handleSubmit = () => {
    if (!title.trim()) {
      toast({ title: t("Error"), description: t("Please enter a goal title"), variant: "destructive" })
      return
    }
    if (goals.some(g => g.title.toLowerCase() === title.trim().toLowerCase())) {
      toast({ title: t("Duplicate Title"), description: t("A goal with this title already exists."), variant: "destructive" })
      return
    }
    
    const goal: Goal = {
      id: Date.now().toString(),
      title: title.trim(),
      description,
      targetDate: targetDate || undefined,
      linkedTasks: [],
      linkedHabits: [],
      linkedChallenges: [],
      createdAt: new Date().toISOString().split("T")[0],
    }
    
    onSubmit(goal)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t("Goal Title")}</Label>
        <Input
          placeholder={t("e.g., Improve physical health through exercise")}
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
        />
      </div>
      <div className="space-y-2">
        <Label>{t("Description")}</Label>
        <Textarea
          placeholder={t("Add details about this goal...")}
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label>{t("Target Date")}</Label>
        <Input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel}>{t("Cancel")}</Button>
        <Button onClick={handleSubmit}>
          <Plus className="h-4 w-4 mr-2" />{t("Create Goal")}
        </Button>
      </div>
    </div>
  )
}
