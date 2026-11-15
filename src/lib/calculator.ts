export function calculateAverage(grades: Record<string, string>, coefs: Record<string, number>) {
  let weighted = 0; let total = 0;
  for (const [id, coefficient] of Object.entries(coefs)) {
    const grade = Number(grades[id]);
    if (grades[id] !== "" && Number.isFinite(grade)) {
      weighted += Math.max(0, Math.min(20, grade)) * coefficient;
      total += coefficient;
    }
  }
  return total ? weighted / total : 0;
}
export function requiredAverage(grades: Record<string, string>, coefs: Record<string, number>, target: number) {
  let weighted = 0; let entered = 0; let remaining = 0;
  for (const [id, coefficient] of Object.entries(coefs)) {
    const value = grades[id];
    if (value !== undefined && value !== "" && Number.isFinite(Number(value))) {
      weighted += Math.max(0, Math.min(20, Number(value))) * coefficient;
      entered += coefficient;
    } else remaining += coefficient;
  }
  if (!remaining) return null;
  return (target * (entered + remaining) - weighted) / remaining;
}