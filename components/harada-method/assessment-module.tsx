"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { QUESTIONS, CATEGORIES, calculateCategoryScore } from "./questions"
import { saveAssessment, getLatestAssessment } from "./storage"
import type { SelfRelianceAssessment, SelfRelianceAnswer } from "./types"
import { toast } from "@/hooks/use-toast"
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface AssessmentModuleProps {
  userId: string
  onComplete?: () => void
}

export function AssessmentModule({ userId, onComplete }: AssessmentModuleProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<SelfRelianceAnswer[]>([])
  const [completed, setCompleted] = useState(false)
  const [result, setResult] = useState<SelfRelianceAssessment | null>(null)
  const [previousAssessment, setPreviousAssessment] = useState<SelfRelianceAssessment | null>(null)

  useEffect(() => {
    const latest = getLatestAssessment(userId)
    setPreviousAssessment(latest)
  }, [userId])

  const question = QUESTIONS[currentQuestion]
  const category = CATEGORIES[question.category]
  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100

  const currentAnswer = answers.find((a) => a.questionId === question.id)

  const handleAnswer = (score: number) => {
    const newAnswer: SelfRelianceAnswer = {
      questionId: question.id,
      score,
    }
    setAnswers((prev) => {
      const filtered = prev.filter((a) => a.questionId !== question.id)
      return [...filtered, newAnswer]
    })

    // Auto-advance after short delay for visual feedback
    setTimeout(() => {
      if (currentQuestion < QUESTIONS.length - 1) {
        setCurrentQuestion((prev) => prev + 1)
      } else {
        completeAssessment([...answers.filter((a) => a.questionId !== question.id), newAnswer])
      }
    }, 200)
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
    }
  }

  const completeAssessment = (finalAnswers: SelfRelianceAnswer[]) => {
    const categories = {
      mentalAttitude: calculateCategoryScore(finalAnswers, "mentalAttitude"),
      healthManagement: calculateCategoryScore(finalAnswers, "healthManagement"),
      livingAttitude: calculateCategoryScore(finalAnswers, "livingAttitude"),
      skills: calculateCategoryScore(finalAnswers, "skills"),
    }

    const totalScore = Math.round(
      (categories.mentalAttitude + categories.healthManagement + categories.livingAttitude + categories.skills) / 4,
    )

    const assessment: SelfRelianceAssessment = {
      id: crypto.randomUUID(),
      userId: userId,
      answers: finalAnswers,
      categories,
      totalScore,
      completedAt: new Date().toISOString(),
    }

    saveAssessment(assessment)
    setResult(assessment)
    setCompleted(true)
    
    toast({
      title: "Sebehodnocení dokončeno!",
      description: "Získali jste 50 bodů",
    })
    
    if (onComplete) {
      onComplete()
    }
  }

  const startNewAssessment = () => {
    setAnswers([])
    setCurrentQuestion(0)
    setCompleted(false)
    setResult(null)
  }

  const answerOptions = [
    { value: 1, label: "Rozhodně nesouhlasím", color: "hover:bg-red-50 hover:border-red-300" },
    { value: 2, label: "Spíše nesouhlasím", color: "hover:bg-orange-50 hover:border-orange-300" },
    { value: 3, label: "Neutrální", color: "hover:bg-yellow-50 hover:border-yellow-300" },
    { value: 4, label: "Spíše souhlasím", color: "hover:bg-lime-50 hover:border-lime-300" },
    { value: 5, label: "Rozhodně souhlasím", color: "hover:bg-green-50 hover:border-green-300" },
  ]

  if (completed && result) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
          <h2 className="text-2xl font-bold">Sebehodnocení dokončeno!</h2>
          <p className="text-muted-foreground">Zde jsou vaše výsledky</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Celkové skóre</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mt-4">
                <p className="text-4xl font-bold">{result.totalScore}%</p>
                <p className="text-muted-foreground">z maximálního skóre</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kategorie</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(Object.keys(CATEGORIES) as (keyof typeof CATEGORIES)[]).map((key) => {
                const cat = CATEGORIES[key]
                const score = result.categories[key]
                const prevScore = previousAssessment?.categories[key]
                const diff = prevScore !== undefined ? score - prevScore : null

                return (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{cat.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{score}%</span>
                        {diff !== null && diff !== 0 && (
                          <span className={diff > 0 ? "text-green-500 text-sm" : "text-red-500 text-sm"}>
                            {diff > 0 ? "+" : ""}
                            {diff}%
                          </span>
                        )}
                      </div>
                    </div>
                    <Progress value={score} className="h-2" />
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={startNewAssessment}>
            Nové hodnocení
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Sebehodnocení</h2>
        <p className="text-muted-foreground">Ohodnoťte sami sebe v 33 oblastech života</p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>
            Otázka {currentQuestion + 1} z {QUESTIONS.length}
          </span>
          <span className="font-medium" style={{ color: category.color }}>
            {category.name}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{question.text}</CardTitle>
          {question.description && <CardDescription>{question.description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {answerOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                className={cn(
                  "w-full flex items-center gap-3 p-4 rounded-lg border text-left transition-all",
                  currentAnswer?.score === option.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : `border-border ${option.color}`,
                )}
              >
                <div
                  className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0",
                    currentAnswer?.score === option.value ? "border-primary-foreground" : "border-muted-foreground/50",
                  )}
                >
                  {currentAnswer?.score === option.value && (
                    <div className="w-3 h-3 rounded-full bg-primary-foreground" />
                  )}
                </div>
                <span className="font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Předchozí
        </Button>
        <span className="text-sm text-muted-foreground self-center">Klikněte na odpověď pro pokračování</span>
      </div>
    </div>
  )
}