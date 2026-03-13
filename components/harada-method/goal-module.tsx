"use client"

import { useState, useEffect, type KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getActiveLongTermGoal, saveLongTermGoal } from "./storage"
import type { LongTermGoal } from "./types"
import { toast } from "@/hooks/use-toast"
import { X, Save, Target, Calendar, Users, Lightbulb } from "lucide-react"

interface GoalModuleProps {
  userId: string
  onComplete?: () => void
}

export function GoalModule({ userId, onComplete }: GoalModuleProps) {
  const [goal, setGoal] = useState<LongTermGoal | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const [formData, setFormData] = useState({
    targetDate: "",
    goalDescription: "",
    motivation: "",
    currentState: "",
    desiredState: "",
    obstacles: [""],
    resources: [""],
    supporters: [""],
    dailyHabits: [""],
    weeklyMilestones: [""],
    monthlyTargets: [""],
  })

  useEffect(() => {
    const existingGoal = getActiveLongTermGoal(userId)
    if (existingGoal) {
      setGoal(existingGoal)
      setFormData({
        targetDate: existingGoal.targetDate,
        goalDescription: existingGoal.goalDescription,
        motivation: existingGoal.motivation,
        currentState: existingGoal.currentState,
        desiredState: existingGoal.desiredState,
        obstacles: existingGoal.obstacles.length > 0 ? existingGoal.obstacles : [""],
        resources: existingGoal.resources.length > 0 ? existingGoal.resources : [""],
        supporters: existingGoal.supporters.length > 0 ? existingGoal.supporters : [""],
        dailyHabits: existingGoal.dailyHabits.length > 0 ? existingGoal.dailyHabits : [""],
        weeklyMilestones: existingGoal.weeklyMilestones.length > 0 ? existingGoal.weeklyMilestones : [""],
        monthlyTargets: existingGoal.monthlyTargets.length > 0 ? existingGoal.monthlyTargets : [""],
      })
    } else {
      setIsEditing(true)
    }
  }, [userId])

  const handleArrayAdd = (field: keyof typeof formData) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...(prev[field] as string[]), ""],
    }))
  }

  const handleArrayRemove = (field: keyof typeof formData, index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index),
    }))
  }

  const handleArrayChange = (field: keyof typeof formData, index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).map((item, i) => (i === index ? value : item)),
    }))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, field: keyof typeof formData, index: number) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      const currentValue = (formData[field] as string[])[index]
      if (currentValue.trim()) {
        handleArrayAdd(field)
        setTimeout(() => {
          const inputs = document.querySelectorAll(`[data-field="${field}"]`)
          const nextInput = inputs[index + 1] as HTMLInputElement
          nextInput?.focus()
        }, 0)
      }
    }
  }

  const handleSave = () => {
    if (!formData.goalDescription || !formData.targetDate) {
      toast({
        title: "Chyba",
        description: "Vyplňte prosím cíl a datum",
        variant: "destructive",
      })
      return
    }

    const isNew = !goal
    const newGoal: LongTermGoal = {
      id: goal?.id || crypto.randomUUID(),
      userId: userId,
      targetDate: formData.targetDate,
      goalDescription: formData.goalDescription,
      motivation: formData.motivation,
      currentState: formData.currentState,
      desiredState: formData.desiredState,
      obstacles: formData.obstacles.filter((o) => o.trim()),
      resources: formData.resources.filter((r) => r.trim()),
      supporters: formData.supporters.filter((s) => s.trim()),
      dailyHabits: formData.dailyHabits.filter((h) => h.trim()),
      weeklyMilestones: formData.weeklyMilestones.filter((m) => m.trim()),
      monthlyTargets: formData.monthlyTargets.filter((t) => t.trim()),
      createdAt: goal?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    saveLongTermGoal(newGoal)
    setGoal(newGoal)
    setIsEditing(false)

    toast({
      title: isNew ? "Cíl vytvořen!" : "Cíl aktualizován!",
      description: isNew ? "Začali jste pracovat na svém cíli." : "Váš cíl byl aktualizován.",
    })

    if (isNew && onComplete) {
      onComplete()
    }
  }

  const renderArrayField = (field: keyof typeof formData, label: string, placeholder: string) => (
    <div className="space-y-3">
      <Label>{label}</Label>
      {(formData[field] as string[]).map((item, index) => (
        <div key={index} className="flex gap-2">
          <Input
            data-field={field}
            value={item}
            onChange={(e) => handleArrayChange(field, index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, field, index)}
            placeholder={placeholder}
            disabled={!isEditing}
          />
          {isEditing && (formData[field] as string[]).length > 1 && (
            <Button type="button" variant="ghost" size="icon" onClick={() => handleArrayRemove(field, index)}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      ))}
      {isEditing && <p className="text-xs text-muted-foreground">Stiskněte Enter pro přidání dalšího řádku</p>}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Dlouhodobý cíl</h2>
          <p className="text-muted-foreground">Definujte svůj hlavní cíl a plán k jeho dosažení</p>
        </div>
        {goal && !isEditing && <Button onClick={() => setIsEditing(true)}>Upravit cíl</Button>}
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Hlavní cíl
            </CardTitle>
            <CardDescription>Co chcete dosáhnout? Buďte konkrétní a měřitelní.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goalDescription">Popis cíle *</Label>
              <Textarea
                id="goalDescription"
                value={formData.goalDescription}
                onChange={(e) => setFormData((prev) => ({ ...prev, goalDescription: e.target.value }))}
                placeholder="Např. Naučit se plynně mluvit anglicky na úrovni C1"
                disabled={!isEditing}
                rows={3}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetDate">Cílové datum *</Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, targetDate: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              Motivace a kontext
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="motivation">Proč je tento cíl pro vás důležitý?</Label>
              <Textarea
                id="motivation"
                value={formData.motivation}
                onChange={(e) => setFormData((prev) => ({ ...prev, motivation: e.target.value }))}
                placeholder="Co vás motivuje k dosažení tohoto cíle?"
                disabled={!isEditing}
                rows={2}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentState">Současný stav</Label>
                <Textarea
                  id="currentState"
                  value={formData.currentState}
                  onChange={(e) => setFormData((prev) => ({ ...prev, currentState: e.target.value }))}
                  placeholder="Kde se nyní nacházíte?"
                  disabled={!isEditing}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desiredState">Požadovaný stav</Label>
                <Textarea
                  id="desiredState"
                  value={formData.desiredState}
                  onChange={(e) => setFormData((prev) => ({ ...prev, desiredState: e.target.value }))}
                  placeholder="Kam chcete dojít?"
                  disabled={!isEditing}
                  rows={2}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Překážky</CardTitle>
              <CardDescription>Co vám může bránit v dosažení cíle?</CardDescription>
            </CardHeader>
            <CardContent>{renderArrayField("obstacles", "", "Např. Nedostatek času")}</CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Zdroje</CardTitle>
              <CardDescription>Co vám pomůže cíle dosáhnout?</CardDescription>
            </CardHeader>
            <CardContent>{renderArrayField("resources", "", "Např. Online kurzy")}</CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-500" />
              Podporovatelé
            </CardTitle>
            <CardDescription>Kdo vám může pomoci na cestě k cíli?</CardDescription>
          </CardHeader>
          <CardContent>{renderArrayField("supporters", "", "Např. Mentor, rodina")}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Milníky a návyky
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderArrayField("dailyHabits", "Denní návyky", "Např. 30 minut studia")}
            {renderArrayField("weeklyMilestones", "Týdenní milníky", "Např. Dokončit 1 lekci")}
            {renderArrayField("monthlyTargets", "Měsíční cíle", "Např. Složit test úrovně")}
          </CardContent>
        </Card>

        {isEditing && (
          <div className="flex justify-end gap-4">
            {goal && (
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Zrušit
              </Button>
            )}
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Uložit cíl
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}