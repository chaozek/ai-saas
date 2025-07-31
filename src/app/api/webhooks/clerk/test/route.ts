import { NextRequest, NextResponse } from 'next/server';
import { inngest } from '@/inngest/client';

export async function POST(req: NextRequest) {
  console.log('🧪 Test webhook received - no signature verification');

  try {
    const payload = await req.json();
    console.log('Test payload:', payload);

    // Send event to Inngest to trigger the sync-user function
    await inngest.send({
      name: 'clerk/user.created',
      data: payload.data,
    });

    console.log('✅ Test user created event sent to Inngest:', payload.data.id);
    return NextResponse.json({ success: true, message: 'Test webhook processed successfully' });
  } catch (error) {
    console.error('❌ Error processing test webhook:', error);
    return NextResponse.json({ error: 'Failed to process test webhook' }, { status: 500 });
  }
}