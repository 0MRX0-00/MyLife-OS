import { Habit, HabitLog } from "@prisma/client";

export interface CreateHabitInput {
  name: string;
  description?: string | null;
  frequency?: string;
  target?: number;
  color?: string;
  icon?: string | null;
}

export type HabitWithLogs = Habit & {
  logs: HabitLog[];
};
