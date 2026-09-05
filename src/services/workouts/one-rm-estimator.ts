export function estimateOneRM(weight: number, reps: number): number {
  if (!weight || weight <= 0 || !reps || reps <= 0) return 0;
  if (reps === 1) return Math.round(weight * 10) / 10;

  // Epley formula: weight * (1 + reps / 30)
  const epley = weight * (1 + reps / 30);

  // Brzycki formula: weight * (36 / (37 - reps))
  const brzycki = reps < 37 ? weight * (36 / (37 - reps)) : epley;

  // Average of both standard formulas
  const avg = (epley + brzycki) / 2;
  return Math.round(avg * 10) / 10;
}
