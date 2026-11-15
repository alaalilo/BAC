import { Home, BookOpen, Layers, Timer, Calculator, Settings, Search, Moon, Sun, GraduationCap } from "lucide-react";
import type { ReactNode } from "react";
import type { AppState } from "../types";
const nav = [
  ["home", "الرئيسية", Home], ["subjects", "موادي", BookOpen], ["terms", "بنك المصطلحات", Layers],
  ["focus", "وضع التركيز", Timer], ["calc", "حاسبة المعدل", Calculator], ["settings", "الإعدادات", Settings],
] as const;
export type PageId = typeof nav[number][0];
export default function Shell({ state, page, setPage, children, onSearch, onTheme }: {
  state: AppState; page: PageId; setPage: (page: PageId) => void; children: ReactNode; onSearch: () => void; onTheme: () => void;
}) {
  const active = nav.find(([id]) => id === page);
  return <div className="app-shell" dir="rtl">
    <aside className="sidebar">
      <div className="sidebar-brand"><div className="brand-mark"><GraduationCap /></div><div><b>منصة التفوق</b><small>{state.profile.name}</small></div></div>
      <nav aria-label="التنقل الرئيسي">{nav.map(([id, label, Icon]) => <button key={id} className={page === id ? "nav-link active" : "nav-link"} onClick={() => setPage(id)}><Icon size={18} /><span>{label}</span></button>)}</nav>
      <div className="sidebar-bottom"><button className="nav-link" onClick={onTheme}>{state.theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}{state.theme === "dark" ? "الوضع الفاتح" : "الوضع الليلي"}</button><small>مساحة مراجعتك الشخصية</small></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div><span className="eyebrow">مساحة الدراسة</span><b>{active?.[1] ?? "منصة التفوق"}</b></div><div className="top-actions"><button className="icon-button" aria-label="بحث شامل" onClick={onSearch}><Search size={18} /><kbd>Ctrl K</kbd></button><span className="avatar">{state.profile.name.slice(0, 1)}</span></div></header>
      <div className="page-content">{children}</div>
    </main>
    <nav className="mobile-nav" aria-label="التنقل السفلي">{nav.map(([id, label, Icon]) => <button key={id} aria-label={label} className={page === id ? "mobile-link active" : "mobile-link"} onClick={() => setPage(id)}><Icon size={19} /><small>{label}</small></button>)}</nav>
  </div>;
}