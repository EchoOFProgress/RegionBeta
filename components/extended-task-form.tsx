"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CalendarIcon, BellIcon, FileText, Flag, CalendarDays, Tags, Plus, Target, Zap } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useCategories } from "@/lib/category-context"
import { getUserPreferences, saveUserPreferences } from "@/lib/user-preferences"

interface ExtendedTaskFormProps {
  onSubmit: (task: {
    title: string
    description: string
    priority: number
    categories: string[]
    dueDate?: Date
    reminderEnabled: boolean
    reminderTime?: Date
    timeEstimate?: number // Add time estimate to props
    energyLevel?: number; // Add energy level to props
    linkedGoalId?: string // Add linked goal ID to props
    dependencies?: string[]; // Add dependencies to props
    timeBlockStart?: string; // Add time block start to props
    timeBlockEnd?: string; // Add time block end to props
    timeBlockDate?: string; // Add time block date to props
    isRecurring?: boolean; // Add recurring to props
    recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'yearly'; // Add recurrence pattern to props
    recurrenceEndDate?: string; // Add recurrence end date to props
    recurrenceInterval?: number; // Add recurrence interval to props
    tags?: string[]; // Add tags to props
  }) => void
  onCancel: () => void
  goals?: { id: string; title: string }[] // Add goals prop for selection
  tasks?: { id: string; title: string }[] // Add tasks prop for dependencies
}

export function ExtendedTaskForm({ onSubmit, onCancel, goals = [], tasks = [], addedModules = [] }: ExtendedTaskFormProps & { addedModules?: string[] }) {
  const { categories, addCategory } = useCategories()
  const [title, setTitle] = useState("")
  const [showDescription, setShowDescription] = useState(false)
  const [description, setDescription] = useState("")
  const [showPriority, setShowPriority] = useState(false)
  const [priority, setPriority] = useState(50)
  const [showCategories, setShowCategories] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState("")
  const [newCategoryName, setNewCategoryName] = useState("")
  const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false)
  const [showDueDate, setShowDueDate] = useState(false)
  const [dueDate, setDueDate] = useState<Date | undefined>()
  const [showReminder, setShowReminder] = useState(false)
  const [reminderEnabled, setReminderEnabled] = useState(false)
  const [reminderTime, setReminderTime] = useState<Date | undefined>()
  const [showTimeEstimate, setShowTimeEstimate] = useState(false) // Add time estimate state
  const [timeEstimate, setTimeEstimate] = useState<number | undefined>(undefined) // Add time estimate value state
  const [showEnergyLevel, setShowEnergyLevel] = useState(false) // Add energy level state
  const [energyLevel, setEnergyLevel] = useState<number>(5) // Add energy level value state
  const [showLinkedGoal, setShowLinkedGoal] = useState(false) // Add linked goal state
  const [linkedGoalId, setLinkedGoalId] = useState<string | undefined>(undefined) // Add linked goal ID state
  const [showDependencies, setShowDependencies] = useState(false) // Add dependencies state
  const [selectedDependencies, setSelectedDependencies] = useState<string[]>([]) // Add selected dependencies state
  const [showTimeBlock, setShowTimeBlock] = useState(false) // Add time block state
  const [timeBlockStart, setTimeBlockStart] = useState<string>("") // Add time block start state
  const [timeBlockEnd, setTimeBlockEnd] = useState<string>("") // Add time block end state
  const [timeBlockDate, setTimeBlockDate] = useState<string>("") // Add time block date state
  const [showRecurrence, setShowRecurrence] = useState(false) // Add recurrence state
  const [isRecurring, setIsRecurring] = useState<boolean>(false) // Add recurring state
  const [recurrencePattern, setRecurrencePattern] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>("weekly") // Add recurrence pattern state
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<string>("") // Add recurrence end date state
  const [recurrenceInterval, setRecurrenceInterval] = useState<number>(1) // Add recurrence interval state
  
  // Tags state
  const [showTags, setShowTags] = useState(false) // Add tags state
  const [selectedTags, setSelectedTags] = useState<string[]>([]) // Add selected tags state
  const [selectedTag, setSelectedTag] = useState<string>("") // Add selected tag state
  const [newTagName, setNewTagName] = useState<string>("") // Add new tag name state
  const [showNewTagDialog, setShowNewTagDialog] = useState(false) // Add show new tag dialog state
  
  // Update preferences when checkboxes change
  useEffect(() => {
    const prefs = getUserPreferences();
    prefs.extendedTaskForm.showDescription = showDescription;
    saveUserPreferences(prefs);
  }, [showDescription]);
  
  useEffect(() => {
    const prefs = getUserPreferences();
    prefs.extendedTaskForm.showPriority = showPriority;
    saveUserPreferences(prefs);
  }, [showPriority]);
  
  useEffect(() => {
    const prefs = getUserPreferences();
    prefs.extendedTaskForm.showCategories = showCategories;
    saveUserPreferences(prefs);
  }, [showCategories]);
  
  useEffect(() => {
    const prefs = getUserPreferences();
    prefs.extendedTaskForm.showDueDate = showDueDate;
    saveUserPreferences(prefs);
  }, [showDueDate]);
  
  useEffect(() => {
    const prefs = getUserPreferences();
    prefs.extendedTaskForm.showReminder = showReminder;
    saveUserPreferences(prefs);
  }, [showReminder]);
  
  useEffect(() => {
    const prefs = getUserPreferences();
    prefs.extendedTaskForm.showTimeEstimate = showTimeEstimate;
    saveUserPreferences(prefs);
  }, [showTimeEstimate]);
  
  useEffect(() => {
    const prefs = getUserPreferences();
    prefs.extendedTaskForm.showLinkedGoal = showLinkedGoal;
    saveUserPreferences(prefs);
  }, [showLinkedGoal]);
  
  useEffect(() => {
    const prefs = getUserPreferences();
    prefs.extendedTaskForm.showEnergyLevel = showEnergyLevel;
    saveUserPreferences(prefs);
  }, [showEnergyLevel]);
  
  useEffect(() => {
    const prefs = getUserPreferences();
    prefs.extendedTaskForm.showDependencies = showDependencies;
    saveUserPreferences(prefs);
  }, [showDependencies]);
  
  useEffect(() => {
    const prefs = getUserPreferences();
    prefs.extendedTaskForm.showTimeBlock = showTimeBlock;
    saveUserPreferences(prefs);
  }, [showTimeBlock]);
  
  useEffect(() => {
    const prefs = getUserPreferences();
    prefs.extendedTaskForm.showRecurrence = showRecurrence;
    saveUserPreferences(prefs);
  }, [showRecurrence]);
  
  useEffect(() => {
    const prefs = getUserPreferences();
    prefs.extendedTaskForm.showTags = showTags;
    saveUserPreferences(prefs);
  }, [showTags]);
  
  const handleAddTag = () => {
    if (selectedTag && selectedTag !== "__new__" && !selectedTags.includes(selectedTag)) {
      setSelectedTags([...selectedTags, selectedTag])
      setSelectedTag("")
    }
  }
  
  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove))
  }
  
  const handleCreateTag = () => {
    if (!newTagName.trim()) return;
    
    const tagName = newTagName.trim().substring(0, 20);
    
    // Check if tag already exists
    if (!selectedTags.includes(tagName)) {
      setSelectedTags([...selectedTags, tagName]);
    }
    
    setNewTagName("");
    setShowNewTagDialog(false);
  }

  const handleAddCategory = () => {
    if (selectedCategory && selectedCategory !== "__new__" && !selectedCategories.includes(selectedCategory)) {
      setSelectedCategories([...selectedCategories, selectedCategory])
      setSelectedCategory("")
    }
  }

  const removeCategory = (categoryToRemove: string) => {
    setSelectedCategories(selectedCategories.filter(cat => cat !== categoryToRemove))
  }

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) return;
    
    // Limit category name to 20 characters
    const categoryName = newCategoryName.trim().substring(0, 20);
    
    // Check if category already exists
    if (categories.some(cat => cat.name.toLowerCase() === categoryName.toLowerCase())) {
      // Category already exists, just select it
      if (!selectedCategories.includes(categoryName)) {
        setSelectedCategories([...selectedCategories, categoryName]);
      }
      setNewCategoryName("");
      setShowNewCategoryDialog(false);
      return;
    }
    
    // Add new category
    addCategory(categoryName);
    
    // Select the new category
    if (!selectedCategories.includes(categoryName)) {
      setSelectedCategories([...selectedCategories, categoryName]);
    }
    
    setNewCategoryName("");
    setShowNewCategoryDialog(false);
  }

  const handleSubmit = () => {
    if (!title.trim()) return
    
    onSubmit({
      title,
      description: showDescription ? description : "",
      priority: showPriority ? priority : 50,
      categories: showCategories ? selectedCategories : [],
      dueDate: showDueDate ? dueDate : undefined,
      reminderEnabled: showReminder ? reminderEnabled : false,
      reminderTime: (showReminder && reminderEnabled) ? reminderTime : undefined,
      timeEstimate: showTimeEstimate ? timeEstimate : undefined, // Add time estimate to onSubmit
      energyLevel: showEnergyLevel ? energyLevel : 5, // Add energy level to onSubmit
      linkedGoalId: showLinkedGoal ? linkedGoalId : undefined, // Add linked goal ID to onSubmit
      dependencies: showDependencies ? selectedDependencies : [], // Add dependencies to onSubmit
      timeBlockStart: showTimeBlock ? timeBlockStart : undefined, // Add time block start to onSubmit
      timeBlockEnd: showTimeBlock ? timeBlockEnd : undefined, // Add time block end to onSubmit
      timeBlockDate: showTimeBlock ? timeBlockDate : undefined, // Add time block date to onSubmit
      isRecurring: showRecurrence ? isRecurring : false, // Add recurring to onSubmit
      recurrencePattern: showRecurrence ? recurrencePattern : undefined, // Add recurrence pattern to onSubmit
      recurrenceEndDate: showRecurrence ? recurrenceEndDate : undefined, // Add recurrence end date to onSubmit
      recurrenceInterval: showRecurrence ? recurrenceInterval : undefined, // Add recurrence interval to onSubmit
      tags: showTags ? selectedTags : [] // Add tags to onSubmit
    })
  }

  return (
    <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-6 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="task-title">Task Title *</Label>
          <Input
            id="task-title"
            placeholder="What do you need to do?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="show-description" 
            checked={showDescription}
            onCheckedChange={(checked) => setShowDescription(checked as boolean)}
          />
          <Label htmlFor="show-description" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Add Description
          </Label>
        </div>
        {showDescription && (
          <div className="space-y-2 ml-6">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              placeholder="Add details about this task..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="show-priority" 
            checked={showPriority}
            onCheckedChange={(checked) => setShowPriority(checked as boolean)}
          />
          <Label htmlFor="show-priority" className="flex items-center gap-2">
            <Flag className="h-4 w-4" />
            Set Priority
          </Label>
        </div>
        {showPriority && (
          <div className="space-y-2 ml-6">
            <Label htmlFor="task-priority">Priority (1-100)</Label>
            <Input
              id="task-priority"
              type="number"
              min="1"
              max="100"
              value={priority}
              onChange={(e) => setPriority(Math.min(100, Math.max(1, Number(e.target.value))))}
              placeholder="Enter priority from 1 (lowest) to 100 (highest)"
            />
            <p className="text-xs text-muted-foreground">
              Set task priority: 1-33 (Low), 34-66 (Medium), 67-100 (High)
            </p>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="show-categories" 
            checked={showCategories}
            onCheckedChange={(checked) => setShowCategories(checked as boolean)}
          />
          <Label htmlFor="show-categories" className="flex items-center gap-2">
            <Tags className="h-4 w-4" />
            Add Categories
          </Label>
        </div>
        {showCategories && (
          <div className="space-y-2 ml-6">
            <Label>Categories</Label>
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${cat.color}`}></div>
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                  <SelectItem value="__new__">
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Create New Category...
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button 
                type="button" 
                onClick={() => {
                  if (selectedCategory === "__new__") {
                    setShowNewCategoryDialog(true);
                  } else if (selectedCategory) {
                    handleAddCategory();
                  }
                }}
                disabled={!selectedCategory}
              >
                Add
              </Button>
            </div>
            {selectedCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedCategories.map((cat) => {
                  const category = categories.find(c => c.name === cat);
                  return (
                    <div 
                      key={cat} 
                      className="flex items-center gap-1 bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm"
                    >
                      {category && <div className={`w-2 h-2 rounded-full ${category.color}`}></div>}
                      {cat}
                      <button 
                        type="button" 
                        onClick={() => removeCategory(cat)}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            
            <Dialog open={showNewCategoryDialog} onOpenChange={setShowNewCategoryDialog}>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                <DialogHeader>
                  <DialogTitle>Create New Category</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-category-name">Category Name</Label>
                    <Input
                      id="new-category-name"
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
                    <Button variant="outline" onClick={() => {
                      setShowNewCategoryDialog(false);
                      setNewCategoryName("");
                    }}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateCategory}>
                      Create Category
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="show-due-date" 
            checked={showDueDate}
            onCheckedChange={(checked) => setShowDueDate(checked as boolean)}
          />
          <Label htmlFor="show-due-date" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Set Due Date
          </Label>
        </div>
        {showDueDate && (
          <div className="space-y-2 ml-6">
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : "Set due date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="overflow-y-auto max-h-80 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="show-reminder" 
            checked={showReminder}
            onCheckedChange={(checked) => setShowReminder(checked as boolean)}
          />
          <Label htmlFor="show-reminder" className="flex items-center gap-2">
            <BellIcon className="h-4 w-4" />
            Set Reminder
          </Label>
        </div>
        {showReminder && (
          <div className="space-y-2 ml-6">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="reminder" 
                checked={reminderEnabled}
                onCheckedChange={(checked) => setReminderEnabled(checked as boolean)}
              />
              <Label htmlFor="reminder">Enable Reminder</Label>
            </div>
            
            {reminderEnabled && (
              <div className="space-y-2 mt-2">
                <Label htmlFor="reminder-time">Reminder Time</Label>
                <Input
                  id="reminder-time"
                  type="time"
                  value={reminderTime ? format(reminderTime, "HH:mm") : ""}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(":").map(Number)
                    const newDate = new Date()
                    newDate.setHours(hours, minutes)
                    setReminderTime(newDate)
                  }}
                />
              </div>
            )}
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="show-time-estimate" 
            checked={showTimeEstimate}
            onCheckedChange={(checked) => setShowTimeEstimate(checked as boolean)}
          />
          <Label htmlFor="show-time-estimate" className="flex items-center gap-2">
            <Tags className="h-4 w-4" />
            Set Time Estimate
          </Label>
        </div>
        {showTimeEstimate && (
          <div className="space-y-2 ml-6">
            <Label>Time Estimate (in minutes)</Label>
            <Input
              id="time-estimate"
              type="number"
              min="0"
              value={timeEstimate}
              onChange={(e) => setTimeEstimate(Number(e.target.value))}
              placeholder="Enter time estimate in minutes"
            />
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="show-energy-level" 
            checked={showEnergyLevel}
            onCheckedChange={(checked) => setShowEnergyLevel(checked as boolean)}
          />
          <Label htmlFor="show-energy-level" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Set Energy Level
          </Label>
        </div>
        {showEnergyLevel && (
          <div className="space-y-2 ml-6">
            <Label htmlFor="energy-level">Energy Level (1-10)</Label>
            <Input
              id="energy-level"
              type="range"
              min="1"
              max="10"
              value={energyLevel}
              onChange={(e) => setEnergyLevel(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Low Energy</span>
              <span className="font-medium">{energyLevel}</span>
              <span>High Energy</span>
            </div>
          </div>
        )}

        {goals && goals.length > 0 && addedModules.includes('goals') && (
          <>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="show-linked-goal" 
                checked={showLinkedGoal}
                onCheckedChange={(checked) => setShowLinkedGoal(checked as boolean)}
              />
              <Label htmlFor="show-linked-goal" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Link to Goal
              </Label>
            </div>
            {showLinkedGoal && (
              <div className="space-y-2 ml-6">
                <Label htmlFor="linked-goal">Select Goal</Label>
                <Select value={linkedGoalId || ""} onValueChange={setLinkedGoalId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a goal to link" />
                  </SelectTrigger>
                  <SelectContent>
                    {goals.map((goal) => (
                      <SelectItem key={goal.id} value={goal.id}>
                        {goal.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </>
        )}
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="show-dependencies" 
            checked={showDependencies}
            onCheckedChange={(checked) => setShowDependencies(checked as boolean)}
          />
          <Label htmlFor="show-dependencies" className="flex items-center gap-2">
            <Tags className="h-4 w-4" />
            Set Dependencies
          </Label>
        </div>
        {showDependencies && (
          <div className="space-y-2 ml-6">
            <Label>Select Tasks That Must Be Completed First</Label>
            <div className="space-y-2">
              {tasks.filter(t => t.id !== "").map((task) => (
                <div key={task.id} className="flex items-center">
                  <Checkbox 
                    id={`dependency-${task.id}`}
                    checked={selectedDependencies.includes(task.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedDependencies([...selectedDependencies, task.id]);
                      } else {
                        setSelectedDependencies(selectedDependencies.filter(id => id !== task.id));
                      }
                    }}
                  />
                  <Label htmlFor={`dependency-${task.id}`} className="ml-2">
                    {task.title}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="show-time-block" 
            checked={showTimeBlock}
            onCheckedChange={(checked) => setShowTimeBlock(checked as boolean)}
          />
          <Label htmlFor="show-time-block" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Set Time Block
          </Label>
        </div>
        {showTimeBlock && (
          <div className="space-y-2 ml-6">
            <Label>Time Block Details</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="time-block-date">Date</Label>
                <Input
                  id="time-block-date"
                  type="date"
                  value={timeBlockDate}
                  onChange={(e) => setTimeBlockDate(e.target.value)}
                  placeholder="Select date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time-block-start">Start Time</Label>
                <Input
                  id="time-block-start"
                  type="time"
                  value={timeBlockStart}
                  onChange={(e) => setTimeBlockStart(e.target.value)}
                  placeholder="Start time"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time-block-end">End Time</Label>
                <Input
                  id="time-block-end"
                  type="time"
                  value={timeBlockEnd}
                  onChange={(e) => setTimeBlockEnd(e.target.value)}
                  placeholder="End time"
                />
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="show-tags" 
          checked={showTags}
          onCheckedChange={(checked) => setShowTags(checked as boolean)}
        />
        <Label htmlFor="show-tags" className="flex items-center gap-2">
          <Tags className="h-4 w-4" />
          Add Tags
        </Label>
      </div>
      {showTags && (
        <div className="space-y-2 ml-6">
          <Label>Tags</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter a tag..."
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && selectedTag.trim()) {
                  handleAddTag();
                  e.preventDefault();
                }
              }}
            />
            <Button 
              type="button" 
              onClick={handleAddTag}
              disabled={!selectedTag.trim()}
            >
              Add
            </Button>
          </div>
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedTags.map((tag) => (
                <div 
                  key={tag} 
                  className="flex items-center gap-1 bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm"
                >
                  {tag}
                  <button 
                    type="button" 
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="show-recurrence" 
          checked={showRecurrence}
          onCheckedChange={(checked) => setShowRecurrence(checked as boolean)}
        />
        <Label htmlFor="show-recurrence" className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          Recurring Task
        </Label>
      </div>
      {showRecurrence && (
        <div className="space-y-2 ml-6">
          <div className="space-y-2">
            <Label htmlFor="recurrence-pattern">Recurrence Pattern</Label>
            <Select value={recurrencePattern} onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'yearly') => setRecurrencePattern(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select pattern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="recurrence-interval">Every (X units)</Label>
            <Input
              id="recurrence-interval"
              type="number"
              min="1"
              value={recurrenceInterval}
              onChange={(e) => setRecurrenceInterval(Math.max(1, Number(e.target.value)))}
              placeholder="Enter interval"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="recurrence-end-date">End Date (optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !recurrenceEndDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {recurrenceEndDate ? format(new Date(recurrenceEndDate), "PPP") : "Set end date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="overflow-y-auto max-h-80 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                <Calendar
                  mode="single"
                  selected={recurrenceEndDate ? new Date(recurrenceEndDate) : undefined}
                  onSelect={(date) => setRecurrenceEndDate(date ? date.toISOString().split('T')[0] : "")}
                  initialFocus
                />
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 sticky bottom-0 bg-background pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!title.trim()}>
          Create Task
        </Button>
      </div>
    </div>
  )
}