import { useEffect, useState } from "react";
import type { AppState } from "../types";
import { loadState, saveState, STORAGE_KEY } from "../lib/storage";

export function useAppState() {
  const [initial] = useState(() => loadState());
  const [state, setState] = useState<AppState | null>(initial.state);
  const [storageWarning, setStorageWarning] = useState<string | null>(initial.warning);

  useEffect(() => {
    if (!state) return;
    const result = saveState(state);
    setStorageWarning(result.ok ? null : result.warning);
  }, [state]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if ((event.key === STORAGE_KEY || event.key === null) && event.newValue === null) {
        setStorageWarning("تم حذف بيانات الحفظ من تبويب آخر. البيانات الموجودة في هذه الجلسة لم تتغير بعد.");
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    const theme = state?.theme;
    const skin = state?.profile.gender;
    if (!theme || !skin) return;
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.skin = skin;
  }, [state?.theme, state?.profile.gender]);

  return [state, setState, storageWarning] as const;
}
