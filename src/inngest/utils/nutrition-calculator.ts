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

// BMR calculation using Mifflin-St Jeor equation
export function calculateBMR(weight: number, height: number, age: number, gender: string): number {
  if (gender.toLowerCase() === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

// TDEE calculation based on activity level
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

// Calculate nutrition targets based on fitness goals
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
  let proteinRatio = 0.15; // Default 15% of calories

  // Adjust based on fitness goal
  switch (fitnessGoal) {
    case 'MUSCLE_GAIN':
      targetCalories = tdee + 300; // Surplus for muscle gain
      proteinRatio = 0.25; // 25% of calories for protein
      break;
    case 'WEIGHT_LOSS':
      targetCalories = tdee - 500; // Deficit for weight loss
      proteinRatio = 0.30; // Higher protein to preserve muscle
      break;
    case 'ENDURANCE':
      targetCalories = tdee + 200;
      proteinRatio = 0.20;
      break;
    case 'STRENGTH':
      targetCalories = tdee + 250;
      proteinRatio = 0.25;
      break;
    default:
      // General fitness - maintain weight
      break;
  }

  const targetProtein = Math.round((targetCalories * proteinRatio) / 4); // 4 calories per gram of protein
  const targetFat = Math.round((targetCalories * 0.25) / 9); // 25% fat, 9 calories per gram
  const targetCarbs = Math.round((targetCalories - (targetProtein * 4) - (targetFat * 9)) / 4); // Remaining calories as carbs
  const targetFiber = Math.round(targetCalories / 1000 * 14); // 14g fiber per 1000 calories

  return {
    calories: targetCalories,
    protein: targetProtein,
    carbs: targetCarbs,
    fat: targetFat,
    fiber: targetFiber
  };
}

// Check if meals meet nutrition targets and suggest supplements
export function checkNutritionGaps(
  meals: any[],
  targets: NutritionTargets
): { gaps: NutritionTargets; needsSupplements: boolean } {
  const totalNutrition = meals.reduce((total: any, meal: any) => {
    if (!meal.nutrition) {
      console.warn(`Meal ${meal.name} missing nutrition data in gap calculation`);
      return total;
    }

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

  const needsSupplements = gaps.protein > 15 || gaps.calories > 200;

  return { gaps, needsSupplements };
}

// Generate supplement suggestions to meet nutrition gaps
export function generateSupplementSuggestions(gaps: NutritionTargets): any[] {
  const supplements: any[] = [];

  // Add protein shake if protein gap is significant
  if (gaps.protein > 15) {
    supplements.push({
      name: "Proteinový nápoj",
      type: "svačina",
      ingredients: [
        { name: "Whey protein", amount: 30, unit: "g" }
      ],
      nutrition: {
        calories: 120,
        protein: 30,
        carbs: 2,
        fat: 1,
        fiber: 0
      },
      prepTime: 1,
      instructions: "Smíchejte protein s vodou nebo mlékem."
    });
  }

  // Add gainer if calorie gap is significant and protein is met
  if (gaps.calories > 200 && gaps.protein <= 10) {
    supplements.push({
      name: "Gainer nápoj",
      type: "svačina",
      ingredients: [
        { name: "Gainer prášek", amount: 50, unit: "g" }
      ],
      nutrition: {
        calories: 200,
        protein: 10,
        carbs: 30,
        fat: 2,
        fiber: 0
      },
      prepTime: 1,
      instructions: "Smíchejte gainer s vodou nebo mlékem."
    });
  }

  // Add nuts for calorie gap if protein and carbs are met
  if (gaps.calories > 100 && gaps.protein <= 10 && gaps.carbs <= 20) {
    supplements.push({
      name: "Ořechová směs",
      type: "svačina",
      ingredients: [
        { name: "Směs ořechů", amount: 30, unit: "g" }
      ],
      nutrition: {
        calories: 180,
        protein: 6,
        carbs: 8,
        fat: 16,
        fiber: 3
      },
      prepTime: 1,
      instructions: "Dejte si hrst ořechů jako svačinu."
    });
  }

  return supplements;
}

// Czech Food Database functions
export async function searchCzechFood(prisma: PrismaClient, query: string): Promise<any[]> {
  try {
    console.log(`Searching Czech food database for: ${query}`);

    // Clean and normalize query
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

    // If no exact matches, try fuzzy search
    if (foods.length === 0) {
      console.log(`No exact matches for "${cleanQuery}", trying fuzzy search...`);

      // Split query into words and search for each
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

      // Remove duplicates and limit results
      foods = foods.filter((food, index, self) =>
        index === self.findIndex(f => f.id === food.id)
      ).slice(0, 20);
    }

    // Score and sort results by relevance
    const scoredFoods = foods.map(food => {
      const foodName = food.name.toLowerCase();
      const queryWords = cleanQuery.split(/\s+/);

      let score = 0;

      // Exact match gets highest score
      if (foodName === cleanQuery) {
        score += 1000;
      }

      // Starts with query gets high score
      if (foodName.startsWith(cleanQuery)) {
        score += 500;
      }

      // Contains all query words gets good score
      const containsAllWords = queryWords.every(word => foodName.includes(word));
      if (containsAllWords) {
        score += 300;
      }

      // Contains most query words gets medium score
      const matchingWords = queryWords.filter(word => foodName.includes(word)).length;
      score += matchingWords * 100;

      // Penalize foods that contain extra words that might be wrong
      const extraWords = foodName.split(/\s+/).filter(word =>
        !queryWords.includes(word) && word.length > 2
      );
      score -= extraWords.length * 50;

      // Penalize processed/weird foods
      if (foodName.includes('sušený') || foodName.includes('prášek') ||
          foodName.includes('acidofilní') || foodName.includes('baobab')) {
        score -= 200;
      }

      // Prefer raw/fresh foods
      if (foodName.includes('čerstvý') || foodName.includes('syrový')) {
        score += 100;
      }

      return { ...food, score };
    });

    // Sort by score (highest first) and take top 5
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

// Function to get nutrition for ingredients from Czech database
export async function getIngredientNutrition(prisma: PrismaClient, ingredientName: string): Promise<{ calories: number; protein: number; carbs: number; fat: number } | null> {
  try {
    console.log(`Getting Czech nutrition for: ${ingredientName}`);

    const foods = await searchCzechFood(prisma, ingredientName);

    if (foods.length > 0) {
      // Select the best match (first result)
      const selectedFood = foods[0];
      console.log(`Selected Czech food: ${selectedFood.name} (${selectedFood.calories} kcal, ${selectedFood.protein}g protein)`);

      // Use more precise nutrition data from Czech database
      return {
        // Use exact calories from database (ENERC field)
        calories: selectedFood.calories || 0,
        // Use protein from database (PROT field)
        protein: selectedFood.protein || 0,
        // Use usable carbs (CHO field) instead of total carbs (CHOT field)
        // This excludes fiber which is not digestible
        carbs: selectedFood.usableCarbs || selectedFood.carbs || 0,
        // Use total fat from database (FAT field)
        fat: selectedFood.fat || 0
      };
    }

    console.warn(`No Czech food found for: ${ingredientName}`);
    return null;
  } catch (error) {
    console.error(`Error getting Czech nutrition for ${ingredientName}:`, error);
    return null;
  }
}