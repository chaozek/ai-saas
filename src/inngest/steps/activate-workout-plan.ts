import { PrismaClient } from "../../generated/prisma";

export async function activateWorkoutPlan(prisma: PrismaClient, workoutPlanId: string, fitnessProfileId: string) {
  await prisma.workoutPlan.update({
    where: { id: workoutPlanId },
    data: {
      isActive: true,
      activeProfileId: fitnessProfileId,
    }
  });
  console.log(`Activated workout plan ${workoutPlanId} - set isActive to true`);
}