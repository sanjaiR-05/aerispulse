/**
 * Calculates estimated monthly outpatient and medical healthcare expenditure savings (in INR ₹)
 * resulting from personal inhalation exposure reduction in urban Indian metros.
 *
 * Grounded in Indian Council of Medical Research (ICMR) & Lancet Planetary Health estimates,
 * using a calibrated baseline factor of ₹2,200/month average respiratory & outpatient consultation expenditure
 * during high particulate exposure episodes.
 *
 * Mathematical Formula:
 * \( S_{monthly} = \text{round}_{10}\left( \frac{D_{baseline} - D_{current}}{D_{baseline}} \times 2200 \right) \)
 *
 * @param currentDosageUg - Active inhaled particulate mass dosage in µg/day
 * @param baselineDosageUg - Unmitigated baseline inhaled particulate mass dosage in µg/day
 * @returns {number} Estimated monthly healthcare financial savings in Indian Rupees (INR ₹)
 *
 * @example
 * ```ts
 * const savings = calculateMonthlyHealthSavings(120.5, 615.1);
 * // Returns ₹1,770
 * ```
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
  // Round to nearest 10 INR for clean financial reporting
  return Math.round(rawSavings / 10) * 10;
}
