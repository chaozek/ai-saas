import { NextRequest, NextResponse } from 'next/server';
import { inngest } from '@/inngest/client';
import { headers } from 'next/headers';
import { Webhook } from 'svix';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  console.log('🔔 Webhook received - checking headers...');

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  console.log('Headers received:', { svix_id, svix_timestamp, svix_signature: svix_signature?.substring(0, 20) + '...' });

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('❌ Missing headers:', { svix_id: !!svix_id, svix_timestamp: !!svix_timestamp, svix_signature: !!svix_signature });
    return new Response('Error occured -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(webhookSecret || '');

  let evt: any;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    });
  }

  // Get the ID and type
  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Webhook received! ${eventType}`, { id, eventType });

  // Handle the webhook
  switch (eventType) {
    case 'user.created':
      try {
        // Send event to Inngest to trigger the sync-user function
        await inngest.send({
          name: 'clerk/user.created',
          data: evt.data,
        });

        console.log('User created event sent to Inngest:', evt.data.id);
        return NextResponse.json({ success: true });
      } catch (error) {
        console.error('Error sending event to Inngest:', error);
        return NextResponse.json({ error: 'Failed to process user creation' }, { status: 500 });
      }

    case 'user.updated':
      // Handle user updates if needed
      console.log('User updated:', evt.data.id);
      return NextResponse.json({ success: true });

    case 'user.deleted':
      // Handle user deletions if needed
      console.log('User deleted:', evt.data.id);
      return NextResponse.json({ success: true });

    default:
      console.log(`Unhandled event type: ${eventType}`);
      return NextResponse.json({ success: true });
  }
}