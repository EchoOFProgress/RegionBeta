"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Target, 
  CheckCircle, 
  Clock, 
  Award,
  Activity,
  Flame,
  Users,
  BarChart3,
  Trophy,
  Star,
  Zap
} from "lucide-react";
import { storage } from "@/lib/storage";

// Define types for our data
interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  category?: string;
  energyLevel?: number;
  priority?: number;
  dueDate?: string;
  tags?: string[];
  recurrencePattern?: string;
  recurrenceInterval?: number;
  recurrenceEndDate?: string;
  isRecurring?: boolean;
  streak?: number;
  bestStreak?: number;
  lastCompleted?: string;
  completionRecords?: { date: string; energyLevel?: number; note?: string }[];
  // Time blocking properties
  timeBlockStart?: string;
  timeBlockEnd?: string;
  timeBlockDate?: string;
}

interface Habit {
  id: string;
  name: string;
  streak: number;
  bestStreak: number;
  totalCompletions: number;
  lastCompleted: string | null;
  completedToday: boolean;
  description?: string;
  categories?: string[];
  type: 'boolean' | 'numeric' | 'checklist';
  numericValue?: number;
  numericCondition?: 'at-least' | 'less-than' | 'exactly';
  numericTarget?: number;
  reminders?: string[];
  frequency?: 'daily' | 'weekly' | 'monthly' | 'custom';
  customDays?: number[];
  checklistItems?: { id: string; name: string; completed: boolean }[];
  resetSchedule?: "daily" | "weekly" | "monthly";
  color?: string;
  icon?: string;
  timeWindow?: { from: string; to: string };
  completionRecords: { date: string; value?: number; energyLevel?: number; mood?: number; note?: string }[];
  weeklyCompletions?: number;
  monthlyCompletions?: number;
  successRate?: number;
  // Time blocking properties
  timeBlockStart?: string;
  timeBlockEnd?: string;
  timeBlockDate?: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  duration: number;
  currentDay: number;
  status: "upcoming" | "active" | "completed" | "failed";
  startDate: string;
  endDate: string;
  lastCheckedIn: string | null;
  categories: string[];
  goalType: "daily-completion" | "total-amount" | "checklist" | "points";
  failureMode: "hard" | "soft" | "retry-limit";
  maxFailures?: number;
  currentFailures: number;
  notes: { [date: string]: string };
  difficulty: number;
  color: string;
  icon: string;
  isPublic: boolean;
  archived: boolean;
  dailyTasks?: { day: number; task: string; done: boolean }[];
  totalAmount?: number;
  currentAmount?: number;
  dailyTarget?: number;
  dailyProgress?: number[];
  dailyNotes?: { [date: string]: string };
  dailyEnergy?: { [date: string]: number };
  linkedGoalId?: string;
  currentStreak?: number;
  bestStreak?: number;
  lastCompletedDate?: string;
  completionRecords?: { date: string; amount: number; energyLevel?: number; note?: string }[];
  milestones?: {
    id: string;
    title: string;
    description: string;
    targetValue: number;
    currentValue: number;
    achieved: boolean;
    achievedDate?: string;
    color: string;
  }[];
  // Time blocking properties
  timeBlockStart?: string;
  timeBlockEnd?: string;
  timeBlockDate?: string;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  progress: number;
  totalItems: number;
  completedItems: number;
  createdAt: string;
  targetDate?: string;
  motivation?: string;
  currentState?: string;
  desiredState?: string;
  categories?: string[];
  linkedTasks?: string[];
  linkedHabits?: string[];
  linkedChallenges?: string[];
  obstacles?: string[];
  resources?: string[];
  supporters?: string[];
  dailyHabits?: string[];
  weeklyMilestones?: string[];
  monthlyTargets?: string[];
  longTermGoalId?: string;
}

// Analytics data interfaces
interface ProductivityScore {
  score: number;
  breakdown: {
    taskCompletion: number;
    habitConsistency: number;
    challengeProgress: number;
    goalAchievement: number;
  };
}

interface TimePattern {
  hour: string;
  count: number;
}

interface CategoryBreakdown {
  name: string;
  count: number;
  percentage: number;
}

interface WeeklyData {
  week: string;
  completed: number;
  planned: number;
}

interface StreakData {
  type: string;
  current: number;
  best: number;
  name: string;
}

export function AnalyticsDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>({});

  useEffect(() => {
    // Load all data from storage
    loadAllData();
  }, []);

  const loadAllData = () => {
    const loadedTasks = storage.load('tasks', []);
    const loadedHabits = storage.load('habits', []);
    const loadedChallenges = storage.load('challenges', []);
    const loadedGoals = storage.load('goals', []);
    
    setTasks(loadedTasks);
    setHabits(loadedHabits);
    setChallenges(loadedChallenges);
    setGoals(loadedGoals);
    
    // Calculate analytics
    calculateAnalytics(loadedTasks, loadedHabits, loadedChallenges, loadedGoals);
  };

  const calculateAnalytics = (tasks: Task[], habits: Habit[], challenges: Challenge[], goals: Goal[]) => {
    // Calculate overall productivity score
    const productivityScore = calculateProductivityScore(tasks, habits, challenges, goals);
    
    // Calculate best productive times
    const productiveTimes = calculateProductiveTimes(tasks);
    
    // Calculate energy patterns
    const energyPatterns = calculateEnergyPatterns(tasks);
    
    // Calculate category breakdown
    const categoryBreakdown = calculateCategoryBreakdown(tasks);
    
    // Calculate streaks overview
    const streaksOverview = calculateStreaksOverview(habits, challenges);
    
    // Calculate achievements
    const achievements = calculateAchievements(tasks, habits, challenges, goals);
    
    // Calculate goal progress overview
    const goalProgress = calculateGoalProgress(goals);
    
    setAnalyticsData({
      productivityScore,
      productiveTimes,
      energyPatterns,
      categoryBreakdown,
      streaksOverview,
      achievements,
      goalProgress
    });
  };

  const calculateProductivityScore = (tasks: Task[], habits: Habit[], challenges: Challenge[], goals: Goal[]): ProductivityScore => {
    // Calculate task completion rate
    const completedTasks = tasks.filter(t => t.completed).length;
    const totalTasks = tasks.length;
    const taskCompletion = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    // Calculate habit consistency
    let habitConsistency = 0;
    if (habits.length > 0) {
      const totalHabits = habits.length;
      const completedToday = habits.filter(h => h.completedToday).length;
      habitConsistency = (completedToday / totalHabits) * 100;
    }
    
    // Calculate challenge progress
    let challengeProgress = 0;
    if (challenges.length > 0) {
      const activeChallenges = challenges.filter(c => c.status === 'active');
      if (activeChallenges.length > 0) {
        const avgProgress = activeChallenges.reduce((sum, c) => sum + (c.currentDay / c.duration) * 100, 0) / activeChallenges.length;
        challengeProgress = avgProgress;
      }
    }
    
    // Calculate goal achievement
    let goalAchievement = 0;
    if (goals.length > 0) {
      const avgProgress = goals.reduce((sum, g) => sum + g.progress, 0) / goals.length;
      goalAchievement = avgProgress;
    }
    
    // Calculate overall score (weighted average)
    const score = (taskCompletion * 0.3) + (habitConsistency * 0.25) + (challengeProgress * 0.25) + (goalAchievement * 0.2);
    
    return {
      score: Math.round(score),
      breakdown: {
        taskCompletion: Math.round(taskCompletion),
        habitConsistency: Math.round(habitConsistency),
        challengeProgress: Math.round(challengeProgress),
        goalAchievement: Math.round(goalAchievement)
      }
    };
  };

  const calculateProductiveTimes = (tasks: Task[]): TimePattern[] => {
    // Analyze completion times to determine when user is most productive
    const completedTasks = tasks.filter(task => task.completed && task.completedAt);
    
    // Initialize time slots
    const timeSlots: { [key: string]: number } = {
      "6-8 AM": 0,
      "8-10 AM": 0,
      "10-12 NOON": 0,
      "12-2 PM": 0,
      "2-4 PM": 0,
      "4-6 PM": 0,
      "6-8 PM": 0,
      "8-10 PM": 0
    };
    
    // Count completed tasks by time slot based on completedAt timestamp
    completedTasks.forEach(task => {
      const completedDate = new Date(task.completedAt!);
      const hour = completedDate.getHours();
      
      // Map the hour to the appropriate time slot
      if (hour >= 6 && hour < 8) {
        timeSlots["6-8 AM"]++;
      } else if (hour >= 8 && hour < 10) {
        timeSlots["8-10 AM"]++;
      } else if (hour >= 10 && hour < 12) {
        timeSlots["10-12 NOON"]++;
      } else if (hour >= 12 && hour < 14) {
        timeSlots["12-2 PM"]++;
      } else if (hour >= 14 && hour < 16) {
        timeSlots["2-4 PM"]++;
      } else if (hour >= 16 && hour < 18) {
        timeSlots["4-6 PM"]++;
      } else if (hour >= 18 && hour < 20) {
        timeSlots["6-8 PM"]++;
      } else if (hour >= 20 && hour < 22) {
        timeSlots["8-10 PM"]++;
      }
    });
    
    // Additionally, consider time-blocked tasks to show adherence to planned schedule
    // and effectiveness of planned vs actual productivity
    const timeBlockedTasks = completedTasks.filter(task => 
      task.timeBlockStart && task.timeBlockEnd && task.timeBlockDate && task.completedAt
    );
    
    timeBlockedTasks.forEach(task => {
      const plannedHour = parseInt(task.timeBlockStart!.split(':')[0]); // Extract hour from HH:MM format
      const completedDate = new Date(task.completedAt!);
      const completedHour = completedDate.getHours();
      
      // Calculate time difference in hours
      const timeDifference = Math.abs(completedHour - plannedHour);
      
      // If completed within 2 hours of planned time, give bonus for good planning
      if (timeDifference <= 2) {
        if (plannedHour >= 6 && plannedHour < 8) {
          timeSlots["6-8 AM"] += 0.5; // Bonus for completing as planned
        } else if (plannedHour >= 8 && plannedHour < 10) {
          timeSlots["8-10 AM"] += 0.5;
        } else if (plannedHour >= 10 && plannedHour < 12) {
          timeSlots["10-12 NOON"] += 0.5;
        } else if (plannedHour >= 12 && plannedHour < 14) {
          timeSlots["12-2 PM"] += 0.5;
        } else if (plannedHour >= 14 && plannedHour < 16) {
          timeSlots["2-4 PM"] += 0.5;
        } else if (plannedHour >= 16 && plannedHour < 18) {
          timeSlots["4-6 PM"] += 0.5;
        } else if (plannedHour >= 18 && plannedHour < 20) {
          timeSlots["6-8 PM"] += 0.5;
        } else if (plannedHour >= 20 && plannedHour < 22) {
          timeSlots["8-10 PM"] += 0.5;
        }
      }
    });
    
    // Convert to array format
    return [
      { hour: "6-8 AM", count: Math.round(timeSlots["6-8 AM"]) },
      { hour: "8-10 AM", count: Math.round(timeSlots["8-10 AM"]) },
      { hour: "10-12 NOON", count: Math.round(timeSlots["10-12 NOON"]) },
      { hour: "12-2 PM", count: Math.round(timeSlots["12-2 PM"]) },
      { hour: "2-4 PM", count: Math.round(timeSlots["2-4 PM"]) },
      { hour: "4-6 PM", count: Math.round(timeSlots["4-6 PM"]) },
      { hour: "6-8 PM", count: Math.round(timeSlots["6-8 PM"]) },
      { hour: "8-10 PM", count: Math.round(timeSlots["8-10 PM"]) }
    ];
  };

  const calculateEnergyPatterns = (tasks: Task[]): any => {
    // Calculate average energy levels from completed tasks
    const completedTasksWithEnergy = tasks.filter(t => t.completed && t.energyLevel);
    if (completedTasksWithEnergy.length === 0) {
      return { avgEnergy: 5, highEnergyTasks: 0, lowEnergyTasks: 0 };
    }
    
    const totalEnergy = completedTasksWithEnergy.reduce((sum, t) => sum + (t.energyLevel || 0), 0);
    const avgEnergy = totalEnergy / completedTasksWithEnergy.length;
    
    const highEnergyTasks = completedTasksWithEnergy.filter(t => (t.energyLevel || 0) >= 7).length;
    const lowEnergyTasks = completedTasksWithEnergy.filter(t => (t.energyLevel || 0) <= 3).length;
    
    return {
      avgEnergy: Math.round(avgEnergy * 100) / 100,
      highEnergyTasks,
      lowEnergyTasks
    };
  };

  const calculateCategoryBreakdown = (tasks: Task[]): CategoryBreakdown[] => {
    const categoryMap: { [key: string]: number } = {};
    
    tasks.forEach(task => {
      if (task.category) {
        categoryMap[task.category] = (categoryMap[task.category] || 0) + 1;
      }
    });
    
    const totalTasks = tasks.length;
    return Object.entries(categoryMap).map(([name, count]) => ({
      name,
      count,
      percentage: totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0
    }));
  };

  const calculateStreaksOverview = (habits: Habit[], challenges: Challenge[]): StreakData[] => {
    const streaks: StreakData[] = [];
    
    // Add habit streaks
    habits.forEach(habit => {
      if (habit.streak > 0 || habit.bestStreak > 0) {
        streaks.push({
          type: 'habit',
          current: habit.streak,
          best: habit.bestStreak || 0,
          name: habit.name
        });
      }
    });
    
    // Add challenge streaks
    challenges.forEach(challenge => {
      if (challenge.currentStreak && challenge.currentStreak > 0) {
        streaks.push({
          type: 'challenge',
          current: challenge.currentStreak,
          best: challenge.bestStreak || 0,
          name: challenge.title
        });
      }
    });
    
    // Sort by current streak descending
    return streaks.sort((a, b) => b.current - a.current).slice(0, 5);
  };

  const calculateAchievements = (tasks: Task[], habits: Habit[], challenges: Challenge[], goals: Goal[]): any => {
    // Count various achievements
    const completedTasks = tasks.filter(t => t.completed).length;
    const completedHabits = habits.filter(h => h.completedToday).length;
    const completedChallenges = challenges.filter(c => c.status === 'completed').length;
    const completedGoals = goals.filter(g => g.progress === 100).length;
    
    // Calculate total possible achievements
    const totalAchievements = completedTasks + completedHabits + completedChallenges + completedGoals;
    
    return {
      total: totalAchievements,
      tasks: completedTasks,
      habits: completedHabits,
      challenges: completedChallenges,
      goals: completedGoals
    };
  };



  const calculateGoalProgress = (goals: Goal[]): any => {
    if (goals.length === 0) return { avgProgress: 0, completed: 0, inProgress: 0, total: 0 };
    
    const avgProgress = goals.reduce((sum, g) => sum + g.progress, 0) / goals.length;
    const completed = goals.filter(g => g.progress === 100).length;
    const inProgress = goals.filter(g => g.progress > 0 && g.progress < 100).length;
    
    return {
      avgProgress: Math.round(avgProgress),
      completed,
      inProgress,
      total: goals.length
    };
  };

  // Color palette for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Comprehensive overview of your productivity and progress</p>
      </div>

      {/* Productivity Score Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Overall Productivity Score
          </CardTitle>
          <CardDescription>Your combined productivity metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-primary">
                {analyticsData.productivityScore?.score || 0}%
              </div>
              <div className="text-sm text-muted-foreground">Current Score</div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {analyticsData.productivityScore?.breakdown?.taskCompletion || 0}%
                </div>
                <div className="text-xs text-muted-foreground">Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {analyticsData.productivityScore?.breakdown?.habitConsistency || 0}%
                </div>
                <div className="text-xs text-muted-foreground">Habits</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {analyticsData.productivityScore?.breakdown?.challengeProgress || 0}%
                </div>
                <div className="text-xs text-muted-foreground">Challenges</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {analyticsData.productivityScore?.breakdown?.goalAchievement || 0}%
                </div>
                <div className="text-xs text-muted-foreground">Goals</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productive Times Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Best Productive Times
            </CardTitle>
            <CardDescription>When you're most productive during the day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.productiveTimes || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" name="Tasks Completed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Category Breakdown
            </CardTitle>
            <CardDescription>How you spend your time across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.categoryBreakdown || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="percentage"
                  >
                    {analyticsData.categoryBreakdown?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Energy Patterns */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Zap className="h-4 w-4 text-yellow-500" />
              Average Energy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.energyPatterns?.avgEnergy || 0}/10
            </div>
            <p className="text-xs text-muted-foreground">
              High: {analyticsData.energyPatterns?.highEnergyTasks || 0} | Low: {analyticsData.energyPatterns?.lowEnergyTasks || 0}
            </p>
          </CardContent>
        </Card>

        {/* Streaks Overview */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Flame className="h-4 w-4 text-orange-500" />
              Current Streaks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.streaksOverview?.[0]?.current || 0} days
            </div>
            <p className="text-xs text-muted-foreground">
              Best: {analyticsData.streaksOverview?.[0]?.best || 0} days
            </p>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Award className="h-4 w-4 text-yellow-500" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.achievements?.total || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Tasks: {analyticsData.achievements?.tasks || 0}
            </p>
          </CardContent>
        </Card>

        {/* Goals Progress */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Target className="h-4 w-4 text-blue-500" />
              Goal Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.goalProgress?.avgProgress || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.goalProgress?.completed || 0} completed
            </p>
          </CardContent>
        </Card>
      </div>



      {/* Streaks Overview List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-primary" />
            Streaks Overview
          </CardTitle>
          <CardDescription>Your active streaks and best performances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analyticsData.streaksOverview?.length > 0 ? (
              analyticsData.streaksOverview.map((streak: StreakData, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Flame className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{streak.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">{streak.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{streak.current} days</p>
                    <p className="text-sm text-muted-foreground">Best: {streak.best} days</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Flame className="mx-auto h-12 w-12 opacity-50 mb-2" />
                <p>No streaks yet</p>
                <p className="text-sm">Complete tasks and habits to start building streaks</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}