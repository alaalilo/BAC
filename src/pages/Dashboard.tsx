import { useEffect, useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowUpLeft, BookOpen, Flame, Target, Trophy } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import type { AppState } from "../types";
import { getProgress, getStreak } from "../lib/progress";
export default function Dashboard({ state, setState, go }: { state: AppState; setState: (next: AppState) => void; go: (id: "subjects" | "terms" | "focus") => void }) {
  const [motivation, setMotivation] = useState("كل خطوة ثابتة تقرّبك من هدفك.");
  useEffect(() => { import("../data/motivations.json").then((module) => { const messages = module.default.motivations; setMotivation(messages[Math.floor(Math.random() * messages.length)] ?? ""); }); }, []);
  const progress = getProgress(state.subjects);
  const streak = getStreak(state.activity);
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - 6 + i);
    const key = d.toISOString().slice(0, 10);
    return { day: d.toLocaleDateString("ar-DZ", { weekday: "short" }), minutes: state.activity[key] ?? 0, key };
  }), [state.activity]);
  const greeting = state.profile.gender === "f" ? "أهلاً بكِ" : "أهلاً بك";
  const priorities = state.subjects.map((s) => ({ ...s, left: s.topics.filter((t) => t.status !== "done").length })).sort((a, b) => b.left * b.coefficient - a.left * a.coefficient).slice(0, 4);
  return <div className="stack-lg">
    <section className="welcome-panel">
      <div><span className="eyebrow">ملخص رحلتك</span><h1>{greeting}، {state.profile.name}</h1><p>كل جلسة مراجعة تقرّبك من هدفك. ابدأ من أولويتك اليوم.</p><button className="btn-primary" onClick={() => go("subjects")}>متابعة المراجعة <ArrowUpLeft size={17} /></button></div>
      <div className="welcome-symbol"><GraduationMark /></div>
    </section>
    <p className="motivation-quote">{motivation}</p>
    <section className="stats-grid">
      <Stat icon={<Target />} label="إنجاز المواضيع" value={`${progress.percent}%`} detail={`${progress.done} من ${progress.total} موضوع`} />
      <Stat icon={<Flame />} label="سلسلة النشاط" value={`${streak} يوم`} detail="أيام متتالية نشطة" />
      <Stat icon={<Trophy />} label="نقاط الخبرة" value={`${state.xp} XP`} detail={`${state.badges.length} شارة مكتسبة`} />
      <Stat icon={<BookOpen />} label="هدف اليوم" value={`${state.dailyDone}/${state.dailyGoal}`} detail="مهام مراجعة مكتملة" />
    </section>
    <div className="dashboard-grid">
      <section className="panel chart-panel"><div className="panel-heading"><div><span className="eyebrow">الاستمرارية</span><h2>نشاط آخر 7 أيام</h2></div><span className="tag">بالدقائق</span></div>
        <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={days}><defs><linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--accent)" stopOpacity={.25}/><stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="var(--border)" vertical={false}/><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }}/><Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, direction: "rtl" }}/><Area type="monotone" dataKey="minutes" stroke="var(--accent)" fill="url(#activityFill)" strokeWidth={2.5}/></AreaChart></ResponsiveContainer></div>
      </section>
      <section className="panel"><div className="panel-heading"><div><span className="eyebrow">الخطوة التالية</span><h2>أولويات المراجعة</h2></div></div><div className="priority-list">{priorities.map((s) => <button key={s.id} className="priority-row" onClick={() => go("subjects")}><span className="subject-glyph">{s.name.slice(0, 1)}</span><span className="priority-info"><b>{s.name}</b><small>{s.left} موضوع متبقٍ</small></span><span className="priority-coef">×{s.coefficient}</span></button>)}</div></section>
    </div>
    <section className="panel"><div className="panel-heading"><div><span className="eyebrow">هدف يومي</span><h2>إنجاز اليوم</h2></div><b className="accent-text">{Math.min(100, Math.round(state.dailyDone / Math.max(1, state.dailyGoal) * 100))}%</b></div><div className="progress-track"><i style={{ width: `${Math.min(100, state.dailyDone / Math.max(1, state.dailyGoal) * 100)}%` }}/></div><div className="goal-actions"><span className="muted">أكمل مهمة مراجعة لتحديث تقدمك.</span><button className="btn-secondary" onClick={() => { const next = structuredClone(state); next.dailyDone += 1; next.xp += 10; next.activity[new Date().toISOString().slice(0,10)] = (next.activity[new Date().toISOString().slice(0,10)] ?? 0) + 15; setState(next); }}>+ تسجيل إنجاز</button></div></section>
  </div>;
}
function Stat({ icon, label, value, detail }: { icon: ReactNode; label: string; value: string; detail: string }) {
  return <motion.article className="stat-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><span className="stat-icon">{icon}</span><small>{label}</small><strong>{value}</strong><span className="muted">{detail}</span></motion.article>;
}
function GraduationMark() { return <div className="hero-orbit"><div className="hero-core"><GraduationIcon /></div><i/><i/><i/></div>; }
function GraduationIcon() { return <BookOpen size={48} strokeWidth={1.3}/>; }