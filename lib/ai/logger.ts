/**
 * AI Logging System
 * Temporarily stores AI requests, responses, and fallback occurrences in localStorage.
 * This acts as our "database" for the beta implementation.
 */

export interface AILogEntry {
  id: string;
  timestamp: string;
  type: "recommender" | "creator";
  input: string;
  output: string | null;
  cardIds?: string[];        // If recommender was used
  fallback: boolean;         // True if the AI couldn't find a matching card
  flaggedForReview: boolean; // Flagged for manual dev review
  durationMs: number;
  keyUsed: "user" | "developer";
}

const STORAGE_KEY = "ai-logs";
const MAX_LOG_ENTRIES = 500;

export const aiLogger = {
  /** Retrieves all stored AI logs */
  getLogs(): AILogEntry[] {
    try {
      if (typeof window !== "undefined") {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
          return JSON.parse(data) as AILogEntry[];
        }
      }
    } catch (e) {
      console.error("Failed to parse AI logs", e);
    }
    return [];
  },

  /** Appends a new log entry, discarding oldest if over MAX_LOG_ENTRIES */
  logRequest(entry: Omit<AILogEntry, "id" | "timestamp" | "flaggedForReview">): void {
    try {
      if (typeof window !== "undefined") {
        const logs = this.getLogs();
        const newLog: AILogEntry = {
          ...entry,
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toISOString(),
          // Automatically flag for review if it's a fallback
          flaggedForReview: entry.fallback,
        };

        logs.unshift(newLog); // Add to beginning

        // Keep only recent logs to prevent local storage quota exceeded
        if (logs.length > MAX_LOG_ENTRIES) {
          logs.length = MAX_LOG_ENTRIES;
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
      }
    } catch (e) {
      console.error("Failed to save AI log", e);
    }
  },

  /** Manually flag an existing log entry for developer review */
  flagForReview(id: string): void {
    try {
      if (typeof window !== "undefined") {
        const logs = this.getLogs();
        const logIndex = logs.findIndex((l) => l.id === id);
        if (logIndex !== -1) {
          logs[logIndex].flaggedForReview = true;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
        }
      }
    } catch (e) {
      console.error("Failed to flag AI log", e);
    }
  },

  clearLogs(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
};
