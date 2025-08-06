import OpenAI from "openai";
import { PrismaClient } from "../../generated/prisma";
import { createMealGenerationPrompt, MEAL_GENERATION_SYSTEM_PROMPT } from "../prompts";
import {
  calculateNutritionTargets,
  checkNutritionGaps,
  generateSupplementSuggestions
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

  // For now, generate 1 day of meals (can be expanded later)
  const mealsPerDay = 3; // Start with 3 meals per day

  const prompt = createMealGenerationPrompt({
    age: assessmentData.age,
    gender: assessmentData.gender,
    weight: assessmentData.weight,
    height: assessmentData.height,
    fitnessGoal: assessmentData.fitnessGoal,
    activityLevel: assessmentData.activityLevel,
    preferredCuisines,
    dietaryRestrictions,
    allergies,
    mealsPerDay
  });

  const completion = await openaiClient.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: MEAL_GENERATION_SYSTEM_PROMPT },
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 3000,
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

  const mealPlanData = JSON.parse(jsonContent);

  // Validate meal plan structure
  if (!mealPlanData.meals || !Array.isArray(mealPlanData.meals)) {
    throw new Error("Invalid meal plan structure from AI");
  }

  // Check nutrition gaps and add supplements if needed
  const { gaps, needsSupplements } = checkNutritionGaps(mealPlanData.meals, nutritionTargets);

  if (needsSupplements) {
    console.log("Adding supplements to meet nutrition targets");
    const supplements = generateSupplementSuggestions(gaps);
    mealPlanData.meals.push(...supplements);
  }

  // Create meal plan in database
  const mealPlan = await prisma.mealPlan.create({
    data: {
      fitnessProfileId: fitnessProfileId,
      name: `Jídelníček - ${new Date().toLocaleDateString()}`,
      description: `Personalizovaný jídelníček pro ${assessmentData.fitnessGoal.toLowerCase().replace('_', ' ')}`,
      duration: 1, // 1 day for now
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

    // Convert meal type to enum
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
        dayOfWeek: 1, // Monday
        weekNumber: 1,
        calories: meal.nutrition.calories,
        protein: meal.nutrition.protein,
        carbs: meal.nutrition.carbs,
        fat: meal.nutrition.fat,
        servings: 1,
      },
    });

    // Create recipe for the meal with ingredients
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

  // Update fitness profile to set current meal plan
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