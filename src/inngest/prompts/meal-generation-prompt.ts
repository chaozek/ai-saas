export function createMealGenerationPrompt(assessmentData: any, nutritionTargets: any): string {
  const {
    age,
    gender,
    weight,
    height,
    fitnessGoal,
    preferredCuisines,
    dietaryRestrictions,
    allergies,
    activityLevel
  } = assessmentData;

  const cuisineText = preferredCuisines?.length > 0 ? preferredCuisines.join(', ') : 'česká';
  const restrictionsText = dietaryRestrictions?.length > 0 ? dietaryRestrictions.join(', ') : 'žádná';
  const allergiesText = allergies?.length > 0 ? allergies.join(', ') : 'žádné';

  const nutritionInfo = `
CÍLOVÉ NUTRIČNÍ HODNOTY PRO CELÝ DEN:
- Kalorie: ${nutritionTargets.calories} kcal
- Bílkoviny: ${nutritionTargets.protein}g
- Sacharidy: ${nutritionTargets.carbs}g
- Tuky: ${nutritionTargets.fat}g

ROZDĚL ŽIVINY MEZI 3-5 JÍDEL PODLE POTŘEBY.
KAŽDÉ JÍDLO BY MĚLO MÍT 100-800 KCAL.
KAŽDÉ JÍDLO BY MĚLO OBSAHOVAT 20-40G BÍLKOVIN.`;

  const prompt = `
Vytvoř denní jídelníček pro:
- ${gender === 'male' ? 'Muž' : 'Žena'}, ${age} let, ${weight} kg, ${height} cm
- Cíl: ${fitnessGoal.toLowerCase().replace('_', ' ')}
- Kuchyně: ${cuisineText}
- Omezení: ${restrictionsText}
- Alergie: ${allergiesText}
- Úroveň aktivity: ${activityLevel}

${nutritionInfo}

PRAVIDLA:
1. VYGENERUJ 3-5 JÍDEL PRO CELÝ DEN
2. ROZHODNI SI KOLIK JÍDEL - 3-5 jídel podle potřeby
3. KAŽDÉ JÍDLO MUSÍ MÍT INGREDIENCE S MNOŽSTVÍM V GRAMECH
4. CELKOVĚ MUSÍŠ DOSÁHNOUT ${nutritionTargets.protein}g BÍLKOVIN, ${nutritionTargets.calories} kcal
5. NESMÍŠ PŘESÁHNOUT ŽÁDNÝ Z DENNÍCH CÍLŮ - kalorie, bílkoviny, sacharidy, tuky
6. KONTROLA TUKŮ: Používej minimum olejů a tuků - maximálně 1-5g oleje na jídlo, preferuj libové maso
7. POUŽÍVEJ ČESKÉ NÁZVY INGREDIENCÍ - pro kompatibilitu s českou databází!

ROZMANITÉ INGREDIENCE:
- Používej jakékoliv ingredience, které jsou dostupné a chutné
- Buď kreativní s kombinacemi a recepty
- Používej české názvy ingrediencí pro kompatibilitu s českou databází
- Názvy jídel mohou být v češtině

DŮLEŽITÉ PRO ČESKOU DATABÁZI:
- Používej české názvy ingrediencí pro kompatibilitu s českou databází
- Buď specifický s názvy - např. "kuřecí prsa" místo jen "kuřecí"
- Vyhni se obecným názvům - např. "hovězí steak" místo jen "hovězí"
- Názvy jídel mohou být v češtině
- Příklad: "name": "Kuřecí prsa s rýží", "ingredients": [{"name": "kuřecí prsa", "amount": 150}]
- Příklad: "name": "Tofu s quinoou", "ingredients": [{"name": "tofu", "amount": 100}, {"name": "quinoa", "amount": 50}]
- Příklad: "name": "Cizrnový salát", "ingredients": [{"name": "cizrna", "amount": 150}, {"name": "olivový olej", "amount": 10}]

⚠️ KRITICKÉ: Používej české názvy ingrediencí pro kompatibilitu s českou databází!

Vrátit JSON s touto strukturou:
{
  "meals": [
    {
      "name": "Název jídla",
      "type": "snídaně/oběd/večeře/svačina",
      "ingredients": [
        {"name": "Ingredience", "amount": 100, "unit": "g"}
      ],
      "instructions": "Postup přípravy"
    }
  ]
}`;

  return prompt;
}