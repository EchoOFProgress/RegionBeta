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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, TagIcon, FileText, Shapes, Repeat, Target, Bell, RotateCcw, Palette, Clock, Zap, Smile } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useCategories } from "@/lib/category-context"
import { getUserPreferences, saveUserPreferences } from "@/lib/user-preferences"

type HabitType = "boolean" | "numeric" | "checklist"
type FrequencyType = "daily" | "weekly" | "monthly" | "custom"
type GoalMode = "at-least" | "less-than" | "exactly" | "any"
type NumericCondition = "at-least" | "less-than" | "exactly"

interface ExtendedHabitFormProps {
  onSubmit: (habit: {
    name: string;
    description: string;
    type: HabitType;
    numericCondition?: NumericCondition;
    numericTarget?: number;
    categories: string[];
    reminders: string[];
    frequency: FrequencyType;
    customDays: number[];
    resetSchedule: "daily" | "weekly" | "monthly";
    color: string;
    icon: string;
    timeWindow?: { // Add time window to props
      from: string;
      to: string;
    };
    trackEnergyLevel?: boolean;
    trackMood?: boolean;
  }) => void;
  onCancel: () => void;
}

export function ExtendedHabitForm({ onSubmit, onCancel }: ExtendedHabitFormProps) {
  const { categories } = useCategories();
  const [name, setName] = useState("");
  const [showDescription, setShowDescription] = useState(false);
  const [description, setDescription] = useState("");
  const [showType, setShowType] = useState(false);
  const [type, setType] = useState<HabitType>("boolean");
  const [showNumeric, setShowNumeric] = useState(false);
  const [numericCondition, setNumericCondition] = useState<NumericCondition>("at-least");
  const [numericTarget, setNumericTarget] = useState(1);
  const [showCategories, setShowCategories] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showReminders, setShowReminders] = useState(false);
  const [reminders, setReminders] = useState<string[]>([]);
  const [newReminderTime, setNewReminderTime] = useState("");
  const [showFrequency, setShowFrequency] = useState(false);
  const [frequency, setFrequency] = useState<FrequencyType>("daily");
  const [customDays, setCustomDays] = useState<number[]>([]);
  const [showResetSchedule, setShowResetSchedule] = useState(false);
  const [resetSchedule, setResetSchedule] = useState<"daily" | "weekly" | "monthly">("daily");
  const [showColor, setShowColor] = useState(false);
  const [color, setColor] = useState("#64748b");
  const [showIcon, setShowIcon] = useState(false);
  const [icon, setIcon] = useState("circle");
  const [showTimeWindow, setShowTimeWindow] = useState(false);
  const [timeWindowFrom, setTimeWindowFrom] = useState("");
  const [timeWindowTo, setTimeWindowTo] = useState("");
  const [showGoal, setShowGoal] = useState(false);
  const [goalMode, setGoalMode] = useState<GoalMode>("at-least");
  const [goalValue, setGoalValue] = useState(1);
  const [showCustomDays, setShowCustomDays] = useState(false); // Add showCustomDays state
  const [showVisualSettings, setShowVisualSettings] = useState(false); // Add showVisualSettings state
  const [showStatistics, setShowStatistics] = useState(false); // Add showStatistics state
  const [showEnergyLevel, setShowEnergyLevel] = useState(false); // Add showEnergyLevel state
  const [showMoodTracking, setShowMoodTracking] = useState(false); // Add showMoodTracking state
  
  // Update preferences when checkboxes change
  useEffect(() => {
    const prefs = getUserPreferences();
    prefs.extendedHabitForm.showDescription = showDescription;
    saveUserPreferences(prefs);
  }, [showDescription]);
  
  useEffect(() => {
    const prefs = getUserPreferences();
    prefs.extendedHabitForm.showType = showType;
    saveUserPreferences(prefs);
  }, [showType]);
  
  useEffect(() => {
    const prefs = getUserPreferences();
    prefs.extendedHabitForm.showNumeric = showNumeric;
    saveUserPreferences(prefs);
  }, [showNumeric]);
  
  useEffect(() => {
    const prefs = getUserPreferences();
    prefs.extendedHabitForm.showCategories = showCategories;
    saveUserPreferences(prefs);
  }, [showCategories]);
  
  useEffect(() => {
    const prefs = getUserPreferences();
    prefs.extendedHabitForm.showReminders = showReminders;
    saveUserPreferences(prefs);
  }, [showReminders]);
  
  useEffect(() => {
    const prefs = getUserPreferences();
    prefs.extendedHabitForm.showFrequency = showFrequency;
    saveUserPreferences(prefs);
  }, [showFrequency]);
  
  useEffect(() => {
    const prefs = getUserPreferences();
    prefs.extendedHabitForm.showResetSchedule = showResetSchedule;
    saveUserPreferences(prefs);
  }, [showResetSchedule]);
  
  useEffect(() => {
    const prefs = getUserPreferences();
    prefs.extendedHabitForm.showColor = showColor;
    saveUserPreferences(prefs);
  }, [showColor]);
  
  useEffect(() => {
    const prefs = getUserPreferences();
    prefs.extendedHabitForm.showIcon = showIcon;
    saveUserPreferences(prefs);
  }, [showIcon]);
  
  useEffect(() => {
    const prefs = getUserPreferences();
    prefs.extendedHabitForm.showTimeWindow = showTimeWindow;
    saveUserPreferences(prefs);
  }, [showTimeWindow]);
  
  useEffect(() => {
    const prefs = getUserPreferences();
    prefs.extendedHabitForm.showGoal = showGoal;
    saveUserPreferences(prefs);
  }, [showGoal]);
  
  useEffect(() => {
    const prefs = getUserPreferences();
    prefs.extendedHabitForm.showCustomDays = showCustomDays;
    saveUserPreferences(prefs);
  }, [showCustomDays]);
  
  useEffect(() => {
    const prefs = getUserPreferences();
    prefs.extendedHabitForm.showVisualSettings = showVisualSettings;
    saveUserPreferences(prefs);
  }, [showVisualSettings]);
  
  useEffect(() => {
    const prefs = getUserPreferences();
    prefs.extendedHabitForm.showStatistics = showStatistics;
    saveUserPreferences(prefs);
  }, [showStatistics]);
  
  useEffect(() => {
    const prefs = getUserPreferences();
    prefs.extendedHabitForm.showEnergyLevel = showEnergyLevel;
    saveUserPreferences(prefs);
  }, [showEnergyLevel]);
  
  useEffect(() => {
    const prefs = getUserPreferences();
    prefs.extendedHabitForm.showMoodTracking = showMoodTracking;
    saveUserPreferences(prefs);
  }, [showMoodTracking]);

  const addCategory = () => {
    if (selectedCategory && !selectedCategories.includes(selectedCategory)) {
      setSelectedCategories([...selectedCategories, selectedCategory]);
      setSelectedCategory("");
    }
  }

  const removeCategory = (categoryToRemove: string) => {
    setSelectedCategories(selectedCategories.filter(cat => cat !== categoryToRemove));
  }

  const toggleCustomDay = (day: number) => {
    setCustomDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day) 
        : [...prev, day].sort()
    )
  }

  const handleSubmit = () => {
    if (!name.trim()) return
    
    onSubmit({
      name,
      description: showDescription ? description : "",
      type: showType ? type : "boolean",
      numericCondition: showType && type === "numeric" && showNumeric ? numericCondition : undefined,
      numericTarget: showType && type === "numeric" && showNumeric ? numericTarget : undefined,
      categories: showCategories ? selectedCategories : [],
      reminders: showReminders ? reminders : [],
      frequency: showFrequency ? frequency : "daily",
      customDays: showFrequency && frequency === "custom" && showCustomDays ? customDays : [],
      resetSchedule: showResetSchedule ? resetSchedule : "daily",
      color: showVisualSettings ? color : "#64748b",
      icon: showVisualSettings ? icon : "circle",
      timeWindow: showTimeWindow && timeWindowFrom && timeWindowTo ? 
        { from: timeWindowFrom, to: timeWindowTo } : 
        undefined,
      trackEnergyLevel: showEnergyLevel,
      trackMood: showMoodTracking
    })
  }

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-6 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="habit-name">Habit Name *</Label>
          <Input
            id="habit-name"
            placeholder="e.g., Morning meditation, Read 30 minutes..."
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            <Label htmlFor="habit-description">Description</Label>
            <Textarea
              id="habit-description"
              placeholder="Add details about this habit..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="show-type" 
            checked={showType}
            onCheckedChange={(checked) => setShowType(checked as boolean)}
          />
          <Label htmlFor="show-type" className="flex items-center gap-2">
            <Shapes className="h-4 w-4" />
            Set Habit Type
          </Label>
        </div>
        {showType && (
          <div className="space-y-2 ml-6">
            <Label>Habit Type</Label>
            <RadioGroup value={type} onValueChange={(value) => setType(value as HabitType)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="boolean" id="type-boolean" />
                <Label htmlFor="type-boolean">Boolean (Done/Not Done)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="numeric" id="type-numeric" />
                <Label htmlFor="type-numeric">Numeric Goal (e.g., 30 minutes)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="checklist" id="type-checklist" />
                <Label htmlFor="type-checklist">Checklist (Multiple items)</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {showType && type === "numeric" && (
          <div className="flex items-center space-x-2 ml-6">
            <Checkbox 
              id="show-goal" 
              checked={showGoal}
              onCheckedChange={(checked) => setShowGoal(checked as boolean)}
            />
            <Label htmlFor="show-goal" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Set Goal Tracking
            </Label>
          </div>
        )}
        {showType && type === "numeric" && showGoal && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-secondary/50 rounded-lg ml-6">
            <div className="space-y-2">
              <Label htmlFor="goal-mode">Goal Mode</Label>
              <Select value={goalMode} onValueChange={(value) => setGoalMode(value as GoalMode)}>
                <SelectTrigger id="goal-mode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="at-least">At least</SelectItem>
                  <SelectItem value="less-than">Less than</SelectItem>
                  <SelectItem value="exactly">Exactly</SelectItem>
                  <SelectItem value="any">Any value</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal-value">Target Value</Label>
              <Input
                id="goal-value"
                type="number"
                min="1"
                value={goalValue}
                onChange={(e) => setGoalValue(Number(e.target.value))}
              />
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="show-frequency" 
            checked={showFrequency}
            onCheckedChange={(checked) => setShowFrequency(checked as boolean)}
          />
          <Label htmlFor="show-frequency" className="flex items-center gap-2">
            <Repeat className="h-4 w-4" />
            Set Frequency
          </Label>
        </div>
        {showFrequency && (
          <div className="space-y-2 ml-6">
            <Label>Frequency</Label>
            <RadioGroup value={frequency} onValueChange={(value) => setFrequency(value as FrequencyType)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="daily" id="freq-daily" />
                <Label htmlFor="freq-daily">Daily</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weekly" id="freq-weekly" />
                <Label htmlFor="freq-weekly">Weekly</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="monthly" id="freq-monthly" />
                <Label htmlFor="freq-monthly">Monthly</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="freq-custom" />
                <Label htmlFor="freq-custom">Custom Days</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {showFrequency && frequency === "custom" && (
          <div className="flex items-center space-x-2 ml-6">
            <Checkbox 
              id="show-custom-days" 
              checked={showCustomDays}
              onCheckedChange={(checked) => setShowCustomDays(checked as boolean)}
            />
            <Label htmlFor="show-custom-days">Set Custom Days</Label>
          </div>
        )}
        {showFrequency && frequency === "custom" && showCustomDays && (
          <div className="space-y-2 p-4 bg-secondary/50 rounded-lg ml-6">
            <Label>Custom Days</Label>
            <div className="flex gap-2">
              {dayLabels.map((day, index) => (
                <Button
                  key={day}
                  type="button"
                  variant={customDays.includes(index) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleCustomDay(index)}
                  className="w-10 h-10 p-0"
                >
                  {day}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="show-categories" 
            checked={showCategories}
            onCheckedChange={(checked) => setShowCategories(checked as boolean)}
          />
          <Label htmlFor="show-categories" className="flex items-center gap-2">
            <TagIcon className="h-4 w-4" />
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
                </SelectContent>
              </Select>
              <Button type="button" onClick={addCategory} disabled={!selectedCategory}>Add</Button>
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
          </div>
        )}

        {/* Reminders Section */}
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="show-reminders" 
            checked={showReminders}
            onCheckedChange={(checked) => setShowReminders(checked as boolean)}
          />
          <Label htmlFor="show-reminders" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Add Reminders
          </Label>
        </div>
        {showReminders && (
          <div className="space-y-2 ml-6">
            <Label>Reminder Times</Label>
            <div className="flex gap-2">
              <Input
                type="time"
                value={newReminderTime}
                onChange={(e) => setNewReminderTime(e.target.value)}
              />
              <Button 
                onClick={() => {
                  if (newReminderTime) {
                    setReminders([...reminders, newReminderTime]);
                    setNewReminderTime("");
                  }
                }}
              >
                Add
              </Button>
            </div>
            {reminders.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {reminders.map((time, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-1 bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm"
                  >
                    {time}
                    <button 
                      onClick={() => setReminders(reminders.filter((_, i) => i !== index))}
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

        {/* Reset Schedule Section */}
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="show-reset" 
            checked={showResetSchedule}
            onCheckedChange={(checked) => setShowResetSchedule(checked as boolean)}
          />
          <Label htmlFor="show-reset" className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Set Reset Schedule
          </Label>
        </div>
        {showResetSchedule && (
          <div className="space-y-2 ml-6">
            <Label>Reset Schedule</Label>
            <RadioGroup value={resetSchedule} onValueChange={(value) => setResetSchedule(value as "daily" | "weekly" | "monthly")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="daily" id="reset-daily" />
                <Label htmlFor="reset-daily">Daily</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weekly" id="reset-weekly" />
                <Label htmlFor="reset-weekly">Weekly</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="monthly" id="reset-monthly" />
                <Label htmlFor="reset-monthly">Monthly</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Visual Settings Section */}
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="show-visual" 
            checked={showVisualSettings}
            onCheckedChange={(checked) => setShowVisualSettings(checked as boolean)}
          />
          <Label htmlFor="show-visual" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Add Visual Settings
          </Label>
        </div>
        {showVisualSettings && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-secondary/50 rounded-lg ml-6">
            <div className="space-y-2">
              <Label htmlFor="habit-color">Color</Label>
              <Input
                id="habit-color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="habit-icon">Icon</Label>
              <Select value={icon} onValueChange={setIcon}>
                <SelectTrigger id="habit-icon">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="circle">Circle</SelectItem>
                  <SelectItem value="star">Star</SelectItem>
                  <SelectItem value="heart">Heart</SelectItem>
                  <SelectItem value="book">Book</SelectItem>
                  <SelectItem value="dumbbell">Dumbbell</SelectItem>
                  <SelectItem value="droplets">Droplets</SelectItem>
                  <SelectItem value="pen-tool">Pen Tool</SelectItem>
                  <SelectItem value="sun">Sun</SelectItem>
                  <SelectItem value="moon">Moon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Time Window Section */}
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="show-time-window" 
            checked={showTimeWindow}
            onCheckedChange={(checked) => setShowTimeWindow(checked as boolean)}
          />
          <Label htmlFor="show-time-window" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Set Time Window
          </Label>
        </div>
        {showTimeWindow && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-secondary/50 rounded-lg ml-6">
            <div className="space-y-2">
              <Label htmlFor="time-window-from">From</Label>
              <Input
                id="time-window-from"
                type="time"
                value={timeWindowFrom}
                onChange={(e) => setTimeWindowFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time-window-to">To</Label>
              <Input
                id="time-window-to"
                type="time"
                value={timeWindowTo}
                onChange={(e) => setTimeWindowTo(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground col-span-2">
              Set the time window when this habit should be completed (e.g., morning, afternoon, evening)
            </p>
          </div>
        )}
        
        {/* Statistics Section */}
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="show-statistics" 
            checked={showStatistics}
            onCheckedChange={(checked) => setShowStatistics(checked as boolean)}
          />
          <Label htmlFor="show-statistics" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Enable Statistics Tracking
          </Label>
        </div>
        
        {/* Energy Level Tracking */}
        <div className="flex items-center space-x-2 ml-6">
          <Checkbox 
            id="show-energy" 
            checked={showEnergyLevel}
            onCheckedChange={(checked) => setShowEnergyLevel(checked as boolean)}
          />
          <Label htmlFor="show-energy" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Track Energy Level (1-10)
          </Label>
        </div>
        
        {/* Mood Tracking */}
        <div className="flex items-center space-x-2 ml-6">
          <Checkbox 
            id="show-mood" 
            checked={showMoodTracking}
            onCheckedChange={(checked) => setShowMoodTracking(checked as boolean)}
          />
          <Label htmlFor="show-mood" className="flex items-center gap-2">
            <Smile className="h-4 w-4" />
            Track Mood (1-5)
          </Label>
        </div>

      </div>

      <div className="flex justify-end gap-3 sticky bottom-0 bg-background pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!name.trim()}>
          Create Habit
        </Button>
      </div>
    </div>
  )
}