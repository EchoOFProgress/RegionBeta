"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskModule } from "@/components/task-module";
import { HabitModule } from "@/components/habit-module";
import { ChallengeModule } from "@/components/challenge-module";
import { GoalsModule } from "@/components/goals-module";
import InsightCardsModule from "@/components/insight-cards/InsightCardsModule";
import {
  CheckSquare,
  Target,
  Zap,
  Trophy,
  Calendar,
  Lightbulb,
  BrainCircuit,
} from "lucide-react";
import { storage } from "@/lib/storage";
import { RecommenderPanel } from "@/components/ai/RecommenderPanel";
import { CreatorPanel } from "@/components/ai/CreatorPanel";
import { useLanguage } from "@/lib/language-context";

export default function Home() {
  const [activeTab, setActiveTab] = useState("tasks");
  const [tasks, setTasks] = useState<any[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const { t } = useLanguage();

  // Load data on component mount
  useEffect(() => {
    setTasks(storage.load("tasks", []));
    setHabits(storage.load("habits", []));
    setChallenges(storage.load("challenges", []));
    setGoals(storage.load("goals", []));
  }, []);

  return (
    <main className="viewport dashboard-viewport">
      <header className="masthead">

        <h1>
          Region <span className="version">Beta</span>
        </h1>

      </header>

      <div className="dashboard-content">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="dashboard-tabs">
          <TabsList className="dashboard-nav">
            <TabsTrigger value="tasks" className="nav-item">
              <CheckSquare className="nav-icon" />
              <span className="nav-label">{t("nav.tasks")}</span>
            </TabsTrigger>
            <TabsTrigger value="habits" className="nav-item">
              <Target className="nav-icon" />
              <span className="nav-label">{t("nav.habits")}</span>
            </TabsTrigger>
            <TabsTrigger value="challenges" className="nav-item">
              <Zap className="nav-icon" />
              <span className="nav-label">{t("nav.challenges")}</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="nav-item">
              <Trophy className="nav-icon" />
              <span className="nav-label">{t("nav.goals")}</span>
            </TabsTrigger>
            <TabsTrigger value="insight" className="nav-item">
              <Lightbulb className="nav-icon" />
              <span className="nav-label">{t("nav.insight")}</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="nav-item border-l border-primary/20 bg-primary/5 text-primary ml-2 rounded-lg">
              <BrainCircuit className="nav-icon text-primary" />
              <span className="nav-label font-medium uppercase tracking-wider text-xs">{t("nav.ai")}</span>
            </TabsTrigger>
          </TabsList>


          <div className="tab-render-area">
            <TabsContent value="tasks" className="tab-pane">
              <TaskModule onTasksChange={setTasks} goals={goals} />
            </TabsContent>

            <TabsContent value="habits" className="tab-pane">
              <HabitModule />
            </TabsContent>

            <TabsContent value="challenges" className="tab-pane">
              <ChallengeModule />
            </TabsContent>

            <TabsContent value="goals" className="tab-pane">
              <GoalsModule
                onGoalsChange={setGoals}
                tasks={tasks}
                habits={habits}
                challenges={challenges}
              />
            </TabsContent>

            <TabsContent value="insight" className="tab-pane insight-tab">
              <InsightCardsModule />
            </TabsContent>

            <TabsContent value="ai" className="tab-pane h-[calc(100vh-180px)] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full p-4 items-start">
                  <RecommenderPanel />
                  <CreatorPanel />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>


    </main>
  );
}