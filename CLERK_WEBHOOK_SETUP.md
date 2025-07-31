# Clerk Webhook Setup for Welcome Emails

Tento průvodce vám pomůže nastavit Clerk webhook pro automatické odesílání uvítacích emailů při registraci nových uživatelů.

## 🔧 Proč je Webhook Potřebný?

Bez webhooku se uvítací emaily neodesílají automaticky při registraci uživatelů. Webhook zajistí, že:

- **Automatické odesílání** - Email se odešle ihned po registraci
- **Spolehlivost** - Funguje i když uživatel opustí stránku
- **Asynchronní zpracování** - Nezpomaluje registrační proces
- **Error handling** - Pokusy o opakované odeslání při selhání

## 📋 Krok za Krokem

### 1. Nastavení v Clerk Dashboardu

1. **Přihlaste se** do [Clerk Dashboardu](https://dashboard.clerk.com)
2. **Vyberte vaši aplikaci**
3. **Přejděte do sekce** `Webhooks`
4. **Klikněte** `Add Endpoint`

### 2. Konfigurace Webhooku

**Endpoint URL:**
```
https://yourdomain.com/api/webhooks/clerk
```

**Events to send:**
- ✅ `user.created` (povinné pro uvítací emaily)
- ✅ `user.updated` (volitelné)
- ✅ `user.deleted` (volitelné)

### 3. Získání Webhook Secret

1. **Po vytvoření webhooku** zkopírujte `Signing secret`
2. **Přidejte do `.env.local`:**
```env
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. Testování Webhooku

#### Lokální Testování
Pro lokální vývoj použijte [ngrok](https://ngrok.com):

```bash
# Instalace ngrok
npm install -g ngrok

# Spuštění tunelu
ngrok http 3001

# Použijte ngrok URL v Clerk webhooku
# https://abc123.ngrok.io/api/webhooks/clerk
```

#### Produkční Testování
1. **Vytvořte testovacího uživatele** v aplikaci
2. **Zkontrolujte logy** v konzoli nebo Inngest dashboardu
3. **Ověřte email** v doručené poště

## 🔍 Troubleshooting

### Webhook se nevolá
- **Zkontrolujte URL** - Musí být veřejně dostupná
- **Ověřte SSL** - Produkce vyžaduje HTTPS
- **Zkontrolujte firewall** - Port 443 musí být otevřený

### Email se neodesílá
- **Zkontrolujte Resend API key** - `RESEND_API_KEY`
- **Ověřte logy** - Hledejte chyby v konzoli
- **Testujte manuálně** - Použijte admin panel

### Inngest Error
- **Zkontrolujte Inngest konfiguraci** - `INNGEST_EVENT_KEY`
- **Ověřte funkci** - `sync-user` musí být registrována
- **Zkontrolujte event name** - Musí být `clerk/user.created`

## 📊 Monitoring

### Clerk Dashboard
- **Webhook Logs** - Zobrazuje všechny volání
- **Delivery Status** - Úspěšné/neúspěšné doručení
- **Response Time** - Rychlost zpracování

### Inngest Dashboard
- **Function Logs** - Detailní logy zpracování
- **Event History** - Historie všech událostí
- **Error Tracking** - Sledování chyb

### Aplikace Logy
```bash
# Sledování logů v reálném čase
npm run dev

# Hledejte tyto zprávy:
# "Webhook received! user.created"
# "User created event sent to Inngest"
# "Welcome email sent successfully"
```

## 🚀 Produkční Nasazení

### 1. Environment Variables
```env
# Clerk
CLERK_WEBHOOK_SECRET=whsec_production_secret_here

# Resend
RESEND_API_KEY=re_production_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 2. SSL Certificate
- **Povinné pro produkci** - Clerk vyžaduje HTTPS
- **Automatické SSL** - Použijte Vercel, Netlify, nebo podobné
- **Custom domain** - Nastavte vlastní doménu

### 3. Monitoring
- **Uptime monitoring** - Sledujte dostupnost webhooku
- **Error alerting** - Nastavte upozornění na chyby
- **Performance tracking** - Monitorujte rychlost zpracování

## 🔒 Bezpečnost

### Webhook Verification
- **Svix signature** - Automatické ověření podpisu
- **Secret key** - Bezpečné uložení v environment variables
- **Rate limiting** - Ochrana proti spam útokům

### Best Practices
- **Nikdy nesdílejte** webhook secret
- **Používejte HTTPS** v produkci
- **Logujte události** pro debugging
- **Implementujte retry logic** pro spolehlivost

## 📝 Testování

### Manuální Test
```bash
# Test webhook endpointu
curl -X POST https://yourdomain.com/api/webhooks/clerk \
  -H "Content-Type: application/json" \
  -H "svix-id: test-id" \
  -H "svix-timestamp: $(date +%s)" \
  -H "svix-signature: test-signature" \
  -d '{"type":"user.created","data":{"id":"test-user"}}'
```

### Automatické Testy
```bash
# Spuštění testů
npm run test:email

# Test všech emailových šablon
npm run test:email
```

## 🎯 Výsledek

Po správném nastavení:

1. **Uživatel se zaregistruje** v aplikaci
2. **Clerk odešle webhook** na `/api/webhooks/clerk`
3. **Webhook ověří podpis** a zpracuje událost
4. **Inngest spustí funkci** `sync-user`
5. **Funkce vytvoří uživatele** v databázi
6. **Odešle se uvítací email** přes Resend
7. **Uživatel obdrží** krásný uvítací email

## 🆘 Podpora

Pokud máte problémy:

1. **Zkontrolujte logy** v konzoli
2. **Ověřte environment variables**
3. **Testujte webhook endpoint**
4. **Kontaktujte podporu** s detaily chyby

---

**Poznámka:** Tento webhook je klíčový pro automatické odesílání uvítacích emailů. Bez něj se emaily neodesílají při registraci uživatelů.