"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar } from "lucide-react";
import { MealPlanHeader } from "./meal-plan-header";
import { WeekMeals } from "./week-meals";
import { MealPlan, Meal } from "./types";

interface MealsTabProps {
  fitnessProfile: any;
  shouldShowLoading: boolean | null | undefined;
  currentMealPlanLoading: boolean;
  currentMealPlan: MealPlan | null | undefined;
  mealPlan: MealPlan | null | undefined;
}

export function MealsTab({
  fitnessProfile,
  shouldShowLoading,
  currentMealPlanLoading,
  currentMealPlan,
  mealPlan
}: MealsTabProps) {
  const [expandedMeals, setExpandedMeals] = useState<Set<string>>(new Set());
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set());
  const [generatingList, setGeneratingList] = useState<{[weekNumber: number]: boolean}>({});

  const toggleMealExpansion = (mealId: string) => {
    setExpandedMeals(prev => {
      const newSet = new Set(prev);
      if (newSet.has(mealId)) {
        newSet.delete(mealId);
      } else {
        newSet.add(mealId);
      }
      return newSet;
    });
  };

  const toggleWeekExpansion = (weekNumber: number) => {
    setExpandedWeeks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(weekNumber)) {
        newSet.delete(weekNumber);
      } else {
        newSet.add(weekNumber);
      }
      return newSet;
    });
  };

  const handleGenerateShoppingList = async (weekNumber: number, weekMeals: Meal[]) => {
    setGeneratingList(prev => ({ ...prev, [weekNumber]: true }));
    // This would be implemented with the actual API call
    setTimeout(() => {
      setGeneratingList(prev => ({ ...prev, [weekNumber]: false }));
    }, 2000);
  };

  const handleFetchShoppingList = async (weekNumber: number) => {
    // This would be implemented with the actual API call
    console.log('Fetching shopping list for week', weekNumber);
  };

  if (!fitnessProfile?.mealPlanningEnabled) {
    return (
      <div className="text-center space-y-4 py-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <Calendar className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold">Jídelní plánování není povoleno</h2>
        <p className="text-muted-foreground max-w-md mx-auto text-sm">
          Povolte jídelní plánování v vašem fitness hodnocení pro získání osobních jídelních plánů s AI generovanými recepty.
        </p>
        <Button onClick={() => window.location.href = '/'} className="mt-4">
          Aktualizovat hodnocení
        </Button>
      </div>
    );
  }

  // Check if meal plan is still generating
  if (shouldShowLoading || (currentMealPlanLoading && !currentMealPlan)) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <h3 className="text-lg font-medium">Generuji jídelní plán...</h3>
          <p className="text-sm text-muted-foreground">Vytvářím personalizovaná jídla a recepty pro vaše nutriční cíle</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span>Může to trvat několik minut</span>
          </div>
        </div>
      </div>
    );
  }

  if (!mealPlan) {
    return (
      <div className="text-center space-y-4 py-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <Calendar className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold">Jídelní plán nenalezen</h2>
        <p className="text-muted-foreground max-w-md mx-auto text-sm">
          Vaši jídelní plán se vytváří. Prosím, zkontrolujte znovu za pár minut.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <span>Vytvářím vaši osobní jídelní plán...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <MealPlanHeader mealPlan={mealPlan} />

      {/* Compact Weekly Organization */}
      <div className="space-y-4">
        {Array.from({ length: Math.ceil(mealPlan.duration / 7) }, (_, weekIndex) => {
          const weekNumber = weekIndex + 1;
          const weekMeals = mealPlan.meals?.filter((meal: any) =>
            meal.dayOfWeek >= weekIndex * 7 + 1 && meal.dayOfWeek <= (weekIndex + 1) * 7
          ).sort((a: any, b: any) => {
            // First sort by day of week
            if (a.dayOfWeek !== b.dayOfWeek) {
              return a.dayOfWeek - b.dayOfWeek;
            }
            // Then sort by meal type (Breakfast, Lunch, Dinner)
            const mealTypeOrder = { 'BREAKFAST': 1, 'LUNCH': 2, 'DINNER': 3 };
            return (mealTypeOrder[a.mealType as keyof typeof mealTypeOrder] || 0) -
                   (mealTypeOrder[b.mealType as keyof typeof mealTypeOrder] || 0);
          }) || [];

          return (
            <WeekMeals
              key={weekIndex}
              weekNumber={weekNumber}
              weekMeals={weekMeals}
              weekIndex={weekIndex}
              mealPlanDuration={mealPlan.duration}
              expandedWeeks={expandedWeeks}
              generatingList={generatingList}
              onToggleWeekExpansion={toggleWeekExpansion}
              onGenerateShoppingList={handleGenerateShoppingList}
              onFetchShoppingList={handleFetchShoppingList}
              expandedMeals={expandedMeals}
              onToggleMealExpansion={toggleMealExpansion}
            />
          );
        })}
      </div>
    </div>
  );
}