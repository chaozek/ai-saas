import { inngest } from "./client";
import { Agent, openai, createAgent, createTool, createNetwork, Message, createState } from "@inngest/agent-kit";
import { getAssessmentData, generateFitnessPlan } from "./utils";
import z from "zod";
import { FITNESS_ASSESSMENT_PROMPT, PLAN_GENERATION_PROMPT } from "@/prompt";
import { PrismaClient } from "../generated/prisma";
import OpenAI from "openai";

// Helper functions for AI generation
async function generateWorkoutWithAI(weekNumber: number, dayOfWeek: string, fitnessGoal: string, experienceLevel: string, availableEquipment: string[], workoutDuration: number): Promise<{name: string, description: string, exercises: any[]}> {
  const openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Retry logic - try up to 3 times
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`Attempt ${attempt} to generate workout for ${dayOfWeek}...`);

      const prompt = `Generate a workout for ${dayOfWeek} based on these parameters:
- Fitness Goal: ${fitnessGoal}
- Experience Level: ${experienceLevel}
- Available Equipment: ${availableEquipment.join(', ')}
- Workout Duration: ${workoutDuration} minutes

Create a progressive workout that:
- Matches the fitness goal (weight loss = cardio focus, muscle gain = strength focus, etc.)
- Is appropriate for the experience level
- Uses available equipment
- Fits within the time limit
- Includes 4-6 exercises with proper progression

CRITICAL: You must respond with ONLY valid JSON in this exact format. No additional text, no explanations, no markdown formatting:

{
  "name": "Workout Name",
  "description": "Brief description of the workout focus and benefits",
  "exercises": [
    {
      "name": "Exercise Name",
      "description": "Brief description of the exercise and proper form",
      "category": "strength|cardio|flexibility",
      "muscleGroups": ["chest", "back", "legs", "core", "arms", "shoulders"],
      "equipment": ["dumbbells", "resistance bands", "bodyweight"],
      "difficulty": "BEGINNER|INTERMEDIATE|ADVANCED",
      "sets": 3,
      "reps": 12,
      "duration": null,
      "restTime": 90,
      "weight": 10.0
    }
  ]
}

For strength exercises, use sets and reps. For cardio/flexibility, use duration in seconds.
CRITICAL: Use ONLY these exact difficulty values with CAPITAL letters: "BEGINNER", "INTERMEDIATE", "ADVANCED".
Do NOT use lowercase or any other variations.
For weight field, use ONLY numbers (e.g., 5.0, 10.0, 20.0) or null. Do NOT use strings like "light", "medium", "heavy".
Ensure exercises are safe and appropriate for the experience level.`;

      const completion = await openaiClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a professional fitness trainer. You MUST respond with ONLY valid JSON in the exact format requested. Do not include any additional text, explanations, or markdown formatting outside the JSON object."
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.5, // Lower temperature for more consistent output
        max_tokens: 1000,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        console.error(`Attempt ${attempt}: No content received from OpenAI`);
        continue;
      }

      console.log(`Attempt ${attempt}: Raw AI response:`, content);

      // Try to extract JSON from the response
      let jsonContent = content.trim();

      // Remove any markdown formatting
      jsonContent = jsonContent.replace(/```json\s*/g, '').replace(/```\s*$/g, '');

      // Find JSON object in the response
      const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonContent = jsonMatch[0];
      }

      console.log(`Attempt ${attempt}: Extracted JSON:`, jsonContent);

      try {
        const workout = JSON.parse(jsonContent);

        // Validate the workout structure
        if (!workout.name || !workout.description || !Array.isArray(workout.exercises)) {
          throw new Error(`Invalid workout structure from AI. Expected: name, description, and exercises array. Got: ${JSON.stringify(workout)}`);
        }

        if (workout.exercises.length === 0) {
          throw new Error(`AI returned empty exercises array for workout. Expected at least 4-6 exercises.`);
        }

        // Validate difficulty values in exercises
        const validatedExercises = workout.exercises.map((exercise: any) => {
          if (!exercise.name || !exercise.description || !exercise.category) {
            throw new Error(`Invalid exercise structure. Expected: name, description, category. Got: ${JSON.stringify(exercise)}`);
          }

          if (exercise.difficulty) {
            const difficultyUpper = exercise.difficulty.toUpperCase();
            if (difficultyUpper === 'BEGINNER' || difficultyUpper === 'INTERMEDIATE' || difficultyUpper === 'ADVANCED') {
              exercise.difficulty = difficultyUpper;
            } else {
              throw new Error(`Invalid difficulty value: "${exercise.difficulty}" for exercise "${exercise.name}". Expected: BEGINNER, INTERMEDIATE, or ADVANCED.`);
            }
          } else {
            throw new Error(`Missing difficulty value for exercise "${exercise.name}". AI must provide difficulty for all exercises.`);
          }

          // Validate and convert weight to number or null
          if (exercise.weight !== null && exercise.weight !== undefined) {
            if (typeof exercise.weight === 'string') {
              // Convert string weight descriptions to numbers
              const weightLower = exercise.weight.toLowerCase();
              if (weightLower === 'light' || weightLower === 'lightweight') {
                exercise.weight = 5.0; // 5kg/10lbs
              } else if (weightLower === 'medium' || weightLower === 'moderate') {
                exercise.weight = 10.0; // 10kg/20lbs
              } else if (weightLower === 'heavy' || weightLower === 'heavyweight') {
                exercise.weight = 20.0; // 20kg/40lbs
              } else {
                // Try to parse as number
                const parsedWeight = parseFloat(exercise.weight);
                if (isNaN(parsedWeight)) {
                  console.warn(`Invalid weight value "${exercise.weight}" for exercise "${exercise.name}". Setting to null.`);
                  exercise.weight = null;
                } else {
                  exercise.weight = parsedWeight;
                }
              }
            } else if (typeof exercise.weight === 'number') {
              // Weight is already a number, keep it
            } else {
              console.warn(`Invalid weight type for exercise "${exercise.name}". Setting to null.`);
              exercise.weight = null;
            }
          } else {
            exercise.weight = null;
          }

          return exercise;
        });

        console.log(`Attempt ${attempt}: Successfully generated workout: ${workout.name}`);
        return {
          name: workout.name,
          description: workout.description,
          exercises: validatedExercises
        };
      } catch (jsonError) {
        console.error(`Attempt ${attempt}: JSON parsing error:`, jsonError);
        console.error(`Attempt ${attempt}: Raw AI response:`, content);

        if (attempt === 3) {
          // On final attempt, throw the error
          throw new Error(`Failed to parse JSON after 3 attempts for ${dayOfWeek}. Last error: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}. Raw response: ${content.substring(0, 200)}...`);
        }
      }
    } catch (error) {
      console.error(`Attempt ${attempt}: Error generating workout with OpenAI:`, error);

      if (attempt === 3) {
        // On final attempt, throw the error
        throw new Error(`Failed to generate workout for ${dayOfWeek} after 3 attempts. Last error: ${error instanceof Error ? error.message : String(error)}`);
      }

      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  // This should never be reached, but just in case
  throw new Error(`Failed to generate workout for ${dayOfWeek} after all attempts.`);
}

async function generateMealWithAI(day: number, mealType: string, fitnessGoal: string, dietaryRestrictions: string[], preferredCuisines: string[], cookingSkill: string, calories: number, protein: number, carbs: number, fat: number): Promise<{name: string, description: string, calories: number, protein: number, carbs: number, fat: number, instructions: string, ingredients: any[]}> {
  const openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Retry logic - try up to 3 times
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`Attempt ${attempt} to generate meal for ${mealType}...`);

      const prompt = `Generate a meal for ${mealType.toLowerCase()} with these requirements:
- Fitness Goal: ${fitnessGoal}
- Dietary Restrictions: ${dietaryRestrictions.join(', ') || 'none'}
- Preferred Cuisines: ${preferredCuisines.join(', ')}
- Cooking Skill: ${cookingSkill}
- Target Nutrition: ${calories} calories, ${protein}g protein, ${carbs}g carbs, ${fat}g fat

Create a delicious, nutritious meal that:
- Supports the fitness goal (weight loss = lower calories, muscle gain = higher protein, etc.)
- Respects dietary restrictions
- Uses preferred cuisines when possible
- Is appropriate for the cooking skill level
- Meets the target nutrition goals
- Is practical and achievable

CRITICAL: You must respond with ONLY valid JSON in this exact format. No additional text, no explanations, no markdown formatting:

{
  "name": "Creative Meal Name",
  "description": "Brief description of the meal and its benefits",
  "calories": ${calories},
  "protein": ${protein},
  "carbs": ${carbs},
  "fat": ${fat},
  "instructions": "1. Step one\\n2. Step two\\n3. Step three\\n4. Step four\\n5. Step five",
  "ingredients": [
    {"name": "Ingredient Name", "amount": "1", "unit": "cup"},
    {"name": "Another Ingredient", "amount": "2", "unit": "tbsp"}
  ]
}

Include 4-8 ingredients with realistic amounts and clear, step-by-step instructions.`;

      const completion = await openaiClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a professional nutritionist and chef. You MUST respond with ONLY valid JSON in the exact format requested. Do not include any additional text, explanations, or markdown formatting outside the JSON object."
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.5, // Lower temperature for more consistent output
        max_tokens: 1000,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        console.error(`Attempt ${attempt}: No content received from OpenAI`);
        continue;
      }

      console.log(`Attempt ${attempt}: Raw AI response:`, content);

      // Try to extract JSON from the response
      let jsonContent = content.trim();

      // Remove any markdown formatting
      jsonContent = jsonContent.replace(/```json\s*/g, '').replace(/```\s*$/g, '');

      // Find JSON object in the response
      const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonContent = jsonMatch[0];
      }

      console.log(`Attempt ${attempt}: Extracted JSON:`, jsonContent);

      try {
        const meal = JSON.parse(jsonContent);

        // Validate the meal structure
        if (!meal.name || !meal.description || !meal.calories || !meal.protein || !meal.carbs || !meal.fat || !meal.instructions || !Array.isArray(meal.ingredients)) {
          throw new Error(`Invalid meal structure from AI. Expected: name, description, calories, protein, carbs, fat, instructions, and ingredients array. Got: ${JSON.stringify(meal)}`);
        }

        if (meal.ingredients.length === 0) {
          throw new Error(`AI returned empty ingredients array for meal. Expected at least 4-8 ingredients.`);
        }

        // Validate each ingredient
        meal.ingredients.forEach((ingredient: any, index: number) => {
          if (!ingredient.name || !ingredient.amount || !ingredient.unit) {
            throw new Error(`Invalid ingredient structure at index ${index}. Expected: name, amount, unit. Got: ${JSON.stringify(ingredient)}`);
          }
        });

        console.log(`Attempt ${attempt}: Successfully generated meal: ${meal.name}`);
        return {
          name: meal.name,
          description: meal.description,
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fat: meal.fat,
          instructions: meal.instructions,
          ingredients: meal.ingredients
        };
      } catch (jsonError) {
        console.error(`Attempt ${attempt}: JSON parsing error:`, jsonError);
        console.error(`Attempt ${attempt}: Raw AI response:`, content);

        if (attempt === 3) {
          // On final attempt, throw the error
          throw new Error(`Failed to parse JSON after 3 attempts for ${mealType}. Last error: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}. Raw response: ${content.substring(0, 200)}...`);
        }
      }
    } catch (error) {
      console.error(`Attempt ${attempt}: Error generating meal with OpenAI:`, error);

      if (attempt === 3) {
        // On final attempt, throw the error
        throw new Error(`Failed to generate meal for ${mealType} after 3 attempts. Last error: ${error instanceof Error ? error.message : String(error)}`);
      }

      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  // This should never be reached, but just in case
  throw new Error(`Failed to generate meal for ${mealType} after all attempts.`);
}

type GenerateFitnessPlanEvent = {
  name: "generate-fitness-plan/run";
  data: {
    assessmentData: any;
    userId: string;
  };
};

export const generateFitnessPlanFunction = inngest.createFunction(
  { id: "generate-fitness-plan" },
  { event: "generate-fitness-plan/run" },
  async ({ event, step }: { event: GenerateFitnessPlanEvent, step: any }) => {
    const prisma = new PrismaClient();
    const { assessmentData, userId } = event.data;

    console.log("Starting fitness plan generation for user:", userId);
    console.log("Assessment data:", assessmentData);

    try {

      // Ensure user exists in database
      await step.run("ensure-user-exists", async () => {
        const existingUser = await prisma.user.findUnique({
          where: { id: userId }
        });

        if (!existingUser) {
          console.log("Creating user in database:", userId);
          await prisma.user.create({
            data: { id: userId }
          });
        } else {
          console.log("User already exists in database:", userId);
        }
      });

      // Create or update fitness profile
      const fitnessProfile = await step.run("create-fitness-profile", async () => {
        const profile = await prisma.fitnessProfile.upsert({
          where: { userId },
          update: {
            age: parseInt(assessmentData.age),
            gender: assessmentData.gender,
            height: parseFloat(assessmentData.height),
            weight: parseFloat(assessmentData.weight),
            targetWeight: assessmentData.targetWeight ? parseFloat(assessmentData.targetWeight) : null,
            fitnessGoal: assessmentData.fitnessGoal,
            activityLevel: assessmentData.activityLevel,
            experienceLevel: assessmentData.experienceLevel,
            hasInjuries: assessmentData.hasInjuries,
            injuries: assessmentData.injuries || null,
            medicalConditions: assessmentData.medicalConditions || null,
            availableDays: JSON.stringify(assessmentData.availableDays),
            workoutDuration: parseInt(assessmentData.workoutDuration),
            preferredExercises: assessmentData.preferredExercises || null,
            equipment: JSON.stringify(assessmentData.equipment),
            mealPlanningEnabled: assessmentData.mealPlanningEnabled,
            dietaryRestrictions: assessmentData.dietaryRestrictions,
            allergies: assessmentData.allergies,
            budgetPerWeek: assessmentData.budgetPerWeek ? parseFloat(assessmentData.budgetPerWeek) : null,
            mealPrepTime: assessmentData.mealPrepTime ? parseInt(assessmentData.mealPrepTime) : null,
            preferredCuisines: assessmentData.preferredCuisines,
            cookingSkill: assessmentData.cookingSkill,
          },
          create: {
            userId,
            age: parseInt(assessmentData.age),
            gender: assessmentData.gender,
            height: parseFloat(assessmentData.height),
            weight: parseFloat(assessmentData.weight),
            targetWeight: assessmentData.targetWeight ? parseFloat(assessmentData.targetWeight) : null,
            fitnessGoal: assessmentData.fitnessGoal,
            activityLevel: assessmentData.activityLevel,
            experienceLevel: assessmentData.experienceLevel,
            hasInjuries: assessmentData.hasInjuries,
            injuries: assessmentData.injuries || null,
            medicalConditions: assessmentData.medicalConditions || null,
            availableDays: JSON.stringify(assessmentData.availableDays),
            workoutDuration: parseInt(assessmentData.workoutDuration),
            preferredExercises: assessmentData.preferredExercises || null,
            equipment: JSON.stringify(assessmentData.equipment),
            mealPlanningEnabled: assessmentData.mealPlanningEnabled,
            dietaryRestrictions: assessmentData.dietaryRestrictions,
            allergies: assessmentData.allergies,
            budgetPerWeek: assessmentData.budgetPerWeek ? parseFloat(assessmentData.budgetPerWeek) : null,
            mealPrepTime: assessmentData.mealPrepTime ? parseInt(assessmentData.mealPrepTime) : null,
            preferredCuisines: assessmentData.preferredCuisines,
            cookingSkill: assessmentData.cookingSkill,
          },
        });
        return profile;
      });

      // Generate workout plan using AI
      const planData = await step.run("generate-workout-plan", async () => {
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
          - Has Injuries: ${assessmentData.hasInjuries}
          - Injuries: ${assessmentData.injuries || 'None'}
          - Medical Conditions: ${assessmentData.medicalConditions || 'None'}
          - Available Days: ${assessmentData.availableDays.join(', ')}
          - Workout Duration: ${assessmentData.workoutDuration} minutes
          - Preferred Exercises: ${assessmentData.preferredExercises || 'None specified'}
          - Available Equipment: ${assessmentData.equipment.join(', ')}

          Please generate a comprehensive 8-week workout plan based on this assessment data.
        `;

        const completion = await openaiClient.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: PLAN_GENERATION_PROMPT },
            { role: "user", content: assessmentPrompt }
          ],
          temperature: 0.7,
        });

        const planContent = completion.choices[0]?.message?.content || "Plan generation failed";

        // For now, we'll create a basic plan structure
        // In a real implementation, you'd parse the AI response more sophisticatedly
        return {
          name: `${assessmentData.fitnessGoal.replace('_', ' ')} Plan`,
          description: `Personalized ${assessmentData.fitnessGoal.toLowerCase().replace('_', ' ')} program designed for ${assessmentData.experienceLevel.toLowerCase()} level`,
          duration: 8,
          difficulty: assessmentData.experienceLevel,
          planContent,
        };
      });

      // Create workout plan in database
      const workoutPlan = await step.run("create-workout-plan", async () => {
        // First, deactivate any existing active plans for this profile
        await prisma.workoutPlan.updateMany({
          where: {
            fitnessProfileId: fitnessProfile.id,
            isActive: true
          },
          data: {
            isActive: false,
            activeProfileId: null
          },
        });

        // Create the new plan and set it as active
        const plan = await prisma.workoutPlan.create({
          data: {
            name: planData.name,
            description: planData.description,
            duration: planData.duration,
            difficulty: planData.difficulty,
            fitnessProfileId: fitnessProfile.id,
            isActive: true,
            activeProfileId: fitnessProfile.id,
          },
        });

        return plan;
      });

      // Generate workouts for each week using AI (optimized to reduce API calls)
      await step.run("generate-workouts", async () => {
        const availableDays = assessmentData.availableDays;
        const workoutDuration = parseInt(assessmentData.workoutDuration);
        const workoutPromises: Promise<any>[] = [];

        // Generate workout templates for each day (only once, not per week)
        const workoutTemplates: { [day: string]: any } = {};

        console.log(`Generating ${availableDays.length} workout templates for days: ${availableDays.join(', ')}`);

        for (let dayIndex = 0; dayIndex < availableDays.length; dayIndex++) {
          const day = availableDays[dayIndex];

          // Generate workout template using AI (only once per day)
          const aiWorkout = await generateWorkoutWithAI(
            1, // Use week 1 as template
            day,
            assessmentData.fitnessGoal,
            assessmentData.experienceLevel,
            assessmentData.equipment,
            workoutDuration
          );

          workoutTemplates[day] = aiWorkout;
          console.log(`Generated template for ${day}: ${aiWorkout.name}`);
        }

        // Create workouts for each week using the templates
        for (let week = 1; week <= 8; week++) {
          for (let dayIndex = 0; dayIndex < availableDays.length; dayIndex++) {
            const day = availableDays[dayIndex];
            const dayIndexNum = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(day);
            const template = workoutTemplates[day];

            // Create workout promise using template
            const workoutPromise = prisma.workout.create({
              data: {
                name: `Week ${week} - ${template.name}`,
                description: template.description,
                dayOfWeek: dayIndexNum,
                weekNumber: week,
                duration: workoutDuration,
                workoutPlanId: workoutPlan.id,
                exercises: {
                  create: template.exercises.map((exercise: any) => {
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

                    const exerciseData = {
                      name: exercise.name,
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
                    };

                    return exerciseData;
                  }),
                },
              },
            });

            workoutPromises.push(workoutPromise);
          }
        }

        // Wait for all workouts to be created
        const createdWorkouts = await Promise.all(workoutPromises);
        console.log(`Created ${createdWorkouts.length} workouts using ${availableDays.length} AI-generated templates for plan ${workoutPlan.id}`);

        // Verify workouts were created
        const workoutCount = await prisma.workout.count({
          where: { workoutPlanId: workoutPlan.id }
        });
        console.log(`Total workouts in database for plan ${workoutPlan.id}: ${workoutCount}`);
      });

      // Generate meal plan if enabled
      if (assessmentData.mealPlanningEnabled) {
        console.log("Meal planning is enabled, generating meal plan...");
        await step.run("generate-meal-plan", async () => {
          console.log("Deactivating existing meal plans for profile:", fitnessProfile.id);
          // First, deactivate any existing active meal plans for this profile
          await prisma.mealPlan.updateMany({
            where: {
              fitnessProfileId: fitnessProfile.id,
              isActive: true
            },
            data: {
              isActive: false,
              activeProfileId: null
            },
          });

          console.log("Creating new meal plan...");
          // Create the new meal plan
          const mealPlan = await prisma.mealPlan.create({
            data: {
              name: `${assessmentData.fitnessGoal.replace('_', ' ')} Monthly Meal Plan`,
              description: `Personalized ${assessmentData.fitnessGoal.toLowerCase().replace('_', ' ')} meal plan for 30 days`,
              duration: 30, // 30 days (entire month)
              caloriesPerDay: assessmentData.fitnessGoal === 'WEIGHT_LOSS' ? 1800 : 2200,
              proteinPerDay: assessmentData.fitnessGoal === 'MUSCLE_GAIN' ? 150 : 120,
              carbsPerDay: assessmentData.fitnessGoal === 'WEIGHT_LOSS' ? 150 : 200,
              fatPerDay: 60,
              budgetPerWeek: parseFloat(assessmentData.budgetPerWeek),
              isActive: true,
              activeProfileId: fitnessProfile.id,
              fitnessProfileId: fitnessProfile.id,
            },
          });

          // Generate meal templates using AI (optimized to reduce API calls)
          const mealTypes = ['BREAKFAST', 'LUNCH', 'DINNER'];
          const mealTemplates: { [mealType: string]: any } = {};
          const mealPromises: Promise<any>[] = [];

          console.log(`Generating ${mealTypes.length} meal templates for types: ${mealTypes.join(', ')}`);

          // Generate meal templates (only once per meal type)
          for (const mealType of mealTypes) {
            // Calculate target nutrition based on fitness goal
            let baseCalories = mealType === 'BREAKFAST' ? 500 : mealType === 'LUNCH' ? 700 : 600;
            let baseProtein = mealType === 'BREAKFAST' ? 25 : mealType === 'LUNCH' ? 35 : 40;
            let baseCarbs = mealType === 'BREAKFAST' ? 60 : mealType === 'LUNCH' ? 80 : 65;
            let baseFat = mealType === 'BREAKFAST' ? 20 : mealType === 'LUNCH' ? 25 : 25;

            // Adjust based on fitness goal
            if (assessmentData.fitnessGoal === 'WEIGHT_LOSS') {
              baseCalories = Math.floor(baseCalories * 0.8);
              baseCarbs = Math.floor(baseCarbs * 0.8);
            } else if (assessmentData.fitnessGoal === 'MUSCLE_GAIN') {
              baseProtein = Math.floor(baseProtein * 1.2);
              baseCalories = Math.floor(baseCalories * 1.1);
            }

            // Generate meal template using AI (only once per meal type)
            const aiMeal = await generateMealWithAI(
              1, // Use day 1 as template
              mealType,
              assessmentData.fitnessGoal,
              assessmentData.dietaryRestrictions,
              assessmentData.preferredCuisines,
              assessmentData.cookingSkill,
              baseCalories,
              baseProtein,
              baseCarbs,
              baseFat
            );

            mealTemplates[mealType] = aiMeal;
            console.log(`Generated template for ${mealType}: ${aiMeal.name}`);
          }

                    // Create meals for each day using the templates
          console.log(`Creating meals for 30 days with proper week/day structure...`);

          for (let day = 1; day <= 30; day++) {
            // Calculate week number
            const weekNumber = Math.ceil(day / 7);

            console.log(`Day ${day}: Week ${weekNumber}`);

            for (const mealType of mealTypes) {
              const template = mealTemplates[mealType];

              const mealPromise = prisma.meal.create({
                data: {
                  name: `Day ${day} - ${template.name}`,
                  description: template.description,
                  mealType: mealType as any,
                  dayOfWeek: day, // Use actual day number (1-30), not day of week (0-6)
                  weekNumber: weekNumber,
                  calories: template.calories,
                  protein: template.protein,
                  carbs: template.carbs,
                  fat: template.fat,
                  prepTime: parseInt(assessmentData.mealPrepTime),
                  cookTime: 30,
                  servings: 1,
                  mealPlanId: mealPlan.id,
                  recipes: {
                    create: {
                      name: `Day ${day} - ${template.name} Recipe`,
                      description: template.description,
                      instructions: template.instructions,
                      ingredients: JSON.stringify(template.ingredients),
                      nutrition: JSON.stringify({
                        calories: template.calories,
                        protein: template.protein,
                        carbs: template.carbs,
                        fat: template.fat,
                        fiber: Math.floor(Math.random() * 8) + 3,
                        sugar: Math.floor(Math.random() * 15) + 5
                      }),
                      prepTime: parseInt(assessmentData.mealPrepTime),
                      cookTime: Math.floor(Math.random() * 20) + 20,
                      servings: 1,
                      difficulty: assessmentData.cookingSkill,
                      cuisine: assessmentData.preferredCuisines[day % assessmentData.preferredCuisines.length] || "american",
                      tags: assessmentData.dietaryRestrictions.length > 0 ? assessmentData.dietaryRestrictions : ["healthy", "balanced"],
                    }
                  }
                },
              });

              mealPromises.push(mealPromise);
            }
          }

          // Wait for all meals to be created
          const createdMeals = await Promise.all(mealPromises);
          console.log(`Created ${createdMeals.length} meals using ${mealTypes.length} AI-generated templates for meal plan ${mealPlan.id}`);

          // Verify meal plan was created
          const mealPlanCount = await prisma.mealPlan.count({
            where: { fitnessProfileId: fitnessProfile.id }
          });
          console.log(`Total meal plans in database for profile ${fitnessProfile.id}: ${mealPlanCount}`);

          return mealPlan;
        });
      }

      // Create fitness plan project and success message
      await step.run("create-fitness-project", async () => {
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
      });

      console.log("Fitness plan generation completed successfully:", {
        planId: workoutPlan.id,
        planName: planData.name,
        userId,
        fitnessProfileId: fitnessProfile.id
      });

      return {
        success: true,
        planId: workoutPlan.id,
        planName: planData.name,
        message: "Fitness plan generated successfully",
      };

    } catch (error: any) {
      console.error("Error in generateFitnessPlan function:", error);

      // Create error project and message
      await step.run("create-error-project", async () => {
        const project = await prisma.project.create({
          data: {
            name: `Fitness Plan Error - ${new Date().toLocaleDateString()}`,
            userId: userId,
            messages: {
              create: {
                content: "Sorry, there was an error generating your fitness plan. Please try again or contact support.",
                role: "ASSISTANT",
                type: "ERROR",
              }
            }
          },
        });

        return project;
      });

      throw error;
    } finally {
      await prisma.$disconnect();
    }
  },
);

type GenerateShoppingListEvent = {
  name: "generate-shopping-list/run";
  data: {
    weekNumber: number;
    weekMeals: any[];
    userId: string;
  };
};

export const generateShoppingListFunction = inngest.createFunction(
  { id: "generate-shopping-list" },
  { event: "generate-shopping-list/run" },
  async ({ event, step }: { event: GenerateShoppingListEvent, step: any }) => {
    const { weekNumber, weekMeals, userId } = event.data;

    console.log(`Starting shopping list generation for Week ${weekNumber}, user: ${userId}`);

    try {
      // Collect all ingredients from the week's meals
      const allIngredients: any[] = [];
      weekMeals.forEach(meal => {
        meal.recipes?.forEach((recipe: any) => {
          try {
            const ingredients = JSON.parse(recipe.ingredients);
            ingredients.forEach((ingredient: any) => {
              // Check if ingredient already exists
              const existingIndex = allIngredients.findIndex(
                item => item.name.toLowerCase() === ingredient.name.toLowerCase()
              );

              if (existingIndex >= 0) {
                // Add quantities
                const existing = allIngredients[existingIndex];
                const existingAmount = parseFloat(existing.amount) || 0;
                const newAmount = parseFloat(ingredient.amount) || 0;
                allIngredients[existingIndex] = {
                  ...existing,
                  amount: (existingAmount + newAmount).toString(),
                  count: (existing.count || 1) + 1
                };
              } else {
                allIngredients.push({
                  ...ingredient,
                  count: 1
                });
              }
            });
          } catch (e) {
            console.error("Error parsing ingredients:", e);
          }
        });
      });

      console.log(`Collected ${allIngredients.length} unique ingredients for Week ${weekNumber}`);

      // Generate organized shopping list using AI
      const shoppingList = await step.run("generate-organized-list", async () => {
        const openaiClient = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });

        const prompt = `Create a well-organized shopping list for Week ${weekNumber}. Here are all the ingredients needed:

${allIngredients.map(ing => `- ${ing.amount} ${ing.unit} ${ing.name} (used in ${ing.count} recipes)`).join('\n')}

Please organize this into a clean shopping list with:
1. Categories (Produce, Dairy, Meat, Pantry, etc.)
2. Consolidated quantities
3. Any additional items that might be needed (cooking oil, spices, etc.)
4. Tips for shopping efficiently

Format as a clean, organized list that's easy to follow at the grocery store.`;

        const completion = await openaiClient.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that creates organized shopping lists. Always respond with a clean, well-structured shopping list that's easy to follow at the grocery store."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000,
        });

        return completion.choices[0]?.message?.content || 'Failed to generate shopping list';
      });

      // Create a project to store the shopping list
      await step.run("create-shopping-list-project", async () => {
        const prisma = new PrismaClient();

        const project = await prisma.project.create({
          data: {
            name: `Week ${weekNumber} Shopping List - ${new Date().toLocaleDateString()}`,
            userId: userId,
            messages: {
              create: {
                content: `Here's your organized shopping list for Week ${weekNumber}:\n\n${shoppingList}`,
                role: "ASSISTANT",
                type: "PLAN_GENERATED",
              }
            }
          },
        });

        await prisma.$disconnect();
        return project;
      });

      console.log(`Shopping list generated successfully for Week ${weekNumber}`);

      return {
        success: true,
        weekNumber,
        shoppingList,
        message: `Shopping list generated for Week ${weekNumber}`,
      };

    } catch (error: any) {
      console.error(`Error in generateShoppingList function for Week ${weekNumber}:`, error);
      throw error;
    }
  },
);
