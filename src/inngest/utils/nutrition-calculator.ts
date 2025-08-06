// Nutrition calculation utilities

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

// Calculate BMR using Mifflin-St Jeor equation
export function calculateBMR(weight: number, height: number, age: number, gender: string): number {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

// Calculate TDEE based on activity level
export function calculateTDEE(bmr: number, activityLevel: string): number {
  const activityMultipliers = {
    'SEDENTARY': 1.2,
    'LIGHTLY_ACTIVE': 1.375,
    'MODERATELY_ACTIVE': 1.55,
    'VERY_ACTIVE': 1.725,
    'EXTREMELY_ACTIVE': 1.9
  };

  return Math.round(bmr * (activityMultipliers[activityLevel as keyof typeof activityMultipliers] || 1.55));
}

// Calculate nutrition targets based on fitness goal
export function calculateNutritionTargets(
  weight: number,
  height: number,
  age: number,
  gender: string,
  activityLevel: string,
  fitnessGoal: string
): NutritionTargets {
  const bmr = calculateBMR(weight, height, age, gender);
  let tdee = calculateTDEE(bmr, activityLevel);

  // Adjust calories based on fitness goal
  switch (fitnessGoal) {
    case 'WEIGHT_LOSS':
      tdee = Math.round(tdee * 0.85); // 15% deficit
      break;
    case 'MUSCLE_GAIN':
    case 'STRENGTH':
      tdee = Math.round(tdee * 1.1); // 10% surplus
      break;
    default:
      // GENERAL_FITNESS, ENDURANCE, FLEXIBILITY - maintain weight
      break;
  }

  // Calculate macros based on fitness goal
  let proteinRatio: number;
  let fatRatio: number;
  let carbRatio: number;

  switch (fitnessGoal) {
    case 'WEIGHT_LOSS':
      proteinRatio = 0.35; // 35% protein
      fatRatio = 0.25;     // 25% fat
      carbRatio = 0.40;    // 40% carbs
      break;
    case 'MUSCLE_GAIN':
    case 'STRENGTH':
      proteinRatio = 0.30; // 30% protein
      fatRatio = 0.20;     // 20% fat
      carbRatio = 0.50;    // 50% carbs
      break;
    default:
      proteinRatio = 0.25; // 25% protein
      fatRatio = 0.25;     // 25% fat
      carbRatio = 0.50;    // 50% carbs
      break;
  }

  // Calculate macros in grams
  const protein = Math.round((tdee * proteinRatio) / 4); // 4 calories per gram
  const fat = Math.round((tdee * fatRatio) / 9);         // 9 calories per gram
  const carbs = Math.round((tdee * carbRatio) / 4);      // 4 calories per gram
  const fiber = Math.round(weight * 0.4); // 0.4g per kg body weight

  return {
    calories: tdee,
    protein,
    carbs,
    fat,
    fiber
  };
}

// Check if meal plan meets nutrition targets
export function checkNutritionGaps(
  meals: any[],
  targets: NutritionTargets
): { gaps: NutritionTargets; needsSupplements: boolean } {
  const totalNutrition = meals.reduce((total, meal) => {
    const nutrition = meal.nutrition;
    return {
      calories: total.calories + (nutrition.calories || 0),
      protein: total.protein + (nutrition.protein || 0),
      carbs: total.carbs + (nutrition.carbs || 0),
      fat: total.fat + (nutrition.fat || 0),
      fiber: total.fiber + (nutrition.fiber || 0)
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

  const gaps = {
    calories: Math.max(0, targets.calories - totalNutrition.calories),
    protein: Math.max(0, targets.protein - totalNutrition.protein),
    carbs: Math.max(0, targets.carbs - totalNutrition.carbs),
    fat: Math.max(0, targets.fat - totalNutrition.fat),
    fiber: Math.max(0, targets.fiber - totalNutrition.fiber)
  };

  const needsSupplements = gaps.protein > 10 || gaps.calories > 200;

  return { gaps, needsSupplements };
}

// Generate supplement suggestions
export function generateSupplementSuggestions(gaps: NutritionTargets): any[] {
  const supplements = [];

  if (gaps.protein > 10) {
    supplements.push({
      name: "Proteinový nápoj",
      type: "svačina",
      ingredients: [
        { name: "Whey protein", amount: 30, unit: "g" },
        { name: "Voda nebo mléko", amount: 250, unit: "ml" }
      ],
      nutrition: {
        calories: 120,
        protein: 24,
        carbs: 2,
        fat: 1,
        fiber: 0
      },
      prepTime: 2,
      instructions: "Smíchej protein s vodou nebo mlékem a vypij."
    });
  }

  if (gaps.calories > 200) {
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