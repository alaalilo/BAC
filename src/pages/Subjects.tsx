import { useEffect, useMemo, useState } from "react";
import { Check, Circle, Clock3, Plus, ExternalLink, Trash2, Search } from "lucide-react";
import { CustomIcon, subjectIconName } from "../components/CustomIcon";
import { completeDailyTask, recordStudyDay } from "../lib/progress";
import type { AppState, Status } from "../types";
const labels: Record<Status, string> = { todo: "لم أبدأ", progress: "قيد المراجعة", done: "مكتمل" };
type ResourceSet = { bac: Record<string, string>; exams: Record<string, string[]>; lessons: { title: string; url: string }[] };
const resourceKey: Record<string, string> = { ar: "arabic", fr: "french", en: "english", ph: "philosophy", hg: "history_geo", isl: "islamic", math: "math", L3: "spanish" };
export default function Subjects({ state, setState }: { state: AppState; setState: (s: AppState) => void }) {
  const [active, setActive] = useState(state.subjects[0]?.id ?? "");
  const [newLesson, setNewLesson] = useState("");
  const [topicSearch, setTopicSearch] = useState("");
  const [resources, setResources] = useState<Record<string, ResourceSet>>({});
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [resourcesError, setResourcesError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    import("../data/resources.json")
      .then((module) => { if (active) setResources(module.default as Record<string, ResourceSet>); })
      .catch(() => { if (active) setResourcesError("تعذر تحميل روابط المصادر. أعد تحميل الصفحة للمحاولة مرة أخرى."); })
      .finally(() => { if (active) setResourcesLoading(false); });
    return () => { active = false; };
  }, []);
  const subject = state.subjects.find((s) => s.id === active) ?? state.subjects[0];
  const update = (topicId: string, status: Status) => {
    const next = structuredClone(state); const topic = next.subjects.find((s) => s.id === active)?.topics.find((t) => t.id === topicId);
    if (topic) { const newlyDone = status === "done" && topic.status !== "done"; topic.status = status; if (newlyDone) { next.xp += 15; completeDailyTask(next); } setState(next); }
  };
  const addLesson = () => {
    if (!newLesson.trim() || !subject) return;
    const next = structuredClone(state); next.subjects.find((s) => s.id === active)?.lessons.push({ id: crypto.randomUUID(), title: newLesson.trim(), status: "todo" }); setState(next); setNewLesson("");
  };
  const updateLesson = (lessonId: string, status: Status) => {
    const next = structuredClone(state); const lesson = next.subjects.find((s) => s.id === active)?.lessons.find((item) => item.id === lessonId);
    if (lesson) { const newlyDone = status === "done" && lesson.status !== "done"; lesson.status = status; if (newlyDone) next.studyDays = recordStudyDay(next.studyDays); setState(next); }
  };
  const updateExercise = (id: string, title: string, url: string, status: Status) => {
    const next = structuredClone(state);
    const selected = next.subjects.find((item) => item.id === active);
    if (!selected) return;
    selected.exercises ??= [];
    const existing = selected.exercises.find((item) => item.id === id || (Boolean(url) && item.url === url));
    const newlyDone = status === "done" && existing?.status !== "done";
    if (existing) existing.status = status;
    else selected.exercises.push({ id, title, url, status });
    if (newlyDone) next.studyDays = recordStudyDay(next.studyDays);
    setState(next);
  };
  const deleteLesson = (lessonId: string) => { const next = structuredClone(state); const selected = next.subjects.find((s) => s.id === active); if (selected) selected.lessons = selected.lessons.filter((lesson) => lesson.id !== lessonId); setState(next); };
  const visibleTopics = useMemo(() => subject?.topics.filter((topic) => topic.title.toLocaleLowerCase().includes(topicSearch.toLocaleLowerCase())) ?? [], [subject, topicSearch]);
  const key = subject ? (subject.id === "L3" ? state.profile.thirdLanguage === "es" ? "spanish" : state.profile.thirdLanguage : resourceKey[subject.id]) : undefined;
  const resource = key ? resources[key] : undefined;
  const resourceExamUrls = new Set(resource ? Object.values(resource.exams).flat() : []);
  const savedExercises = (subject?.exercises ?? []).filter((item) => !item.url || !resourceExamUrls.has(item.url));
  return <div className="stack-lg"><div className="page-intro"><span className="eyebrow">تنظيم الدراسة</span><h1>موادي</h1><p>تابع مواضيع البكالوريا والدروس الإضافية والفروض مع روابط البحث والمصادر.</p></div>
    <div className="subject-tabs">{state.subjects.map((s) => <button key={s.id} className={active === s.id ? "subject-tab active" : "subject-tab"} onClick={() => { setActive(s.id); setTopicSearch(""); }}><CustomIcon name={subjectIconName(s.id)} size={17}/><span>{s.name}</span></button>)}</div>
    {subject && <section className="panel"><div className="panel-heading"><div><span className="eyebrow">المادة المختارة</span><h2>{subject.name}</h2></div><span className="tag">المعامل ×{subject.coefficient}</span></div>
      <div className="search-field"><Search size={16}/><input dir="auto" value={topicSearch} onChange={(e) => setTopicSearch(e.target.value)} placeholder="ابحث داخل المواضيع"/></div>
      <div className="topic-list">{visibleTopics.map((topic) => <article className="topic-row" key={topic.id}><div className={`status-dot ${topic.status}`}>{topic.status === "done" ? <Check size={14}/> : topic.status === "progress" ? <Clock3 size={14}/> : <Circle size={12}/>}</div><div className="topic-main"><b>{topic.title}</b><small>{labels[topic.status]}</small>{topic.note && <p>{topic.note}</p>}<a href={topic.url ?? `https://www.google.com/search?q=${encodeURIComponent(`site:dzexams.com ${subject.name} ${topic.title}`)}`} target="_blank" rel="noreferrer">بحث عن الموضوع <ExternalLink size={12}/></a></div><select aria-label={`حالة ${topic.title}`} value={topic.status} onChange={(e) => update(topic.id, e.target.value as Status)}>{Object.entries(labels).map(([status, label]) => <option key={status} value={status}>{label}</option>)}</select></article>)}</div>
      {resourcesLoading && <p className="field-hint" role="status">جارٍ تحميل روابط المصادر...</p>}
      {resourcesError && <p className="field-hint" role="alert">{resourcesError}</p>}
      {resource && <div className="add-lesson"><h3>مصادر DzExams والموارد</h3><div className="resource-links"><b>مواضيع البكالوريا حسب السنة</b><div className="subject-tabs">{Object.entries(resource.bac).sort(([a], [b]) => Number(a) - Number(b)).map(([year, url]) => <a className="subject-tab" key={year} href={url} target="_blank" rel="noreferrer">{year}</a>)}</div><b>الدروس والملخصات</b>{resource.lessons.map((lesson) => <a className="lesson-chip" key={lesson.url} href={lesson.url} target="_blank" rel="noreferrer">{lesson.title} <ExternalLink size={13}/></a>)}<b>الفروض والاختبارات</b>{Object.entries(resource.exams).map(([term, urls]) => <div className="exam-group" key={term}><small>{term}</small>{urls.map((url, index) => {
          const id = `${subject.id}-exam-${term}-${index}`;
          const title = `فرض ${index + 1} · ${term}`;
          const savedExercise = subject.exercises?.find((item) => item.id === id || item.url === url);
          return <div className="exam-row" key={url}><a className="lesson-chip" href={url} target="_blank" rel="noreferrer">{title} <ExternalLink size={13}/></a><select aria-label={`حالة ${title}`} value={savedExercise?.status ?? "todo"} onChange={(event) => updateExercise(id, title, url, event.target.value as Status)}>{Object.entries(labels).map(([status, label]) => <option key={status} value={status}>{label}</option>)}</select></div>;
        })}</div>)}</div></div>}
      {savedExercises.length > 0 && <div className="add-lesson"><h3>فروضي المحفوظة من النسخة السابقة</h3>{savedExercises.map((exercise) => <div className="exam-row" key={exercise.id}>{exercise.url ? <a className="lesson-chip" href={exercise.url} target="_blank" rel="noreferrer">{exercise.title} <ExternalLink size={13}/></a> : <span className="lesson-chip">{exercise.title}</span>}<select aria-label={`حالة ${exercise.title}`} value={exercise.status} onChange={(event) => updateExercise(exercise.id, exercise.title, exercise.url ?? "", event.target.value as Status)}>{Object.entries(labels).map(([status, label]) => <option key={status} value={status}>{label}</option>)}</select></div>)}</div>}
      <div className="add-lesson"><h3>دروسي الإضافية</h3><div className="inline-form"><input value={newLesson} onChange={(e) => setNewLesson(e.target.value)} placeholder="عنوان الدرس الجديد"/><button className="btn-primary" onClick={addLesson} aria-label="إضافة درس"><Plus size={17}/></button></div>{subject.lessons.map((lesson) => <div className="lesson-chip lesson-row" key={lesson.id}>{lesson.url ? <a href={lesson.url} target="_blank" rel="noreferrer">{lesson.title} <ExternalLink size={13}/></a> : <span>{lesson.title}</span>}<select aria-label={`حالة الدرس ${lesson.title}`} value={lesson.status} onChange={(e) => updateLesson(lesson.id, e.target.value as Status)}>{Object.entries(labels).map(([status, label]) => <option key={status} value={status}>{label}</option>)}</select><button className="btn-quiet" onClick={() => deleteLesson(lesson.id)} aria-label={`حذف ${lesson.title}`}><Trash2 size={15}/></button></div>)}</div>
    </section>}
  </div>;
}
