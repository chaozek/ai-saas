import { z } from "zod";
import { createTRPCRouter, protectedProcedure, baseProcedure } from "@/trcp/init";
import { TRPCError } from "@trpc/server";
import { EmailService } from "@/lib/email-service";
import { clerkClient } from "@clerk/nextjs/server";

export const emailRouter = createTRPCRouter({
  sendWelcomeEmail: baseProcedure
    .input(z.object({
      userId: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        // Get user data from Clerk
        const clerk = await clerkClient();
        const user = await clerk.users.getUser(input.userId);
        const userEmail = user.emailAddresses[0]?.emailAddress;
        const userName = user.fullName || user.firstName || user.emailAddresses[0]?.emailAddress || "Uživateli";

        if (!userEmail) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "User email not found",
          });
        }

        const success = await EmailService.sendWelcomeEmail(userEmail, userName);

        if (!success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to send welcome email",
          });
        }

        return {
          success: true,
          message: "Welcome email sent successfully",
        };
      } catch (error) {
        console.error("Error sending welcome email:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send welcome email",
        });
      }
    }),

  sendPaymentConfirmationEmail: baseProcedure
    .input(z.object({
      userId: z.string(),
      planName: z.string(),
      amount: z.number(),
      currency: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        // Get user data from Clerk
        const clerk = await clerkClient();
        const user = await clerk.users.getUser(input.userId);
        const userEmail = user.emailAddresses[0]?.emailAddress;
        const userName = user.fullName || user.firstName || user.emailAddresses[0]?.emailAddress || "Uživateli";

        if (!userEmail) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "User email not found",
          });
        }

        const success = await EmailService.sendPaymentConfirmationEmail(
          userEmail,
          userName,
          input.planName,
          input.amount,
          input.currency
        );

        if (!success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to send payment confirmation email",
          });
        }

        return {
          success: true,
          message: "Payment confirmation email sent successfully",
        };
      } catch (error) {
        console.error("Error sending payment confirmation email:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send payment confirmation email",
        });
      }
    }),

  // Test email endpoint for development
  testEmail: protectedProcedure
    .input(z.object({
      to: z.string().email(),
      subject: z.string(),
      message: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        const success = await EmailService.sendEmail({
          to: input.to,
          subject: input.subject,
          html: `<p>${input.message}</p>`,
        });

        if (!success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to send test email",
          });
        }

        return {
          success: true,
          message: "Test email sent successfully",
        };
      } catch (error) {
        console.error("Error sending test email:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send test email",
        });
      }
    }),

  // Test workout reminder email (without requiring real user ID)
  testWorkoutReminder: baseProcedure
    .input(z.object({
      to: z.string().email(),
      userName: z.string(),
      workoutName: z.string(),
      workoutDuration: z.string(),
      targetMuscles: z.array(z.string()),
    }))
    .mutation(async ({ input }) => {
      try {
        const success = await EmailService.sendWorkoutReminderEmail(
          input.to,
          input.userName,
          input.workoutName,
          input.workoutDuration,
          input.targetMuscles
        );

        if (!success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to send workout reminder email",
          });
        }

        return {
          success: true,
          message: "Workout reminder email sent successfully",
        };
      } catch (error) {
        console.error("Error sending workout reminder email:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send workout reminder email",
        });
      }
    }),

  // Test progress update email (without requiring real user ID)
  testProgressUpdate: baseProcedure
    .input(z.object({
      to: z.string().email(),
      userName: z.string(),
      currentWeight: z.number(),
      targetWeight: z.number(),
      progressPercentage: z.number(),
      daysActive: z.number(),
      workoutsCompleted: z.number(),
    }))
    .mutation(async ({ input }) => {
      try {
        const success = await EmailService.sendProgressUpdateEmail(
          input.to,
          input.userName,
          input.currentWeight,
          input.targetWeight,
          input.progressPercentage,
          input.daysActive,
          input.workoutsCompleted
        );

        if (!success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to send progress update email",
          });
        }

        return {
          success: true,
          message: "Progress update email sent successfully",
        };
      } catch (error) {
        console.error("Error sending progress update email:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send progress update email",
        });
      }
    }),

  // Send workout reminder email
  sendWorkoutReminder: baseProcedure
    .input(z.object({
      userId: z.string(),
      workoutName: z.string(),
      workoutDuration: z.string(),
      targetMuscles: z.array(z.string()),
    }))
    .mutation(async ({ input }) => {
      try {
        const clerk = await clerkClient();
        const user = await clerk.users.getUser(input.userId);
        const userEmail = user.emailAddresses[0]?.emailAddress;
        const userName = user.fullName || user.firstName || user.emailAddresses[0]?.emailAddress || "Uživateli";

        if (!userEmail) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "User email not found",
          });
        }

        const success = await EmailService.sendWorkoutReminderEmail(
          userEmail,
          userName,
          input.workoutName,
          input.workoutDuration,
          input.targetMuscles
        );

        if (!success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to send workout reminder email",
          });
        }

        return {
          success: true,
          message: "Workout reminder email sent successfully",
        };
      } catch (error) {
        console.error("Error sending workout reminder email:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send workout reminder email",
        });
      }
    }),

  // Send progress update email
  sendProgressUpdate: baseProcedure
    .input(z.object({
      userId: z.string(),
      currentWeight: z.number(),
      targetWeight: z.number(),
      progressPercentage: z.number(),
      daysActive: z.number(),
      workoutsCompleted: z.number(),
    }))
    .mutation(async ({ input }) => {
      try {
        const clerk = await clerkClient();
        const user = await clerk.users.getUser(input.userId);
        const userEmail = user.emailAddresses[0]?.emailAddress;
        const userName = user.fullName || user.firstName || user.emailAddresses[0]?.emailAddress || "Uživateli";

        if (!userEmail) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "User email not found",
          });
        }

        const success = await EmailService.sendProgressUpdateEmail(
          userEmail,
          userName,
          input.currentWeight,
          input.targetWeight,
          input.progressPercentage,
          input.daysActive,
          input.workoutsCompleted
        );

        if (!success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to send progress update email",
          });
        }

        return {
          success: true,
          message: "Progress update email sent successfully",
        };
      } catch (error) {
        console.error("Error sending progress update email:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send progress update email",
        });
      }
    }),
});