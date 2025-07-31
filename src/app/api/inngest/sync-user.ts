import { inngest } from "@/inngest/client"
import prisma from "@/lib/prisma"
import { EmailService } from "@/lib/email-service"

export const syncUser = inngest.createFunction(
     { id: 'sync-user-from-clerk' }, // ←The 'id' is an arbitrary string used to identify the function in the dashboard
     { event: 'clerk/user.created' }, // ← This is the function's triggering event
     async ({ event }) => {
       const user = event.data // The event payload's data will be the Clerk User json object
       const { id } = user

       // Create user in database
       await prisma.user.create({
        data: {
            id,
        }
       })

       // Send welcome email
       try {
         const userEmail = user.email_addresses?.[0]?.email_address;
         const userName = user.full_name || user.first_name || user.email_addresses?.[0]?.email_address || "Uživateli";

         if (userEmail) {
           const success = await EmailService.sendWelcomeEmail(userEmail, userName);
           if (success) {
             console.log('Welcome email sent successfully to:', userEmail);
           } else {
             console.error('Failed to send welcome email to:', userEmail);
           }
         } else {
           console.log('No email address found for new user:', id);
         }
       } catch (emailError) {
         console.error('Error sending welcome email:', emailError);
         // Don't throw error, just log it and continue
       }
     },
   )