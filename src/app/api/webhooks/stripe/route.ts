import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { inngest } from '@/inngest/client';
import prisma from '@/lib/prisma';

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