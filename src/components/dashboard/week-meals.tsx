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
                  const breakfast = dayMeals.find((m) => m.mealType === 'BREAKFAST');
                  const lunch = dayMeals.find((m) => m.mealType === 'LUNCH');
                  const dinner = dayMeals.find((m) => m.mealType === 'DINNER');

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
                                {breakfast ? 'Snídaně' : ''}
                                {lunch ? (breakfast ? ', ' : '') + 'Oběd' : ''}
                                {dinner ? ((breakfast || lunch) ? ', ' : '') + 'Večeře' : ''}
                              </div>
                            </div>
                          </div>
                          <ChevronDown className={`h-4 w-4 transition-transform ${isDayExpanded ? 'rotate-180' : ''}`} />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="px-4 pb-4 pt-4 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {/* Breakfast */}
                            {breakfast && (
                              <MealCard
                                meal={breakfast}
                                mealType="BREAKFAST"
                                isExpanded={expandedMeals.has(breakfast.id)}
                                onToggleExpansion={() => onToggleMealExpansion(breakfast.id)}
                                onRegenerateMeal={onRegenerateMeal}
                                isRegenerating={regeneratingMeals?.has(breakfast.id)}
                              />
                            )}

                            {/* Lunch */}
                            {lunch && (
                              <MealCard
                                meal={lunch}
                                mealType="LUNCH"
                                isExpanded={expandedMeals.has(lunch.id)}
                                onToggleExpansion={() => onToggleMealExpansion(lunch.id)}
                                onRegenerateMeal={onRegenerateMeal}
                                isRegenerating={regeneratingMeals?.has(lunch.id)}
                              />
                            )}

                            {/* Dinner */}
                            {dinner && (
                              <MealCard
                                meal={dinner}
                                mealType="DINNER"
                                isExpanded={expandedMeals.has(dinner.id)}
                                onToggleExpansion={() => onToggleMealExpansion(dinner.id)}
                                onRegenerateMeal={onRegenerateMeal}
                                isRegenerating={regeneratingMeals?.has(dinner.id)}
                              />
                            )}
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