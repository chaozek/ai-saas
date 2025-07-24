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

      // Create or update fitness profile synchronously first
      const fitnessProfile = await prisma.fitnessProfile.upsert({
        where: { userId: ctx.auth.userId },
        update: {
          age: parseInt(input.age),
          gender: input.gender,
          height: parseFloat(input.height),
          weight: parseFloat(input.weight),
          targetWeight: input.targetWeight ? parseFloat(input.targetWeight) : null,
          fitnessGoal: input.fitnessGoal,
          activityLevel: input.activityLevel,
          experienceLevel: input.experienceLevel,
          hasInjuries: input.hasInjuries,
          injuries: input.injuries || null,
          medicalConditions: input.medicalConditions || null,
          availableDays: JSON.stringify(input.availableDays),
          workoutDuration: parseInt(input.workoutDuration),
          preferredExercises: input.preferredExercises || null,
          equipment: JSON.stringify(input.equipment),
          mealPlanningEnabled: input.mealPlanningEnabled,
          dietaryRestrictions: input.dietaryRestrictions,
          allergies: input.allergies,
          budgetPerWeek: input.budgetPerWeek ? parseFloat(input.budgetPerWeek) : null,
          mealPrepTime: input.mealPrepTime ? parseInt(input.mealPrepTime) : null,
          preferredCuisines: input.preferredCuisines,
          cookingSkill: input.cookingSkill,
        },
        create: {
          userId: ctx.auth.userId,
          age: parseInt(input.age),
          gender: input.gender,
          height: parseFloat(input.height),
          weight: parseFloat(input.weight),
          targetWeight: input.targetWeight ? parseFloat(input.targetWeight) : null,
          fitnessGoal: input.fitnessGoal,
          activityLevel: input.activityLevel,
          experienceLevel: input.experienceLevel,
          hasInjuries: input.hasInjuries,
          injuries: input.injuries || null,
          medicalConditions: input.medicalConditions || null,
          availableDays: JSON.stringify(input.availableDays),
          workoutDuration: parseInt(input.workoutDuration),
          preferredExercises: input.preferredExercises || null,
          equipment: JSON.stringify(input.equipment),
          mealPlanningEnabled: input.mealPlanningEnabled,
          dietaryRestrictions: input.dietaryRestrictions,
          allergies: input.allergies,
          budgetPerWeek: input.budgetPerWeek ? parseFloat(input.budgetPerWeek) : null,
          mealPrepTime: input.mealPrepTime ? parseInt(input.mealPrepTime) : null,
          preferredCuisines: input.preferredCuisines,
          cookingSkill: input.cookingSkill,
        },
      });

      // Deactivate any existing active plans for this profile first
      await prisma.workoutPlan.updateMany({
        where: {
          fitnessProfileId: fitnessProfile.id,
          isActive: true
        },
        data: {
          isActive: false,
          activeProfileId: null
        },
      });

      // Create empty workout plan synchronously
      const workoutPlan = await prisma.workoutPlan.create({
        data: {
          name: `${input.fitnessGoal.replace('_', ' ')} Plan`,
          description: `Personalized ${input.fitnessGoal.toLowerCase().replace('_', ' ')} program designed for ${input.experienceLevel.toLowerCase()} level`,
          duration: 8,
          difficulty: input.experienceLevel,
          fitnessProfileId: fitnessProfile.id,
          isActive: true,
          activeProfileId: fitnessProfile.id,
        },
      });

      // Update the fitness profile to point to the new current plan
      await prisma.fitnessProfile.update({
        where: { id: fitnessProfile.id },
        data: { currentPlan: { connect: { id: workoutPlan.id } } }
      });

      // Trigger the Inngest function to generate the fitness plan details
      const result = await inngest.send({
        name: "generate-fitness-plan/run",
        data: {
          assessmentData: input,
          userId: ctx.auth.userId,
          workoutPlanId: workoutPlan.id, // Pass the plan ID to avoid recreating it
        },
      });

      return {
        success: true,
        message: "Fitness plan generation started",
        eventId: result.ids[0],
        planId: workoutPlan.id,
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
    .input(z.object({ workoutId: z.string() }))
    .query(async ({ ctx, input }) => {
      const workout = await prisma.workout.findFirst({
        where: {
          id: input.workoutId,
          workoutPlan: {
            fitnessProfile: {
              userId: ctx.auth.userId,
            },
          },
        },
        include: {
          exercises: {
            orderBy: {
              createdAt: 'asc'
            }
          },
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

        return mealPlans;
      } catch (error) {
        console.error("Error fetching meal plans:", error);
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