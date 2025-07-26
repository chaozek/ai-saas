
import { PrismaClient } from "../generated/prisma";
import { calculateNutritionTargets } from "./utils";
import { generateMealWithAI } from "./ai-generation";
import { inngest } from "./client";

export const generateMealPlanOnlyFunction = inngest.createFunction(
     { id: "generate-meal-plan-only" },
     { event: "generate-meal-plan-only/run" },
     async ({ event, step }: { event: { data: { userId: string, fitnessProfileId: string } }, step: any }) => {
       const prisma = new PrismaClient();
       const { userId, fitnessProfileId } = event.data;

       console.log("Starting meal plan only generation for user:", userId);
       console.log("Fitness profile ID:", fitnessProfileId);

       try {
         // Get the existing fitness profile
         const fitnessProfile = await step.run("get-fitness-profile", async () => {
           const profile = await prisma.fitnessProfile.findUnique({
             where: { id: fitnessProfileId }
           });

           if (!profile) {
             throw new Error("Fitness profile not found");
           }

           if (!profile.mealPlanningEnabled) {
             throw new Error("Meal planning is not enabled for this profile");
           }

           console.log("Found fitness profile:", profile.id);
           return profile;
         });

         // Calculate nutrition requirements using scientific formulas
         const nutritionRequirements = await step.run("calculate-nutrition-requirements", async () => {
           try {
             return calculateNutritionTargets({
               age: parseInt(fitnessProfile.age),
               gender: fitnessProfile.gender,
               height: parseInt(fitnessProfile.height),
               weight: parseFloat(fitnessProfile.weight),
               targetWeight: fitnessProfile.targetWeight ? parseFloat(fitnessProfile.targetWeight) : undefined,
               fitnessGoal: fitnessProfile.fitnessGoal,
               activityLevel: fitnessProfile.activityLevel
             });
           } catch (error) {
             console.error("Error calculating nutrition requirements:", error);
             // Místo throw error, vytvoř projekt s chybovou zprávou
             await prisma.project.create({
               data: {
                 name: `Meal Plan Error - ${new Date().toLocaleDateString()}`,
                 userId: userId,
                 messages: {
                   create: {
                     content: `Chyba při generování jídelního plánu: ${error instanceof Error ? error.message : 'Neznámá chyba'}. Prosím, vyplňte fitness assessment znovu s kompletními údaji.`,
                     role: "ASSISTANT",
                     type: "ERROR",
                   }
                 }
               },
             });
             throw error; // Předaj chybu dál, aby se Inngest funkce zastavila
           }
         });

         // Kontrola nutričních hodnot
         console.log('DEBUG: nutritionRequirements v generateMealPlanOnly:', nutritionRequirements);

         // Generate meal plan
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
               name: `${fitnessProfile.fitnessGoal?.replace('_', ' ') || 'Personalized'} Monthly Meal Plan`,
               description: `Personalized ${fitnessProfile.fitnessGoal?.toLowerCase().replace('_', ' ') || 'fitness'} meal plan for 30 days`,
               duration: 30, // 30 days (entire month)
               caloriesPerDay: nutritionRequirements.caloriesPerDay,
               proteinPerDay: nutritionRequirements.proteinPerDay,
               carbsPerDay: nutritionRequirements.carbsPerDay,
               fatPerDay: nutritionRequirements.fatPerDay,
               budgetPerWeek: fitnessProfile.budgetPerWeek || 100,
               isActive: true,
               activeProfileId: fitnessProfile.id,
               fitnessProfileId: fitnessProfile.id,
             },
           });

           // Parse stored data from fitness profile
           const dietaryRestrictions = fitnessProfile.dietaryRestrictions || [];
           const preferredCuisines = fitnessProfile.preferredCuisines || [];
           const cookingSkill = fitnessProfile.cookingSkill || 'BEGINNER';
           const mealPrepTime = fitnessProfile.mealPrepTime || 30;

           // Generate meal templates using AI (optimized to reduce API calls)
           const mealTypes = ['BREAKFAST', 'LUNCH', 'DINNER'];
           const mealTemplates: { [mealType: string]: any } = {};
           const mealPromises: Promise<any>[] = [];

           console.log(`Generating ${mealTypes.length} meal templates for types: ${mealTypes.join(', ')}`);

           // Generate meal templates (only once per meal type)
           for (const mealType of mealTypes) {
             // Generate meal template using AI with realistic nutrition values
             // AI will create meals with natural nutrition ratios, then we'll adjust portions
             const aiMeal = await generateMealWithAI(
               1, // Use day 1 as template
               mealType,
               fitnessProfile.fitnessGoal || 'GENERAL_FITNESS',
               dietaryRestrictions,
               preferredCuisines,
               cookingSkill,
               0, // Let AI generate natural nutrition values
               0, // Let AI generate natural nutrition values
               0, // Let AI generate natural nutrition values
               0, // Let AI generate natural nutrition values
               fitnessProfile.budgetPerWeek || 100,
               mealPrepTime
             );

             mealTemplates[mealType] = aiMeal;
             console.log(`Generated template for ${mealType}: ${aiMeal.name} (${aiMeal.calories} cal, ${aiMeal.protein}g protein, ${aiMeal.carbs}g carbs, ${aiMeal.fat}g fat)`);
           }

           // Calculate total daily nutrition from all meals (for logging only)
           const totalDailyCalories = Object.values(mealTemplates).reduce((sum: number, meal: any) => sum + meal.calories, 0);
           const totalDailyProtein = Object.values(mealTemplates).reduce((sum: number, meal: any) => sum + meal.protein, 0);
           const totalDailyCarbs = Object.values(mealTemplates).reduce((sum: number, meal: any) => sum + meal.carbs, 0);
           const totalDailyFat = Object.values(mealTemplates).reduce((sum: number, meal: any) => sum + meal.fat, 0);

           console.log(`Total daily nutrition from meals: ${totalDailyCalories} cal, ${totalDailyProtein}g protein, ${totalDailyCarbs}g carbs, ${totalDailyFat}g fat`);
           console.log(`Target daily nutrition: ${nutritionRequirements.caloriesPerDay} cal, ${nutritionRequirements.proteinPerDay}g protein, ${nutritionRequirements.carbsPerDay}g carbs, ${nutritionRequirements.fatPerDay}g fat`);

           // Keep natural nutrition values from AI - don't adjust them
           console.log(`Using natural nutrition values from AI-generated meals`);

           // Log the natural values for each meal type
           for (const mealType of mealTypes) {
             const meal = mealTemplates[mealType];
             console.log(`Natural ${mealType}: ${meal.calories} cal, ${meal.protein}g protein, ${meal.carbs}g carbs, ${meal.fat}g fat`);
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
                   prepTime: template.prepTime,
                   cookTime: template.cookTime,
                   servings: 1,
                   mealPlanId: mealPlan.id,
                   recipes: {
                     create: {
                       name: `Day ${day} - ${template.name}`,
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
                       prepTime: template.prepTime,
                       cookTime: template.cookTime,
                       servings: 1,
                       difficulty: cookingSkill,
                       cuisine: preferredCuisines[day % preferredCuisines.length] || "american",
                       tags: dietaryRestrictions.length > 0 ? dietaryRestrictions : ["healthy", "balanced"],
                     }
                   }
                 },
               });

               // Add debug logging for nutrition values
               console.log(`Creating meal for Day ${day}, ${mealType}:`, {
                 name: `Day ${day} - ${template.name}`,
                 calories: template.calories,
                 protein: template.protein,
                 carbs: template.carbs,
                 fat: template.fat
               });

               mealPromises.push(mealPromise);
             }
           }

           // Wait for all meals to be created
           const createdMeals = await Promise.all(mealPromises);
           console.log(`Created ${createdMeals.length} meals using ${mealTypes.length} AI-generated templates for meal plan ${mealPlan.id}`);

           // Update the fitness profile to point to the new current meal plan
           await prisma.fitnessProfile.update({
             where: { id: fitnessProfile.id },
             data: { currentMealPlan: { connect: { id: mealPlan.id } } }
           });

           // Verify meal plan was created
           const mealPlanCount = await prisma.mealPlan.count({
             where: { fitnessProfileId: fitnessProfile.id }
           });
           console.log(`Total meal plans in database for profile ${fitnessProfile.id}: ${mealPlanCount}`);

           return mealPlan;
         });

         // Create success message
         await step.run("create-meal-plan-project", async () => {
           // Create a project for the meal plan
           const project = await prisma.project.create({
             data: {
               name: `Meal Plan - ${new Date().toLocaleDateString()}`,
               userId: userId,
               messages: {
                 create: {
                   content: `Your personalized meal plan has been created! You now have a complete 30-day AI-generated meal plan with 3 personalized recipes per day, tailored to your ${fitnessProfile.fitnessGoal?.toLowerCase().replace('_', ' ') || 'fitness'} goals and dietary preferences.`,
                   role: "ASSISTANT",
                   type: "PLAN_GENERATED",
                 }
               }
             },
           });

           return project;
         });

         console.log("Meal plan generation completed successfully:", {
           userId,
           fitnessProfileId: fitnessProfile.id
         });

         return {
           success: true,
           message: "Meal plan generated successfully",
         };

       } catch (error) {
         console.error("Error in meal plan generation:", error);
         throw error;
       } finally {
         await prisma.$disconnect();
       }
     }
   );






type RegenerateMealEvent = {
  name: "regenerate-meal/run";
  data: {
    userId: string;
    fitnessProfileId: string;
    mealPlanId: string;
    mealId: string;
    mealType: string;
    dayOfWeek: number;
    weekNumber: number;
  };
};

export const regenerateMealFunction = inngest.createFunction(
  { id: "regenerate-meal" },
  { event: "regenerate-meal/run" },
  async ({ event, step }: { event: RegenerateMealEvent, step: any }) => {
    const prisma = new PrismaClient();
    const { userId, fitnessProfileId, mealPlanId, mealId, mealType, dayOfWeek, weekNumber } = event.data;

    console.log("Starting meal regeneration for user:", userId);
    console.log("Meal ID to regenerate:", mealId);

    try {
      // Get the existing fitness profile
      const fitnessProfile = await step.run("get-fitness-profile", async () => {
        const profile = await prisma.fitnessProfile.findUnique({
          where: { id: fitnessProfileId }
        });

        if (!profile) {
          throw new Error("Fitness profile not found");
        }

        if (!profile.mealPlanningEnabled) {
          throw new Error("Meal planning is not enabled for this profile");
        }

        console.log("Found fitness profile:", profile.id);
        return profile;
      });

      // Get the meal plan
      const mealPlan = await step.run("get-meal-plan", async () => {
        const plan = await prisma.mealPlan.findUnique({
          where: { id: mealPlanId },
          include: { meals: true }
        });

        if (!plan) {
          throw new Error("Meal plan not found");
        }

        console.log("Found meal plan:", plan.id);
        return plan;
      });

      // Find all meals with the same name to replace them
      const mealToReplace = mealPlan.meals.find((meal: any) => meal.id === mealId);
      if (!mealToReplace) {
        throw new Error("Meal to regenerate not found");
      }

      // Find all meals with the same name across all weeks
      const mealsToReplace = mealPlan.meals.filter((meal: any) =>
        meal.name === mealToReplace.name && meal.mealType === mealToReplace.mealType
      );

      console.log(`Found ${mealsToReplace.length} meals to replace with name: "${mealToReplace.name}"`);

      // Calculate nutrition requirements
      const nutritionRequirements = await step.run("calculate-nutrition-requirements", async () => {
        return calculateNutritionTargets({
          age: parseInt(fitnessProfile.age),
          gender: fitnessProfile.gender,
          height: parseInt(fitnessProfile.height),
          weight: parseFloat(fitnessProfile.weight),
          targetWeight: fitnessProfile.targetWeight ? parseFloat(fitnessProfile.targetWeight) : undefined,
          fitnessGoal: fitnessProfile.fitnessGoal,
          activityLevel: fitnessProfile.activityLevel
        });
      });

      // Parse stored data from fitness profile
      const dietaryRestrictions = fitnessProfile.dietaryRestrictions || [];
      const preferredCuisines = fitnessProfile.preferredCuisines || [];
      const cookingSkill = fitnessProfile.cookingSkill || 'BEGINNER';
      const mealPrepTime = fitnessProfile.mealPrepTime || 30;

      // Replace all meals with the same name
      await step.run("replace-meals", async () => {
        console.log("Replacing meals in database...");

        for (const meal of mealsToReplace as any[]) {
          // Generate unique meal for each occurrence
          const uniqueMealData = await generateMealWithAI(
            meal.dayOfWeek,
            meal.mealType,
            fitnessProfile.fitnessGoal || 'GENERAL_FITNESS',
            dietaryRestrictions,
            preferredCuisines,
            cookingSkill,
            nutritionRequirements.caloriesPerDay / 3, // Divide daily calories by 3 meals
            nutritionRequirements.proteinPerDay / 3,
            nutritionRequirements.carbsPerDay / 3,
            nutritionRequirements.fatPerDay / 3,
            fitnessProfile.budgetPerWeek || 100,
            mealPrepTime
          );

          // Delete existing recipes for this meal
          await prisma.recipe.deleteMany({
            where: { mealId: (meal as any).id }
          });

          // Update the meal with new data
          await prisma.meal.update({
            where: { id: (meal as any).id },
            data: {
              name: uniqueMealData.name,
              description: uniqueMealData.description,
              calories: uniqueMealData.calories,
              protein: uniqueMealData.protein,
              carbs: uniqueMealData.carbs,
              fat: uniqueMealData.fat,
              prepTime: uniqueMealData.prepTime,
              cookTime: uniqueMealData.cookTime,
            }
          });

          // Create new recipe for the meal
          await prisma.recipe.create({
            data: {
              name: uniqueMealData.name,
              ingredients: JSON.stringify(uniqueMealData.ingredients),
              instructions: uniqueMealData.instructions,
              prepTime: uniqueMealData.prepTime,
              cookTime: uniqueMealData.cookTime,
              servings: 1,
              difficulty: cookingSkill,
              cuisine: preferredCuisines[0] || 'general',
              tags: ['regenerated'],
              mealId: (meal as any).id,
            }
          });

          console.log(`Replaced meal ${(meal as any).id} with: ${uniqueMealData.name}`);
        }

        console.log(`Successfully replaced ${mealsToReplace.length} meals`);
      });

      console.log("Meal regeneration completed successfully");
      return { success: true, replacedMeals: mealsToReplace.length };

    } catch (error) {
      console.error("Error regenerating meal:", error);
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }
);
