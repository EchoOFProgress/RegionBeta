import { Task, Habit } from "./types";

interface TriggerInput {
  tasks: Task[];
  habits: Habit[];
  goals: any[];
}

interface ScoredCard {
  cardId: string;
  score: number;
}

export type CardPolicy =
  | { type: "once" }
  | { type: "cooldown"; days: number };

// Determines how often a card can re-surface after being read.
// "once"    — never again after first read
// "cooldown"— reappears after N days if trigger still fires
export const CARD_POLICIES: Record<string, CardPolicy> = {
  "card-goals":                 { type: "once" },
  "card-habits":                { type: "cooldown", days: 30 },
  "card-streak":                { type: "cooldown", days: 30 },
  "card-twominute":             { type: "cooldown", days: 14 },
  "card-discipline-equation":   { type: "cooldown", days: 30 },
  "card-compounding":           { type: "cooldown", days: 14 },
  "card-regret-minimization":   { type: "cooldown", days: 21 },
  "card-goal-filter":           { type: "cooldown", days: 14 },
};

export function evaluateInsightTriggers({ tasks, habits, goals }: TriggerInput): string[] {
  const scored: ScoredCard[] = [];
  const now = new Date();
  const incompleteTasks = tasks.filter(t => !t.completed);

  // card-streak: habit had meaningful streak (>= 3) but is now at 0
  const brokenStreak = habits.find(h => h.bestStreak >= 3 && h.streak === 0);
  if (brokenStreak) scored.push({ cardId: "card-streak", score: 10 });

  // card-goals: user just wrote their very first goal
  if (goals.length === 1) scored.push({ cardId: "card-goals", score: 7 });

  // card-twominute: backlog piling up (10+ incomplete tasks)
  if (incompleteTasks.length >= 10) {
    scored.push({ cardId: "card-twominute", score: Math.min(10, 6 + Math.floor(incompleteTasks.length / 5)) });
  }

  // card-habits: very first habit with < 2 completions (onboarding moment)
  if (habits.length === 1 && habits[0].totalCompletions <= 1) {
    scored.push({ cardId: "card-habits", score: 9 });
  }

  // card-habits: habit repeatedly broken (has history but keeps resetting)
  const repeatedlyBroken = habits.find(h =>
    h.streak === 0 && h.totalCompletions >= 3 && (h.successRate ?? 100) < 50
  );
  if (repeatedlyBroken) scored.push({ cardId: "card-habits", score: 8 });

  // card-discipline-equation: persistent motivation problem (multiple fails, very low success)
  const disciplineProblem = habits.find(h =>
    h.streak === 0 && h.totalCompletions >= 5 && (h.successRate ?? 100) < 40
  );
  if (disciplineProblem) scored.push({ cardId: "card-discipline-equation", score: 9 });

  // card-compounding: no task completed in last 7 days (stagnation signal)
  if (tasks.length > 0) {
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const hasRecent = tasks.some(t => t.completed && t.completedAt && t.completedAt >= sevenDaysAgo);
    if (!hasRecent) scored.push({ cardId: "card-compounding", score: 6 });
  }

  // card-regret-minimization: 3+ tasks older than 14 days still pending
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const staleTasks = incompleteTasks.filter(t => t.createdAt && t.createdAt < twoWeeksAgo);
  if (staleTasks.length >= 3) scored.push({ cardId: "card-regret-minimization", score: 7 });

  // card-goal-filter: severe backlog — distraction/prioritization crisis
  if (incompleteTasks.length >= 15) scored.push({ cardId: "card-goal-filter", score: 7 });

  // Deduplicate: keep highest score per card, sort desc, top 3
  const best = new Map<string, number>();
  for (const { cardId, score } of scored) {
    best.set(cardId, Math.max(best.get(cardId) ?? 0, score));
  }

  return [...best.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id)
    .slice(0, 3);
}
