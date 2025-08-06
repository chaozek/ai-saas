import { PrismaClient } from "../../generated/prisma";

export async function ensureUserExists(prisma: PrismaClient, userId: string) {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId }
  });

  console.log(userId, "userIduserIduserId");
  if (!existingUser) {
    console.log("Creating user in database:", userId);
    await prisma.user.create({
      data: { id: userId }
    });
  } else {
    console.log("User already exists in database:", userId);
  }
}