import OpenAI from "openai";
import { createExerciseData, findExistingExercise } from "./utils";
import { inngest } from "./client";
import { PrismaClient } from "../generated/prisma";
import {
  ensureUserExists,
  getFitnessProfile,
  getOrCreateWorkoutPlan,
  generateWorkoutPlanDetails,
  generateWorkouts,
  updateFitnessProfile,
  activateWorkoutPlan,
  createFitnessProject,
  generateMealPlan
} from "./steps";
import {
  createWorkoutGenerationPrompt,
  WORKOUT_GENERATION_SYSTEM_PROMPT
} from "./prompts";
// Helper functions for AI generation
export async function generateWorkoutWithAI(
     weekNumber: number,
     dayOfWeek: string,
     fitnessGoal: string,
     experienceLevel: string,
     availableEquipment: string[],
     workoutDuration: number,
     hasInjuries: boolean,
     injuries: string,
     medicalConditions: string,
     age: string,
     gender: string,
     height: string,
     weight: string,
     targetWeight: string,
     activityLevel: string,
     preferredExercises: string,
     targetMuscleGroups: string[]
   ): Promise<{name: string, description: string, exercises: any[]}> {
     const openaiClient = new OpenAI({
       apiKey: process.env.OPENAI_API_KEY,
     });

     try {
       console.log(`Generating workout for ${dayOfWeek}...`);

       const prompt = createWorkoutGenerationPrompt({
         dayOfWeek,
         fitnessGoal,
         age,
         gender,
         height,
         weight,
         targetWeight,
         targetMuscleGroups,
         activityLevel,
         experienceLevel,
         preferredExercises,
         availableEquipment,
         workoutDuration,
         hasInjuries,
         injuries,
         medicalConditions
       });

             const completion = await openaiClient.chat.completions.create({
           model: "gpt-4o-mini",
           messages: [
                             {
             role: "system",
             content: WORKOUT_GENERATION_SYSTEM_PROMPT
           },
           { role: "user", content: prompt }
         ],
         temperature: 0.5, // Lower temperature for more consistent output
         max_tokens: 2000, // Increased for dual language names
       });

       const content = completion.choices[0]?.message?.content;
       if (!content) {
         console.error(`No content received from OpenAI`);
         throw new Error(`No content received from OpenAI`);
       }

       console.log(`Raw AI response:`, content);

       // Check if AI returned an apologetic response
       let finalContent = content;
       if (content.toLowerCase().includes("i'm sorry") ||
           content.toLowerCase().includes("omlouvám se") ||
           content.toLowerCase().includes("bohužel") ||
           content.toLowerCase().includes("nemohu") ||
           content.toLowerCase().includes("nelze") ||
           content.toLowerCase().includes("cannot") ||
           content.toLowerCase().includes("unable")) {

         console.log("AI returned apologetic response, trying with fallback prompt...");

         // Try again with a more explicit fallback prompt
         const fallbackPrompt = `VYGENERUJ TRÉNINK ZÁSADNĚ! Použij základní dostupné cviky. Pokud něco nejde, použij alternativy. NIKDY SE NEOMLOUVEJ - vždy generuj co nejlepší řešení v JSON formátu!`;

         const fallbackCompletion = await openaiClient.chat.completions.create({
           model: "gpt-4o-mini",
           messages: [
             {
               role: "system",
               content: WORKOUT_GENERATION_SYSTEM_PROMPT
             },
             { role: "user", content: prompt },
             { role: "user", content: fallbackPrompt }
           ],
           temperature: 0.1, // Lower temperature for more consistent output
           max_tokens: 2000,
         });

         const fallbackContent = fallbackCompletion.choices[0]?.message?.content;
         if (fallbackContent && !fallbackContent.toLowerCase().includes("i'm sorry")) {
           console.log("Fallback prompt successful, using fallback response");
           finalContent = fallbackContent;
         } else {
           throw new Error(`AI consistently returns apologetic responses. Raw response: ${content}`);
         }
       }

       // Try to extract JSON from the response
       let jsonContent = finalContent.trim();

       // Remove any markdown formatting
       jsonContent = jsonContent.replace(/```json\s*/g, '').replace(/```\s*$/g, '');

       // Find JSON object in the response
       const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
       if (jsonMatch) {
         jsonContent = jsonMatch[0];
       }

       console.log(`Extracted JSON:`, jsonContent);

       // Try to fix common JSON issues
       try {
         // Fix trailing commas in arrays and objects
         jsonContent = jsonContent.replace(/,(\s*[}\]])/g, '$1');
         // Fix missing quotes around property names
         jsonContent = jsonContent.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
       } catch (fixError) {
         console.warn('Error during JSON fixing:', fixError);
       }

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
         const validatedExercises = workout.exercises.map((exercise: any, index: number) => {
           if (!exercise.name || !exercise.englishName || !exercise.description || !exercise.category) {
             throw new Error(`Invalid exercise structure at index ${index}. Expected: name, englishName, description, category. Got: ${JSON.stringify(exercise)}`);
           }

           // Validate that both names are strings and not empty
           if (typeof exercise.name !== 'string' || exercise.name.trim() === '') {
             throw new Error(`Invalid exercise name at index ${index}. Must be a non-empty string. Got: "${exercise.name}"`);
           }
           if (typeof exercise.englishName !== 'string' || exercise.englishName.trim() === '') {
             throw new Error(`Invalid exercise englishName at index ${index}. Must be a non-empty string. Got: "${exercise.englishName}"`);
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
           console.log(exercise.youtubeUrl, "youtubeUrl")
           // Validate YouTube URL
           if (exercise.youtubeUrl) {
             // Basic YouTube URL validation
             const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
             if (!youtubeRegex.test(exercise.youtubeUrl)) {
               console.warn(`Invalid YouTube URL "${exercise.youtubeUrl}" for exercise "${exercise.name}". Setting to null.`);
               exercise.youtubeUrl = null;
             }
           } else {
             exercise.youtubeUrl = null;
           }

           return exercise;
         });

         return {
           name: workout.name,
           description: workout.description,
           exercises: validatedExercises
         };

       } catch (parseError: unknown) {
         console.error("JSON parse error:", parseError);
         console.error("Failed to parse content:", jsonContent);

         // Try to extract just the JSON part more aggressively
         const jsonStart = jsonContent.indexOf('{');
         const jsonEnd = jsonContent.lastIndexOf('}');

         if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
           const extractedJson = jsonContent.substring(jsonStart, jsonEnd + 1);
           try {
             const workout = JSON.parse(extractedJson);
             console.log("Successfully parsed extracted JSON");

             // Validate the workout structure
             if (!workout.name || !workout.description || !Array.isArray(workout.exercises)) {
               throw new Error(`Invalid workout structure from AI. Expected: name, description, and exercises array. Got: ${JSON.stringify(workout)}`);
             }

             if (workout.exercises.length === 0) {
               throw new Error(`AI returned empty exercises array for workout. Expected at least 4-6 exercises.`);
             }

             // Return the extracted workout
             return {
               name: workout.name,
               description: workout.description,
               exercises: workout.exercises
             };

           } catch (extractError) {
             const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);
             throw new Error(`Failed to parse JSON even after extraction. Original error: ${errorMessage}. Content: ${finalContent.substring(0, 200)}...`);
           }
         } else {
           const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);
           throw new Error(`Failed to parse JSON: ${errorMessage}. Content: ${finalContent.substring(0, 200)}...`);
         }
       }
     } catch (error) {
       console.error(`Error generating workout with OpenAI:`, error);

       throw new Error(`Failed to generate workout for ${dayOfWeek} after 3 attempts. Last error: ${error instanceof Error ? error.message : String(error)}`);
     }
   }



           type GenerateFitnessPlanEvent = {
        name: "generate-fitness-plan/run";
        data: {
          assessmentData: any;
          userId: string;
          workoutPlanId: string | null;
        };
      };

     export const generateFitnessPlanFunction = inngest.createFunction(
       { id: "generate-fitness-plan" },
       { event: "generate-fitness-plan/run" },
       async ({ event, step }: { event: GenerateFitnessPlanEvent, step: any }) => {
         const prisma = new PrismaClient();
         const { assessmentData, userId, workoutPlanId } = event.data;

         console.log("Starting fitness plan generation for user:", userId);
         console.log("Assessment data:", assessmentData);
         console.log("Using existing workout plan ID:", workoutPlanId);
         console.log("DEBUG: assessmentData.dietaryRestrictions:", assessmentData.dietaryRestrictions);
         console.log("DEBUG: assessmentData keys:", Object.keys(assessmentData));

         try {

           // Ensure user exists in database
           await step.run("ensure-user-exists", async () => {
             await ensureUserExists(prisma, userId);
           });
           // Get the existing fitness profile
           const fitnessProfile = await step.run("get-fitness-profile", async () => {
             return await getFitnessProfile(prisma, userId, assessmentData);
           });

           // Get or create the workout plan
           const workoutPlan = await step.run("get-or-create-workout-plan", async () => {
             return await getOrCreateWorkoutPlan(prisma, workoutPlanId, fitnessProfile.id, assessmentData);
           });

           console.log("Workout plan ready for use:", {
             id: workoutPlan.id,
             name: workoutPlan.name,
             fitnessProfileId: workoutPlan.fitnessProfileId
           });

           // Generate workout plan details using AI
           const planData = await step.run("generate-workout-plan-details", async () => {
             return await generateWorkoutPlanDetails(prisma, workoutPlan.id, assessmentData);
           });

           // Generate workouts for each week using AI (optimized to reduce API calls)
           await step.run("generate-workouts", async () => {
             await generateWorkouts(prisma, workoutPlan.id, assessmentData);
           });

           // Generate meal plan if meal planning is enabled
           let mealPlanData = null;
           if (assessmentData.mealPlanningEnabled) {
             mealPlanData = await step.run("generate-meal-plan", async () => {
               return await generateMealPlan(prisma, fitnessProfile.id, assessmentData);
             });
           }

           // Update the fitness profile to set the current workout plan (always do this)
           await step.run("update-fitness-profile", async () => {
             await updateFitnessProfile(prisma, fitnessProfile.id, workoutPlan.id);
           });

           // Set the workout plan as active after successful generation
           await step.run("activate-workout-plan", async () => {
             await activateWorkoutPlan(prisma, workoutPlan.id, fitnessProfile.id);
           });

           // Create fitness plan project and success message
           await step.run("create-fitness-project", async () => {
             return await createFitnessProject(prisma, userId, planData, assessmentData);
           });

           console.log("Fitness plan generation completed successfully:", {
             planId: workoutPlan.id,
             planName: planData.name,
             userId,
             fitnessProfileId: fitnessProfile.id,
             mealPlanId: mealPlanData?.mealPlanId || null
           });

           console.log("All steps completed, returning success...");

           return {
             success: true,
             planId: workoutPlan.id,
             planName: planData.name,
             mealPlanId: mealPlanData?.mealPlanId || null,
             mealCount: mealPlanData?.mealCount || 0,
             message: "Fitness plan generated successfully",
           };

         } catch (error: any) {
           console.error("Error in generateFitnessPlan function:", error);
           // NEVYTVÁŘEJ error projekt, pouze loguj chybu
           throw error;
         } finally {
           await prisma.$disconnect();
         }
       },
     );


type RegenerateMealPlanEvent = {
  name: "regenerate-meal-plan/run";
  data: {
    userId: string;
    assessmentData: any;
  };
};

export const regenerateMealPlanFunction = inngest.createFunction(
  { id: "regenerate-meal-plan" },
  { event: "regenerate-meal-plan/run" },
  async ({ event, step }: { event: RegenerateMealPlanEvent, step: any }) => {
    const prisma = new PrismaClient();
    const { userId, assessmentData } = event.data;

    console.log("Starting meal plan regeneration for user:", userId);

    try {
      // Get the fitness profile
      const fitnessProfile = await step.run("get-fitness-profile", async () => {
        return await getFitnessProfile(prisma, userId, assessmentData);
      });

      // Generate new meal plan
      const mealPlanData = await step.run("generate-meal-plan", async () => {
        return await generateMealPlan(prisma, fitnessProfile.id, assessmentData);
      });

      console.log("Meal plan regeneration completed successfully:", {
        mealPlanId: mealPlanData.mealPlanId,
        mealCount: mealPlanData.mealCount,
        userId,
        fitnessProfileId: fitnessProfile.id
      });

      return {
        success: true,
        mealPlanId: mealPlanData.mealPlanId,
        mealCount: mealPlanData.mealCount,
        message: "Meal plan regenerated successfully",
      };

    } catch (error: any) {
      console.error("Error in regenerateMealPlan function:", error);
           throw error;
         } finally {
           await prisma.$disconnect();
         }
       },
     );

