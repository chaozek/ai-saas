import { inngest } from "@/inngest/client";
import prisma from "@/lib/prisma";
import { protectedProcedure,  createTRPCRouter } from "@/trcp/init";
import { z } from "zod";
import { generateSlug } from "random-word-slugs";
import { TRPCError } from "@trpc/server";
import { consumeCredits } from "@/lib/usage";

export const projectsRouter = createTRPCRouter({
  getOne: protectedProcedure.input(z.object({
    id: z.string().min(1, {message: "Id is required"})
})).query(async({input, ctx})=>{
    const project = await prisma.project.findFirst({
         where: {
              id: input.id,
              userId: ctx.auth.userId,
         },
    });
    console.log(project, "PRJS")
    if(!project) {
         throw new TRPCError({
              code: "NOT_FOUND",
              message: "Project not found",
         });
    }
    return project;
}),
     getmany: protectedProcedure.query(async({ctx})=>{
          const projects = await prisma.project.findMany({
               where: {
                    userId: ctx.auth.userId,
               },
               orderBy: {
                    createdAt: "desc",
               },

          });
          return projects;
     }),
 create: protectedProcedure.input(z.object({
  value: z.string().min(1, {message: "Message is required"}).max(10000, {message: "Message is too long"})
 })).mutation(async ({ ctx, input }) => {
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
     const createdProject = await prisma.project.create({
      data: {
        userId: ctx.auth.userId,
        name: generateSlug(2, {
          format: "kebab"
        } ),
        messages: {
          create:{
               content: input.value,
               role: "USER",
               type: "RESULT",

          }
        }
      },
     });
await inngest.send({
  name: "build-agent/run",
  data: {
    value: input.value,
    projectId: createdProject.id,
  },
});
return createdProject;
 }),
});