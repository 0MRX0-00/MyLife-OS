export interface BodyMetric {
  id: string;
  userId: string;
  date: Date;
  weight: number | null;
  bodyFat: number | null;
  waist: number | null;
  chest: number | null;
  arms: number | null;
  thighs: number | null;
  createdAt: Date;
}

export interface CreateBodyMetricInput {
  date: string;
  weight?: number | null;
  bodyFat?: number | null;
  waist?: number | null;
  chest?: number | null;
  arms?: number | null;
  thighs?: number | null;
}
