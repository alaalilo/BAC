import type { AppState, Subject } from "../types";

export function getProgress(subjects: Subject[]) {
  const all = subjects.flatMap((subject) => subject.topics);
  const done = all.filter((topic) => topic.status === "done").length;
  return { done, total: all.length, percent: all.length ? Math.round(done / all.length * 100) : 0 };
}

/** Date keys are local calendar days, not UTC days. */
export function getDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addActivityMinutes(activity: Record<string, number>, minutes: number, date = new Date()) {
  const key = getDateKey(date);
  activity[key] = (activity[key] ?? 0) + Math.max(0, minutes);
  return activity;
}

export function recordStudyDay(studyDays: string[] = [], date = new Date()) {
  const key = getDateKey(date);
  return studyDays.includes(key) ? studyDays : [...studyDays, key];
}

/**
 * Counts the current run. When today has not been logged yet, yesterday's
 * run remains visible through the current day, giving the student time to
 * keep the streak alive. The activity map is also checked for older versions.
 */
export function getStreak(activity: Record<string, number>, today = new Date(), studyDays: string[] = []) {
  const recordedDays = new Set(studyDays);
  const isActive = (date: Date) => {
    const key = getDateKey(date);
    return recordedDays.has(key) || activity[key] > 0;
  };
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12);
  if (!isActive(cursor)) cursor.setDate(cursor.getDate() - 1);

  let streak = 0;
  while (isActive(cursor)) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function completeDailyTask(state: AppState, date = new Date()) {
  const today = getDateKey(date);
  if (state.dailyDate !== today) {
    state.dailyDate = today;
    state.dailyDone = 0;
  }
  state.dailyDone += 1;
  state.studyDays = recordStudyDay(state.studyDays, date);
}
