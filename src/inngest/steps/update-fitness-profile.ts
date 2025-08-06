import { PrismaClient } from "../../generated/prisma";

export async function updateFitnessProfile(prisma: PrismaClient, fitnessProfileId: string, workoutPlanId: string) {
  await prisma.fitnessProfile.update({
    where: { id: fitnessProfileId },
    data: { currentPlan: { connect: { id: workoutPlanId } } }
  });
  console.log(`Updated fitness profile ${fitnessProfileId} to set current plan to ${workoutPlanId}`);
}