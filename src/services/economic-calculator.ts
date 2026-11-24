/**
 * Calculates estimated monthly outpatient and medical expenditure savings (in INR)
 * resulting from inhaled dosage exposure reduction in urban Indian environments.
 *
 * Base factor: ₹2,200/month average outpatient expenditure during severe pollution episodes.
 */
export function calculateMonthlyHealthSavings(
  currentDosageUg: number,
  baselineDosageUg: number
): number {
  if (baselineDosageUg <= 0 || currentDosageUg >= baselineDosageUg) {
    return 0;
  }

  const reductionRatio = (baselineDosageUg - currentDosageUg) / baselineDosageUg;
  const baseMonthlyExpenditureInr = 2200;

  const rawSavings = reductionRatio * baseMonthlyExpenditureInr;
  // Round to nearest 10 INR for clean reporting
  return Math.round(rawSavings / 10) * 10;
}
