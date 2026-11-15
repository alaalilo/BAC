import { useRef } from "react";
import { Download, Upload, RotateCcw } from "lucide-react";
import type { AppState, Gender, Profile, StreamId } from "../types";
import { streams, thirdLanguages } from "../data/streams";
import { createSubjects, restoreBackup } from "../lib/storage";

export default function Settings({ state, setState, reset }: { state: AppState; setState: (s: AppState) => void; reset: () => void }) {
  const file = useRef<HTMLInputElement>(null);
  const exportData = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "altafawoq-backup.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const importData = async (picked?: File) => {
    if (!picked) return;
    try {
      const parsed: unknown = JSON.parse(await picked.text());
      const restored = restoreBackup(parsed);
      if (!restored) throw new Error("invalid");
      setState(restored);
    } catch {
      alert("ملف النسخة الاحتياطية غير صالح أو لا يحتوي على ملف الطالب والمواد.");
    } finally {
      if (file.current) file.current.value = "";
    }
  };
  const updateProfile = (key: "name" | "gender", value: string) => {
    setState({ ...state, profile: { ...state.profile, [key]: value } as Profile });
  };
  const updateStream = (stream: StreamId) => {
    if (stream === state.profile.stream) return;
    const confirmed = window.confirm("تغيير الشعبة سيعيد تكوين قائمة المواد ومعاملاتها. سيبقى تقدم المواد المشتركة محفوظاً، وستُحفظ المواد الأخرى في أرشيف محلي لتعود عند الرجوع إلى الشعبة السابقة. صدّر نسخة احتياطية قبل المتابعة.");
    if (!confirmed) return;
    const profile = { ...state.profile, stream };
    const preserved = new Map([...(state.archivedSubjects ?? []), ...state.subjects].map((subject) => [subject.id, subject]));
    const subjects = createSubjects(profile).map((subject) => {
      const old = preserved.get(subject.id);
      return old ? { ...subject, topics: old.topics, lessons: old.lessons, exercises: old.exercises ?? [] } : subject;
    });
    const activeIds = new Set(subjects.map((subject) => subject.id));
    const archivedSubjects = [...preserved.values()].filter((subject) => !activeIds.has(subject.id));
    setState({ ...state, profile, subjects, archivedSubjects });
  };
  const updateThirdLanguage = (thirdLanguage: Profile["thirdLanguage"]) => {
    const profile = { ...state.profile, thirdLanguage };
    const subjects = state.profile.stream === "lang"
      ? createSubjects(profile).map((subject) => {
          const old = state.subjects.find((item) => item.id === subject.id);
          return old ? { ...subject, topics: old.topics, lessons: old.lessons, exercises: old.exercises ?? [] } : subject;
        })
      : state.subjects;
    setState({ ...state, profile, subjects });
  };

  return <div className="stack-lg">
    <div className="page-intro"><span className="eyebrow">التحكم والتخصيص</span><h1>الإعدادات</h1><p>ملفك وبياناتك محفوظة محلياً على هذا الجهاز.</p></div>
    <section className="panel"><h2>الملف الشخصي والشعبة</h2><div className="form-grid">
      <label>الاسم<input value={state.profile.name} onChange={(event) => updateProfile("name", event.target.value)} /></label>
      <label>الشعبة<select value={state.profile.stream} onChange={(event) => updateStream(event.target.value as StreamId)}>{streams.map((stream) => <option key={stream.id} value={stream.id}>{stream.name}</option>)}</select></label>
      <label>الصيغة اللغوية<select value={state.profile.gender} onChange={(event) => updateProfile("gender", event.target.value as Gender)}><option value="m">مذكر</option><option value="f">مؤنث</option></select></label>
      {state.profile.stream === "lang" && <label>اللغة الثالثة<select value={state.profile.thirdLanguage} onChange={(event) => updateThirdLanguage(event.target.value as Profile["thirdLanguage"])}>{thirdLanguages.map((language) => <option key={language.id} value={language.id}>{language.name}</option>)}</select></label>}
    </div><p className="field-hint">عند تغيير الشعبة تُحدّث المعاملات تلقائياً، ويُحفظ تقدم المواد غير الحالية في أرشيف محلي. احتفظ بنسخة احتياطية قبل تغيير الشعبة.</p></section>
    <section className="panel"><h2>المظهر</h2><div className="settings-row"><span>الوضع الليلي / الفاتح</span><button className="btn-secondary" onClick={() => setState({ ...state, theme: state.theme === "dark" ? "light" : "dark" })}>{state.theme === "dark" ? "تفعيل الفاتح" : "تفعيل الليلي"}</button></div></section>
    <section className="panel"><h2>النسخ الاحتياطي ونقل البيانات</h2><p className="muted">صدّر ملف JSON لنقل تقدمك إلى جهاز آخر ثم استورده هناك. لا توجد مزامنة سحابية مفعّلة حالياً.</p><div className="settings-actions"><button className="btn-secondary" onClick={exportData}><Download size={16}/> تصدير JSON</button><button className="btn-secondary" onClick={() => file.current?.click()}><Upload size={16}/> استيراد JSON</button><input ref={file} hidden type="file" accept="application/json,.json" onChange={(event) => void importData(event.target.files?.[0])} /></div></section>
    <section className="panel danger-panel"><h2>إعادة ضبط</h2><p className="muted">سيؤدي ذلك إلى حذف بيانات المنصة المحلية من هذا الجهاز.</p><button className="btn-danger" onClick={() => { if (confirm("هل تريد حذف جميع بياناتك المحلية؟")) reset(); }}><RotateCcw size={16}/> إعادة ضبط البيانات</button></section>
  </div>;
}
