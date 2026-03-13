"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { 
  Settings as SettingsIcon, 
  Palette, 
  Sparkles, 
  Download, 
  Upload, 
  ChevronRight, 
  ChevronDown,
  Calendar
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getPriorityColor, shouldGlow, updatePrioritySettings, getAllPrioritySettings, updatePrioritySettingById, addPrioritySetting, deletePrioritySettingById } from "@/lib/priority-colors"
import { useUI } from "@/lib/ui-context"
import { UserProfile } from "@/components/user-profile"

type PriorityColorSetting = {
  id: string
  name: string
  enabled: boolean
  color: string
  priorityRange: {
    min: number
    max: number
  }
  modules: {
    tasks: boolean
    habits: boolean
    challenges: boolean
    goals: boolean
  }
  useCategories: boolean
  selectedCategories: string[]
  glow: boolean
  glowRange: {
    min: number
    max: number
  }
  priority: number // Added priority field
}

export function SettingsDialog() {
  const [open, setOpen] = useState(false)
  const [uiSettingsOpen, setUiSettingsOpen] = useState(false)
  const [styleSettingsOpen, setStyleSettingsOpen] = useState(false) // Add state for style settings
  const [priorityColorSettings, setPriorityColorSettings] = useState(getAllPrioritySettings())
  const [newSettingName, setNewSettingName] = useState("")
  const { toast } = useToast()
  const { uiSettings, updateUISettings } = useUI()

  // Function to load theme CSS dynamically
  const loadThemeCSS = (theme: string) => {
    // Remove any existing theme stylesheets
    const existingLink = document.getElementById('theme-css');
    if (existingLink) {
      existingLink.remove();
    }

    // Load the appropriate CSS file based on theme
    if (theme === 'retro-dark') {
      const link = document.createElement('link');
      link.id = 'theme-css';
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = '/styles/retro-dark.css';
      document.head.appendChild(link);
    }
  };

  // Update theme when settings change
  useEffect(() => {
    // Apply theme class to body
    document.body.className = `theme-${uiSettings.theme}`;
    
    // Load theme-specific CSS
    loadThemeCSS(uiSettings.theme);
  }, [uiSettings.theme]);

  const addPriorityColorSetting = () => {
    if (!newSettingName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for the setting",
        variant: "destructive",
      })
      return
    }

    const newSetting = {
      id: Date.now().toString(),
      name: newSettingName,
      enabled: true,
      color: "#3b82f6", // default blue
      priorityRange: {
        min: 1,
        max: 100
      },
      modules: {
        tasks: true,
        habits: true,
        challenges: true,
        goals: true
      },
      useCategories: false,
      selectedCategories: [],
      glow: false,
      glowRange: {
        min: 1,
        max: 100
      },
      priority: Date.now() // Use timestamp as priority to ensure newer settings have higher priority
    }

    addPrioritySetting(newSetting)
    setPriorityColorSettings(getAllPrioritySettings())
    // Update the global priority settings
    updatePrioritySettings(getAllPrioritySettings())
    setNewSettingName("")
    toast({
      title: "Setting Added!",
      description: "New priority color setting created",
    })
  }

  const updatePriorityColorSetting = (id: string, updates: Partial<typeof priorityColorSettings[0]>) => {
    updatePrioritySettingById(id, updates)
    setPriorityColorSettings(getAllPrioritySettings())
    // Update the global priority settings
    updatePrioritySettings(getAllPrioritySettings())
  }

  const deletePriorityColorSetting = (id: string) => {
    deletePrioritySettingById(id)
    setPriorityColorSettings(getAllPrioritySettings())
    // Update the global priority settings
    updatePrioritySettings(getAllPrioritySettings())
    toast({
      title: "Setting Deleted",
      description: "Priority color setting removed",
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <SettingsIcon className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* User Profile */}
          <UserProfile />
          
          <hr className="border-border" />
          {/* Style Settings Section */}
          <div className="space-y-4">
            <div 
              className="flex items-center justify-between cursor-pointer p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
              onClick={() => setStyleSettingsOpen(!styleSettingsOpen)}
            >
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Style Settings
              </h3>
              {styleSettingsOpen ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </div>

            {styleSettingsOpen && (
              <div className="pl-7 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      uiSettings.theme === 'default' 
                        ? 'border-primary ring-2 ring-primary/20' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => updateUISettings({ theme: 'default' })}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                      <span className="font-medium">Default</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Classic light theme</p>
                  </div>
                  
                  <div 
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      uiSettings.theme === 'retro-dark' 
                        ? 'border-primary ring-2 ring-primary/20' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => updateUISettings({ theme: 'retro-dark' })}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                      <span className="font-medium">Retro Dark</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Classic dark theme with retro styling</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* UI Settings Section */}
          <div className="space-y-4">
            <div 
              className="flex items-center justify-between cursor-pointer p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
              onClick={() => setUiSettingsOpen(!uiSettingsOpen)}
            >
              <h3 className="text-lg font-medium flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                UI Settings
              </h3>
              {uiSettingsOpen ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </div>

            {uiSettingsOpen && (
              <div className="pl-7 space-y-4 max-h-96 overflow-y-auto pr-2">
                
                {/* Overdue Task Settings */}
                <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/50">
                  <h4 className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Overdue Task Settings
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="highlight-overdue"
                        checked={uiSettings.highlightOverdueTasks}
                        onCheckedChange={(checked) => 
                          updateUISettings({ highlightOverdueTasks: checked as boolean })
                        }
                      />
                      <Label htmlFor="highlight-overdue">Highlight overdue tasks</Label>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Overdue Task Color</Label>
                      <Input
                        type="color"
                        value={uiSettings.overdueTaskColor}
                        onChange={(e) => 
                          updateUISettings({ overdueTaskColor: e.target.value })
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Color used to highlight overdue tasks
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sticky top-0 bg-background pt-4 pb-2 z-10">
                  <h4 className="font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Priority Color Settings
                  </h4>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={addPriorityColorSetting}
                  >
                    Add New
                  </Button>
                </div>

                <div className="space-y-4">
                  {priorityColorSettings.map((setting) => (
                    <div key={setting.id} className="p-4 rounded-lg border border-border bg-muted/50 space-y-4">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium">{setting.name}</h5>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deletePriorityColorSetting(setting.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id={`enabled-${setting.id}`}
                              checked={setting.enabled}
                              onCheckedChange={(checked) => 
                                updatePriorityColorSetting(setting.id, { enabled: checked as boolean })
                              }
                            />
                            <Label htmlFor={`enabled-${setting.id}`}>Enabled</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id={`glow-${setting.id}`}
                              checked={setting.glow}
                              onCheckedChange={(checked) => 
                                updatePriorityColorSetting(setting.id, { glow: checked as boolean })
                              }
                            />
                            <Label htmlFor={`glow-${setting.id}`}>Glow Effect</Label>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Setting Priority</Label>
                            <Input
                              type="number"
                              min="1"
                              value={setting.priority}
                              onChange={(e) => 
                                updatePriorityColorSetting(setting.id, { 
                                  priority: Math.max(1, Number(e.target.value)) 
                                })
                              }
                              placeholder="Priority"
                            />
                            <p className="text-xs text-muted-foreground">
                              Higher values take precedence when ranges overlap
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Color</Label>
                          <Input
                            type="color"
                            value={setting.color}
                            onChange={(e) => 
                              updatePriorityColorSetting(setting.id, { color: e.target.value })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Priority Range</Label>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              min="1"
                              max="100"
                              value={setting.priorityRange.min}
                              onChange={(e) => 
                                updatePriorityColorSetting(setting.id, { 
                                  priorityRange: { 
                                    ...setting.priorityRange, 
                                    min: Math.max(1, Math.min(100, Number(e.target.value))) 
                                  } 
                                })
                              }
                              placeholder="Min"
                            />
                            <Input
                              type="number"
                              min="1"
                              max="100"
                              value={setting.priorityRange.max}
                              onChange={(e) => 
                                updatePriorityColorSetting(setting.id, { 
                                  priorityRange: { 
                                    ...setting.priorityRange, 
                                    max: Math.max(1, Math.min(100, Number(e.target.value))) 
                                  } 
                                })
                              }
                              placeholder="Max"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Glow Range</Label>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              min="1"
                              max="100"
                              value={setting.glowRange.min}
                              onChange={(e) => 
                                updatePriorityColorSetting(setting.id, { 
                                  glowRange: { 
                                    ...setting.glowRange, 
                                    min: Math.max(1, Math.min(100, Number(e.target.value))) 
                                  } 
                                })
                              }
                              placeholder="Min"
                            />
                            <Input
                              type="number"
                              min="1"
                              max="100"
                              value={setting.glowRange.max}
                              onChange={(e) => 
                                updatePriorityColorSetting(setting.id, { 
                                  glowRange: { 
                                    ...setting.glowRange, 
                                    max: Math.max(1, Math.min(100, Number(e.target.value))) 
                                  } 
                                })
                              }
                              placeholder="Max"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Apply to Modules</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id={`tasks-${setting.id}`}
                              checked={setting.modules.tasks}
                              onCheckedChange={(checked) => 
                                updatePriorityColorSetting(setting.id, { 
                                  modules: { ...setting.modules, tasks: checked as boolean } 
                                })
                              }
                            />
                            <Label htmlFor={`tasks-${setting.id}`}>Tasks</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id={`habits-${setting.id}`}
                              checked={setting.modules.habits}
                              onCheckedChange={(checked) => 
                                updatePriorityColorSetting(setting.id, { 
                                  modules: { ...setting.modules, habits: checked as boolean } 
                                })
                              }
                            />
                            <Label htmlFor={`habits-${setting.id}`}>Habits</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id={`challenges-${setting.id}`}
                              checked={setting.modules.challenges}
                              onCheckedChange={(checked) => 
                                updatePriorityColorSetting(setting.id, { 
                                  modules: { ...setting.modules, challenges: checked as boolean } 
                                })
                              }
                            />
                            <Label htmlFor={`challenges-${setting.id}`}>Challenges</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id={`goals-${setting.id}`}
                              checked={setting.modules.goals}
                              onCheckedChange={(checked) => 
                                updatePriorityColorSetting(setting.id, { 
                                  modules: { ...setting.modules, goals: checked as boolean } 
                                })
                              }
                            />
                            <Label htmlFor={`goals-${setting.id}`}>Goals</Label>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id={`use-categories-${setting.id}`}
                            checked={setting.useCategories}
                            onCheckedChange={(checked) => 
                              updatePriorityColorSetting(setting.id, { useCategories: checked as boolean })
                            }
                          />
                          <Label htmlFor={`use-categories-${setting.id}`}>Use Categories</Label>
                        </div>

                        {setting.useCategories && (
                          <div className="space-y-2 pl-6">
                            <Label>Selected Categories</Label>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline">Work</Badge>
                              <Badge variant="outline">Personal</Badge>
                              <Badge variant="outline">Health</Badge>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-2">
                    <Input
                      placeholder="New setting name"
                      value={newSettingName}
                      onChange={(e) => setNewSettingName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addPriorityColorSetting()}
                    />
                    <Button onClick={addPriorityColorSetting}>Add</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}