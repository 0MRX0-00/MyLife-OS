import prisma from "@/lib/prisma";
import { CreateFoodInput } from "@/types/nutrition";

export async function getUserFoods(userId: string, query?: string) {
  return prisma.food.findMany({
    where: {
      userId,
      ...(query
        ? {
            name: {
              contains: query,
            },
          }
        : {}),
    },
    orderBy: [{ isFavorite: "desc" }, { name: "asc" }],
  });
}

export async function createFood(userId: string, data: CreateFoodInput) {
  return prisma.food.create({
    data: {
      userId,
      name: data.name,
      brand: data.brand || null,
      servingSize: data.servingSize,
      servingUnit: data.servingUnit,
      calories: data.calories,
      protein: data.protein,
      carbohydrates: data.carbohydrates,
      fat: data.fat,
      fiber: data.fiber || 0,
      isFavorite: data.isFavorite || false,
    },
  });
}

export async function toggleFavoriteFood(userId: string, foodId: string) {
  const food = await prisma.food.findFirst({
    where: { id: foodId, userId },
  });

  if (!food) {
    throw new Error("Food not found");
  }

  return prisma.food.update({
    where: { id: foodId },
    data: { isFavorite: !food.isFavorite },
  });
}

export async function deleteFood(userId: string, foodId: string) {
  const food = await prisma.food.findFirst({
    where: { id: foodId, userId },
  });

  if (!food) {
    throw new Error("Food not found");
  }

  return prisma.food.delete({
    where: { id: foodId },
  });
}
