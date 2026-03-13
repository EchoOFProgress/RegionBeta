"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Plus, Trash2, CheckCircle2, Circle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format, addDays, startOfWeek, isSameDay } from "date-fns"
import { cs } from "date-fns/locale"
import { useCategories } from "@/lib/category-context"
import { storage } from "@/lib/storage"


type Task = {
  id: string
  title: string
  priority: number
  completed: boolean
  type?: string
  description?: string
  dueDate?: string
  categories?: string[]
  timeEstimate?: number
  createdAt?: string
  completedAt?: string
}

type ScheduledTask = {
  id: string
  taskId: string
  date: string // YYYY-MM-DD
  startTime: string // HH:MM
  endTime: string // HH:MM
}

const DAYS = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"]
const TIME_SLOTS = [
  "00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00",
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00",
  "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"
]

export function TimeBoxingModule({ tasks = [], setTasks }: { tasks?: Task[]; setTasks?: React.Dispatch<React.SetStateAction<Task[]>> }) {
  const { categories } = useCategories()
  const { toast } = useToast()
  
  // Load scheduled tasks from localStorage or initialize with empty array
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>(() => {
    const savedScheduledTasks = storage.load("scheduledTasks", [])
    return Array.isArray(savedScheduledTasks) ? savedScheduledTasks : []
  })
  
  // Save tasks to localStorage whenever they change
  useEffect(() => {
    storage.save("tasks", tasks);
  }, [tasks]);
  
  // Load tasks from localStorage if not provided and setTasks is available
  useEffect(() => {
    if (tasks.length === 0 && setTasks) {
      const savedTasks = storage.load("tasks", []);
      if (Array.isArray(savedTasks) && savedTasks.length > 0) {
        setTasks(savedTasks);
      }
    }
  }, [tasks, setTasks]);
  
  // Save scheduled tasks to localStorage whenever they change
  useEffect(() => {
    storage.save("scheduledTasks", scheduledTasks)
  }, [scheduledTasks])
  
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"))
  const [newScheduledTask, setNewScheduledTask] = useState({
    taskId: "",
    date: format(new Date(), "yyyy-MM-dd"),
    startTime: "09:00",
    endTime: "10:00"
  })
  
  // Get tasks that are not scheduled for the selected date
  const unscheduledTasks = tasks.filter(task => {
    const isScheduled = scheduledTasks.some(st => 
      st.taskId === task.id && st.date === selectedDate
    )
    return !task.completed && !isScheduled
  })
  
  // Get scheduled tasks for the selected date
  const scheduledTasksForDate = scheduledTasks
    .filter(st => st.date === selectedDate)
    .map(st => {
      const task = tasks.find(t => t.id === st.taskId)
      return { ...st, task }
    })
    .filter(st => st.task) // Remove scheduled tasks without corresponding task
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  const addScheduledTask = () => {
    if (!newScheduledTask.taskId) {
      toast({
        title: "Error",
        description: "Please select a task to schedule",
        variant: "destructive"
      })
      return
    }

    // Validate time
    if (newScheduledTask.startTime >= newScheduledTask.endTime) {
      toast({
        title: "Error",
        description: "End time must be after start time",
        variant: "destructive"
      })
      return
    }

    // Check for time conflicts
    const hasConflict = scheduledTasksForDate.some(st => {
      return (
        st.taskId !== newScheduledTask.taskId &&
        (
          (newScheduledTask.startTime >= st.startTime && newScheduledTask.startTime < st.endTime) ||
          (newScheduledTask.endTime > st.startTime && newScheduledTask.endTime <= st.endTime) ||
          (newScheduledTask.startTime <= st.startTime && newScheduledTask.endTime >= st.endTime)
        )
      )
    })

    if (hasConflict) {
      toast({
        title: "Time Conflict",
        description: "This time slot conflicts with another scheduled task",
        variant: "destructive"
      })
      return
    }

    const scheduledTask: ScheduledTask = {
      id: Date.now().toString(),
      taskId: newScheduledTask.taskId,
      date: newScheduledTask.date,
      startTime: newScheduledTask.startTime,
      endTime: newScheduledTask.endTime
    }

    setScheduledTasks([...scheduledTasks, scheduledTask])
    
    toast({
      title: "Task Scheduled",
      description: "Task has been added to your schedule"
    })
    
    // Reset form
    setNewScheduledTask({
      taskId: "",
      date: selectedDate,
      startTime: "09:00",
      endTime: "10:00"
    })
  }

  const removeScheduledTask = (id: string) => {
    setScheduledTasks(scheduledTasks.filter(st => st.id !== id))
    toast({
      title: "Task Removed",
      description: "Task has been removed from your schedule"
    })
  }

  const toggleTaskCompletion = (taskId: string) => {
    if (setTasks) {
      setTasks(tasks.map(task => {
        if (task.id === taskId) {
          const updatedTask = { ...task, completed: !task.completed };
          
          // Set completedAt when task is completed
          if (updatedTask.completed && !updatedTask.completedAt) {
            updatedTask.completedAt = new Date().toISOString();
          }
          
          // Clear completedAt when task is marked as not completed
          if (!updatedTask.completed) {
            updatedTask.completedAt = undefined;
          }
          
          return updatedTask;
        }
        return task;
      }))
    }
    
    // Also remove from scheduled tasks if completed
    if (tasks.find(t => t.id === taskId)?.completed === false) {
      setScheduledTasks(scheduledTasks.filter(st => st.taskId !== taskId));
    }
  }

  // Update new scheduled task date when selected date changes
  useEffect(() => {
    setNewScheduledTask(prev => ({
      ...prev,
      date: selectedDate
    }))
  }, [selectedDate])

  // Generate week dates for calendar view
  const getWeekDates = () => {
    const start = startOfWeek(new Date(selectedDate), { weekStartsOn: 1 })
    return Array.from({ length: 7 }).map((_, i) => addDays(start, i))
  }

  const weekDates = getWeekDates()

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time Boxing
          </CardTitle>
          <CardDescription>
            Schedule your tasks in time blocks for better time management
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Calendar Navigation */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedDate(format(addDays(new Date(selectedDate), -7), "yyyy-MM-dd"))}
              >
                Previous Week
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedDate(format(new Date(), "yyyy-MM-dd"))}
              >
                Today
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedDate(format(addDays(new Date(selectedDate), 7), "yyyy-MM-dd"))}
              >
                Next Week
              </Button>
            </div>
            
            <div className="text-center">
              <h3 className="font-medium">
                {format(weekDates[0], "d. MMM", { locale: cs })} - {format(weekDates[6], "d. MMM yyyy", { locale: cs })}
              </h3>
            </div>
          </div>
          
          {/* Week View */}
          <div className="grid grid-cols-7 gap-1 mt-4">
            {DAYS.map((day, index) => {
              const date = weekDates[index]
              const isSelected = isSameDay(new Date(date), new Date(selectedDate))
              const isToday = isSameDay(date, new Date())
              
              return (
                <Button
                  key={day}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  className={`flex flex-col h-auto py-2 ${isToday ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setSelectedDate(format(date, "yyyy-MM-dd"))}
                >
                  <span className="text-xs">{day}</span>
                  <span className="text-sm font-medium">{format(date, "d")}</span>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unscheduled Tasks */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Circle className="h-5 w-5" />
              Unscheduled Tasks
            </CardTitle>
            <CardDescription>
              Tasks that are not yet scheduled for {format(new Date(selectedDate), "d. MMMM yyyy", { locale: cs })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {unscheduledTasks.length > 0 ? (
              unscheduledTasks.map(task => (
                <div 
                  key={task.id} 
                  className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <button 
                    onClick={() => toggleTaskCompletion(task.id)}
                    className="flex-shrink-0 mt-1 text-muted-foreground hover:text-primary"
                  >
                    <Circle className="h-5 w-5" />
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-medium ${task.priority >= 67 ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {task.title}
                      </p>
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
                        const cat = categories.find(c => c.name === category)
                        return (
                          <Badge 
                            key={idx} 
                            variant="outline" 
                            className="text-xs flex items-center gap-1"
                          >
                            {cat && <div className={`w-2 h-2 rounded-full ${cat.color}`}></div>}
                            {category}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Circle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>All tasks are scheduled for this day!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Schedule and Scheduling Form */}
        <div className="space-y-6">
          {/* Schedule Visualization */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5" />
                Schedule for {format(new Date(selectedDate), "d. MMMM yyyy", { locale: cs })}
              </CardTitle>
              <CardDescription>
                Time blocks for your scheduled tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              {scheduledTasksForDate.length > 0 ? (
                <div className="space-y-3">
                  {scheduledTasksForDate.map(({ id, taskId, startTime, endTime, task }) => (
                    <div 
                      key={id} 
                      className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30"
                    >
                      <div className="flex-shrink-0 text-center">
                        <div className="text-xs font-medium text-muted-foreground">
                          {startTime}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {endTime}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{task?.title}</p>
                          {task?.timeEstimate && (
                            <Badge variant="outline" className="text-xs flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {task.timeEstimate >= 60 
                                ? `${Math.floor(task.timeEstimate / 60)}h ${task.timeEstimate % 60}m` 
                                : `${task.timeEstimate}m`}
                            </Badge>
                          )}
                        </div>
                        
                        {task?.categories && (
                          <div className="flex flex-wrap items-center gap-1 mt-1">
                            {task.categories.map((category, idx) => {
                              const cat = categories.find(c => c.name === category)
                              return (
                                <Badge 
                                  key={idx} 
                                  variant="outline" 
                                  className="text-xs"
                                >
                                  {cat && <div className={`w-2 h-2 rounded-full ${cat.color} mr-1 inline-block`}></div>}
                                  {category}
                                </Badge>
                              )
                            })}
                          </div>
                        )}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeScheduledTask(id)}
                        className="flex-shrink-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No tasks scheduled for this day</p>
                  <p className="text-sm mt-1">Add tasks to your schedule below</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Schedule Task Form */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Plus className="h-5 w-5" />
                Schedule a Task
              </CardTitle>
              <CardDescription>
                Add tasks to your daily schedule
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="task-select">Task</Label>
                  <Select 
                    value={newScheduledTask.taskId} 
                    onValueChange={(value) => setNewScheduledTask({...newScheduledTask, taskId: value})}
                  >
                    <SelectTrigger id="task-select">
                      <SelectValue placeholder="Select a task" />
                    </SelectTrigger>
                    <SelectContent>
                      {unscheduledTasks.map(task => (
                        <SelectItem key={task.id} value={task.id}>
                          <div className="flex items-center gap-2">
                            <span className="truncate max-w-[150px]">{task.title}</span>
                            {task.timeEstimate && (
                              <Badge variant="outline" className="text-xs">
                                {task.timeEstimate}m
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Date</Label>
                  <div className="p-2 bg-muted rounded-md text-sm">
                    {format(new Date(selectedDate), "d. MMMM yyyy", { locale: cs })}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-time">Start Time</Label>
                  <Select 
                    value={newScheduledTask.startTime} 
                    onValueChange={(value) => setNewScheduledTask({...newScheduledTask, startTime: value})}
                  >
                    <SelectTrigger id="start-time">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map(time => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="end-time">End Time</Label>
                  <Select 
                    value={newScheduledTask.endTime} 
                    onValueChange={(value) => setNewScheduledTask({...newScheduledTask, endTime: value})}
                  >
                    <SelectTrigger id="end-time">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map(time => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button onClick={addScheduledTask} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add to Schedule
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}