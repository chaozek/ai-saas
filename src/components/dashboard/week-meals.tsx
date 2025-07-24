"use client"

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ShoppingCart, ChevronDown } from "lucide-react";
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
  onToggleMealExpansion
}: WeekMealsProps) {
  const isExpanded = expandedWeeks.has(weekNumber);

  // Group meals by day
  const mealsByDay: { [day: number]: Meal[] } = {};
  weekMeals.forEach((meal) => {
    if (!mealsByDay[meal.dayOfWeek]) {
      mealsByDay[meal.dayOfWeek] = [];
    }
    mealsByDay[meal.dayOfWeek].push(meal);
  });

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
            <div className="space-y-4">
              {/* Group meals by day and display in 3-column layout */}
              {Object.keys(mealsByDay)
                .map(Number)
                .sort((a, b) => a - b)
                .map(day => {
                  const dayMeals = mealsByDay[day];
                  const breakfast = dayMeals.find((m) => m.mealType === 'BREAKFAST');
                  const lunch = dayMeals.find((m) => m.mealType === 'LUNCH');
                  const dinner = dayMeals.find((m) => m.mealType === 'DINNER');

                  return (
                    <div key={day} className="space-y-2">
                      <h4 className="text-sm font-semibold text-primary">Den {day}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Breakfast */}
                        {breakfast && (
                          <MealCard
                            meal={breakfast}
                            mealType="BREAKFAST"
                            isExpanded={expandedMeals.has(breakfast.id)}
                            onToggleExpansion={() => onToggleMealExpansion(breakfast.id)}
                          />
                        )}

                        {/* Lunch */}
                        {lunch && (
                          <MealCard
                            meal={lunch}
                            mealType="LUNCH"
                            isExpanded={expandedMeals.has(lunch.id)}
                            onToggleExpansion={() => onToggleMealExpansion(lunch.id)}
                          />
                        )}

                        {/* Dinner */}
                        {dinner && (
                          <MealCard
                            meal={dinner}
                            mealType="DINNER"
                            isExpanded={expandedMeals.has(dinner.id)}
                            onToggleExpansion={() => onToggleMealExpansion(dinner.id)}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}