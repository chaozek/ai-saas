import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { inngest } from '@/inngest/client';
import prisma from '@/lib/prisma';
import { generateAndSaveInvoice, createInvoiceData } from '@/lib/invoice-utils';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig!, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      console.log('Payment intent succeeded:', {
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        metadata: paymentIntent.metadata
      });

      try {
        // Extract metadata
        const { userId, planName, type } = paymentIntent.metadata || {};

        if (type === 'fitness_plan' && userId) {
          try {
            // Get assessment data from database
            const paymentSession = await prisma.paymentSession.findUnique({
              where: { stripeSessionId: paymentIntent.id }
            });

            let assessmentData = {};
            if (paymentSession && paymentSession.assessmentData) {
              assessmentData = paymentSession.assessmentData;
              console.log('Found assessment data in database for payment intent:', paymentIntent.id);
            } else {
              console.log('No assessment data found in database for payment intent:', paymentIntent.id);
            }

            // Update payment session status
            await prisma.paymentSession.updateMany({
              where: { stripeSessionId: paymentIntent.id },
              data: {
                status: 'completed',
                paymentIntentId: paymentIntent.id
              }
            });

                        // Generate and save invoice automatically
            try {
              // Získat údaje o zákazníkovi z Clerk
              const { clerkClient } = await import('@clerk/nextjs/server');
              let customerName = "Zákazník";
              let customerAddress = "";
              let customerCity = "";
              let customerZipCode = "";

              try {
                const clerk = await clerkClient();
                const user = await clerk.users.getUser(userId);
                customerName = user.fullName || user.firstName || user.emailAddresses[0]?.emailAddress || "Zákazník";

                // Zkusit získat adresu z metadata uživatele
                if (user.publicMetadata?.address) {
                  customerAddress = user.publicMetadata.address as string;
                }
                if (user.publicMetadata?.city) {
                  customerCity = user.publicMetadata.city as string;
                }
                if (user.publicMetadata?.zipCode) {
                  customerZipCode = user.publicMetadata.zipCode as string;
                }
              } catch (clerkError) {
                console.log('Could not fetch user data from Clerk:', clerkError);
              }

              // Zkusit získat údaje z Stripe PaymentIntent
              try {
                const paymentIntentWithCustomer = await stripe.paymentIntents.retrieve(paymentIntent.id, {
                  expand: ['customer']
                });

                if (paymentIntentWithCustomer.customer && typeof paymentIntentWithCustomer.customer === 'object') {
                  const customer = paymentIntentWithCustomer.customer as Stripe.Customer;

                  // Použít údaje ze Stripe, pokud nejsou z Clerk
                  if (!customerName || customerName === "Zákazník") {
                    customerName = customer.name || customer.email || customerName;
                  }

                  // Zkusit získat adresu ze Stripe
                  if (customer.address && !customerAddress) {
                    customerAddress = customer.address.line1 || "";
                    customerCity = customer.address.city || "";
                    customerZipCode = customer.address.postal_code || "";
                  }
                }
              } catch (stripeError) {
                console.log('Could not fetch customer data from Stripe:', stripeError);
              }

              // Zkusit získat údaje z assessment data
              if (paymentSession?.assessmentData) {
                const assessmentData = paymentSession.assessmentData as any;
                if (assessmentData.customerName && !customerName) {
                  customerName = assessmentData.customerName;
                }
                if (assessmentData.customerAddress && !customerAddress) {
                  customerAddress = assessmentData.customerAddress;
                }
                if (assessmentData.customerCity && !customerCity) {
                  customerCity = assessmentData.customerCity;
                }
                if (assessmentData.customerZipCode && !customerZipCode) {
                  customerZipCode = assessmentData.customerZipCode;
                }
              }

              const invoiceData = createInvoiceData(
                customerName,
                customerAddress,
                customerCity,
                customerZipCode,
                planName || "Fitness plán",
                paymentIntent.amount / 100, // Stripe ukládá částky v centech
                paymentIntent.id,
                true // Zaplaceno
              );

              await generateAndSaveInvoice(
                invoiceData,
                userId,
                paymentSession?.id
              );

              console.log('Invoice generated and saved for payment intent:', paymentIntent.id);
            } catch (invoiceError) {
              console.error('Error generating invoice:', invoiceError);
              // Nevyhazujeme chybu, protože nechceme přerušit generování plánu
            }

            // Trigger fitness plan generation
            try {
              await inngest.send({
                name: "generate-fitness-plan/run",
                data: {
                  assessmentData: assessmentData,
                  userId: userId,
                  workoutPlanId: null, // Will be created by the function
                  paymentCompleted: true,
                  paymentId: paymentIntent.id,
                  planName: planName,
                },
              });

              console.log('Fitness plan generation triggered for payment intent:', paymentIntent.id);
            } catch (inngestError) {
              console.error('Inngest API Error:', inngestError);
              console.log('Inngest not configured properly - plan will be generated via client-side fallback');
              // Don't throw error, just log it and continue
            }
          } catch (dbError) {
            console.error('Database error in webhook:', dbError);
            // Fallback: trigger plan generation without database
            try {
              await inngest.send({
                name: "generate-fitness-plan/run",
                data: {
                  assessmentData: {},
                  userId: userId,
                  workoutPlanId: null,
                  paymentCompleted: true,
                  paymentId: paymentIntent.id,
                  planName: planName,
                },
              });
              console.log('Fitness plan generation triggered (fallback mode)');
            } catch (inngestError) {
              console.error('Inngest fallback API Error:', inngestError);
              console.log('Inngest not configured properly - plan will be generated via client-side fallback');
              // Don't throw error, just log it and continue
            }
          }
        } else {
          console.log('Invalid payment intent metadata:', paymentIntent.metadata);
        }

      } catch (error) {
        console.error('Error processing payment intent webhook:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('Payment intent failed:', {
        paymentIntentId: failedPaymentIntent.id,
        lastPaymentError: failedPaymentIntent.last_payment_error
      });
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}