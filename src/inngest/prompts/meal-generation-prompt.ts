export function createMealGenerationPrompt(params: {
  age: string;
  gender: string;
  weight: string;
  height: string;
  fitnessGoal: string;
  activityLevel: string;
  preferredCuisines: string[];
  dietaryRestrictions: string[];
  allergies: string[];
  mealsPerDay: number;
}) {
  const {
    age,
    gender,
    weight,
    height,
    fitnessGoal,
    activityLevel,
    preferredCuisines,
    dietaryRestrictions,
    allergies,
    mealsPerDay
  } = params;

  // Convert fitness goal to meal planning goal
  const getMealGoal = (fitnessGoal: string) => {
    switch (fitnessGoal) {
      case 'WEIGHT_LOSS': return 'hubnutí';
      case 'MUSCLE_GAIN': return 'nabrání svalové hmoty';
      case 'STRENGTH': return 'nabrání svalové hmoty a síly';
      case 'ENDURANCE': return 'udržení váhy a vytrvalost';
      case 'FLEXIBILITY': return 'udržení váhy a zdraví';
      case 'GENERAL_FITNESS': return 'udržení váhy a celkové zdraví';
      default: return 'udržení váhy';
    }
  };

  // Convert activity level to Czech
  const getActivityLevelCzech = (activityLevel: string) => {
    switch (activityLevel) {
      case 'SEDENTARY': return 'sedavý způsob života';
      case 'LIGHTLY_ACTIVE': return 'lehce aktivní';
      case 'MODERATELY_ACTIVE': return 'středně aktivní';
      case 'VERY_ACTIVE': return 'velmi aktivní';
      case 'EXTREMELY_ACTIVE': return 'extrémně aktivní';
      default: return 'středně aktivní';
    }
  };

  return `Vytvoř denní jídelníček pro:
- ${gender === 'male' ? 'Muž' : gender === 'female' ? 'Žena' : 'Osoba'}, ${age} let, ${weight} kg, ${height} cm
- Cíl: ${getMealGoal(fitnessGoal)}
- Úroveň aktivity: ${getActivityLevelCzech(activityLevel)}
- Preferované kuchyně: ${preferredCuisines.length > 0 ? preferredCuisines.join(', ') : 'žádné preference'}
- Dietní omezení: ${dietaryRestrictions.length > 0 ? dietaryRestrictions.join(', ') : 'žádná'}
- Alergie: ${allergies.length > 0 ? allergies.join(', ') : 'žádné'}
- Počet jídel denně: ${mealsPerDay}

KRITICKÉ PRAVIDLA:
1. Všechna jídla MUSÍ být v češtině
2. Používej pouze ingredience dostupné v českých obchodech
3. Respektuj všechna dietní omezení a alergie
4. Jídla musí být chutná a praktická pro přípravu
5. Zohledni fitness cíl při výběru ingrediencí a porcí

PRO KAŽDÉ JÍDLO UVEĎ:
1. Název jídla (v češtině)
2. Seznam ingrediencí s přesnými množstvími v gramech
3. Nutriční hodnoty (kalorie, bílkoviny, sacharidy, tuky)
4. Doba přípravy v minutách
5. Návod na přípravu (stručný, v češtině)

FORMÁT ODPOVĚDI - POUZE JSON:
{
  "meals": [
    {
      "name": "Název jídla",
      "type": "snídaně|oběd|večeře|svačina",
      "ingredients": [
        {
          "name": "Název ingredience",
          "amount": 100,
          "unit": "g"
        }
      ],
      "nutrition": {
        "calories": 350,
        "protein": 25,
        "carbs": 45,
        "fat": 12,
        "fiber": 8
      },
      "prepTime": 15,
      "instructions": "Stručný návod na přípravu v češtině"
    }
  ],
  "dailyNutrition": {
    "totalCalories": 2000,
    "totalProtein": 150,
    "totalCarbs": 200,
    "totalFat": 70,
    "totalFiber": 30
  }
}

DŮLEŽITÉ:
- Všechny názvy jídel a ingrediencí MUSÍ být v češtině
- Používej pouze reálné ingredience dostupné v českých obchodech
- Respektuj dietní omezení (bezlepková, vegetariánská, veganská, atd.)
- Vyhni se alergenům uvedeným uživatelem
- Jídla musí být vyvážená a odpovídat fitness cíli
- Pro hubnutí: nižší kalorie, více bílkovin a vlákniny
- Pro nabrání: vyšší kalorie, více bílkovin a sacharidů
- Pro udržení: vyvážené makroživiny`;
}