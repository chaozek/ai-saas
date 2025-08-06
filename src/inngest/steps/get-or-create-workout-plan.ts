import { PrismaClient } from "../../generated/prisma";

export async function getOrCreateWorkoutPlan(prisma: PrismaClient, workoutPlanId: string | null, fitnessProfileId: string, assessmentData: any) {
  if (workoutPlanId) {
    // Try to find existing workout plan
    const plan = await prisma.workoutPlan.findUnique({
      where: { id: workoutPlanId }
    });

    if (!plan) {
      throw new Error("Workout plan not found");
    }

    console.log("Using existing workout plan:", plan.id);
    return plan;
  } else {
    // Create new workout plan
    const newPlan = await prisma.workoutPlan.create({
      data: {
        fitnessProfileId: fitnessProfileId,
        name: "Generování...",
        description: "Váš personalizovaný fitness plán se připravuje",
        duration: 8,
        difficulty: assessmentData.experienceLevel || "BEGINNER"
      }
    });

    console.log("Created new workout plan:", newPlan.id);
    return newPlan;
  }
}