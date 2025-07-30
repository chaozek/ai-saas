# Demo Setup Guide

Tento průvodce vám pomůže nastavit demo účet pro FitnessAI aplikaci.

## 🎯 Co je demo účet?

Demo účet je předpřipravený uživatelský účet s kompletními daty, který umožňuje návštěvníkům prohlédnout si, jak vypadá reálný fitness plán bez nutnosti registrace nebo platby.

## 🚀 Funkce demo účtu

- **4 různé typy plánů**: Muž/Žena × Nabírání svalů/Hubnutí
- **Kompletní tréninkové plány**: 8-týdenní programy s cviky
- **Jídelníčky**: Detailní jídelní plány s recepty
- **Sledování pokroku**: Ukázka statistik a metrik
- **100% transparentní**: Žádné skryté poplatky nebo registrace

## 📋 Požadavky

- Node.js 18+
- PostgreSQL databáze
- Prisma CLI

## 🔧 Instalace

### 1. Spuštění seed skriptu

```bash
# Spuštění demo seed skriptu
npm run seed:demo
```

### 2. Ověření instalace

```bash
# Otevření Prisma Studio pro kontrolu dat
npm run studio
```

V Prisma Studio byste měli vidět:
- Demo uživatel s ID: `demo-user-123`
- Fitness profil s kompletními daty
- Tréninkový plán s 4 tréninky
- Jídelní plán s 5 jídly
- Dokončenou platbu

## 🎨 Použití demo účtu

### Pro návštěvníky

1. **Kliknutí na "Demo" tlačítko** v navbaru nebo na hlavní stránce
2. **Výběr typu plánu** v modalu:
   - Muž - Nabírání svalů
   - Muž - Hubnutí
   - Žena - Nabírání svalů
   - Žena - Hubnutí
3. **Prohlížení demo dashboardu** s kompletními daty

### Pro vývojáře

Demo účet je dostupný na URL: `/demo?gender=male&goal=muscle_gain`

Parametry:
- `gender`: `male` nebo `female`
- `goal`: `muscle_gain` nebo `weight_loss`

## 📊 Demo data

### Uživatelské údaje
- **Muž**: Tomáš Novák, 28 let, 180cm, 75kg
- **Žena**: Anna Svobodová, 25 let, 165cm, 60kg

### Tréninkové plány
- **Nabírání svalů**: 4x týdně silový trénink
- **Hubnutí**: Kombinace silového tréninku a kardia

### Jídelníčky
- **Nabírání svalů**: 2800 kcal, 180g protein
- **Hubnutí**: 2200 kcal, 160g protein

## 🔄 Aktualizace demo dat

Pro aktualizaci demo dat:

```bash
# Smazání starých demo dat
npx prisma studio

# Spuštění nového seed skriptu
npm run seed:demo
```

## 🐛 Řešení problémů

### Demo data se nezobrazují
1. Zkontrolujte, zda byl seed skript úspěšně spuštěn
2. Ověřte připojení k databázi
3. Zkontrolujte Prisma Studio pro existenci demo uživatele

### Chyba při spuštění seed skriptu
1. Zkontrolujte DATABASE_URL v .env
2. Ověřte, zda je databáze dostupná
3. Spusťte `npx prisma generate` před seed skriptem

## 📝 Poznámky

- Demo účet je určen pouze pro demonstrační účely
- Data jsou statická a nejsou propojena s reálnými uživateli
- Demo účet má vždy dokončenou platbu pro zobrazení všech funkcí
- Všechna data jsou v češtině pro český trh

## 🤝 Přispívání

Pro přidání nových demo dat nebo úpravu existujících:

1. Upravte `prisma/seed-demo.ts`
2. Přidejte nová data podle vzoru
3. Spusťte `npm run seed:demo`
4. Otestujte v aplikaci

---

**Poznámka**: Demo účet je klíčovou součástí transparentnosti aplikace a pomáhá uživatelům pochopit hodnotu před registrací.