# 🎨 Cool Email Template Guide

Tento průvodce vám ukáže, jak vytvářet moderní a atraktivní emailové šablony pro vaši FitnessAI aplikaci.

## 🚀 Proč Cool Email Templates?

### Výhody moderních emailových šablon:
- **Lepší engagement** - Uživatelé si více všímají krásných emailů
- **Profesionální image** - Zvyšuje důvěryhodnost vaší značky
- **Lepší konverze** - Atraktivní design vede k vyšším klikům
- **Mobilní optimalizace** - Funguje perfektně na všech zařízeních
- **Personalizace** - Dynamický obsah pro každého uživatele

## 🎯 Implementované Šablony

### 1. 🎉 Welcome Email
**Kdy se používá:** Při registraci nového uživatele
**Design:** Gradient header s animací, feature cards, statistiky
**Funkce:**
- Animated floating background
- Feature grid s ikonami
- Statistiky aplikace
- Call-to-action button

### 2. ✅ Payment Confirmation
**Kdy se používá:** Po úspěšné platbě
**Design:** Zelený gradient s animovaným checkmark
**Funkce:**
- Animated checkmark
- Order details card
- Feature highlights
- Professional styling

### 3. 💪 Workout Reminder
**Kdy se používá:** Připomenutí tréninku
**Design:** Energetický oranžový design
**Funkce:**
- Workout details card
- Muscle group tags
- Motivational elements
- Quick action button

### 4. 📊 Progress Update
**Kdy se používá:** Týdenní přehled pokroku
**Design:** Fialový gradient s progress visualizací
**Funkce:**
- Circular progress indicator
- Statistics grid
- Weight progress bar
- Achievement highlights

## 🛠️ Jak Vytvořit Cool Email Template

### 1. Základní Struktura

```html
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Title</title>
  <style>
    /* CSS styles here */
  </style>
</head>
<body>
  <div class="container">
    <!-- Email content -->
  </div>
</body>
</html>
```

### 2. Moderní CSS Techniky

#### Gradient Backgrounds
```css
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

#### Animace
```css
@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

.header::before {
  animation: float 6s ease-in-out infinite;
}
```

#### Hover Effects
```css
.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
}
```

#### Responsive Grid
```css
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}
```

### 3. Design Patterns

#### Card Design
```css
.card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #667eea;
}
```

#### Progress Visualization
```css
.progress-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: conic-gradient(#8b5cf6 60deg, #e5e7eb 0deg);
}
```

#### Tag System
```css
.tag {
  background: #f59e0b;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
}
```

## 🎨 Barevné Palety

### Primary Colors
- **Blue Gradient:** `#667eea` → `#764ba2`
- **Green Gradient:** `#10b981` → `#059669`
- **Orange Gradient:** `#f59e0b` → `#d97706`
- **Purple Gradient:** `#8b5cf6` → `#7c3aed`

### Neutral Colors
- **Text:** `#1f2937`
- **Secondary Text:** `#6b7280`
- **Background:** `#f8fafc`
- **Border:** `#e5e7eb`

## 📱 Mobilní Optimalizace

### Responsive Design
```css
@media (max-width: 600px) {
  .container { margin: 10px; border-radius: 12px; }
  .header { padding: 30px 20px; }
  .content { padding: 30px 20px; }
  .features-grid { grid-template-columns: 1fr; }
}
```

### Touch-Friendly Buttons
```css
.button {
  padding: 16px 32px;
  min-height: 44px; /* Touch target size */
  border-radius: 50px;
}
```

## 🔧 Implementace v Kódu

### 1. Vytvoření Template Class
```typescript
export class EmailTemplates {
  static getWelcomeEmail(data: WelcomeEmailData): EmailData {
    return {
      to: data.userEmail,
      subject: '🎉 Vítejte ve FitnessAI!',
      html: `/* HTML template */`
    };
  }
}
```

### 2. Použití v Email Service
```typescript
static async sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
  const data: WelcomeEmailData = {
    userName,
    userEmail,
    dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
  };

  const emailData = EmailTemplates.getWelcomeEmail(data);
  return this.sendEmail(emailData);
}
```

### 3. tRPC Endpoint
```typescript
sendWelcomeEmail: baseProcedure
  .input(z.object({
    userId: z.string(),
  }))
  .mutation(async ({ input }) => {
    // Implementation
  })
```

## 🧪 Testování

### Admin Panel
- Navštivte `/admin/faktury`
- Použijte "Cool Email Templates Test" sekci
- Testujte všechny šablony

### Command Line
```bash
npm run test:email
```

### Manuální Test
```bash
curl -X POST http://localhost:3001/api/trpc/email.sendWelcomeEmail \
  -H "Content-Type: application/json" \
  -d '{"userId": "user_123"}'
```

## 🎯 Best Practices

### 1. Typography
- Používejte systémové fonty: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto`
- Hierarchie velikostí: `2.5rem` → `1.3rem` → `1.1rem` → `0.9rem`
- Line height: `1.6` pro čitelnost

### 2. Spacing
- Konzistentní padding: `20px`, `30px`, `40px`
- Gap mezi elementy: `15px`, `20px`, `30px`
- Margin pro sekce: `30px`, `40px`

### 3. Colors
- Používejte sémantické barvy (success = green, warning = orange)
- Gradient backgrounds pro visual appeal
- Kontrastní text pro čitelnost

### 4. Interactive Elements
- Hover effects pro buttons
- Smooth transitions (`transition: all 0.3s ease`)
- Box shadows pro depth

### 5. Content Structure
- Clear hierarchy (H1 → H2 → H3)
- Feature lists s ikonami
- Call-to-action buttons
- Social links v footer

## 🚀 Pokročilé Techniky

### 1. CSS Grid Layout
```css
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
}
```

### 2. CSS Custom Properties
```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --text-color: #1f2937;
}
```

### 3. Advanced Animations
```css
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}
```

### 4. Conditional Styling
```css
@media (prefers-color-scheme: dark) {
  .container { background: #1f2937; }
}
```

## 📊 Analytics a Tracking

### Email Metrics
- **Open Rate:** Sledujte pomocí Resend dashboardu
- **Click Rate:** Trackujte CTA buttons
- **Bounce Rate:** Monitorujte doručnost
- **Unsubscribe Rate:** Sledujte engagement

### A/B Testing
- Testujte různé subject lines
- Experimentujte s různými CTA texty
- Porovnávejte různé designy

## 🔮 Budoucí Vylepšení

### Plánované Funkce
- **Dark Mode Support** - Automatické přepínání podle systému
- **Dynamic Content** - Personalizované doporučení
- **Interactive Elements** - Hover effects v email klientech
- **Video Embeds** - Tutorial videa v emailech
- **Social Proof** - Testimonials a reviews

### Technické Vylepšení
- **Template Engine** - Handlebars nebo podobný
- **Image Optimization** - Automatické resizing
- **Caching** - Template caching pro performance
- **Analytics** - Detailní tracking

## 🎉 Závěr

Moderní emailové šablony jsou klíčové pro úspěch vaší aplikace. Kombinují:

- **Vizuální přitažlivost** s gradienty a animacemi
- **Funkčnost** s clear call-to-actions
- **Responsivitu** pro všechna zařízení
- **Personalizaci** pro každého uživatele
- **Profesionalitu** pro důvěryhodnost značky

Začněte s implementovanými šablonami a postupně je přizpůsobujte potřebám vaší aplikace!