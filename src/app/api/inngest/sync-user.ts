import { inngest } from "@/inngest/client"
import prisma from "@/lib/prisma"

const syncUser = inngest.createFunction(
     { id: 'sync-user-from-clerk' }, // ←The 'id' is an arbitrary string used to identify the function in the dashboard
     { event: 'clerk/user.created' }, // ← This is the function's triggering event
     async ({ event }) => {
       const user = event.data // The event payload's data will be the Clerk User json object
       const { id } = user
       await prisma.user.create({
        data: {
            id,
        }
       })
     },
   )