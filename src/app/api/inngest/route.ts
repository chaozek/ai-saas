import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { syncUser } from "@/app/api/inngest/sync-user";
import { generateShoppingListFunction } from "@/inngest/shopping-list-function";
import { generateFitnessPlanFunction, regenerateMealPlanFunction } from "@/inngest/ai-generation";

// Create an API that serves the fitness plan generation function
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateShoppingListFunction, syncUser, generateFitnessPlanFunction, regenerateMealPlanFunction],
});
