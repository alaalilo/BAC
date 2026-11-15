import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Onboarding from "./components/Onboarding";
import Shell, { type PageId } from "./components/Shell";
import { useAppState } from "./hooks/useAppState";
import type { AppState } from "./types";
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Subjects = lazy(() => import("./pages/Subjects"));
const Terms = lazy(() => import("./pages/Terms"));
const Focus = lazy(() => import("./pages/Focus"));
const Calculator = lazy(() => import("./pages/Calculator"));
const Settings = lazy(() => import("./pages/Settings"));

function AppContent() {
  const [state, setState, storageWarning] = useAppState();
  const [page, setPage] = useState<PageId>("home");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setSearchOpen(true); }
      if (event.key === "Escape") setSearchOpen(false);
      const shortcuts: Record<string, PageId> = { "1": "home", "2": "subjects", "3": "terms", "4": "focus", "5": "calc" };
      if (!event.ctrlKey && !event.metaKey && shortcuts[event.key] && !(event.target instanceof HTMLInputElement)) setPage(shortcuts[event.key]);
    };
    window.addEventListener("keydown", handler); return () => window.removeEventListener("keydown", handler);
  }, []);
  const searchable = useMemo(() => state ? [
    ...state.subjects.map((s) => ({ label: s.name, hint: "مادة", page: "subjects" as PageId })),
    ...state.subjects.flatMap((s) => s.topics.map((t) => ({ label: t.title, hint: s.name, page: "subjects" as PageId }))),
    ...state.terms.map((t) => ({ label: t.front, hint: "مصطلح", page: "terms" as PageId })),
  ].filter((item) => `${item.label} ${item.hint}`.toLowerCase().includes(query.toLowerCase())).slice(0, 12) : [], [state, query]);
  if (!state) return <Onboarding onComplete={(next) => setState(next)} storageWarning={storageWarning} />;
  const go = (next: PageId) => { setPage(next); setSearchOpen(false); };
  const content = (() => {
    switch (page) {
      case "home": return <Dashboard state={state} setState={setState as (s: AppState) => void} go={go}/>;
      case "subjects": return <Subjects state={state} setState={setState as (s: AppState) => void}/>;
      case "terms": return <Terms state={state} setState={setState as (s: AppState) => void}/>;
      case "focus": return <Focus state={state} setState={setState as (s: AppState) => void}/>;
      case "calc": return <Calculator state={state} setState={setState as (s: AppState) => void}/>;
      case "settings": return <Settings state={state} setState={setState as (s: AppState) => void} reset={() => { localStorage.removeItem("bacStandard_v3"); localStorage.removeItem("bacStandard_v1"); setState(null); }}/>;
    }
  })();
  return <Shell state={state} page={page} setPage={go} onSearch={() => setSearchOpen(true)} onTheme={() => setState({ ...state, theme: state.theme === "dark" ? "light" : "dark" })}>
    {storageWarning && <div className="storage-warning" role="alert">{storageWarning}</div>}
    <Suspense fallback={<div className="page-loading" role="status">جارٍ تحميل الصفحة...</div>}><AnimatePresence mode="wait"><motion.div key={page} initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: .16 }}>{content}</motion.div></AnimatePresence></Suspense>
    {searchOpen && <div className="command-overlay" role="dialog" aria-modal="true" aria-label="البحث الشامل" onMouseDown={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}><section className="command-box"><div className="command-input"><Search/><input dir="auto" autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث عن مادة أو موضوع أو مصطلح..."/><button aria-label="إغلاق البحث" onClick={() => setSearchOpen(false)}><X/></button></div><div className="command-results">{searchable.map((item, i) => <button key={`${item.label}-${i}`} onClick={() => go(item.page)}><span>{item.label}</span><small>{item.hint}</small></button>)}{!searchable.length && <p>لا توجد نتائج مطابقة.</p>}</div></section></div>}
  </Shell>;
}
export default function App() { return <ErrorBoundary><AppContent/></ErrorBoundary>; }