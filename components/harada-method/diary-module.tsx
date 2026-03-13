"use client"

import { useState, useEffect, type KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { getDiaryEntriesForUser, saveDiaryEntry } from "./storage"
import type { DiaryEntry } from "./types"
import { toast } from "@/hooks/use-toast"
import { X, Save, ChevronLeft, ChevronRight, Smile, Meh, Frown, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

const MOOD_OPTIONS = [
  {
    value: 1 as const,
    icon: Frown,
    color: "text-red-500 hover:bg-red-50",
    bgActive: "bg-red-100 border-red-300",
    label: "Velmi špatná",
  },
  {
    value: 2 as const,
    icon: Frown,
    color: "text-orange-500 hover:bg-orange-50",
    bgActive: "bg-orange-100 border-orange-300",
    label: "Špatná",
  },
  {
    value: 3 as const,
    icon: Meh,
    color: "text-yellow-500 hover:bg-yellow-50",
    bgActive: "bg-yellow-100 border-yellow-300",
    label: "Neutrální",
  },
  {
    value: 4 as const,
    icon: Smile,
    color: "text-lime-500 hover:bg-lime-50",
    bgActive: "bg-lime-100 border-lime-300",
    label: "Dobrá",
  },
  {
    value: 5 as const,
    icon: Smile,
    color: "text-green-500 hover:bg-green-50",
    bgActive: "bg-green-100 border-green-300",
    label: "Výborná",
  },
]

interface DiaryModuleProps {
  userId: string
  onComplete?: () => void
}

export function DiaryModule({ userId, onComplete }: DiaryModuleProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [currentEntry, setCurrentEntry] = useState<DiaryEntry | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const [formData, setFormData] = useState({
    mood: 3 as 1 | 2 | 3 | 4 | 5,
    achievements: [""],
    challenges: [""],
    gratitude: [""],
    tomorrowGoals: [""],
    reflection: "",
    energyLevel: 50,
    productivityScore: 50,
  })

  useEffect(() => {
    const userEntries = getDiaryEntriesForUser(userId)
    setEntries(userEntries)
  }, [userId])

  useEffect(() => {
    if (entries.length > 0) {
      const entry = entries.find((e) => e.date === selectedDate)
      if (entry) {
        setCurrentEntry(entry)
        setFormData({
          mood: entry.mood,
          achievements: entry.achievements.length > 0 ? entry.achievements : [""],
          challenges: entry.challenges.length > 0 ? entry.challenges : [""],
          gratitude: entry.gratitude.length > 0 ? entry.gratitude : [""],
          tomorrowGoals: entry.tomorrowGoals.length > 0 ? entry.tomorrowGoals : [""],
          reflection: entry.reflection,
          energyLevel: entry.energyLevel,
          productivityScore: entry.productivityScore,
        })
        setIsEditing(false)
      } else {
        setCurrentEntry(null)
        setFormData({
          mood: 3,
          achievements: [""],
          challenges: [""],
          gratitude: [""],
          tomorrowGoals: [""],
          reflection: "",
          energyLevel: 50,
          productivityScore: 50,
        })
        if (selectedDate === new Date().toISOString().split("T")[0]) {
          setIsEditing(true)
        }
      }
    }
  }, [entries, selectedDate])

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
        // Focus new input after state updates
        setTimeout(() => {
          const inputs = document.querySelectorAll(`[data-field="${field}"]`)
          const nextInput = inputs[index + 1] as HTMLInputElement
          nextInput?.focus()
        }, 0)
      }
    }
  }

  const handleSave = () => {
    const isNew = !currentEntry

    const entry: DiaryEntry = {
      id: currentEntry?.id || crypto.randomUUID(),
      userId: userId,
      date: selectedDate,
      mood: formData.mood,
      achievements: formData.achievements.filter((a) => a.trim()),
      challenges: formData.challenges.filter((c) => c.trim()),
      gratitude: formData.gratitude.filter((g) => g.trim()),
      tomorrowGoals: formData.tomorrowGoals.filter((t) => t.trim()),
      reflection: formData.reflection,
      energyLevel: formData.energyLevel,
      productivityScore: formData.productivityScore,
      createdAt: currentEntry?.createdAt || new Date().toISOString(),
    }

    saveDiaryEntry(entry)
    setCurrentEntry(entry)
    setEntries((prev) => {
      const filtered = prev.filter((e) => e.id !== entry.id)
      return [...filtered, entry]
    })
    setIsEditing(false)

    toast({
      title: isNew ? "Deníkový záznam uložen!" : "Záznam aktualizován",
      description: isNew ? "Váš deník byl uložen." : "Váš záznam byl aktualizován.",
    })

    if (isNew && onComplete) {
      onComplete()
    }
  }

  const changeDate = (days: number) => {
    const date = new Date(selectedDate)
    date.setDate(date.getDate() + days)
    const newDate = date.toISOString().split("T")[0]
    if (newDate <= new Date().toISOString().split("T")[0]) {
      setSelectedDate(newDate)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date().toISOString().split("T")[0]
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split("T")[0]

    if (dateStr === today) return "Dnes"
    if (dateStr === yesterdayStr) return "Včera"

    return date.toLocaleDateString("cs-CZ", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
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
          <h2 className="text-2xl font-bold">Denní deník</h2>
          <p className="text-muted-foreground">Zaznamenávejte své myšlenky, úspěchy a plány</p>
        </div>
        {currentEntry && !isEditing && selectedDate === new Date().toISOString().split("T")[0] && (
          <Button onClick={() => setIsEditing(true)}>Upravit záznam</Button>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => changeDate(-1)}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="text-center">
              <p className="font-semibold">{formatDate(selectedDate)}</p>
              <p className="text-sm text-muted-foreground">{selectedDate}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => changeDate(1)}
              disabled={selectedDate >= new Date().toISOString().split("T")[0]}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {!currentEntry && !isEditing && selectedDate !== new Date().toISOString().split("T")[0] ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Pro tento den není žádný záznam</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Jak se dnes cítíte?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-2 md:gap-4">
                {MOOD_OPTIONS.map((option) => {
                  const Icon = option.icon
                  const isSelected = formData.mood === option.value
                  return (
                    <button
                      key={option.value}
                      onClick={() => isEditing && setFormData((prev) => ({ ...prev, mood: option.value }))}
                      disabled={!isEditing}
                      className={cn(
                        "flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all",
                        isSelected ? option.bgActive : "border-transparent",
                        isEditing ? option.color : "opacity-50 cursor-default",
                        isEditing && "cursor-pointer",
                      )}
                    >
                      <Icon className={cn("w-8 h-8 md:w-10 md:h-10", isSelected && option.color.split(" ")[0])} />
                      <span className="text-xs font-medium">{option.label}</span>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Energie</CardTitle>
                <CardDescription>Jaká byla vaše úroveň energie?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center text-2xl font-bold">{formData.energyLevel}%</div>
                  {isEditing && (
                    <Slider
                      value={[formData.energyLevel]}
                      onValueChange={([v]) => setFormData((prev) => ({ ...prev, energyLevel: v }))}
                      min={0}
                      max={100}
                      step={5}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Produktivita</CardTitle>
                <CardDescription>Jak produktivní jste byli?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center text-2xl font-bold">{formData.productivityScore}%</div>
                  {isEditing && (
                    <Slider
                      value={[formData.productivityScore]}
                      onValueChange={([v]) => setFormData((prev) => ({ ...prev, productivityScore: v }))}
                      min={0}
                      max={100}
                      step={5}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Dnešní úspěchy</CardTitle>
              <CardDescription>Co se vám dnes povedlo?</CardDescription>
            </CardHeader>
            <CardContent>{renderArrayField("achievements", "", "Např. Dokončil jsem projekt")}</CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Výzvy a překážky</CardTitle>
              <CardDescription>S čím jste se potýkali?</CardDescription>
            </CardHeader>
            <CardContent>{renderArrayField("challenges", "", "Např. Prokrastinace")}</CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vděčnost</CardTitle>
              <CardDescription>Za co jste dnes vděční?</CardDescription>
            </CardHeader>
            <CardContent>{renderArrayField("gratitude", "", "Např. Podporující rodina")}</CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cíle na zítra</CardTitle>
              <CardDescription>Co chcete zítra dosáhnout?</CardDescription>
            </CardHeader>
            <CardContent>{renderArrayField("tomorrowGoals", "", "Např. Ranní běh")}</CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reflexe</CardTitle>
              <CardDescription>Volné myšlenky a poznámky</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.reflection}
                onChange={(e) => setFormData((prev) => ({ ...prev, reflection: e.target.value }))}
                placeholder="Vaše myšlenky..."
                disabled={!isEditing}
                rows={4}
              />
            </CardContent>
          </Card>

          {isEditing && (
            <div className="flex justify-end gap-4">
              {currentEntry && (
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Zrušit
                </Button>
              )}
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Uložit záznam
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}