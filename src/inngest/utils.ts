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

