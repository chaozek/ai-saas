# Stripe Integration Guide for One-Time Payments

Tento průvodce vám pomůže nastavit Stripe pro jednorázové platby ve vaší FitnessAI aplikaci.

## 1. Nastavení Stripe účtu

1. Vytvořte účet na [Stripe.com](https://stripe.com)
2. Přejděte do **Dashboard** → **Developers** → **API keys**
3. Zkopírujte **Publishable key** a **Secret key**

## 2. Environment Variables

Přidejte do vašeho `.env.local`:

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

## 3. Konfigurace Webhooků

### V Stripe Dashboardu:
1. Přejděte do **Developers** → **Webhooks**
2. Klikněte **Add endpoint**
3. Nastavte URL: `https://yourdomain.com/api/webhooks/stripe`
4. Vyberte události:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Zkopírujte **Signing secret** a přidejte ho do `STRIPE_WEBHOOK_SECRET`

### Pro lokální vývoj:
Použijte Stripe CLI pro forwardování webhooků:

```bash
# Instalace Stripe CLI
npm install -g stripe

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## 4. Testování

### Testovací karty:
- **Úspěšná platba**: `4242 4242 4242 4242`
- **Neúspěšná platba**: `4000 0000 0000 0002`
- **Vyžaduje 3D Secure**: `4000 0025 0000 3155`

### Testovací data:
- **Datum expirace**: Jakékoliv budoucí datum
- **CVC**: Jakékoliv 3 číslice
- **PSČ**: Jakékoliv 5 číslic

## 5. Implementace

### Payment Modal
Payment modal je již implementován v `src/components/ui/payment-modal.tsx` a používá:
- tRPC pro komunikaci se serverem
- Stripe Checkout pro zpracování plateb
- Automatické přesměrování po platbě

### tRPC Procedura
`src/modules/fitness/server/procedures.ts` obsahuje `createPaymentIntent` proceduru, která:
- Vytváří Stripe checkout session
- Předává metadata (assessment data, plan info)
- Vrací session ID pro přesměrování

### Webhook Handler
`src/app/api/webhooks/stripe/route.ts` zpracovává:
- Úspěšné platby
- Spouští generování fitness plánů
- Loguje všechny události

## 6. Flow aplikace

1. **Uživatel vyplní assessment** → Fitness assessment form
2. **Klikne "Pokračovat k platbě"** → Otevře se payment modal
3. **Vybere plán** → Fitness Pro (1990 CZK) nebo Fitness Elite (3990 CZK)
4. **Klikne "Zaplatit"** → tRPC vytvoří Stripe checkout session
5. **Přesměrování na Stripe** → Stripe Checkout page
6. **Zadá platební údaje** → Stripe zpracuje platbu
7. **Úspěšná platba** → Stripe přesměruje na success URL
8. **Webhook trigger** → Spustí se generování fitness plánu
9. **Přesměrování na dashboard** → Uživatel vidí svůj plán

## 7. Produkční nasazení

### 1. Aktualizujte environment variables:
```env
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 2. Nastavte webhook endpoint:
- URL: `https://yourdomain.com/api/webhooks/stripe`
- Události: `checkout.session.completed`

### 3. Testujte produkční flow:
- Použijte reálné platební karty
- Ověřte webhook delivery
- Zkontrolujte generování plánů

## 8. Monitoring a Logs

### Stripe Dashboard:
- **Payments** → Zobrazuje všechny transakce
- **Webhooks** → Delivery status a logs
- **Logs** → API calls a errors

### Aplikace:
- Console logs v browseru
- Server logs v terminalu
- Inngest logs pro fitness plan generation

## 9. Error Handling

### Časté chyby:
1. **Webhook signature verification failed**
   - Zkontrolujte `STRIPE_WEBHOOK_SECRET`
   - Ověřte webhook endpoint URL

2. **Payment intent creation failed**
   - Zkontrolujte `STRIPE_SECRET_KEY`
   - Ověřte currency format (musí být lowercase)

3. **Stripe failed to load**
   - Zkontrolujte `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Ověřte internet connection

## 10. Bezpečnost

- Nikdy nesdílejte `STRIPE_SECRET_KEY`
- Vždy ověřujte webhook signatures
- Používejte HTTPS v produkci
- Implementujte rate limiting
- Logujte všechny payment events

## 11. Support

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)
- [Stripe Discord](https://discord.gg/stripe)