import { PrismaClient } from "../../generated/prisma";

export async function getFitnessProfile(prisma: PrismaClient, userId: string, assessmentData: any) {
  let profile = await prisma.fitnessProfile.findUnique({
    where: { userId },
    include: {
      currentPlan: true
    }
  });

  if (!profile) {
    // Create fitness profile from assessment data
    console.log("Creating new fitness profile for user:", userId);
    profile = await prisma.fitnessProfile.create({
      data: {
        userId: userId,
        gender: assessmentData.gender || 'male',
        fitnessGoal: assessmentData.fitnessGoal || 'GENERAL_FITNESS',
        age: parseInt(assessmentData.age) || 25,
        weight: parseFloat(assessmentData.weight) || 70,
        height: parseFloat(assessmentData.height) || 170,
        targetWeight: parseFloat(assessmentData.targetWeight) || parseFloat(assessmentData.weight) || 70,
        experienceLevel: assessmentData.experienceLevel || 'BEGINNER',
        activityLevel: assessmentData.activityLevel || 'MODERATELY_ACTIVE',
        targetMuscleGroups: assessmentData.targetMuscleGroups || [],
        hasInjuries: assessmentData.hasInjuries || false,
        injuries: assessmentData.injuries || '',
        medicalConditions: assessmentData.medicalConditions || '',
        availableDays: JSON.stringify(assessmentData.availableDays || ['Pondělí', 'Středa', 'Pátek']),
        workoutDuration: parseInt(assessmentData.workoutDuration) || 45,
        preferredExercises: assessmentData.preferredExercises || '',
        equipment: JSON.stringify(assessmentData.equipment || ['Činky']),
        mealPlanningEnabled: assessmentData.mealPlanningEnabled || false,
        dietaryRestrictions: assessmentData.dietaryRestrictions || [],
        allergies: assessmentData.allergies || [],
        preferredCuisines: assessmentData.preferredCuisines || ['česká'],
      },
      include: {
        currentPlan: true
      }
    });
    console.log("Created new fitness profile:", profile.id);
  } else {
    console.log("Found existing fitness profile:", profile.id);
  }

  return profile;
}