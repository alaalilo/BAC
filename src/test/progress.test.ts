import { describe, expect, it } from "vitest";
import { getProgress, getStreak } from "../lib/progress";
import { calculateAverage } from "../lib/calculator";
import type { Subject } from "../types";
const subjects: Subject[] = [{ id: "math", name: "رياضيات", coefficient: 5, lessons: [], topics: [
  { id: "1", title: "أ", status: "done" }, { id: "2", title: "ب", status: "todo" },
] }];
describe("progress", () => {
  it("calculates completion ratio", () => expect(getProgress(subjects)).toEqual({ done: 1, total: 2, percent: 50 }));
  it("calculates weighted average", () => expect(calculateAverage({ a: "12", b: "16" }, { a: 2, b: 2 })).toBe(14));
  it("counts consecutive active days", () => {
    const date = new Date("2026-11-15T12:00:00"); const activity = { "2026-11-15": 1, "2026-11-14": 1 };
    expect(getStreak(activity, date)).toBe(2);
  });
});