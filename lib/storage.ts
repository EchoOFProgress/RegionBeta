// Local storage utilities for persisting data
export const storage = {
  save: (key: string, data: any): void => {
    try {
      // Only run in browser environment
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(data))
      }
    } catch (error) {
      console.error(`Error saving to localStorage: ${error}`)
    }
  },

  load: (key: string, defaultValue: any): any => {
    try {
      // Only run in browser environment
      if (typeof window !== 'undefined') {
        const item = localStorage.getItem(key)
        return item ? JSON.parse(item) : defaultValue
      }
      return defaultValue
    } catch (error) {
      console.error(`Error loading from localStorage: ${error}`)
      return defaultValue
    }
  },

  remove: (key: string): void => {
    try {
      // Only run in browser environment
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key)
      }
    } catch (error) {
      console.error(`Error removing from localStorage: ${error}`)
    }
  },

  clear: (): void => {
    try {
      // Only run in browser environment
      if (typeof window !== 'undefined') {
        localStorage.clear()
      }
    } catch (error) {
      console.error(`Error clearing localStorage: ${error}`)
    }
  },
}

// Export all data as JSON
export const exportData = () => {
  const data = {
    tasks: storage.load("tasks", []),
    habits: storage.load("habits", []),
    challenges: storage.load("challenges", []),
    stats: storage.load("stats", { level: 1 }),
    exportDate: new Date().toISOString(),
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `productivity-quest-${new Date().toISOString().split("T")[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Import data from JSON
export const importData = (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        resolve(data)
      } catch (error) {
        reject(new Error("Invalid JSON file"))
      }
    }
    reader.onerror = () => reject(new Error("Error reading file"))
    reader.readAsText(file)
  })
}
