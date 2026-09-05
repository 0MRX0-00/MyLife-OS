
export function computeSetVolume(weight?: number | null, reps?: number | null): number {
  if (!weight || !reps || weight <= 0 || reps <= 0) return 0;
  return Math.round(weight * reps);
}

export function computeExerciseVolume(sets: { weight?: number | null; reps?: number | null; completed?: boolean }[]): number {
  return sets.reduce((acc, set) => {
    if (set.completed === false) return acc;
    return acc + computeSetVolume(set.weight, set.reps);
  }, 0);
}

export function computeWorkoutTotalVolume(
  exercises: { sets: { weight?: number | null; reps?: number | null; completed?: boolean }[] }[]
): number {
  return exercises.reduce((acc, ex) => acc + computeExerciseVolume(ex.sets), 0);
}
