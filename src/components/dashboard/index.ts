// Types
export * from './types';

// Main components
export { DashboardHeader } from './dashboard-header';
export { StatsOverview } from './stats-overview';
export { PlanOverview } from './plan-overview';
export { PlanDetails } from './plan-details';

// Workout components
export { WorkoutCard } from './workout-card';
export { WorkoutsTab } from './workouts-tab';

// Meal components
export { MealCard } from './meal-card';
export { MealPlanHeader } from './meal-plan-header';
export { WeekMeals } from './week-meals';
export { MealsTab } from './meals-tab';

// Other tabs
export { ProgressTab } from './progress-tab';
export { OverviewTab } from './overview-tab';

// Modal components
export { ShoppingListModal } from './shopping-list-modal';

// Loading and error states
export {
  LoadingState,
  ErrorState,
  NoProfileState,
  NoWorkoutPlanState,
  UnauthorizedState
} from './loading-states';