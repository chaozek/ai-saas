import { inngest } from "./client";
import { Agent, openai, createAgent, createTool, createNetwork, Message, createState } from "@inngest/agent-kit";
import { getAssessmentData, generateFitnessPlan } from "./utils";
import z from "zod";
import { FITNESS_ASSESSMENT_PROMPT, PLAN_GENERATION_PROMPT } from "@/prompt";
import { PrismaClient } from "../generated/prisma";
import OpenAI from "openai";

// Helper functions for AI generation
async function generateWorkoutWithAI(
  weekNumber: number,
  dayOfWeek: string,
  fitnessGoal: string,
  experienceLevel: string,
  availableEquipment: string[],
  workoutDuration: number,
  hasInjuries: boolean,
  injuries: string,
  medicalConditions: string,
  age: string,
  gender: string,
  height: string,
  weight: string,
  targetWeight: string,
  activityLevel: string,
  preferredExercises: string
): Promise<{name: string, description: string, exercises: any[]}> {
  const openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    console.log(`Generating workout for ${dayOfWeek}...`);

    const prompt = `Vygeneruj PROFESIONÁLNÍ trénink pro ${dayOfWeek} na základě těchto parametrů:

KRITICKÉ: MUSÍŠ STRICTNĚ respektovat fitness cíl "${fitnessGoal}" a generovat cviky, které jsou SPECIFICKY pro tento cíl. NEPOUŽÍVEJ generické cviky, které neodpovídají cíli!

OSOBNÍ INFORMACE:
- Věk: ${age} let
- Pohlaví: ${gender}
- Výška: ${height} cm
- Aktuální váha: ${weight} kg
- Cílová váha: ${targetWeight || 'není specifikována'} kg

FITNESS CÍLE A ZKUŠENOSTI:
- Fitness cíl: ${fitnessGoal}
- Úroveň aktivity: ${activityLevel}
- Úroveň zkušeností: ${experienceLevel}
- Preferované cviky: ${preferredExercises || 'není specifikováno'}

TECHNICKÉ PARAMETRY:
- Dostupné vybavení: ${availableEquipment.join(', ')}
- Doba trvání tréninku: ${workoutDuration} minut

ZDRAVOTNÍ STAV:
- Má zranění: ${hasInjuries ? 'ANO' : 'NE'}
- Zranění: ${injuries || 'žádná'}
- Zdravotní stav: ${medicalConditions || 'žádný'}

KRITICKÉ: Pokud uživatel NEMÁ žádná zranění nebo zdravotní omezení, POUŽÍVEJ POUZE PROFESIONÁLNÍ CVIKY odpovídající jeho fitness cíli a dostupnému vybavení. NEPOUŽÍVEJ alternativní cviky pro omezení, pokud nejsou potřeba!

KRITICKÉ PRAVIDLA PRO ZDRAVOTNÍ OMEZENÍ:
1. Pokud má uživatel zranění nebo zdravotní omezení, MUSÍŠ je striktně respektovat
2. Pro uživatele na vozíku: NIKDY nedoporučuj cviky na nohy, chůzi, běh, skákání, dřepy, výpady nebo jakékoliv cviky vyžadující použití nohou
3. Pro uživatele s bolestmi zad: NIKDY nedoporučuj mrtvý tah, předklony, těžké zvedání
4. Pro uživatele s bolestmi ramen: NIKDY nedoporučuj shyby, tlaky ramen, bench press
5. Pro uživatele s bolestmi kolen: NIKDY nedoporučuj dřepy, výpady, skákání
6. Pro uživatele s kardiovaskulárními problémy: NIKDY nedoporučuj intenzivní kardio, pouze lehké aerobní cviky
7. Pro diabetiky: NIKDY nedoporučuj dlouhé intenzivní tréninky bez přestávek
8. Pro těhotné: NIKDY nedoporučuj cviky na břicho, ležení na zádech, skákání

DETEKCE ZDRAVOTNÍCH OMEZENÍ:
- Pokud v textu zranění nebo zdravotního stavu vidíš slova jako "vozík", "invalidní", "paraplegie", "tetraplegie", "ochrnutí", "nohy", "nožní" - uživatel je na vozíku
- Pokud vidíš slova jako "záda", "páteř", "hernie", "vyhřezlá ploténka", "ischias" - uživatel má problémy se zády
- Pokud vidíš slova jako "ramena", "rotátor", "impingement", "tendinitida" - uživatel má problémy s rameny
- Pokud vidíš slova jako "kolena", "meniskus", "ACL", "PCL", "artritida" - uživatel má problémy s koleny
- Pokud vidíš slova jako "srdce", "kardiovaskulární", "hypertenze", "arytmie" - uživatel má kardiovaskulární problémy
- Pokud vidíš slova jako "diabetes", "cukrovka" - uživatel má diabetes
- Pokud vidíš slova jako "těhotenství", "těhotná" - uživatelka je těhotná

PRAVIDLA PRO VĚK A POHLAVÍ:
- Pro uživatele 18-25 let: můžeš použít intenzivnější cviky s rychlejší progresí
- Pro uživatele 26-40 let: standardní intenzita s postupnou progresí
- Pro uživatele 41-55 let: mírnější intenzita s opatrnou progresí
- Pro uživatele 56+ let: velmi opatrná intenzita, zaměření na bezpečnost
- Pro ženy: zohledni hormonální cyklus a menší svalovou hmotu
- Pro muže: můžeš použít těžší váhy a intenzivnější cviky
- Pro jiné pohlaví: použij střední intenzitu

Vytvoř progresivní trénink, který STRICTNĚ respektuje VŠECHNY parametry:

1. OSOBNÍ PARAMETRY:
- Přizpůsob cviky věku (mladší = intenzivnější, starší = opatrnější)
- Zohledni pohlaví při výběru cviků a intenzity
- Zohledni aktuální a cílovou váhu pro správnou intenzitu

2. FITNESS CÍLE - PROFESIONÁLNÍ PŘÍSTUP:

- WEIGHT_LOSS (Hubnutí):
  * KRITICKÉ: Kombinace silových cviků a KARDIO aktivit
  * KARDIO: Běh na pásu, jízda na kole, eliptical, rowing, stair climber, HIIT
  * SILOVÉ: Compound cviky s vyššími opakováními (12-20)
  * Supersety a circuit training pro maximální spalování kalorií
  * Kratší přestávky (30-60s) pro udržení vysoké srdeční frekvence
  * Celkový trénink: 60-70% kardio, 30-40% silové cviky
  * Pokud má gym access: stroje na kardio + silové stroje
  * Pokud má home equipment: jumping jacks, burpees, mountain climbers, high knees

- MUSCLE_GAIN (Nabírání svalů):
  * Používej těžké silové cviky s progresivním přetížením
  * 4-6 cviků na hlavní svalové skupiny
  * 3-4 série, 8-12 opakování pro hypertrofii
  * Krátké přestávky (60-90s) pro metabolický stres
  * Compound cviky (bench press, dřepy, mrtvý tah, shyby)
  * Izolované cviky pro detailní rozvoj svalů
  * Pokud má plný přístup do gymu, použij stroje, činky, tyče
  * Minimální kardio (5-10 min warm-up)

- STRENGTH (Síla):
  * Těžké compound cviky s maximálním zatížením
  * 3-5 série, 1-5 opakování pro maximální sílu
  * Dlouhé přestávky (3-5 minut) pro kompletní regeneraci
  * Progresivní přetížení s těžkými váhami
  * Zaměření na: dřepy, mrtvý tah, bench press, shyby, tlaky ramen
  * Pokud má gym access: barbell cviky, power rack, těžké stroje
  * Minimální kardio (5-10 min warm-up)

- ENDURANCE (Vytrvalost):
  * Circuit training, AMRAP, EMOM, Tabata protokoly
  * Funkční cviky s vlastní váhou a lehkými činkami
  * Kratší přestávky (15-45s) pro budování vytrvalosti
  * Více opakování (15-30) s nižší váhou
  * Kombinace silových a kardio cviků v rychlém tempu
  * Pokud má gym access: rowing, cycling, running intervals
  * Pokud má home equipment: burpees, mountain climbers, jumping jacks

- FLEXIBILITY (Flexibilita):
  * Mobilita cviky, dynamický strečink, jóga pozice
  * Dlouhé výdrže (30-60s) v pozicích
  * Pilates cviky pro core strength a flexibilitu
  * Foam rolling a self-myofascial release
  * Pokud má gym access: jóga studio, foam rollers, mobility tools
  * Pokud má home equipment: jóga podložka, foam roller, odporové pásy

- GENERAL_FITNESS (Obecná fitness):
  * Vyvážený mix silových, kardio a flexibility cviků
  * 40% silové cviky, 40% kardio, 20% flexibility
  * Střední intenzita s postupným zvyšováním
  * Různorodé cviky pro celkové zdraví a kondici
  * Pokud má gym access: mix strojů, kardio a mobility
  * Pokud má home equipment: bodyweight cviky, kardio, strečink

3. ÚROVEŇ AKTIVITY A ZKUŠENOSTÍ:
- Sedentární: velmi lehké cviky, postupný nárůst
- Lehce aktivní: mírné cviky s postupným zvyšováním
- Středně aktivní: standardní cviky s dobrou progresí
- Velmi aktivní: náročnější cviky s rychlejší progresí
- Extrémně aktivní: velmi náročné cviky

4. PREFEROVANÉ CVIKY:
- Pokud uživatel uvedl preferované cviky, ZAŘAĎ je do tréninku
- Přizpůsob trénink jejich preferencím

5. TECHNICKÉ PARAMETRY - DOSTUPNÉ VYBAVENÍ:
- POUŽÍVEJ POUZE dostupné vybavení: ${availableEquipment.join(', ')}
- Pokud má "gym_access" nebo "plný přístup do gymu":
  * KARDIO STROJE: běhací pás, rotoped, eliptical, rowing, stair climber, spinning bike
  * SILOVÉ STROJE: leg press, chest press, lat pulldown, shoulder press, leg extension, leg curl
  * VOLNÉ VÁHY: činky (dumbbells), tyče (barbells), kettlebelly
  * FUNKČNÍ: TRX, battle ropes, plyometric box
- Pokud má "home_equipment" nebo "domácí vybavení":
  * KARDIO: jumping jacks, burpees, mountain climbers, high knees, jumping rope
  * SILOVÉ: činky, odporové pásy, kettlebelly, pull-up bar
  * BODYWEIGHT: kliky, dřepy, výpady, plank, dips
- Pokud má "dumbbells", "resistance_bands", "kettlebell":
  * Kombinace volných vah a odporových pásů
  * Funkční cviky s dostupným vybavením
- Pokud má "none" nebo "žádné vybavení":
  * POUZE bodyweight cviky: kliky, dřepy, výpady, plank, burpees
  * KARDIO: jumping jacks, mountain climbers, high knees, jumping rope
- Dodržuj přesnou dobu trvání tréninku: ${workoutDuration} minut
- Obsahuje 4-6 cviků s řádnou progresí

6. ZDRAVOTNÍ OMEZENÍ:
- STRICTNĚ respektuj všechna zdravotní omezení
- NIKDY nedoporučuj cviky, které by mohly zhoršit stav

KRITICKÉ: Musíš odpovědět POUZE platným JSON v tomto přesném formátu. Žádný další text, žádná vysvětlení, žádné markdown formátování:

{
  "name": "Název tréninku",
  "description": "Stručný popis zaměření tréninku a jeho přínosů",
  "exercises": [
    {
      "name": "Název cviku",
      "description": "Stručný popis cviku a správné techniky",
      "category": "strength|cardio|flexibility",
      "muscleGroups": ["chest", "back", "legs", "core", "arms", "shoulders"],
      "equipment": ["dumbbells", "resistance bands", "bodyweight"],
      "difficulty": "BEGINNER|INTERMEDIATE|ADVANCED",
      "sets": 3,
      "reps": 12,
      "duration": null,
      "restTime": 90,
      "weight": 10.0
    }
  ]
}

DŮLEŽITÉ: VŠECHNY NÁZVY CVIKŮ MUSÍ BÝT V ČEŠTINĚ. Použij POUZE české názvy cviků:

PROFESIONÁLNÍ CVIKY - SMĚRNICE:

POUŽÍVEJ JAKÉKOLI PROFESIONÁLNÍ CVIKY, které odpovídají:
1. FITNESS CÍLI uživatele
2. DOSTUPNÉMU VYBAVENÍ
3. ÚROVNI ZKUŠENOSTÍ
4. ČASOVÉMU LIMITU

PŘÍKLADY PROFESIONÁLNÍCH CVIKŮ PODLE FITNESS CÍLE:

WEIGHT_LOSS - KARDIO A SPALOVÁNÍ:
- KARDIO: Běh na pásu, jízda na kole, eliptical, rowing, stair climber, HIIT, jumping jacks, burpees
- SILOVÉ: Compound cviky s vyššími opakováními (bench press, dřepy, shyby, výpady)

MUSCLE_GAIN - SILOVÉ CVIKY:
- COMPOUND: Dřepy, mrtvý tah, bench press, shyby, tlaky ramen, přítahy, clean & jerk
- IZOLOVANÉ: Bicepsové curl, tricepsové extenze, leg press, lat pulldown, chest press, shoulder press

STRENGTH - MAXIMÁLNÍ SÍLA:
- TĚŽKÉ COMPOUND: Dřepy, mrtvý tah, bench press, shyby, tlaky ramen, power clean
- POMOCNÉ: Good mornings, Romanian deadlifts, pause squats

ENDURANCE - VYTRVALOST:
- FUNKČNÍ: Výpady, kliky, dips, burpee, mountain climbers, kettlebell swings
- KARDIO: Rowing intervals, cycling sprints, running intervals

FLEXIBILITY - MOBILITA:
- MOBILITA: Dynamic stretching, foam rolling, yoga poses, mobility drills
- PILATES: Core exercises, flexibility work, balance training

GENERAL_FITNESS - VYVÁŽENÝ MIX:
- Kombinace všech typů cviků podle dostupného vybavení
- Postupné zvyšování intenzity a složitosti

DŮLEŽITÉ: Vyber cviky na základě parametrů uživatele, ne na základě předem daného seznamu!

KARDIO CVIKY (pouze pokud nejsou vyloučeny zdravotním stavem):
- Skákání přes švihadlo (místo Jump Rope) - POUZE pokud nemá problémy s nohama nebo kardiovaskulárními problémy
- Burpee (místo Burpee) - POUZE pokud nemá problémy s nohama, zády nebo kardiovaskulárními problémy
- Skákací dřepy (místo Jump Squats) - POUZE pokud nemá problémy s nohama nebo koleny
- Mountain climbers (místo Mountain Climbers) - POUZE pokud nemá problémy s nohama nebo zády
- Skákání na místě (místo Jumping Jacks) - POUZE pokud nemá problémy s nohama nebo kardiovaskulárními problémy

CORE CVIKY (pouze pokud nejsou vyloučeny zdravotním stavem):
- Plank (místo Plank) - POUZE pokud nemá problémy se zády
- Prkno na boku (místo Side Plank) - POUZE pokud nemá problémy se zády
- Ruské twisty (místo Russian Twists) - POUZE pokud nemá problémy se zády nebo břichem
- Crunchy (místo Crunches) - POUZE pokud nemá problémy se zády nebo břichem
- Nůžky (místo Scissors) - POUZE pokud nemá problémy s nohama

ALTERNATIVNÍ CVIKY PRO OMEZENÍ:
- Pro uživatele na vozíku: cviky na ruce, ramena, hrudník, záda (sedící pozice)
  * Bicepsové curl s činkami (sedící)
  * Tricepsové extenze s činkami (sedící)
  * Tlaky ramen s činkami (sedící)
  * Přítahy s odporovými gumami (sedící)
  * Rotace trupu (sedící)
  * Stlačování míče mezi koleny (pokud je to možné)
- Pro uživatele s bolestmi zad: cviky na ruce, ramena, hrudník (stojící nebo sedící)
  * Bicepsové curl s činkami
  * Tricepsové extenze s činkami
  * Tlaky ramen s činkami
  * Přítahy s odporovými gumami
  * Rotace ramen
  * Stlačování míče mezi rukama
- Pro uživatele s bolestmi ramen: cviky na nohy, core, kardio bez rukou
  * Dřepy (pokud nemá problémy s nohama)
  * Výpady (pokud nemá problémy s nohama)
  * Plank (pokud nemá problémy se zády)
  * Ruské twisty (pokud nemá problémy se zády)
  * Chůze na místě
  * Lehké aerobní cviky
- Pro uživatele s bolestmi kolen: cviky na ruce, ramena, hrudník, záda, core (bez nohou)
  * Bicepsové curl s činkami
  * Tricepsové extenze s činkami
  * Tlaky ramen s činkami
  * Přítahy s odporovými gumami
  * Plank (pokud nemá problémy se zády)
  * Ruské twisty (pokud nemá problémy se zády)

PREFEROVANÉ CVIKY:
- Pokud uživatel uvedl preferované cviky, MUSÍŠ je zařadit do tréninku
- Přizpůsob trénink jejich preferencím
- Kombinuj preferované cviky s dalšími cviky pro vyvážený trénink

NEPOUŽÍVEJ žádné anglické názvy cviků! VŠECHNY názvy musí být v češtině.

Pro silové cviky použij série a opakování. Pro kardio/flexibilitu použij dobu trvání v sekundách.
KRITICKÉ: Použij POUZE tyto přesné hodnoty obtížnosti s VELKÝMI písmeny: "BEGINNER", "INTERMEDIATE", "ADVANCED".
NEPOUŽÍVEJ malá písmena ani žádné jiné variace.
Pro pole weight použij POUZE čísla (např. 5.0, 10.0, 20.0) nebo null. NEPOUŽÍVEJ řetězce jako "light", "medium", "heavy".
Zajisti, že cviky jsou bezpečné a vhodné pro úroveň zkušeností a ZDRAVOTNÍ STAV.`;

          const completion = await openaiClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
                          {
          role: "system",
          content: "Jsi PROFESIONÁLNÍ fitness trenér s certifikací a zkušenostmi v posilovně. MUSÍŠ odpovědět POUZE platným JSON v požadovaném formátu. Nezahrnuj žádný další text, vysvětlení nebo markdown formátování mimo JSON objekt. KRITICKÉ: VŠECHNY NÁZVY CVIKŮ MUSÍ BÝT V ČEŠTINĚ. NEJDŮLEŽITĚJŠÍ: STRICTNĚ respektuj fitness cíl uživatele a generuj cviky SPECIFICKY pro tento cíl. WEIGHT_LOSS = kardio + silové cviky s vyššími opakováními, MUSCLE_GAIN = těžké silové cviky, STRENGTH = maximální síla s těžkými váhami, ENDURANCE = vytrvalostní cviky, FLEXIBILITY = mobilita a strečink, GENERAL_FITNESS = vyvážený mix. Vyber cviky na základě parametrů uživatele (fitness cíl, vybavení, zkušenosti), ne na základě předem daného seznamu. Pokud uživatel NEMÁ zdravotní omezení, POUŽÍVEJ PROFESIONÁLNÍ CVIKY odpovídající jeho cíli. MÁŠ VOLNOST ve výběru cviků, ale MUSÍŠ respektovat parametry uživatele. Pokud má uživatel zranění, NIKDY nedoporučuj cviky, které by mohly zhoršit jejich stav."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.5, // Lower temperature for more consistent output
      max_tokens: 1000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      console.error(`No content received from OpenAI`);
      throw new Error(`No content received from OpenAI`);
    }

    console.log(`Raw AI response:`, content);

    // Try to extract JSON from the response
    let jsonContent = content.trim();

    // Remove any markdown formatting
    jsonContent = jsonContent.replace(/```json\s*/g, '').replace(/```\s*$/g, '');

    // Find JSON object in the response
    const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonContent = jsonMatch[0];
    }

    console.log(`Extracted JSON:`, jsonContent);

    try {
      const workout = JSON.parse(jsonContent);

      // Validate the workout structure
      if (!workout.name || !workout.description || !Array.isArray(workout.exercises)) {
        throw new Error(`Invalid workout structure from AI. Expected: name, description, and exercises array. Got: ${JSON.stringify(workout)}`);
      }

      if (workout.exercises.length === 0) {
        throw new Error(`AI returned empty exercises array for workout. Expected at least 4-6 exercises.`);
      }

      // Validate difficulty values in exercises
      const validatedExercises = workout.exercises.map((exercise: any) => {
        if (!exercise.name || !exercise.description || !exercise.category) {
          throw new Error(`Invalid exercise structure. Expected: name, description, category. Got: ${JSON.stringify(exercise)}`);
        }

        if (exercise.difficulty) {
          const difficultyUpper = exercise.difficulty.toUpperCase();
          if (difficultyUpper === 'BEGINNER' || difficultyUpper === 'INTERMEDIATE' || difficultyUpper === 'ADVANCED') {
            exercise.difficulty = difficultyUpper;
          } else {
            throw new Error(`Invalid difficulty value: "${exercise.difficulty}" for exercise "${exercise.name}". Expected: BEGINNER, INTERMEDIATE, or ADVANCED.`);
          }
        } else {
          throw new Error(`Missing difficulty value for exercise "${exercise.name}". AI must provide difficulty for all exercises.`);
        }

        // Validate and convert weight to number or null
        if (exercise.weight !== null && exercise.weight !== undefined) {
          if (typeof exercise.weight === 'string') {
            // Convert string weight descriptions to numbers
            const weightLower = exercise.weight.toLowerCase();
            if (weightLower === 'light' || weightLower === 'lightweight') {
              exercise.weight = 5.0; // 5kg/10lbs
            } else if (weightLower === 'medium' || weightLower === 'moderate') {
              exercise.weight = 10.0; // 10kg/20lbs
            } else if (weightLower === 'heavy' || weightLower === 'heavyweight') {
              exercise.weight = 20.0; // 20kg/40lbs
            } else {
              // Try to parse as number
              const parsedWeight = parseFloat(exercise.weight);
              if (isNaN(parsedWeight)) {
                console.warn(`Invalid weight value "${exercise.weight}" for exercise "${exercise.name}". Setting to null.`);
                exercise.weight = null;
              } else {
                exercise.weight = parsedWeight;
              }
            }
          } else if (typeof exercise.weight === 'number') {
            // Weight is already a number, keep it
          } else {
            console.warn(`Invalid weight type for exercise "${exercise.name}". Setting to null.`);
            exercise.weight = null;
          }
        } else {
          exercise.weight = null;
        }

        return exercise;
      });

      console.log(`Successfully generated workout: ${workout.name}`);
      return {
        name: workout.name,
        description: workout.description,
        exercises: validatedExercises
      };
    } catch (jsonError) {
      console.error(`JSON parsing error:`, jsonError);
      console.error(`Raw AI response:`, content);

      throw new Error(`Failed to parse JSON after 3 attempts for ${dayOfWeek}. Last error: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}. Raw response: ${content.substring(0, 200)}...`);
    }
  } catch (error) {
    console.error(`Error generating workout with OpenAI:`, error);

    throw new Error(`Failed to generate workout for ${dayOfWeek} after 3 attempts. Last error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function generateMealWithAI(day: number, mealType: string, fitnessGoal: string, dietaryRestrictions: string[], preferredCuisines: string[], cookingSkill: string, calories: number, protein: number, carbs: number, fat: number, budgetPerWeek: number, dailyPrepTime: number): Promise<{name: string, description: string, calories: number, protein: number, carbs: number, fat: number, instructions: string, ingredients: any[], prepTime: number, cookTime: number}> {
  const openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    console.log(`Generating meal for ${mealType}...`);

    // Determine if we should generate natural nutrition values or use provided targets
    const useNaturalValues = calories === 0 && protein === 0 && carbs === 0 && fat === 0;

    let nutritionGuidance = '';
    if (useNaturalValues) {
      nutritionGuidance = `Vytvoř jídlo s přirozenými a realistickými výživovými hodnotami vhodnými pro ${mealType.toLowerCase()}. Použij standardní porce a přirozené poměry živin.`;
    } else {
      nutritionGuidance = `Cílová výživa: ${calories} kalorií, ${protein}g bílkovin, ${carbs}g sacharidů, ${fat}g tuků`;
    }

    // Calculate time constraints for this meal type
    const maxTotalTimePerMeal = Math.floor(dailyPrepTime / 3); // Divide daily time by 3 meals
    const maxCookTimePerMeal = Math.floor(maxTotalTimePerMeal * 0.7); // 70% of total time for cooking
    const maxPrepTimePerMeal = Math.floor(maxTotalTimePerMeal * 0.3); // 30% of total time for prep

    // Calculate budget constraints
    const dailyBudget = budgetPerWeek / 7;
    const maxMealBudget = dailyBudget / 3; // Divide daily budget by 3 meals

    // Calculate calorie distribution based on meal type
    let caloriePercentage = 0.33; // Default equal distribution
    let mealTypeGuidance = '';

    switch (mealType) {
      case 'BREAKFAST':
        caloriePercentage = 0.25; // 25% of daily calories
        mealTypeGuidance = 'SNÍDANĚ (25% denních kalorií): Lehké, výživné jídlo na start dne. Zaměř se na komplexní sacharidy a bílkoviny.';
        break;
      case 'LUNCH':
        caloriePercentage = 0.40; // 40% of daily calories
        mealTypeGuidance = 'OBĚD (40% denních kalorií): Hlavní jídlo dne s vyváženým poměrem všech živin.';
        break;
      case 'DINNER':
        caloriePercentage = 0.35; // 35% of daily calories
        mealTypeGuidance = 'VEČEŘE (35% denních kalorií): Lehčí jídlo než oběd, zaměř se na bílkoviny a zeleninu. Vyhni se těžkým jídlům a velkým porcím.';
        break;
    }

    const prompt = `Vygeneruj jídlo pro ${mealType.toLowerCase()} s těmito požadavky:
- Fitness cíl: ${fitnessGoal}
- Stravovací omezení: ${dietaryRestrictions.join(', ') || 'žádná'}
- Preferované kuchyně: ${preferredCuisines.join(', ')}
- Kuchařské dovednosti: ${cookingSkill}
- Maximální čas na přípravu: ${maxPrepTimePerMeal} minut
- Maximální čas na vaření: ${maxCookTimePerMeal} minut
- Maximální rozpočet na jídlo: ${maxMealBudget.toFixed(0)} Kč
- ${mealTypeGuidance}
- ${nutritionGuidance}

Vytvoř chutné, výživné jídlo, které:
- Podporuje fitness cíl (hubnutí = méně kalorií, nabírání svalů = více bílkovin, atd.)
- Respektuje stravovací omezení
- Používá preferované kuchyně, když je to možné
- Je vhodné pro úroveň kuchařských dovedností
- Respektuje časové omezení (max ${maxPrepTimePerMeal} min příprava + ${maxCookTimePerMeal} min vaření)
- Respektuje rozpočet (max ${maxMealBudget.toFixed(0)} Kč na jídlo)
- Respektuje správné rozložení kalorií během dne (${mealType} = ${(caloriePercentage * 100).toFixed(0)}% denních kalorií)
${useNaturalValues ? '- Má přirozené a realistické výživové hodnoty odpovídající typu jídla' : '- Splňuje cílové výživové hodnoty'}
- Je praktické a proveditelné

KRITICKÉ: Musíš odpovědět POUZE platným JSON v tomto přesném formátu. Žádný další text, žádná vysvětlení, žádné markdown formátování:

{
  "name": "Kreativní název jídla",
  "description": "Stručný popis jídla a jeho přínosů",
  "calories": ${useNaturalValues ? 'realistické množství pro ' + mealType.toLowerCase() : calories},
  "protein": ${useNaturalValues ? 'realistické množství pro ' + mealType.toLowerCase() : protein},
  "carbs": ${useNaturalValues ? 'realistické množství pro ' + mealType.toLowerCase() : carbs},
  "fat": ${useNaturalValues ? 'realistické množství pro ' + mealType.toLowerCase() : fat},
  "prepTime": ${maxPrepTimePerMeal},
  "cookTime": ${maxCookTimePerMeal},
  "instructions": "1. Krok první\\n2. Krok druhý\\n3. Krok třetí\\n4. Krok čtvrtý\\n5. Krok pátý",
  "ingredients": [
    {"name": "Název ingredience", "amount": "200", "unit": "g", "estimatedCost": "50"},
    {"name": "Další ingredience", "amount": "30", "unit": "ml", "estimatedCost": "20"}
  ]
}

Zahrň 4-8 ingrediencí s realistickými množstvími v evropských jednotkách (gramy, mililitry, kusy) a odhadovanými náklady v Kč. Použij levné, dostupné ingredience, které respektují rozpočet. POUŽÍVEJ POUZE EVROPSKÉ JEDNOTKY - žádné cups, tablespoons, ounces atd.`;

    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
                  {
          role: "system",
          content: "Jsi profesionální výživový poradce a kuchař. MUSÍŠ odpovědět POUZE platným JSON v požadovaném formátu. Nezahrnuj žádný další text, vysvětlení nebo markdown formátování mimo JSON objekt. POUŽÍVEJ POUZE EVROPSKÉ JEDNOTKY - gramy, mililitry, kusy, žádné cups, tablespoons, ounces. KRITICKÉ: VŽDY respektuj časové omezení, rozpočet a správné rozložení kalorií během dne. Snídaně = 25%, Oběd = 40%, Večeře = 35% denních kalorií. Večeře musí být lehčí než oběd. Používej levné, dostupné ingredience a jednoduché recepty, které se dají připravit v daném čase."
        },
          { role: "user", content: prompt }
        ],
        temperature: 0.5, // Lower temperature for more consistent output
        max_tokens: 1000,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        console.error(`No content received from OpenAI`);
        throw new Error(`No content received from OpenAI`);
      }

      console.log(`Raw AI response:`, content);

      // Try to extract JSON from the response
      let jsonContent = content.trim();

      // Remove any markdown formatting
      jsonContent = jsonContent.replace(/```json\s*/g, '').replace(/```\s*$/g, '');

      // Find JSON object in the response
      const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonContent = jsonMatch[0];
      }

      console.log(`Extracted JSON:`, jsonContent);

      try {
        const meal = JSON.parse(jsonContent);

        // Validate the meal structure
        if (!meal.name || !meal.description || !meal.calories || !meal.protein || !meal.carbs || !meal.fat || !meal.instructions || !Array.isArray(meal.ingredients)) {
          throw new Error(`Invalid meal structure from AI. Expected: name, description, calories, protein, carbs, fat, instructions, and ingredients array. Got: ${JSON.stringify(meal)}`);
        }

        if (meal.ingredients.length === 0) {
          throw new Error(`AI returned empty ingredients array for meal. Expected at least 4-8 ingredients.`);
        }

        // Validate each ingredient
        meal.ingredients.forEach((ingredient: any, index: number) => {
          if (!ingredient.name || !ingredient.amount || !ingredient.unit) {
            throw new Error(`Invalid ingredient structure at index ${index}. Expected: name, amount, unit. Got: ${JSON.stringify(ingredient)}`);
          }
        });

        console.log(`Successfully generated meal: ${meal.name}`);
        return {
          name: meal.name,
          description: meal.description,
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fat: meal.fat,
          instructions: meal.instructions,
          ingredients: meal.ingredients,
          prepTime: meal.prepTime || maxPrepTimePerMeal,
          cookTime: meal.cookTime || maxCookTimePerMeal
        };
      } catch (jsonError) {
        console.error(`JSON parsing error:`, jsonError);
        console.error(`Raw AI response:`, content);

        throw new Error(`Failed to parse JSON after 3 attempts for ${mealType}. Last error: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}. Raw response: ${content.substring(0, 200)}...`);
      }
    } catch (error) {
      console.error(`Error generating meal with OpenAI:`, error);

      throw new Error(`Failed to generate meal for ${mealType} after 3 attempts. Last error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

// Helper function to generate personalized nutrition requirements using AI
async function generateNutritionRequirementsWithAI(
  age: string,
  gender: string,
  height: string,
  weight: string,
  targetWeight: string,
  fitnessGoal: string,
  activityLevel: string,
  experienceLevel: string,
  hasInjuries: boolean,
  injuries: string,
  medicalConditions: string
): Promise<{caloriesPerDay: number, proteinPerDay: number, carbsPerDay: number, fatPerDay: number}> {
  const openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    console.log(`Generating personalized nutrition requirements...`);

    const prompt = `Vypočítej personalizované denní potřeby živin na základě těchto parametrů:

OSOBNÍ INFORMACE:
- Věk: ${age} let
- Pohlaví: ${gender}
- Výška: ${height} cm
- Aktuální váha: ${weight} kg
- Cílová váha: ${targetWeight || 'není specifikována'} kg

FITNESS CÍLE A AKTIVITA:
- Fitness cíl: ${fitnessGoal}
- Úroveň aktivity: ${activityLevel}
- Úroveň zkušeností: ${experienceLevel}

ZDRAVOTNÍ STAV:
- Má zranění: ${hasInjuries ? 'ANO' : 'NE'}
- Zranění: ${injuries || 'žádná'}
- Zdravotní stav: ${medicalConditions || 'žádný'}

VYPOČÍTEJ přesné denní potřeby živin pomocí vědeckých vzorců:

1. BAZÁLNÍ METABOLISMUS (BMR):
- Pro muže: BMR = 88.362 + (13.397 × váha v kg) + (4.799 × výška v cm) - (5.677 × věk)
- Pro ženy: BMR = 447.593 + (9.247 × váha v kg) + (3.098 × výška v cm) - (4.330 × věk)

2. CELKOVÝ DENNÍ VÝDEJ ENERGIE (TDEE):
- Sedentární: BMR × 1.2
- Lehce aktivní: BMR × 1.375
- Středně aktivní: BMR × 1.55
- Velmi aktivní: BMR × 1.725
- Extrémně aktivní: BMR × 1.9

3. ÚPRAVA PODLE FITNESS CÍLE:
- Hubnutí: TDEE - 300 až 500 kalorií (mírný deficit)
- Nabírání svalů: TDEE + 200 až 400 kalorií (mírný surplus)
- Endurance: TDEE + 100 až 200 kalorií
- Síla: TDEE + 150 až 300 kalorií
- Flexibilita: TDEE (udržení váhy)
- Obecná fitness: TDEE (udržení váhy)

4. ROZDĚLENÍ MAKROŽIVIN:
- Bílkoviny: 1.6-2.2g na kg tělesné váhy (vyšší pro nabírání svalů)
- Tuky: 20-35% z celkových kalorií
- Sacharidy: zbytek kalorií

5. ÚPRAVY PRO ZDRAVOTNÍ STAV:
- Pro diabetiky: nižší sacharidy, vyšší bílkoviny
- Pro kardiovaskulární problémy: nižší tuky, vyšší bílkoviny
- Pro těhotné: +300 kalorií, vyšší bílkoviny

KRITICKÉ: Musíš odpovědět POUZE platným JSON v tomto přesném formátu. Žádný další text, žádná vysvětlení, žádné markdown formátování:

{
  "caloriesPerDay": 2000,
  "proteinPerDay": 120.5,
  "carbsPerDay": 200.0,
  "fatPerDay": 66.7
}

Použij přesné výpočty a zaokrouhli na 1 desetinné místo pro bílkoviny, sacharidy a tuky. Kalorie zaokrouhli na celé číslo.`;

    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Jsi profesionální výživový poradce a sportovní dietolog. MUSÍŠ odpovědět POUZE platným JSON v požadovaném formátu. Nezahrnuj žádný další text, vysvětlení nebo markdown formátování mimo JSON objekt. Používej přesné vědecké vzorce pro výpočet BMR, TDEE a makroživin. Vždy zaokrouhli kalorie na celé číslo a makroživiny na 1 desetinné místo."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.3, // Low temperature for consistent calculations
      max_tokens: 500,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      console.error(`No content received from OpenAI`);
      throw new Error(`No content received from OpenAI`);
    }

    console.log(`Raw AI nutrition response:`, content);

    // Try to extract JSON from the response
    let jsonContent = content.trim();

    // Remove any markdown formatting
    jsonContent = jsonContent.replace(/```json\s*/g, '').replace(/```\s*$/g, '');

    // Find JSON object in the response
    const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonContent = jsonMatch[0];
    }

    console.log(`Extracted nutrition JSON:`, jsonContent);

    try {
      const nutrition = JSON.parse(jsonContent);

      // Validate the nutrition structure
      if (!nutrition.caloriesPerDay || !nutrition.proteinPerDay || !nutrition.carbsPerDay || !nutrition.fatPerDay) {
        throw new Error(`Invalid nutrition structure from AI. Expected: caloriesPerDay, proteinPerDay, carbsPerDay, fatPerDay. Got: ${JSON.stringify(nutrition)}`);
      }

      // Validate reasonable ranges
      if (nutrition.caloriesPerDay < 1200 || nutrition.caloriesPerDay > 5000) {
        throw new Error(`Invalid calories value: ${nutrition.caloriesPerDay}. Expected between 1200-5000.`);
      }

      if (nutrition.proteinPerDay < 50 || nutrition.proteinPerDay > 300) {
        throw new Error(`Invalid protein value: ${nutrition.proteinPerDay}. Expected between 50-300g.`);
      }

      if (nutrition.carbsPerDay < 50 || nutrition.carbsPerDay > 600) {
        throw new Error(`Invalid carbs value: ${nutrition.carbsPerDay}. Expected between 50-600g.`);
      }

      if (nutrition.fatPerDay < 30 || nutrition.fatPerDay > 150) {
        throw new Error(`Invalid fat value: ${nutrition.fatPerDay}. Expected between 30-150g.`);
      }

      console.log(`Successfully generated nutrition requirements:`, nutrition);
      return {
        caloriesPerDay: Math.round(nutrition.caloriesPerDay),
        proteinPerDay: Math.round(nutrition.proteinPerDay * 10) / 10,
        carbsPerDay: Math.round(nutrition.carbsPerDay * 10) / 10,
        fatPerDay: Math.round(nutrition.fatPerDay * 10) / 10
      };
    } catch (jsonError) {
      console.error(`JSON parsing error for nutrition:`, jsonError);
      console.error(`Raw AI response:`, content);

      throw new Error(`Failed to parse nutrition JSON. Last error: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}. Raw response: ${content.substring(0, 200)}...`);
    }
  } catch (error) {
    console.error(`Error generating nutrition requirements with OpenAI:`, error);

    throw new Error(`Failed to generate nutrition requirements. Last error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

type GenerateFitnessPlanEvent = {
  name: "generate-fitness-plan/run";
  data: {
    assessmentData: any;
    userId: string;
    workoutPlanId: string;
  };
};

export const generateFitnessPlanFunction = inngest.createFunction(
  { id: "generate-fitness-plan" },
  { event: "generate-fitness-plan/run" },
  async ({ event, step }: { event: GenerateFitnessPlanEvent, step: any }) => {
    const prisma = new PrismaClient();
    const { assessmentData, userId, workoutPlanId } = event.data;

    console.log("Starting fitness plan generation for user:", userId);
    console.log("Assessment data:", assessmentData);
    console.log("Using existing workout plan ID:", workoutPlanId);

    try {

      // Ensure user exists in database
      await step.run("ensure-user-exists", async () => {
        const existingUser = await prisma.user.findUnique({
          where: { id: userId }
        });

        if (!existingUser) {
          console.log("Creating user in database:", userId);
          await prisma.user.create({
            data: { id: userId }
          });
        } else {
          console.log("User already exists in database:", userId);
        }
      });

      // Get the existing fitness profile and workout plan
      const fitnessProfile = await step.run("get-fitness-profile", async () => {
        const profile = await prisma.fitnessProfile.findUnique({
          where: { userId },
          include: {
            currentPlan: true
          }
        });

        if (!profile) {
          throw new Error("Fitness profile not found");
        }

        console.log("Found fitness profile:", profile.id);
        return profile;
      });

      // Get the existing workout plan
      const workoutPlan = await step.run("get-workout-plan", async () => {
        const plan = await prisma.workoutPlan.findUnique({
          where: { id: workoutPlanId }
        });

        if (!plan) {
          throw new Error("Workout plan not found");
        }

        console.log("Using existing workout plan:", plan.id);
        return plan;
      });

      // Generate workout plan details using AI
      const planData = await step.run("generate-workout-plan-details", async () => {
        // Use direct OpenAI call instead of createAgent to avoid nested step tooling
        const openaiClient = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });

        const assessmentPrompt = `
          Fitness Assessment Data:
          - Age: ${assessmentData.age}
          - Gender: ${assessmentData.gender}
          - Height: ${assessmentData.height} cm
          - Weight: ${assessmentData.weight} kg
          - Target Weight: ${assessmentData.targetWeight || 'Not specified'} kg
          - Fitness Goal: ${assessmentData.fitnessGoal}
          - Activity Level: ${assessmentData.activityLevel}
          - Experience Level: ${assessmentData.experienceLevel}
          - Has Injuries: ${assessmentData.hasInjuries}
          - Injuries: ${assessmentData.injuries || 'None'}
          - Medical Conditions: ${assessmentData.medicalConditions || 'None'}
          - Available Days: ${assessmentData.availableDays.join(', ')}
          - Workout Duration: ${assessmentData.workoutDuration} minutes
          - Preferred Exercises: ${assessmentData.preferredExercises || 'None specified'}
          - Available Equipment: ${assessmentData.equipment.join(', ')}

          DŮLEŽITÉ: Vygeneruj pouze přehledový popis 8-týdenního tréninkového plánu. NEGENERUJ konkrétní cviky, série, opakování nebo technické detaily - ty se generují automaticky pro každý trénink zvlášť. Zaměř se na:
          - Obecný přehled plánu a jeho cíle
          - Vysvětlení postupu během 8 týdnů
          - Jak plán podporuje jejich fitness cíle
          - Obecné tipy pro úspěch a bezpečnost
          - Motivující závěr
        `;

        const completion = await openaiClient.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: PLAN_GENERATION_PROMPT },
            { role: "user", content: assessmentPrompt }
          ],
          temperature: 0.7,
        });

        const planContent = completion.choices[0]?.message?.content || "Plan generation failed";

        // Generate Czech plan name based on fitness goal
        const getCzechPlanName = (fitnessGoal: string) => {
          switch (fitnessGoal) {
            case 'WEIGHT_LOSS': return 'Plán na hubnutí';
            case 'MUSCLE_GAIN': return 'Plán na nabírání svalů';
            case 'ENDURANCE': return 'Plán na vytrvalost';
            case 'STRENGTH': return 'Plán na sílu';
            case 'FLEXIBILITY': return 'Plán na flexibilitu';
            case 'GENERAL_FITNESS': return 'Obecný fitness plán';
            default: return 'Personalizovaný fitness plán';
          }
        };

        const getCzechExperienceLevel = (level: string) => {
          switch (level) {
            case 'BEGINNER': return 'začátečník';
            case 'INTERMEDIATE': return 'střední';
            case 'ADVANCED': return 'pokročilý';
            default: return 'začátečník';
          }
        };

        // Update the existing workout plan with Czech names and plan content
        const updatedWorkoutPlan = await prisma.workoutPlan.update({
          where: { id: workoutPlan.id },
          data: {
            name: getCzechPlanName(assessmentData.fitnessGoal),
            description: `Personalizovaný ${getCzechPlanName(assessmentData.fitnessGoal).toLowerCase()} navržený pro ${getCzechExperienceLevel(assessmentData.experienceLevel)} úroveň`,
            planContent: planContent,
          },
        });

        return {
          name: updatedWorkoutPlan.name,
          description: updatedWorkoutPlan.description,
          duration: 8,
          difficulty: assessmentData.experienceLevel,
          planContent: updatedWorkoutPlan.planContent,
        };
      });

      // Generate workouts for each week using AI (optimized to reduce API calls)
      await step.run("generate-workouts", async () => {
        const availableDays = assessmentData.availableDays;
        const workoutDuration = parseInt(assessmentData.workoutDuration);
        const workoutPromises: Promise<any>[] = [];

        // Generate workout templates for each day (only once, not per week)
        const workoutTemplates: { [day: string]: any } = {};

        console.log(`Generating ${availableDays.length} workout templates for days: ${availableDays.join(', ')}`);

        for (let dayIndex = 0; dayIndex < availableDays.length; dayIndex++) {
          const day = availableDays[dayIndex];

          // Generate workout template using AI (only once per day)
          const aiWorkout = await generateWorkoutWithAI(
            1, // Use week 1 as template
            day,
            assessmentData.fitnessGoal,
            assessmentData.experienceLevel,
            assessmentData.equipment,
            workoutDuration,
            assessmentData.hasInjuries,
            assessmentData.injuries,
            assessmentData.medicalConditions,
            assessmentData.age,
            assessmentData.gender,
            assessmentData.height,
            assessmentData.weight,
            assessmentData.targetWeight,
            assessmentData.activityLevel,
            assessmentData.preferredExercises
          );

          workoutTemplates[day] = aiWorkout;
          console.log(`Generated template for ${day}: ${aiWorkout.name}`);
        }

        // Create workouts for each week using the templates
        for (let week = 1; week <= 8; week++) {
          for (let dayIndex = 0; dayIndex < availableDays.length; dayIndex++) {
            const day = availableDays[dayIndex];
            const dayIndexNum = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(day);
            const template = workoutTemplates[day];

            // Create workout promise using template
            const workoutPromise = prisma.workout.create({
              data: {
                name: `Week ${week} - ${template.name}`,
                description: template.description,
                dayOfWeek: dayIndexNum,
                weekNumber: week,
                duration: workoutDuration,
                workoutPlanId: workoutPlan.id,
                exercises: {
                  create: template.exercises.map((exercise: any) => {
                    // Map difficulty string to ExperienceLevel enum
                    let difficulty: string;
                    if (exercise.difficulty) {
                      const difficultyUpper = exercise.difficulty.toUpperCase();
                      if (difficultyUpper === 'BEGINNER' || difficultyUpper === 'INTERMEDIATE' || difficultyUpper === 'ADVANCED') {
                        difficulty = difficultyUpper;
                      } else {
                        throw new Error(`Invalid difficulty value: "${difficultyUpper}" for exercise "${exercise.name}". Expected: BEGINNER, INTERMEDIATE, or ADVANCED.`);
                      }
                    } else {
                      throw new Error(`Missing difficulty value for exercise "${exercise.name}". AI must provide difficulty for all exercises.`);
                    }

                    const exerciseData = {
                      name: exercise.name,
                      description: exercise.description,
                      category: exercise.category,
                      muscleGroups: exercise.muscleGroups || [],
                      equipment: exercise.equipment || [],
                      difficulty: difficulty,
                      sets: exercise.sets || null,
                      reps: exercise.reps || null,
                      duration: exercise.duration || null,
                      restTime: exercise.restTime || null,
                      weight: exercise.weight || null,
                    };

                    return exerciseData;
                  }),
                },
              },
            });

            workoutPromises.push(workoutPromise);
          }
        }

        // Wait for all workouts to be created
        const createdWorkouts = await Promise.all(workoutPromises);
        console.log(`Created ${createdWorkouts.length} workouts using ${availableDays.length} AI-generated templates for plan ${workoutPlan.id}`);

        // Verify workouts were created
        const workoutCount = await prisma.workout.count({
          where: { workoutPlanId: workoutPlan.id }
        });
        console.log(`Total workouts in database for plan ${workoutPlan.id}: ${workoutCount}`);
      });

      // Calculate nutrition requirements using scientific formulas
      const nutritionRequirements = await step.run("calculate-nutrition-requirements", async () => {
        return calculateNutritionTargets({
          age: parseInt(assessmentData.age),
          gender: assessmentData.gender,
          height: parseInt(assessmentData.height),
          weight: parseFloat(assessmentData.weight),
          targetWeight: assessmentData.targetWeight ? parseFloat(assessmentData.targetWeight) : undefined,
          fitnessGoal: assessmentData.fitnessGoal,
          activityLevel: assessmentData.activityLevel
        });
      });

      // Generate meal plan if enabled
      if (assessmentData.mealPlanningEnabled) {
        console.log("Meal planning is enabled, generating meal plan...");
        await step.run("generate-meal-plan", async () => {
          console.log("Deactivating existing meal plans for profile:", fitnessProfile.id);
          // First, deactivate any existing active meal plans for this profile
          await prisma.mealPlan.updateMany({
            where: {
              fitnessProfileId: fitnessProfile.id,
              isActive: true
            },
            data: {
              isActive: false,
              activeProfileId: null
            },
          });

          console.log("Creating new meal plan...");
          // Create the new meal plan
          const mealPlan = await prisma.mealPlan.create({
            data: {
              name: `${assessmentData.fitnessGoal.replace('_', ' ')} Monthly Meal Plan`,
              description: `Personalized ${assessmentData.fitnessGoal.toLowerCase().replace('_', ' ')} meal plan for 30 days`,
              duration: 30, // 30 days (entire month)
              caloriesPerDay: nutritionRequirements.caloriesPerDay,
              proteinPerDay: nutritionRequirements.proteinPerDay,
              carbsPerDay: nutritionRequirements.carbsPerDay,
              fatPerDay: nutritionRequirements.fatPerDay,
              budgetPerWeek: parseFloat(assessmentData.budgetPerWeek),
              isActive: true,
              activeProfileId: fitnessProfile.id,
              fitnessProfileId: fitnessProfile.id,
            },
          });

          // Generate meal templates using AI (optimized to reduce API calls)
          const mealTypes = ['BREAKFAST', 'LUNCH', 'DINNER'];
          const mealTemplates: { [mealType: string]: any } = {};
          const mealPromises: Promise<any>[] = [];

          console.log(`Generating ${mealTypes.length} meal templates for types: ${mealTypes.join(', ')}`);

          // Generate meal templates (only once per meal type)
          for (const mealType of mealTypes) {
            // Generate meal template using AI with realistic nutrition values
            // AI will create meals with natural nutrition ratios, then we'll adjust portions
            const aiMeal = await generateMealWithAI(
              1, // Use day 1 as template
              mealType,
              assessmentData.fitnessGoal,
              assessmentData.dietaryRestrictions,
              assessmentData.preferredCuisines,
              assessmentData.cookingSkill,
              0, // Let AI generate natural nutrition values
              0, // Let AI generate natural nutrition values
              0, // Let AI generate natural nutrition values
              0, // Let AI generate natural nutrition values
              assessmentData.budgetPerWeek,
              parseInt(assessmentData.mealPrepTime)
            );

            mealTemplates[mealType] = aiMeal;
            console.log(`Generated template for ${mealType}: ${aiMeal.name} (${aiMeal.calories} cal, ${aiMeal.protein}g protein, ${aiMeal.carbs}g carbs, ${aiMeal.fat}g fat)`);
          }

          // Calculate total daily nutrition from all meals
          const totalDailyCalories = Object.values(mealTemplates).reduce((sum: number, meal: any) => sum + meal.calories, 0);
          const totalDailyProtein = Object.values(mealTemplates).reduce((sum: number, meal: any) => sum + meal.protein, 0);
          const totalDailyCarbs = Object.values(mealTemplates).reduce((sum: number, meal: any) => sum + meal.carbs, 0);
          const totalDailyFat = Object.values(mealTemplates).reduce((sum: number, meal: any) => sum + meal.fat, 0);

          console.log(`Total daily nutrition from meals: ${totalDailyCalories} cal, ${totalDailyProtein}g protein, ${totalDailyCarbs}g carbs, ${totalDailyFat}g fat`);
          console.log(`Target daily nutrition: ${nutritionRequirements.caloriesPerDay} cal, ${nutritionRequirements.proteinPerDay}g protein, ${nutritionRequirements.carbsPerDay}g carbs, ${nutritionRequirements.fatPerDay}g fat`);

          // Calculate overall portion multiplier to match daily targets
          const overallCalorieMultiplier = nutritionRequirements.caloriesPerDay / totalDailyCalories;
          const overallProteinMultiplier = nutritionRequirements.proteinPerDay / totalDailyProtein;
          const overallCarbsMultiplier = nutritionRequirements.carbsPerDay / totalDailyCarbs;
          const overallFatMultiplier = nutritionRequirements.fatPerDay / totalDailyFat;

          console.log(`Overall multipliers: calories=${overallCalorieMultiplier.toFixed(2)}, protein=${overallProteinMultiplier.toFixed(2)}, carbs=${overallCarbsMultiplier.toFixed(2)}, fat=${overallFatMultiplier.toFixed(2)}`);

          // Adjust all meals to match daily targets
          for (const mealType of mealTypes) {
            const meal = mealTemplates[mealType];

            // Adjust nutrition values to match daily targets
            meal.calories = Math.round(meal.calories * overallCalorieMultiplier);
            meal.protein = Math.round(meal.protein * overallProteinMultiplier * 10) / 10;
            meal.carbs = Math.round(meal.carbs * overallCarbsMultiplier * 10) / 10;
            meal.fat = Math.round(meal.fat * overallFatMultiplier * 10) / 10;

            // Adjust ingredient amounts based on calorie multiplier (most important for portion size)
            meal.ingredients = meal.ingredients.map((ingredient: any) => ({
              ...ingredient,
              amount: (parseFloat(ingredient.amount) * overallCalorieMultiplier).toFixed(1)
            }));

            console.log(`Adjusted ${mealType}: ${meal.calories} cal, ${meal.protein}g protein, ${meal.carbs}g carbs, ${meal.fat}g fat`);
          }

                    // Create meals for each day using the templates
          console.log(`Creating meals for 30 days with proper week/day structure...`);

          for (let day = 1; day <= 30; day++) {
            // Calculate week number
            const weekNumber = Math.ceil(day / 7);

            console.log(`Day ${day}: Week ${weekNumber}`);

            for (const mealType of mealTypes) {
              const template = mealTemplates[mealType];

              const mealPromise = prisma.meal.create({
                data: {
                  name: `Day ${day} - ${template.name}`,
                  description: template.description,
                  mealType: mealType as any,
                  dayOfWeek: day, // Use actual day number (1-30), not day of week (0-6)
                  weekNumber: weekNumber,
                  calories: template.calories,
                  protein: template.protein,
                  carbs: template.carbs,
                  fat: template.fat,
                  prepTime: template.prepTime,
                  cookTime: template.cookTime,
                  servings: 1,
                  mealPlanId: mealPlan.id,
                  recipes: {
                    create: {
                      name: `Day ${day} - ${template.name}`,
                      description: template.description,
                      instructions: template.instructions,
                      ingredients: JSON.stringify(template.ingredients),
                      nutrition: JSON.stringify({
                        calories: template.calories,
                        protein: template.protein,
                        carbs: template.carbs,
                        fat: template.fat,
                        fiber: Math.floor(Math.random() * 8) + 3,
                        sugar: Math.floor(Math.random() * 15) + 5
                      }),
                                          prepTime: template.prepTime,
                    cookTime: template.cookTime,
                      servings: 1,
                      difficulty: assessmentData.cookingSkill,
                      cuisine: assessmentData.preferredCuisines[day % assessmentData.preferredCuisines.length] || "american",
                      tags: assessmentData.dietaryRestrictions.length > 0 ? assessmentData.dietaryRestrictions : ["healthy", "balanced"],
                    }
                  }
                },
              });

              mealPromises.push(mealPromise);
            }
          }

          // Wait for all meals to be created
          const createdMeals = await Promise.all(mealPromises);
          console.log(`Created ${createdMeals.length} meals using ${mealTypes.length} AI-generated templates for meal plan ${mealPlan.id}`);

          // Update the fitness profile to point to the new current meal plan
          await prisma.fitnessProfile.update({
            where: { id: fitnessProfile.id },
            data: { currentMealPlan: { connect: { id: mealPlan.id } } }
          });

          // Verify meal plan was created
          const mealPlanCount = await prisma.mealPlan.count({
            where: { fitnessProfileId: fitnessProfile.id }
          });
          console.log(`Total meal plans in database for profile ${fitnessProfile.id}: ${mealPlanCount}`);

          return mealPlan;
        });
      }

      // Create fitness plan project and success message
      await step.run("create-fitness-project", async () => {
        // Create a project for the fitness plan
        const project = await prisma.project.create({
          data: {
            name: `${planData.name} - ${new Date().toLocaleDateString()}`,
            userId: userId,
            messages: {
              create: {
                content: `Your personalized ${planData.name} has been created! The plan includes ${assessmentData.availableDays.length} AI-generated workouts per week for 8 weeks, tailored to your ${assessmentData.fitnessGoal.toLowerCase().replace('_', ' ')} goals and ${assessmentData.experienceLevel.toLowerCase()} experience level.${assessmentData.mealPlanningEnabled ? ` Plus, you now have a complete 30-day AI-generated meal plan with ${assessmentData.availableDays.length * 3} personalized recipes per week!` : ''}`,
                role: "ASSISTANT",
                type: "PLAN_GENERATED",
              }
            }
          },
        });

        return project;
      });

      console.log("Fitness plan generation completed successfully:", {
        planId: workoutPlan.id,
        planName: planData.name,
        userId,
        fitnessProfileId: fitnessProfile.id
      });

      return {
        success: true,
        planId: workoutPlan.id,
        planName: planData.name,
        message: "Fitness plan generated successfully",
      };

    } catch (error: any) {
      console.error("Error in generateFitnessPlan function:", error);

      // Create error project and message
      await step.run("create-error-project", async () => {
        const project = await prisma.project.create({
          data: {
            name: `Fitness Plan Error - ${new Date().toLocaleDateString()}`,
            userId: userId,
            messages: {
              create: {
                content: "Sorry, there was an error generating your fitness plan. Please try again or contact support.",
                role: "ASSISTANT",
                type: "ERROR",
              }
            }
          },
        });

        return project;
      });

      throw error;
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const generateMealPlanOnlyFunction = inngest.createFunction(
  { id: "generate-meal-plan-only" },
  { event: "generate-meal-plan-only/run" },
  async ({ event, step }: { event: { data: { userId: string, fitnessProfileId: string } }, step: any }) => {
    const prisma = new PrismaClient();
    const { userId, fitnessProfileId } = event.data;

    console.log("Starting meal plan only generation for user:", userId);
    console.log("Fitness profile ID:", fitnessProfileId);

    try {
      // Get the existing fitness profile
      const fitnessProfile = await step.run("get-fitness-profile", async () => {
        const profile = await prisma.fitnessProfile.findUnique({
          where: { id: fitnessProfileId }
        });

        if (!profile) {
          throw new Error("Fitness profile not found");
        }

        if (!profile.mealPlanningEnabled) {
          throw new Error("Meal planning is not enabled for this profile");
        }

        console.log("Found fitness profile:", profile.id);
        return profile;
      });

      // Calculate nutrition requirements using scientific formulas
      const nutritionRequirements = await step.run("calculate-nutrition-requirements", async () => {
        return calculateNutritionTargets({
          age: parseInt(fitnessProfile.age),
          gender: fitnessProfile.gender,
          height: parseInt(fitnessProfile.height),
          weight: parseFloat(fitnessProfile.weight),
          targetWeight: fitnessProfile.targetWeight ? parseFloat(fitnessProfile.targetWeight) : undefined,
          fitnessGoal: fitnessProfile.fitnessGoal,
          activityLevel: fitnessProfile.activityLevel
        });
      });

      // Generate meal plan
      await step.run("generate-meal-plan", async () => {
        console.log("Deactivating existing meal plans for profile:", fitnessProfile.id);
        // First, deactivate any existing active meal plans for this profile
        await prisma.mealPlan.updateMany({
          where: {
            fitnessProfileId: fitnessProfile.id,
            isActive: true
          },
          data: {
            isActive: false,
            activeProfileId: null
          },
        });

        console.log("Creating new meal plan...");
        // Create the new meal plan
        const mealPlan = await prisma.mealPlan.create({
          data: {
            name: `${fitnessProfile.fitnessGoal?.replace('_', ' ') || 'Personalized'} Monthly Meal Plan`,
            description: `Personalized ${fitnessProfile.fitnessGoal?.toLowerCase().replace('_', ' ') || 'fitness'} meal plan for 30 days`,
            duration: 30, // 30 days (entire month)
            caloriesPerDay: nutritionRequirements.caloriesPerDay,
            proteinPerDay: nutritionRequirements.proteinPerDay,
            carbsPerDay: nutritionRequirements.carbsPerDay,
            fatPerDay: nutritionRequirements.fatPerDay,
            budgetPerWeek: fitnessProfile.budgetPerWeek || 100,
            isActive: true,
            activeProfileId: fitnessProfile.id,
            fitnessProfileId: fitnessProfile.id,
          },
        });

        // Parse stored data from fitness profile
        const dietaryRestrictions = fitnessProfile.dietaryRestrictions || [];
        const preferredCuisines = fitnessProfile.preferredCuisines || [];
        const cookingSkill = fitnessProfile.cookingSkill || 'BEGINNER';
        const mealPrepTime = fitnessProfile.mealPrepTime || 30;

        // Generate meal templates using AI (optimized to reduce API calls)
        const mealTypes = ['BREAKFAST', 'LUNCH', 'DINNER'];
        const mealTemplates: { [mealType: string]: any } = {};
        const mealPromises: Promise<any>[] = [];

        console.log(`Generating ${mealTypes.length} meal templates for types: ${mealTypes.join(', ')}`);

        // Generate meal templates (only once per meal type)
        for (const mealType of mealTypes) {
          // Generate meal template using AI with realistic nutrition values
          // AI will create meals with natural nutrition ratios, then we'll adjust portions
          const aiMeal = await generateMealWithAI(
            1, // Use day 1 as template
            mealType,
            fitnessProfile.fitnessGoal || 'GENERAL_FITNESS',
            dietaryRestrictions,
            preferredCuisines,
            cookingSkill,
            0, // Let AI generate natural nutrition values
            0, // Let AI generate natural nutrition values
            0, // Let AI generate natural nutrition values
            0, // Let AI generate natural nutrition values
            fitnessProfile.budgetPerWeek || 100,
            mealPrepTime
          );

          mealTemplates[mealType] = aiMeal;
          console.log(`Generated template for ${mealType}: ${aiMeal.name} (${aiMeal.calories} cal, ${aiMeal.protein}g protein, ${aiMeal.carbs}g carbs, ${aiMeal.fat}g fat)`);
        }

        // Calculate total daily nutrition from all meals
        const totalDailyCalories = Object.values(mealTemplates).reduce((sum: number, meal: any) => sum + meal.calories, 0);
        const totalDailyProtein = Object.values(mealTemplates).reduce((sum: number, meal: any) => sum + meal.protein, 0);
        const totalDailyCarbs = Object.values(mealTemplates).reduce((sum: number, meal: any) => sum + meal.carbs, 0);
        const totalDailyFat = Object.values(mealTemplates).reduce((sum: number, meal: any) => sum + meal.fat, 0);

        console.log(`Total daily nutrition from meals: ${totalDailyCalories} cal, ${totalDailyProtein}g protein, ${totalDailyCarbs}g carbs, ${totalDailyFat}g fat`);
        console.log(`Target daily nutrition: ${nutritionRequirements.caloriesPerDay} cal, ${nutritionRequirements.proteinPerDay}g protein, ${nutritionRequirements.carbsPerDay}g carbs, ${nutritionRequirements.fatPerDay}g fat`);

        // Calculate overall portion multiplier to match daily targets
        const overallCalorieMultiplier = nutritionRequirements.caloriesPerDay / totalDailyCalories;
        const overallProteinMultiplier = nutritionRequirements.proteinPerDay / totalDailyProtein;
        const overallCarbsMultiplier = nutritionRequirements.carbsPerDay / totalDailyCarbs;
        const overallFatMultiplier = nutritionRequirements.fatPerDay / totalDailyFat;

        console.log(`Overall multipliers: calories=${overallCalorieMultiplier.toFixed(2)}, protein=${overallProteinMultiplier.toFixed(2)}, carbs=${overallCarbsMultiplier.toFixed(2)}, fat=${overallFatMultiplier.toFixed(2)}`);

        // Adjust all meals to match daily targets
        for (const mealType of mealTypes) {
          const meal = mealTemplates[mealType];

          // Adjust nutrition values to match daily targets
          meal.calories = Math.round(meal.calories * overallCalorieMultiplier);
          meal.protein = Math.round(meal.protein * overallProteinMultiplier * 10) / 10;
          meal.carbs = Math.round(meal.carbs * overallCarbsMultiplier * 10) / 10;
          meal.fat = Math.round(meal.fat * overallFatMultiplier * 10) / 10;

          // Adjust ingredient amounts based on calorie multiplier (most important for portion size)
          meal.ingredients = meal.ingredients.map((ingredient: any) => ({
            ...ingredient,
            amount: (parseFloat(ingredient.amount) * overallCalorieMultiplier).toFixed(1)
          }));

          console.log(`Adjusted ${mealType}: ${meal.calories} cal, ${meal.protein}g protein, ${meal.carbs}g carbs, ${meal.fat}g fat`);
        }

        // Create meals for each day using the templates
        console.log(`Creating meals for 30 days with proper week/day structure...`);

        for (let day = 1; day <= 30; day++) {
          // Calculate week number
          const weekNumber = Math.ceil(day / 7);

          console.log(`Day ${day}: Week ${weekNumber}`);

          for (const mealType of mealTypes) {
            const template = mealTemplates[mealType];

            const mealPromise = prisma.meal.create({
              data: {
                name: `Day ${day} - ${template.name}`,
                description: template.description,
                mealType: mealType as any,
                dayOfWeek: day, // Use actual day number (1-30), not day of week (0-6)
                weekNumber: weekNumber,
                calories: template.calories,
                protein: template.protein,
                carbs: template.carbs,
                fat: template.fat,
                prepTime: template.prepTime,
                cookTime: template.cookTime,
                servings: 1,
                mealPlanId: mealPlan.id,
                recipes: {
                  create: {
                    name: `Day ${day} - ${template.name}`,
                    description: template.description,
                    instructions: template.instructions,
                    ingredients: JSON.stringify(template.ingredients),
                    nutrition: JSON.stringify({
                      calories: template.calories,
                      protein: template.protein,
                      carbs: template.carbs,
                      fat: template.fat,
                      fiber: Math.floor(Math.random() * 8) + 3,
                      sugar: Math.floor(Math.random() * 15) + 5
                    }),
                    prepTime: template.prepTime,
                    cookTime: template.cookTime,
                    servings: 1,
                    difficulty: cookingSkill,
                    cuisine: preferredCuisines[day % preferredCuisines.length] || "american",
                    tags: dietaryRestrictions.length > 0 ? dietaryRestrictions : ["healthy", "balanced"],
                  }
                }
              },
            });

            mealPromises.push(mealPromise);
          }
        }

        // Wait for all meals to be created
        const createdMeals = await Promise.all(mealPromises);
        console.log(`Created ${createdMeals.length} meals using ${mealTypes.length} AI-generated templates for meal plan ${mealPlan.id}`);

        // Update the fitness profile to point to the new current meal plan
        await prisma.fitnessProfile.update({
          where: { id: fitnessProfile.id },
          data: { currentMealPlan: { connect: { id: mealPlan.id } } }
        });

        // Verify meal plan was created
        const mealPlanCount = await prisma.mealPlan.count({
          where: { fitnessProfileId: fitnessProfile.id }
        });
        console.log(`Total meal plans in database for profile ${fitnessProfile.id}: ${mealPlanCount}`);

        return mealPlan;
      });

      // Create success message
      await step.run("create-meal-plan-project", async () => {
        // Create a project for the meal plan
        const project = await prisma.project.create({
          data: {
            name: `Meal Plan - ${new Date().toLocaleDateString()}`,
            userId: userId,
            messages: {
              create: {
                content: `Your personalized meal plan has been created! You now have a complete 30-day AI-generated meal plan with 3 personalized recipes per day, tailored to your ${fitnessProfile.fitnessGoal?.toLowerCase().replace('_', ' ') || 'fitness'} goals and dietary preferences.`,
                role: "ASSISTANT",
                type: "PLAN_GENERATED",
              }
            }
          },
        });

        return project;
      });

      console.log("Meal plan generation completed successfully:", {
        userId,
        fitnessProfileId: fitnessProfile.id
      });

      return {
        success: true,
        message: "Meal plan generated successfully",
      };

    } catch (error) {
      console.error("Error in meal plan generation:", error);
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }
);

type GenerateShoppingListEvent = {
  name: "generate-shopping-list/run";
  data: {
    weekNumber: number;
    weekMeals: any[];
    userId: string;
  };
};

export const generateShoppingListFunction = inngest.createFunction(
  { id: "generate-shopping-list" },
  { event: "generate-shopping-list/run" },
  async ({ event, step }: { event: GenerateShoppingListEvent, step: any }) => {
    const { weekNumber, weekMeals, userId } = event.data;

    console.log(`Starting shopping list generation for Week ${weekNumber}, user: ${userId}`);

    try {
      // Collect all ingredients from the week's meals with proper quantity calculation
      const allIngredients: any[] = [];
      weekMeals.forEach(meal => {
        meal.recipes?.forEach((recipe: any) => {
          try {
            const ingredients = JSON.parse(recipe.ingredients);
            ingredients.forEach((ingredient: any) => {
              // Check if ingredient already exists
              const existingIndex = allIngredients.findIndex(
                item => item.name.toLowerCase() === ingredient.name.toLowerCase()
              );

              if (existingIndex >= 0) {
                // Add quantities
                const existing = allIngredients[existingIndex];
                const existingAmount = parseFloat(existing.amount) || 0;
                const newAmount = parseFloat(ingredient.amount) || 0;
                allIngredients[existingIndex] = {
                  ...existing,
                  amount: (existingAmount + newAmount).toString(),
                  count: (existing.count || 1) + 1
                };
              } else {
                allIngredients.push({
                  ...ingredient,
                  count: 1
                });
              }
            });
          } catch (e) {
            console.error("Error parsing ingredients:", e);
          }
        });
      });

      console.log(`Collected ${allIngredients.length} unique ingredients for Week ${weekNumber}`);

      // Generate organized shopping list using AI with better guidance
      const shoppingList = await step.run("generate-organized-list", async () => {
        const openaiClient = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });

        const prompt = `Vytvoř realistický a dobře organizovaný nákupní seznam pro týden ${weekNumber}. Zde jsou potřebné surové ingredience:

${allIngredients.map(ing => `- ${ing.amount} ${ing.unit} ${ing.name} (použito v ${ing.count} receptech)`).join('\n')}

DŮLEŽITÉ INSTRUKCE:
1. NENÁSOB množství - použij přesné poskytnuté množství
2. Převeď na realistické množství v obchodě (např. pokud potřebuješ 700g špenátu, to je asi 2-3 balení špenátu)
3. Pro položky jako omáčky, oleje a koření použij rozumné množství (např. 1 láhev sojové omáčky, ne 21 šálků)
4. Seskup podobné ingredience dohromady
5. Přidej chybějící základní potraviny (sůl, pepř, olej na vaření, pokud nejsou uvedeny)

Prosím, organizuj to do čistého nákupního seznamu s:
1. Kategoriemi (Ovoce a zelenina, Mléčné výrobky, Maso, Spižírna, atd.)
2. Realistickými množstvími, které bys skutečně koupil v obchodě
3. Jakýmikoli dodatečnými základními potravinami
4. Stručnými tipy pro nákup

Formátuj jako čistý, organizovaný seznam, který je snadné sledovat v obchodě. POUŽÍVEJ POUZE EVROPSKÉ JEDNOTKY - gramy, mililitry, kusy, žádné cups, tablespoons, ounces.`;

        const completion = await openaiClient.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
                    {
          role: "system",
          content: "Jsi užitečný asistent, který vytváří realistické a organizované nákupní seznamy. Vždy používej realistické množství z obchodu - nikdy nenavrhuj kupovat 21 šálků omáčky nebo jiná nereálná množství. Převeď měření na praktické nákupní jednotky (např. 1 láhev, 1 balení, 2-3 sáčky). POUŽÍVEJ POUZE EVROPSKÉ JEDNOTKY - gramy, mililitry, kusy, žádné cups, tablespoons, ounces."
        },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1000,
        });

        return completion.choices[0]?.message?.content || 'Failed to generate shopping list';
      });

      // Create a project to store the shopping list
      const project = await step.run("create-shopping-list-project", async () => {
        const prisma = new PrismaClient();

        const project = await prisma.project.create({
          data: {
            name: `Nákupní seznam týden ${weekNumber} - ${new Date().toLocaleDateString()}`,
            userId: userId,
            messages: {
              create: {
                content: `Zde je váš organizovaný nákupní seznam pro týden ${weekNumber}:\n\n${shoppingList}`,
                role: "ASSISTANT",
                type: "PLAN_GENERATED",
              }
            }
          },
        });

        await prisma.$disconnect();
        return project;
      });

      console.log(`Shopping list generated successfully for Week ${weekNumber}`);

      return {
        success: true,
        projectId: project.id,
        shoppingList: shoppingList,
        weekNumber,
        message: `Shopping list generated for Week ${weekNumber}`,
      };

    } catch (error: any) {
      console.error(`Error in generateShoppingList function for Week ${weekNumber}:`, error);
      throw error;
    }
  },
);

// Vědecký výpočet BMR, TDEE a denních nutričních cílů
function calculateNutritionTargets({
  age,
  gender,
  height,
  weight,
  targetWeight,
  fitnessGoal,
  activityLevel
}: {
  age: number,
  gender: string,
  height: number,
  weight: number,
  targetWeight?: number,
  fitnessGoal: string,
  activityLevel: string
}): { caloriesPerDay: number, proteinPerDay: number, carbsPerDay: number, fatPerDay: number } {
  // 1. BMR
  let bmr: number;
  if (gender.toLowerCase() === 'male' || gender.toLowerCase() === 'm' || gender.toLowerCase() === 'muž') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  // 2. Aktivita
  let activityMultiplier = 1.2;
  switch (activityLevel?.toLowerCase()) {
    case 'sedentary':
    case 'nízká':
      activityMultiplier = 1.2; break;
    case 'light':
    case 'lehce aktivní':
      activityMultiplier = 1.375; break;
    case 'moderate':
    case 'střední':
      activityMultiplier = 1.55; break;
    case 'active':
    case 'velmi aktivní':
      activityMultiplier = 1.725; break;
    case 'very active':
    case 'extrémně aktivní':
      activityMultiplier = 1.9; break;
  }
  let tdee = bmr * activityMultiplier;

  // 3. Úprava podle cíle
  let calories = tdee;
  switch (fitnessGoal?.toUpperCase()) {
    case 'WEIGHT_LOSS':
    case 'HUBNUTÍ':
      calories = tdee - 400; // Deficit
      break;
    case 'MUSCLE_GAIN':
    case 'NABÍRÁNÍ':
      calories = tdee + 300; // Surplus
      break;
    case 'ENDURANCE':
    case 'VYTRVALOST':
      calories = tdee + 150;
      break;
    case 'STRENGTH':
    case 'SÍLA':
      calories = tdee + 200;
      break;
    case 'FLEXIBILITY':
    case 'FLEXIBILITA':
      calories = tdee;
      break;
    case 'GENERAL_FITNESS':
    case 'OBECNÁ':
    default:
      calories = tdee;
      break;
  }
  calories = Math.round(calories);

  // 4. Makroživiny
  // Bílkoviny: 1.8g/kg pro hubnutí, 2.0g/kg pro nabírání, 1.6g/kg pro ostatní
  let proteinPerKg = 1.6;
  if (fitnessGoal?.toUpperCase() === 'WEIGHT_LOSS' || fitnessGoal?.toUpperCase() === 'HUBNUTÍ') proteinPerKg = 1.8;
  if (fitnessGoal?.toUpperCase() === 'MUSCLE_GAIN' || fitnessGoal?.toUpperCase() === 'NABÍRÁNÍ') proteinPerKg = 2.0;
  const proteinPerDay = Math.round(weight * proteinPerKg * 10) / 10;

  // Tuky: 25% z kalorií, 1g tuku = 9 kcal
  const fatPerDay = Math.round((calories * 0.25) / 9 * 10) / 10;

  // Sacharidy: zbytek kalorií
  const proteinCals = proteinPerDay * 4;
  const fatCals = fatPerDay * 9;
  const carbsCals = calories - proteinCals - fatCals;
  const carbsPerDay = Math.round((carbsCals / 4) * 10) / 10;

  return {
    caloriesPerDay: calories,
    proteinPerDay,
    carbsPerDay,
    fatPerDay
  };
}
