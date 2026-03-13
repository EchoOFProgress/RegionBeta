"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Target,
  CheckSquare,
  Zap,
  Trophy,
  Plus,
  Clock,
  X,
  GripVertical,
  Eye,
  Filter,
  BarChart3,
  List,
  Grid3X3,
  CalendarDays
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { storage } from "@/lib/storage";
import { CalendarTimeBoxIntegration } from "./calendar-timebox-integration";

// Define types for our data
interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt?: string;
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

interface DailyTask {
  id: string;
  title: string;
  time?: string;
  completed: boolean;
  createdAt: string;
}

interface DailySchedule {
  [date: string]: DailyTask[];
}

interface CalendarItem {
  type: string;
  title: string;
  completed: boolean;
  color: string;
  icon: React.ReactNode;
  id: string;
}

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dailySchedule, setDailySchedule] = useState<DailySchedule>({});
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("");
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  
  // View modes
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  
  // Filters
  const [filters, setFilters] = useState({
    categories: [] as string[],
    priorities: [] as number[],
    energyLevels: [] as number[],
    hideCompleted: false,
    searchTerm: ''
  });
  
  // Time-boxing integration
  const [scheduledTasks, setScheduledTasks] = useState<any[]>([]);
  
  // Stats
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    loadAllData();
    loadDailySchedule();
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
  };

  const loadScheduledTasks = () => {
    const scheduled = storage.load('scheduledTasks', []);
    setScheduledTasks(scheduled);
  };

  const saveScheduledTasks = (tasks: any[]) => {
    storage.save('scheduledTasks', tasks);
    setScheduledTasks(tasks);
  };

  const handleScheduleTask = (taskData: any) => {
    const newTask = {
      ...taskData,
      id: `scheduled-${Date.now()}`
    };
    const updatedTasks = [...scheduledTasks, newTask];
    saveScheduledTasks(updatedTasks);
  };

  const handleUpdateScheduledTask = (taskId: string, updates: any) => {
    const updatedTasks = scheduledTasks.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    );
    saveScheduledTasks(updatedTasks);
  };

  useEffect(() => {
    loadScheduledTasks();
  }, []);

  const loadDailySchedule = () => {
    const schedule = storage.load('dailySchedule', {});
    setDailySchedule(schedule);
  };

  const saveDailySchedule = (schedule: DailySchedule) => {
    storage.save('dailySchedule', schedule);
    setDailySchedule(schedule);
  };

  // Drag and drop handlers
  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  const handleDrop = (date: string) => {
    if (!draggedTask) return;
    
    const newDailyTask: DailyTask = {
      id: `daily-${Date.now()}`,
      title: draggedTask.title,
      completed: false,
      createdAt: new Date().toISOString()
    };

    const updatedSchedule = { ...dailySchedule };
    if (!updatedSchedule[date]) {
      updatedSchedule[date] = [];
    }
    updatedSchedule[date].push(newDailyTask);
    
    saveDailySchedule(updatedSchedule);
    setDraggedTask(null);
  };

  // Daily task management
  const addDailyTask = () => {
    if (!newTaskTitle.trim()) return;
    
    const newDailyTask: DailyTask = {
      id: `daily-${Date.now()}`,
      title: newTaskTitle,
      time: newTaskTime || undefined,
      completed: false,
      createdAt: new Date().toISOString()
    };

    const updatedSchedule = { ...dailySchedule };
    if (!updatedSchedule[selectedDate]) {
      updatedSchedule[selectedDate] = [];
    }
    updatedSchedule[selectedDate].push(newDailyTask);
    
    saveDailySchedule(updatedSchedule);
    setNewTaskTitle("");
    setNewTaskTime("");
  };

  const toggleDailyTask = (date: string, taskId: string) => {
    const updatedSchedule = { ...dailySchedule };
    if (updatedSchedule[date]) {
      updatedSchedule[date] = updatedSchedule[date].map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      );
      saveDailySchedule(updatedSchedule);
    }
  };

  const deleteDailyTask = (date: string, taskId: string) => {
    const updatedSchedule = { ...dailySchedule };
    if (updatedSchedule[date]) {
      updatedSchedule[date] = updatedSchedule[date].filter(task => task.id !== taskId);
      saveDailySchedule(updatedSchedule);
    }
  };

  const toggleTask = (taskId: string) => {
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, completed: !task.completed, completedAt: task.completed ? undefined : new Date().toISOString() }
          : task
      );
      
      storage.save('tasks', updatedTasks);
      return updatedTasks;
    });
  };

  const toggleHabit = (habitId: string) => {
    setHabits(prevHabits => {
      const updatedHabits = prevHabits.map(habit => {
        if (habit.id === habitId) {
          const today = new Date().toISOString().split('T')[0];
          const updatedCompletedToday = !habit.completedToday;
          
          let newStreak = habit.streak;
          if (updatedCompletedToday) {
            newStreak = habit.streak + 1;
          } else {
            newStreak = Math.max(0, habit.streak - 1);
          }
          
          return {
            ...habit,
            completedToday: updatedCompletedToday,
            streak: newStreak,
            lastCompleted: updatedCompletedToday ? today : habit.lastCompleted,
            completionRecords: updatedCompletedToday 
              ? [
                  ...habit.completionRecords,
                  { 
                    date: today, 
                    energyLevel: habit.completionRecords[habit.completionRecords.length - 1]?.energyLevel,
                    mood: habit.completionRecords[habit.completionRecords.length - 1]?.mood,
                    note: `Completed habit: ${habit.name}`
                  }
                ]
              : habit.completionRecords.filter(record => record.date !== today)
          };
        }
        return habit;
      });
      
      storage.save('habits', updatedHabits);
      return updatedHabits;
    });
  };

  const toggleChallenge = (challengeId: string) => {
    setChallenges(prevChallenges => {
      const updatedChallenges = prevChallenges.map(challenge => {
        if (challenge.id === challengeId) {
          const today = new Date().toISOString().split('T')[0];
          const updatedLastCheckedIn = challenge.lastCheckedIn === today ? null : today;
          
          return {
            ...challenge,
            lastCheckedIn: updatedLastCheckedIn,
            completionRecords: updatedLastCheckedIn 
              ? [
                  ...challenge.completionRecords || [],
                  { 
                    date: today, 
                    amount: 1,
                    energyLevel: undefined,
                    note: `Checked in challenge: ${challenge.title}`
                  }
                ]
              : (challenge.completionRecords || []).filter(record => record.date !== today)
          };
        }
        return challenge;
      });
      
      storage.save('challenges', updatedChallenges);
      return updatedChallenges;
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return daysInMonth;
  };

  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    return firstDay.getDay();
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return '#ef4444'; // red - urgent
      case 2: return '#f97316'; // orange - high
      case 3: return '#3b82f6'; // blue - medium
      case 4: return '#8b5cf6'; // purple - low
      case 5: return '#6b7280'; // gray - lowest
      default: return '#3b82f6';
    }
  };

  const getViewTitle = () => {
    switch (viewMode) {
      case 'day': return new Date(selectedDate).toLocaleDateString();
      case 'week': {
        const weekStart = new Date(selectedDate);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        return `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;
      }
      case 'month': return `${monthName} ${year}`;
      default: return '';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getItemsForDate = useCallback((date: Date) => {
    const dateStr = formatDate(date);
    
    const items: CalendarItem[] = [];

    // Add tasks due on this date with filtering
    let dueTasks = tasks.filter(task => task.dueDate === dateStr);
    
    // Apply filters
    if (filters.categories.length > 0) {
      dueTasks = dueTasks.filter(task => task.category && filters.categories.includes(task.category));
    }
    if (filters.priorities.length > 0) {
      dueTasks = dueTasks.filter(task => task.priority && filters.priorities.includes(task.priority));
    }
    if (filters.energyLevels.length > 0) {
      dueTasks = dueTasks.filter(task => task.energyLevel && filters.energyLevels.includes(task.energyLevel));
    }
    if (filters.hideCompleted) {
      dueTasks = dueTasks.filter(task => !task.completed);
    }
    if (filters.searchTerm) {
      dueTasks = dueTasks.filter(task => 
        task.title.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    dueTasks.forEach(task => {
      items.push({
        type: 'task',
        id: task.id,
        title: task.title,
        completed: task.completed,
        color: getPriorityColor(task.priority || 3),
        icon: <CheckSquare className="h-3 w-3" />
      });
    });

    // Add habits that should be completed today
    let todayHabits = habits.filter(habit => true);
    
    // Apply habit filters
    if (filters.hideCompleted) {
      todayHabits = todayHabits.filter(habit => !habit.completedToday);
    }
    if (filters.searchTerm) {
      todayHabits = todayHabits.filter(habit => 
        habit.name.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    todayHabits.forEach(habit => {
      items.push({
        type: 'habit',
        id: habit.id,
        title: habit.name,
        completed: habit.completedToday,
        color: habit.color || '#10b981',
        icon: <Target className="h-3 w-3" />
      });
    });

    // Add challenges that are active
    let activeChallenges = challenges.filter(challenge => {
      const startDate = new Date(challenge.startDate);
      const endDate = new Date(challenge.endDate);
      const checkDate = new Date(dateStr);
      return checkDate >= startDate && checkDate <= endDate && challenge.status === 'active';
    });
    
    // Apply challenge filters
    if (filters.hideCompleted) {
      activeChallenges = activeChallenges.filter(challenge => challenge.lastCheckedIn !== dateStr);
    }
    if (filters.searchTerm) {
      activeChallenges = activeChallenges.filter(challenge => 
        challenge.title.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    activeChallenges.forEach(challenge => {
      items.push({
        type: 'challenge',
        id: challenge.id,
        title: challenge.title,
        completed: challenge.lastCheckedIn === dateStr,
        color: challenge.color || '#8b5cf6',
        icon: <Zap className="h-3 w-3" />
      });
    });

    // Add goals with target dates
    let goalItems = goals.filter(goal => goal.targetDate === dateStr);
    
    // Apply goal filters
    if (filters.hideCompleted) {
      goalItems = goalItems.filter(goal => goal.progress < 100);
    }
    if (filters.searchTerm) {
      goalItems = goalItems.filter(goal => 
        goal.title.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    goalItems.forEach(goal => {
      items.push({
        type: 'goal',
        id: goal.id,
        title: goal.title,
        completed: goal.progress === 100,
        color: '#f59e0b',
        icon: <Trophy className="h-3 w-3" />
      });
    });

    // Add scheduled time-boxing tasks
    const scheduledForDate = scheduledTasks.filter(st => st.date === dateStr);
    scheduledForDate.forEach(st => {
      items.push({
        type: 'scheduled',
        id: st.id,
        title: `${st.taskTitle} (${st.startTime}-${st.endTime})`,
        completed: st.completed || false,
        color: '#ec4899',
        icon: <Clock className="h-3 w-3" />
      });
    });

    return items;
  }, [tasks, habits, challenges, goals, scheduledTasks, filters]);

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  // Create calendar grid
  const calendarDays = [];
  
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    calendarDays.push(date);
  }

  return (
    <div className="flex gap-4">
      {/* Sidebar */}
      {sidebarOpen && (
        <Card className="w-80 flex-shrink-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">Task Library</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium text-sm">Available Tasks</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {tasks
                  .filter(task => !task.completed)
                  .map(task => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task)}
                      onDragEnd={handleDragEnd}
                      className="p-3 border rounded-lg cursor-move hover:bg-muted transition-colors group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{task.title}</p>
                          {task.category && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              {task.category}
                            </Badge>
                          )}
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-medium text-sm">Quick Actions</h3>
              <Button 
                className="w-full"
                onClick={() => {
                  setSelectedDate(new Date().toISOString().split('T')[0]);
                  setShowDailyModal(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Today's Task
              </Button>
              
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => setShowStats(!showStats)}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                {showStats ? 'Hide' : 'Show'} Statistics
              </Button>
            </div>
            
            {/* Time-boxing Integration */}
            <div className="pt-4 border-t">
              <CalendarTimeBoxIntegration
                currentDate={selectedDate}
                onTaskSchedule={handleScheduleTask}
                scheduledTasks={scheduledTasks}
                onUpdateTask={handleUpdateScheduledTask}
              />
            </div>
            
            {/* Statistics */}
            {showStats && (
              <div className="pt-4 border-t">
                <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Statistics
                </h3>
                <div className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm text-blue-600">Today's Progress</div>
                    <div className="text-2xl font-bold text-blue-800">
                      {getItemsForDate(new Date(selectedDate)).filter(item => item.completed).length}/
                      {getItemsForDate(new Date(selectedDate)).length}
                    </div>
                    <div className="text-xs text-blue-500">
                      {getItemsForDate(new Date(selectedDate)).length > 0 
                        ? Math.round(
                            (getItemsForDate(new Date(selectedDate)).filter(item => item.completed).length /
                            getItemsForDate(new Date(selectedDate)).length) * 100
                          ) + '% completed'
                        : 'No activities scheduled'
                      }
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-green-50 p-2 rounded">
                      <div className="text-lg font-bold text-green-700">
                        {tasks.filter(t => t.completed).length}
                      </div>
                      <div className="text-xs text-green-600">Tasks Done</div>
                    </div>
                    <div className="bg-purple-50 p-2 rounded">
                      <div className="text-lg font-bold text-purple-700">
                        {habits.filter(h => h.completedToday).length}
                      </div>
                      <div className="text-xs text-purple-600">Habits Done</div>
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <div className="text-sm text-orange-600">This Week</div>
                    <div className="text-lg font-bold text-orange-800">
                      {Object.keys(dailySchedule).filter(date => {
                        const weekStart = new Date(selectedDate);
                        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                        const weekEnd = new Date(weekStart);
                        weekEnd.setDate(weekEnd.getDate() + 6);
                        const taskDate = new Date(date);
                        return taskDate >= weekStart && taskDate <= weekEnd;
                      }).length} days tracked
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Main Calendar */}
      <Card className="flex-1">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2">
              {!sidebarOpen && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
              <CardTitle className="text-2xl">Calendar View</CardTitle>
            </div>
            
            {/* View mode selector */}
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === 'day' ? "default" : "ghost"}
                size="sm"
                className="px-3"
                onClick={() => setViewMode('day')}
              >
                <CalendarDays className="h-4 w-4 mr-1" />
                Day
              </Button>
              <Button
                variant={viewMode === 'week' ? "default" : "ghost"}
                size="sm"
                className="px-3"
                onClick={() => setViewMode('week')}
              >
                <List className="h-4 w-4 mr-1" />
                Week
              </Button>
              <Button
                variant={viewMode === 'month' ? "default" : "ghost"}
                size="sm"
                className="px-3"
                onClick={() => setViewMode('month')}
              >
                <Grid3X3 className="h-4 w-4 mr-1" />
                Month
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Navigation controls */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (viewMode === 'day') {
                    const newDate = new Date(selectedDate);
                    newDate.setDate(newDate.getDate() - 1);
                    setSelectedDate(formatDate(newDate));
                  } else if (viewMode === 'week') {
                    const newDate = new Date(selectedDate);
                    newDate.setDate(newDate.getDate() - 7);
                    setSelectedDate(formatDate(newDate));
                  } else {
                    navigateMonth('prev');
                  }
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-lg font-semibold min-w-[200px] text-center">
                {getViewTitle()}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (viewMode === 'day') {
                    const newDate = new Date(selectedDate);
                    newDate.setDate(newDate.getDate() + 1);
                    setSelectedDate(formatDate(newDate));
                  } else if (viewMode === 'week') {
                    const newDate = new Date(selectedDate);
                    newDate.setDate(newDate.getDate() + 7);
                    setSelectedDate(formatDate(newDate));
                  } else {
                    navigateMonth('next');
                  }
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Today button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                setSelectedDate(today);
                if (viewMode === 'month') {
                  setCurrentDate(new Date());
                }
              }}
            >
              Today
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters bar */}
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              
              <Input
                placeholder="Search activities..."
                value={filters.searchTerm}
                onChange={(e) => setFilters(f => ({...f, searchTerm: e.target.value}))}
                className="w-40 text-sm"
              />
              
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.hideCompleted}
                  onChange={(e) => setFilters(f => ({...f, hideCompleted: e.target.checked}))}
                  className="h-4 w-4"
                />
                Hide completed
              </label>
            </div>
          </div>
          
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => (
              <div 
                key={index} 
                className={`min-h-24 p-1 border rounded overflow-hidden ${
                  date ? 'border-border' : 'border-transparent'
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => date && handleDrop(formatDate(date))}
              >
                {date ? (
                  <>
                    <div className="text-right text-sm font-medium">
                      {date.getDate()}
                    </div>
                    <div className="mt-1 space-y-1 max-h-20 overflow-y-auto">
                      {getItemsForDate(date).map((item: CalendarItem, idx: number) => (
                        <div 
                          key={idx} 
                          className={`flex items-center gap-1 p-1 rounded text-xs cursor-pointer transition-all hover:scale-105 ${
                            item.completed 
                              ? 'bg-green-100 text-green-800 opacity-70' 
                              : 'bg-white hover:bg-accent shadow-sm'
                          }`}
                          style={{ 
                            borderLeft: `3px solid ${item.color}`,
                            boxShadow: item.completed ? 'none' : `0 1px 3px rgba(0,0,0,0.1)`
                          }}
                          onClick={() => {
                            if (item.type === 'task') {
                              toggleTask(item.id);
                            } else if (item.type === 'habit') {
                              toggleHabit(item.id);
                            } else if (item.type === 'challenge') {
                              toggleChallenge(item.id);
                            }
                          }}
                          title={`${item.type.charAt(0).toUpperCase() + item.type.slice(1)}: ${item.title}`}
                        >
                          <span className="flex-shrink-0">{item.icon}</span>
                          <span className="truncate flex-grow">{item.title}</span>
                          {!item.completed && (
                            <span className="ml-auto flex-shrink-0 w-2 h-2 bg-current rounded-full"></span>
                          )}
                        </div>
                      ))}
                      {/* Daily tasks */}
                      {(dailySchedule[formatDate(date)] || []).map((task: DailyTask) => (
                        <div 
                          key={task.id}
                          className={`flex items-center gap-1 p-1 rounded text-xs ${
                            task.completed 
                              ? 'bg-blue-100 text-blue-800 line-through' 
                              : 'bg-blue-50 text-blue-700'
                          }`}
                          style={{ borderLeft: '3px solid #3b82f6' }}
                        >
                          <span>📋</span>
                          <span className="truncate">{task.title}</span>
                          {task.time && <span className="text-xs">({task.time})</span>}
                        </div>
                      ))}
                    </div>
                    {/* Click to add daily tasks */}
                    <div className="mt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full h-6 text-xs shrink-0"
                        onClick={() => {
                          setSelectedDate(formatDate(date));
                          setShowDailyModal(true);
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Task
                      </Button>
                    </div>
                  </>
                ) : null}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Daily Task Modal */}
      <Dialog open={showDailyModal} onOpenChange={setShowDailyModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Daily Tasks for {new Date(selectedDate).toLocaleDateString()}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">Task Title</Label>
              <Input
                id="task-title"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Enter task title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-time">Time (optional)</Label>
              <Input
                id="task-time"
                type="time"
                value={newTaskTime}
                onChange={(e) => setNewTaskTime(e.target.value)}
              />
            </div>
            <Button onClick={addDailyTask} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
            
            <div className="space-y-2 pt-4 border-t">
              <h3 className="font-medium">Scheduled Tasks</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {(dailySchedule[selectedDate] || []).map(task => (
                  <div key={task.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleDailyTask(selectedDate, task.id)}
                        className="h-4 w-4"
                      />
                      <div>
                        <p className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </p>
                        {task.time && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {task.time}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteDailyTask(selectedDate, task.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}