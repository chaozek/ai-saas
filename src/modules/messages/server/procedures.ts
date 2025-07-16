import { inngest } from "@/inngest/client";
import prisma from "@/lib/prisma";
import { consumeCredits } from "@/lib/usage";
import { protectedProcedure, createTRPCRouter } from "@/trcp/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const messagesRouter = createTRPCRouter({

     getmany: protectedProcedure.input(z.object({
          projectId: z.string().min(1, {message: "Project is required"})
     })).query(async({input, ctx})=>{
          const messages = await prisma.message.findMany({
               where: {
                    projectId: input.projectId,
               },
               orderBy: {
                    createdAt: "asc",
               },
               include: {
                    fragment: true,
               },
          });
          console.log(messages, "MSGS")
          return messages;
     }),
 create: protectedProcedure.input(z.object({
  value: z.string().min(1, {message: "Message is required"}).max(10000, {message: "Message is too long"}), projectId: z.string().min(1, {message: "Project is required"})
 })).mutation(async ({ ctx, input }) => {
     const project = await prisma.project.findFirst({
          where: {
               id: input.projectId,
               userId: ctx.auth.userId,
          },
     });
     console.log(project, "PROJECaaaaT")
     if(!project) {
          throw new TRPCError({
               code: "NOT_FOUND",
               message: "Project not found",
          });
     }
          try{
               await consumeCredits()
               console.log("CONSUMED")
          }catch(error){
               if(error instanceof Error){
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
   const newMessage = await prisma.message.create({
  data: {
    content: input.value,
    role: "USER",
    type: "RESULT",
    projectId: input.projectId,

  },
});
console.log(newMessage, "NEW MESSAGE")
await inngest.send({
  name: "build-agent/run",
  data: {
    value: input.value,
    projectId: input.projectId,
  },
});
return newMessage;
 }),
});