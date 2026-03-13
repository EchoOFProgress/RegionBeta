"use client"

import { useState, useMemo } from "react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
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
  Cell
} from "recharts"
import { 
  Calendar, 
  TrendingUp, 
  Activity, 
  Target, 
  CheckCircle, 
  Circle,
  Clock,
  FileText
} from "lucide-react"

interface Task {
  id: string
  title: string
  priority: number
  completed: boolean
  type: "boolean" | "numeric"
  numericValue?: number
  numericCondition?: "at-least" | "less-than" | "exactly"
  numericTarget?: number
  description?: string
  dueDate?: string
  categories?: string[]
  timeEstimate?: number
  createdAt?: string
  completedAt?: string
}

interface TaskAnalyticsData {
  summary: {
    creationDate: string
    dueDate?: string
    completionDate?: string
    completionTime: string
    deadlineAdherence: "met" | "missed" | "pending"
  }
  postponementStats: {
    deadlineChanges: number
    postponements: number
    daysPastDeadline: number
  }
  subtaskStats?: {
    total: number
    completed: number
    pending: number
    progress: number
  }
  timeTrackingStats?: {
    totalTime: number
    sessions: number
    averageSession: number
    longestSession: number
  }
  activityStats: {
    notes: number
    lastUpdated: string
    attachments: number
  }
}

export function TaskAnalyticsModal({ task }: { task: Task }) {
  // Calculate real analytics data based on the actual task data
  const analyticsData = useMemo<TaskAnalyticsData>(() => {
    // Calculate completion time
    let completionTime = ""
    let deadlineAdherence: "met" | "missed" | "pending" = "pending"
    
    if (task.completed && task.createdAt && task.completedAt) {
      const created = new Date(task.createdAt)
      const completed = new Date(task.completedAt)
      const diffTime = Math.abs(completed.getTime() - created.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      completionTime = `${diffDays} days`
      
      if (task.dueDate) {
        const due = new Date(task.dueDate)
        if (completed <= due) {
          deadlineAdherence = "met"
        } else {
          deadlineAdherence = "missed"
        }
      }
    } else if (task.dueDate) {
      const due = new Date(task.dueDate)
      const now = new Date()
      if (now > due) {
        deadlineAdherence = "missed"
      }
    }
    
    // For now, we'll use placeholder values for statistics that would typically come from tracking data
    // In a real implementation, these would come from actual user interaction data
    return {
      summary: {
        creationDate: task.createdAt || new Date().toISOString(),
        dueDate: task.dueDate,
        completionDate: task.completedAt,
        completionTime,
        deadlineAdherence
      },
      postponementStats: {
        deadlineChanges: 0, // Would come from actual tracking
        postponements: 0, // Would come from actual tracking
        daysPastDeadline: task.completed && task.dueDate ? 
          (() => {
            if (task.completedAt && task.dueDate) {
              const completed = new Date(task.completedAt);
              const due = new Date(task.dueDate);
              const diffTime = completed.getTime() - due.getTime();
              return diffTime > 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0;
            }
            return 0;
          })() : 0
      },
      subtaskStats: task.type === "boolean" ? undefined : {
        total: task.numericTarget || 0,
        completed: task.numericValue || 0,
        pending: Math.max(0, (task.numericTarget || 0) - (task.numericValue || 0)),
        progress: task.numericTarget ? 
          Math.round(((task.numericValue || 0) / task.numericTarget) * 100) : 0
      },
      timeTrackingStats: task.timeEstimate ? {
        totalTime: task.timeEstimate,
        sessions: 1, // Would come from actual tracking
        averageSession: task.timeEstimate, // Would come from actual tracking
        longestSession: task.timeEstimate // Would come from actual tracking
      } : undefined,
      activityStats: {
        notes: 0, // Would come from actual tracking
        lastUpdated: task.completedAt || task.createdAt || new Date().toISOString(),
        attachments: 0 // Would come from actual tracking
      }
    }
  }, [task])
  
  return (
    <div className="h-full flex flex-col">
      {/* Header with consistent styling */}
      <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 p-6 rounded-t-lg border-b">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{task.title}</h2>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Task Analytics
          </p>
        </div>
      </div>
      
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Quick Summary */}
        <Card className="mb-6 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-primary" />
              Quick Summary
            </CardTitle>
            <CardDescription>Essential task metrics</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <p className="text-sm text-muted-foreground">Completion Time</p>
              <p className="text-2xl font-bold text-foreground">
                {analyticsData.summary.completionTime || "Not completed"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                From creation to completion
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <p className="text-sm text-muted-foreground">Deadline Adherence</p>
              <p className="text-2xl font-bold">
                {analyticsData.summary.deadlineAdherence === "met" && (
                  <span className="text-green-600">Met</span>
                )}
                {analyticsData.summary.deadlineAdherence === "missed" && (
                  <span className="text-red-600">Missed</span>
                )}
                {analyticsData.summary.deadlineAdherence === "pending" && (
                  <span className="text-yellow-600">Pending</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Compared to due date
              </p>
            </div>
            {analyticsData.subtaskStats && (
              <div className="p-4 rounded-lg border bg-card">
                <p className="text-sm text-muted-foreground">Subtask Progress</p>
                <p className="text-2xl font-bold text-foreground">
                  {analyticsData.subtaskStats.progress}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {analyticsData.subtaskStats.completed} of {analyticsData.subtaskStats.total}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Postponement Statistics */}
        <Card className="mb-6 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              Postponement Statistics
            </CardTitle>
            <CardDescription>Task adjustment and delay metrics</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <p className="text-sm text-muted-foreground">Deadline Changes</p>
              <p className="text-2xl font-bold text-foreground">{analyticsData.postponementStats.deadlineChanges}</p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <p className="text-sm text-muted-foreground">Postponements</p>
              <p className="text-2xl font-bold text-foreground">{analyticsData.postponementStats.postponements}</p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <p className="text-sm text-muted-foreground">Days Past Deadline</p>
              <p className="text-2xl font-bold text-foreground">{analyticsData.postponementStats.daysPastDeadline}</p>
            </div>
          </CardContent>
        </Card>
        
        {/* Subtasks (if applicable) */}
        {analyticsData.subtaskStats && (
          <Card className="mb-6 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-primary" />
                Subtask Progress
              </CardTitle>
              <CardDescription>Numeric task completion breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    {analyticsData.subtaskStats.completed} completed
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {analyticsData.subtaskStats.pending} pending
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-4">
                  <div 
                    className="bg-primary h-4 rounded-full" 
                    style={{ width: `${analyticsData.subtaskStats.progress}%` }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 rounded-lg border bg-card">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-xl font-bold text-foreground">{analyticsData.subtaskStats.total}</p>
                  </div>
                  <div className="p-3 rounded-lg border bg-card">
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-xl font-bold text-foreground">{analyticsData.subtaskStats.completed}</p>
                  </div>
                  <div className="p-3 rounded-lg border bg-card">
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-xl font-bold text-foreground">{analyticsData.subtaskStats.pending}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Time Tracking (if applicable) */}
        {analyticsData.timeTrackingStats && (
          <Card className="mb-6 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-primary" />
                Time Tracking
              </CardTitle>
              <CardDescription>Work time distribution</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg border bg-card">
                <p className="text-sm text-muted-foreground">Total Time</p>
                <p className="text-xl font-bold text-foreground">
                  {analyticsData.timeTrackingStats.totalTime >= 60 
                    ? `${Math.floor(analyticsData.timeTrackingStats.totalTime / 60)}h ${analyticsData.timeTrackingStats.totalTime % 60}m` 
                    : `${analyticsData.timeTrackingStats.totalTime}m`}
                </p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <p className="text-sm text-muted-foreground">Sessions</p>
                <p className="text-xl font-bold text-foreground">{analyticsData.timeTrackingStats.sessions}</p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <p className="text-sm text-muted-foreground">Avg Session</p>
                <p className="text-xl font-bold text-foreground">
                  {analyticsData.timeTrackingStats.averageSession >= 60 
                    ? `${Math.floor(analyticsData.timeTrackingStats.averageSession / 60)}h ${analyticsData.timeTrackingStats.averageSession % 60}m` 
                    : `${analyticsData.timeTrackingStats.averageSession}m`}
                </p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <p className="text-sm text-muted-foreground">Longest Session</p>
                <p className="text-xl font-bold text-foreground">
                  {analyticsData.timeTrackingStats.longestSession >= 60 
                    ? `${Math.floor(analyticsData.timeTrackingStats.longestSession / 60)}h ${analyticsData.timeTrackingStats.longestSession % 60}m` 
                    : `${analyticsData.timeTrackingStats.longestSession}m`}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Activity Log */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-primary" />
              Activity Log
            </CardTitle>
            <CardDescription>Task engagement metrics</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <p className="text-sm text-muted-foreground">Notes</p>
              <p className="text-xl font-bold text-foreground">{analyticsData.activityStats.notes}</p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <p className="text-sm text-muted-foreground">Attachments</p>
              <p className="text-xl font-bold text-foreground">{analyticsData.activityStats.attachments}</p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="text-sm font-bold text-foreground">
                {new Date(analyticsData.activityStats.lastUpdated).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}