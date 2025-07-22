import { inngest } from "@/inngest/client";
import prisma from "@/lib/prisma";
import { protectedProcedure, createTRPCRouter } from "@/trcp/init";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { consumeCredits } from "@/lib/usage";

const assessmentDataSchema = z.object({
  age: z.string(),
  gender: z.string(),
  height: z.string(),
  weight: z.string(),
  targetWeight: z.string().optional(),
  fitnessGoal: z.enum(["WEIGHT_LOSS", "MUSCLE_GAIN", "ENDURANCE", "STRENGTH", "FLEXIBILITY", "GENERAL_FITNESS"]),
  activityLevel: z.enum(["SEDENTARY", "LIGHTLY_ACTIVE", "MODERATELY_ACTIVE", "VERY_ACTIVE", "EXTREMELY_ACTIVE"]),
  experienceLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  hasInjuries: z.boolean(),
  injuries: z.string().optional(),
  medicalConditions: z.string().optional(),
  availableDays: z.array(z.string()),
  workoutDuration: z.string(),
  preferredExercises: z.string().optional(),
  equipment: z.array(z.string()),
  mealPlanningEnabled: z.boolean(),
  dietaryRestrictions: z.array(z.string()),
  allergies: z.array(z.string()),
  budgetPerWeek: z.string(),
  mealPrepTime: z.string(),
  preferredCuisines: z.array(z.string()),
  cookingSkill: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
});

export const fitnessRouter = createTRPCRouter({
  generatePlan: protectedProcedure
    .input(assessmentDataSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        await consumeCredits();
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
          });
        }
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "You do not have enough credits",
        });
      }

      // Trigger the Inngest function to generate the fitness plan
      const result = await inngest.send({
        name: "generate-fitness-plan/run",
        data: {
          assessmentData: input,
          userId: ctx.auth.userId,
        },
      });

      return {
        success: true,
        message: "Fitness plan generation started",
        eventId: result.ids[0],
      };
    }),

  debugPlans: protectedProcedure
    .query(async ({ ctx }) => {
      const profile = await prisma.fitnessProfile.findUnique({
        where: { userId: ctx.auth.userId },
        include: {
          currentPlan: {
            include: {
              workouts: {
                include: {
                  exercises: true,
                },
              },
            },
          },
          workoutPlans: {
            include: {
              workouts: {
                include: {
                  exercises: true,
                },
              },
            },
          },
          currentMealPlan: {
            include: {
              meals: {
                include: {
                  recipes: true,
                },
              },
            },
          },
          mealPlans: {
            include: {
              meals: {
                include: {
                  recipes: true,
                },
              },
            },
          },
        },
      });

      return {
        profile,
        planCount: profile?.workoutPlans.length || 0,
        currentPlan: profile?.currentPlan,
        workoutCount: profile?.currentPlan?.workouts.length || 0,
        mealPlanCount: profile?.mealPlans.length || 0,
        currentMealPlan: profile?.currentMealPlan,
        mealCount: profile?.currentMealPlan?.meals.length || 0,
        mealPlanningEnabled: profile?.mealPlanningEnabled,
      };
    }),

  testGeneratePlan: protectedProcedure
    .mutation(async ({ ctx }) => {
      // Create a test assessment data
      const testAssessmentData = {
        age: "25",
        gender: "male",
        height: "175",
        weight: "70",
        fitnessGoal: "GENERAL_FITNESS" as const,
        activityLevel: "MODERATELY_ACTIVE" as const,
        experienceLevel: "BEGINNER" as const,
        hasInjuries: false,
        availableDays: ["monday", "wednesday", "friday"],
        workoutDuration: "45",
        equipment: ["none"],
        mealPlanningEnabled: true,
        dietaryRestrictions: ["none"],
        allergies: [],
        budgetPerWeek: "100",
        mealPrepTime: "30",
        preferredCuisines: ["italian", "mexican"],
        cookingSkill: "BEGINNER" as const,
      };

      // Trigger the Inngest function to generate the fitness plan
      const result = await inngest.send({
        name: "generate-fitness-plan/run",
        data: {
          assessmentData: testAssessmentData,
          userId: ctx.auth.userId,
        },
      });

      return {
        success: true,
        message: "Test fitness plan generation started",
        eventId: result.ids[0],
      };
    }),

  generateShoppingList: protectedProcedure
    .input(z.object({
      weekNumber: z.number(),
      weekMeals: z.array(z.any()),
    }))
    .mutation(async ({ ctx, input }) => {
      // Trigger the Inngest function to generate the shopping list
      const result = await inngest.send({
        name: "generate-shopping-list/run",
        data: {
          weekNumber: input.weekNumber,
          weekMeals: input.weekMeals,
          userId: ctx.auth.userId,
        },
      });

      return {
        success: true,
        message: `Shopping list generation started for Week ${input.weekNumber}`,
        eventId: result.ids[0],
      };
    }),

  testMealPlanModels: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        // Test if meal plan models are accessible
        const mealPlanCount = await prisma.mealPlan.count();
        const mealCount = await prisma.meal.count();
        const recipeCount = await prisma.recipe.count();

        return {
          success: true,
          mealPlanCount,
          mealCount,
          recipeCount,
          message: "Meal plan models are accessible"
        };
      } catch (error) {
        console.error("Error testing meal plan models:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
          message: "Meal plan models are not accessible"
        };
      }
    }),

  getProfile: protectedProcedure
    .query(async ({ ctx }) => {
      const profile = await prisma.fitnessProfile.findUnique({
        where: { userId: ctx.auth.userId },
        include: {
          currentPlan: {
            include: {
              workouts: {
                include: {
                  exercises: true,
                },
              },
            },
          },
          progressLogs: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      });

      if (!profile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Fitness profile not found",
        });
      }

      return profile;
    }),

  getWorkoutPlans: protectedProcedure
    .query(async ({ ctx }) => {
      const plans = await prisma.workoutPlan.findMany({
        where: {
          fitnessProfile: {
            userId: ctx.auth.userId,
          },
        },
        include: {
          workouts: {
            include: {
              exercises: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return plans;
    }),

  getWorkout: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const workout = await prisma.workout.findFirst({
        where: {
          id: input.id,
          workoutPlan: {
            fitnessProfile: {
              userId: ctx.auth.userId,
            },
          },
        },
        include: {
          exercises: true,
        },
      });

      if (!workout) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workout not found",
        });
      }

      return workout;
    }),

  logProgress: protectedProcedure
    .input(z.object({
      weight: z.number().optional(),
      bodyFat: z.number().optional(),
      measurements: z.string().optional(),
      workoutNotes: z.string().optional(),
      energyLevel: z.number().min(1).max(10).optional(),
      difficulty: z.number().min(1).max(10).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const profile = await prisma.fitnessProfile.findUnique({
        where: { userId: ctx.auth.userId },
      });

      if (!profile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Fitness profile not found",
        });
      }

      const progressLog = await prisma.progressLog.create({
        data: {
          fitnessProfileId: profile.id,
          weight: input.weight,
          bodyFat: input.bodyFat,
          measurements: input.measurements,
          workoutNotes: input.workoutNotes,
          energyLevel: input.energyLevel,
          difficulty: input.difficulty,
        },
      });

      return progressLog;
    }),

  getMealPlans: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        console.log("Fetching meal plans for user:", ctx.auth.userId);
        console.log("Prisma client available:", !!prisma);
        console.log("MealPlan model available:", !!prisma.mealPlan);

        const mealPlans = await prisma.mealPlan.findMany({
          where: {
            fitnessProfile: {
              userId: ctx.auth.userId,
            },
          },
          include: {
            meals: {
              include: {
                recipes: true,
              },
              orderBy: [
                { dayOfWeek: "asc" },
                { mealType: "asc" }
              ],
            },
          },
          orderBy: { createdAt: "desc" },
        });

        console.log("Found meal plans:", mealPlans.length);
        return mealPlans;
      } catch (error) {
        console.error("Error fetching meal plans:", error);
        console.error("Error details:", {
          name: error instanceof Error ? error.name : "Unknown",
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        });
        return [];
      }
    }),

  getCurrentMealPlan: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const profile = await prisma.fitnessProfile.findUnique({
          where: { userId: ctx.auth.userId },
          include: {
            currentMealPlan: {
              include: {
                meals: {
                  include: {
                    recipes: true,
                  },
                  orderBy: [
                    { dayOfWeek: "asc" },
                    { mealType: "asc" }
                  ],
                },
              },
            },
          },
        });

        if (!profile) {
          return null;
        }

        return profile.currentMealPlan;
      } catch (error) {
        console.error("Error fetching current meal plan:", error);
        return null;
      }
    }),



  checkGenerationStatus: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        // Check if user has a fitness profile
        const profile = await prisma.fitnessProfile.findUnique({
          where: { userId: ctx.auth.userId },
          include: {
            currentPlan: {
              include: {
                workouts: {
                  include: {
                    exercises: true,
                  },
                },
              },
            },
            currentMealPlan: {
              include: {
                meals: {
                  include: {
                    recipes: true,
                  },
                  orderBy: [
                    { dayOfWeek: "asc" },
                    { mealType: "asc" }
                  ],
                },
              },
            },
          },
        });

        if (!profile) {
          return {
            hasProfile: false,
            hasWorkoutPlan: false,
            hasMealPlan: false,
            workoutPlanComplete: false,
            mealPlanComplete: false,
            isGenerating: false,
          };
        }

        const hasWorkoutPlan = !!profile.currentPlan;
        const hasMealPlan = !!profile.currentMealPlan;
        const workoutPlanComplete = hasWorkoutPlan && profile.currentPlan!.workouts.length > 0;
        const mealPlanComplete = hasMealPlan && profile.currentMealPlan!.meals.length > 0;

        return {
          hasProfile: true,
          hasWorkoutPlan,
          hasMealPlan,
          workoutPlanComplete,
          mealPlanComplete,
          isGenerating: !workoutPlanComplete || (profile.mealPlanningEnabled && !mealPlanComplete),
        };
      } catch (error) {
        console.error("Error checking generation status:", error);
        return {
          hasProfile: false,
          hasWorkoutPlan: false,
          hasMealPlan: false,
          workoutPlanComplete: false,
          mealPlanComplete: false,
          isGenerating: false,
        };
      }
    }),

  getShoppingList: protectedProcedure
    .input(z.object({ weekNumber: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        // Find the project that contains the shopping list for this week
        const projects = await prisma.project.findMany({
          where: {
            userId: ctx.auth.userId,
            name: {
              contains: `Week ${input.weekNumber} Shopping List`
            }
          },
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 1
        });

        if (projects.length === 0 || !projects[0].messages.length) {
          return null;
        }

        return {
          content: projects[0].messages[0].content,
          projectId: projects[0].id,
          createdAt: projects[0].createdAt
        };
      } catch (error) {
        console.error("Error fetching shopping list:", error);
        return null;
      }
    }),
});