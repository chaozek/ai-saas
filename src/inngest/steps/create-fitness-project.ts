import { PrismaClient } from "../../generated/prisma";

export async function createFitnessProject(prisma: PrismaClient, userId: string, planData: any, assessmentData: any) {
  // Create a project for the fitness plan
  const project = await prisma.project.create({
    data: {
      name: `${planData.name} - ${new Date().toLocaleDateString()}`,
      userId: userId,
      messages: {
        create: {
          content: `Your personalized ${planData.name} has been created! The plan includes ${assessmentData.availableDays.length} AI-generated workouts per week for 8 weeks, tailored to your ${assessmentData.fitnessGoal.toLowerCase().replace('_', ' ')} goals and ${assessmentData.experienceLevel.toLowerCase()} experience level.${assessmentData.mealPlanningEnabled ? ` Plus, you now have a complete 30-day AI-generated meal plan with ${assessmentData.availableDays.length * 3} personalized recipes per week!` : ''}`,
          role: "ASSISTANT",
          type: "PLAN_GENERATED",
        }
      }
    },
  });

  return project;
}