import OpenAI from "openai";
import { PrismaClient } from "../../generated/prisma";
import { PLAN_GENERATION_PROMPT } from "../../prompt";

export async function generateWorkoutPlanDetails(prisma: PrismaClient, workoutPlanId: string, assessmentData: any) {
  // Use direct OpenAI call instead of createAgent to avoid nested step tooling
  const openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const assessmentPrompt = `
    Fitness Assessment Data:
    - Age: ${assessmentData.age}
    - Gender: ${assessmentData.gender}
    - Height: ${assessmentData.height} cm
    - Weight: ${assessmentData.weight} kg
    - Target Weight: ${assessmentData.targetWeight || 'Not specified'} kg
    - Fitness Goal: ${assessmentData.fitnessGoal}
    - Activity Level: ${assessmentData.activityLevel}
    - Experience Level: ${assessmentData.experienceLevel}
    - Target Muscle Groups: ${assessmentData.targetMuscleGroups?.join(', ') || 'All muscle groups'}
    - Has Injuries: ${assessmentData.hasInjuries}
    - Injuries: ${assessmentData.injuries || 'None'}
    - Medical Conditions: ${assessmentData.medicalConditions || 'None'}
    - Available Days: ${assessmentData.availableDays?.join(', ') || 'None'}
    - Workout Duration: ${assessmentData.workoutDuration || 'Not specified'} minutes
    - Preferred Exercises: ${assessmentData.preferredExercises || 'None specified'}
    - Available Equipment: ${assessmentData.equipment?.join(', ') || 'None'}

    DŮLEŽITÉ: Vygeneruj pouze přehledový popis 8-týdenního tréninkového plánu. NEGENERUJ konkrétní cviky, série, opakování nebo technické detaily - ty se generují automaticky pro každý trénink zvlášť. Zaměř se na:
    - Obecný přehled plánu a jeho cíle
    - Vysvětlení postupu během 8 týdnů
    - Jak plán podporuje jejich fitness cíle a cílové partie
    - Obecné tipy pro úspěch a bezpečnost
    - Motivující závěr
  `;

  const completion = await openaiClient.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: PLAN_GENERATION_PROMPT },
      { role: "user", content: assessmentPrompt }
    ],
    temperature: 0.7,
  });

  const planContent = completion.choices[0]?.message?.content || "Plan generation failed";

  // Generate Czech plan name based on fitness goal
  const getCzechPlanName = (fitnessGoal: string) => {
    switch (fitnessGoal) {
      case 'WEIGHT_LOSS': return 'Plán na hubnutí';
      case 'MUSCLE_GAIN': return 'Plán na nabírání svalů';
      case 'ENDURANCE': return 'Plán na vytrvalost';
      case 'STRENGTH': return 'Plán na sílu';
      case 'FLEXIBILITY': return 'Plán na flexibilitu';
      case 'GENERAL_FITNESS': return 'Obecný fitness plán';
      default: return 'Personalizovaný fitness plán';
    }
  };

  const getCzechExperienceLevel = (level: string) => {
    switch (level) {
      case 'BEGINNER': return 'začátečník';
      case 'INTERMEDIATE': return 'střední';
      case 'ADVANCED': return 'pokročilý';
      default: return 'začátečník';
    }
  };

  // Update the existing workout plan with Czech names and plan content
  const updatedWorkoutPlan = await prisma.workoutPlan.update({
    where: { id: workoutPlanId },
    data: {
      name: getCzechPlanName(assessmentData.fitnessGoal),
      description: `Personalizovaný ${getCzechPlanName(assessmentData.fitnessGoal).toLowerCase()} navržený pro ${getCzechExperienceLevel(assessmentData.experienceLevel)} úroveň`,
      planContent: planContent,
    },
  });

  return {
    name: updatedWorkoutPlan.name,
    description: updatedWorkoutPlan.description,
    duration: 8,
    difficulty: assessmentData.experienceLevel,
    planContent: updatedWorkoutPlan.planContent,
  };
}