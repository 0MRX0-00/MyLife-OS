/**
 * Format a number with locale-aware formatting.
 */
export function formatNumber(num: number, decimals = 0): string {
  return num.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format calories with unit.
 */
export function formatCalories(cal: number): string {
  return `${Math.round(cal)} kcal`;
}

/**
 * Format weight in kg.
 */
export function formatWeight(kg: number): string {
  return `${kg.toFixed(1)} kg`;
}

/**
 * Format grams of macronutrient.
 */
export function formatMacro(grams: number): string {
  return `${Math.round(grams)}g`;
}

/**
 * Format percentage.
 */
export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

/**
 * Format duration in minutes to human-readable string.
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

/**
 * Format volume (weight × reps) with unit.
 */
export function formatVolume(volume: number): string {
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}t`;
  }
  return `${formatNumber(volume)} kg`;
}

/**
 * Calculate percentage safely (handles division by zero).
 */
export function safePercent(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(Math.round((value / total) * 100), 100);
}

/**
 * Format a change value with +/- prefix.
 */
export function formatChange(value: number, decimals = 1): string {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(decimals)}`;
}

/**
 * Truncate text with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}
