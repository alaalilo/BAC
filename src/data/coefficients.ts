import type { StreamId } from "../types";

/**
 * معاملات أولية مستخرجة من النسخة المرفقة أو مقاربة لها.
 * TODO: تدقيق معاملات كل شعبة وفق المنشور الوزاري الرسمي للسنة الدراسية المعنية.
 * لا تعتمد هذه القيم كمرجع رسمي؛ يستطيع المستخدم تعديلها داخل حاسبة المعدل.
 */
const common: Record<string, number> = { ar: 3, fr: 2, en: 2, ph: 2, hg: 2, isl: 2 };
export const coefficients: Record<StreamId, Record<string, number>> = {
  sci: { ...common, nat: 5, phys: 5, math: 5 },
  math: { ...common, math: 7, phys: 6, nat: 2 },
  tech: { ar: 2, fr: 2, en: 2, ph: 2, hg: 2, isl: 2, tech: 7, math: 6, phys: 5 },
  eco: { ar: 3, fr: 2, en: 2, ph: 2, hg: 2, isl: 2, mgt: 5, acc: 5, math: 5, law: 2 },
  lit: { ar: 6, ph: 6, hg: 4, fr: 3, en: 3, isl: 2, math: 2 },
  lang: { ar: 5, fr: 5, en: 5, L3: 4, ph: 2, hg: 2, math: 2, isl: 2 },
};