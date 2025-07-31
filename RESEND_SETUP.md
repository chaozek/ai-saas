# Resend Email Integration Setup

Tento průvodce vám pomůže nastavit Resend pro odesílání emailů ve vaší FitnessAI aplikaci.

## 1. Nastavení Resend účtu

1. Vytvořte účet na [Resend.com](https://resend.com)
2. Ověřte svou doménu nebo použijte testovací doménu pro testování
3. Přejděte do **API Keys** sekce
4. Vytvořte nový API klíč a zkopírujte ho

## 2. Environment Variables

Přidejte do vašeho `.env.local`:

```env
# Resend Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@your-domain.com

# App URL (for email links)
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

## 3. Ověření domény

### Pro produkci:
1. V Resend Dashboardu přejděte do **Domains**
2. Přidejte svou doménu
3. Následujte instrukce pro DNS záznamy
4. Počkejte na ověření (obvykle do 24 hodin)

### Pro testování:
1. Použijte testovací doménu poskytovanou Resend
2. Můžete posílat na jakékoliv emailové adresy

## 4. Implementované funkce

### Automatické emaily:

1. **Welcome Email** - Odesílá se při registraci uživatele
   - Trigger: `clerk/user.created` webhook
   - Obsah: Uvítání, informace o funkcích, odkaz na dashboard
   - **Poznámka:** Vyžaduje nastavení Clerk webhooku (viz `CLERK_WEBHOOK_SETUP.md`)

2. **Payment Confirmation Email** - Odesílá se po úspěšné platbě
   - Trigger: Stripe `payment_intent.succeeded` webhook
   - Obsah: Potvrzení platby, detaily objednávky, odkaz na plán

### tRPC Endpoints:

- `email.sendWelcomeEmail` - Odeslání uvítacího emailu
- `email.sendPaymentConfirmationEmail` - Odeslání potvrzení platby
- `email.testEmail` - Testovací endpoint pro vývoj

## 5. Testování

### Testovací komponenta:
Použijte `EmailTest` komponentu pro testování emailové funkcionality:

```tsx
import { EmailTest } from "@/components/ui/email-test";

// V admin panelu nebo testovací stránce
<EmailTest />
```

### Manuální testování:
```bash
# Test welcome email
curl -X POST http://localhost:3001/api/trpc/email.sendWelcomeEmail \
  -H "Content-Type: application/json" \
  -d '{"userId": "user_123"}'

# Test payment confirmation
curl -X POST http://localhost:3001/api/trpc/email.sendPaymentConfirmationEmail \
  -H "Content-Type: application/json" \
  -d '{"userId": "user_123", "planName": "Premium Plan", "amount": 99.99, "currency": "CZK"}'
```

## 6. Monitoring a logy

### Logy:
- Všechny emailové operace jsou logovány do konzole
- Úspěšné odeslání: `Email sent successfully: [response]`
- Chyby: `Failed to send email: [error]`

### Resend Dashboard:
- Sledujte doručnost v **Logs** sekci
- Kontrolujte bounce rate a spam complaints
- Monitorujte API usage

## 7. Troubleshooting

### Časté problémy:

1. **"Resend configuration missing"**
   - Zkontrolujte, zda jsou nastaveny všechny environment variables
   - Ověřte správnost API klíče

2. **"Domain not verified"**
   - Pro produkci: ověřte DNS záznamy
   - Pro testování: použijte testovací doménu

3. **"Rate limit exceeded"**
   - Resend má limity na počet emailů
   - Upgrade plánu nebo počkejte na reset limitu

4. **Emaily se neodesílají**
   - Zkontrolujte logy v konzoli
   - Ověřte, zda je doména aktivní v Resend
   - Testujte s jakýmikoliv emailovými adresami

## 8. Produkční nasazení

1. **Ověřte doménu** v Resend
2. **Nastavte SPF a DKIM** záznamy
3. **Konfigurujte bounce handling**
4. **Nastavte webhooky** pro sledování událostí
5. **Monitorujte metriky** doručnosti

## 9. Bezpečnost

- Nikdy nesdílejte API klíče
- Používejte environment variables
- Omezte přístup k emailovým endpointům
- Sledujte neobvyklou aktivitu
- Implementujte rate limiting pro emailové endpointy