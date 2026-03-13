"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Target, 
  CheckSquare, 
  Zap, 
  Trophy, 
  Plus, 
  Search,
  Book,
  Dumbbell,
  Globe,
  Users,
  GraduationCap
} from "lucide-react";
import { storage } from "@/lib/storage";

// Define types for templates
interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  priority: number;
  category?: string;
  timeEstimate?: number;
  energyLevel?: number;
  tags?: string[];
  recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurrenceInterval?: number;
}

interface HabitTemplate {
  id: string;
  name: string;
  description: string;
  type: 'boolean' | 'numeric' | 'checklist';
  numericCondition?: 'at-least' | 'less-than' | 'exactly';
  numericTarget?: number;
  categories?: string[];
  reminders?: string[];
  frequency?: 'daily' | 'weekly' | 'monthly' | 'custom';
  resetSchedule?: "daily" | "weekly" | "monthly";
  color?: string;
  icon?: string;
  timeWindow?: { from: string; to: string };
}

interface ChallengeTemplate {
  id: string;
  name: string;
  description: string;
  duration: number;
  goalType: "daily-completion" | "total-amount" | "checklist" | "points";
  failureMode: "hard" | "soft" | "retry-limit";
  difficulty: number;
  categories: string[];
}

interface GoalTemplate {
  id: string;
  name: string;
  description: string;
  targetDate?: string;
  motivation?: string;
  currentState?: string;
  desiredState?: string;
  categories?: string[];
}

export function TemplatesLibrary() {
  const [templates, setTemplates] = useState({
    tasks: storage.load('taskTemplates', [
      {
        id: "1",
        name: "Morning Routine",
        description: "Complete your morning routine checklist",
        priority: 90,
        category: "Personal",
        timeEstimate: 30,
        energyLevel: 8,
        tags: ["routine", "morning"]
      },
      {
        id: "2",
        name: "Evening Reflection",
        description: "Spend 15 minutes reflecting on the day",
        priority: 70,
        category: "Personal",
        timeEstimate: 15,
        energyLevel: 3,
        tags: ["reflection", "evening"]
      },
      {
        id: "3",
        name: "Weekly Planning",
        description: "Plan your week ahead",
        priority: 80,
        category: "Productivity",
        timeEstimate: 45,
        energyLevel: 6,
        recurrencePattern: 'weekly',
        tags: ["planning", "weekly"]
      }
    ]),
    habits: storage.load('habitTemplates', [
      {
        id: "1",
        name: "Daily Meditation",
        description: "10 minutes of mindfulness meditation",
        type: "boolean",
        categories: ["Health", "Personal"],
        frequency: "daily",
        resetSchedule: "daily",
        color: "#8b5cf6",
        icon: "circle"
      },
      {
        id: "2",
        name: "Read Daily",
        description: "Read at least 20 pages",
        type: "boolean",
        categories: ["Learning"],
        frequency: "daily",
        resetSchedule: "daily",
        color: "#10b981",
        icon: "book"
      },
      {
        id: "3",
        name: "Water Intake",
        description: "Drink 8 glasses of water",
        type: "numeric",
        numericCondition: "at-least",
        numericTarget: 8,
        categories: ["Health"],
        frequency: "daily",
        resetSchedule: "daily",
        color: "#06b6d4",
        icon: "droplets"
      }
    ]),
    challenges: storage.load('challengeTemplates', [
      {
        id: "1",
        name: "30-Day Fitness Challenge",
        description: "Complete a workout every day for 30 days",
        duration: 30,
        goalType: "daily-completion",
        failureMode: "soft",
        difficulty: 4,
        categories: ["Health"]
      },
      {
        id: "2",
        name: "No Social Media Week",
        description: "Avoid social media for 7 days",
        duration: 7,
        goalType: "daily-completion",
        failureMode: "hard",
        difficulty: 3,
        categories: ["Productivity"]
      },
      {
        id: "3",
        name: "Read 1 Book Monthly",
        description: "Complete reading one book per month",
        duration: 30,
        goalType: "total-amount",
        failureMode: "retry-limit",
        difficulty: 2,
        categories: ["Learning"]
      }
    ]),
    goals: storage.load('goalTemplates', [
      {
        id: "1",
        name: "Lose 10kg",
        description: "Achieve a healthier weight",
        targetDate: "2024-12-31",
        motivation: "Improve health and energy",
        currentState: "Currently 75kg",
        desiredState: "Reach 65kg",
        categories: ["Health"]
      },
      {
        id: "2",
        name: "Learn Spanish",
        description: "Become conversational in Spanish",
        targetDate: "2024-12-31",
        motivation: "Travel and career opportunities",
        currentState: "Basic vocabulary",
        desiredState: "Conversational fluency",
        categories: ["Learning"]
      },
      {
        id: "3",
        name: "Save $5000",
        description: "Build an emergency fund",
        targetDate: "2024-12-31",
        motivation: "Financial security",
        currentState: "$1000 saved",
        desiredState: "$5000 saved",
        categories: ["Finance"]
      }
    ])
  });

  const [activeTab, setActiveTab] = useState<'tasks' | 'habits' | 'challenges' | 'goals'>('tasks');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTemplates = {
    tasks: templates.tasks.filter((t: TaskTemplate) => 
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.tags && t.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    ),
    habits: templates.habits.filter((h: HabitTemplate) => 
      h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.description.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    challenges: templates.challenges.filter((c: ChallengeTemplate) => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    goals: templates.goals.filter((g: GoalTemplate) => 
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  };

  const getIconForTemplate = (type: string, template: any) => {
    switch(type) {
      case 'tasks':
        return <CheckSquare className="h-5 w-5" />;
      case 'habits':
        return <Target className="h-5 w-5" />;
      case 'challenges':
        return <Zap className="h-5 w-5" />;
      case 'goals':
        return <Trophy className="h-5 w-5" />;
      default:
        return <CheckSquare className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'tasks': return 'bg-blue-100 text-blue-800';
      case 'habits': return 'bg-green-100 text-green-800';
      case 'challenges': return 'bg-purple-100 text-purple-800';
      case 'goals': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const useTemplate = (type: string, template: any) => {
    // In a real app, this would create a new item based on the template
    alert(`Using ${type} template: ${template.name}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Templates Library</h1>
        <p className="text-muted-foreground">Pre-built templates for common productivity items</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeTab === 'tasks' ? 'default' : 'outline'}
          onClick={() => setActiveTab('tasks')}
          className="flex items-center gap-2"
        >
          <CheckSquare className="h-4 w-4" />
          Task Templates
        </Button>
        <Button
          variant={activeTab === 'habits' ? 'default' : 'outline'}
          onClick={() => setActiveTab('habits')}
          className="flex items-center gap-2"
        >
          <Target className="h-4 w-4" />
          Habit Templates
        </Button>
        <Button
          variant={activeTab === 'challenges' ? 'default' : 'outline'}
          onClick={() => setActiveTab('challenges')}
          className="flex items-center gap-2"
        >
          <Zap className="h-4 w-4" />
          Challenge Templates
        </Button>
        <Button
          variant={activeTab === 'goals' ? 'default' : 'outline'}
          onClick={() => setActiveTab('goals')}
          className="flex items-center gap-2"
        >
          <Trophy className="h-4 w-4" />
          Goal Templates
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates[activeTab].map((template: any) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  {getIconForTemplate(activeTab, template)}
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                </div>
                <Badge className={getTypeColor(activeTab)}>
                  {activeTab.slice(0, -1)}
                </Badge>
              </div>
              <CardDescription>
                {template.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {template.categories && (
                  <div className="flex flex-wrap gap-1">
                    {template.categories.map((cat: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {template.tags && (
                  <div className="flex flex-wrap gap-1">
                    {template.tags.map((tag: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {activeTab === 'tasks' && (
                  <div className="text-sm text-muted-foreground">
                    <div>Priority: {template.priority}/100</div>
                    {template.timeEstimate && <div>Time: {template.timeEstimate} min</div>}
                    {template.energyLevel && <div>Energy: {template.energyLevel}/10</div>}
                  </div>
                )}

                {activeTab === 'habits' && (
                  <div className="text-sm text-muted-foreground">
                    <div>Type: {template.type}</div>
                    {template.numericTarget && (
                      <div>Target: {template.numericTarget} {template.numericCondition}</div>
                    )}
                    <div>Frequency: {template.frequency}</div>
                  </div>
                )}

                {activeTab === 'challenges' && (
                  <div className="text-sm text-muted-foreground">
                    <div>Duration: {template.duration} days</div>
                    <div>Difficulty: {template.difficulty}/5</div>
                    <div>Failure Mode: {template.failureMode}</div>
                  </div>
                )}

                {activeTab === 'goals' && (
                  <div className="text-sm text-muted-foreground">
                    {template.targetDate && <div>Target: {template.targetDate}</div>}
                  </div>
                )}

                <Button 
                  className="w-full mt-2" 
                  onClick={() => useTemplate(activeTab, template)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Use Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates[activeTab].length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="mx-auto h-12 w-12 opacity-50 mb-4" />
          <p>No templates found</p>
          <p className="text-sm">Try a different search term</p>
        </div>
      )}
    </div>
  );
}