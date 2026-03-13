"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  ShoppingCart, 
  Plus, 
  Play, 
  Info,
  Clock,
  Brain,
  Zap,
  Target,
  BookOpen,
  Calendar,
  BarChart3
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type AvailableModule = {
  id: string
  name: string
  description: string
  longDescription: string
  icon: React.ReactNode
  category: string[]
  videoUrl?: string
  isAdded: boolean
}

interface ShopModuleProps {
  toggleModuleInNavbar?: (moduleId: string) => void
  addedModules?: string[]
}

export function ShopModule({ toggleModuleInNavbar, addedModules = [] }: ShopModuleProps) {
  const [modules, setModules] = useState<AvailableModule[]>([
    {
      id: "lego-time-tracker",
      name: "Lego Bricks Time Management",
      description: "Time management technique inspired by Mohnish Pabrai's cloning mental model",
      longDescription: "Based on the mental model of cloning from successful entrepreneurs like Bill Gates and Sam Walton. This time management technique helps you allocate your time effectively by visualizing your week as Lego blocks. Just as successful entrepreneurs clone proven business models, you can clone proven time management strategies to build your ideal schedule. The concept comes from the idea that starting a business doesn't have to involve creating something entirely new - often the best approach is to clone a proven model and make it better.",
      icon: <Clock className="h-5 w-5" />,
      category: ["Productivity", "Time Management"],
      videoUrl: "https://youtu.be/qgeQ5kMVwRA?si=E2n8A8eROew5yhFc",
      isAdded: addedModules.includes("lego-time-tracker")
    },
    {
      id: "time-boxing",
      name: "Time Boxing Scheduler",
      description: "Visualize and schedule your tasks in time blocks for better time management",
      longDescription: "Time boxing is a time management technique where you allocate specific time blocks for your tasks. This module allows you to visualize your unscheduled tasks and assign them to specific time slots in your day. You can see all your tasks for a given day in a timeline view, helping you better manage your time and avoid overcommitting.",
      icon: <Calendar className="h-5 w-5" />,
      category: ["Productivity", "Time Management", "Planning"],
      isAdded: addedModules.includes("time-boxing")
    },
    {
      id: "harada-method",
      name: "Harada Method Goal Setting",
      description: "Japanese method for achieving personal goals through systematic planning",
      longDescription: "The Harada Method is a Japanese technique for achieving personal goals by breaking them down into manageable steps. It involves setting a long-term goal, conducting a self-assessment, creating a 64-chart action plan, establishing daily routines, and keeping a daily journal. This method helps you systematically work toward your goals while developing self-reliance and discipline. Integrates seamlessly with tasks and goals across all modules.",
      icon: <Target className="h-5 w-5" />,
      category: ["Goal Setting", "Productivity", "Planning"],
      isAdded: addedModules.includes("harada-method")
    }
  ])

  const [selectedModule, setSelectedModule] = useState<AvailableModule | null>(null)

  const toggleModule = (id: string) => {
    // Update local state
    setModules(modules.map(module => 
      module.id === id ? { ...module, isAdded: !module.isAdded } : module
    ))
    
    // Notify parent component
    if (toggleModuleInNavbar) {
      toggleModuleInNavbar(id)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Productivity": "bg-blue-500",
      "Time Management": "bg-cyan-500",
      "Focus": "bg-purple-500",
      "Creativity": "bg-pink-500",
      "Planning": "bg-orange-500",
      "Health": "bg-green-500",
      "Learning": "bg-yellow-500",
      "Habits": "bg-indigo-500",
      "Organization": "bg-teal-500",
      "Analytics": "bg-red-500",
      "Insights": "bg-rose-500"
    }
    return colors[category] || "bg-gray-500"
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Module Shop
          </CardTitle>
          <CardDescription>
            Browse and add modules to enhance your productivity experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Add modules to your navigation bar to access them directly. Each module provides specialized tools for different aspects of productivity.
          </p>
        </CardContent>
      </Card>

      <ScrollArea className="h-[calc(100vh-220px)]">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <Card key={module.id} className="flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    {module.icon}
                  </div>
                  <CardTitle className="text-base font-semibold">{module.name}</CardTitle>
                </div>
                <Button
                  size="sm"
                  variant={module.isAdded ? "secondary" : "default"}
                  onClick={() => toggleModule(module.id)}
                >
                  {module.isAdded ? "Added" : <Plus className="h-4 w-4" />}
                </Button>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground mb-3">
                  {module.description}
                </p>
                
                {/* Show video directly for Lego Bricks Time Management module */}
                {module.id === "lego-time-tracker" && module.videoUrl && (
                  <div className="mb-3">
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                      <iframe
                        src="https://www.youtube.com/embed/qgeQ5kMVwRA"
                        title="Lego Bricks Time Management Tutorial"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      ></iframe>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 text-center">
                      Lego Bricks Time Management Tutorial
                    </p>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {module.category.map((cat) => (
                    <Badge 
                      key={cat} 
                      className={`${getCategoryColor(cat)} text-white`}
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
                <div className="flex justify-between items-center">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                      >
                        <Info className="h-4 w-4 mr-1" />
                        Learn More
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-primary/10">
                            {module.icon}
                          </div>
                          {module.name}
                        </DialogTitle>
                        <DialogDescription>
                          {module.longDescription}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Categories:</h4>
                          <div className="flex flex-wrap gap-2">
                            {module.category.map((cat) => (
                              <Badge 
                                key={cat} 
                                className={`${getCategoryColor(cat)} text-white`}
                              >
                                {cat}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        {module.videoUrl && (
                          <div>
                            <h4 className="font-medium mb-2">Video Explanation:</h4>
                            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                              <iframe
                                src="https://www.youtube.com/embed/qgeQ5kMVwRA"
                                title="Lego Bricks Time Management Tutorial"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full"
                              ></iframe>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                              This module is based on the mental model of cloning from successful entrepreneurs. 
                              Just as Bill Gates and Sam Walton cloned proven business models, you can clone 
                              proven time management strategies to build your ideal schedule.
                            </p>
                          </div>
                        )}
                        
                        <div className="flex justify-end pt-4">
                          <Button onClick={() => toggleModule(module.id)}>
                            {module.isAdded ? (
                              <>
                                <span>Remove from Navbar</span>
                              </>
                            ) : (
                              <>
                                <Plus className="h-4 w-4 mr-2" />
                                <span>Add to Navbar</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}