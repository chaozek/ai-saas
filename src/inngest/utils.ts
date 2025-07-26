import { Message } from "@inngest/agent-kit";
import { PrismaClient } from "../generated/prisma";

export const getAssessmentData = (assessmentString: string) => {
  try {
    return JSON.parse(decodeURIComponent(assessmentString));
  } catch (error) {
    console.error('Error parsing assessment data:', error);
    return null;
  }
};

export const generateFitnessPlan = async (assessmentData: any) => {
  // This function would integrate with AI to generate a personalized fitness plan
  // For now, we'll return a basic structure
  return {
    name: `${assessmentData.fitnessGoal.replace('_', ' ')} Plan`,
    description: `Personalized ${assessmentData.fitnessGoal.toLowerCase().replace('_', ' ')} program`,
    duration: 8,
    difficulty: assessmentData.experienceLevel,
    workouts: []
  };
};

export const lastAssistantTextMessageContent = (result: any): string | null => {
  if (!result || !result.messages || !Array.isArray(result.messages)) {
    return null;
  }

  // Find the last assistant message
  for (let i = result.messages.length - 1; i >= 0; i--) {
    const message = result.messages[i];
    if (message.role === "assistant" && message.type === "text") {
      return message.content;
    }
  }

  return null;
};

// Utility functions for Inngest (extracted from functions.ts)
// (Code will be moved here in the next step)

// Helper function to check if exercise already exists by name
export async function findExistingExercise(prisma: PrismaClient, exerciseName: string, englishName?: string): Promise<any | null> {
  try {
    // First try exact match by Czech name (case-insensitive)
    let existingExercise = await prisma.exercise.findFirst({
      where: {
        name: {
          equals: exerciseName,
          mode: 'insensitive' // Case-insensitive search
        }
      },
      orderBy: {
        createdAt: 'desc' // Get the most recent one
      }
    });

    if (existingExercise) {
      return existingExercise;
    }

    // If no exact match and we have English name, try by English name
    if (englishName) {
      existingExercise = await prisma.exercise.findFirst({
        where: {
          OR: [
            {
              name: {
                equals: englishName,
                mode: 'insensitive'
              }
            },
            {
              englishName: {
                equals: englishName,
                mode: 'insensitive'
              }
            }
          ]
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      if (existingExercise) {
        console.log(`Found existing exercise by English name: "${englishName}" -> "${existingExercise.name}"`);
        return existingExercise;
      }
    }

    // If no exact match, try to find similar exercises (for common variations)
    const normalizedName = exerciseName.toLowerCase().trim();

    // Common exercise name variations
    const variations = [
      normalizedName.replace(/\s+/g, ' '), // Normalize spaces
      normalizedName.replace(/[^\w\s]/g, ''), // Remove special characters
      normalizedName.replace(/\b(kliky|push-ups?)\b/g, 'push-ups'),
      normalizedName.replace(/\b(dřepy|squats?)\b/g, 'squats'),
      normalizedName.replace(/\b(prkno|plank)\b/g, 'plank'),
      normalizedName.replace(/\b(burpee|burpees?)\b/g, 'burpees'),
      normalizedName.replace(/\b(výpady|lunges?)\b/g, 'lunges'),
      normalizedName.replace(/\b(shyby|pull-ups?)\b/g, 'pull-ups'),
      normalizedName.replace(/\b(dipy|dips?)\b/g, 'dips'),
      normalizedName.replace(/\b(sklapovačky|crunches?)\b/g, 'crunches'),
    ];

    // Try each variation
    for (const variation of variations) {
      if (variation !== normalizedName) {
        existingExercise = await prisma.exercise.findFirst({
          where: {
            name: {
              equals: variation,
              mode: 'insensitive'
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        if (existingExercise) {
          console.log(`Found existing exercise with variation: "${exerciseName}" -> "${existingExercise.name}"`);
          return existingExercise;
        }
      }
    }

    return null;
  } catch (error) {
    console.warn(`Error checking for existing exercise "${exerciseName}":`, error);
    return null;
  }
}

// Helper function to create exercise data object
export function createExerciseData(exercise: any): any {
  // Map difficulty string to ExperienceLevel enum
  let difficulty: string;
  if (exercise.difficulty) {
    const difficultyUpper = exercise.difficulty.toUpperCase();
    if (difficultyUpper === 'BEGINNER' || difficultyUpper === 'INTERMEDIATE' || difficultyUpper === 'ADVANCED') {
      difficulty = difficultyUpper;
    } else {
      throw new Error(`Invalid difficulty value: "${difficultyUpper}" for exercise "${exercise.name}". Expected: BEGINNER, INTERMEDIATE, or ADVANCED.`);
    }
  } else {
    throw new Error(`Missing difficulty value for exercise "${exercise.name}". AI must provide difficulty for all exercises.`);
  }

  return {
    name: exercise.name,
    englishName: exercise.englishName || null,
    description: exercise.description,
    category: exercise.category,
    muscleGroups: exercise.muscleGroups || [],
    equipment: exercise.equipment || [],
    difficulty: difficulty,
    sets: exercise.sets || null,
    reps: exercise.reps || null,
    duration: exercise.duration || null,
    restTime: exercise.restTime || null,
    weight: exercise.weight || null,
    youtubeUrl: exercise.youtubeUrl || null,
  };
}

// Vědecký výpočet BMR, TDEE a denních nutričních cílů
export function calculateNutritionTargets({
  age,
  gender,
  height,
  weight,
  targetWeight,
  fitnessGoal,
  activityLevel
}: {
  age: number,
  gender: string,
  height: number,
  weight: number,
  targetWeight?: number,
  fitnessGoal: string,
  activityLevel: string
}): { caloriesPerDay: number, proteinPerDay: number, carbsPerDay: number, fatPerDay: number } {
  // Kontrola povinných údajů
  if (!age || age <= 0) {
    throw new Error('Věk je povinný údaj a musí být větší než 0');
  }
  if (!gender || gender.trim() === '') {
    throw new Error('Pohlaví je povinný údaj');
  }
  if (!height || height <= 0) {
    throw new Error('Výška je povinný údaj a musí být větší než 0');
  }
  if (!weight || weight <= 0) {
    throw new Error('Váha je povinný údaj a musí být větší než 0');
  }

  // 1. BMR
  let bmr: number;
  if (gender.toLowerCase() === 'male' || gender.toLowerCase() === 'm' || gender.toLowerCase() === 'muž') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  // 2. Aktivita
  let activityMultiplier = 1.2;
  switch (activityLevel?.toLowerCase()) {
    case 'sedentary':
    case 'nízká':
      activityMultiplier = 1.2; break;
    case 'light':
    case 'lehce aktivní':
      activityMultiplier = 1.375; break;
    case 'moderate':
    case 'střední':
      activityMultiplier = 1.55; break;
    case 'active':
    case 'velmi aktivní':
      activityMultiplier = 1.725; break;
    case 'very active':
    case 'extrémně aktivní':
      activityMultiplier = 1.9; break;
  }
  let tdee = bmr * activityMultiplier;

  // 3. Úprava podle cíle
  let calories = tdee;
  switch (fitnessGoal?.toUpperCase()) {
    case 'WEIGHT_LOSS':
    case 'HUBNUTÍ':
      calories = tdee - 400; // Deficit
      break;
    case 'MUSCLE_GAIN':
    case 'NABÍRÁNÍ':
      calories = tdee + 300; // Surplus
      break;
    case 'ENDURANCE':
    case 'VYTRVALOST':
      calories = tdee + 150;
      break;
    case 'STRENGTH':
    case 'SÍLA':
      calories = tdee + 200;
      break;
    case 'FLEXIBILITY':
    case 'FLEXIBILITA':
      calories = tdee;
      break;
    case 'GENERAL_FITNESS':
    case 'OBECNÁ':
    default:
      calories = tdee;
      break;
  }
  calories = Math.round(calories);

  // 4. Makroživiny
  // Bílkoviny: 1.8g/kg pro hubnutí, 2.0g/kg pro nabírání, 1.6g/kg pro ostatní
  let proteinPerKg = 1.6;
  if (fitnessGoal?.toUpperCase() === 'WEIGHT_LOSS' || fitnessGoal?.toUpperCase() === 'HUBNUTÍ') proteinPerKg = 1.8;
  if (fitnessGoal?.toUpperCase() === 'MUSCLE_GAIN' || fitnessGoal?.toUpperCase() === 'NABÍRÁNÍ') proteinPerKg = 2.0;
  const proteinPerDay = parseFloat((weight * proteinPerKg).toFixed(2));

  // Tuky: 25% z kalorií, 1g tuku = 9 kcal
  const fatPerDay = parseFloat(((calories * 0.25) / 9).toFixed(2));

  // Sacharidy: zbytek kalorií
  const proteinCals = proteinPerDay * 4;
  const fatCals = fatPerDay * 9;
  const carbsCals = calories - proteinCals - fatCals;
  const carbsPerDay = parseFloat((carbsCals / 4).toFixed(2));

  return {
    caloriesPerDay: calories,
    proteinPerDay,
    carbsPerDay,
    fatPerDay
  };
}