"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Calendar, 
  CheckCircle, 
  Target, 
  TrendingUp, 
  Clock, 
  Plus 
} from "lucide-react"

export function UserDashboard() {
  const { user, token } = useAuth()
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    activeHabits: 0,
    categories: 0
  })
  const [recentTasks, setRecentTasks] = useState<any[]>([])
  const [upcomingTasks, setUpcomingTasks] = useState<any[]>([])

  useEffect(() => {
    if (user && token) {
      fetchDashboardData()
    }
  }, [user, token])

  const fetchDashboardData = useCallback(async () => {
    if (!token) return; // Early return if no token
    
    try {
      // Fetch tasks
      const tasksResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })
      
      if (tasksResponse.ok) {
        const tasks = await tasksResponse.json()
        setStats(prev => ({
          ...prev,
          totalTasks: tasks.length,
          completedTasks: tasks.filter((task: any) => task.completed).length
        }))
        setRecentTasks(tasks.slice(0, 5)) // Show 5 most recent tasks
        
        // Filter upcoming tasks (not completed and with due dates)
        const upcoming = tasks
          .filter((task: any) => !task.completed && task.due_date)
          .sort((a: any, b: any) => 
            new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
          )
          .slice(0, 5)
        setUpcomingTasks(upcoming)
      }
      
      // Fetch habits
      const habitsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/habits`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })
      
      if (habitsResponse.ok) {
        const habits = await habitsResponse.json()
        setStats(prev => ({
          ...prev,
          activeHabits: habits.filter((habit: any) => habit.completed_today).length
        }))
      }
      
      // Fetch categories
      const categoriesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })
      
      if (categoriesResponse.ok) {
        const categories = await categoriesResponse.json()
        setStats(prev => ({
          ...prev,
          categories: categories.length
        }))
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    }
  }, [token])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  if (!user) {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user.username}!</h1>
        <p className="text-muted-foreground">Here's what's happening with your productivity today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedTasks} completed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Habits</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeHabits}</div>
            <p className="text-xs text-muted-foreground">
              completed today
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.categories}</div>
            <p className="text-xs text-muted-foreground">
              organized
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productivity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalTasks > 0 
                ? `${Math.round((stats.completedTasks / stats.totalTasks) * 100)}%` 
                : '0%'}
            </div>
            <p className="text-xs text-muted-foreground">
              task completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Recent Tasks
            </CardTitle>
            <CardDescription>
              Your most recently created tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentTasks.length > 0 ? (
              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${task.completed ? 'bg-green-500' : 'bg-muted'}`}></div>
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Created {formatDate(task.created_at)}
                        </p>
                      </div>
                    </div>
                    <Badge variant={task.completed ? "default" : "secondary"}>
                      {task.completed ? "Completed" : "Pending"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="mx-auto h-12 w-12 opacity-50 mb-2" />
                <p>No tasks yet</p>
                <p className="text-sm">Create your first task to get started</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Tasks
            </CardTitle>
            <CardDescription>
              Tasks with upcoming deadlines
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingTasks.length > 0 ? (
              <div className="space-y-3">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Due {formatDate(task.due_date)}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {Math.ceil((new Date(task.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="mx-auto h-12 w-12 opacity-50 mb-2" />
                <p>No upcoming tasks</p>
                <p className="text-sm">All tasks are up to date</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}