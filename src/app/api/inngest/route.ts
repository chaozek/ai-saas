import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { syncUser } from "@/app/api/inngest/sync-user";
import { generateFitnessPlanFunction } from "@/inngest/ai-generation";
import { generateShoppingListFunction } from "@/inngest/shopping-list-function";
import { generateMealPlanOnlyFunction, regenerateMealFunction } from "@/inngest/meal-functions";

// Create an API that serves the fitness plan generation function
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateFitnessPlanFunction, generateShoppingListFunction, generateMealPlanOnlyFunction, regenerateMealFunction, syncUser],
});
