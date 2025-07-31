import { Resend } from 'resend';
import { EmailTemplates, WelcomeEmailData, PaymentEmailData, WorkoutReminderData, ProgressUpdateData } from './email-templates';

let resend: Resend | null = null;

const getResendClient = () => {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }
    resend = new Resend(apiKey);
  }
  return resend;
};

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  static async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      if (!process.env.RESEND_API_KEY) {
        console.error('Resend configuration missing');
        return false;
      }

      const messageData = {
        from: FROM_EMAIL,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text || emailData.html.replace(/<[^>]*>/g, ''),
      };

      const response = await getResendClient().emails.send(messageData);
      console.log('Email sent successfully:', response);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  static async sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
    const data: WelcomeEmailData = {
      userName,
      userEmail,
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
    };

    const emailData = EmailTemplates.getWelcomeEmail(data);
    return this.sendEmail(emailData);
  }

    static async sendPaymentConfirmationEmail(
    userEmail: string,
    userName: string,
    planName: string,
    amount: number,
    currency: string
  ): Promise<boolean> {
    const data: PaymentEmailData = {
      userName,
      userEmail,
      planName,
      amount,
      currency,
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      planFeatures: [
        'Personalizovaný fitness plán na míru',
        'AI-generované cvičení a jídelníčky',
        'Sledování pokroku a statistik',
        'Nekonečné úpravy a regenerace plánů',
        'Přístup k rozsáhlé databázi cvičení',
        'Podpora a konzultace'
      ]
    };

    const emailData = EmailTemplates.getPaymentConfirmationEmail(data);
    return this.sendEmail(emailData);
  }

  static async sendWorkoutReminderEmail(
    userEmail: string,
    userName: string,
    workoutName: string,
    workoutDuration: string,
    targetMuscles: string[]
  ): Promise<boolean> {
    const data: WorkoutReminderData = {
      userName,
      userEmail,
      workoutName,
      workoutDuration,
      targetMuscles,
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
    };

    const emailData = EmailTemplates.getWorkoutReminderEmail(data);
    return this.sendEmail(emailData);
  }

  static async sendProgressUpdateEmail(
    userEmail: string,
    userName: string,
    currentWeight: number,
    targetWeight: number,
    progressPercentage: number,
    daysActive: number,
    workoutsCompleted: number
  ): Promise<boolean> {
    const data: ProgressUpdateData = {
      userName,
      userEmail,
      currentWeight,
      targetWeight,
      progressPercentage,
      daysActive,
      workoutsCompleted,
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
    };

    const emailData = EmailTemplates.getProgressUpdateEmail(data);
    return this.sendEmail(emailData);
  }
}