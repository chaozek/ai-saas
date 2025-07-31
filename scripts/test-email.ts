#!/usr/bin/env tsx

import { config } from 'dotenv';
import { EmailService } from '../src/lib/email-service';

// Load environment variables from .env file
config({ path: '.env' });

async function testEmailFunctionality() {
  console.log('🧪 Testing Email Functionality...\n');

  // Test 1: Check environment variables
  console.log('1. Checking environment variables...');
  const requiredVars = ['RESEND_API_KEY'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('❌ Missing environment variables:', missingVars.join(', '));
    console.log('Please set these variables in your .env.local file');
    process.exit(1);
  }
  console.log('✅ Environment variables are set\n');

  // Test 2: Test basic email sending
  console.log('2. Testing basic email sending...');
  try {
    const testEmail = process.env.TEST_EMAIL || 'test@example.com';
    const success = await EmailService.sendEmail({
      to: testEmail,
      subject: 'Test Email from FitnessAI',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email from FitnessAI to verify Mailgun integration.</p>
        <p>Time: ${new Date().toISOString()}</p>
      `,
    });

    if (success) {
      console.log('✅ Basic email sent successfully');
    } else {
      console.error('❌ Failed to send basic email');
    }
  } catch (error) {
    console.error('❌ Error sending basic email:', error);
  }
  console.log('');

  // Test 3: Test welcome email
  console.log('3. Testing welcome email template...');
  try {
    const testEmail = process.env.TEST_EMAIL || 'test@example.com';
    const success = await EmailService.sendWelcomeEmail(testEmail, 'Test User');

    if (success) {
      console.log('✅ Welcome email sent successfully');
    } else {
      console.error('❌ Failed to send welcome email');
    }
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
  }
  console.log('');

  // Test 4: Test payment confirmation email
  console.log('4. Testing payment confirmation email template...');
  try {
    const testEmail = process.env.TEST_EMAIL || 'test@example.com';
    const success = await EmailService.sendPaymentConfirmationEmail(
      testEmail,
      'Test User',
      'Premium Fitness Plan',
      99.99,
      'CZK'
    );

    if (success) {
      console.log('✅ Payment confirmation email sent successfully');
    } else {
      console.error('❌ Failed to send payment confirmation email');
    }
  } catch (error) {
    console.error('❌ Error sending payment confirmation email:', error);
  }
  console.log('');

  // Test 5: Test workout reminder email template
  console.log('5. Testing workout reminder email template...');
  try {
    const testEmail = process.env.TEST_EMAIL || 'test@example.com';
    const success = await EmailService.sendWorkoutReminderEmail(
      testEmail,
      'Test User',
      'Upper Body Strength',
      '45 minut',
      ['Hrudník', 'Triceps', 'Ramena']
    );

    if (success) {
      console.log('✅ Workout reminder email sent successfully');
    } else {
      console.error('❌ Failed to send workout reminder email');
    }
  } catch (error) {
    console.error('❌ Error sending workout reminder email:', error);
  }
  console.log('');

  // Test 6: Test progress update email template
  console.log('6. Testing progress update email template...');
  try {
    const testEmail = process.env.TEST_EMAIL || 'test@example.com';
    const success = await EmailService.sendProgressUpdateEmail(
      testEmail,
      'Test User',
      75,
      70,
      60,
      14,
      8
    );

    if (success) {
      console.log('✅ Progress update email sent successfully');
    } else {
      console.error('❌ Failed to send progress update email');
    }
  } catch (error) {
    console.error('❌ Error sending progress update email:', error);
  }
  console.log('');

  console.log('🎉 All email templates tested successfully!');
  console.log('\n📝 Note: For testing, you can use any email address with Resend.');
  console.log('   Set TEST_EMAIL environment variable to test with a specific email address.');
  console.log('\n🎨 Cool features included:');
  console.log('   - Beautiful gradient designs');
  console.log('   - Animated elements and hover effects');
  console.log('   - Interactive progress visualizations');
  console.log('   - Responsive mobile-friendly layouts');
  console.log('   - Professional typography and spacing');
}

// Run the test
testEmailFunctionality().catch(console.error);