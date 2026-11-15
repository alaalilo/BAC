import type { AppState, Profile, Subject, Term } from "../types";
import { coefficients } from "../data/coefficients";
import { subjectIds, subjects as subjectNames } from "../data/streams";
export const STORAGE_KEY = "bacStandard_v3";
export const LEGACY_STORAGE_KEYS = ["bacStandard_v1"] as const;
const today = () => new Date().toISOString().slice(0, 10);
export function createSubjects(profile: Profile): Subject[] {
  const ids = subjectIds[profile.stream];
  return ids.map((id) => ({
    id, name: id === "L3" ? `اللغة الثالثة (${profile.thirdLanguage === "es" ? "الإسبانية" : profile.thirdLanguage === "de" ? "الألمانية" : "الإيطالية"})` : subjectNames[id],
    coefficient: coefficients[profile.stream][id] ?? 1,
    topics: ["2025", "2024", "2023", "2022", "2021"].map((year) => ({
      id: `${id}-${year}`, title: `موضوع بكالوريا ${year}`, year, status: "todo",
    })),
    lessons: [],
    exercises: [],
  }));
}
export function createInitialState(profile: Profile): AppState {
  return {
    version: 3, profile, theme: "dark", subjects: createSubjects(profile), terms: [],
    grades: {}, target: 14, focusSessions: {}, activity: {}, xp: 0, badges: [],
    dailyGoal: 3, dailyDone: 0, dailyDate: today(), onboardingDone: true,
    archivedSubjects: [], legacyMasteredTermIds: [],
  };
}
function normalizeProfile(value: unknown): Profile | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<Profile> & { lang?: string };
  if (typeof candidate.name !== "string"
    || !["sci", "math", "tech", "eco", "lit", "lang"].includes(candidate.stream ?? "")
    || !["m", "f"].includes(candidate.gender ?? "")) return null;
  const language = candidate.thirdLanguage ?? candidate.lang ?? "es";
  return {
    name: candidate.name,
    gender: candidate.gender as Profile["gender"],
    stream: candidate.stream as Profile["stream"],
    thirdLanguage: ["es", "de", "it"].includes(language) ? language as Profile["thirdLanguage"] : "es",
  };
}

function migrate(raw: Record<string, unknown>): AppState | null {
  const profile = normalizeProfile(raw.profile);
  if (!profile) return null;

  if (raw.version === 3 || raw.version === 2) {
    const current = raw as unknown as AppState;
    if (!Array.isArray(current.subjects)) return null;
    const subjects = current.subjects.map((subject) => ({
      ...subject,
      lessons: (Array.isArray(subject.lessons) ? subject.lessons : []).map((lesson, index) =>
        typeof lesson === "string"
          ? { id: `${subject.id}-lesson-${index}`, title: lesson, status: "todo" as const }
          : { ...lesson, status: lesson.status ?? "todo" as const },
      ),
      topics: Array.isArray(subject.topics) ? subject.topics : [],
      exercises: Array.isArray(subject.exercises) ? subject.exercises : [],
    }));
    return {
      ...createInitialState(profile),
      ...current,
      version: 3,
      subjects,
      terms: Array.isArray(current.terms) ? current.terms : [],
      grades: current.grades ?? {},
      focusSessions: current.focusSessions ?? current.activity ?? {},
      activity: current.activity ?? {},
      badges: current.badges ?? [],
      legacyMasteredTermIds: Array.isArray(current.legacyMasteredTermIds) ? current.legacyMasteredTermIds : [],
      archivedSubjects: Array.isArray(current.archivedSubjects) ? current.archivedSubjects : [],
    };
  }

  // ترحيل بنية الإصدار الأول مع الاحتفاظ بالموضوعات والمواد والتقدم المتاح.
  const base = createInitialState(profile);
  const oldSubjects = raw.subjects as Record<string, {
    topics?: Record<string, { title?: string; status?: "todo" | "progress" | "done"; examUrl?: string; url?: string }>;
    exercises?: Record<string, Array<{ title?: string; status?: "todo" | "progress" | "done"; examUrl?: string; url?: string }>>;
    lessons?: Record<string, { title?: string; status?: "todo" | "progress" | "done"; url?: string }>;
  }> | undefined;
  if (oldSubjects) {
    base.subjects = base.subjects.map((subject) => {
      const old = oldSubjects[subject.id] ?? (subject.id === "L3" ? oldSubjects[profile.thirdLanguage] : undefined);
      if (!old) return subject;
      const oldTopics = Object.entries(old.topics ?? {});
      return {
        ...subject,
        topics: oldTopics.length ? oldTopics.map(([id, item]) => ({
          id: `${subject.id}-${id}`, title: item.title ?? `موضوع ${id}`, status: item.status ?? "todo",
          url: item.examUrl ?? item.url,
        })) : subject.topics,
        exercises: Object.entries(old.exercises ?? {}).flatMap(([term, items]) => items.map((item, index) => ({
          id: `${subject.id}-exercise-${term}-${index}`, title: item.title ?? `فرض ${term} · ${index + 1}`,
          status: item.status ?? "todo", url: item.examUrl ?? item.url,
        }))),
        lessons: Object.entries(old.lessons ?? {}).map(([id, lesson]) => ({ id: `${subject.id}-lesson-${id}`, title: lesson.title ?? "درس مضاف", status: lesson.status ?? "todo", url: lesson.url })),
      };
    });
  }
  base.grades = (raw.calculatorGrades as Record<string, string>) ?? {};
  base.activity = (raw.activity as Record<string, number>) ?? {};
  base.focusSessions = (raw.focus as Record<string, number>) ?? {};
  base.theme = raw.theme === "light" ? "light" : "dark";
  const memorized = raw.vocabMemorized as Record<string, Record<string, boolean>> | undefined;
  base.legacyMasteredTermIds = memorized
    ? Object.values(memorized).flatMap((items) => Object.entries(items ?? {}).filter(([, mastered]) => mastered).map(([id]) => id))
    : [];
  return base;
}

export type StorageWarning = string | null;
export type LoadStateResult = { state: AppState | null; warning: StorageWarning };
export type SaveStateResult = { ok: true } | { ok: false; warning: string };

export function restoreBackup(value: unknown): AppState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return migrate(value as Record<string, unknown>);
}

export function loadState(): LoadStateResult {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
      ?? LEGACY_STORAGE_KEYS.map((key) => localStorage.getItem(key)).find((value) => value !== null)
      ?? null;
    if (!raw) return { state: null, warning: null };
    const parsed = migrate(JSON.parse(raw) as Record<string, unknown>);
    return parsed
      ? { state: parsed, warning: null }
      : { state: null, warning: "تعذر قراءة بيانات الحفظ القديمة. لم يتم حذف الملف؛ صدّر نسخة احتياطية إن كانت لديك نسخة صالحة." };
  } catch (error) {
    const warning = error instanceof DOMException && error.name === "SecurityError"
      ? "المتصفح منع الوصول إلى التخزين المحلي. قد لا يُحفظ تقدمك على هذا الجهاز."
      : "تعذرت قراءة بياناتك المحلية بسبب خطأ في التخزين أو تلف البيانات.";
    return { state: null, warning };
  }
}

export function saveState(state: AppState): SaveStateResult {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return { ok: true };
  } catch (error) {
    const quotaExceeded = error instanceof DOMException
      && (error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED");
    return {
      ok: false,
      warning: quotaExceeded
        ? "مساحة التخزين المحلي ممتلئة. تقدمك الحالي ظاهر في هذه الجلسة لكنه لم يُحفظ؛ صدّر نسخة JSON واحذف بيانات غير ضرورية من المتصفح."
        : "رفض المتصفح حفظ البيانات. تحقق من إعدادات الخصوصية أو وضع التصفح الخاص، وصدّر نسخة احتياطية.",
    };
  }
}

export function todayKey() { return today(); }
export function createTerm(front: string, back: string, subject: string): Term {
  return { id: crypto.randomUUID(), front, back, subject, repetitions: 0, interval: 0, ease: 2.5, due: today(), mastered: false };
}