import type { StreamId } from "../types";

export const streams: { id: StreamId; name: string; short: string }[] = [
  { id: "sci", name: "علوم تجريبية", short: "علوم" },
  { id: "math", name: "رياضيات", short: "رياضيات" },
  { id: "tech", name: "تقني رياضي", short: "تقني" },
  { id: "eco", name: "تسيير واقتصاد", short: "تسيير" },
  { id: "lit", name: "آداب وفلسفة", short: "آداب" },
  { id: "lang", name: "لغات أجنبية", short: "لغات" },
];
export const thirdLanguages = [
  { id: "es", name: "الإسبانية" }, { id: "de", name: "الألمانية" }, { id: "it", name: "الإيطالية" },
] as const;
export const subjects: Record<string, string> = {
  ar: "اللغة العربية", fr: "اللغة الفرنسية", en: "اللغة الإنجليزية", ph: "الفلسفة",
  hg: "التاريخ والجغرافيا", isl: "التربية الإسلامية", math: "الرياضيات",
  phys: "العلوم الفيزيائية", nat: "علوم الطبيعة والحياة", tech: "التكنولوجيا",
  mgt: "الاقتصاد والمناجمنت", acc: "التسيير المحاسبي والمالي", law: "القانون",
  L3: "اللغة الثالثة",
};
export const subjectIds: Record<StreamId, string[]> = {
  sci: ["nat", "phys", "math", "ar", "fr", "en", "ph", "hg", "isl"],
  math: ["math", "phys", "nat", "ar", "fr", "en", "ph", "hg", "isl"],
  tech: ["tech", "math", "phys", "ar", "fr", "en", "ph", "hg", "isl"],
  eco: ["mgt", "acc", "math", "law", "ar", "fr", "en", "ph", "hg", "isl"],
  lit: ["ar", "ph", "hg", "fr", "en", "isl", "math"],
  lang: ["ar", "fr", "en", "L3", "ph", "hg", "math", "isl"],
};