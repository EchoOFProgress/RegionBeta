"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  Target, 
  ClipboardCheck, 
  Grid3X3, 
  CheckSquare, 
  BookOpen, 
  Trophy,
  BarChart3,
  Zap
} from "lucide-react"
import { AssessmentModule } from "./harada-method/assessment-module"
import { GoalModule } from "./harada-method/goal-module"
import { ChartModule } from "./harada-method/chart-module"
import { RoutineModule } from "./harada-method/routine-module"
import { DiaryModule } from "./harada-method/diary-module"
import { AchievementsModule } from "./harada-method/achievements-module"
import { initializeTestData } from "./harada-method/test-data"

export function HaradaMethod() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "goal" | "assessment" | "chart" | "routine" | "diary" | "achievements" | "test-data">("dashboard")
  
  // In a real implementation, this would come from auth context
  const userId = "user1"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Harada Method</h1>
        <p className="text-muted-foreground">Japanese method for achieving personal goals through systematic planning</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b">
        <Button
          variant={activeTab === "dashboard" ? "default" : "ghost"}
          onClick={() => setActiveTab("dashboard")}
          className="flex items-center gap-2"
        >
          <BarChart3 className="w-4 h-4" />
          Dashboard
        </Button>
        <Button
          variant={activeTab === "goal" ? "default" : "ghost"}
          onClick={() => setActiveTab("goal")}
          className="flex items-center gap-2"
        >
          <Target className="w-4 h-4" />
          Long-term Goal
        </Button>
        <Button
          variant={activeTab === "assessment" ? "default" : "ghost"}
          onClick={() => setActiveTab("assessment")}
          className="flex items-center gap-2"
        >
          <ClipboardCheck className="w-4 h-4" />
          Self-Assessment
        </Button>
        <Button
          variant={activeTab === "chart" ? "default" : "ghost"}
          onClick={() => setActiveTab("chart")}
          className="flex items-center gap-2"
        >
          <Grid3X3 className="w-4 h-4" />
          64 Chart
        </Button>
        <Button
          variant={activeTab === "routine" ? "default" : "ghost"}
          onClick={() => setActiveTab("routine")}
          className="flex items-center gap-2"
        >
          <CheckSquare className="w-4 h-4" />
          Daily Routine
        </Button>
        <Button
          variant={activeTab === "diary" ? "default" : "ghost"}
          onClick={() => setActiveTab("diary")}
          className="flex items-center gap-2"
        >
          <BookOpen className="w-4 h-4" />
          Daily Journal
        </Button>
        <Button
          variant={activeTab === "achievements" ? "default" : "ghost"}
          onClick={() => setActiveTab("achievements")}
          className="flex items-center gap-2"
        >
          <Trophy className="w-4 h-4" />
          Achievements
        </Button>
        <Button
          variant={activeTab === "test-data" ? "default" : "ghost"}
          onClick={() => setActiveTab("test-data")}
          className="flex items-center gap-2"
        >
          <Zap className="w-4 h-4" />
          Test Data
        </Button>
      </div>

      {/* Dashboard Tab - Overview of all modules */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          <div className="text-center py-12 bg-muted rounded-lg">
            <BarChart3 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Harada Method Dashboard</h2>
            <p className="text-muted-foreground mb-6">Welcome to your personal goal achievement system</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <Button onClick={() => setActiveTab("goal")}>
                <Target className="w-4 h-4 mr-2" />
                Set Long-term Goal
              </Button>
              <Button onClick={() => setActiveTab("assessment")}>
                <ClipboardCheck className="w-4 h-4 mr-2" />
                Take Assessment
              </Button>
              <Button onClick={() => setActiveTab("chart")}>
                <Grid3X3 className="w-4 h-4 mr-2" />
                Create 64 Chart
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-card border rounded-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-primary" />
                Getting Started
              </h3>
              <ol className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">1</span>
                  <span>Set your long-term goal using the Goal module</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">2</span>
                  <span>Complete the self-assessment to understand your strengths</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">3</span>
                  <span>Create your 64 Chart to break down your goal</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">4</span>
                  <span>Set up daily routines and track your progress</span>
                </li>
              </ol>
            </div>
            
            <div className="p-6 bg-card border rounded-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Benefits
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Systematic approach to achieving personal goals</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Self-assessment to identify areas for improvement</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Breaking big goals into manageable tasks</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Daily tracking and accountability</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Module Tabs */}
      {activeTab === "goal" && <GoalModule userId={userId} />}
      {activeTab === "assessment" && <AssessmentModule userId={userId} />}
      {activeTab === "chart" && <ChartModule userId={userId} />}
      {activeTab === "routine" && <RoutineModule userId={userId} />}
      {activeTab === "diary" && <DiaryModule userId={userId} />}
      {activeTab === "achievements" && <AchievementsModule userId={userId} />}
      {activeTab === "test-data" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Test Data</h2>
            <p className="text-muted-foreground">Load test data for development and testing purposes</p>
          </div>
          
          <div className="p-6 bg-card border rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Load Test Data</h3>
            <p className="text-muted-foreground mb-4">This will populate your account with sample data for all Harada Method modules.</p>
            
            <Button 
              onClick={() => {
                initializeTestData(userId);
                alert('Test data loaded successfully! Check the different modules to see sample data.');
              }}
              className="flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Load Test Data
            </Button>
            
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">What's included:</h4>
              <ul className="text-sm space-y-1">
                <li>• Sample long-term goal</li>
                <li>• Completed self-assessment</li>
                <li>• Partially filled 64 Chart</li>
                <li>• Daily routine tasks</li>
                <li>• Diary entry</li>
                <li>• Achievements and stats</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}