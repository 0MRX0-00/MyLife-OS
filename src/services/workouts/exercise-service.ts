import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function getExercises(filters?: {
  muscleGroup?: string;
  category?: string;
  query?: string;
}) {
  const where: Prisma.ExerciseWhereInput = {};

  if (filters?.muscleGroup) {
    where.muscleGroup = filters.muscleGroup;
  }

  if (filters?.category) {
    where.category = filters.category;
  }

  if (filters?.query) {
    where.name = {
      contains: filters.query,
    };
  }

  return prisma.exercise.findMany({
    where,
    orderBy: { name: "asc" },
  });
}

export async function getExerciseById(id: string) {
  return prisma.exercise.findUnique({
    where: { id },
  });
}
