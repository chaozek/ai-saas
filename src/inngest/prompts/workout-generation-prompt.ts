export function createWorkoutGenerationPrompt(params: {
  dayOfWeek: string;
  fitnessGoal: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  targetWeight: string;
  targetMuscleGroups: string[];
  activityLevel: string;
  experienceLevel: string;
  preferredExercises: string;
  availableEquipment: string[];
  workoutDuration: number;
  hasInjuries: boolean;
  injuries: string;
  medicalConditions: string;
}) {
  const {
    dayOfWeek,
    fitnessGoal,
    age,
    gender,
    height,
    weight,
    targetWeight,
    targetMuscleGroups,
    activityLevel,
    experienceLevel,
    preferredExercises,
    availableEquipment,
    workoutDuration,
    hasInjuries,
    injuries,
    medicalConditions
  } = params;

  return `Vygeneruj PROFESIONÁLNÍ trénink pro ${dayOfWeek} na základě těchto parametrů:

KRITICKÉ: MUSÍŠ STRICTNĚ respektovat fitness cíl "${fitnessGoal}" a generovat cviky, které jsou SPECIFICKY pro tento cíl. NEPOUŽÍVEJ generické cviky, které neodpovídají cíli!

OSOBNÍ INFORMACE:
- Věk: ${age} let
- Pohlaví: ${gender}
- Výška: ${height} cm
- Aktuální váha: ${weight} kg
- Cílová váha: ${targetWeight || 'není specifikována'} kg

FITNESS CÍLE A ZKUŠENOSTI:
- Fitness cíl: ${fitnessGoal}
- Cílové partie: ${targetMuscleGroups.length > 0 ? targetMuscleGroups.join(', ') : 'Všechny partie'}
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

2. FITNESS CÍLE A CÍLOVÉ PARTIE - PROFESIONÁLNÍ PŘÍSTUP:

CÍLOVÉ PARTIE:
${targetMuscleGroups.length > 0 ?
  `- Uživatel se zaměřuje na tyto partie: ${targetMuscleGroups.join(', ')}
- KRITICKÉ: V každém tréninku musí být alespoň 60% cviků zaměřených na cílové partie
- Zbytek cviků může být pro podpůrné partie nebo celkové kondice` :
  `- Uživatel se zaměřuje na všechny partie rovnoměrně
- Vytvoř vyvážený trénink pro celé tělo`}

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
      "weight": 10.0,
      "youtubeUrl": "https://www.youtube.com/watch?v=VIDEO_ID"
    }
  ]
}

DŮLEŽITÉ: VŠECHNY NÁZVY CVIKŮ MUSÍ BÝT V ČEŠTINĚ. Použij POUZE české názvy cviků pro zobrazení.

PRO YOUTUBE URL POUŽÍVEJ ANGLICKÉ NÁZVY:
- Pro YouTube URL používej anglické názvy cviků (např. "push-ups", "squats", "planks", "burpees")
- Názvy cviků v JSON odpovědi zůstávají v češtině
- YouTube URL generuj pomocí anglických termínů pro lepší výsledky

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

CVIKY MUSÍ MÍT OBA NÁZVY:
- name: český název cviku (pro zobrazení uživateli)
- englishName: anglický název cviku (pro vyhledávání YouTube videí)
- Příklad: "name": "kliky", "englishName": "push-ups"

Pro silové cviky použij série a opakování. Pro kardio/flexibilitu použij dobu trvání v sekundách.
KRITICKÉ: Použij POUZE tyto přesné hodnoty obtížnosti s VELKÝMI písmeny: "BEGINNER", "INTERMEDIATE", "ADVANCED".
NEPOUŽÍVEJ malá písmena ani žádné jiné variace.
Pro pole weight použij POUZE čísla (např. 5.0, 10.0, 20.0) nebo null. NEPOUŽÍVEJ řetězce jako "light", "medium", "heavy".

YOUTUBE URL PRO CVIKY:
- Pro KAŽDÝ cvik přidej youtubeUrl s odkazem na demonstrační video
- Použij reálné YouTube URL ve formátu: https://www.youtube.com/watch?v=VIDEO_ID
- Vyber videa, která demonstrují správnou techniku cviku
- Používej englishName (anglický název) pro hledávání videí (např. "push-ups", "squats", "planks")
- Preferuj videa v angličtině s jasnými instrukcemi
- Pro běžné cviky použij populární videa od renomovaných fitness kanálů
- Pro specializované cviky použij videa od certifikovaných trenérů
- POUŽÍVEJ POUZE veřejná videa s povoleným vkládáním (embedding)
- Preferuj kanály: wikiHow, ATHLEAN-X, FitnessBlender, MadFit, HASfit, Popsugar Fitness, Blogilates
- VYHNI SE videím, která mohou být regionálně omezená nebo soukromá
- Příklad formátu: https://www.youtube.com/watch?v=VIDEO_ID (kde VIDEO_ID je skutečné ID videa)

Zajisti, že cviky jsou bezpečné a vhodné pro úroveň zkušeností a ZDRAVOTNÍ STAV.

PŘÍKLAD SPRÁVNÉHO JSON FORMÁTU:
{
  "name": "Trénink pro nabírání svalů",
  "description": "Tento trénink se zaměřuje na silové cviky s cílem nabrat svalovou hmotu.",
  "exercises": [
    {
      "name": "kliky",
      "englishName": "push-ups",
      "description": "Základní cvik na hrudník a triceps",
      "category": "strength",
      "muscleGroups": ["chest", "triceps", "shoulders"],
      "equipment": ["bodyweight"],
      "difficulty": "BEGINNER",
      "sets": 3,
      "reps": 10,
      "restTime": 60,
      "weight": null,
      "youtubeUrl": "https://www.youtube.com/watch?v=VIDEO_ID"
    },
    {
      "name": "dřepy",
      "englishName": "squats",
      "description": "Compound cvik na nohy",
      "category": "strength",
      "muscleGroups": ["quadriceps", "glutes", "hamstrings"],
      "equipment": ["bodyweight"],
      "difficulty": "BEGINNER",
      "sets": 3,
      "reps": 15,
      "restTime": 90,
      "weight": null,
      "youtubeUrl": "https://www.youtube.com/watch?v=VIDEO_ID"
    }
  ]
}`;
}