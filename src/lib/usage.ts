import prisma from "./prisma"
import { RateLimiterPrisma } from "rate-limiter-flexible"
import { auth } from "@clerk/nextjs/server"


export async function getUsageTracker(){
     const {has} = await auth()
     const hasProAccess = has({plan: "pro"})
     const usageTracker = new RateLimiterPrisma({
         storeClient: prisma,
         tableName: "Usage",
         points: hasProAccess ? 100 : 50,
         duration: 30 * 24 * 60 *60
     })

     return usageTracker
}


export async function consumeCredits(){
     const {userId} = await auth()
     if(!userId) throw new Error("Unauthorized")
     const usageTracker = await getUsageTracker()
     console.log(usageTracker, "USAGE TRACKER")
     const key = userId
     const result = await usageTracker.consume(key, 1)
     console.log(result, "RESULTttt")
     return result
}

export async function getCredits(){
     const {userId} = await auth()
     if(!userId) throw new Error("Unauthorized")
     const usageTracker = await getUsageTracker()
     const key = userId
     const result = await usageTracker.get(key)
     return result
}