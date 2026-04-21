// User preferences for extended forms
export interface UserPreferences {
  extendedTaskForm: {
    showDescription: boolean;
    showPriority: boolean;
    showCategories: boolean;
    showDueDate: boolean;
    showReminder: boolean;
    showTimeEstimate: boolean;
    showLinkedGoal: boolean;
    showDependencies: boolean;
    showTimeBlock: boolean;
    showRecurrence: boolean;
    showTags: boolean;
  };
  extendedHabitForm: {
    showDescription: boolean;
    showType: boolean;
    showNumeric: boolean;
    showCategories: boolean;
    showReminders: boolean;
    showFrequency: boolean;
    showResetSchedule: boolean;
    showColor: boolean;
    showIcon: boolean;
    showTimeWindow: boolean;
    showGoal: boolean;
    showCustomDays: boolean;
    showVisualSettings: boolean;
    showStatistics: boolean;
  };
  notifications: {
    enabled: boolean;
    batchNotifications: boolean;
    priorityBasedAlerts: boolean;
    smartTiming: boolean;
    streakWarnings: boolean;
    dailySummary: boolean;
    weeklyReport: boolean;
  };
}

// Default preferences
export const DEFAULT_PREFERENCES: UserPreferences = {
  extendedTaskForm: {
    showDescription: false,
    showPriority: false,
    showCategories: false,
    showDueDate: false,
    showReminder: false,
    showTimeEstimate: false,
    showLinkedGoal: false,
    showDependencies: false,
    showTimeBlock: false,
    showRecurrence: false,
    showTags: false,
  },
  extendedHabitForm: {
    showDescription: false,
    showType: false,
    showNumeric: false,
    showCategories: false,
    showReminders: false,
    showFrequency: false,
    showResetSchedule: false,
    showColor: false,
    showIcon: false,
    showTimeWindow: false,
    showGoal: false,
    showCustomDays: false,
    showVisualSettings: false,
    showStatistics: false,
  },
  notifications: {
    enabled: false,
    batchNotifications: true,
    priorityBasedAlerts: true,
    smartTiming: true,
    streakWarnings: true,
    dailySummary: true,
    weeklyReport: false,
  }
};

// Get user preferences from localStorage
export const getUserPreferences = (): UserPreferences => {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  
  try {
    const saved = localStorage.getItem('userPreferences');
    if (saved) {
      return {
        ...DEFAULT_PREFERENCES,
        ...JSON.parse(saved)
      };
    }
  } catch (error) {
    console.error('Error loading user preferences:', error);
  }
  
  return DEFAULT_PREFERENCES;
};

// Save user preferences to localStorage
export const saveUserPreferences = (preferences: UserPreferences) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving user preferences:', error);
  }
};

// Update a specific preference
export const updateUserPreference = (path: string, value: any) => {
  const currentPreferences = getUserPreferences();
  const pathParts = path.split('.');
  let current: any = currentPreferences;
  
  // Navigate to the parent object
  for (let i = 0; i < pathParts.length - 1; i++) {
    current = current[pathParts[i]];
  }
  
  // Update the specific property
  current[pathParts[pathParts.length - 1]] = value;
  
  saveUserPreferences(currentPreferences);
};