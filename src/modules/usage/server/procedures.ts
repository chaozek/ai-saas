import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/trcp/init"
import { consumeCredits, getCredits } from "@/lib/usage"
import { TRPCError } from "@trpc/server"

export const usageRouter = createTRPCRouter({
     getCredits: protectedProcedure.query(async ({ctx}) => {
          try{
               const credits = await getCredits()
               console.log(credits, "CREDITS")
               return credits
          }catch(error){
               if(error instanceof Error){
                    throw new TRPCError({
                         code: "BAD_REQUEST",
                         message: error.message,
                    });
               }
          }
     }),
     consumeCredits: protectedProcedure.input(z.object({
          amount: z.number()
     })).mutation(async ({}) => {
          const credits = await consumeCredits()
          return credits
     })
})