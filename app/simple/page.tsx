"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarView } from "@/components/calendar-view";
import { TaskModule } from "@/components/task-module";
import { HabitModule } from "@/components/habit-module";
import { ChallengeModule } from "@/components/challenge-module";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import {
  Calendar,
  CheckSquare,
  Target,
  Zap,
  Trophy,
  BarChart3,
  Palette,
  Layout,
  Sparkles,
  Settings
} from "lucide-react";
import { useUI } from "@/lib/ui-context";
import { storage } from "@/lib/storage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
};

export default function SimpleApp() {
  const [activeTab, setActiveTab] = useState("calendar");
  // Define types for our data
  type Task = {
    id: string;
    title: string;
    completed: boolean;
    priority: number;
    type: string;
    createdAt?: string;
    completedAt?: string;
    [key: string]: any; // Allow other properties
  };
  
  type Habit = {
    id: string;
    name: string;
    completedToday: boolean;
    streak: number;
    bestStreak: number;
    totalCompletions: number;
    lastCompleted: string | null;
    [key: string]: any; // Allow other properties
  };
  
  type Challenge = {
    id: string;
    title: string;
    description: string;
    status: "upcoming" | "active" | "completed" | "failed";
    duration: number;
    currentDay: number;
    startDate: string;
    endDate: string;
    [key: string]: any; // Allow other properties
  };
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const { uiSettings, updateUISettings } = useUI();

  // Load data on component mount
  useEffect(() => {
    const loadedTasks = storage.load("tasks", []);
    const loadedHabits = storage.load("habits", []);
    const loadedChallenges = storage.load("challenges", []);
    
    setTasks(loadedTasks);
    setHabits(loadedHabits);
    setChallenges(loadedChallenges);
  }, []);

  // Function to calculate efficiency based on actual data
  const calculateEfficiency = () => {
    // Calculate efficiency based on completed tasks, habits, and challenges
    let totalItems = 0;
    let completedItems = 0;
    
    // Count tasks
    totalItems += tasks.length;
    completedItems += tasks.filter(task => task.completed).length;
    
    // Count habits (completed today)
    totalItems += habits.length;
    completedItems += habits.filter(habit => habit.completedToday).length;
    
    // Count challenges (active and completed)
    totalItems += challenges.length;
    completedItems += challenges.filter(challenge => challenge.status === "completed").length;
    
    // Calculate percentage, default to 100 if no items
    const efficiency = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 100;
    
    // Ensure efficiency is between 0 and 100
    return Math.min(100, Math.max(0, efficiency));
  };

  // Toggle between legacy and modern style modes
  const toggleStyleMode = () => {
    updateUISettings({
      styleMode: uiSettings.styleMode === 'legacy' ? 'modern' : 'legacy'
    });
  };

  // Define available modules
  const modules: NavItem[] = [
    { id: "dashboard", label: "Dashboard", icon: <Trophy className="h-5 w-5" /> },
    { id: "analytics", label: "Analytics", icon: <BarChart3 className="h-5 w-5" /> },
    { id: "calendar", label: "Calendar", icon: <Calendar className="h-5 w-5" /> },
    { id: "tasks", label: "Tasks", icon: <CheckSquare className="h-5 w-5" /> },
    { id: "habits", label: "Habits", icon: <Target className="h-5 w-5" /> },
    { id: "challenges", label: "Challenges", icon: <Zap className="h-5 w-5" /> }
  ];

  return (
    <div className={`min-h-screen ${uiSettings.styleMode === 'modern' ? 'bg-transparent overflow-hidden' : 'bg-gradient-to-br from-background to-muted'}`}>
      {uiSettings.styleMode === 'modern' ? (
        /* RADICAL MODERN LAYOUT: Side Nav + Floating Panels */
        <div className="flex h-screen w-full p-6 gap-6 relative">
          {/* Futuristic Sidebar */}
          <aside className="w-72 cyber-panel flex flex-col p-6 animate-float">
            <div className="flex items-center gap-3 mb-12 px-2">
              <div className="p-3 rounded-2xl bg-primary shadow-lg shadow-primary/20 ring-1 ring-white/20">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-black text-foreground tracking-tighter">
                Region <span className="text-primary">Beta</span>
              </h1>
            </div>

            <nav className="flex-1 space-y-3">
              {modules.map((module) => (
                <div
                  key={module.id}
                  onClick={() => setActiveTab(module.id)}
                  data-active={activeTab === module.id}
                  className="side-nav-item"
                >
                  <div className={`p-2 rounded-xl transition-colors ${activeTab === module.id ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white/5'}`}>
                    {module.icon}
                  </div>
                  <span className="font-bold uppercase tracking-widest text-[10px]">{module.label}</span>
                </div>
              ))}
            </nav>

            <div className="mt-auto pt-6 border-t border-white/5 space-y-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleStyleMode}
                className="w-full justify-start rounded-full hover:bg-white/5 text-muted-foreground hover:text-foreground group"
              >
                <Palette className="h-4 w-4 mr-3 transition-transform group-hover:rotate-12" />
                Return to Legacy
              </Button>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-white/5">
                <p className="text-[10px] font-black uppercase tracking-tighter text-foreground/50 mb-1">Status</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                  <span className="text-[10px] font-bold text-foreground">SYSTEMS NOMINAL</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 relative flex flex-col gap-6 overflow-hidden">
            {/* Top Stats Bar (Modern) */}
            <header className="h-20 cyber-panel flex items-center justify-between px-8">
              <div className="flex flex-col">
                <h2 className="text-xs font-black text-primary tracking-widest uppercase">
                  {modules.find(m => m.id === activeTab)?.label}
                </h2>
                <span className="text-[10px] text-muted-foreground uppercase tracking-tighter">Region Beta Matrix v4.0</span>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-foreground/40 uppercase">Efficiency</span>
                  <span className="text-lg font-black text-foreground tabular-nums">{calculateEfficiency()}%</span>
                </div>
                <div className="h-10 w-[1px] bg-white/10" />
                <Badge className="bg-primary/20 text-primary border-primary/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  Live Sync
                </Badge>
              </div>
            </header>

            {/* Scrollable Content Container */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <div className="cyber-panel p-8 min-h-full">
                {activeTab === "dashboard" && (
                  <div className="text-center py-20">
                    <div className="relative inline-block mb-8">
                      <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                      <Trophy className="h-20 w-20 relative text-primary animate-bounce ring-glow" />
                    </div>
                    <h2 className="text-4xl font-black mb-4 tracking-tighter">Command Center</h2>
                    <p className="text-muted-foreground max-w-md mx-auto uppercase text-xs tracking-widest leading-relaxed">
                      Optimize your trajectory. Synchronizing global objectives with daily execution schemas.
                    </p>
                  </div>
                )}
                {activeTab === "analytics" && <AnalyticsDashboard />}
                {activeTab === "calendar" && <CalendarView />}
                {activeTab === "tasks" && <TaskModule />}
                {activeTab === "habits" && <HabitModule />}
                {activeTab === "challenges" && <ChallengeModule />}
              </div>
            </div>
          </main>
        </div>
      ) : (
        /* LEGACY LAYOUT */
        <>
          <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10 glass-card">
            <div className="container mx-auto px-4 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                      Region Beta
                    </h1>
                    <p className="text-muted-foreground mt-1">Activity Planner - Systematic Approach to Productivity</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleStyleMode}
                    className="rounded-full px-4 border-primary/20 hover:border-primary/50 transition-all duration-300"
                  >
                    <Palette className="h-4 w-4 mr-2" />
                    {uiSettings.styleMode === 'legacy' ? 'Switch to Modern' : 'Switch to Legacy'}
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <main className="container mx-auto px-4 py-8 flex-1">
            <div className="max-w-6xl mx-auto">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-6 mb-8 p-1 bg-muted/50 rounded-xl">
                  {modules.map((module) => (
                    <TabsTrigger
                      key={module.id}
                      value={module.id}
                      className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-lg"
                    >
                      {module.icon}
                      <span className="text-xs font-medium">{module.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="dashboard" className="mt-0">
                  <div className="bg-card rounded-xl p-8 text-center">
                    <Trophy className="h-16 w-16 mx-auto text-primary mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Dashboard</h2>
                    <p className="text-muted-foreground">Your productivity overview will appear here</p>
                  </div>
                </TabsContent>

                <TabsContent value="analytics" className="mt-0">
                  <AnalyticsDashboard />
                </TabsContent>

                <TabsContent value="calendar" className="mt-0">
                  <CalendarView />
                </TabsContent>

                <TabsContent value="tasks" className="mt-0">
                  <TaskModule />
                </TabsContent>

                <TabsContent value="habits" className="mt-0">
                  <HabitModule />
                </TabsContent>

                <TabsContent value="challenges" className="mt-0">
                  <ChallengeModule />
                </TabsContent>
              </Tabs>
            </div>
          </main>

          <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border mt-auto">
            <p>Region Beta Activity Planner • Master Your Productivity</p>
          </footer>
        </>
      )
      }
    </div >
  );
}