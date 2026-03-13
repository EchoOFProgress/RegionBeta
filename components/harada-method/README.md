# Harada Method Implementation

This is a complete implementation of the Harada Method for personal goal achievement, based on the Japanese methodology developed by Hiromi Harada (Ohtani).

## Overview

The Harada Method is a systematic approach to achieving personal goals through self-assessment, planning, and daily tracking. It consists of five core modules:

1. **Self-Reliance Assessment** - 33-question evaluation across four life areas
2. **Long-term Goal Setting** - Defining your main objective with detailed planning
3. **64 Chart (Mandala Chart)** - Breaking down your goal into 8 basic goals with 8 action tasks each
4. **Daily Routine Tracking** - Establishing and monitoring daily habits
5. **Daily Journal** - Reflecting on daily progress and experiences

## Features Implemented

- Complete self-assessment with 33 questions across 4 categories:
  - Mental Attitude
  - Health Management
  - Living Attitude
  - Skills
- Interactive radar chart visualization for assessment results
- Long-term goal setting with detailed planning
- 64 Chart (Mandala Chart) visualization and management
- Daily routine tracking with morning/afternoon/evening categorization
- Daily journal with mood tracking and reflection
- Achievement system with badges and points
- Progress tracking and statistics
- Local storage for data persistence

## Modules

### Self-Reliance Assessment (`assessment-module.tsx`)
A 33-question assessment to evaluate your current self-reliance across four life areas. Each question is rated on a scale of 1-5, and results are visualized in a radar chart.

### Long-term Goal (`goal-module.tsx`)
Set and manage your main long-term goal with detailed planning including:
- Goal description and target date
- Motivation and current/desired state
- Obstacles and resources
- Supporters
- Daily habits, weekly milestones, and monthly targets

### 64 Chart (`chart-module.tsx`)
Interactive Mandala Chart that breaks your main goal into:
- 8 basic goals
- 8 action tasks for each basic goal (64 total tasks)
- Visual grid interface for easy management
- Progress tracking

### Daily Routine (`routine-module.tsx`)
Track daily habits and routines organized by:
- Morning routines
- Afternoon routines
- Evening routines
- Custom routines
- Completion tracking with streaks

### Daily Journal (`diary-module.tsx`)
Daily reflection and tracking including:
- Mood rating (1-5 stars)
- Energy and productivity levels
- Daily achievements
- Challenges faced
- Gratitude entries
- Tomorrow's goals
- Free-form reflection

### Achievements (`achievements-module.tsx`)
Gamification system with:
- Level progression based on points
- Achievement badges for milestones
- Streak tracking
- Statistics dashboard

## Data Storage

All data is stored locally in the browser using localStorage. The storage system includes:

- User profiles
- Assessment results
- Long-term goals
- 64 Charts
- Routine sheets
- Diary entries
- Achievements
- Statistics

## Usage

To use the Harada Method components in your application:

```tsx
import { HaradaMethod } from "./harada-method"

function App() {
  return (
    <div className="container mx-auto p-4">
      <HaradaMethod />
    </div>
  )
}
```

Or use individual modules:

```tsx
import { GoalModule, AssessmentModule } from "./harada-method"

function App() {
  const userId = "user123" // In a real app, this would come from auth
  
  return (
    <div className="container mx-auto p-4">
      <GoalModule userId={userId} />
      <AssessmentModule userId={userId} />
    </div>
  )
}
```

## Technical Details

- Built with React and TypeScript
- Uses localStorage for data persistence
- Responsive design for all device sizes
- Accessible UI components
- Modular architecture for easy maintenance

## Future Enhancements

- Integration with cloud storage for data synchronization
- Mobile app versions
- Social features for accountability partners
- Advanced analytics and insights
- AI-powered recommendations
- Export/import functionality