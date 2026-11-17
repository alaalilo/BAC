import { describe, expect, it } from "vitest";
import { getDateKey, getProgress, getStreak, recordStudyDay } from "../lib/progress";
import { calculateAverage } from "../lib/calculator";
import type { Subject } from "../types";
const subjects: Subject[] = [{ id: "math", name: "رياضيات", coefficient: 5, lessons: [], topics: [
  { id: "1", title: "أ", status: "done" }, { id: "2", title: "ب", status: "todo" },
] }];
describe("progress", () => {
  it("calculates completion ratio", () => expect(getProgress(subjects)).toEqual({ done: 1, total: 2, percent: 50 }));
  it("calculates weighted average", () => expect(calculateAverage({ a: "12", b: "16" }, { a: 2, b: 2 })).toBe(14));
  it("counts consecutive active days", () => {
    const date = new Date(2026, 10, 15, 12);
    const activity = { "2026-11-15": 1, "2026-11-14": 1 };
    expect(getStreak(activity, date)).toBe(2);
  });
  it("keeps yesterday's streak available until the current day is over", () => {
    const today = new Date(2026, 10, 17, 9);
    const activity = { "2026-11-16": 1, "2026-11-15": 1, "2026-11-14": 1 };
    expect(getStreak(activity, today)).toBe(3);
  });
  it("resets after a missed calendar day", () => {
    const today = new Date(2026, 10, 17, 9);
    const activity = { "2026-11-15": 1, "2026-11-13": 1 };
    expect(getStreak(activity, today)).toBe(0);
  });
  it("uses local calendar date keys and records days once", () => {
    const localDate = new Date(2026, 10, 17, 0, 15);
    expect(getDateKey(localDate)).toBe("2026-11-17");
    expect(recordStudyDay(["2026-11-17"], localDate)).toEqual(["2026-11-17"]);
  });
});