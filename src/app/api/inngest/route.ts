import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { generateFitnessPlanFunction, generateShoppingListFunction } from "@/inngest/functions";
import { syncUser } from "@/app/api/inngest/sync-user";

// Create an API that serves the fitness plan generation function
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateFitnessPlanFunction, generateShoppingListFunction, syncUser],
});
