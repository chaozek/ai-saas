"use client"

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ShoppingCart, ChevronDown, Calendar } from "lucide-react";
import { MealCard } from "./meal-card";
import { Meal } from "./types";

interface WeekMealsProps {
  weekNumber: number;
  weekMeals: Meal[];
  weekIndex: number;
  mealPlanDuration: number;
  expandedWeeks: Set<number>;
  generatingList: { [weekNumber: number]: boolean };
  onToggleWeekExpansion: (weekNumber: number) => void;
  onGenerateShoppingList: (weekNumber: number, weekMeals: Meal[]) => void;
  onFetchShoppingList: (weekNumber: number) => void;
  expandedMeals: Set<string>;
  onToggleMealExpansion: (mealId: string) => void;
  onRegenerateMeal?: (mealId: string) => void;
  regeneratingMeals?: Set<string>;
}

export function WeekMeals({
  weekNumber,
  weekMeals,
  weekIndex,
  mealPlanDuration,
  expandedWeeks,
  generatingList,
  onToggleWeekExpansion,
  onGenerateShoppingList,
  onFetchShoppingList,
  expandedMeals,
  onToggleMealExpansion,
  onRegenerateMeal,
  regeneratingMeals
}: WeekMealsProps) {
  const isExpanded = expandedWeeks.has(weekNumber);
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set());

  // Group meals by day
  const mealsByDay: { [day: number]: Meal[] } = {};
  weekMeals.forEach((meal) => {
    if (!mealsByDay[meal.dayOfWeek]) {
      mealsByDay[meal.dayOfWeek] = [];
    }
    mealsByDay[meal.dayOfWeek].push(meal);
  });

  // Debug: Log all meals to see what we're working with
  console.log('=== WEEK MEALS DEBUG ===');
  console.log('Total week meals:', weekMeals.length);
  weekMeals.forEach((meal, index) => {
    console.log(`Meal ${index + 1}:`, {
      name: meal.name,
      mealType: meal.mealType,
      dayOfWeek: meal.dayOfWeek,
      recipes: meal.recipes?.map(r => ({ tags: r.tags })),
      _supplementaryType: (meal as any)._supplementaryType
    });
  });
  console.log('=== END DEBUG ===');

  const toggleDayExpansion = (day: number) => {
    setExpandedDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(day)) {
        newSet.delete(day);
      } else {
        newSet.add(day);
      }
      return newSet;
    });
  };

  const getDayName = (day: number) => {
    const dayNames = ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota'];
    const date = new Date();
    date.setDate(date.getDate() + (day - 1)); // Adjust based on your starting day
    return dayNames[date.getDay()];
  };

  // Funkce pro výpočet celkových živin pro den
  const getTotalNutritionForDay = (dayMeals: Meal[]) => {
    const totalNutrition = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };

    dayMeals.forEach(meal => {
      totalNutrition.calories += meal.calories || 0;
      totalNutrition.protein += meal.protein || 0;
      totalNutrition.carbs += meal.carbs || 0;
      totalNutrition.fat += meal.fat || 0;
    });

    return totalNutrition;
  };

  // Funkce pro formátování živin
  const formatNutrition = (nutrition: { calories: number; protein: number; carbs: number; fat: number }) => {
    return `${Math.round(nutrition.calories)} kcal, ${Math.round(nutrition.protein)}g P, ${Math.round(nutrition.carbs)}g K, ${Math.round(nutrition.fat)}g T`;
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={() => onToggleWeekExpansion(weekNumber)}>
      <Card className="border border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">{weekNumber}</span>
              </div>
              <div>
                <CardTitle className="text-base">Týden {weekNumber}</CardTitle>
                <CardDescription className="text-xs">
                  {weekMeals.length} jídel • Dny {(weekIndex * 7) + 1}-{Math.min((weekIndex + 1) * 7, mealPlanDuration)}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {weekMeals.length} jídel
              </Badge>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onGenerateShoppingList(weekNumber, weekMeals)}
                  disabled={generatingList[weekNumber]}
                  className="text-xs"
                >
                  {generatingList[weekNumber] ? (
                    <>
                      <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin mr-1"></div>
                      Vygenerování...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-3 h-3 mr-1" />
                      Vygenerovat
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onFetchShoppingList(weekNumber)}
                  className="text-xs"
                >
                  <ShoppingCart className="w-3 h-3 mr-1" />
                  Zobrazit
                </Button>
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {/* Each day in its own dropdown */}
              {Object.keys(mealsByDay)
                .map(Number)
                .sort((a, b) => a - b)
                .map(day => {
                  const dayMeals = mealsByDay[day];
                  const isDayExpanded = expandedDays.has(day);

                  // Zjednodušená logika - zobrazit všechna jídla podle pořadí
                  const sortedMeals = dayMeals.sort((a, b) => {
                    const mealTypeOrder = { 'BREAKFAST': 1, 'LUNCH': 2, 'DINNER': 3, 'SNACK': 4 };
                    return (mealTypeOrder[a.mealType as keyof typeof mealTypeOrder] || 0) -
                           (mealTypeOrder[b.mealType as keyof typeof mealTypeOrder] || 0);
                  });

                  // Výpočet celkových surovin pro den
                  const totalNutrition = getTotalNutritionForDay(dayMeals);
                  const nutritionSummary = formatNutrition(totalNutrition);

                  // Debug logging
                  console.log(`Day ${day} meals:`, {
                    totalMeals: dayMeals.length,
                    sortedMeals: sortedMeals.map(m => ({ name: m.name, type: m.mealType })),
                    totalNutrition: totalNutrition
                  });

                  return (
                    <Collapsible
                      key={day}
                      open={isDayExpanded}
                      onOpenChange={() => toggleDayExpansion(day)}
                      className="border rounded-lg"
                    >
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-between p-4 h-auto hover:bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-primary" />
                            <div className="text-left">
                              <div className="font-semibold">Den {day}</div>
                              <div className="text-xs text-muted-foreground">
                                {sortedMeals.map((meal, index) => {
                                  const mealTypeNames = {
                                    'BREAKFAST': 'Snídaně',
                                    'LUNCH': 'Oběd',
                                    'DINNER': 'Večeře',
                                    'SNACK': 'Svačina'
                                  };
                                  const mealName = mealTypeNames[meal.mealType as keyof typeof mealTypeNames] || 'Jídlo';
                                  return index === 0 ? mealName : `, ${mealName}`;
                                }).join('')}
                                {nutritionSummary && (
                                  <div className="mt-1 text-xs text-muted-foreground/70">
                                    Živiny: {nutritionSummary}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <ChevronDown className={`h-4 w-4 transition-transform ${isDayExpanded ? 'rotate-180' : ''}`} />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="px-4 pb-4 pt-4 space-y-3">
                          {/* Všechna jídla v jednom řádku podle pořadí */}
                          <div className={`grid grid-cols-1 md:grid-cols-${Math.min(dayMeals.length -1, 5)} gap-3`}>
                            {sortedMeals.map((meal) => (
                              <MealCard
                                key={meal.id}
                                meal={meal}
                                mealType={meal.mealType}
                                isExpanded={expandedMeals.has(meal.id)}
                                onToggleExpansion={() => onToggleMealExpansion(meal.id)}
                                onRegenerateMeal={onRegenerateMeal}
                                isRegenerating={regeneratingMeals?.has(meal.id)}
                              />
                            ))}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}