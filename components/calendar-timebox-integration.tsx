"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Plus, 
  X, 
  Edit3,
  Play,
  Pause,
  CheckCircle2
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { storage } from "@/lib/storage";

interface ScheduledTask {
  id: string;
  taskTitle: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  duration: number; // minutes
  completed: boolean;
  category?: string;
  priority?: number;
  description?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  isActive?: boolean;
}

interface CalendarTimeBoxIntegrationProps {
  currentDate: string;
  onTaskSchedule: (task: Omit<ScheduledTask, 'id'>) => void;
  scheduledTasks: ScheduledTask[];
  onUpdateTask: (taskId: string, updates: Partial<ScheduledTask>) => void;
}

export function CalendarTimeBoxIntegration({
  currentDate,
  onTaskSchedule,
  scheduledTasks,
  onUpdateTask
}: CalendarTimeBoxIntegrationProps) {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingTask, setEditingTask] = useState<ScheduledTask | null>(null);
  
  // Form state
  const [taskTitle, setTaskTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [duration, setDuration] = useState(30);
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState(3);
  const [description, setDescription] = useState("");

  const todayTasks = scheduledTasks.filter(task => task.date === currentDate);

  const calculateEndTime = (start: string, dur: number) => {
    if (!start) return "";
    const [hours, minutes] = start.split(":").map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    const endDate = new Date(startDate.getTime() + dur * 60000);
    return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
  };

  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return 0;
    const [startHours, startMinutes] = start.split(":").map(Number);
    const [endHours, endMinutes] = end.split(":").map(Number);
    
    const startDate = new Date();
    startDate.setHours(startHours, startMinutes, 0, 0);
    
    const endDate = new Date();
    endDate.setHours(endHours, endMinutes, 0, 0);
    
    return Math.max(0, (endDate.getTime() - startDate.getTime()) / 60000);
  };

  const handleSubmit = () => {
    if (!taskTitle.trim() || !startTime || !endTime) return;

    const newTask: Omit<ScheduledTask, 'id'> = {
      taskTitle: taskTitle.trim(),
      date: currentDate,
      startTime,
      endTime,
      duration,
      completed: false,
      category: category || undefined,
      priority,
      description: description.trim() || undefined
    };

    if (editingTask) {
      onUpdateTask(editingTask.id, newTask);
    } else {
      onTaskSchedule(newTask);
    }

    // Reset form
    setTaskTitle("");
    setStartTime("");
    setEndTime("");
    setDuration(30);
    setCategory("");
    setPriority(3);
    setDescription("");
    setEditingTask(null);
    setShowScheduleModal(false);
  };

  const handleEditTask = (task: ScheduledTask) => {
    setEditingTask(task);
    setTaskTitle(task.taskTitle);
    setStartTime(task.startTime);
    setEndTime(task.endTime);
    setDuration(task.duration);
    setCategory(task.category || "");
    setPriority(task.priority || 3);
    setDescription(task.description || "");
    setShowScheduleModal(true);
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return "bg-red-100 text-red-800 border-red-200";
      case 2: return "bg-orange-100 text-orange-800 border-orange-200";
      case 3: return "bg-blue-100 text-blue-800 border-blue-200";
      case 4: return "bg-purple-100 text-purple-800 border-purple-200";
      case 5: return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getTimeBlockPosition = (startTime: string) => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes;
    const dayStart = 6 * 60; // 6 AM
    const dayEnd = 22 * 60; // 10 PM
    const dayDuration = dayEnd - dayStart;
    
    if (totalMinutes < dayStart || totalMinutes > dayEnd) return { top: 0, height: 0 };
    
    const position = ((totalMinutes - dayStart) / dayDuration) * 100;
    const taskHeight = Math.min(20, (duration / dayDuration) * 100);
    
    return { top: position, height: Math.max(5, taskHeight) };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Time-boxed Tasks ({todayTasks.length})
        </h3>
        <Button 
          size="sm" 
          onClick={() => setShowScheduleModal(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Schedule
        </Button>
      </div>

      {/* Timeline visualization */}
      <div className="relative h-64 border rounded-lg bg-gradient-to-b from-gray-50 to-gray-100 p-2">
        <div className="absolute inset-0 flex flex-col">
          {[6, 8, 10, 12, 14, 16, 18, 20, 22].map(hour => (
            <div 
              key={hour} 
              className="flex-1 border-t border-gray-200 relative"
            >
              <span className="absolute -top-2 left-1 text-xs text-gray-500 bg-white px-1">
                {hour}:00
              </span>
            </div>
          ))}
        </div>

        {/* Scheduled tasks on timeline */}
        {todayTasks.map(task => {
          const position = getTimeBlockPosition(task.startTime);
          if (position.height === 0) return null;
          
          return (
            <div
              key={task.id}
              className={`absolute left-16 right-2 rounded px-2 py-1 text-xs cursor-pointer transition-all hover:shadow-md ${
                task.completed 
                  ? 'bg-green-100 text-green-800' 
                  : task.isActive 
                    ? 'bg-yellow-100 text-yellow-800 ring-2 ring-yellow-300'
                    : 'bg-white text-gray-800 shadow'
              }`}
              style={{
                top: `${position.top}%`,
                height: `${position.height}%`,
                minHeight: '20px'
              }}
              onClick={() => handleEditTask(task)}
              title={`${task.taskTitle} • ${task.startTime}-${task.endTime}`}
            >
              <div className="font-medium truncate">{task.taskTitle}</div>
              <div className="text-xs opacity-75">{task.startTime}-{task.endTime}</div>
              {task.category && (
                <Badge 
                  variant="secondary" 
                  className="mt-1 text-xs"
                  style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}
                >
                  {task.category}
                </Badge>
              )}
            </div>
          );
        })}
      </div>

      {/* Task list view */}
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {todayTasks.map(task => (
          <div 
            key={task.id}
            className={`p-3 rounded-lg border flex items-center justify-between ${
              task.completed 
                ? 'bg-green-50 border-green-200' 
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(task.priority || 3)}`}>
                  P{task.priority}
                </span>
                <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                  {task.taskTitle}
                </h4>
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {task.startTime} - {task.endTime}
                </span>
                {task.category && (
                  <Badge variant="outline" className="text-xs">
                    {task.category}
                  </Badge>
                )}
              </div>
              {task.description && (
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {task.description}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {!task.completed && !task.isActive && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => onUpdateTask(task.id, { 
                    isActive: true, 
                    actualStartTime: new Date().toTimeString().slice(0, 5) 
                  })}
                >
                  <Play className="h-3 w-3" />
                </Button>
              )}
              
              {task.isActive && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0 text-yellow-600"
                  onClick={() => onUpdateTask(task.id, { 
                    isActive: false, 
                    actualEndTime: new Date().toTimeString().slice(0, 5),
                    completed: true
                  })}
                >
                  <CheckCircle2 className="h-3 w-3" />
                </Button>
              )}
              
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => handleEditTask(task)}
              >
                <Edit3 className="h-3 w-3" />
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-red-500"
                onClick={() => onUpdateTask(task.id, { completed: !task.completed })}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
        
        {todayTasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No scheduled tasks for today</p>
            <p className="text-sm">Click "Schedule" to add time-boxed tasks</p>
          </div>
        )}
      </div>

      {/* Schedule/Edit Modal */}
      <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTask ? "Edit Scheduled Task" : "Schedule New Task"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">Task Title *</Label>
              <Input
                id="task-title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Enter task title"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="start-time">Start Time *</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    if (e.target.value && duration) {
                      setEndTime(calculateEndTime(e.target.value, duration));
                    }
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (min) *</Label>
                <Input
                  id="duration"
                  type="number"
                  min="15"
                  step="15"
                  value={duration}
                  onChange={(e) => {
                    const dur = parseInt(e.target.value) || 30;
                    setDuration(dur);
                    if (startTime) {
                      setEndTime(calculateEndTime(startTime, dur));
                    }
                  }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end-time">End Time</Label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                readOnly
                className="bg-muted"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Work, Personal, etc."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(parseInt(e.target.value))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value={1}>1 - Urgent</option>
                  <option value={2}>2 - High</option>
                  <option value={3}>3 - Medium</option>
                  <option value={4}>4 - Low</option>
                  <option value={5}>5 - Lowest</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Task details..."
                rows={3}
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleSubmit}
                disabled={!taskTitle.trim() || !startTime || !endTime}
                className="flex-1"
              >
                {editingTask ? "Update Task" : "Schedule Task"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowScheduleModal(false);
                  setEditingTask(null);
                  // Reset form
                  setTaskTitle("");
                  setStartTime("");
                  setEndTime("");
                  setDuration(30);
                  setCategory("");
                  setPriority(3);
                  setDescription("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}