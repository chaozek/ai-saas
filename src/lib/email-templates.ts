import { EmailData } from './email-service';

export interface WelcomeEmailData {
  userName: string;
  userEmail: string;
  dashboardUrl: string;
}

export interface PaymentEmailData {
  userName: string;
  userEmail: string;
  planName: string;
  amount: number;
  currency: string;
  dashboardUrl: string;
  planFeatures: string[];
}

export interface WorkoutReminderData {
  userName: string;
  userEmail: string;
  workoutName: string;
  workoutDuration: string;
  targetMuscles: string[];
  dashboardUrl: string;
}

export interface ProgressUpdateData {
  userName: string;
  userEmail: string;
  currentWeight: number;
  targetWeight: number;
  progressPercentage: number;
  daysActive: number;
  workoutsCompleted: number;
  dashboardUrl: string;
}

export class EmailTemplates {
  static getWelcomeEmail(data: WelcomeEmailData): EmailData {
    return {
      to: data.userEmail,
      subject: '🎉 Vítejte ve FitnessAI - Váš osobní fitness průvodce!',
      html: `
        <!DOCTYPE html>
        <html lang="cs">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Vítejte ve FitnessAI</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #1f2937;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
              position: relative;
              overflow: hidden;
            }
            .header::before {
              content: '';
              position: absolute;
              top: -50%;
              left: -50%;
              width: 200%;
              height: 200%;
              background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
              animation: float 6s ease-in-out infinite;
            }
            @keyframes float {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-20px) rotate(180deg); }
            }
            .header h1 {
              font-size: 2.5rem;
              font-weight: 800;
              margin-bottom: 10px;
              position: relative;
              z-index: 1;
            }
            .header p {
              font-size: 1.1rem;
              opacity: 0.9;
              position: relative;
              z-index: 1;
            }
            .content {
              padding: 40px 30px;
              background: white;
            }
            .welcome-message {
              font-size: 1.3rem;
              color: #374151;
              margin-bottom: 30px;
              text-align: center;
            }
            .features-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
              gap: 20px;
              margin: 30px 0;
            }
            .feature-card {
              background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
              padding: 25px;
              border-radius: 12px;
              border-left: 4px solid #667eea;
              transition: transform 0.3s ease;
            }
            .feature-card:hover {
              transform: translateY(-2px);
            }
            .feature-icon {
              font-size: 2rem;
              margin-bottom: 15px;
              display: block;
            }
            .feature-title {
              font-weight: 700;
              color: #1f2937;
              margin-bottom: 8px;
              font-size: 1.1rem;
            }
            .feature-desc {
              color: #6b7280;
              font-size: 0.95rem;
            }
            .cta-section {
              text-align: center;
              margin: 40px 0;
              padding: 30px;
              background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
              border-radius: 12px;
            }
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 16px 32px;
              text-decoration: none;
              border-radius: 50px;
              font-weight: 600;
              font-size: 1.1rem;
              transition: all 0.3s ease;
              box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            }
            .cta-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
            }
            .stats-section {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
              margin: 30px 0;
            }
            .stat-item {
              text-align: center;
              padding: 20px;
              background: #f8fafc;
              border-radius: 8px;
            }
            .stat-number {
              font-size: 2rem;
              font-weight: 800;
              color: #667eea;
              display: block;
            }
            .stat-label {
              color: #6b7280;
              font-size: 0.9rem;
              margin-top: 5px;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              color: #6b7280;
              font-size: 0.9rem;
              padding: 20px;
              border-top: 1px solid #e5e7eb;
            }
            .social-links {
              margin: 20px 0;
            }
            .social-links a {
              display: inline-block;
              margin: 0 10px;
              color: #667eea;
              text-decoration: none;
            }
            @media (max-width: 600px) {
              .container { margin: 10px; border-radius: 12px; }
              .header { padding: 30px 20px; }
              .content { padding: 30px 20px; }
              .header h1 { font-size: 2rem; }
              .features-grid { grid-template-columns: 1fr; }
              .stats-section { grid-template-columns: 1fr; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Vítejte ve FitnessAI!</h1>
              <p>Váš osobní fitness průvodce s umělou inteligencí</p>
            </div>

            <div class="content">
              <div class="welcome-message">
                Ahoj <strong>${data.userName}</strong>! 🚀
              </div>

              <p style="text-align: center; color: #6b7280; margin-bottom: 30px;">
                Děkujeme za registraci! Jsme nadšeni, že jste se rozhodli začít svou fitness cestu s námi.
              </p>

              <div class="features-grid">
                <div class="feature-card">
                  <span class="feature-icon">🤖</span>
                  <div class="feature-title">AI Fitness Assessment</div>
                  <div class="feature-desc">Osobní dotazník pro vytvoření vašeho plánu</div>
                </div>

                <div class="feature-card">
                  <span class="feature-icon">💪</span>
                  <div class="feature-title">Personalizované tréninky</div>
                  <div class="feature-desc">Cvičení šité na míru vašim cílům</div>
                </div>

                <div class="feature-card">
                  <span class="feature-icon">🥗</span>
                  <div class="feature-title">Jídelníčky</div>
                  <div class="feature-desc">Výživové plány s recepty a nákupními seznamy</div>
                </div>

                <div class="feature-card">
                  <span class="feature-icon">📊</span>
                  <div class="feature-title">Sledování pokroku</div>
                  <div class="feature-desc">Monitorování vašeho fitness vývoje</div>
                </div>
              </div>

              <div class="stats-section">
                <div class="stat-item">
                  <span class="stat-number">10k+</span>
                  <span class="stat-label">Spokojených uživatelů</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">500+</span>
                  <span class="stat-label">Cvičení v databázi</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">95%</span>
                  <span class="stat-label">Úspěšnost plánů</span>
                </div>
              </div>

              <div class="cta-section">
                <h3 style="margin-bottom: 20px; color: #1f2937;">Začněte svou fitness cestu ještě dnes!</h3>
                <a href="${data.dashboardUrl}" class="cta-button">
                  🚀 Přejít do Dashboardu
                </a>
              </div>
            </div>

            <div class="footer">
              <p>© 2024 FitnessAI. Všechna práva vyhrazena.</p>
              <p>Tento email byl odeslán na adresu ${data.userEmail}</p>
              <div class="social-links">
                <a href="#">📧 Podpora</a> |
                <a href="#">📖 Návody</a> |
                <a href="#">💬 Komunita</a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  static getPaymentConfirmationEmail(data: PaymentEmailData): EmailData {
    return {
      to: data.userEmail,
      subject: '✅ Platba potvrzena - Váš fitness plán je připraven!',
      html: `
        <!DOCTYPE html>
        <html lang="cs">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Potvrzení platby</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #1f2937;
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              min-height: 100vh;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            }
            .header {
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
              position: relative;
            }
            .header::after {
              content: '✅';
              position: absolute;
              top: 20px;
              right: 20px;
              font-size: 2rem;
              animation: bounce 2s infinite;
            }
            @keyframes bounce {
              0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
              40% { transform: translateY(-10px); }
              60% { transform: translateY(-5px); }
            }
            .header h1 {
              font-size: 2.2rem;
              font-weight: 800;
              margin-bottom: 10px;
            }
            .header p {
              font-size: 1.1rem;
              opacity: 0.9;
            }
            .content {
              padding: 40px 30px;
              background: white;
            }
            .success-message {
              text-align: center;
              font-size: 1.2rem;
              color: #059669;
              margin-bottom: 30px;
              padding: 20px;
              background: #f0fdf4;
              border-radius: 8px;
              border-left: 4px solid #10b981;
            }
            .order-details {
              background: #f8fafc;
              padding: 25px;
              border-radius: 12px;
              margin: 30px 0;
              border: 1px solid #e5e7eb;
            }
            .order-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 12px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .order-row:last-child {
              border-bottom: none;
              font-weight: 700;
              font-size: 1.1rem;
              color: #059669;
            }
            .features-list {
              margin: 30px 0;
            }
            .feature-item {
              display: flex;
              align-items: center;
              padding: 12px 0;
              border-bottom: 1px solid #f3f4f6;
            }
            .feature-item:last-child {
              border-bottom: none;
            }
            .feature-icon {
              margin-right: 15px;
              font-size: 1.2rem;
            }
            .cta-section {
              text-align: center;
              margin: 40px 0;
              padding: 30px;
              background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
              border-radius: 12px;
            }
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
              padding: 16px 32px;
              text-decoration: none;
              border-radius: 50px;
              font-weight: 600;
              font-size: 1.1rem;
              transition: all 0.3s ease;
              box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
            }
            .cta-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 25px rgba(16, 185, 129, 0.6);
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              color: #6b7280;
              font-size: 0.9rem;
              padding: 20px;
              border-top: 1px solid #e5e7eb;
            }
            @media (max-width: 600px) {
              .container { margin: 10px; border-radius: 12px; }
              .header { padding: 30px 20px; }
              .content { padding: 30px 20px; }
              .header h1 { font-size: 1.8rem; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Platba byla úspěšně zpracována!</h1>
              <p>Děkujeme za vaši objednávku</p>
            </div>

            <div class="content">
              <div class="success-message">
                🎉 Ahoj <strong>${data.userName}</strong>! Vaše platba byla úspěšně zpracována a váš fitness plán je připraven.
              </div>

              <div class="order-details">
                <h3 style="margin-bottom: 20px; color: #1f2937;">📋 Detaily objednávky</h3>

                <div class="order-row">
                  <span>Plán:</span>
                  <span><strong>${data.planName}</strong></span>
                </div>

                <div class="order-row">
                  <span>Částka:</span>
                  <span><strong>${data.amount} ${data.currency}</strong></span>
                </div>

                <div class="order-row">
                  <span>Status:</span>
                  <span style="color: #059669;">✅ Zaplaceno</span>
                </div>

                <div class="order-row">
                  <span>Datum:</span>
                  <span>${new Date().toLocaleDateString('cs-CZ')}</span>
                </div>
              </div>

              <div class="features-list">
                <h3 style="margin-bottom: 20px; color: #1f2937;">🎯 Co získáte s vaším plánem:</h3>
                ${data.planFeatures.map(feature => `
                  <div class="feature-item">
                    <span class="feature-icon">✨</span>
                    <span>${feature}</span>
                  </div>
                `).join('')}
              </div>

              <div class="cta-section">
                <h3 style="margin-bottom: 20px; color: #1f2937;">🚀 Začněte svou fitness cestu ještě dnes!</h3>
                <p style="margin-bottom: 20px; color: #6b7280;">
                  Váš personalizovaný fitness plán je nyní dostupný ve vašem dashboardu.
                </p>
                <a href="${data.dashboardUrl}" class="cta-button">
                  📊 Zobrazit můj plán
                </a>
              </div>
            </div>

            <div class="footer">
              <p>© 2024 FitnessAI. Všechna práva vyhrazena.</p>
              <p>Tento email byl odeslán na adresu ${data.userEmail}</p>
              <p style="margin-top: 10px;">
                💬 Potřebujete pomoc? Kontaktujte nás na <a href="mailto:support@fitnessai.com" style="color: #10b981;">support@fitnessai.com</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  static getWorkoutReminderEmail(data: WorkoutReminderData): EmailData {
    return {
      to: data.userEmail,
      subject: '💪 Čas na trénink! - ${data.workoutName}',
      html: `
        <!DOCTYPE html>
        <html lang="cs">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Workout Reminder</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #1f2937;
              background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
              min-height: 100vh;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            }
            .header {
              background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
            }
            .header h1 {
              font-size: 2.2rem;
              font-weight: 800;
              margin-bottom: 10px;
            }
            .workout-card {
              background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
              padding: 30px;
              border-radius: 12px;
              margin: 30px 0;
              border-left: 4px solid #f59e0b;
            }
            .workout-title {
              font-size: 1.5rem;
              font-weight: 700;
              color: #92400e;
              margin-bottom: 15px;
            }
            .workout-details {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
              gap: 15px;
              margin: 20px 0;
            }
            .detail-item {
              text-align: center;
              padding: 15px;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .detail-value {
              font-size: 1.2rem;
              font-weight: 700;
              color: #f59e0b;
              display: block;
            }
            .detail-label {
              color: #6b7280;
              font-size: 0.9rem;
              margin-top: 5px;
            }
            .muscles-list {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
              margin: 15px 0;
            }
            .muscle-tag {
              background: #f59e0b;
              color: white;
              padding: 6px 12px;
              border-radius: 20px;
              font-size: 0.9rem;
              font-weight: 500;
            }
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
              color: white;
              padding: 16px 32px;
              text-decoration: none;
              border-radius: 50px;
              font-weight: 600;
              font-size: 1.1rem;
              transition: all 0.3s ease;
              box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
            }
            .cta-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 25px rgba(245, 158, 11, 0.6);
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              color: #6b7280;
              font-size: 0.9rem;
              padding: 20px;
              border-top: 1px solid #e5e7eb;
            }
            @media (max-width: 600px) {
              .container { margin: 10px; border-radius: 12px; }
              .header { padding: 30px 20px; }
              .workout-card { padding: 20px; }
              .header h1 { font-size: 1.8rem; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💪 Čas na trénink!</h1>
              <p>Připravte se na skvělý workout</p>
            </div>

            <div style="padding: 40px 30px;">
              <h2 style="margin-bottom: 20px; color: #1f2937;">
                Ahoj <strong>${data.userName}</strong>! 🚀
              </h2>

              <p style="color: #6b7280; margin-bottom: 30px;">
                Je čas na váš dnešní trénink! Máme pro vás připravený skvělý workout.
              </p>

              <div class="workout-card">
                <div class="workout-title">🏋️ ${data.workoutName}</div>

                <div class="workout-details">
                  <div class="detail-item">
                    <span class="detail-value">⏱️</span>
                    <span class="detail-label">${data.workoutDuration}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-value">🎯</span>
                    <span class="detail-label">${data.targetMuscles.length} svalových skupin</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-value">🔥</span>
                    <span class="detail-label">Intenzivní</span>
                  </div>
                </div>

                <div>
                  <strong style="color: #92400e;">Cílové svalové skupiny:</strong>
                  <div class="muscles-list">
                    ${data.targetMuscles.map(muscle => `
                      <span class="muscle-tag">${muscle}</span>
                    `).join('')}
                  </div>
                </div>
              </div>

              <div style="text-align: center; margin: 40px 0;">
                <a href="${data.dashboardUrl}" class="cta-button">
                  🚀 Začít trénink
                </a>
              </div>

              <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <h4 style="color: #92400e; margin-bottom: 10px;">💡 Tip pro dnešní trénink:</h4>
                <p style="color: #92400e;">
                  Nezapomeňte se před tréninkem pořádně rozcvičit a protáhnout.
                  To vám pomůže předejít zraněním a zlepší váš výkon!
                </p>
              </div>
            </div>

            <div class="footer">
              <p>© 2024 FitnessAI. Všechna práva vyhrazena.</p>
              <p>Tento email byl odeslán na adresu ${data.userEmail}</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  static getProgressUpdateEmail(data: ProgressUpdateData): EmailData {
    return {
      to: data.userEmail,
      subject: '📊 Váš fitness pokrok - Skvělá práce!',
      html: `
        <!DOCTYPE html>
        <html lang="cs">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Progress Update</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #1f2937;
              background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
              min-height: 100vh;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            }
            .header {
              background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
            }
            .header h1 {
              font-size: 2.2rem;
              font-weight: 800;
              margin-bottom: 10px;
            }
            .progress-circle {
              width: 120px;
              height: 120px;
              border-radius: 50%;
              background: conic-gradient(#8b5cf6 ${data.progressPercentage * 3.6}deg, #e5e7eb 0deg);
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 20px auto;
              position: relative;
            }
            .progress-circle::before {
              content: '';
              width: 90px;
              height: 90px;
              background: white;
              border-radius: 50%;
              position: absolute;
            }
            .progress-text {
              position: relative;
              z-index: 1;
              font-size: 1.5rem;
              font-weight: 700;
              color: #8b5cf6;
            }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
              gap: 20px;
              margin: 30px 0;
            }
            .stat-card {
              background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
              padding: 20px;
              border-radius: 12px;
              text-align: center;
              border-left: 4px solid #8b5cf6;
            }
            .stat-number {
              font-size: 2rem;
              font-weight: 800;
              color: #8b5cf6;
              display: block;
            }
            .stat-label {
              color: #6b7280;
              font-size: 0.9rem;
              margin-top: 5px;
            }
            .weight-progress {
              background: #f8fafc;
              padding: 25px;
              border-radius: 12px;
              margin: 30px 0;
              border: 1px solid #e5e7eb;
            }
            .weight-bar {
              width: 100%;
              height: 20px;
              background: #e5e7eb;
              border-radius: 10px;
              overflow: hidden;
              margin: 15px 0;
            }
            .weight-fill {
              height: 100%;
              background: linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%);
              border-radius: 10px;
              transition: width 0.3s ease;
              width: ${data.progressPercentage}%;
            }
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
              color: white;
              padding: 16px 32px;
              text-decoration: none;
              border-radius: 50px;
              font-weight: 600;
              font-size: 1.1rem;
              transition: all 0.3s ease;
              box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
            }
            .cta-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 25px rgba(139, 92, 246, 0.6);
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              color: #6b7280;
              font-size: 0.9rem;
              padding: 20px;
              border-top: 1px solid #e5e7eb;
            }
            @media (max-width: 600px) {
              .container { margin: 10px; border-radius: 12px; }
              .header { padding: 30px 20px; }
              .stats-grid { grid-template-columns: 1fr; }
              .header h1 { font-size: 1.8rem; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Váš fitness pokrok</h1>
              <p>Skvělá práce! Pokračujte takto dál</p>
            </div>

            <div style="padding: 40px 30px;">
              <h2 style="margin-bottom: 20px; color: #1f2937; text-align: center;">
                Ahoj <strong>${data.userName}</strong>! 🎉
              </h2>

              <p style="color: #6b7280; margin-bottom: 30px; text-align: center;">
                Máme pro vás týdenní přehled vašeho fitness pokroku. Jste na skvělé cestě!
              </p>

              <div style="text-align: center; margin: 30px 0;">
                <div class="progress-circle">
                  <div class="progress-text">${Math.round(data.progressPercentage)}%</div>
                </div>
                <p style="color: #6b7280; margin-top: 10px;">
                  Celkový pokrok k cíli
                </p>
              </div>

              <div class="stats-grid">
                <div class="stat-card">
                  <span class="stat-number">${data.currentWeight}kg</span>
                  <span class="stat-label">Aktuální váha</span>
                </div>
                <div class="stat-card">
                  <span class="stat-number">${data.targetWeight}kg</span>
                  <span class="stat-label">Cílová váha</span>
                </div>
                <div class="stat-card">
                  <span class="stat-number">${data.daysActive}</span>
                  <span class="stat-label">Aktivní dny</span>
                </div>
                <div class="stat-card">
                  <span class="stat-number">${data.workoutsCompleted}</span>
                  <span class="stat-label">Dokončené tréninky</span>
                </div>
              </div>

              <div class="weight-progress">
                <h3 style="margin-bottom: 15px; color: #1f2937;">📈 Pokrok k cílové váze</h3>
                <div class="weight-bar">
                  <div class="weight-fill"></div>
                </div>
                <div style="display: flex; justify-content: space-between; color: #6b7280; font-size: 0.9rem;">
                  <span>${data.currentWeight}kg</span>
                  <span>${data.targetWeight}kg</span>
                </div>
              </div>

              <div style="text-align: center; margin: 40px 0;">
                <a href="${data.dashboardUrl}" class="cta-button">
                  📊 Zobrazit detailní statistiky
                </a>
              </div>

              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <h4 style="color: #1f2937; margin-bottom: 10px;">🏆 Dosáhli jste:</h4>
                <ul style="color: #6b7280; margin-left: 20px;">
                  <li>${data.daysActive} aktivních dnů v řadě</li>
                  <li>${data.workoutsCompleted} dokončených tréninků</li>
                  <li>${Math.round(data.progressPercentage)}% pokroku k cíli</li>
                </ul>
              </div>
            </div>

            <div class="footer">
              <p>© 2024 FitnessAI. Všechna práva vyhrazena.</p>
              <p>Tento email byl odeslán na adresu ${data.userEmail}</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }
}