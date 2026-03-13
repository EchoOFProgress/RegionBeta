import { User, SelfRelianceAssessment, LongTermGoal, Chart64, RoutineCheckSheet, DiaryEntry, Achievement, UserStats } from "./types";
import { saveAssessment, saveLongTermGoal, saveChart, saveRoutineSheet, saveDiaryEntry, initializeAchievements, updateStats, addPoints } from "./storage";

export interface TestData {
  userId: string;
  assessments: SelfRelianceAssessment[];
  longTermGoals: LongTermGoal[];
  charts: Chart64[];
  routineSheets: RoutineCheckSheet[];
  diaryEntries: DiaryEntry[];
  achievements: Achievement[];
  stats: UserStats;
}

export const TEST_USERS: User[] = [
  {
    id: "test-user-1",
    name: "Test User",
    email: "test@example.com",
    createdAt: new Date().toISOString(),
  }
];

export const TEST_ASSESSMENTS: SelfRelianceAssessment[] = [
  {
    id: "test-assessment-1",
    userId: "test-user-1",
    answers: Array.from({length: 33}, (_, i) => ({
      questionId: i + 1,
      score: 3
    })),
    categories: {
      mentalAttitude: 7,
      healthManagement: 8,
      livingAttitude: 6,
      skills: 7,
    },
    totalScore: 28,
    completedAt: new Date().toISOString(),
  }
];

export const TEST_LONG_TERM_GOALS: LongTermGoal[] = [
  {
    id: "test-goal-1",
    userId: "test-user-1",
    goalDescription: "Stát se lepším programátorem",
    motivation: "Chci být schopen tvořit výkonné aplikace",
    currentState: "Základní znalosti JavaScriptu a Reactu",
    desiredState: "Pokročilý vývojář s hlubokými znalostmi",
    obstacles: ["Nedostatek času", "Nízká motivace"],
    resources: ["Online kurzy", "Knihy", "Mentor"],
    supporters: ["Rodina", "Kamarádi"],
    dailyHabits: ["Kódování 1h denně", "Čtení dokumentace"],
    weeklyMilestones: ["Dokončit 1 projekt", "Naučit se novou knihovnu"],
    monthlyTargets: ["Dokončit 4 projekty", "Zlepšit dovednosti o 20%"],
    targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const TEST_CHARTS: Chart64[] = [
  {
    id: "test-chart-1",
    userId: "test-user-1",
    longTermGoalId: "test-goal-1",
    centralGoal: "Stát se lepším programátorem",
    basicGoals: [
      { id: "basic-1", text: "Zlepšit JavaScript", category: "skill" },
      { id: "basic-2", text: "Naučit se React", category: "skill" },
      { id: "basic-3", text: "Zlepšit algoritmické myšlení", category: "skill" },
      { id: "basic-4", text: "Zlepšit zdraví", category: "health" },
      { id: "basic-5", text: "Zlepšit vztahy", category: "relationship" },
      { id: "basic-6", text: "Zlepšit finanční situaci", category: "financial" },
      { id: "basic-7", text: "Zlepšit životní styl", category: "lifestyle" },
      { id: "basic-8", text: "Zlepšit sebevědomí", category: "mental" },
    ],
    actionTasks: [
      { id: "task-1", basicGoalId: "basic-1", text: "Procvičit 10 algoritmů", completed: true },
      { id: "task-2", basicGoalId: "basic-1", text: "Napsat 100 řádků kódu", completed: true },
      { id: "task-3", basicGoalId: "basic-1", text: "Přečíst 1 kapitolu knihy", completed: false },
      { id: "task-4", basicGoalId: "basic-2", text: "Dokončit 1 React kurz", completed: true },
      { id: "task-5", basicGoalId: "basic-2", text: "Vytvořit 1 komponentu", completed: true },
      { id: "task-6", basicGoalId: "basic-3", text: "Vyřešit 5 problémů", completed: false },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const TEST_ROUTINE_SHEETS: RoutineCheckSheet[] = [
  {
    id: "routine-1",
    userId: "test-user-1",
    tasks: [
      { id: "task-1", name: "Ranní cvičení", category: "morning", isCustom: false },
      { id: "task-2", name: "Snídaně", category: "morning", isCustom: false },
      { id: "task-3", name: "Pracovní úkoly", category: "afternoon", isCustom: false },
      { id: "task-4", name: "Čtení knihy", category: "evening", isCustom: false },
    ],
    entries: [
      { date: new Date().toISOString().split('T')[0], taskId: "task-1", completed: true, note: "Dnes jsem se cítil skvěle" },
      { date: new Date().toISOString().split('T')[0], taskId: "task-2", completed: true },
      { date: new Date().toISOString().split('T')[0], taskId: "task-3", completed: false },
    ],
    createdAt: new Date().toISOString(),
  }
];

export const TEST_DIARY_ENTRIES: DiaryEntry[] = [
  {
    id: "diary-1",
    userId: "test-user-1",
    date: new Date().toISOString().split('T')[0],
    mood: 4,
    achievements: ["Dokončil jsem 1 projekt", "Naučil jsem se novou knihovnu"],
    challenges: ["Byl jsem unavený", "Měl jsem málo času"],
    gratitude: ["Zdraví", "Rodina", "Možnost se učit"],
    tomorrowGoals: ["Začít nový projekt", "Přečíst kapitolu"],
    reflection: "Dnes jsem se hodně naučil, ale měl jsem málo času na procvičování.",
    energyLevel: 7,
    productivityScore: 8,
    createdAt: new Date().toISOString(),
  }
];

export const TEST_ACHIEVEMENTS: Achievement[] = [
  {
    id: "achievement-1",
    name: "První krok",
    description: "Vytvořil jste svůj první cíl",
    icon: "🎯",
    unlockedAt: new Date().toISOString(),
    category: "milestone",
    requirement: 1,
    progress: 1,
  },
  {
    id: "achievement-2",
    name: "Denní šampión",
    description: "Dokončil jste denní rutinu",
    icon: "🏆",
    category: "completion",
    requirement: 1,
    progress: 1,
  }
];

export const TEST_STATS: UserStats = {
  totalDays: 10,
  currentStreak: 3,
  longestStreak: 7,
  tasksCompleted: 25,
  diaryEntries: 5,
  assessmentsCompleted: 1,
  goalsAchieved: 0,
  points: 150,
  level: 2,
};

export const loadTestData = (userId: string = "test-user-1"): TestData => {
  return {
    userId,
    assessments: TEST_ASSESSMENTS,
    longTermGoals: TEST_LONG_TERM_GOALS,
    charts: TEST_CHARTS,
    routineSheets: TEST_ROUTINE_SHEETS,
    diaryEntries: TEST_DIARY_ENTRIES,
    achievements: TEST_ACHIEVEMENTS,
    stats: TEST_STATS,
  };
};

export const saveTestData = (testData: TestData) => {
  // Save all test data to localStorage
  testData.assessments.forEach(assessment => saveAssessment(assessment));
  testData.longTermGoals.forEach(goal => saveLongTermGoal(goal));
  testData.charts.forEach(chart => saveChart(chart));
  testData.routineSheets.forEach(routine => saveRoutineSheet(routine));
  testData.diaryEntries.forEach(diary => saveDiaryEntry(diary));
  
  // Initialize achievements and stats
  initializeAchievements(testData.userId);
  
  // Update stats
  updateStats({
    totalDays: testData.stats.totalDays,
    currentStreak: testData.stats.currentStreak,
    longestStreak: testData.stats.longestStreak,
    tasksCompleted: testData.stats.tasksCompleted,
    diaryEntries: testData.stats.diaryEntries,
    assessmentsCompleted: testData.stats.assessmentsCompleted,
    goalsAchieved: testData.stats.goalsAchieved,
    points: testData.stats.points,
  });
};

export const initializeTestData = (userId: string = "test-user-1") => {
  const testData = loadTestData(userId);
  saveTestData(testData);
  return testData;
};