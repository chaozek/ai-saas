import { inngest } from "@/inngest/client";
import prisma from "@/lib/prisma";
import { protectedProcedure, baseProcedure, createTRPCRouter } from "@/trcp/init";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { consumeCredits } from "@/lib/usage";
import { ensureUserExists } from "@/lib/user-utils";
import Stripe from 'stripe';


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

const assessmentDataSchema = z.object({
  age: z.string(),
  gender: z.string(),
  height: z.string(),
  weight: z.string(),
  targetWeight: z.string().optional(),
  fitnessGoal: z.enum(["WEIGHT_LOSS", "MUSCLE_GAIN", "ENDURANCE", "STRENGTH", "FLEXIBILITY", "GENERAL_FITNESS"]),
  activityLevel: z.enum(["SEDENTARY", "LIGHTLY_ACTIVE", "MODERATELY_ACTIVE", "VERY_ACTIVE", "EXTREMELY_ACTIVE"]),
  experienceLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  targetMuscleGroups: z.array(z.string()),

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

      // Ensure user exists in database first
      const user = await ensureUserExists(ctx.auth.userId);

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
          targetMuscleGroups: input.targetMuscleGroups,
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
          targetMuscleGroups: input.targetMuscleGroups,
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

      // Generate Czech plan name based on fitness goal
      const getCzechPlanName = (fitnessGoal: string) => {
        switch (fitnessGoal) {
          case 'WEIGHT_LOSS': return 'Plán na hubnutí';
          case 'MUSCLE_GAIN': return 'Plán na nabírání svalů';
          case 'ENDURANCE': return 'Plán na vytrvalost';
          case 'STRENGTH': return 'Plán na sílu';
          case 'FLEXIBILITY': return 'Plán na flexibilitu';
          case 'GENERAL_FITNESS': return 'Obecný fitness plán';
          default: return 'Personalizovaný fitness plán';
        }
      };

      const getCzechExperienceLevel = (level: string) => {
        switch (level) {
          case 'BEGINNER': return 'začátečník';
          case 'INTERMEDIATE': return 'střední';
          case 'ADVANCED': return 'pokročilý';
          default: return 'začátečník';
        }
      };

      // Create empty workout plan synchronously
      const workoutPlan = await prisma.workoutPlan.create({
        data: {
          name: getCzechPlanName(input.fitnessGoal),
          description: `Personalizovaný ${getCzechPlanName(input.fitnessGoal).toLowerCase()} navržený pro ${getCzechExperienceLevel(input.experienceLevel)} úroveň`,
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
                  workoutExercises: {
                    include: {
                      exercise: true,
                    },
                  },
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
              workoutExercises: {
                include: {
                  exercise: true,
                },
              },
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
          workoutExercises: {
            include: {
              exercise: true,
            },
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

  getPublicWorkout: baseProcedure
    .input(z.object({ workoutId: z.string() }))
    .query(async ({ input }) => {
      const workout = await prisma.workout.findFirst({
        where: {
          id: input.workoutId,
          workoutPlan: {
            isPublic: true,
          },
        },
        include: {
          workoutExercises: {
            include: {
              exercise: true,
            },
            orderBy: {
              createdAt: 'asc'
            }
          },
        },
      });

      if (!workout) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Public workout not found",
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
      // Find the project that contains the shopping list for this week
      const projects = await prisma.project.findMany({
        where: {
          userId: ctx.auth.userId,
          name: {
            contains: `Nákupní seznam týden ${input.weekNumber}`
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
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Nákupní seznam pro týden ${input.weekNumber} nebyl nalezen. Vygenerujte ho nejdříve.`,
        });
      }

      const content = projects[0].messages[0].content;
      // Remove the prefix "Zde je váš organizovaný nákupní seznam pro týden X:\n\n"
      const shoppingListContent = content.replace(/^Zde je váš organizovaný nákupní seznam pro týden \d+:\n\n/, '');

      return {
        content: shoppingListContent,
        projectId: projects[0].id,
        createdAt: projects[0].createdAt
      };
    }),

  generateMealPlanOnly: protectedProcedure
    .mutation(async ({ ctx }) => {
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

      // Get the existing fitness profile
      const fitnessProfile = await prisma.fitnessProfile.findUnique({
        where: { userId: ctx.auth.userId },
      });

      if (!fitnessProfile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Fitness profile not found. Please complete your fitness assessment first.",
        });
      }

      if (!fitnessProfile.mealPlanningEnabled) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Meal planning is not enabled in your fitness profile.",
        });
      }

      // Kontrola povinných údajů před spuštěním Inngest funkce
      const missingFields = [];
      if (!fitnessProfile.age || fitnessProfile.age <= 0) missingFields.push('věk');
      if (!fitnessProfile.gender || fitnessProfile.gender.trim() === '') missingFields.push('pohlaví');
      if (!fitnessProfile.height || fitnessProfile.height <= 0) missingFields.push('výška');
      if (!fitnessProfile.weight || fitnessProfile.weight <= 0) missingFields.push('váha');

      if (missingFields.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Nelze vygenerovat jídelní plán - chybí povinné údaje: ${missingFields.join(', ')}. Prosím, vyplňte fitness assessment znovu s kompletními údaji.`,
        });
      }

      // Trigger the Inngest function to generate only the meal plan
      const result = await inngest.send({
        name: "generate-meal-plan-only/run",
        data: {
          userId: ctx.auth.userId,
          fitnessProfileId: fitnessProfile.id,
        },
      });

      return {
        success: true,
        message: "Meal plan generation started",
        eventId: result.ids[0],
      };
    }),

  enableMealPlanningAndGenerate: protectedProcedure
    .mutation(async ({ ctx }) => {
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

      // Get the existing fitness profile
      const fitnessProfile = await prisma.fitnessProfile.findUnique({
        where: { userId: ctx.auth.userId },
      });

      if (!fitnessProfile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Fitness profile not found. Please complete your fitness assessment first.",
        });
      }

      // Enable meal planning and set default values if not already set
      const updatedProfile = await prisma.fitnessProfile.update({
        where: { id: fitnessProfile.id },
        data: {
          mealPlanningEnabled: true,
          dietaryRestrictions: fitnessProfile.dietaryRestrictions.length > 0 ? fitnessProfile.dietaryRestrictions : ["healthy"],
          allergies: fitnessProfile.allergies.length > 0 ? fitnessProfile.allergies : [],
          budgetPerWeek: fitnessProfile.budgetPerWeek || 100,
          mealPrepTime: fitnessProfile.mealPrepTime || 30,
          preferredCuisines: fitnessProfile.preferredCuisines.length > 0 ? fitnessProfile.preferredCuisines : ["czech", "mediterranean"],
          cookingSkill: fitnessProfile.cookingSkill || "BEGINNER",
        },
      });

      // Kontrola povinných údajů před spuštěním Inngest funkce
      const missingFields = [];
      if (!updatedProfile.age || updatedProfile.age <= 0) missingFields.push('věk');
      if (!updatedProfile.gender || updatedProfile.gender.trim() === '') missingFields.push('pohlaví');
      if (!updatedProfile.height || updatedProfile.height <= 0) missingFields.push('výška');
      if (!updatedProfile.weight || updatedProfile.weight <= 0) missingFields.push('váha');

      if (missingFields.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Nelze vygenerovat jídelní plán - chybí povinné údaje: ${missingFields.join(', ')}. Prosím, vyplňte fitness assessment znovu s kompletními údaji.`,
        });
      }

      // Trigger the Inngest function to generate the meal plan
      const result = await inngest.send({
        name: "generate-meal-plan-only/run",
        data: {
          userId: ctx.auth.userId,
          fitnessProfileId: updatedProfile.id,
        },
      });

      return {
        success: true,
        message: "Meal planning enabled and meal plan generation started",
        eventId: result.ids[0],
      };
    }),

  regenerateMeal: protectedProcedure
    .input(z.object({
      mealId: z.string(),
    }))
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

      // Get the existing fitness profile
      const fitnessProfile = await prisma.fitnessProfile.findUnique({
        where: { userId: ctx.auth.userId },
        include: {
          currentMealPlan: {
            include: {
              meals: true,
            },
          },
        },
      });

      if (!fitnessProfile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Fitness profile not found. Please complete your fitness assessment first.",
        });
      }

      if (!fitnessProfile.mealPlanningEnabled) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Meal planning is not enabled in your fitness profile.",
        });
      }

      if (!fitnessProfile.currentMealPlan) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No active meal plan found.",
        });
      }

      // Find the meal to regenerate
      const mealToRegenerate = fitnessProfile.currentMealPlan.meals.find(
        meal => meal.id === input.mealId
      );

      if (!mealToRegenerate) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Meal not found in current meal plan.",
        });
      }

      // Trigger the Inngest function to regenerate the specific meal
      const result = await inngest.send({
        name: "regenerate-meal/run",
        data: {
          userId: ctx.auth.userId,
          fitnessProfileId: fitnessProfile.id,
          mealPlanId: fitnessProfile.currentMealPlan.id,
          mealId: input.mealId,
          mealType: mealToRegenerate.mealType,
          dayOfWeek: mealToRegenerate.dayOfWeek,
          weekNumber: mealToRegenerate.weekNumber,
        },
      });

      return {
        success: true,
        message: "Meal regeneration started",
        eventId: result.ids[0],
        mealId: input.mealId, // Return mealId for tracking
      };
    }),

  getAIRecommendations: baseProcedure
    .input(z.object({
      age: z.string(),
      gender: z.string(),
      height: z.string(),
      weight: z.string(),
      targetWeight: z.string().optional(),
      fitnessGoal: z.enum(["WEIGHT_LOSS", "MUSCLE_GAIN", "ENDURANCE", "STRENGTH", "FLEXIBILITY", "GENERAL_FITNESS"]),
      activityLevel: z.enum(["SEDENTARY", "LIGHTLY_ACTIVE", "MODERATELY_ACTIVE", "VERY_ACTIVE", "EXTREMELY_ACTIVE"]),
      experienceLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
      targetMuscleGroups: z.array(z.string()),
      hasInjuries: z.boolean(),
      injuries: z.string().optional(),
      medicalConditions: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      // AI recommendation logic based on user data
      const recommendations = {
        availableDays: [] as string[],
        workoutDuration: "",
        equipment: [] as string[],
        preferredExercises: "",
        reasoning: {
          days: "",
          duration: "",
          equipment: "",
          exercises: ""
        }
      };

      // Calculate comprehensive fitness metrics
      const weight = parseFloat(input.weight);
      const height = parseFloat(input.height);
      const targetWeight = input.targetWeight ? parseFloat(input.targetWeight) : null;
      const age = parseInt(input.age);
      const bmi = height > 0 ? weight / Math.pow(height / 100, 2) : 0;
      const weightToLose = targetWeight ? weight - targetWeight : 0;
      const weightToGain = targetWeight ? targetWeight - weight : 0;

      // Advanced fitness analysis
      const isSignificantWeightLoss = weightToLose > 20;
      const isModerateWeightLoss = weightToLose > 10 && weightToLose <= 20;
      const isSignificantWeightGain = weightToGain > 15;
      const isHighBMI = bmi > 30;
      const isLowBMI = bmi < 18.5;
      const isOverweight = bmi >= 25 && bmi < 30;
      const isSenior = age > 50;
      const isYoung = age < 25;
      const isInjured = input.hasInjuries;

      // Calculate optimal training frequency and duration based on multiple factors
      let recommendedDays = 3;
      let recommendedDuration = 45;
      let reasoningDays = "";
      let reasoningDuration = "";

      // WEIGHT LOSS - Complex analysis
      if (input.fitnessGoal === "WEIGHT_LOSS") {
        if (isSignificantWeightLoss || isHighBMI) {
          recommendedDays = 6;
          recommendedDuration = 75;
          reasoningDays = "Pro významné hubnutí (70kg+) doporučujeme intenzivní 6-denní program s maximálním spalováním kalorií.";
          reasoningDuration = "75 minut umožňuje kombinaci kardia (30min), silového tréninku (30min) a protažení (15min) pro optimální hubnutí.";
        } else if (isModerateWeightLoss || isOverweight) {
          recommendedDays = 5;
          recommendedDuration = 60;
          reasoningDays = "Pro střední hubnutí (10-20kg) doporučujeme 5 dní týdně s vyváženým tréninkem.";
          reasoningDuration = "60 minut je ideální pro efektivní kombinaci kardia a silového tréninku.";
        } else {
          recommendedDays = 4;
          recommendedDuration = 45;
          reasoningDays = "Pro mírné hubnutí doporučujeme 4 dny týdně s postupným navyšováním intenzity.";
          reasoningDuration = "45 minut je dostačující pro začátek hubnutí s možností postupného prodlužování.";
        }
      }

      // MUSCLE GAIN - Advanced hypertrophy analysis
      else if (input.fitnessGoal === "MUSCLE_GAIN") {
        if (input.experienceLevel === "ADVANCED" && !isSenior) {
          recommendedDays = 6;
          recommendedDuration = 90;
          reasoningDays = "Pro pokročilé budování svalů doporučujeme 6-denní split trénink s optimálním rozložením svalových skupin.";
          reasoningDuration = "90 minut umožňuje komplexní trénink s dostatečným časem na rozcvičení, hlavní cviky a izolované cviky.";
        } else if (input.experienceLevel === "INTERMEDIATE" || isSenior) {
          recommendedDays = 4;
          recommendedDuration = 75;
          reasoningDays = "Pro středně pokročilé osoby doporučujeme 4-denní full-body trénink s optimální frekvencí pro svalový růst.";
          reasoningDuration = "75 minut je ideální pro efektivní stimulaci svalů s dostatečným časem na regeneraci.";
        } else {
          recommendedDays = 3;
          recommendedDuration = 60;
          reasoningDays = "Pro začátečníky doporučujeme 3-denní full-body trénink s postupným navyšováním zátěže.";
          reasoningDuration = "60 minut je dostačující pro základní stimulaci svalů s důrazem na správnou techniku.";
        }
      }

      // ENDURANCE - Cardiovascular optimization
      else if (input.fitnessGoal === "ENDURANCE") {
        if (input.activityLevel === "VERY_ACTIVE" || input.activityLevel === "EXTREMELY_ACTIVE") {
          recommendedDays = 5;
          recommendedDuration = 90;
          reasoningDays = "Pro pokročilou vytrvalost doporučujeme 5 dní týdně s kombinací různých typů kardia.";
          reasoningDuration = "90 minut umožňuje dlouhé aerobní tréninky a intervalový trénink pro maximální vytrvalost.";
        } else if (input.activityLevel === "MODERATELY_ACTIVE") {
          recommendedDays = 4;
          recommendedDuration = 60;
          reasoningDays = "Pro střední vytrvalost doporučujeme 4 dny týdně s postupným navyšováním vzdáleností.";
          reasoningDuration = "60 minut je ideální pro rozvoj kardiovaskulární vytrvalosti.";
        } else {
          recommendedDays = 3;
          recommendedDuration = 45;
          reasoningDays = "Pro začátek vytrvalostního tréninku doporučujeme 3 dny týdně s postupným navyšováním intenzity.";
          reasoningDuration = "45 minut je dostačující pro základní rozvoj vytrvalosti.";
        }
      }

      // STRENGTH - Progressive overload optimization
      else if (input.fitnessGoal === "STRENGTH") {
        if (input.experienceLevel === "ADVANCED") {
          recommendedDays = 4;
          recommendedDuration = 90;
          reasoningDays = "Pro pokročilý silový trénink doporučujeme 4-denní program s optimalizací pro maximální sílu.";
          reasoningDuration = "90 minut umožňuje komplexní silový trénink s dostatečným časem na rozcvičení a delší odpočinky.";
        } else if (input.experienceLevel === "INTERMEDIATE") {
          recommendedDays = 3;
          recommendedDuration = 75;
          reasoningDays = "Pro střední silový trénink doporučujeme 3-denní program s důrazem na compound cviky.";
          reasoningDuration = "75 minut je ideální pro silový trénink s dostatečným časem na regeneraci mezi sériemi.";
        } else {
          recommendedDays = 3;
          recommendedDuration = 60;
          reasoningDays = "Pro začátečníky doporučujeme 3-denní program s důrazem na správnou techniku a postupný nárůst zátěže.";
          reasoningDuration = "60 minut je dostačující pro základní silový trénink s důrazem na kvalitu.";
        }
      }

      // FLEXIBILITY - Mobility and recovery focus
      else if (input.fitnessGoal === "FLEXIBILITY") {
        if (isSenior || isInjured) {
          recommendedDays = 5;
          recommendedDuration = 45;
          reasoningDays = "Pro seniory a osoby se zraněními doporučujeme 5 dní týdně s důrazem na bezpečnost a regeneraci.";
          reasoningDuration = "45 minut je ideální pro bezpečné protažení a mobilitu bez přetížení.";
        } else {
          recommendedDays = 4;
          recommendedDuration = 60;
          reasoningDays = "Pro rozvoj flexibility doporučujeme 4 dny týdně s kombinací jógy, pilates a strečinku.";
          reasoningDuration = "60 minut umožňuje komplexní trénink flexibility s dostatečným časem na každou pozici.";
        }
      }

      // GENERAL_FITNESS - Balanced approach
      else {
        if (input.activityLevel === "SEDENTARY" || input.experienceLevel === "BEGINNER") {
          recommendedDays = 3;
          recommendedDuration = 45;
          reasoningDays = "Pro začátečníky doporučujeme 3 dny týdně s vyváženým tréninkem všech složek fitness.";
          reasoningDuration = "45 minut je ideální pro začátek s postupným navyšováním intenzity.";
        } else if (input.activityLevel === "LIGHTLY_ACTIVE" || input.experienceLevel === "INTERMEDIATE") {
          recommendedDays = 4;
          recommendedDuration = 60;
          reasoningDays = "Pro středně pokročilé osoby doporučujeme 4 dny týdně s komplexním tréninkem.";
          reasoningDuration = "60 minut umožňuje vyvážený trénink všech složek fitness.";
        } else {
          recommendedDays = 5;
          recommendedDuration = 75;
          reasoningDays = "Pro pokročilé osoby doporučujeme 5 dní týdně s intenzivním tréninkem všech složek.";
          reasoningDuration = "75 minut umožňuje komplexní trénink s dostatečným časem na všechny složky fitness.";
        }
      }

      // Adjust for age and injuries
      if (isSenior) {
        recommendedDuration = Math.min(recommendedDuration, 60);
        reasoningDuration += " Pro osoby nad 50 let doporučujeme mírně kratší tréninky s důrazem na kvalitu a bezpečnost.";
      }

      if (isInjured) {
        recommendedDays = Math.min(recommendedDays, 3);
        recommendedDuration = Math.min(recommendedDuration, 45);
        reasoningDays = "Při zraněních doporučujeme snížit frekvenci na 3 dny týdně s důrazem na rehabilitaci.";
        reasoningDuration += " Při zraněních je důležité nechat tělo regenerovat a zaměřit se na bezpečné cvičení.";
      }

      // Convert days to array format
      const dayMapping = {
        3: ["monday", "wednesday", "friday"],
        4: ["monday", "tuesday", "thursday", "friday"],
        5: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        6: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
      };

      recommendations.availableDays = dayMapping[recommendedDays as keyof typeof dayMapping] || ["monday", "wednesday", "friday"];
      recommendations.workoutDuration = recommendedDuration.toString();
      recommendations.reasoning.days = reasoningDays;
      recommendations.reasoning.duration = reasoningDuration;

      // Recommend exercises based on fitness goal and target muscle groups
      let exerciseRecommendations = "";
      let exerciseReasoning = "";

      if (input.fitnessGoal === "WEIGHT_LOSS") {
        exerciseRecommendations = "Kardio cvičení, HIIT, chůze, běhání, skákání přes švihadlo, plavání, cyklistika";
        exerciseReasoning = "Kardio cvičení a HIIT jsou nejefektivnější pro spalování kalorií a hubnutí.";
      } else if (input.fitnessGoal === "MUSCLE_GAIN") {
        exerciseRecommendations = "Silový trénink, compound cviky, progresivní přetížení, bench press, squat, deadlift";
        exerciseReasoning = "Compound cviky jsou nejefektivnější pro stimulaci svalového růstu.";
      } else if (input.fitnessGoal === "ENDURANCE") {
        exerciseRecommendations = "Běhání, cyklistika, plavání, intervalový trénink, dlouhé vzdálenosti";
        exerciseReasoning = "Aerobní aktivity a intervalový trénink rozvíjejí kardiovaskulární vytrvalost.";
      } else if (input.fitnessGoal === "STRENGTH") {
        exerciseRecommendations = "Deadlift, squat, bench press, overhead press, powerlifting cviky";
        exerciseReasoning = "Compound cviky s těžkými váhami jsou nejefektivnější pro rozvoj síly.";
      } else if (input.fitnessGoal === "FLEXIBILITY") {
        exerciseRecommendations = "Jóga, pilates, strečink, mobilita cvičení, balanční cviky";
        exerciseReasoning = "Jóga a pilates rozvíjejí flexibilitu, sílu a rovnováhu.";
      } else {
        exerciseRecommendations = "Smíšený trénink, funkční cvičení, kardio + silový trénink, circuit training";
        exerciseReasoning = "Smíšený trénink rozvíjející všechny složky fitness je ideální pro celkovou kondici.";
      }

      // Add target muscle group specific recommendations
      if (input.targetMuscleGroups && input.targetMuscleGroups.length > 0) {
        const muscleGroupExercises = {
          chest: "kliky, bench press, push-ups, chest press, dips",
          back: "shyby, pull-ups, rows, lat pulldown, deadlift",
          shoulders: "overhead press, lateral raises, front raises, military press",
          arms: "biceps curls, triceps dips, hammer curls, skull crushers",
          legs: "squats, lunges, leg press, deadlifts, calf raises",
          glutes: "hip thrusts, glute bridges, squats, lunges, deadlifts",
          core: "plank, crunches, Russian twists, leg raises, mountain climbers",
          full_body: "compound cviky, functional training, circuit training"
        };

        const targetExercises = input.targetMuscleGroups
          .map(group => muscleGroupExercises[group as keyof typeof muscleGroupExercises])
          .filter(Boolean)
          .join(", ");

        if (targetExercises) {
          exerciseRecommendations = `${exerciseRecommendations}, ${targetExercises}`;
          exerciseReasoning += ` Zaměření na cílové partie: ${input.targetMuscleGroups.join(', ')}.`;
        }
      }

      recommendations.preferredExercises = exerciseRecommendations;
      recommendations.reasoning.exercises = exerciseReasoning;

      // Adjust for injuries
      if (input.hasInjuries) {
        recommendations.preferredExercises = "Nízká intenzita cvičení, rehabilitace, strečink, vodní cvičení";
        recommendations.reasoning.exercises = "Nízká intenzita a rehabilitace jsou klíčové pro bezpečné cvičení při zraněních.";
      }

      // Age-specific adjustments (age is already defined above)
      if (age > 50) {
        recommendations.workoutDuration = Math.min(parseInt(recommendations.workoutDuration), 60).toString();
        recommendations.reasoning.duration += " Pro osoby nad 50 let doporučujeme mírně kratší tréninky s důrazem na kvalitu a bezpečnost.";
      }

      return {
        success: true,
        recommendations,
        message: "AI doporučení byla úspěšně vygenerována na základě vašich údajů."
      };
    }),

  createPaymentIntent: protectedProcedure
    .input(z.object({
      planName: z.string(),
      planPrice: z.number(),
      planCurrency: z.string(),
      assessmentData: z.any().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if Stripe is configured
        if (!process.env.STRIPE_SECRET_KEY) {
          console.error('STRIPE_SECRET_KEY is not configured');
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables.",
          });
        }

        // Convert price to cents for Stripe
        const amountInCents = Math.round(input.planPrice * 100);

        console.log('Creating payment intent with:', {
          planName: input.planName,
          planPrice: input.planPrice,
          planCurrency: input.planCurrency,
          amountInCents,
          userId: ctx.auth.userId
        });

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amountInCents,
          currency: input.planCurrency.toLowerCase(),
          metadata: {
            userId: ctx.auth.userId,
            planName: input.planName,
            type: 'fitness_plan'
          },
          automatic_payment_methods: {
            enabled: true,
          },
        });

        // Save payment session to database with assessment data
        try {
          await prisma.paymentSession.create({
            data: {
              stripeSessionId: paymentIntent.id, // Using payment intent ID as session ID
              userId: ctx.auth.userId,
              planName: input.planName,
              assessmentData: input.assessmentData || {},
              status: 'pending'
            }
          });
          console.log('Payment session saved to database');
        } catch (dbError) {
          console.error('Failed to save payment session to database:', dbError);
          // Continue with payment even if database save fails
        }

        console.log('Payment intent created successfully:', paymentIntent.id);

        return {
          success: true,
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id
        };

      } catch (error) {
        console.error('Error creating payment intent:', error);

        // Provide more specific error messages
        if (error instanceof Error) {
          if (error.message.includes('Invalid API key')) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Invalid Stripe API key. Please check your STRIPE_SECRET_KEY.",
            });
          }
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to create payment intent: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }),

  removeCurrentPlan: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        // Get the fitness profile
        const fitnessProfile = await prisma.fitnessProfile.findUnique({
          where: { userId: ctx.auth.userId },
          include: {
            currentPlan: true,
            currentMealPlan: true,
          },
        });

        if (!fitnessProfile) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Fitness profile not found",
          });
        }

        // Simply set isActive to false for the current plan
        if (fitnessProfile.currentPlan) {
          await prisma.workoutPlan.update({
            where: { id: fitnessProfile.currentPlan.id },
            data: {
              isActive: false,
            },
          });
          console.log(`Set plan ${fitnessProfile.currentPlan.id} to inactive`);
        }

        // Also set current meal plan to inactive
        if (fitnessProfile.currentMealPlan) {
          await prisma.mealPlan.update({
            where: { id: fitnessProfile.currentMealPlan.id },
            data: {
              isActive: false,
            },
          });
          console.log(`Set meal plan ${fitnessProfile.currentMealPlan.id} to inactive`);
        }

        return {
          success: true,
          message: "Current plan set to inactive",
        };
      } catch (error) {
        console.error('Error setting current plan to inactive:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to set current plan to inactive: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }),

  getPaymentSessions: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const paymentSessions = await prisma.paymentSession.findMany({
          where: {
            userId: ctx.auth.userId,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        return paymentSessions;
      } catch (error) {
        console.error('Error fetching payment sessions:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch payment sessions: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }),

  hasPaidPlan: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const paidSession = await prisma.paymentSession.findFirst({
          where: {
            userId: ctx.auth.userId,
            status: 'completed',
          },
        });

        return {
          hasPaidPlan: !!paidSession,
        };
      } catch (error) {
        console.error('Error checking paid plan status:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to check paid plan status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }),

  getPublicDemoPlans: baseProcedure
    .query(async () => {
      try {
        const demoPlans = await prisma.workoutPlan.findMany({
          where: {
            isPublic: true,
          },
          include: {
            fitnessProfile: {
              select: {
                gender: true,
                fitnessGoal: true,
                age: true,
                weight: true,
                height: true,
                targetWeight: true,
                experienceLevel: true,
                activityLevel: true,
                availableDays: true,
                workoutDuration: true,
                equipment: true,
                mealPlanningEnabled: true,
              },
            },
            workouts: {
              include: {
                workoutExercises: {
                  include: {
                    exercise: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        return demoPlans;
      } catch (error) {
        console.error('Error fetching public demo plans:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch public demo plans: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }),

  getPublicDemoPlan: baseProcedure
    .input(z.object({
      planId: z.string(),
    }))
    .query(async ({ input }) => {
      try {
        const demoPlan = await prisma.workoutPlan.findFirst({
          where: {
            id: input.planId,
            isPublic: true,
          },
          include: {
            fitnessProfile: {
              select: {
                gender: true,
                fitnessGoal: true,
                age: true,
                weight: true,
                height: true,
                targetWeight: true,
                experienceLevel: true,
                activityLevel: true,
                availableDays: true,
                workoutDuration: true,
                equipment: true,
                mealPlanningEnabled: true,
                dietaryRestrictions: true,
                allergies: true,
                budgetPerWeek: true,
                mealPrepTime: true,
                preferredCuisines: true,
                cookingSkill: true,
              },
            },
            workouts: {
              include: {
                workoutExercises: {
                  include: {
                    exercise: true,
                  },
                },
              },
              orderBy: [
                { weekNumber: 'asc' },
                { dayOfWeek: 'asc' },
              ],
            },
          },
        });

        if (!demoPlan) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Demo plan not found",
          });
        }

        // Get meal plan for demo - always try to get it regardless of mealPlanningEnabled
        let mealPlan = null;
        mealPlan = await prisma.mealPlan.findFirst({
          where: {
            fitnessProfileId: demoPlan.fitnessProfileId,
            isPublic: true,
            isActive: true, // Prefer active meal plans
          },
          include: {
            meals: {
              include: {
                recipes: true,
              },
              orderBy: [
                { weekNumber: 'asc' },
                { dayOfWeek: 'asc' },
              ],
            },
          },
        });

        // If no active meal plan found, get any public meal plan with meals
        if (!mealPlan || !mealPlan.meals || mealPlan.meals.length === 0) {
          mealPlan = await prisma.mealPlan.findFirst({
            where: {
              fitnessProfileId: demoPlan.fitnessProfileId,
              isPublic: true,
            },
            include: {
              meals: {
                include: {
                  recipes: true,
                },
                orderBy: [
                  { weekNumber: 'asc' },
                  { dayOfWeek: 'asc' },
                ],
              },
            },
            orderBy: {
              createdAt: 'desc', // Get the most recent one
            },
          });
        }

        return {
          workoutPlan: demoPlan,
          mealPlan,
        };
      } catch (error) {
        console.error('Error fetching public demo plan:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch public demo plan: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }),

  generateInvoice: protectedProcedure
    .input(z.object({
      invoiceNumber: z.string(),
      invoiceDate: z.string(),
      dueDate: z.string(),
      supplier: z.object({
        name: z.string(),
        address: z.string(),
        city: z.string(),
        zipCode: z.string(),
        ico: z.string(),
        dic: z.string().optional(), // DIC je volitelné pro neplátce DPH
        bankAccount: z.string(),
        bankCode: z.string(),
      }),
      customer: z.object({
        name: z.string(),
        address: z.string(),
        city: z.string(),
        zipCode: z.string(),
        ico: z.string().optional(),
        dic: z.string().optional(),
      }),
      items: z.array(z.object({
        id: z.string(),
        description: z.string(),
        quantity: z.number(),
        unit: z.string(),
        unitPrice: z.number(),
        total: z.number(),
      })),
      currency: z.string(),
      vatRate: z.number(),
      paid: z.boolean().optional(), // Přidáno pole paid
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        console.log('Generating invoice for user:', ctx.auth.userId);
        console.log('Invoice data:', input);

        // For now, return success without PDF generation
        // PDF generation will be implemented later
        console.log('Invoice data prepared for PDF generation:', input);

        return {
          success: true,
          invoiceNumber: input.invoiceNumber,
          message: 'Faktura byla úspěšně vygenerována',
          data: input,
          downloadUrl: `/api/generate-invoice-pdf`,
        };
      } catch (error) {
        console.error('Error generating invoice:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to generate invoice: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    })

});