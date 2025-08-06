export interface WorkoutPlan {
  name: string;
  description: string | null;
  planContent?: string | null; // AI generated detailed plan content
  duration: number; // weeks
  difficulty: string;
  workouts: Workout[];
}

export interface Workout {
  id: string;
  name: string;
  description: string | null;
  dayOfWeek: number;
  weekNumber: number;
  duration: number;
  workoutExercises: WorkoutExercise[];
  completed?: boolean;
}

export interface WorkoutExercise {
  id: string;
  workoutId: string;
  exerciseId: string;
  sets?: number | null;
  reps?: number | null;
  duration?: number | null;
  restTime?: number | null;
  weight?: number | null;
  exercise: Exercise;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Exercise {
  id: string;
  name: string;
  englishName?: string | null;
  description: string | null;
  category: string;
  equipment?: string[];
  youtubeUrl?: string | null; // YouTube video URL for exercise demonstration
  createdAt?: Date;
  updatedAt?: Date;
  difficulty?: string;
  muscleGroups?: string[];
}

export interface MealPlan {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  caloriesPerDay: number | null;
  proteinPerDay: number | null;
  carbsPerDay: number | null;
  fatPerDay: number | null;
  isActive?: boolean;
  fitnessProfileId?: string;
  activeProfileId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  meals: Meal[];
}

export interface Meal {
  id: string;
  name: string;
  description: string | null;
  dayOfWeek: number;
  weekNumber: number;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' | 'SUPPLEMENT';
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  servings?: number | null;
  mealPlanId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  recipes: Recipe[];
  // Supplementary meal properties
  _supplementary?: boolean;
  _supplementaryType?: string;
  _regenerated?: boolean;
  _nutrientsReduced?: boolean;
  _reductionType?: string;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: string; // JSON string
  instructions: string;
  nutrition?: string | null; // JSON nutrition info
  servings?: number | null;
  difficulty?: string | null;
  cuisine?: string | null;
  tags?: string[];
  description?: string | null;
  mealId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FitnessProfile {
  id: string;
  currentPlan?: WorkoutPlan;
  currentMealPlan?: MealPlan | null;
  mealPlanningEnabled: boolean;
}

export const DAYS = ["Neděle", "Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota"];