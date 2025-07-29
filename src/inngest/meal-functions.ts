
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

           // Generate meals with variety for each day
           const mealTypes = ['BREAKFAST', 'LUNCH', 'DINNER'];
           const mealPromises: Promise<any>[] = [];

                      // TESTING: Nastav počet dní pro generování
           // TESTING_DAYS = 2: Generuje 2 dny - velmi rychlé testování
           // TESTING_DAYS = 7: Generuje 1 týden - rychlé testování
           // TESTING_DAYS = 14: Generuje 2 týdny - střední testování
           // TESTING_DAYS = 28: Generuje 4 týdny - téměř plný měsíc
           // TESTING_DAYS = 0: Generuje plný měsíc (30 dní) - produkční režim
           const TESTING_DAYS = 2; // Změň podle potřeby testování
           const totalDays = TESTING_DAYS > 0 ? TESTING_DAYS : 30;

           console.log(`Generating unique meals for ${totalDays} days (${TESTING_DAYS > 0 ? TESTING_DAYS + ' days' : 'full month'}) with types: ${mealTypes.join(', ')}`);

           // Arrays for rotating ingredients to ensure variety
           const proteinSources = ['kuřecí prsa', 'krůtí prsa', 'losos', 'tuňák', 'treska', 'vejce', 'tvaroh', 'libové hovězí', 'tofu', 'tempeh', 'králík', 'proteinový prášek'];
           const carbSources = ['ovesné vločky', 'quinoa', 'hnědá rýže', 'celozrnné těstoviny', 'sladké brambory', 'pohanka', 'ječmen', 'bulgur', 'celozrnný chléb'];
           const vegetables = ['brokolice', 'špenát', 'kapusta', 'mrkev', 'paprika', 'rajčata', 'okurka', 'cuketa', 'lilek', 'cibule', 'česnek', 'zázvor', 'kedlubna', 'celer'];
           const fruits = ['jablka', 'banány', 'borůvky', 'maliny', 'jahody', 'pomeranče', 'kiwi', 'ananas', 'mango', 'hrušky', 'hrozny'];

           // Track used meal names to avoid repetition
           const usedMealNames: { [key: string]: string[] } = { BREAKFAST: [], LUNCH: [], DINNER: [] };

           // Create meals for each day with variety - generate different meals for each day
           console.log(`Creating meals for ${totalDays} days with variety...`);

           for (let day = 1; day <= totalDays; day++) {
             // Calculate week number
             const weekNumber = Math.ceil(day / 7);

             console.log(`Day ${day}: Week ${weekNumber}`);

             for (const mealType of mealTypes) {
               // Calculate target nutrition for this meal type
               let targetCalories = 0;
               let targetProtein = 0;
               let targetCarbs = 0;
               let targetFat = 0;

               switch (mealType) {
                 case 'BREAKFAST':
                   targetCalories = Math.round(nutritionRequirements.caloriesPerDay * 0.25);
                   targetProtein = Math.round(nutritionRequirements.proteinPerDay * 0.25 * 10) / 10;
                   targetCarbs = Math.round(nutritionRequirements.carbsPerDay * 0.25 * 10) / 10;
                   targetFat = Math.round(nutritionRequirements.fatPerDay * 0.25 * 10) / 10;
                   break;
                 case 'LUNCH':
                   targetCalories = Math.round(nutritionRequirements.caloriesPerDay * 0.40);
                   targetProtein = Math.round(nutritionRequirements.proteinPerDay * 0.40 * 10) / 10;
                   targetCarbs = Math.round(nutritionRequirements.carbsPerDay * 0.40 * 10) / 10;
                   targetFat = Math.round(nutritionRequirements.fatPerDay * 0.40 * 10) / 10;
                   break;
                 case 'DINNER':
                   targetCalories = Math.round(nutritionRequirements.caloriesPerDay * 0.35);
                   targetProtein = Math.round(nutritionRequirements.proteinPerDay * 0.35 * 10) / 10;
                   targetCarbs = Math.round(nutritionRequirements.carbsPerDay * 0.35 * 10) / 10;
                   targetFat = Math.round(nutritionRequirements.fatPerDay * 0.35 * 10) / 10;
                   break;
               }

               // Rotate ingredients to ensure variety
               const dayIndex = day - 1;
               const proteinIndex = dayIndex % proteinSources.length;
               const carbIndex = dayIndex % carbSources.length;
               const vegIndex = dayIndex % vegetables.length;
               const fruitIndex = dayIndex % fruits.length;

               const suggestedProtein = proteinSources[proteinIndex];
               const suggestedCarb = carbSources[carbIndex];
               const suggestedVeg = vegetables[vegIndex];
               const suggestedFruit = fruits[fruitIndex];

               console.log(`Day ${day}, ${mealType}: Suggested ingredients - Protein: ${suggestedProtein}, Carb: ${suggestedCarb}, Veg: ${suggestedVeg}, Fruit: ${suggestedFruit}`);

               // Generate unique meal for this day and meal type
               const aiMeal = await generateMealWithAI(
                 day,
                 mealType,
                 fitnessProfile.fitnessGoal || 'GENERAL_FITNESS',
                 dietaryRestrictions,
                 preferredCuisines,
                 cookingSkill,
                 targetCalories,
                 targetProtein,
                 targetCarbs,
                 targetFat,
                 fitnessProfile.budgetPerWeek || 100,
                 mealPrepTime,
                 usedMealNames[mealType].join(', '), // Avoid previously used meal names
                 {
                   protein: suggestedProtein,
                   carb: suggestedCarb,
                   veg: suggestedVeg,
                   fruit: suggestedFruit
                 }
               );

               // Verify that we got a unique meal name
               if (usedMealNames[mealType].includes(aiMeal.name)) {
                 console.warn(`WARNING: Duplicate meal name generated for ${mealType}: ${aiMeal.name}`);
               }

               // Add to used names to avoid repetition
               usedMealNames[mealType].push(aiMeal.name);

               const mealPromise = prisma.meal.create({
                 data: {
                   name: `Day ${day} - ${aiMeal.name}`,
                   description: aiMeal.description,
                   mealType: mealType as any,
                   dayOfWeek: day, // Use actual day number (1-30), not day of week (0-6)
                   weekNumber: weekNumber,
                   calories: aiMeal.calories,
                   protein: aiMeal.protein,
                   carbs: aiMeal.carbs,
                   fat: aiMeal.fat,
                   prepTime: aiMeal.prepTime,
                   cookTime: aiMeal.cookTime,
                   servings: 1,
                   mealPlanId: mealPlan.id,
                   recipes: {
                     create: {
                       name: `Day ${day} - ${aiMeal.name}`,
                       description: aiMeal.description,
                       instructions: aiMeal.instructions,
                       ingredients: JSON.stringify(aiMeal.ingredients),
                       nutrition: JSON.stringify({
                         calories: aiMeal.calories,
                         protein: aiMeal.protein,
                         carbs: aiMeal.carbs,
                         fat: aiMeal.fat,
                         fiber: Math.floor(Math.random() * 8) + 3,
                         sugar: Math.floor(Math.random() * 15) + 5
                       }),
                       prepTime: aiMeal.prepTime,
                       cookTime: aiMeal.cookTime,
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
                 name: `Day ${day} - ${aiMeal.name}`,
                 calories: aiMeal.calories,
                 protein: aiMeal.protein,
                 carbs: aiMeal.carbs,
                 fat: aiMeal.fat
               });

               mealPromises.push(mealPromise);
             }
           }

           // Wait for all meals to be created
           const createdMeals = await Promise.all(mealPromises);
           console.log(`Created ${createdMeals.length} unique meals for meal plan ${mealPlan.id}`);

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
      // Extract recipe name from meal name (remove "Day X - " prefix)
      const getRecipeName = (mealName: string) => {
        const match = mealName.match(/^Day \d+ - (.+)$/);
        return match ? match[1] : mealName;
      };

      const clickedMealRecipeName = getRecipeName(mealToReplace.name);
      const mealsToReplace = mealPlan.meals.filter((meal: any) => {
        const mealRecipeName = getRecipeName(meal.name);
        return mealRecipeName === clickedMealRecipeName;
      });

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

        // Generate ONE new meal data for all meals with the same recipe
        // Add randomization to ensure different recipes
        const randomDay = Math.floor(Math.random() * 30) + 1; // Random day 1-30
        const shuffledCuisines = [...preferredCuisines].sort(() => Math.random() - 0.5); // Shuffle cuisines

        // Get the current recipe name to avoid generating the same recipe
        const getRecipeName = (mealName: string) => {
          const match = mealName.match(/^Day \d+ - (.+)$/);
          return match ? match[1] : mealName;
        };
        const currentRecipeName = getRecipeName(mealToReplace.name);

        // Calculate target nutrition for this meal type based on daily requirements
        let targetCalories, targetProtein, targetCarbs, targetFat;

        switch (mealToReplace.mealType) {
          case 'BREAKFAST':
            targetCalories = Math.round(nutritionRequirements.caloriesPerDay * 0.25); // 25% of daily calories
            targetProtein = Math.round(nutritionRequirements.proteinPerDay * 0.25);
            targetCarbs = Math.round(nutritionRequirements.carbsPerDay * 0.25);
            targetFat = Math.round(nutritionRequirements.fatPerDay * 0.25);
            break;
          case 'LUNCH':
            targetCalories = Math.round(nutritionRequirements.caloriesPerDay * 0.40); // 40% of daily calories
            targetProtein = Math.round(nutritionRequirements.proteinPerDay * 0.40);
            targetCarbs = Math.round(nutritionRequirements.carbsPerDay * 0.40);
            targetFat = Math.round(nutritionRequirements.fatPerDay * 0.40);
            break;
          case 'DINNER':
            targetCalories = Math.round(nutritionRequirements.caloriesPerDay * 0.35); // 35% of daily calories
            targetProtein = Math.round(nutritionRequirements.proteinPerDay * 0.35);
            targetCarbs = Math.round(nutritionRequirements.carbsPerDay * 0.35);
            targetFat = Math.round(nutritionRequirements.fatPerDay * 0.35);
            break;
          default:
            targetCalories = Math.round(nutritionRequirements.caloriesPerDay / 3);
            targetProtein = Math.round(nutritionRequirements.proteinPerDay / 3);
            targetCarbs = Math.round(nutritionRequirements.carbsPerDay / 3);
            targetFat = Math.round(nutritionRequirements.fatPerDay / 3);
        }

        const newMealData = await generateMealWithAI(
          randomDay, // Use random day instead of mealToReplace.dayOfWeek
          mealToReplace.mealType,
          fitnessProfile.fitnessGoal || 'GENERAL_FITNESS',
          dietaryRestrictions,
          shuffledCuisines, // Use shuffled cuisines
          cookingSkill,
          targetCalories, // Use calculated targets for this meal type
          targetProtein,
          targetCarbs,
          targetFat,
          fitnessProfile.budgetPerWeek || 100,
          mealPrepTime,
          currentRecipeName // Pass current recipe name to avoid generating the same recipe
        );

        for (const meal of mealsToReplace as any[]) {
          // Delete existing recipes for this meal
          await prisma.recipe.deleteMany({
            where: { mealId: (meal as any).id }
          });

          // Create unique name for each meal by adding day number
          const uniqueMealName = `Day ${meal.dayOfWeek} - ${newMealData.name}`;

          // Update the meal with new data (same recipe for all meals)
          await prisma.meal.update({
            where: { id: (meal as any).id },
            data: {
              name: uniqueMealName,
              description: newMealData.description,
              calories: newMealData.calories,
              protein: newMealData.protein,
              carbs: newMealData.carbs,
              fat: newMealData.fat,
              prepTime: newMealData.prepTime,
              cookTime: newMealData.cookTime,
            }
          });

          // Create new recipe for the meal (same recipe for all meals)
          await prisma.recipe.create({
            data: {
              name: uniqueMealName,
              ingredients: JSON.stringify(newMealData.ingredients),
              instructions: newMealData.instructions,
              prepTime: newMealData.prepTime,
              cookTime: newMealData.cookTime,
              servings: 1,
              difficulty: cookingSkill,
              cuisine: preferredCuisines[0] || 'general',
              tags: dietaryRestrictions.length > 0 ? dietaryRestrictions : ["healthy", "balanced"],
              mealId: (meal as any).id,
            }
          });

          console.log(`Replaced meal ${(meal as any).id} with: ${uniqueMealName}`);
        }

        console.log(`Successfully replaced ${mealsToReplace.length} meals with the same new recipe: ${newMealData.name}`);
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
