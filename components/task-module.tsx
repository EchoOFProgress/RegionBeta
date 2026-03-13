"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, Trash2, CheckCircle2, Circle, Star, CheckSquare, Settings, Sparkles, Target, Calendar, Clock, GripVertical, Palette, Zap, Flame, Trophy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ExtendedTaskForm } from "@/components/extended-task-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { getPriorityColor, shouldGlow } from "@/lib/priority-colors"
import { useCategories } from "@/lib/category-context"
import { useUI } from "@/lib/ui-context"
import { TaskAnalyticsModal } from "@/components/task-analytics-modal"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { storage } from "@/lib/storage"
import { useNotifications } from "@/lib/notification-context"

type TaskType = "boolean" | "numeric"
type NumericCondition = "at-least" | "less-than" | "exactly"

type Task = {
  id: string
  title: string
  priority: number
  completed: boolean
  type: TaskType
  numericValue?: number
  numericCondition?: NumericCondition
  numericTarget?: number
  description?: string
  dueDate?: string
  categories?: string[]
  timeEstimate?: number // Add time estimate field (in minutes)
  energyLevel?: number // Add energy level field (1-10)
  createdAt?: string // Add creation date for analytics
  completedAt?: string // Add completion date for analytics
  // Link to goals
  linkedGoalId?: string // ID of the goal this task is linked to
  // Dependencies
  dependencies?: string[] // IDs of tasks that must be completed before this task can be started
  // Time blocking
  timeBlockStart?: string // Start time for time block (HH:MM format)
  timeBlockEnd?: string // End time for time block (HH:MM format)
  timeBlockDate?: string // Date for time block (YYYY-MM-DD)
  tags?: string[] // Tags/labels for the task
  // Recurrence
  isRecurring?: boolean // Whether this task repeats
  recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'yearly' // How often the task repeats
  recurrenceEndDate?: string // When the recurrence ends (YYYY-MM-DD)
  recurrenceInterval?: number // Interval between recurrences (e.g., every 2 weeks)
  // Streak tracking
  streak?: number // Current streak count
  bestStreak?: number // Best streak achieved
  lastCompleted?: string // Date of last completion
  completionRecords?: { date: string; value?: number; energyLevel?: number; mood?: number; note?: string }[] // Historical completion data
}

type PresetTask = {
  title: string;
  priority: number;
  description: string;
  categories: string[];
  timeEstimate?: number;
  energyLevel?: number;
}

const PRESET_TASKS: PresetTask[] = [
  {
    title: "Finish quarterly report",
    priority: 85,
    description: "Complete the Q3 financial report for the board meeting",
    categories: ["Work"],
    timeEstimate: 120, // 2 hours
    energyLevel: 8 // High energy required
  },
  {
    title: "Morning workout routine",
    priority: 70,
    description: "30-minute cardio and strength training session",
    categories: ["Health", "Personal"],
    timeEstimate: 30, // 30 minutes
    energyLevel: 7 // High energy required
  },
  {
    title: "Read 30 pages of book",
    priority: 45,
    description: "Continue reading 'Atomic Habits' by James Clear",
    categories: ["Learning"],
    timeEstimate: 45, // 45 minutes
    energyLevel: 3 // Low energy required
  }
]

export function TaskModule({ onTasksChange, goals = [], addedModules = [] }: { onTasksChange?: (tasks: Task[]) => void; goals?: { id: string; title: string }[]; addedModules?: string[] }) {
  const { categories, addCategory } = useCategories()
  const { checkForNotifications } = useNotifications();
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = storage.load("tasks", [
      {
        id: "1",
        title: "Complete project proposal",
        priority: 90,
        completed: false,
        type: "boolean",
        description: "Finish the client proposal document and send for review",
        categories: ["Work"],
        dueDate: "2023-11-10",
        timeEstimate: 90, // 1.5 hours
        energyLevel: 7, // High energy required
        tags: [],
        streak: 0,
        bestStreak: 0,
        completionRecords: []
      },
      {
        id: "2",
        title: "Team meeting preparation",
        priority: 65,
        completed: true,
        type: "boolean",
        description: "Prepare agenda and materials for tomorrow's team meeting",
        categories: ["Work"],
        timeEstimate: 30, // 30 minutes
        energyLevel: 5, // Medium energy required
        tags: [],
        streak: 1,
        bestStreak: 1,
        lastCompleted: new Date().toISOString().split('T')[0],
        completionRecords: [{ date: new Date().toISOString().split('T')[0], energyLevel: 5 }]
      },
      {
        id: "3",
        title: "Buy groceries",
        priority: 30,
        completed: false,
        type: "boolean",
        description: "Milk, bread, fruits, and vegetables",
        categories: ["Personal"],
        timeEstimate: 45, // 45 minutes
        energyLevel: 3, // Low energy required
        tags: [],
        streak: 0,
        bestStreak: 0,
        completionRecords: []
      },
      {
        id: "4",
        title: "Call dentist for appointment",
        priority: 40,
        completed: false,
        type: "boolean",
        description: "Schedule annual checkup",
        categories: ["Health"],
        timeEstimate: 15, // 15 minutes
        energyLevel: 4, // Medium-low energy required
        tags: [],
        streak: 0,
        bestStreak: 0,
        completionRecords: []
      }
    ])
    return Array.isArray(savedTasks) ? savedTasks : []
  })
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskPriority, setNewTaskPriority] = useState(50)
  const [showExtendedForm, setShowExtendedForm] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editPriority, setEditPriority] = useState(50)
  const [editType, setEditType] = useState<TaskType>("boolean")
  const [editNumericValue, setEditNumericValue] = useState(0)
  const [editNumericCondition, setEditNumericCondition] = useState<NumericCondition>("at-least")
  const [editNumericTarget, setEditNumericTarget] = useState(1)
  const [editTimeEstimate, setEditTimeEstimate] = useState<number | undefined>(undefined) // Add time estimate state
  const [editEnergyLevel, setEditEnergyLevel] = useState<number>(5) // Add energy level state
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'created' | 'manual'>("priority")
  const [filterByCategory, setFilterByCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const { toast } = useToast()

  // Save tasks to localStorage and notify when tasks change
  useEffect(() => {
    storage.save("tasks", tasks);
    
    if (onTasksChange) {
      onTasksChange(tasks);
    }
    
  }, [tasks, onTasksChange]);
  
  // Effect to handle external changes to tasks (e.g., from other modules)
  useEffect(() => {
    const handleTasksUpdated = (e: CustomEvent) => {
      setTasks(e.detail);
    };
    
    window.addEventListener('tasksUpdated', handleTasksUpdated as EventListener);
    
    return () => {
      window.removeEventListener('tasksUpdated', handleTasksUpdated as EventListener);
    };
  }, []);

  // Handle drag and drop
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(activeTasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update the tasks state with the new order
    // We need to merge the reordered active tasks with the completed tasks
    const completed = tasks.filter(t => t.completed);
    const updatedTasks = [...items, ...completed];
    setTasks(updatedTasks);
    setSortBy('manual'); // Switch to manual sorting mode
  }

  // Add a new category
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a category name",
        variant: "destructive",
      })
      return
    }
    
    // Limit category name to 20 characters
    const categoryName = newCategoryName.trim().substring(0, 20);

    // Check if category already exists
    if (categories.some(cat => cat.name.toLowerCase() === categoryName.toLowerCase())) {
      toast({
        title: "Error",
        description: "Category already exists",
        variant: "destructive",
      })
      return
    }

    addCategory(categoryName)
    setNewCategoryName("")
    setShowCategoryForm(false)
    toast({
      title: "Category Added!",
      description: `New category "${categoryName}" created`,
    })
  }

  const progressPercent = 0

  const addPresetTask = (preset: (typeof PRESET_TASKS)[0]) => {
    const task: Task = {
      id: Date.now().toString(),
      title: preset.title,
      priority: preset.priority,
      completed: false,
      type: "boolean",
      description: preset.description,
      categories: preset.categories,
      timeEstimate: preset.timeEstimate,
      energyLevel: preset.energyLevel, // Use energy level from preset
      createdAt: new Date().toISOString(), // Add creation date
      dependencies: [], // Initialize dependencies as empty array
      timeBlockStart: undefined, // Initialize time block
      timeBlockEnd: undefined, // Initialize time block
      timeBlockDate: undefined, // Initialize time block
      tags: [], // Initialize tags as empty array
      isRecurring: false, // Initialize recurrence
      recurrencePattern: undefined, // Initialize recurrence
      recurrenceEndDate: undefined, // Initialize recurrence
      recurrenceInterval: 1, // Initialize recurrence
      streak: 0,
      bestStreak: 0,
      completionRecords: []
    }

    setTasks([...tasks, task])
    toast({
      title: "Task Added!",
      description: `New task "${preset.title}" created`,
    })
  }

  const addTask = () => {
    if (!newTaskTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a task title",
        variant: "destructive",
      })
      return
    }

    const task: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      priority: newTaskPriority,
      completed: false,
      type: "boolean",
      energyLevel: 5, // Default medium energy
      createdAt: new Date().toISOString(), // Add creation date
      dependencies: [], // Initialize dependencies as empty array
      timeBlockStart: undefined, // Initialize time block
      timeBlockEnd: undefined, // Initialize time block
      timeBlockDate: undefined, // Initialize time block
      tags: [], // Initialize tags as empty array
      isRecurring: false, // Initialize recurrence
      recurrencePattern: undefined, // Initialize recurrence
      recurrenceEndDate: undefined, // Initialize recurrence
      recurrenceInterval: 1, // Initialize recurrence
      streak: 0,
      bestStreak: 0,
      completionRecords: []
    }

    setTasks([...tasks, task])
    setNewTaskTitle("")
    toast({
      title: "Task Added!",
      description: `New task with priority ${newTaskPriority} created`,
    })
  }

  const addExtendedTask = (taskData: {
    title: string;
    description: string;
    priority: number;
    categories: string[];
    dueDate?: Date;
    reminderEnabled: boolean;
    reminderTime?: Date;
    timeEstimate?: number; // Add time estimate parameter
    energyLevel?: number; // Add energy level parameter
    linkedGoalId?: string; // Add linked goal ID parameter
    dependencies?: string[]; // Add dependencies parameter
    timeBlockStart?: string; // Add time block start parameter
    timeBlockEnd?: string; // Add time block end parameter
    timeBlockDate?: string; // Add time block date parameter
    isRecurring?: boolean; // Add recurring parameter
    recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'yearly'; // Add recurrence pattern parameter
    recurrenceEndDate?: string; // Add recurrence end date parameter
    recurrenceInterval?: number; // Add recurrence interval parameter
    tags?: string[]; // Add tags parameter
  }) => {
    const task: Task = {
      id: Date.now().toString(),
      title: taskData.title,
      priority: taskData.priority,
      completed: false,
      type: "boolean",
      description: taskData.description,
      dueDate: taskData.dueDate?.toISOString(),
      categories: taskData.categories,
      timeEstimate: taskData.timeEstimate, // Add time estimate to task
      energyLevel: taskData.energyLevel, // Add energy level to task
      linkedGoalId: taskData.linkedGoalId, // Add linked goal ID to task
      dependencies: taskData.dependencies || [], // Add dependencies to task
      timeBlockStart: taskData.timeBlockStart, // Add time block start to task
      timeBlockEnd: taskData.timeBlockEnd, // Add time block end to task
      timeBlockDate: taskData.timeBlockDate, // Add time block date to task
      tags: taskData.tags || [], // Add tags to task
      isRecurring: taskData.isRecurring, // Add recurring to task
      recurrencePattern: taskData.recurrencePattern, // Add recurrence pattern to task
      recurrenceEndDate: taskData.recurrenceEndDate, // Add recurrence end date to task
      recurrenceInterval: taskData.recurrenceInterval || 1, // Add recurrence interval to task
      createdAt: new Date().toISOString(), // Add creation date
      streak: 0,
      bestStreak: 0,
      completionRecords: []
    }

    setTasks([...tasks, task])
    setShowExtendedForm(false)
    toast({
      title: "Task Added!",
      description: `New task "${taskData.title}" created with extended settings`,
    })
  }

  const toggleTask = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    setTasks(tasks.map(task => {
      if (task.id === id) {
        // Check if task has dependencies and if they're all completed
        if (task.dependencies && task.dependencies.length > 0) {
          const hasUncompletedDependencies = task.dependencies.some(depId => {
            const depTask = tasks.find(t => t.id === depId);
            return depTask && !depTask.completed; // If dependency exists and is not completed
          });
          
          if (hasUncompletedDependencies && !task.completed) {
            toast({
              title: "Cannot Complete Task",
              description: "This task has uncompleted dependencies that must be finished first.",
              variant: "destructive",
            });
            return task; // Return the task unchanged
          }
        }
        
        const wasCompleted = task.completed;
        const updatedTask = {
          ...task,
          completed: !task.completed
        };
        
        // Handle streak tracking when task is completed
        if (!wasCompleted && updatedTask.completed) {
          // Task is being marked as completed
          const lastCompletedDate = task.lastCompleted;
          
          // Update completion records
          const newCompletionRecord = {
            date: today,
            energyLevel: task.energyLevel,
            note: `Completed task: ${task.title}`
          };
          
          const updatedCompletionRecords = [
            ...(task.completionRecords || []),
            newCompletionRecord
          ];
          
          // Calculate streaks
          let newStreak = task.streak || 0;
          let newBestStreak = task.bestStreak || 0;
          
          if (lastCompletedDate) {
            // Calculate if this continues the streak
            const lastCompletion = new Date(lastCompletedDate);
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            // Check if last completion was yesterday (for consecutive streak)
            if (lastCompletion.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
              newStreak = (task.streak || 0) + 1;
            } else if (lastCompletedDate === today) {
              // If it was already completed today, don't change streak
              newStreak = task.streak || 0;
            } else {
              // Otherwise, reset to 1 (new streak started)
              newStreak = 1;
            }
          } else {
            // First time completing this task
            newStreak = 1;
          }
          
          // Update best streak if current streak is higher
          if (newStreak > newBestStreak) {
            newBestStreak = newStreak;
          }
          
          // Update task with streak data
          updatedTask.streak = newStreak;
          updatedTask.bestStreak = newBestStreak;
          updatedTask.lastCompleted = today;
          updatedTask.completionRecords = updatedCompletionRecords;
          updatedTask.completedAt = new Date().toISOString();
          
          // Handle recurrence when task is completed
          if (task.isRecurring && task.recurrencePattern) {
            // Calculate the next occurrence date
            const today = new Date();
            let nextDate: Date;
            
            switch (task.recurrencePattern) {
              case 'daily':
                nextDate = new Date(today);
                nextDate.setDate(today.getDate() + (task.recurrenceInterval || 1));
                break;
              case 'weekly':
                nextDate = new Date(today);
                nextDate.setDate(today.getDate() + (7 * (task.recurrenceInterval || 1)));
                break;
              case 'monthly':
                nextDate = new Date(today);
                nextDate.setMonth(today.getMonth() + (task.recurrenceInterval || 1));
                break;
              case 'yearly':
                nextDate = new Date(today);
                nextDate.setFullYear(today.getFullYear() + (task.recurrenceInterval || 1));
                break;
              default:
                nextDate = new Date(today);
                nextDate.setDate(today.getDate() + 1); // Default to daily
            }
            
            // Check if we should create the next occurrence
            const shouldCreateNext = !task.recurrenceEndDate || nextDate <= new Date(task.recurrenceEndDate);
            
            if (shouldCreateNext) {
              // Create a new task with the same properties but reset completion status
              const newTask: Task = {
                ...task,
                id: `${task.id}-${Date.now()}`, // Create unique ID for the new occurrence
                completed: false,
                createdAt: new Date().toISOString(),
                completedAt: undefined,
                lastCompleted: undefined,
                streak: 0,
                bestStreak: task.bestStreak, // Preserve best streak from the original task
                completionRecords: [] // Start with empty completion records for the new instance
              };
              
              // Add the new recurring task to the task list
              setTasks(prevTasks => [...prevTasks, newTask]);
              
              toast({
                title: "Recurring Task Created!",
                description: `Next occurrence of "${task.title}" has been added to your list`,
              });
            }
          }
        } else if (wasCompleted && !updatedTask.completed) {
          // Task is being marked as incomplete
          updatedTask.completedAt = undefined;
          
          // Note: We don't reduce streak when uncompleting, as streaks typically only count consecutive completions
          // However, we could implement logic to reduce streak if needed
        }
        
        return updatedTask;
      }
      return task;
    }));
  }

  const updateNumericTask = (id: string, value: number) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return

    // Check if task has dependencies and if they're all completed
    if (task.dependencies && task.dependencies.length > 0) {
      const hasUncompletedDependencies = task.dependencies.some(depId => {
        const depTask = tasks.find(t => t.id === depId);
        return depTask && !depTask.completed; // If dependency exists and is not completed
      });
      
      if (hasUncompletedDependencies) {
        toast({
          title: "Cannot Update Task",
          description: "This task has uncompleted dependencies that must be finished first.",
          variant: "destructive",
        });
        return;
      }
    }

    let completed = false
    if (task.numericCondition === "at-least") {
      completed = value >= (task.numericTarget || 0)
    } else if (task.numericCondition === "less-than") {
      completed = value < (task.numericTarget || 0)
    } else if (task.numericCondition === "exactly") {
      completed = value === (task.numericTarget || 0)
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    const updatedTasks = tasks.map((t) => 
      t.id === id 
        ? { 
            ...t, 
            numericValue: value,
            completed: completed,
            // Update streak tracking if task was just completed
            ...(completed && !task.completed ? {
              streak: calculateNewStreak(t, today),
              bestStreak: Math.max(t.bestStreak || 0, calculateNewStreak(t, today)),
              lastCompleted: today,
              completionRecords: [
                ...(t.completionRecords || []),
                {
                  date: today,
                  value: value,
                  energyLevel: t.energyLevel,
                  note: `Completed numeric task: ${t.title} with value ${value}`
                }
              ]
            } : {}),
            completedAt: (completed && !task.completed) ? new Date().toISOString() : t.completedAt
          } 
        : t
    )
    setTasks(updatedTasks)

    if (completed && !task.completed) {
      toast({
        title: "Task Completed!",
        description: "Keep up the good work!",
      })
    }
  }
  
  // Helper function to calculate new streak for a task
  const calculateNewStreak = (task: Task, today: string) => {
    const lastCompletedDate = task.lastCompleted;
    
    if (lastCompletedDate) {
      // Calculate if this continues the streak
      const lastCompletion = new Date(lastCompletedDate);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Check if last completion was yesterday (for consecutive streak)
      if (lastCompletion.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
        return (task.streak || 0) + 1;
      } else if (lastCompletedDate === today) {
        // If it was already completed today, don't change streak
        return task.streak || 0;
      } else {
        // Otherwise, reset to 1 (new streak started)
        return 1;
      }
    } else {
      // First time completing this task
      return 1;
    }
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id))
    toast({
      title: "Task Deleted",
      description: "Task removed from your list",
    })
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setEditTitle(task.title)
    setEditDescription(task.description || "")
    setEditPriority(task.priority)
    setEditType(task.type)
    setEditNumericValue(task.numericValue || 0)
    setEditNumericCondition(task.numericCondition || "at-least")
    setEditNumericTarget(task.numericTarget || 1)
    setEditTimeEstimate(task.timeEstimate) // Add time estimate to edit state
    setEditEnergyLevel(task.energyLevel || 5) // Add energy level to edit state
  }

  const saveTaskEdits = () => {
    if (editingTask) {
      const updatedTasks = tasks.map(task => 
        task.id === editingTask.id 
          ? { 
              ...task, 
              title: editTitle,
              description: editDescription,
              priority: editPriority,
              type: editType,
              numericValue: editType === "numeric" ? editNumericValue : undefined,
              numericCondition: editType === "numeric" ? editNumericCondition : undefined,
              numericTarget: editType === "numeric" ? editNumericTarget : undefined,
              timeEstimate: editTimeEstimate, // Add time estimate to updated task
              energyLevel: editEnergyLevel, // Add energy level to updated task
              // Preserve dependencies
              dependencies: task.dependencies,
              // Preserve time blocking
              timeBlockStart: task.timeBlockStart,
              timeBlockEnd: task.timeBlockEnd,
              timeBlockDate: task.timeBlockDate,
              // Preserve recurrence
              isRecurring: task.isRecurring,
              recurrencePattern: task.recurrencePattern,
              recurrenceEndDate: task.recurrenceEndDate,
              recurrenceInterval: task.recurrenceInterval,
              // Preserve tags
              tags: task.tags,
              // Preserve streak data
              streak: task.streak,
              bestStreak: task.bestStreak,
              lastCompleted: task.lastCompleted,
              completionRecords: task.completionRecords
            } 
          : task
      )
      setTasks(updatedTasks)
      setEditingTask(null)
      toast({
        title: "Task Updated!",
        description: "Your task has been successfully updated",
      })
    }
  }

  const getPriorityColorStyle = (priority: number, categories?: string[]) => {
    const color = getPriorityColor(priority, 'tasks', categories);
    const glow = shouldGlow(priority, 'tasks', categories);
    
    if (!color) return {};
    
    const style: React.CSSProperties = {
      border: `2px solid ${color}`
    };
    
    if (glow) {
      style.boxShadow = `0 0 8px ${color}`;
    }
    
    return style;
  };

  const getPriorityColorClass = (priority: number) => {
    // Following the Dashboard Priority Display specification:
    // Priority numbers must be displayed with transparent background and border styling
    return "bg-transparent text-foreground border border-muted";
  }
  
  const getPriorityInlineStyle = (priority: number) => {
    // No additional inline styles needed since we're using the transparent background approach
    return {};
  };
  
  const getPriorityLabel = (priority: number) => {
    return `${priority}`;
  }

  const getConditionLabel = (condition: NumericCondition) => {
    switch (condition) {
      case "at-least": return "At least"
      case "less-than": return "Less than"
      case "exactly": return "Exactly"
      default: return ""
    }
  }

  const isTaskOverdue = (task: Task) => {
    if (!task.dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today && !task.completed;
  }

  const { uiSettings } = useUI();
  
  const getTaskStyle = (task: Task) => {
    const baseStyle = getPriorityColorStyle(task.priority, task.categories);
    
    if (uiSettings.highlightOverdueTasks && isTaskOverdue(task)) {
      // Ensure overdueTaskColor exists and is a valid hex color
      const overdueColor = uiSettings.overdueTaskColor || '#ef4444'; // fallback to default red
      if (overdueColor && overdueColor.startsWith('#') && overdueColor.length === 7) {
        return { 
          ...baseStyle, 
          border: `2px solid ${overdueColor}`, 
          backgroundColor: `rgba(${parseInt(overdueColor.slice(1, 3), 16)}, ${parseInt(overdueColor.slice(3, 5), 16)}, ${parseInt(overdueColor.slice(5, 7), 16)}, 0.05)` 
        };
      } else {
        // Fallback if color is invalid
        return { 
          ...baseStyle, 
          border: `2px solid #ef4444`, 
          backgroundColor: `rgba(239, 68, 68, 0.05)` 
        };
      }
    }
    return baseStyle;
  }

  // Filter and sort tasks
  const activeTasks = tasks
    .filter((t) => !t.completed)
    .filter((t) => filterByCategory === 'all' || (t.categories && t.categories.includes(filterByCategory)))
    .filter((t) => searchTerm === '' || t.title.toLowerCase().includes(searchTerm.toLowerCase()) || (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase())))
    .sort((a, b) => {
      if (sortBy === 'priority') {
        return b.priority - a.priority;
      } else if (sortBy === 'dueDate') {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (sortBy === 'created') {
        if (!a.createdAt && !b.createdAt) return 0;
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      // For manual sorting, we preserve the current order
      return 0;
    });
  
  const completedTasks = tasks.filter((t) => t.completed)
    .filter((t) => filterByCategory === 'all' || (t.categories && t.categories.includes(filterByCategory)))
    .filter((t) => searchTerm === '' || t.title.toLowerCase().includes(searchTerm.toLowerCase()) || (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase())))
    .sort((a, b) => {
      if (sortBy === 'priority') {
        return b.priority - a.priority;
      } else if (sortBy === 'dueDate' && a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (sortBy === 'created') {
        return a.id.localeCompare(b.id);
      }
      return 0;
    })

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="space-y-6">
        {/* Top Bar with Sorting Controls and Add Button */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full">
                {/* Search */}
                <div className="w-full sm:w-64">
                  <Input
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="rounded-lg border-border focus:border-primary"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  {/* Sort By */}
                  <div className="w-full sm:w-40">
                    <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                      <SelectTrigger className="rounded-lg border-border focus:border-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="priority">Priority</SelectItem>
                        <SelectItem value="dueDate">Due Date</SelectItem>
                        <SelectItem value="created">Creation Date</SelectItem>
                        <SelectItem value="manual">Manual Order</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Category Filter */}
                  <div className="w-full sm:w-40">
                    <Select value={filterByCategory} onValueChange={setFilterByCategory}>
                      <SelectTrigger className="rounded-lg border-border focus:border-primary">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                              {category.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {/* Add Task/Button Group */}
              <div className="flex gap-2">
                <Dialog open={showExtendedForm} onOpenChange={setShowExtendedForm}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setShowExtendedForm(true)} className="rounded-lg">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Task</DialogTitle>
                    </DialogHeader>
                    <ExtendedTaskForm 
                      onSubmit={addExtendedTask} 
                      onCancel={() => setShowExtendedForm(false)}
                      goals={goals}
                      tasks={tasks}
                      addedModules={addedModules}
                    />
                  </DialogContent>
                </Dialog>
                
                <Dialog open={showCategoryForm} onOpenChange={setShowCategoryForm}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="rounded-lg">
                      <Palette className="h-4 w-4 mr-2" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Category</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="category-name">Category Name</Label>
                        <Input
                          id="category-name"
                          placeholder="Enter category name"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          maxLength={20}
                        />
                        <p className="text-xs text-muted-foreground">
                          Maximum 20 characters
                        </p>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowCategoryForm(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddCategory}>
                          Create Category
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Tasks */}
        {activeTasks.length > 0 ? (
          <Droppable droppableId="tasks" isDropDisabled={false} isCombineEnabled={false} ignoreContainerClipping={false}>
            {(provided) => (
              <div 
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {activeTasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="mb-4"
                      >
                        <Card 
                          className="border-2 hover:shadow-md transition-all duration-200"
                          style={getTaskStyle(task)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div 
                                {...provided.dragHandleProps}
                                className="mt-1 cursor-move text-muted-foreground hover:text-foreground"
                              >
                                <GripVertical className="h-5 w-5" />
                              </div>
                              
                              {task.type === "boolean" ? (
                                <button onClick={() => toggleTask(task.id)} className="flex-shrink-0 mt-1 text-muted-foreground hover:text-primary">
                                  <Circle className="h-5 w-5" />
                                </button>
                              ) : (
                                <div className="flex items-center gap-2 mt-1">
                                  <Input
                                    type="number"
                                    value={task.numericValue || 0}
                                    onChange={(e) => updateNumericTask(task.id, Number(e.target.value))}
                                    className="w-20 rounded-lg border-border focus:border-primary"
                                    min="0"
                                  />
                                  <span className="text-sm text-muted-foreground">
                                    {getConditionLabel(task.numericCondition || "at-least")} {task.numericTarget}
                                  </span>
                                </div>
                              )}
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className={`font-medium ${task.priority >= 67 ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {task.title}
                                  </p>
                                  {isTaskOverdue(task) && (
                                    <Badge variant="destructive" className="text-xs">
                                      Overdue
                                    </Badge>
                                  )}
                                  {task.timeEstimate && (
                                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {task.timeEstimate >= 60 
                                        ? `${Math.floor(task.timeEstimate / 60)}h ${task.timeEstimate % 60}m` 
                                        : `${task.timeEstimate}m`}
                                    </Badge>
                                  )}
                                </div>
                                
                                {task.description && (
                                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                    {task.description}
                                  </p>
                                )}
                                
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                  {task.categories && task.categories.map((category, idx) => {
                                    const cat = categories.find(c => c.name === category);
                                    return (
                                      <Badge 
                                        key={idx} 
                                        variant="outline" 
                                        className="text-xs flex items-center gap-1"
                                      >
                                        {cat && <div className={`w-2 h-2 rounded-full ${cat.color}`}></div>}
                                        {category}
                                      </Badge>
                                    );
                                  })}
                                  
                                  {task.dueDate && (
                                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {new Date(task.dueDate).toLocaleDateString()}
                                    </Badge>
                                  )}
                                  
                                  {/* Tags */}
                                  {task.tags && task.tags.map((tag, idx) => (
                                    <Badge 
                                      key={idx} 
                                      variant="secondary" 
                                      className="text-xs"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                  
                                  <Badge 
                                    variant="outline" 
                                    className="text-xs"
                                    style={{ 
                                      borderColor: getPriorityColor(task.priority, 'tasks'), 
                                      color: getPriorityColor(task.priority, 'tasks')
                                    }}
                                  >
                                    {task.priority}
                                  </Badge>
                                  
                                  {task.energyLevel && (
                                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                                      <Zap className="h-3 w-3" />
                                      {task.energyLevel}/10
                                    </Badge>
                                  )}
                                  
                                  {/* Streak Information */}
                                  {task.streak && task.streak > 0 && (
                                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                                      <Flame className="h-3 w-3" />
                                      {task.streak} day streak
                                    </Badge>
                                  )}
                                  
                                  {task.bestStreak && task.bestStreak > 0 && task.bestStreak !== task.streak && (
                                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                                      <Trophy className="h-3 w-3" />
                                      Best: {task.bestStreak}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex gap-1">
                                {/* Analytics Button */}
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <Sparkles className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden">
                                    <div className="sr-only">Task Analytics</div>
                                    <TaskAnalyticsModal task={task} />
                                  </DialogContent>
                                </Dialog>
                                
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => handleEditTask(task)}
                                      className="rounded-lg"
                                    >
                                      <Settings className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Edit Task</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-title">Task Title</Label>
                                        <Input
                                          id="edit-title"
                                          value={editTitle}
                                          onChange={(e) => setEditTitle(e.target.value)}
                                          className="rounded-lg border-border focus:border-primary"
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-description">Description</Label>
                                        <Textarea
                                          id="edit-description"
                                          value={editDescription}
                                          onChange={(e) => setEditDescription(e.target.value)}
                                          rows={3}
                                          className="rounded-lg border-border focus:border-primary"
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-priority">Priority (1-100)</Label>
                                        <Input
                                          id="edit-priority"
                                          type="number"
                                          min="1"
                                          max="100"
                                          value={editPriority}
                                          onChange={(e) => setEditPriority(Math.min(100, Math.max(1, Number(e.target.value))))}
                                          placeholder="Enter priority from 1 (lowest) to 100 (highest)"
                                          className="rounded-lg border-border focus:border-primary"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                          Set task priority: 1-33 (Low), 34-66 (Medium), 67-100 (High)
                                        </p>
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-type">Task Type</Label>
                                        <Select value={editType} onValueChange={(value) => setEditType(value as TaskType)}>
                                          <SelectTrigger id="edit-type" className="rounded-lg border-border focus:border-primary">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="boolean">Yes/No Task</SelectItem>
                                            <SelectItem value="numeric">Numeric Task</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      {editType === "numeric" && (
                                        <>
                                          <div className="space-y-2">
                                            <Label htmlFor="edit-condition">Condition</Label>
                                            <Select value={editNumericCondition} onValueChange={(value) => setEditNumericCondition(value as NumericCondition)}>
                                              <SelectTrigger id="edit-condition" className="rounded-lg border-border focus:border-primary">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="at-least">At least</SelectItem>
                                                <SelectItem value="less-than">Less than</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <div className="space-y-2">
                                            <Label htmlFor="edit-target">Target Value</Label>
                                            <Input
                                              id="edit-target"
                                              type="number"
                                              min="1"
                                              value={editNumericTarget}
                                              onChange={(e) => setEditNumericTarget(Math.max(1, Number(e.target.value)))}
                                              className="rounded-lg border-border focus:border-primary"
                                            />
                                          </div>
                                        </>
                                      )}
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-time-estimate">Time Estimate (minutes)</Label>
                                        <Input
                                          id="edit-time-estimate"
                                          type="number"
                                          min="0"
                                          value={editTimeEstimate || ""}
                                          onChange={(e) => setEditTimeEstimate(e.target.value ? Number(e.target.value) : undefined)}
                                          placeholder="Enter time estimate in minutes"
                                          className="rounded-lg border-border focus:border-primary"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                          Optional time estimate for planning purposes
                                        </p>
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-energy-level">Energy Level (1-10)</Label>
                                        <Input
                                          id="edit-energy-level"
                                          type="range"
                                          min="1"
                                          max="10"
                                          value={editEnergyLevel}
                                          onChange={(e) => setEditEnergyLevel(Number(e.target.value))}
                                          className="w-full rounded-lg border-border focus:border-primary"
                                        />
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                          <span>Low Energy</span>
                                          <span className="font-medium">{editEnergyLevel}</span>
                                          <span>High Energy</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                          How much energy does this task require?
                                        </p>
                                      </div>
                                      <div className="flex justify-end gap-2 pt-2">
                                        <Button variant="outline" onClick={() => setEditingTask(null)} className="rounded-lg">
                                          Cancel
                                        </Button>
                                        <Button onClick={saveTaskEdits} className="rounded-lg">
                                          Save Changes
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteTask(task.id)}
                                  className="flex-shrink-0 text-muted-foreground hover:text-destructive rounded-lg"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No active tasks. Add your first task to get started!</p>
            </CardContent>
          </Card>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Completed Tasks ({completedTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {completedTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className="flex items-start gap-4 p-4 rounded-xl border border-border bg-muted/50 opacity-80"
                    style={getTaskStyle(task)}
                  >
                    {task.type === "boolean" ? (
                      <button onClick={() => toggleTask(task.id)} className="flex-shrink-0 mt-1 text-primary">
                        <CheckCircle2 className="h-6 w-6" />
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          type="number"
                          value={task.numericValue || 0}
                          onChange={(e) => updateNumericTask(task.id, Number(e.target.value))}
                          className="w-20 rounded-lg border-border focus:border-primary"
                          min="0"
                        />
                        <span className="text-sm text-muted-foreground">
                          {getConditionLabel(task.numericCondition || "at-least")} {task.numericTarget}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-muted-foreground line-through">{task.title}</p>
                        {isTaskOverdue(task) && (
                          <Badge variant="destructive" className="text-xs">
                            Overdue
                          </Badge>
                        )}
                        {task.timeEstimate && (
                          <Badge variant="outline" className="text-xs flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {task.timeEstimate >= 60 
                              ? `${Math.floor(task.timeEstimate / 60)}h ${task.timeEstimate % 60}m` 
                              : `${task.timeEstimate}m`}
                          </Badge>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {task.categories && task.categories.map((category, idx) => {
                          const cat = categories.find(c => c.name === category);
                          return (
                            <Badge 
                              key={idx} 
                              variant="outline" 
                              className="text-xs flex items-center gap-1"
                            >
                              {cat && <div className={`w-2 h-2 rounded-full ${cat.color}`}></div>}
                              {category}
                            </Badge>
                          );
                        })}
                        
                        {task.dueDate && (
                          <Badge variant="outline" className="text-xs flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </Badge>
                        )}
                        
                        {/* Tags */}
                        {task.tags && task.tags.map((tag, idx) => (
                          <Badge 
                            key={idx} 
                            variant="secondary" 
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                        
                        <Badge 
                          variant="outline" 
                          className="text-xs"
                          style={{ 
                            borderColor: getPriorityColor(task.priority, 'tasks'), 
                            color: getPriorityColor(task.priority, 'tasks')
                          }}
                        >
                          {task.priority}
                        </Badge>
                        
                        {task.energyLevel && (
                          <Badge variant="outline" className="text-xs flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            {task.energyLevel}/10
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTask(task.id)}
                      className="flex-shrink-0 text-muted-foreground hover:text-destructive rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preset Tasks at the Bottom */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Quick Start Tasks
            </CardTitle>
            <CardDescription>Jumpstart your productivity with these preset tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PRESET_TASKS.map((preset, index) => (
                <Card 
                  key={index} 
                  className="hover:shadow-md transition-shadow cursor-pointer border-border"
                  onClick={() => addPresetTask(preset)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Circle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-foreground">{preset.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{preset.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge 
                            variant="outline" 
                            className="text-xs"
                            style={{ 
                              borderColor: getPriorityColor(preset.priority, 'tasks'), 
                              color: getPriorityColor(preset.priority, 'tasks')
                            }}
                          >
                            {preset.priority}
                          </Badge>
                          {preset.timeEstimate && (
                            <Badge variant="outline" className="text-xs flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {preset.timeEstimate >= 60 
                                ? `${Math.floor(preset.timeEstimate / 60)}h ${preset.timeEstimate % 60}m` 
                                : `${preset.timeEstimate}m`}
                            </Badge>
                          )}
                          {preset.energyLevel && (
                            <Badge variant="outline" className="text-xs flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              {preset.energyLevel}/10
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-3 rounded-lg">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Task
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DragDropContext>
  )
}