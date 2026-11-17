import { Moon, Search, Sun } from "lucide-react";
import type { ReactNode } from "react";
import { CustomIcon, type CustomIconName } from "./CustomIcon";
import type { AppState } from "../types";

const nav = [
  ["home", "الرئيسية", "home"],
  ["subjects", "موادي", "subjects"],
  ["terms", "بنك المصطلحات", "terms"],
  ["focus", "وضع التركيز", "focus"],
  ["calc", "حاسبة المعدل", "calculator"],
  ["settings", "الإعدادات", "settings"],
] as const satisfies readonly (readonly [string, string, CustomIconName])[];

export type PageId = typeof nav[number][0];

export default function Shell({ state, page, setPage, children, onSearch, onTheme }: {
  state: AppState; page: PageId; setPage: (page: PageId) => void; children: ReactNode; onSearch: () => void; onTheme: () => void;
}) {
  const active = nav.find(([id]) => id === page);
  const logoSrc = `${import.meta.env.BASE_URL}icons/icon.svg`;

  return <div className="app-shell" dir="rtl">
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark"><img src={logoSrc} alt="" /></div>
        <div><b>منصة التفوق</b><small>{state.profile.name}</small></div>
      </div>
      <nav aria-label="التنقل الرئيسي">{nav.map(([id, label, icon]) => <button key={id} className={page === id ? "nav-link active" : "nav-link"} onClick={() => setPage(id)}><CustomIcon name={icon} size={19}/><span>{label}</span></button>)}</nav>
      <div className="sidebar-bottom"><button className="nav-link" onClick={onTheme}>{state.theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}{state.theme === "dark" ? "الوضع الفاتح" : "الوضع الليلي"}</button><small>مساحة مراجعتك الشخصية</small></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div><span className="eyebrow">مساحة الدراسة</span><b>{active?.[1] ?? "منصة التفوق"}</b></div><div className="top-actions"><button className="icon-button" aria-label="بحث شامل" onClick={onSearch}><Search size={18} /><kbd>Ctrl K</kbd></button><span className="avatar">{state.profile.name.slice(0, 1)}</span></div></header>
      <div className="page-content">{children}</div>
    </main>
    <nav className="mobile-nav" aria-label="التنقل السفلي">{nav.map(([id, label, icon]) => <button key={id} aria-label={label} className={page === id ? "mobile-link active" : "mobile-link"} onClick={() => setPage(id)}><CustomIcon name={icon} size={20}/><small>{label}</small></button>)}</nav>
  </div>;
}
