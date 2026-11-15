import type { Term } from "../types";
// SM-2 مبسط: quality 0..5؛ الإجابة الصحيحة المتقنة تزيد الفاصل، والخاطئة تعيد البطاقة قريباً.
export function reviewTerm(term: Term, quality: number, now = new Date()): Term {
  const q = Math.max(0, Math.min(5, quality));
  const repetitions = q < 3 ? 0 : term.repetitions + 1;
  const ease = Math.max(1.3, term.ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
  const interval = q < 3 ? 1 : repetitions === 1 ? 1 : repetitions === 2 ? 6 : Math.round(term.interval * ease);
  const due = new Date(now);
  due.setDate(due.getDate() + interval);
  return { ...term, repetitions, ease, interval, due: due.toISOString().slice(0, 10), mastered: repetitions >= 3 };
}