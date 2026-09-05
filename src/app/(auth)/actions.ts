"use server";

import bcrypt from "bcryptjs";
import { signIn } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { loginSchema, registerSchema } from "@/utils/validation";
import { redirect } from "next/navigation";

export async function loginAction(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password,
      redirect: false,
    });
  } catch {
    return { error: "Invalid email or password" };
  }

  redirect("/dashboard");
}

export async function registerAction(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  // Check if user already exists
  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    return { error: "An account with this email already exists" };
  }

  // Hash password and create user with default profile
  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: normalizedEmail,
        hashedPassword,
        name,
      },
    });

    await tx.profile.create({
      data: {
        userId: user.id,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      },
    });
  });

  // Auto sign in after registration
  try {
    await signIn("credentials", {
      email: normalizedEmail,
      password,
      redirect: false,
    });
  } catch {
    return { error: "Account created. Please log in." };
  }

  redirect("/dashboard");
}
