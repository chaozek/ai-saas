import { inngest } from "./client";
import OpenAI from "openai";
import { PrismaClient } from "../generated/prisma";

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
     // Kontrola povinných údajů
     if (!age || age <= 0) {
       throw new Error('Věk je povinný údaj a musí být větší než 0');
     }
     if (!gender || gender.trim() === '') {
       throw new Error('Pohlaví je povinný údaj');
     }
     if (!height || height <= 0) {
       throw new Error('Výška je povinný údaj a musí být větší než 0');
     }
     if (!weight || weight <= 0) {
       throw new Error('Váha je povinný údaj a musí být větší než 0');
     }

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
