import { useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowUpLeft, BookOpen, Check, Copy, Flame, Share2, Target, Trophy, X } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import type { AppState } from "../types";
import { completeDailyTask, getDateKey, getProgress, getStreak } from "../lib/progress";
import { CustomIcon, subjectIconName } from "../components/CustomIcon";

export default function Dashboard({ state, setState, go }: { state: AppState; setState: (next: AppState) => void; go: (id: "subjects" | "terms" | "focus") => void }) {
  const [shareOpen, setShareOpen] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const progress = getProgress(state.subjects);
  const streak = getStreak(state.activity, new Date(), state.studyDays ?? []);
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    const key = getDateKey(d);
    return { day: d.toLocaleDateString("ar-DZ", { weekday: "short" }), minutes: state.activity[key] ?? 0, key };
  }), [state.activity]);
  const priorities = state.subjects.map((s) => ({ ...s, left: s.topics.filter((t) => t.status !== "done").length })).sort((a, b) => b.left * b.coefficient - a.left * a.coefficient).slice(0, 4);
  const streakLabel = streak === 1 ? "يوم متتالٍ" : "أيام متتالية";
  const shareText = streak > 0
    ? `🔥 أحافظ على سلسلة دراسة لمدة ${streak} ${streakLabel} في منصة التفوق.\nكل يوم خطوة نحو هدف البكالوريا!\n#منصة_التفوق #BAC`
    : "📚 بدأت اليوم سلسلة دراستي مع منصة التفوق. كل يوم خطوة نحو هدف البكالوريا!\n#منصة_التفوق #BAC";

  const copyShareText = async () => {
    try {
      if (navigator.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(shareText);
      } else {
        const field = document.createElement("textarea");
        field.value = shareText;
        field.style.position = "fixed";
        field.style.opacity = "0";
        document.body.appendChild(field);
        field.select();
        const copied = document.execCommand("copy");
        field.remove();
        if (!copied) throw new Error("Clipboard unavailable");
      }
      setShareStatus("تم نسخ إنجازك، يمكنك مشاركته الآن.");
    } catch {
      setShareStatus("تعذر النسخ تلقائياً. حدّد النص الظاهر وانسخه يدوياً.");
    }
  };

  const shareNatively = async () => {
    if (!navigator.share) {
      await copyShareText();
      return;
    }
    try {
      await navigator.share({ title: "إنجازي الدراسي | منصة التفوق", text: shareText });
      setShareStatus("تمت مشاركة إنجازك.");
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      setShareStatus("لم تكتمل المشاركة. جرّب نسخ النص بدلاً من ذلك.");
    }
  };

  return <div className="stack-lg">
    <section className="welcome-panel">
      <div><span className="eyebrow">ملخص رحلتك</span><h1>مرحباً، {state.profile.name}</h1><p>تابع تقدمك وأكمل أهداف المراجعة اليومية.</p><button className="btn-primary" onClick={() => go("subjects")}>متابعة المراجعة <ArrowUpLeft size={17} /></button></div>
      <div className="welcome-symbol"><GraduationMark /></div>
    </section>
    <section className="stats-grid">
      <Stat icon={<Target />} label="إنجاز المواضيع" value={`${progress.percent}%`} detail={`${progress.done} من ${progress.total} موضوع`} />
      <article className="stat-card streak-stat">
        <span className="stat-icon"><Flame /></span>
        <small>سلسلة النشاط</small>
        <strong>{streak} يوم</strong>
        <span className="muted">{streak > 0 ? "استمر في المحافظة على تقدمك" : "ابدأ سلسلة نشاطك اليوم"}</span>
        <button className="streak-share-button" onClick={() => { setShareStatus(""); setShareOpen(true); }}><Share2 size={14}/> مشاركة السلسلة</button>
      </article>
      <Stat icon={<Trophy />} label="نقاط الخبرة" value={`${state.xp} XP`} detail={`${state.badges.length} شارة مكتسبة`} />
      <Stat icon={<BookOpen />} label="هدف اليوم" value={`${state.dailyDone}/${state.dailyGoal}`} detail="مهام مراجعة مكتملة" />
    </section>
    <div className="dashboard-grid">
      <section className="panel chart-panel"><div className="panel-heading"><div><span className="eyebrow">الاستمرارية</span><h2>نشاط آخر 7 أيام</h2></div><span className="tag">بالدقائق</span></div>
        <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={days}><defs><linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--accent)" stopOpacity={.25}/><stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="var(--border)" vertical={false}/><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }}/><Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, direction: "rtl" }}/><Area type="monotone" dataKey="minutes" stroke="var(--accent)" fill="url(#activityFill)" strokeWidth={2.5}/></AreaChart></ResponsiveContainer></div>
      </section>
      <section className="panel"><div className="panel-heading"><div><span className="eyebrow">الخطوة التالية</span><h2>أولويات المراجعة</h2></div></div><div className="priority-list">{priorities.map((s) => <button key={s.id} className="priority-row" onClick={() => go("subjects")}><span className="subject-glyph"><CustomIcon name={subjectIconName(s.id)} size={19}/></span><span className="priority-info"><b>{s.name}</b><small>{s.left} موضوع متبقٍ</small></span><span className="priority-coef">×{s.coefficient}</span></button>)}</div></section>
    </div>
    <section className="panel"><div className="panel-heading"><div><span className="eyebrow">هدف يومي</span><h2>إنجاز اليوم</h2></div><b className="accent-text">{Math.min(100, Math.round(state.dailyDone / Math.max(1, state.dailyGoal) * 100))}%</b></div><div className="progress-track"><i style={{ width: `${Math.min(100, state.dailyDone / Math.max(1, state.dailyGoal) * 100)}%` }}/></div><div className="goal-actions"><span className="muted">أكمل مهمة مراجعة لتحديث تقدمك.</span><button className="btn-secondary" onClick={() => { const next = structuredClone(state); completeDailyTask(next); next.xp += 10; setState(next); }}>+ تسجيل إنجاز</button></div></section>

    {shareOpen && <div className="share-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShareOpen(false); }}>
      <section className="share-dialog" role="dialog" aria-modal="true" aria-labelledby="share-title">
        <div className="share-dialog-heading"><div><span className="eyebrow">إنجاز يستحق المشاركة</span><h2 id="share-title">شارك سلسلة نشاطك</h2></div><button className="share-close" aria-label="إغلاق" onClick={() => setShareOpen(false)}><X size={18}/></button></div>
        <div className="streak-share-preview">
          <div className="share-brand"><span className="share-brand-mark"><img src={`${import.meta.env.BASE_URL}icons/icon.svg`} alt="" /></span><span>منصة التفوق</span></div>
          <div className="share-flame"><Flame size={28}/></div>
          <strong>{streak}</strong>
          <b>{streakLabel}</b>
          <p>{streak > 0 ? "كل يوم من الالتزام يقربني من هدفي." : "اليوم بداية جديدة نحو هدف البكالوريا."}</p>
          <span className="share-hashtag">#منصة_التفوق</span>
        </div>
        <div className="share-copy-preview"><small>النص الجاهز للمشاركة</small><p>{shareText}</p></div>
        <div className="share-actions"><button className="btn-primary" onClick={shareNatively}><Share2 size={16}/> مشاركة</button><button className="btn-secondary" onClick={copyShareText}><Copy size={16}/> نسخ النص</button></div>
        {shareStatus && <p className="share-status" role="status"><Check size={14}/>{shareStatus}</p>}
      </section>
    </div>}
  </div>;
}

function Stat({ icon, label, value, detail }: { icon: ReactNode; label: string; value: string; detail: string }) {
  return <motion.article className="stat-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><span className="stat-icon">{icon}</span><small>{label}</small><strong>{value}</strong><span className="muted">{detail}</span></motion.article>;
}
function GraduationMark() { return <div className="hero-orbit"><div className="hero-core"><GraduationIcon /></div><i/><i/><i/></div>; }
function GraduationIcon() { return <BookOpen size={48} strokeWidth={1.3}/>; }
