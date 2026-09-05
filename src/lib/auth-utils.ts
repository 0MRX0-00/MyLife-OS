import { auth } from "@/lib/auth";
import { AuthenticationError } from "@/utils/errors";

/**
 * Get the current authenticated user's ID from the session.
 * Throws AuthenticationError if not authenticated.
 * Use this in all server actions and API routes.
 */
export async function requireAuth(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AuthenticationError();
  }
  return session.user.id;
}

/**
 * Get the current session without throwing.
 * Returns null if not authenticated.
 */
export async function getSession() {
  return await auth();
}
