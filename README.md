# FitnessAI - AI-Powered Fitness Planning Platform

Modern fitness planning platform with AI-generated personalized workout and meal plans, featuring Stripe payment integration for one-time payments.

## 🚀 Features

- **AI-Powered Fitness Assessment** - Personalized questionnaire for optimal plan generation
- **Custom Workout Plans** - Tailored exercise routines based on goals and equipment
- **Meal Planning** - Personalized nutrition plans with recipes and shopping lists
- **Stripe Payment Integration** - Secure one-time payments for premium plans
- **Real-time Progress Tracking** - Monitor your fitness journey
- **Mobile-Responsive Design** - Works perfectly on all devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: tRPC, Prisma ORM, Inngest (background jobs)
- **Authentication**: Clerk
- **Payments**: Stripe (one-time payments)
- **Database**: PostgreSQL
- **Styling**: Shadcn/ui components

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Stripe account
- Clerk account

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd FitnessAI
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Add your environment variables to `.env.local`:
```env
# Database
DATABASE_URL="postgresql://..."

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Payments (Stripe)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

4. **Set up the database**
```bash
npx prisma generate
npx prisma db push
```

5. **Start the development server**
```bash
npm run dev
```

6. **Start Stripe webhook listener** (in a separate terminal)
```bash
./start-stripe-webhooks.sh
```

Open [http://localhost:3001](http://localhost:3001) to see the application.

## 🎯 Demo Setup

### Quick Demo Setup

1. **Generate AI data for demo plans:**
   ```bash
   npm run generate:demo-ai
   ```
   *Note: This requires Inngest to be running (`npm run inngest`) and OpenAI API key configured*

3. **Access demo:**
   - Click "Demo" button in navbar (when not signed in)
   - Select from 4 different scenarios (male/female, muscle gain/weight loss)
   - View realistic AI-generated plans on the main dashboard

### Demo Features

- **Real Dashboard Experience:** Uses actual dashboard with demo data
- **Multiple Scenarios:** 4 different user types with realistic data
- **Public Access:** No authentication required
- **AI-Generated Content:** Shows personalized workout and meal plans
- **Real AI Data:** When AI generation is run, demo plans contain actual AI-generated workouts and meals

## 💳 Payment Setup

### Stripe Configuration

1. **Create a Stripe account** at [stripe.com](https://stripe.com)
2. **Get your API keys** from Dashboard → Developers → API keys
3. **Set up webhooks** for local development:
   ```bash
   stripe login
   ./start-stripe-webhooks.sh
   ```

### Test Cards

- **Successful payment**: `4242 4242 4242 4242`
- **Failed payment**: `4000 0000 0000 0002`
- **3D Secure required**: `4000 0025 0000 3155`

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   ├── dashboard/         # User dashboard
│   └── workout/           # Workout pages
├── components/            # React components
│   └── ui/               # Shadcn/ui components
├── modules/              # Feature modules
│   ├── fitness/          # Fitness-related features
│   └── home/             # Home page components
├── trcp/                 # tRPC configuration
└── lib/                  # Utilities and configurations
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `node test-stripe.js` - Test Stripe integration

### Testing Stripe Integration

```bash
# Test Stripe connection
node test-stripe.js

# Start webhook listener
./start-stripe-webhooks.sh
```

## 📚 Documentation

- [Stripe Integration Guide](./STRIPE_INTEGRATION.md) - Complete Stripe setup guide
- [Payment Integration](./PAYMENT_INTEGRATION.md) - Payment system overview

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
