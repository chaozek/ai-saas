import { PrismaClient } from "../../generated/prisma";

export interface NutritionTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface MealNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

// Simple BMR calculation
export function calculateBMR(weight: number, height: number, age: number, gender: string): number {
  if (gender.toLowerCase() === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

// Simple TDEE calculation
export function calculateTDEE(bmr: number, activityLevel: string): number {
  const multipliers = {
    'SEDENTARY': 1.2,
    'LIGHTLY_ACTIVE': 1.375,
    'MODERATELY_ACTIVE': 1.55,
    'VERY_ACTIVE': 1.725,
    'EXTREMELY_ACTIVE': 1.9
  };

  return Math.round(bmr * (multipliers[activityLevel as keyof typeof multipliers] || 1.2));
}

// Simple nutrition targets
export function calculateNutritionTargets(
  weight: number,
  height: number,
  age: number,
  gender: string,
  activityLevel: string,
  fitnessGoal: string
): NutritionTargets {
  const bmr = calculateBMR(weight, height, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);

  let targetCalories = tdee;
  let proteinRatio = 0.2; // 20% protein

  // Simple goal adjustments
  if (fitnessGoal === 'MUSCLE_GAIN') {
    targetCalories = tdee + 300;
    proteinRatio = 0.25;
  } else if (fitnessGoal === 'WEIGHT_LOSS') {
    targetCalories = tdee - 500;
    proteinRatio = 0.3;
  }

  const targetProtein = Math.round((targetCalories * proteinRatio) / 4);
  const targetFat = Math.round((targetCalories * 0.25) / 9);
  const targetCarbs = Math.round((targetCalories - (targetProtein * 4) - (targetFat * 9)) / 4);
  const targetFiber = Math.round(targetCalories / 1000 * 14);

  return {
    calories: targetCalories,
    protein: targetProtein,
    carbs: targetCarbs,
    fat: targetFat,
    fiber: targetFiber
  };
}

// Simple nutrition gap check
export function checkNutritionGaps(
  meals: any[],
  targets: NutritionTargets
): { gaps: NutritionTargets; needsSupplements: boolean } {
  const totalNutrition = meals.reduce((total: any, meal: any) => {
    if (!meal.nutrition) return total;

    const nutrition = meal.nutrition;
    return {
      calories: total.calories + (nutrition.calories || 0),
      protein: total.protein + (nutrition.protein || 0),
      carbs: total.carbs + (nutrition.carbs || 0),
      fat: total.fat + (nutrition.fat || 0),
      fiber: total.fiber + (nutrition.fiber || 0),
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

  const gaps = {
    calories: Math.max(0, targets.calories - totalNutrition.calories),
    protein: Math.max(0, targets.protein - totalNutrition.protein),
    carbs: Math.max(0, targets.carbs - totalNutrition.carbs),
    fat: Math.max(0, targets.fat - totalNutrition.fat),
    fiber: Math.max(0, targets.fiber - totalNutrition.fiber),
  };

  // Check if we need supplements for any major nutrient gaps
  const needsSupplements = gaps.protein > 30 || gaps.carbs > 60 || gaps.calories > 400;

  return { gaps, needsSupplements };
}

// Enhanced supplement suggestions that balance all macronutrients
export function generateSupplementSuggestions(gaps: NutritionTargets): any[] {
  const supplements: any[] = [];

  // Only add supplements for significant gaps to avoid over-supplementation
  // Priority 1: Protein gap (most important for muscle building)
  if (gaps.protein > 30) { // Increased threshold from 20g to 30g
    const proteinAmount = Math.min(gaps.protein, 40); // Max 40g protein per supplement
    supplements.push({
      name: "Proteinový nápoj",
      type: "svačina",
      ingredients: [{ name: "Whey protein", amount: proteinAmount, unit: "g" }],
      nutrition: {
        calories: proteinAmount * 4,
        protein: proteinAmount,
        carbs: 2,
        fat: 1,
        fiber: 0
      },
      prepTime: 1,
      instructions: "Smíchejte protein s vodou nebo mlékem."
    });
  }

  // Priority 2: Carbohydrate gap (important for energy and recovery)
  if (gaps.carbs > 60) { // Increased threshold from 50g to 60g
    const carbsAmount = Math.min(gaps.carbs, 80); // Max 80g carbs per supplement
    supplements.push({
      name: "Gainer nápoj",
      type: "svačina",
      ingredients: [{ name: "Gainer prášek", amount: 60, unit: "g" }],
      nutrition: {
        calories: carbsAmount * 4,
        protein: 15,
        carbs: carbsAmount,
        fat: 3,
        fiber: 2
      },
      prepTime: 1,
      instructions: "Smíchejte gainer s vodou nebo mlékem."
    });
  }

  // Priority 3: Calorie gap (if still needed after protein and carbs)
  if (gaps.calories > 400 && gaps.protein <= 30 && gaps.carbs <= 60) { // Increased threshold from 300 to 400
    supplements.push({
      name: "Gainer nápoj",
      type: "svačina",
      ingredients: [{ name: "Gainer prášek", amount: 50, unit: "g" }],
      nutrition: { calories: 200, protein: 10, carbs: 30, fat: 2, fiber: 0 },
      prepTime: 1,
      instructions: "Smíchejte gainer s vodou nebo mlékem."
    });
  }

  // Priority 4: Balanced supplement if multiple gaps exist (only for significant gaps)
  if (gaps.protein > 25 && gaps.carbs > 40) { // Increased thresholds
    supplements.push({
      name: "Vyvážený gainer",
      type: "svačina",
      ingredients: [{ name: "Gainer prášek", amount: 70, unit: "g" }],
      nutrition: {
        calories: 350,
        protein: 25,
        carbs: 55,
        fat: 4,
        fiber: 2
      },
      prepTime: 1,
      instructions: "Smíchejte gainer s vodou nebo mlékem."
    });
  }

  return supplements;
}

// Simple Czech food search with basic fuzzy matching
export async function searchCzechFood(prisma: PrismaClient, query: string): Promise<any[]> {
  try {
    console.log(`Searching Czech food database for: ${query}`);

    const cleanQuery = query.toLowerCase().trim();

    // Try exact match first
    let foods = await prisma.czechFood.findMany({
      where: {
        name: {
          contains: cleanQuery,
          mode: 'insensitive'
        }
      },
      take: 20,
      orderBy: {
        name: 'asc'
      }
    });

    // If no exact matches, try word-based search
    if (foods.length === 0) {
      console.log(`No exact matches for "${cleanQuery}", trying word search...`);

      const words = cleanQuery.split(/\s+/).filter(word => word.length > 2);

      for (const word of words) {
        const wordResults = await prisma.czechFood.findMany({
          where: {
            OR: [
              { name: { contains: word, mode: 'insensitive' } },
              { englishName: { contains: word, mode: 'insensitive' } }
            ]
          },
          take: 10,
          orderBy: {
            name: 'asc'
          }
        });

        foods = [...foods, ...wordResults];
      }

      // Remove duplicates
      foods = foods.filter((food, index, self) =>
        index === self.findIndex(f => f.id === food.id)
      ).slice(0, 20);
    }

    // Better scoring for Czech foods
    const scoredFoods = foods.map(food => {
      const foodName = food.name.toLowerCase();
      let score = 0;

      // Exact match gets highest score
      if (foodName === cleanQuery) {
        score += 1000;
      }

      // Starts with query gets very high score
      if (foodName.startsWith(cleanQuery)) {
        score += 500;
      }

      // Contains query as substring gets high score
      if (foodName.includes(cleanQuery)) {
        score += 300;
      }

      // Query words in correct order gets good score
      const queryWords = cleanQuery.split(/\s+/);
      const foodWords = foodName.split(/\s+/);

      // Check if query words appear in food name in similar order
      let orderScore = 0;
      let lastIndex = -1;
      for (const queryWord of queryWords) {
        const wordIndex = foodWords.findIndex(word => word.includes(queryWord));
        if (wordIndex > lastIndex) {
          orderScore += 50;
          lastIndex = wordIndex;
        }
      }
      score += orderScore;

      // Contains all query words gets bonus
      const containsAllWords = queryWords.every(word =>
        foodWords.some(foodWord => foodWord.includes(word))
      );
      if (containsAllWords) {
        score += 200;
      }

      // Count matching words
      const matchingWords = queryWords.filter(queryWord =>
        foodWords.some(foodWord => foodWord.includes(queryWord))
      ).length;
      score += matchingWords * 100;

      // HEAVY PENALTIES for wrong food types
      if (query.includes('jablko') && (foodName.includes('závin') || foodName.includes('koláč') || foodName.includes('dort'))) {
        score -= 1000; // Heavy penalty for baked goods when searching for raw fruit
      }

      if (query.includes('sojová') && !foodName.includes('sojová')) {
        score -= 1000; // Heavy penalty for non-soy when searching for soy sauce
      }

      if (query.includes('rýže') && !foodName.includes('rýže')) {
        score -= 1000; // Heavy penalty for non-rice when searching for rice
      }

      if (query.includes('mrkev') && !foodName.includes('mrkev')) {
        score -= 1000; // Heavy penalty for non-carrot when searching for carrot
      }

      // Penalize processed foods when searching for raw ingredients
      if (query.includes('jablko') && (foodName.includes('konzerva') || foodName.includes('sterilovaný') || foodName.includes('mražený'))) {
        score -= 800;
      }

      if (query.includes('okurka') && (foodName.includes('konzerva') || foodName.includes('sterilovaný') || foodName.includes('mražený'))) {
        score -= 800;
      }

      // Penalize foods with too many extra words
      const extraWords = foodWords.filter(word =>
        !queryWords.some(queryWord => word.includes(queryWord)) && word.length > 2
      );
      if (extraWords.length > 3) {
        score -= extraWords.length * 200; // Heavy penalty for foods with many extra words
      }

      // Prefer raw/fresh foods over processed ones
      if (foodName.includes('čerstvý') || foodName.includes('syrový')) {
        score += 100;
      }

      // Bonus for exact word matches
      const exactWordMatches = queryWords.filter(queryWord =>
        foodWords.some(foodWord => foodWord === queryWord)
      ).length;
      score += exactWordMatches * 150;

      return { ...food, score };
    });

    // Sort by score and take top 5
    const sortedFoods = scoredFoods
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    console.log(`Found ${sortedFoods.length} Czech foods for "${query}" (top result: ${sortedFoods[0]?.name} with score ${sortedFoods[0]?.score})`);
    return sortedFoods;
  } catch (error) {
    console.error(`Error searching Czech food database for ${query}:`, error);
    return [];
  }
}

// Simple ingredient nutrition
export async function getIngredientNutrition(prisma: PrismaClient, ingredientName: string): Promise<{ calories: number; protein: number; carbs: number; fat: number } | null> {
  try {
    const foods = await searchCzechFood(prisma, ingredientName);

    if (foods.length > 0) {
      const selectedFood = foods[0];
      return {
        calories: selectedFood.calories || 0,
        protein: selectedFood.protein || 0,
        carbs: selectedFood.usableCarbs || selectedFood.carbs || 0,
        fat: selectedFood.fat || 0
      };
    }

    return null;
  } catch (error) {
    console.error(`Error getting Czech nutrition:`, error);
    return null;
  }
}