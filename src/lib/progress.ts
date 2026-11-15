import type { Subject } from "../types";
export function getProgress(subjects: Subject[]) {
  const all = subjects.flatMap((subject) => subject.topics);
  const done = all.filter((topic) => topic.status === "done").length;
  return { done, total: all.length, percent: all.length ? Math.round(done / all.length * 100) : 0 };
}
export function getStreak(activity: Record<string, number>, today = new Date()) {
  let streak = 0;
  const cursor = new Date(today);
  for (;;) {
    const key = cursor.toISOString().slice(0, 10);
    if (!activity[key]) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}