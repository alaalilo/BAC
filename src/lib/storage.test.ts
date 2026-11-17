import { afterEach, describe, expect, it, vi } from "vitest";
import { loadState, restoreBackup, saveState } from "./storage";

const legacyState = {
  theme: "light",
  profile: { name: "طالب", gender: "m", stream: "lang", lang: "de" },
  subjects: {
    ar: { topics: {}, exercises: {}, lessons: {} },
    de: {
      topics: { "2025": { title: "موضوع 2025", status: "done", examUrl: "https://example.test/bac" } },
      exercises: { "الفصل الأول": [{ title: "فرض محفوظ", status: "progress", examUrl: "https://example.test/exam" }] },
      lessons: { lesson_1: { title: "درس محفوظ", status: "done", url: "https://example.test/lesson" } },
    },
  },
  calculatorGrades: { fr: "15" },
  vocabMemorized: { french: { "fr-001": true, "fr-002": false } },
  activity: { "2026-11-15": 12 },
  focus: { "2026-11-15": 25 },
};

afterEach(() => vi.unstubAllGlobals());

describe("local data resilience and legacy migration", () => {
  it("migrates original bacStandard_v1 profile, lesson, exam and vocabulary progress", () => {
    const localStorageMock = {
      getItem: (key: string) => key === "bacStandard_v1" ? JSON.stringify(legacyState) : null,
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    vi.stubGlobal("localStorage", localStorageMock);

    const result = loadState();
    expect(result.warning).toBeNull();
    expect(result.state?.version).toBe(3);
    expect(result.state?.profile.thirdLanguage).toBe("de");
    expect(result.state?.studyDays).toEqual([]);
    const french = result.state?.subjects.find((subject) => subject.id === "L3");
    expect(french?.topics[0].status).toBe("done");
    expect(french?.exercises?.[0].status).toBe("progress");
    expect(french?.lessons[0].status).toBe("done");
    expect(french?.lessons[0].url).toBe("https://example.test/lesson");
    expect(result.state?.legacyMasteredTermIds).toContain("fr-001");
    expect(result.state?.grades.fr).toBe("15");
  });

  it("restores the saved study-day streak from a version 3 backup", () => {
    const restored = restoreBackup({
      version: 3,
      profile: { name: "طالب", gender: "m", stream: "sci", thirdLanguage: "es" },
      subjects: [],
      terms: [],
      activity: {},
      studyDays: ["2026-11-15", "2026-11-16"],
    });
    expect(restored?.studyDays).toEqual(["2026-11-15", "2026-11-16"]);
  });

  it("returns a visible failure instead of silently swallowing quota errors", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => null,
      setItem: () => { throw new DOMException("Storage full", "QuotaExceededError"); },
    });
    const state = loadState().state;
    expect(state).toBeNull();
    const result = saveState({} as never);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.warning).toContain("ممتلئة");
  });
});
