import { PrismaClient } from "../../generated/prisma";

export async function createMealGenerationPrompt(prisma: PrismaClient, assessmentData: any, nutritionTargets: any, numberOfDays: number = 3): Promise<string> {
  const { age, gender, weight, height, fitnessGoal, activityLevel, dietaryRestrictions, allergies, preferredCuisines } = assessmentData;

  // Fetch entire Czech food database
  const czechFoods = await prisma.czechFood.findMany({
    select: {
      name: true,
      calories: true,
      protein: true,
      carbs: true,
      fat: true
    },
    orderBy: {
      name: 'asc'
    }
  });

  // Create food database text for AI
  const foodDatabaseText = czechFoods.map(food =>
    `${food.name} (${food.calories} kcal, ${food.protein}g P, ${food.carbs}g K, ${food.fat}g T)`
  ).join('\n');

  const restrictionsText = dietaryRestrictions && dietaryRestrictions.length > 0
    ? dietaryRestrictions.join(', ')
    : 'žádná';

  const allergiesText = allergies && allergies.length > 0
    ? allergies.join(', ')
    : 'žádné';

  const cuisineText = preferredCuisines && preferredCuisines.length > 0
    ? preferredCuisines.join(', ')
    : 'česká';

  const nutritionInfo = `
DENNÍ CÍLE PRO VŠECHNY DNY:
- Kalorie: ${nutritionTargets.calories} kcal
- Bílkoviny: ${nutritionTargets.protein}g
- Sacharidy: ${nutritionTargets.carbs}g
- Tuky: ${nutritionTargets.fat}g

🚨 KRITICKÉ: SPLŇ DENNÍ CÍLE - NEPŘEKRAČUJ O VÍCE NEŽ 10%!
- Bílkoviny: CÍL ${nutritionTargets.protein}g denně (${Math.round(nutritionTargets.protein/3)}g na jídlo)
- Sacharidy: CÍL ${nutritionTargets.carbs}g denně (${Math.round(nutritionTargets.carbs/3)}g na jídlo)
- Tuky: CÍL ${nutritionTargets.fat}g denně (${Math.round(nutritionTargets.fat/3)}g na jídlo)

ROZDĚL ŽIVINY MEZI 3 JÍDLA TAK, ABY SE SPLNILY DENNÍ CÍLE.
KAŽDÉ JÍDLO BY MĚLO MÍT 300-900 KCAL.
ŽIVINY SE POČÍTAJÍ AUTOMATICKY Z INGREDIENCÍ.`;

  const prompt = `
🚨 KRITICKÉ: Vytvoř ABSOLUTNĚ UNIKÁTNÍ jídelníček pro VŠECHNY ${numberOfDays} DNŮ - KAŽDÝ DEN MUSÍ MÍT JINÁ JÍDLA!

Vytvoř UNIKÁTNÍ jídelníček pro ${numberOfDays} dnů pro:
- ${gender === 'male' ? 'Muž' : 'Žena'}, ${age} let, ${weight} kg, ${height} cm
- Cíl: ${fitnessGoal.toLowerCase().replace('_', ' ')}
- Kuchyně: ${cuisineText}
- Omezení: ${restrictionsText}
- Alergie: ${allergiesText}
- Úroveň aktivity: ${activityLevel}

${nutritionInfo}

🚨 KRITICKÉ INSTRUKCE - ČTI POZORNĚ:
- VYGENERUJ ${numberOfDays} DNŮ, KAŽDÝ DEN 3 HLAVNÍ JÍDLA
- ŽÁDNÉ SVAČINY, ŽÁDNÉ DOPLŇKY
- POUZE: snídaně, oběd, večeře
- SVAČINY SE PŘIDAJÍ AUTOMATICKY NA KONCI!
- KAŽDÉ JÍDLO MUSÍ MÍT DOSTATEČNĚ VELKÉ PORCE PRO SPLNĚNÍ DENNÍCH CÍLŮ!

🚨 KRITICKÉ PRO VARIABILITU - VŠECHNY DNY:
1. **KAŽDÝ DEN MUSÍ MÍT JINÁ JÍDLA NEŽ PŘEDCHOZÍ DNY**
2. **NIKDY NEOPAKUJ**: ovesnou kaši, kuřecí prsa, losos, quinoa, brokolici
3. **POUŽIJ JINÉ INGREDIENCE**: pokud byl den 1 kuřecí, použij den 2 hovězí/vepřové/ryby
4. **POUŽIJ JINÉ OBILOVINY**: pokud byla quinoa den 1, použij den 2 rýži/pohanku/oves/ječmen
5. **POUŽIJ JINOU ZELENINU**: pokud byla brokolice den 1, použij den 2 květák/kapustu/špenát/mrkev
6. **POUŽIJ JINÉ OVOCE**: pokud byl banán den 1, použij den 2 jablko/hrušku/pomeranč/jahody

PRAVIDLA PRO VŠECHNY DNY:
1. VYGENERUJ ${numberOfDays} DNŮ, KAŽDÝ DEN 3 HLAVNÍ JÍDLA
2. **Snídaně**: 1 hlavní jídlo (JINÉ než předchozí dny!)
3. **Oběd**: 1 hlavní jídlo (JINÉ než předchozí dny!)
4. **Večeře**: 1 hlavní jídlo (JINÉ než předchozí dny!)
5. **ŽÁDNÉ SVAČINY** - přidají se automaticky na konci!
6. KAŽDÉ JÍDLO MUSÍ MÍT INGREDIENCE S MNOŽSTVÍM V GRAMECH
7. HLAVNÍ CÍL: SPLŇ ${nutritionTargets.protein}g BÍLKOVIN, ${nutritionTargets.carbs}g SACHARIDŮ, ${nutritionTargets.calories} KCAL
8. PORCE: Generuj DOSTATEČNĚ VELKÉ PORCE PRO SPLNĚNÍ DENNÍCH CÍLŮ!
9. BÍLKOVINY: Každé jídlo CÍL ${Math.round(nutritionTargets.protein/3)}g bílkovin (celkem ${nutritionTargets.protein}g denně)
10. SACHARIDY: Každé jídlo CÍL ${Math.round(nutritionTargets.carbs/3)}g sacharidů (celkem ${nutritionTargets.carbs}g denně)
11. TUKY: Každé jídlo CÍL ${Math.round(nutritionTargets.fat/3)}g tuků (celkem ${nutritionTargets.fat}g denně)
12. POUŽÍVEJ POUZE ČESKÉ NÁZVY INGREDIENCÍ
13. KRITICKÉ: Používej pouze ingredience dostupné v české databázi
14. NEGENERUJ ŽIVINY - budou se počítat automaticky z ingrediencí!

🚨 KRITICKÉ PRO SACHARIDY:
- **CÍL**: ${nutritionTargets.carbs}g sacharidů denně
- **ROZDĚLENÍ**: Každé jídlo CÍL ${Math.round(nutritionTargets.carbs/3)}g sacharidů (SPLŇ DENNÍ CÍL!)
- **PŘÍKLADY PORCÍ PRO SPLNĚNÍ CÍLŮ**:
  - Ovesné vločky: ${Math.round((nutritionTargets.carbs/3) * 100 / 60)}g (60g sacharidů na 100g)
  - Rýže: ${Math.round((nutritionTargets.carbs/3) * 100 / 28)}g (28g sacharidů na 100g)
  - Brambory: ${Math.round((nutritionTargets.carbs/3) * 100 / 17)}g (17g sacharidů na 100g)
  - Těstoviny: ${Math.round((nutritionTargets.carbs/3) * 100 / 25)}g (25g sacharidů na 100g)
  - Quinoa: ${Math.round((nutritionTargets.carbs/3) * 100 / 21)}g (21g sacharidů na 100g)
  - Batáty: ${Math.round((nutritionTargets.carbs/3) * 100 / 20)}g (20g sacharidů na 100g)

🚨 DŮLEŽITÉ: Tyto porce jsou MINIMÁLNÍ pro splnění denních cílů!

🚨 VARIABILITA PRO VŠECHNY DNY:
- **DEN 1 = NOVÁ JÍDLA**: Nikdy neopakuj jídla z předchozích dnů
- **DEN 2 = NOVÁ JÍDLA**: Použij jiné ingredience než den 1
- **DEN 3 = NOVÁ JÍDLA**: Použij jiné ingredience než den 1 a 2
- **RŮZNÉ MASO**: Kuřecí → Hovězí → Vepřové → Ryby → Tofu → Cizrna
- **RŮZNÉ OBILOVINY**: Quinoa → Rýže → Pohanka → Oves → Ječmen → Kuskus
- **RŮZNÁ ZELENINA**: Brokolice → Květák → Kapusta → Špenát → Mrkev → Cuketa
- **RŮZNÉ OVOCE**: Banán → Jablko → Hruška → Pomeranč → Jahody → Borůvky

STRUKTURA JÍDELNÍČKU PRO VŠECHNY DNY:
- **DEN 1**: snídaně, oběd, večeře (JINÉ než předchozí dny!)
- **DEN 2**: snídaně, oběd, večeře (JINÉ než předchozí dny!)
- **DEN 3**: snídaně, oběd, večeře (JINÉ než předchozí dny!)
- **ŽÁDNÉ SVAČINY** - přidají se automaticky pro doplnění živin!

KRITICKÉ: Generuj ${numberOfDays} dnů, každý den 3 jídla - snídaně, oběd, večeře - ALE KAŽDÉ JINÉ!

🚨 ČESKÁ DATABÁZE POTRAVIN - POUŽÍVEJ POUZE TYTO INGREDIENCE:
${foodDatabaseText}

⚠️ KRITICKÉ: Používej POUZE ingredience z výše uvedené databáze!
⚠️ KRITICKÉ: Názvy musí být PŘESNĚ jak v databázi!
⚠️ KRITICKÉ: KAŽDÝ DEN MUSÍ MÍT JINÁ JÍDLA NEŽ PŘEDCHOZÍ DNY!

🚨 NEJDŮLEŽITĚJŠÍ: SPLŇ DENNÍ CÍLE!
- Bílkoviny: CÍL ${nutritionTargets.protein}g denně
- Sacharidy: CÍL ${nutritionTargets.carbs}g denně
- Tuky: CÍL ${nutritionTargets.fat}g denně
- Kalorie: CÍL ${nutritionTargets.calories} kcal denně

Generuj DOSTATEČNĚ VELKÉ PORCE pro splnění denních cílů!
Generuj ${numberOfDays} DNŮ místo 3!

Vrátit JSON s touto strukturou:
{
  "days": [
    {
      "day": 1,
      "meals": [
        {
          "name": "Název jídla pro den 1 (JINÉ než předchozí dny!)",
          "type": "snídaně/oběd/večeře",
          "ingredients": [
            {"name": "Ingredience z databáze", "amount": 100, "unit": "g"}
          ],
          "instructions": "Postup přípravy"
        }
      ]
    },
    {
      "day": 2,
      "meals": [
        {
          "name": "Název jídla pro den 2 (JINÉ než předchozí dny!)",
          "type": "snídaně/oběd/večeře",
          "ingredients": [
            {"name": "Ingredience z databáze", "amount": 100, "unit": "g"}
          ],
          "instructions": "Postup přípravy"
        }
      ]
    },
    {
      "day": 3,
      "meals": [
        {
          "name": "Název jídla pro den 3 (JINÉ než předchozí dny!)",
          "type": "snídaně/oběd/večeře",
          "ingredients": [
            {"name": "Ingredience z databáze", "amount": 100, "unit": "g"}
          ],
          "instructions": "Postup přípravy"
        }
      ]
    },
    {
      "day": 4,
      "meals": [
        {
          "name": "Název jídla pro den 4 (JINÉ než předchozí dny!)",
          "type": "snídaně/oběd/večeře",
          "ingredients": [
            {"name": "Ingredience z databáze", "amount": 100, "unit": "g"}
          ],
          "instructions": "Postup přípravy"
        }
      ]
    },
    {
      "day": 5,
      "meals": [
        {
          "name": "Název jídla pro den 5 (JINÉ než předchozí dny!)",
          "type": "snídaně/oběd/večeře",
          "ingredients": [
            {"name": "Ingredience z databáze", "amount": 100, "unit": "g"}
          ],
          "instructions": "Postup přípravy"
        }
      ]
    },
    {
      "day": 6,
      "meals": [
        {
          "name": "Název jídla pro den 6 (JINÉ než předchozí dny!)",
          "type": "snídaně/oběd/večeře",
          "ingredients": [
            {"name": "Ingredience z databáze", "amount": 100, "unit": "g"}
          ],
          "instructions": "Postup přípravy"
        }
      ]
    },
    {
      "day": 7,
      "meals": [
        {
          "name": "Název jídla pro den 7 (JINÉ než předchozí dny!)",
          "type": "snídaně/oběd/večeře",
          "ingredients": [
            {"name": "Ingredience z databáze", "amount": 100, "unit": "g"}
          ],
          "instructions": "Postup přípravy"
        }
      ]
    }
  ]
}

⚠️ DŮLEŽITÉ: NEGENERUJ POLE "nutrition" - živiny se počítají automaticky z ingrediencí!
⚠️ KRITICKÉ: ${numberOfDays} dnů, každý den 3 jídla - snídaně, oběd, večeře!
⚠️ KRITICKÉ: KAŽDÝ DEN = NOVÁ JÍDLA - nikdy neopakuj!
⚠️ KRITICKÉ: Používej POUZE ingredience z databáze výše!
⚠️ KRITICKÉ: Generuj ${numberOfDays} DNŮ místo 3!
`;

  return prompt;
}