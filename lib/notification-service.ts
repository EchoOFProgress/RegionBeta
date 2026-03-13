// Notification service for smart reminders
import { Task, Habit, Challenge } from "@/lib/types";
import { storage } from "@/lib/storage";
import { getUserPreferences } from "@/lib/user-preferences";

// Define notification types
export type NotificationType = 
  | "task-due"
  | "habit-reminder"
  | "challenge-checkin"
  | "streak-warning"
  | "milestone-achievement"
  | "daily-summary"
  | "weekly-report";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: any; // Additional data related to the notification
}

// Notification service class
export class NotificationService {
  private static instance: NotificationService;
  private notifications: Notification[] = [];
  private notificationCallback: ((notifications: Notification[]) => void) | null = null;

  private constructor() {
    this.loadNotifications();
    this.setupNotificationListeners();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private loadNotifications() {
    this.notifications = storage.load('notifications', []);
  }

  private saveNotifications() {
    storage.save('notifications', this.notifications);
    if (this.notificationCallback) {
      this.notificationCallback(this.getUnreadNotifications());
    }
  }

  public subscribe(callback: (notifications: Notification[]) => void) {
    this.notificationCallback = callback;
    callback(this.getUnreadNotifications());
  }

  public unsubscribe() {
    this.notificationCallback = null;
  }

  public getUnreadNotifications(): Notification[] {
    return this.notifications.filter(n => !n.read);
  }

  public getAllNotifications(): Notification[] {
    return this.notifications;
  }

  public markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
    }
  }

  public markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
  }

  public deleteNotification(notificationId: string) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveNotifications();
  }

  // Method to check for and generate notifications
  public checkForNotifications(tasks: Task[], habits: Habit[], challenges: Challenge[]) {
    const preferences = getUserPreferences();
    
    if (!preferences.notifications.enabled) {
      return; // Notifications are disabled
    }

    // Check for task due notifications
    if (preferences.notifications.priorityBasedAlerts) {
      this.checkTaskDueNotifications(tasks);
    }

    // Check for habit reminders
    if (preferences.notifications.smartTiming) {
      this.checkHabitReminders(habits);
    }

    // Check for challenge check-ins
    if (preferences.notifications.smartTiming) {
      this.checkChallengeCheckins(challenges);
    }

    // Check for streak warnings
    if (preferences.notifications.streakWarnings) {
      this.checkStreakWarnings(habits);
    }

    // Check for milestone achievements
    this.checkMilestoneAchievements(challenges);

    // Schedule daily summary if enabled
    if (preferences.notifications.dailySummary) {
      this.scheduleDailySummary();
    }

    // Schedule weekly report if enabled
    if (preferences.notifications.weeklyReport) {
      this.scheduleWeeklyReport();
    }
  }

  private checkTaskDueNotifications(tasks: Task[]) {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now

    tasks.forEach(task => {
      if (task.dueDate && !task.completed) {
        const dueDate = new Date(task.dueDate);
        
        // Check if task is due within the next hour
        if (dueDate > now && dueDate <= oneHourFromNow) {
          // Check if we already sent a notification for this task
          const existingNotification = this.notifications.find(
            n => n.data?.taskId === task.id && n.type === "task-due"
          );

          if (!existingNotification) {
            this.createNotification({
              type: "task-due",
              title: "Task Due Soon",
              message: `Your task "${task.title}" is due soon.`,
              data: { taskId: task.id, taskTitle: task.title }
            });
          }
        }
      }
    });
  }

  private checkHabitReminders(habits: Habit[]) {
    const now = new Date();
    
    habits.forEach(habit => {
      // For habits with reminders set
      if (habit.reminders && habit.reminders.length > 0 && !habit.completedToday) {
        habit.reminders.forEach((reminderTime: string) => {
          // Parse the reminder time (HH:MM format)
          const [hours, minutes] = reminderTime.split(':').map(Number);
          const reminderDate = new Date();
          reminderDate.setHours(hours, minutes, 0, 0);

          // Check if it's time for the reminder (within 5 minutes of scheduled time)
          const timeDiff = Math.abs(now.getTime() - reminderDate.getTime());
          const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds

          if (timeDiff <= fiveMinutes && !habit.completedToday) {
            // Check if we already sent a notification for this habit today
            const existingNotification = this.notifications.find(
              n => n.data?.habitId === habit.id && 
                   n.type === "habit-reminder" &&
                   n.timestamp.startsWith(now.toISOString().split('T')[0]) // Same date
            );

            if (!existingNotification) {
              this.createNotification({
                type: "habit-reminder",
                title: "Habit Reminder",
                message: `Time to work on your habit: ${habit.name}`,
                data: { habitId: habit.id, habitName: habit.name }
              });
            }
          }
        });
      }
    });
  }

  private checkChallengeCheckins(challenges: Challenge[]) {
    const now = new Date();
    
    challenges.forEach(challenge => {
      if (challenge.status === "active" && challenge.currentDay < challenge.duration) {
        // Check if the challenge has a specific check-in time or pattern
        const lastCheckedIn = challenge.lastCheckedIn ? new Date(challenge.lastCheckedIn) : null;
        const today = new Date(now.toDateString());
        
        // If challenge hasn't been checked in today
        if (!lastCheckedIn || lastCheckedIn.toDateString() !== today.toDateString()) {
          // Check if we already sent a notification for this challenge today
          const existingNotification = this.notifications.find(
            n => n.data?.challengeId === challenge.id && 
                 n.type === "challenge-checkin" &&
                 n.timestamp.startsWith(now.toISOString().split('T')[0]) // Same date
          );

          if (!existingNotification) {
            this.createNotification({
              type: "challenge-checkin",
              title: "Challenge Check-in",
              message: `Don't forget to check in on your challenge: ${challenge.title}`,
              data: { challengeId: challenge.id, challengeTitle: challenge.title }
            });
          }
        }
      }
    });
  }

  private checkStreakWarnings(habits: Habit[]) {
    habits.forEach(habit => {
      if (habit.streak > 0 && !habit.completedToday) {
        // Check if we already sent a streak warning for this habit
        const existingNotification = this.notifications.find(
          n => n.data?.habitId === habit.id && 
               n.type === "streak-warning" &&
               !n.read // Only if not yet read
        );

        if (!existingNotification) {
          this.createNotification({
            type: "streak-warning",
            title: "Streak Warning!",
            message: `Your ${habit.name} streak of ${habit.streak} days is at risk! Complete it today to keep it going.`,
            data: { habitId: habit.id, habitName: habit.name, currentStreak: habit.streak }
          });
        }
      }
    });
  }

  private checkMilestoneAchievements(challenges: Challenge[]) {
    challenges.forEach(challenge => {
      if (challenge.milestones) {
        challenge.milestones.forEach((milestone: {
    id: string;
    title: string;
    description: string;
    targetValue: number;
    currentValue: number;
    achieved: boolean;
    achievedDate?: string;
    color: string;
  }) => {
          if (milestone.achieved && !milestone.achievedDate) {
            // Check if we already sent a notification for this milestone
            const existingNotification = this.notifications.find(
              n => n.data?.milestoneId === milestone.id && 
                   n.type === "milestone-achievement"
            );

            if (!existingNotification) {
              this.createNotification({
                type: "milestone-achievement",
                title: "Milestone Achieved!",
                message: `Congratulations! You've achieved the milestone "${milestone.title}" in your challenge "${challenge.title}"`,
                data: { 
                  milestoneId: milestone.id, 
                  milestoneTitle: milestone.title,
                  challengeId: challenge.id,
                  challengeTitle: challenge.title
                }
              });
            }
          }
        });
      }
    });
  }

  private scheduleDailySummary() {
    const now = new Date();
    const today = now.toDateString();
    
    // Check if we already sent a daily summary today
    const existingSummary = this.notifications.find(
      n => n.type === "daily-summary" &&
           n.timestamp.startsWith(today)
    );

    if (!existingSummary) {
      // Schedule the daily summary for early evening (6 PM)
      const summaryTime = new Date();
      summaryTime.setHours(18, 0, 0, 0); // 6 PM

      if (now.getHours() >= 18 && now.getMinutes() >= 0) {
        // If it's already past 6 PM, schedule for tomorrow
        summaryTime.setDate(summaryTime.getDate() + 1);
      }

      // Create a notification for the daily summary
      setTimeout(() => {
        this.createNotification({
          type: "daily-summary",
          title: "Daily Summary",
          message: "Review your productivity from today",
          data: { date: today }
        });
      }, summaryTime.getTime() - now.getTime());
    }
  }

  private scheduleWeeklyReport() {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Schedule for Sunday evening (for week ending)
    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + (7 - currentDay) % 7);
    nextSunday.setHours(18, 0, 0, 0); // 6 PM on Sunday

    // Check if we already sent a weekly report this week
    const lastWeek = new Date(now);
    lastWeek.setDate(now.getDate() - 7);
    const existingReport = this.notifications.find(
      n => n.type === "weekly-report" &&
           new Date(n.timestamp) > lastWeek
    );

    if (!existingReport) {
      setTimeout(() => {
        this.createNotification({
          type: "weekly-report",
          title: "Weekly Productivity Report",
          message: "Check your weekly progress and achievements",
          data: { week: nextSunday.toDateString() }
        });
      }, nextSunday.getTime() - now.getTime());
    }
  }

  private createNotification(notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>): Notification {
    const notification: Notification = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notificationData
    };

    this.notifications.push(notification);
    this.saveNotifications();

    // In a real app, we might use the browser's Notification API here
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id
      });
    }

    return notification;
  }

  private setupNotificationListeners() {
    // Request notification permission if not already granted
    // Only run in browser environment
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }
}

// Singleton instance
export const notificationService = NotificationService.getInstance();