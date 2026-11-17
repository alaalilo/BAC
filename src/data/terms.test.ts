import { describe, expect, it } from "vitest";
import sourceTerms from "./terms.json";
import sourceMotivations from "./motivations.json";
import sourceResources from "./resources.json";

describe("original revision content", () => {
  it("keeps the language, history and geography card banks", () => {
    expect(sourceTerms.english.items).toHaveLength(100);
    expect(sourceTerms.french.items).toHaveLength(100);
    expect(sourceTerms.spanish.items).toHaveLength(100);
    expect(sourceTerms.history.persons).toHaveLength(62);
    expect(sourceTerms.history.dates).toHaveLength(80);
    expect(sourceTerms.geography.items).toHaveLength(40);
  });
  it("keeps the neutral message dataset and DzExams resources", () => {
    expect(sourceMotivations.motivations).toHaveLength(100);
    expect(sourceMotivations.motivations.join(" ")).not.toContain("أستاذة");
    expect(sourceMotivations.motivations.join(" ")).not.toContain("أولادي");
    expect(sourceResources.english.bac["2026"]).toContain("dzexams.com");
    expect(sourceResources.french.exams["الفصل الأول"].length).toBeGreaterThan(0);
    expect(sourceResources.spanish.lessons.length).toBeGreaterThan(0);
  });
});
