import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ChevronLeft, GraduationCap, UserRound } from "lucide-react";
import type { Gender, Profile, StreamId } from "../types";
import { streams, thirdLanguages } from "../data/streams";
import { createInitialState } from "../lib/storage";

export default function Onboarding({
  onComplete,
  storageWarning,
}: {
  onComplete: (state: ReturnType<typeof createInitialState>) => void;
  storageWarning?: string | null;
}) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender>("m");
  const [stream, setStream] = useState<StreamId | null>(null);
  const [thirdLanguage, setThirdLanguage] = useState<Profile["thirdLanguage"]>("es");
  const feminine = gender === "f";
  const selectedStream = streams.find((item) => item.id === stream);
  const finish = () => {
    if (!stream) return;
    onComplete(createInitialState({ name: name.trim() || "طالب البكالوريا", gender, stream, thirdLanguage }));
  };

  return <main className="onboarding" dir="rtl">
    <div className="onboard-brand"><div className="brand-mark"><GraduationCap /></div><span>منصة التفوق</span></div>
    <section className="onboard-card">
      <div className="step-track"><i style={{ width: `${((step + 1) / 3) * 100}%` }} /></div>
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
          {step === 0 && <>
            <span className="eyebrow">01 / الشعبة أولاً</span>
            <BookOpen className="step-icon" />
            <h1>ما شعبة البكالوريا؟</h1>
            <p className="muted">سنضبط المواد والمعاملات وفق الشعبة التي تختارها.</p>
            <div className="stream-grid">{streams.map((item) => <button type="button" key={item.id} aria-pressed={stream === item.id} className={stream === item.id ? "stream-option selected" : "stream-option"} onClick={() => setStream(item.id)}>{item.name}<span>{stream === item.id ? "✓" : "＋"}</span></button>)}</div>
            {stream === "lang" && <><label htmlFor="third-language">اللغة الثالثة</label><select id="third-language" value={thirdLanguage} onChange={(event) => setThirdLanguage(event.target.value as Profile["thirdLanguage"])}>{thirdLanguages.map((language) => <option key={language.id} value={language.id}>{language.name}</option>)}</select></>}
          </>}
          {step === 1 && <>
            <span className="eyebrow">02 / التعريف</span>
            <UserRound className="step-icon" />
            <h1>لنخصص مساحة مراجعتك</h1>
            <p className="muted">هذه البيانات اختيارية باستثناء الشعبة التي اخترتها.</p>
            <label htmlFor="student-name">الاسم (اختياري)</label>
            <input id="student-name" autoFocus value={name} maxLength={28} onChange={(event) => setName(event.target.value)} placeholder="اسمك أو لقبك" />
            <label>الصيغة اللغوية</label>
            <div className="choice-grid">
              <button type="button" aria-pressed={gender === "m"} className={gender === "m" ? "choice selected" : "choice"} onClick={() => setGender("m")}>مذكر</button>
              <button type="button" aria-pressed={gender === "f"} className={gender === "f" ? "choice selected" : "choice"} onClick={() => setGender("f")}>مؤنث</button>
            </div>
          </>}
          {step === 2 && <>
            <span className="eyebrow">03 / المعاينة</span>
            <h1>ملفك جاهز، {feminine ? "اختاري" : "اختر"} مظهرك المفضل</h1>
            <p className="muted">يمكنك تغيير المظهر والاسم لاحقاً.</p>
            <div className="theme-preview"><div className="preview-top"><div className="brand-mark"><GraduationCap /></div><b>منصة التفوق</b><span>{feminine ? "أهلاً بكِ" : "أهلاً بك"}</span></div><div className="preview-bars"><i /><i /><i /></div><div className="preview-card"><b>{name.trim() || "طالب البكالوريا"}</b><small>{selectedStream?.name} · المعاملات بحسب الشعبة</small></div></div>
          </>}
        </motion.div>
      </AnimatePresence>
      {storageWarning && <p className="storage-warning" role="alert">{storageWarning}</p>}
      <div className="onboard-actions">
        {step > 0 && <button type="button" className="btn-quiet" onClick={() => setStep(step - 1)}>السابق</button>}
        <button type="button" className="btn-primary" disabled={(step === 0 && !stream)} onClick={() => step < 2 ? setStep(step + 1) : finish()}>{step === 2 ? "ابدأ المراجعة" : feminine ? "تابعي" : "تابع"} <ChevronLeft size={17} /></button>
      </div>
    </section>
    <p className="privacy-note">بياناتك محفوظة على جهازك فقط. لا تتم مزامنتها مع خادم خارجي.</p>
  </main>;
}
