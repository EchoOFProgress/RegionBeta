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
  GripVertical
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { storage } from "@/lib/storage";

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

    // Add tasks due on this date
    const dueTasks = tasks.filter(task => task.dueDate === dateStr);
    dueTasks.forEach(task => {
      items.push({
        type: 'task',
        id: task.id,
        title: task.title,
        completed: task.completed,
        color: '#3b82f6',
        icon: <CheckSquare className="h-3 w-3" />
      });
    });

    // Add habits that should be completed today
    const todayHabits = habits.filter(habit => true);
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
    const activeChallenges = challenges.filter(challenge => {
      const startDate = new Date(challenge.startDate);
      const endDate = new Date(challenge.endDate);
      const checkDate = new Date(dateStr);
      return checkDate >= startDate && checkDate <= endDate && challenge.status === 'active';
    });
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
    const goalItems = goals.filter(goal => goal.targetDate === dateStr);
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

    return items;
  }, [tasks, habits, challenges, goals]);

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
            
            <div className="space-y-2">
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
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Main Calendar */}
      <Card className="flex-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
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
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-lg font-semibold">
              {monthName} {year}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
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
                className={`min-h-24 p-1 border rounded ${
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
                          className={`flex items-center gap-1 p-1 rounded text-xs cursor-pointer ${
                            item.completed 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-muted hover:bg-accent'
                          }`}
                          style={{ borderLeft: `3px solid ${item.color}` }}
                          onClick={() => {
                            if (item.type === 'task') {
                              toggleTask(item.id);
                            } else if (item.type === 'habit') {
                              toggleHabit(item.id);
                            } else if (item.type === 'challenge') {
                              toggleChallenge(item.id);
                            }
                          }}
                        >
                          <span>{item.icon}</span>
                          <span className="truncate">{item.title}</span>
                          {!item.completed && <span className="ml-auto">•</span>}
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-1 h-6 text-xs"
                      onClick={() => {
                        setSelectedDate(formatDate(date));
                        setShowDailyModal(true);
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Task
                    </Button>
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