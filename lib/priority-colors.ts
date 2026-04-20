// Utility functions for applying priority-based colors to UI elements

// Priority color settings with range support
let prioritySettings: {
  id: string;
  name: string;
  enabled: boolean;
  color: string;
  priorityRange: {
    min: number;
    max: number;
  };
  modules: {
    tasks: boolean;
    habits: boolean;
    challenges: boolean;
    goals: boolean;
  };
  useCategories: boolean;
  selectedCategories: string[];
  glow: boolean;
  glowRange: {
    min: number;
    max: number;
  };
  priority: number; // Added priority to determine which setting to use when ranges overlap
}[] = [
  {
    id: "1",
    name: "Default Priority Setting",
    enabled: true,
    color: "var(--theme-accent)", // theme-defined accent color instead of hardcoded blue
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
    priority: 1 // Lowest priority
  }
];

// Function to update priority settings
export function updatePrioritySettings(settings: typeof prioritySettings) {
  prioritySettings = [...settings];
}

// Function to add a new priority setting
export function addPrioritySetting(setting: typeof prioritySettings[0]) {
  prioritySettings = [...prioritySettings, setting];
}

// Function to update a specific priority setting by ID
export function updatePrioritySettingById(id: string, updates: Partial<typeof prioritySettings[0]>) {
  prioritySettings = prioritySettings.map(setting => 
    setting.id === id ? { ...setting, ...updates } : setting
  );
}

// Function to delete a priority setting by ID
export function deletePrioritySettingById(id: string) {
  prioritySettings = prioritySettings.filter(setting => setting.id !== id);
}

// Get all priority settings
export function getAllPrioritySettings() {
  return [...prioritySettings];
}

// Get the appropriate priority setting for a given priority value and module
export function getApplicablePrioritySetting(priority: number, module: 'tasks' | 'habits' | 'challenges' | 'goals', categories?: string[]) {
  // Filter settings that are enabled and apply to this module
  const applicableSettings = prioritySettings.filter(setting => 
    setting.enabled && 
    setting.modules[module] &&
    priority >= setting.priorityRange.min && 
    priority <= setting.priorityRange.max &&
    (!setting.useCategories || !categories || categories.some(cat => setting.selectedCategories.includes(cat)))
  );
  
  // If no applicable settings, return null
  if (applicableSettings.length === 0) {
    return null;
  }
  
  // If only one applicable setting, return it
  if (applicableSettings.length === 1) {
    return applicableSettings[0];
  }
  
  // If multiple applicable settings, return the one with the highest priority value
  // (higher priority number means higher precedence)
  return applicableSettings.reduce((prev, current) => 
    (prev.priority > current.priority) ? prev : current
  );
}

export function getPriorityColor(priority: number, module: 'tasks' | 'habits' | 'challenges' | 'goals', categories?: string[]): string {
  const setting = getApplicablePrioritySetting(priority, module, categories);
  
  // Return the color if a setting was found
  if (setting) {
    return setting.color;
  }
  
  return ""; // No color if no applicable setting
}

export function shouldGlow(priority: number, module: 'tasks' | 'habits' | 'challenges' | 'goals', categories?: string[]): boolean {
  const setting = getApplicablePrioritySetting(priority, module, categories);
  
  // Check if the priority is within the glow range of the selected setting
  if (setting && priority >= setting.glowRange.min && priority <= setting.glowRange.max) {
    return setting.glow;
  }
  
  return false; // No glow if no applicable setting or outside glow range
}