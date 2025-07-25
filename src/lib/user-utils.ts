import prisma from "@/lib/prisma";

/**
 * Ensures a user exists in the database
 * This is needed because users exist in Clerk but may not exist in our database
 * especially after database resets
 */
export async function ensureUserExists(userId: string) {
  try {
    const user = await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId },
    });
    return user;
  } catch (error) {
    console.error("Error ensuring user exists:", error);
    throw error;
  }
}