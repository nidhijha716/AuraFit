/** WHO adult BMI categories (kg/m²). */
export type BmiCategory =
  | "underweight"
  | "normal"
  | "overweight"
  | "obese";

export const BMI_CATEGORY_LABELS: Record<BmiCategory, string> = {
  underweight: "Underweight",
  normal: "Normal",
  overweight: "Overweight",
  obese: "Obese",
};

/**
 * BMI = weight(kg) / height(m)²
 * @see https://www.who.int/data/gho/data/themes/topics/topic-details/GHO/body-mass-index
 */
export function calculateBmi(
  heightCm: number,
  weightKg: number
): number | null {
  if (
    !Number.isFinite(heightCm) ||
    !Number.isFinite(weightKg) ||
    heightCm <= 0 ||
    weightKg <= 0
  ) {
    return null;
  }
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return Math.round(bmi * 10) / 10;
}

export function getBmiCategory(bmi: number): BmiCategory {
  if (bmi < 18.5) return "underweight";
  if (bmi < 25) return "normal";
  if (bmi < 30) return "overweight";
  return "obese";
}

export function isValidHeightCm(value: number): boolean {
  return Number.isFinite(value) && value >= 100 && value <= 250;
}

export function isValidWeightKg(value: number): boolean {
  return Number.isFinite(value) && value >= 30 && value <= 300;
}
