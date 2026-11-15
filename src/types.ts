export type Gender = "m" | "f";
export type StreamId = "sci" | "math" | "tech" | "eco" | "lit" | "lang";
export type Status = "todo" | "progress" | "done";
export type Theme = "dark" | "light";
export type Topic = { id: string; title: string; year?: string; status: Status; note?: string; url?: string };
export type Lesson = { id: string; title: string; status: Status; url?: string };
export type Subject = { id: string; name: string; coefficient: number; topics: Topic[]; lessons: Lesson[]; exercises?: Topic[] };
export type Term = {
  id: string; front: string; back: string; example?: string; subject: string;
  repetitions: number; interval: number; ease: number; due: string; mastered: boolean;
  language?: string;
};
export type Profile = { name: string; gender: Gender; stream: StreamId; thirdLanguage: "es" | "de" | "it" };
export type AppState = {
  version: 3; profile: Profile; theme: Theme; subjects: Subject[]; terms: Term[];
  grades: Record<string, string>; target: number; focusSessions: Record<string, number>;
  activity: Record<string, number>; xp: number; badges: string[]; dailyGoal: number;
  dailyDone: number; dailyDate: string; onboardingDone: boolean; legacyMasteredTermIds?: string[]; archivedSubjects?: Subject[];
};