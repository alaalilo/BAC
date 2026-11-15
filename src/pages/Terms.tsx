import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BookOpenCheck, RotateCcw, Volume2, Plus, Search, Brain, CheckCircle2, ArrowLeftRight } from "lucide-react";
import type { AppState, Term } from "../types";
import { createTerm } from "../lib/storage";
import { reviewTerm } from "../lib/spacedRepetition";

type LanguageCard = { id: string; term: string; translation?: string; example?: string; explanation?: string };
type PersonCard = { id: string; name: string; role: string };
type DateCard = { id: string; date: string; event: string };
type SourceTerms = {
  spanish: { label: string; items: LanguageCard[] };
  english: { label: string; items: LanguageCard[] };
  french: { label: string; items: LanguageCard[] };
  history: { label: string; persons: PersonCard[]; dates: DateCard[] };
  geography: { label: string; items: LanguageCard[] };
};
const categories = ["الكل", "الإنجليزية", "الفرنسية", "الإسبانية", "التاريخ", "الجغرافيا"] as const;
type Category = (typeof categories)[number];
const langFor: Record<string, string> = { الإنجليزية: "en", الفرنسية: "fr", الإسبانية: "es", التاريخ: "ar", الجغرافيا: "ar" };

function normalizeForSearch(value: string): string {
  return value.toLocaleLowerCase().normalize("NFD")
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function buildCards(data: SourceTerms): Term[] {
  const result: Term[] = [];
  for (const [key, label] of [["english", "الإنجليزية"], ["french", "الفرنسية"], ["spanish", "الإسبانية"], ["geography", "الجغرافيا"]] as const) {
    const section = data[key];
    for (const item of section.items) {
      result.push({ id: item.id, front: item.term, back: [item.translation, item.explanation].filter(Boolean).join("\n\n"), example: item.example, subject: label, language: langFor[label], repetitions: 0, interval: 0, ease: 2.5, due: new Date().toISOString().slice(0, 10), mastered: false });
    }
  }
  for (const person of data.history.persons) result.push({ id: person.id, front: person.name, back: person.role, subject: "التاريخ", language: "ar", repetitions: 0, interval: 0, ease: 2.5, due: new Date().toISOString().slice(0, 10), mastered: false });
  for (const date of data.history.dates) result.push({ id: date.id, front: date.date, back: date.event, subject: "التاريخ", language: "ar", repetitions: 0, interval: 0, ease: 2.5, due: new Date().toISOString().slice(0, 10), mastered: false });
  return result;
}

export default function Terms({ state, setState }: { state: AppState; setState: (s: AppState) => void }) {
  const [catalog, setCatalog] = useState<Term[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [category, setCategory] = useState<Category>("الكل");
  const [search, setSearch] = useState("");
  const [flipped, setFlipped] = useState(false);
  const [quizMode, setQuizMode] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [customOnly, setCustomOnly] = useState(false);
  useEffect(() => {
    let active = true;
    import("../data/terms.json")
      .then((module) => { if (active) setCatalog(buildCards(module.default as SourceTerms)); })
      .catch(() => { if (active) setCatalogError("تعذر تحميل بنك المصطلحات. تحقق من اتصال الصفحة ثم أعد تحميلها."); })
      .finally(() => { if (active) setCatalogLoading(false); });
    return () => { active = false; };
  }, []);

  const allCards = useMemo(() => {
    const saved = new Map(state.terms.map((term) => [term.id, term]));
    const legacyMastered = new Set(state.legacyMasteredTermIds ?? []);
    const merged = catalog.map((term) => ({ ...term, mastered: legacyMastered.has(term.id), ...(saved.get(term.id) ?? {}) }));
    const catalogIds = new Set(catalog.map((term) => term.id));
    const custom = state.terms.filter((term) => !catalogIds.has(term.id));
    return [...merged, ...custom];
  }, [catalog, state.terms, state.legacyMasteredTermIds]);
  const catalogIds = useMemo(() => new Set(catalog.map((item) => item.id)), [catalog]);
  const searchIndex = useMemo(() => allCards.map((term) => ({ term, text: normalizeForSearch(`${term.front} ${term.back}`) })), [allCards]);
  const normalizedSearch = normalizeForSearch(search);
  const filtered = useMemo(() => searchIndex
    .filter(({ term, text }) => (category === "الكل" || term.subject === category)
      && (!customOnly || !catalogIds.has(term.id))
      && text.includes(normalizedSearch))
    .map(({ term }) => term), [searchIndex, category, customOnly, catalogIds, normalizedSearch]);
  const due = filtered.filter((term) => term.due <= new Date().toISOString().slice(0, 10) && !term.mastered);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const term = filtered.find((item) => item.id === currentId) ?? due[0] ?? filtered[0];
  const quizOptions = useMemo(() => {
    if (!term) return [];
    const distractors = allCards.filter((item) => item.id !== term.id && item.subject === term.subject).sort((a, b) => a.id.localeCompare(b.id)).slice(0, 3);
    return [...distractors, term].sort((a, b) => a.id.localeCompare(b.id));
  }, [allCards, term]);

  const persistReview = (updated: Term, quality: number) => {
    const next = structuredClone(state);
    const index = next.terms.findIndex((item) => item.id === updated.id);
    if (index >= 0) next.terms[index] = updated; else next.terms.push(updated);
    next.xp += quality >= 3 ? 5 : 1;
    setState(next);
    setCurrentId(null); setFlipped(false); setAnswer(null);
  };
  const rate = (quality: number) => { if (term) persistReview({ ...term, ...reviewTerm(term, quality) }, quality); };
  const add = () => {
    if (!front.trim() || !back.trim()) return;
    const next = structuredClone(state); next.terms.push({ ...createTerm(front.trim(), back.trim(), category === "الكل" ? "عام" : category), id: `custom-${crypto.randomUUID()}`, language: "ar" });
    setState(next); setFront(""); setBack("");
  };
  const speak = () => {
    if (!term || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(term.front);
    utterance.lang = term.language ?? "ar";
    window.speechSynthesis.speak(utterance);
  };
  const nextQuiz = () => {
    const index = due.findIndex((item) => item.id === term?.id);
    const next = due[(index + 1) % Math.max(1, due.length)];
    setCurrentId(next?.id ?? null);
    setAnswer(null);
  };
  const selectAnswer = (id: string) => {
    if (answer || !term) return;
    setAnswer(id);
    if (id === term.id) {
      const updated = { ...term, ...reviewTerm(term, 4) };
      const next = structuredClone(state);
      const index = next.terms.findIndex((item) => item.id === updated.id);
      if (index >= 0) next.terms[index] = updated; else next.terms.push(updated);
      next.xp += 5;
      setState(next);
    }
  };

  return <div className="stack-lg">
    <div className="page-intro"><span className="eyebrow">استرجاع نشط</span><h1>بنك المصطلحات</h1><p>المحتوى الأصلي: اللغات الثلاث، التاريخ والجغرافيا، مع مراجعة متباعدة واختبار سريع.</p></div>
    <section className="panel term-panel">
      <div className="panel-heading"><div><span className="eyebrow">المكتبة المستعادة</span><h2>{allCards.length} بطاقة متاحة</h2></div><span className="tag"><BookOpenCheck size={14}/> {due.length} للمراجعة</span></div>
      <div className="search-field"><Search size={16}/><input dir="auto" value={search} onChange={(e) => { setSearch(e.target.value); setCurrentId(null); }} placeholder="ابحث عن مصطلح أو تعريف"/></div>
      <div className="subject-tabs">{categories.map((item) => <button key={item} className={category === item ? "subject-tab active" : "subject-tab"} onClick={() => { setCategory(item); setCurrentId(null); setAnswer(null); }}>{item}</button>)}</div>
      <div className="term-actions"><button className={!quizMode ? "btn-primary" : "btn-secondary"} onClick={() => { setQuizMode(false); setAnswer(null); }}><ArrowLeftRight size={15}/> البطاقات</button><button className={quizMode ? "btn-primary" : "btn-secondary"} onClick={() => { setQuizMode(true); setAnswer(null); }}><Brain size={15}/> اختبار سريع</button><button className={customOnly ? "btn-primary" : "btn-quiet"} onClick={() => setCustomOnly(!customOnly)}>بطاقاتي فقط</button></div>
      {catalogLoading ? <div className="page-loading" role="status">جارٍ تحميل المصطلحات الأصلية...</div> : catalogError ? <div className="empty-state" role="alert">{catalogError}</div> : term ? quizMode ? <div className="quiz-card"><span className="eyebrow">اختر الترجمة أو التعريف الصحيح</span><h2 dir="auto">{term.front}</h2><div className="quiz-options">{quizOptions.map((option) => <button key={option.id} className={`quiz-option ${answer === option.id ? (option.id === term.id ? "correct" : "incorrect") : ""}`} disabled={Boolean(answer)} onClick={() => selectAnswer(option.id)}>{option.back.split("\n")[0]}</button>)}</div>{answer && <div className="quiz-feedback"><b>{answer === term.id ? "إجابة صحيحة" : "الإجابة الصحيحة"}</b><p>{term.back}</p><button className="btn-primary" onClick={nextQuiz}>السؤال التالي</button></div>}</div> : <>
        <motion.button dir="auto" className={`flashcard ${flipped ? "flipped" : ""}`} onClick={() => setFlipped(!flipped)} whileTap={{ scale: .985 }} aria-label="قلب البطاقة"><small>{flipped ? "التعريف" : term.subject}</small><strong dir="auto">{flipped ? term.back : term.front}</strong>{term.example && flipped && <span dir="auto">{term.example}</span>}<span>اضغط لقلب البطاقة</span></motion.button>
        <div className="term-actions"><button className="btn-quiet" onClick={speak}><Volume2 size={16}/> نطق</button><button className="btn-secondary" onClick={() => rate(1)}><RotateCcw size={15}/> صعب</button><button className="btn-primary" onClick={() => rate(4)}><CheckCircle2 size={15}/> أتقنتها</button></div>
      </> : <div className="empty-state"><BookOpenCheck size={32}/><b>لا توجد نتائج</b><span>غيّر التصنيف أو عبارة البحث.</span></div>}
    </section>
    <section className="panel"><div className="panel-heading"><div><span className="eyebrow">توسيع بنكك</span><h2>إضافة بطاقة شخصية</h2></div></div><div className="form-grid"><label>المصطلح<input value={front} onChange={(e) => setFront(e.target.value)} placeholder="المصطلح أو التاريخ"/></label><label>التعريف<input value={back} onChange={(e) => setBack(e.target.value)} placeholder="الترجمة أو الشرح"/></label></div><button className="btn-primary" onClick={add}><Plus size={16}/> إضافة إلى البنك</button></section>
  </div>;
}
