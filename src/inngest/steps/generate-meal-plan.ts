import OpenAI from "openai";
import { PrismaClient } from "../../generated/prisma";
import { createMealGenerationPrompt, MEAL_GENERATION_SYSTEM_PROMPT } from "../prompts";
import {
  calculateNutritionTargets,
  checkNutritionGaps,
  generateSupplementSuggestions,
  getIngredientNutrition
} from "../utils/nutrition-calculator";

export async function generateMealPlan(prisma: PrismaClient, fitnessProfileId: string, assessmentData: any) {
  console.log("Starting meal plan generation...");

  // Parse dietary restrictions and allergies
  let dietaryRestrictions = assessmentData.dietaryRestrictions || [];
  let allergies = assessmentData.allergies || [];
  let preferredCuisines = assessmentData.preferredCuisines || ['česká'];

  if (typeof dietaryRestrictions === 'string') {
    try {
      dietaryRestrictions = JSON.parse(dietaryRestrictions);
    } catch (error) {
      console.warn('Failed to parse dietaryRestrictions, using as string:', dietaryRestrictions);
      dietaryRestrictions = [dietaryRestrictions];
    }
  }

  if (typeof allergies === 'string') {
    try {
      allergies = JSON.parse(allergies);
    } catch (error) {
      console.warn('Failed to parse allergies, using as string:', allergies);
      allergies = [allergies];
    }
  }

  if (typeof preferredCuisines === 'string') {
    try {
      preferredCuisines = JSON.parse(preferredCuisines);
    } catch (error) {
      console.warn('Failed to parse preferredCuisines, using as string:', preferredCuisines);
      preferredCuisines = [preferredCuisines];
    }
  }

  // Calculate nutrition targets
  const nutritionTargets = calculateNutritionTargets(
    parseFloat(assessmentData.weight),
    parseFloat(assessmentData.height),
    parseInt(assessmentData.age),
    assessmentData.gender,
    assessmentData.activityLevel,
    assessmentData.fitnessGoal
  );

  console.log("Calculated nutrition targets:", nutritionTargets);

  // Generate meals using AI
  const openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = createMealGenerationPrompt(assessmentData, nutritionTargets);

  const completion = await openaiClient.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: MEAL_GENERATION_SYSTEM_PROMPT },
      { role: "user", content: prompt }
    ],
    temperature: 0.3,
    max_tokens: 4000,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No content received from OpenAI for meal generation");
  }

  console.log("Raw AI meal response:", content);

  // Parse JSON response
  let jsonContent = content.trim();
  jsonContent = jsonContent.replace(/```json\s*/g, '').replace(/```\s*$/g, '');

  const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonContent = jsonMatch[0];
  }

  // Fix common JSON issues
  jsonContent = jsonContent.replace(/,(\s*[}\]])/g, '$1');
  jsonContent = jsonContent.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');

  let mealPlanData = JSON.parse(jsonContent);

  // Validate the meal plan structure
  if (!mealPlanData.meals || !Array.isArray(mealPlanData.meals)) {
    throw new Error("Invalid meal plan structure - missing meals array");
  }

  // Calculate nutrition from Czech database for each meal
  for (let i = 0; i < mealPlanData.meals.length; i++) {
    const meal = mealPlanData.meals[i];

    if (!meal.ingredients || !Array.isArray(meal.ingredients)) {
      console.warn(`Meal ${i + 1} missing ingredients array`);
      continue;
    }

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    for (const ingredient of meal.ingredients) {
      const amount = ingredient.amount || 0;
      const name = ingredient.name || '';

      if (amount > 0 && name) {
        try {
          const czechNutrition = await getIngredientNutrition(prisma, name);
          if (czechNutrition) {
            const multiplier = amount / 100;
            totalCalories += czechNutrition.calories * multiplier;
            totalProtein += czechNutrition.protein * multiplier;
            totalCarbs += czechNutrition.carbs * multiplier;
            totalFat += czechNutrition.fat * multiplier;

            console.log(`Found Czech data for ${name}:`, czechNutrition);
          } else {
            console.warn(`No Czech data found for: ${name}`);
          }
        } catch (error) {
          console.warn(`Error getting Czech data for ${name}:`, error);
        }
      }
    }

    meal.nutrition = {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10,
      fat: Math.round(totalFat * 10) / 10
    };

    console.log(`Meal ${i + 1} (${meal.name}) calculated nutrition:`, meal.nutrition);
  }

  // LOCAL LOGIC: Adjust portions and add supplements to meet targets
  console.log("Starting local nutrition adjustment...");

  let totalProtein = mealPlanData.meals.reduce((sum: number, meal: any) => sum + (meal.nutrition?.protein || 0), 0);
  let totalCarbs = mealPlanData.meals.reduce((sum: number, meal: any) => sum + (meal.nutrition?.carbs || 0), 0);
  let totalFat = mealPlanData.meals.reduce((sum: number, meal: any) => sum + (meal.nutrition?.fat || 0), 0);
  let totalCalories = mealPlanData.meals.reduce((sum: number, meal: any) => sum + (meal.nutrition?.calories || 0), 0);

  console.log("Initial totals:", { totalProtein, totalCarbs, totalFat, totalCalories });
  console.log("Targets:", nutritionTargets);

  // SIMPLIFIED AGGRESSIVE ADJUSTMENT: Reduce portions if exceeding targets
  let adjustmentsMade = false;

  // Check if we're exceeding any targets
  const carbsExceeding = totalCarbs > nutritionTargets.carbs;
  const fatExceeding = totalFat > nutritionTargets.fat;
  const caloriesExceeding = totalCalories > nutritionTargets.calories;

  console.log(`Exceeding targets: carbs=${carbsExceeding}, fat=${fatExceeding}, calories=${caloriesExceeding}`);

  if (carbsExceeding || fatExceeding || caloriesExceeding) {
    console.log("Making aggressive portion adjustments...");

    for (const meal of mealPlanData.meals) {
      if (!meal.ingredients) continue;

      for (const ingredient of meal.ingredients) {
        const czechNutrition = await getIngredientNutrition(prisma, ingredient.name);
        if (!czechNutrition) continue;

        const currentAmount = ingredient.amount || 0;
        let shouldReduce = false;
        let reductionReason = "";

        // Check if this ingredient contributes to exceeding targets
        const currentCarbs = (czechNutrition.carbs * currentAmount) / 100;
        const currentFat = (czechNutrition.fat * currentAmount) / 100;
        const currentCalories = (czechNutrition.calories * currentAmount) / 100;

        if (carbsExceeding && czechNutrition.carbs > 20) {
          shouldReduce = true;
          reductionReason = "high carbs";
        } else if (fatExceeding && czechNutrition.fat > 5) { // Reduced from 10g to 5g
          shouldReduce = true;
          reductionReason = "high fat";
        } else if (caloriesExceeding && czechNutrition.calories > 200) {
          shouldReduce = true;
          reductionReason = "high calories";
        }

        if (shouldReduce) {
          // More aggressive reduction for fats: 40-60% for fats, 30-50% for others
          let reductionPercent;
          if (reductionReason === "high fat") {
            reductionPercent = Math.random() * 0.2 + 0.4; // 40-60% for fats
          } else {
            reductionPercent = Math.random() * 0.2 + 0.3; // 30-50% for others
          }

          const reductionAmount = Math.round(currentAmount * reductionPercent);
          const newAmount = Math.max(currentAmount - reductionAmount, 10); // Min 10g

          ingredient.amount = newAmount;
          adjustmentsMade = true;

          console.log(`Reduced ${ingredient.name} from ${currentAmount}g to ${newAmount}g (${reductionReason}, ${Math.round(reductionPercent * 100)}% reduction)`);
        }
      }

      // Recalculate meal nutrition after adjustments
      if (adjustmentsMade) {
        let mealCalories = 0, mealProtein = 0, mealCarbs = 0, mealFat = 0;
        for (const ing of meal.ingredients) {
          const ingNutrition = await getIngredientNutrition(prisma, ing.name);
          if (ingNutrition) {
            const multiplier = (ing.amount || 0) / 100;
            mealCalories += ingNutrition.calories * multiplier;
            mealProtein += ingNutrition.protein * multiplier;
            mealCarbs += ingNutrition.carbs * multiplier;
            mealFat += ingNutrition.fat * multiplier;
          }
        }

        meal.nutrition = {
          calories: Math.round(mealCalories),
          protein: Math.round(mealProtein * 10) / 10,
          carbs: Math.round(mealCarbs * 10) / 10,
          fat: Math.round(mealFat * 10) / 10
        };
      }
    }
  }

  // Recalculate totals after adjustments
  totalProtein = mealPlanData.meals.reduce((sum: number, meal: any) => sum + (meal.nutrition?.protein || 0), 0);
  totalCarbs = mealPlanData.meals.reduce((sum: number, meal: any) => sum + (meal.nutrition?.carbs || 0), 0);
  totalFat = mealPlanData.meals.reduce((sum: number, meal: any) => sum + (meal.nutrition?.fat || 0), 0);
  totalCalories = mealPlanData.meals.reduce((sum: number, meal: any) => sum + (meal.nutrition?.calories || 0), 0);

  console.log("After adjustments:", { totalProtein, totalCarbs, totalFat, totalCalories });
  console.log(`Adjustments made: ${adjustmentsMade}`);

  // ADJUST 4: Add supplements to meet final targets (only if not exceeding calories)
  const proteinGap = Math.max(0, nutritionTargets.protein - totalProtein);
  const calorieGap = Math.max(0, nutritionTargets.calories - totalCalories);
  const carbGap = Math.max(0, nutritionTargets.carbs - totalCarbs);

  // Only add supplements if we're not exceeding calorie target
  if ((proteinGap > 15 || calorieGap > 200) && totalCalories <= nutritionTargets.calories * 1.05) {
    console.log(`Adding supplements: protein gap ${proteinGap}g, calorie gap ${calorieGap}kcal`);

    // Add protein shake if protein is low
    if (proteinGap > 15) {
      const proteinShake: any = {
        name: "Proteinový nápoj",
        type: "svačina",
        ingredients: [
          { name: "syrovátkový protein", amount: 30, unit: "g" },
          { name: "polotučné mléko", amount: 200, unit: "ml" }
        ],
        instructions: "Smíchej syrovátkový protein s mlékem"
      };

      // Calculate nutrition for protein shake
      const proteinPowder = await getIngredientNutrition(prisma, "syrovátkový protein");
      const milk = await getIngredientNutrition(prisma, "polotučné mléko");

      if (proteinPowder && milk) {
        const shakeCalories = (proteinPowder.calories * 30 / 100) + (milk.calories * 200 / 100);
        const shakeProtein = (proteinPowder.protein * 30 / 100) + (milk.protein * 200 / 100);
        const shakeCarbs = (proteinPowder.carbs * 30 / 100) + (milk.carbs * 200 / 100);
        const shakeFat = (proteinPowder.fat * 30 / 100) + (milk.fat * 200 / 100);

        proteinShake.nutrition = {
          calories: Math.round(shakeCalories),
          protein: Math.round(shakeProtein * 10) / 10,
          carbs: Math.round(shakeCarbs * 10) / 10,
          fat: Math.round(shakeFat * 10) / 10
        };

        mealPlanData.meals.push(proteinShake);
        console.log("Added protein shake:", proteinShake.nutrition);

        // Add second protein supplement if still needed
        const remainingProteinGap = proteinGap - shakeProtein;
        if (remainingProteinGap > 10) {
          const secondProtein: any = {
            name: "Doplňkový protein",
            type: "svačina",
            ingredients: [
              { name: "tvaroh", amount: 100, unit: "g" }
            ],
            instructions: "Dej si tvaroh jako svačinu"
          };

          const cottageCheese = await getIngredientNutrition(prisma, "tvaroh");
          if (cottageCheese) {
            const cottageProtein = (cottageCheese.protein * 100 / 100);
            const cottageCalories = (cottageCheese.calories * 100 / 100);
            const cottageCarbs = (cottageCheese.carbs * 100 / 100);
            const cottageFat = (cottageCheese.fat * 100 / 100);

            secondProtein.nutrition = {
              calories: Math.round(cottageCalories),
              protein: Math.round(cottageProtein * 10) / 10,
              carbs: Math.round(cottageCarbs * 10) / 10,
              fat: Math.round(cottageFat * 10) / 10
            };

            mealPlanData.meals.push(secondProtein);
            console.log("Added second protein supplement:", secondProtein.nutrition);
          }
        }
      }
    }

    // Add simple protein supplement for smaller gaps
    else if (proteinGap > 5) {
      const simpleProtein: any = {
        name: "Proteinová svačina",
        type: "svačina",
        ingredients: [
          { name: "vejce", amount: 100, unit: "g" }
        ],
        instructions: "Uvař si vejce"
      };

      const egg = await getIngredientNutrition(prisma, "vejce");
      if (egg) {
        const eggProtein = (egg.protein * 100 / 100);
        const eggCalories = (egg.calories * 100 / 100);
        const eggCarbs = (egg.carbs * 100 / 100);
        const eggFat = (egg.fat * 100 / 100);

        simpleProtein.nutrition = {
          calories: Math.round(eggCalories),
          protein: Math.round(eggProtein * 10) / 10,
          carbs: Math.round(eggCarbs * 10) / 10,
          fat: Math.round(eggFat * 10) / 10
        };

        mealPlanData.meals.push(simpleProtein);
        console.log("Added simple protein supplement:", simpleProtein.nutrition);
      }
    }

    // Add gainer if calories are still low
    else if (calorieGap > 200) {
      const gainer: any = {
        name: "Gainer nápoj",
        type: "svačina",
        ingredients: [
          { name: "ovesné vločky", amount: 50, unit: "g" },
          { name: "banán", amount: 100, unit: "g" },
          { name: "polotučné mléko", amount: 200, unit: "ml" }
        ],
        instructions: "Smíchej ovesné vločky s banánem a mlékem"
      };

      // Calculate nutrition for gainer
      const oats = await getIngredientNutrition(prisma, "ovesné vločky");
      const banana = await getIngredientNutrition(prisma, "banán");
      const milk = await getIngredientNutrition(prisma, "polotučné mléko");

      if (oats && banana && milk) {
        const gainerCalories = (oats.calories * 50 / 100) + (banana.calories * 100 / 100) + (milk.calories * 200 / 100);
        const gainerProtein = (oats.protein * 50 / 100) + (banana.protein * 100 / 100) + (milk.protein * 200 / 100);
        const gainerCarbs = (oats.carbs * 50 / 100) + (banana.carbs * 100 / 100) + (milk.carbs * 200 / 100);
        const gainerFat = (oats.fat * 50 / 100) + (banana.fat * 100 / 100) + (milk.fat * 200 / 100);

        gainer.nutrition = {
          calories: Math.round(gainerCalories),
          protein: Math.round(gainerProtein * 10) / 10,
          carbs: Math.round(gainerCarbs * 10) / 10,
          fat: Math.round(gainerFat * 10) / 10
        };

        mealPlanData.meals.push(gainer);
        console.log("Added gainer:", gainer.nutrition);
      }
    }
  }

  // Final nutrition calculation
  const finalProtein = mealPlanData.meals.reduce((sum: number, meal: any) => sum + (meal.nutrition?.protein || 0), 0);
  const finalCarbs = mealPlanData.meals.reduce((sum: number, meal: any) => sum + (meal.nutrition?.carbs || 0), 0);
  const finalFat = mealPlanData.meals.reduce((sum: number, meal: any) => sum + (meal.nutrition?.fat || 0), 0);
  const finalCalories = mealPlanData.meals.reduce((sum: number, meal: any) => sum + (meal.nutrition?.calories || 0), 0);

  console.log("FINAL NUTRITION (AI + local adjustments):", {
    calories: finalCalories,
    protein: finalProtein,
    carbs: finalCarbs,
    fat: finalFat
  });
  console.log("This is what will be displayed in UI");

  // Check if meals meet nutrition targets
  const { gaps, needsSupplements } = checkNutritionGaps(mealPlanData.meals, nutritionTargets);

  // Final nutrition summary
  console.log("FINAL NUTRITION SUMMARY:", {
    target: { protein: nutritionTargets.protein, carbs: nutritionTargets.carbs, fat: nutritionTargets.fat, calories: nutritionTargets.calories },
    actual: { protein: finalProtein, carbs: finalCarbs, fat: finalFat, calories: finalCalories },
    accuracy: {
      protein: Math.abs(finalProtein - nutritionTargets.protein) / nutritionTargets.protein,
      carbs: Math.abs(finalCarbs - nutritionTargets.carbs) / nutritionTargets.carbs,
      fat: Math.abs(finalFat - nutritionTargets.fat) / nutritionTargets.fat,
      calories: Math.abs(finalCalories - nutritionTargets.calories) / nutritionTargets.calories
    }
  });

  if (needsSupplements) {
    console.log("Adding supplements to meet nutrition targets");
    const supplements = generateSupplementSuggestions(gaps);
    mealPlanData.meals.push(...supplements);

    const finalNutrition = mealPlanData.meals.reduce((total: any, meal: any) => {
      if (!meal.nutrition) {
        console.warn(`Meal ${meal.name} missing nutrition data in final calculation`);
        return total;
      }

      const nutrition = meal.nutrition;
      return {
        calories: total.calories + (nutrition.calories || 0),
        protein: total.protein + (nutrition.protein || 0),
        carbs: total.carbs + (nutrition.carbs || 0),
        fat: total.fat + (nutrition.fat || 0),
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

    console.log("FINAL NUTRITION (AI + supplements):", finalNutrition);
    console.log("This is what will be displayed in UI");
  }

  // Create meal plan in database
  const mealPlan = await prisma.mealPlan.create({
    data: {
      fitnessProfileId: fitnessProfileId,
      name: `Jídelníček - ${new Date().toLocaleDateString()}`,
      description: `Personalizovaný jídelníček pro ${assessmentData.fitnessGoal.toLowerCase().replace('_', ' ')}`,
      duration: 1,
      caloriesPerDay: nutritionTargets.calories,
      proteinPerDay: nutritionTargets.protein,
      carbsPerDay: nutritionTargets.carbs,
      fatPerDay: nutritionTargets.fat,
      isActive: true,
    },
  });

  console.log("Created meal plan:", mealPlan.id);

  // Create meals in database
  for (let i = 0; i < mealPlanData.meals.length; i++) {
    const meal = mealPlanData.meals[i];

    const getMealType = (type: string) => {
      switch (type.toLowerCase()) {
        case 'snídaně': return 'BREAKFAST';
        case 'oběd': return 'LUNCH';
        case 'večeře': return 'DINNER';
        case 'svačina': return 'SNACK';
        default: return 'SNACK';
      }
    };

    const createdMeal = await prisma.meal.create({
      data: {
        mealPlanId: mealPlan.id,
        name: meal.name,
        description: meal.instructions,
        mealType: getMealType(meal.type),
        dayOfWeek: 1,
        weekNumber: 1,
        calories: meal.nutrition?.calories || 0,
        protein: meal.nutrition?.protein || 0,
        carbs: meal.nutrition?.carbs || 0,
        fat: meal.nutrition?.fat || 0,
        servings: 1,
      },
    });

    const recipe = await prisma.recipe.create({
      data: {
        mealId: createdMeal.id,
        name: meal.name,
        description: meal.instructions,
        instructions: meal.instructions,
        ingredients: JSON.stringify(meal.ingredients),
        nutrition: JSON.stringify(meal.nutrition),
        servings: 1,
        difficulty: 'EASY',
        cuisine: preferredCuisines[0] || 'česká',
        tags: [meal.type, assessmentData.fitnessGoal.toLowerCase()],
      },
    });
  }

  await prisma.fitnessProfile.update({
    where: { id: fitnessProfileId },
    data: { currentMealPlan: { connect: { id: mealPlan.id } } }
  });

  console.log("Meal plan generation completed successfully");

  return {
    mealPlanId: mealPlan.id,
    mealCount: mealPlanData.meals.length,
    nutritionTargets,
    gaps,
    needsSupplements
  };
}