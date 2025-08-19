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

  const numberOfDays = 7; // Generate full week instead of just 3 days
  console.log(`Generating meal plan for ${numberOfDays} days`);

  // Parse basic data
  let dietaryRestrictions = assessmentData.dietaryRestrictions || [];
  let allergies = assessmentData.allergies || [];
  let preferredCuisines = assessmentData.preferredCuisines || ['česká'];

  if (typeof dietaryRestrictions === 'string') {
    try {
      dietaryRestrictions = JSON.parse(dietaryRestrictions);
    } catch (error) {
      dietaryRestrictions = [dietaryRestrictions];
    }
  }

  if (typeof allergies === 'string') {
    try {
      allergies = JSON.parse(allergies);
    } catch (error) {
      allergies = [allergies];
    }
  }

  if (typeof preferredCuisines === 'string') {
    try {
      preferredCuisines = JSON.parse(preferredCuisines);
    } catch (error) {
      preferredCuisines = [preferredCuisines];
    }
  }

  // Calculate basic nutrition targets
  const nutritionTargets = calculateNutritionTargets(
    parseFloat(assessmentData.weight),
    parseFloat(assessmentData.height),
    parseInt(assessmentData.age),
    assessmentData.gender,
    assessmentData.activityLevel,
    assessmentData.fitnessGoal
  );

  console.log("Calculated nutrition targets:", nutritionTargets);

  // Create OpenAI client
  const openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Create meal plan in database
  const mealPlan = await prisma.mealPlan.create({
    data: {
      fitnessProfileId: fitnessProfileId,
      name: `Jídelníček - ${new Date().toLocaleDateString()}`,
      description: `Personalizovaný jídelníček pro ${assessmentData.fitnessGoal.toLowerCase().replace('_', ' ')}`,
      duration: numberOfDays,
      caloriesPerDay: nutritionTargets.calories,
      proteinPerDay: nutritionTargets.protein,
      carbsPerDay: nutritionTargets.carbs,
      fatPerDay: nutritionTargets.fat,
      isActive: true,
    },
  });

  console.log("Created meal plan:", mealPlan.id);

  // Generate meals for all days in one AI request
  console.log(`Generating meals for all ${numberOfDays} days in one request...`);

  const allDaysPrompt = await createMealGenerationPrompt(prisma, assessmentData, nutritionTargets, numberOfDays);

  const allDaysCompletion = await openaiClient.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: MEAL_GENERATION_SYSTEM_PROMPT },
      { role: "user", content: allDaysPrompt }
    ],
    temperature: 0.3,
    max_tokens: 12000, // Increased for 7 days instead of 3
  });

  const allDaysContent = allDaysCompletion.choices[0]?.message?.content;
  if (!allDaysContent) {
    throw new Error(`No content received from OpenAI for meal generation`);
  }

  console.log(`Raw AI meal response for all days:`, allDaysContent);

  // Check if AI returned an apologetic response
  let finalContent = allDaysContent;
  if (allDaysContent.toLowerCase().includes("i'm sorry") ||
      allDaysContent.toLowerCase().includes("omlouvám se") ||
      allDaysContent.toLowerCase().includes("bohužel") ||
      allDaysContent.toLowerCase().includes("nemohu") ||
      allDaysContent.toLowerCase().includes("nelze") ||
      allDaysContent.toLowerCase().includes("cannot") ||
      allDaysContent.toLowerCase().includes("unable")) {

    console.log("AI returned apologetic response, trying with fallback prompt...");

    // Try again with a more explicit fallback prompt
    const fallbackPrompt = `VYGENERUJ JÍDELNÍČEK ZÁSADNĚ! Použij základní dostupné potraviny z databáze. Pokud něco nejde, použij alternativy. NIKDY SE NEOMLOUVEJ - vždy generuj co nejlepší řešení v JSON formátu!`;

    const fallbackCompletion = await openaiClient.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: MEAL_GENERATION_SYSTEM_PROMPT },
        { role: "user", content: allDaysPrompt },
        { role: "user", content: fallbackPrompt }
      ],
      temperature: 0.1, // Lower temperature for more consistent output
      max_tokens: 12000,
    });

    const fallbackContent = fallbackCompletion.choices[0]?.message?.content;
    if (fallbackContent && !fallbackContent.toLowerCase().includes("i'm sorry")) {
      console.log("Fallback prompt successful, using fallback response");
      finalContent = fallbackContent;
    } else {
      throw new Error(`AI consistently returns apologetic responses. Raw response: ${allDaysContent}`);
    }
  }

  // Parse JSON response for all days
  let allDaysJsonContent = finalContent.trim();
  allDaysJsonContent = allDaysJsonContent.replace(/```json\s*/g, '').replace(/```\s*$/g, '');

  const allDaysJsonMatch = allDaysJsonContent.match(/\{[\s\S]*\}/);
  if (allDaysJsonMatch) {
    allDaysJsonContent = allDaysJsonMatch[0];
    }

    // Fix common JSON issues
  allDaysJsonContent = allDaysJsonContent.replace(/,(\s*[}\]])/g, '$1');
  allDaysJsonContent = allDaysJsonContent.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');

  let allDaysMealPlanData;
  try {
    allDaysMealPlanData = JSON.parse(allDaysJsonContent);
  } catch (parseError: unknown) {
    console.error("JSON parse error:", parseError);
    console.error("Failed to parse content:", allDaysJsonContent);

    // Try to extract just the JSON part more aggressively
    const jsonStart = allDaysJsonContent.indexOf('{');
    const jsonEnd = allDaysJsonContent.lastIndexOf('}');

    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      const extractedJson = allDaysJsonContent.substring(jsonStart, jsonEnd + 1);
      try {
        allDaysMealPlanData = JSON.parse(extractedJson);
        console.log("Successfully parsed extracted JSON");
      } catch (extractError) {
        const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);
        throw new Error(`Failed to parse JSON even after extraction. Original error: ${errorMessage}. Content: ${finalContent.substring(0, 200)}...`);
      }
    } else {
      const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);
      throw new Error(`Failed to parse JSON: ${errorMessage}. Content: ${finalContent.substring(0, 200)}...`);
    }
  }

  // Validate the meal plan structure for all days
  if (!allDaysMealPlanData.days || !Array.isArray(allDaysMealPlanData.days)) {
    throw new Error(`Invalid meal plan structure - missing days array`);
  }

  if (allDaysMealPlanData.days.length !== numberOfDays) {
    throw new Error(`Expected ${numberOfDays} days, got ${allDaysMealPlanData.days.length}`);
  }

  // Process each day from the single AI response
  for (let day = 1; day <= numberOfDays; day++) {
    console.log(`Processing day ${day} from AI response...`);

    const dayData = allDaysMealPlanData.days[day - 1];
    if (!dayData || !dayData.meals || !Array.isArray(dayData.meals)) {
      throw new Error(`Invalid day ${day} structure - missing meals array`);
    }

    // Keep only main meals (no snacks)
    const mainMeals = dayData.meals.filter((meal: any) => {
      const mealType = meal.type?.toLowerCase() || '';
      return mealType === 'snídaně' || mealType === 'oběd' || mealType === 'večeře';
    });

    if (mainMeals.length !== 3) {
      throw new Error(`Day ${day}: Expected 3 main meals, got ${mainMeals.length}`);
    }

    dayData.meals = mainMeals;
    console.log(`Day ${day}: Kept only 3 main meals: ${mainMeals.map((m: any) => m.type).join(', ')}`);

    // Simple nutrition calculation for each meal of this day
    for (const meal of dayData.meals) {
      if (!meal.ingredients || !Array.isArray(meal.ingredients)) {
        continue;
      }

      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;

      // Calculate nutrition from Czech database
      for (const ingredient of meal.ingredients) {
        const amount = ingredient.amount || 0;
        const name = ingredient.name || '';

        if (amount > 0 && name) {
          const czechNutrition = await getIngredientNutrition(prisma, name);
          if (czechNutrition) {
            const multiplier = amount / 100;
            totalCalories += czechNutrition.calories * multiplier;
            totalProtein += czechNutrition.protein * multiplier;
            totalCarbs += czechNutrition.carbs * multiplier;
            totalFat += czechNutrition.fat * multiplier;
          }
        }
      }

      // Set meal nutrition
      meal.nutrition = {
        calories: Math.round(totalCalories),
        protein: Math.round(totalProtein * 10) / 10,
        carbs: Math.round(totalCarbs * 10) / 10,
        fat: Math.round(totalFat * 10) / 10
      };
    }

    // REMOVED: First supplement generation - this was causing duplicates
    // const { gaps, needsSupplements } = checkNutritionGaps(dayData.meals, nutritionTargets);
    // if (needsSupplements) {
    //   console.log(`Day ${day}: Adding supplements`);
    //   const supplements = generateSupplementSuggestions(gaps);
    //   dayData.meals.push(...supplements);
    // }

    // GLOBAL PORTION CONTROL - Reduce excessive carbs and calories
    console.log(`Day ${day}: Checking global nutrition totals...`);

    let dayTotalCalories = dayData.meals.reduce((sum: number, meal: any) => sum + (meal.nutrition?.calories || 0), 0);
    let dayTotalCarbs = dayData.meals.reduce((sum: number, meal: any) => sum + (meal.nutrition?.carbs || 0), 0);
    let dayTotalProtein = dayData.meals.reduce((sum: number, meal: any) => sum + (meal.nutrition?.protein || 0), 0);
    let dayTotalFat = dayData.meals.reduce((sum: number, meal: any) => sum + (meal.nutrition?.fat || 0), 0);

    console.log(`Day ${day} before adjustment:`, {
      calories: dayTotalCalories,
      carbs: dayTotalCarbs,
      protein: dayTotalProtein,
      fat: dayTotalFat
    });

    // If carbs are way too high, reduce all ingredient portions globally
    if (dayTotalCarbs > nutritionTargets.carbs * 1.2) { // More than 20% over target
      console.log(`Day ${day}: Carbs too high (${dayTotalCarbs}g vs ${nutritionTargets.carbs}g target), reducing portions...`);

      const reductionFactor = nutritionTargets.carbs / dayTotalCarbs * 0.9; // Reduce to 90% of target

      for (const meal of dayData.meals) {
        if (meal.ingredients) {
          for (const ingredient of meal.ingredients) {
            if (ingredient.amount && ingredient.amount > 0) {
              ingredient.amount = Math.round(ingredient.amount * reductionFactor);
              // Ensure minimum amount
              if (ingredient.amount < 10) ingredient.amount = 10;
            }
          }
        }
      }

      // Recalculate nutrition after portion reduction
      for (const meal of dayData.meals) {
        if (!meal.ingredients || !Array.isArray(meal.ingredients)) continue;

        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFat = 0;

        for (const ingredient of meal.ingredients) {
          const amount = ingredient.amount || 0;
          const name = ingredient.name || '';

          if (amount > 0 && name) {
            const czechNutrition = await getIngredientNutrition(prisma, name);
            if (czechNutrition) {
              const multiplier = amount / 100;
              totalCalories += czechNutrition.calories * multiplier;
              totalProtein += czechNutrition.protein * multiplier;
              totalCarbs += czechNutrition.carbs * multiplier;
              totalFat += czechNutrition.fat * multiplier;
            }
          }
        }

        meal.nutrition = {
          calories: Math.round(totalCalories),
          protein: Math.round(totalProtein * 10) / 10,
          carbs: Math.round(totalCarbs * 10) / 10,
          fat: Math.round(totalFat * 10) / 10
        };
      }

      // Log final totals after adjustments
      dayTotalCalories = dayData.meals.reduce((sum: number, meal: any) => sum + (meal.nutrition?.calories || 0), 0);
      dayTotalCarbs = dayData.meals.reduce((sum: number, meal: any) => sum + (meal.nutrition?.carbs || 0), 0);
      dayTotalProtein = dayData.meals.reduce((sum: number, meal: any) => sum + (meal.nutrition?.protein || 0), 0);
      dayTotalFat = dayData.meals.reduce((sum: number, meal: any) => sum + (meal.nutrition?.fat || 0), 0);

      console.log(`Day ${day} after carb adjustment:`, {
        calories: dayTotalCalories,
        carbs: dayTotalCarbs,
        protein: dayTotalProtein,
        fat: dayTotalFat
      });
    }

    // If fat is way too high, reduce oil and high-fat ingredient portions
    if (dayTotalFat > nutritionTargets.fat * 1.3) { // More than 30% over target
      console.log(`Day ${day}: Fat too high (${dayTotalFat}g vs ${nutritionTargets.fat}g target), reducing oil portions...`);

      for (const meal of dayData.meals) {
        if (meal.ingredients) {
          for (const ingredient of meal.ingredients) {
            if (ingredient.amount && ingredient.amount > 0) {
              const name = ingredient.name?.toLowerCase() || '';

              // Reduce high-fat ingredients more aggressively
              if (name.includes('olej') || name.includes('oil') || name.includes('máslo') || name.includes('butter')) {
                ingredient.amount = Math.round(ingredient.amount * 0.3); // Reduce to 30%
                if (ingredient.amount < 1) ingredient.amount = 1; // Minimum 1g
              } else if (name.includes('ořech') || name.includes('nut') || name.includes('semínko') || name.includes('seed')) {
                ingredient.amount = Math.round(ingredient.amount * 0.7); // Reduce to 70%
                if (ingredient.amount < 5) ingredient.amount = 5; // Minimum 5g
              } else if (name.includes('sýr') || name.includes('cheese') || name.includes('avokádo') || name.includes('avocado')) {
                ingredient.amount = Math.round(ingredient.amount * 0.8); // Reduce to 80%
                if (ingredient.amount < 10) ingredient.amount = 10; // Minimum 10g
              }
            }
          }
        }
      }

      // Recalculate nutrition after fat reduction
      for (const meal of dayData.meals) {
        if (!meal.ingredients || !Array.isArray(meal.ingredients)) continue;

        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFat = 0;

        for (const ingredient of meal.ingredients) {
          const amount = ingredient.amount || 0;
          const name = ingredient.name || '';

          if (amount > 0 && name) {
            const czechNutrition = await getIngredientNutrition(prisma, name);
            if (czechNutrition) {
              const multiplier = amount / 100;
              totalCalories += czechNutrition.calories * multiplier;
              totalProtein += czechNutrition.protein * multiplier;
              totalCarbs += czechNutrition.carbs * multiplier;
              totalFat += czechNutrition.fat * multiplier;
            }
          }
        }

        meal.nutrition = {
          calories: Math.round(totalCalories),
          protein: Math.round(totalProtein * 10) / 10,
          carbs: Math.round(totalCarbs * 10) / 10,
          fat: Math.round(totalFat * 10) / 10
        };
      }

      // Log final totals after fat adjustments
      dayTotalCalories = dayData.meals.reduce((sum: number, meal: any) => sum + (meal.nutrition?.calories || 0), 0);
      dayTotalCarbs = dayData.meals.reduce((sum: number, meal: any) => sum + (meal.nutrition?.carbs || 0), 0);
      dayTotalProtein = dayData.meals.reduce((sum: number, meal: any) => sum + (meal.nutrition?.protein || 0), 0);
      dayTotalFat = dayData.meals.reduce((sum: number, meal: any) => sum + (meal.nutrition?.fat || 0), 0);

      console.log(`Day ${day} after fat adjustment:`, {
        calories: dayTotalCalories,
        carbs: dayTotalCarbs,
        protein: dayTotalProtein,
        fat: dayTotalFat
      });
    }

    // FINAL CHECK: Add supplements if needed (max 2 per day: protein + gainer)
    const finalGaps = {
      calories: Math.max(0, nutritionTargets.calories - dayTotalCalories),
      protein: Math.max(0, nutritionTargets.protein - dayTotalProtein),
      carbs: Math.max(0, nutritionTargets.carbs - dayTotalCarbs),
      fat: Math.max(0, nutritionTargets.fat - dayTotalFat)
    };

    console.log(`Day ${day}: Final gaps:`, finalGaps);

    // Allow up to 2 supplements per day: protein + gainer when both are needed
    let supplementsAdded = 0;
    const maxSupplements = 2;

    // Priority 1: Protein gap (only if significant AND below target)
    if (finalGaps.protein > 15 && dayTotalProtein < nutritionTargets.protein && supplementsAdded < maxSupplements) {
      console.log(`Day ${day}: Adding protein supplement for gap of ${finalGaps.protein}g`);

      const proteinNeeded = Math.min(finalGaps.protein, 30); // Max 30g protein
      const proteinAmount = Math.ceil(proteinNeeded / 0.73); // 73g protein per 100g whey

      const proteinShake: any = {
        name: "Proteinový doplněk",
        type: "svačina",
        ingredients: [{ name: "whey protein", amount: proteinAmount, unit: "g" }],
        instructions: `Smíchej ${proteinAmount}g whey proteinu s vodou`
        };

        proteinShake.nutrition = {
        calories: Math.round((374 * proteinAmount) / 100),
        protein: Math.round((73 * proteinAmount) / 100 * 10) / 10,
        carbs: Math.round((8.5 * proteinAmount) / 100 * 10) / 10,
        fat: Math.round((5 * proteinAmount) / 100 * 10) / 10
        };

        dayData.meals.push(proteinShake);
      supplementsAdded++;
      console.log(`Day ${day}: Added protein supplement: ${proteinAmount}g (${supplementsAdded}/2 supplements)`);
    }

    // Priority 2: Gainer for carbs/calories (can be added even if protein was added)
    if (supplementsAdded < maxSupplements && (finalGaps.carbs > 30 || finalGaps.calories > 200)) {
      console.log(`Day ${day}: Adding gainer supplement for carbs gap ${finalGaps.carbs}g, calories gap ${finalGaps.calories}kcal`);

      // Calculate gainer amount based on biggest gap
        let gainerAmount = 0;
      if (finalGaps.carbs > 30) {
        gainerAmount = Math.ceil(finalGaps.carbs / 0.49); // 49g carbs per 100g gainer
      } else if (finalGaps.calories > 200) {
        gainerAmount = Math.ceil(finalGaps.calories / 3.8); // 380 kcal per 100g gainer
      }

      // Limit gainer amount to reasonable size
      gainerAmount = Math.min(gainerAmount, 80); // Max 80g gainer

        const gainerShake: any = {
          name: "Gainer doplněk",
          type: "svačina",
        ingredients: [{ name: "gainer", amount: gainerAmount, unit: "g" }],
          instructions: `Smíchej ${gainerAmount}g gainer prášku s vodou nebo mlékem`
        };

        gainerShake.nutrition = {
        calories: Math.round((380 * gainerAmount) / 100),
        protein: Math.round((38 * gainerAmount) / 100 * 10) / 10,
        carbs: Math.round((49 * gainerAmount) / 100 * 10) / 10,
        fat: Math.round((3 * gainerAmount) / 100 * 10) / 10
        };

          dayData.meals.push(gainerShake);
      supplementsAdded++;
      console.log(`Day ${day}: Added gainer supplement: ${gainerAmount}g (${supplementsAdded}/2 supplements)`);
    }

    // FINAL CHECK: Remove protein supplement if protein is now too high
    const checkDayTotalProtein = dayData.meals.reduce((sum: number, meal: any) => sum + (meal.nutrition?.protein || 0), 0);
    if (checkDayTotalProtein > nutritionTargets.protein * 1.1) { // More than 10% over target
      console.log(`Day ${day}: Protein too high after supplements (${checkDayTotalProtein}g vs ${nutritionTargets.protein}g target), removing protein supplement...`);

      // Find and remove protein supplement
      const proteinSupplementIndex = dayData.meals.findIndex((meal: any) =>
        meal.name === "Proteinový doplněk" && meal.type === "svačina"
      );

      if (proteinSupplementIndex !== -1) {
        dayData.meals.splice(proteinSupplementIndex, 1);
        console.log(`Day ${day}: Removed protein supplement`);
      }
    }

    // FINAL CHECK: Remove gainer supplement if carbs are now too high
    const checkDayTotalCarbs = dayData.meals.reduce((sum: number, meal: any) => sum + (meal.nutrition?.carbs || 0), 0);
    if (checkDayTotalCarbs > nutritionTargets.carbs * 1.1) { // More than 10% over target
      console.log(`Day ${day}: Carbs too high after supplements (${checkDayTotalCarbs}g vs ${nutritionTargets.carbs}g target), removing gainer supplement...`);

      // Find and remove gainer supplement
      const gainerSupplementIndex = dayData.meals.findIndex((meal: any) =>
        meal.name === "Gainer doplněk" && meal.type === "svačina"
      );

      if (gainerSupplementIndex !== -1) {
        dayData.meals.splice(gainerSupplementIndex, 1);
        console.log(`Day ${day}: Removed gainer supplement`);
      }
    }

    // Log final day totals
    const finalDayTotalCalories = dayData.meals.reduce((sum: number, meal: any) => sum + (meal.nutrition?.calories || 0), 0);
    const finalDayTotalProtein = dayData.meals.reduce((sum: number, meal: any) => sum + (meal.nutrition?.protein || 0), 0);
    const finalDayTotalCarbs = dayData.meals.reduce((sum: number, meal: any) => sum + (meal.nutrition?.carbs || 0), 0);
    const finalDayTotalFat = dayData.meals.reduce((sum: number, meal: any) => sum + (meal.nutrition?.fat || 0), 0);

    console.log(`Day ${day} final totals:`, {
      calories: finalDayTotalCalories,
      protein: finalDayTotalProtein,
      carbs: finalDayTotalCarbs,
      fat: finalDayTotalFat
    });

    // Create meals in database for this day
    for (const meal of dayData.meals) {
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
          dayOfWeek: day,
          weekNumber: 1,
          calories: meal.nutrition?.calories || 0,
          protein: meal.nutrition?.protein || 0,
          carbs: meal.nutrition?.carbs || 0,
          fat: meal.nutrition?.fat || 0,
          servings: 1,
        },
      });

      await prisma.recipe.create({
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
  }

  // Update fitness profile
  await prisma.fitnessProfile.update({
    where: { id: fitnessProfileId },
    data: { currentMealPlan: { connect: { id: mealPlan.id } } }
  });

  console.log("Meal plan generation completed successfully");

  const totalMealCount = await prisma.meal.count({
    where: { mealPlanId: mealPlan.id }
  });

  return {
    mealPlanId: mealPlan.id,
    mealCount: totalMealCount,
    numberOfDays: numberOfDays,
    nutritionTargets,
    gaps: null,
    needsSupplements: false
  };
}