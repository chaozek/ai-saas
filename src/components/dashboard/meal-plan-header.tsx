"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, BarChart3 } from "lucide-react";
import { MealPlan } from "./types";

interface MealPlanHeaderProps {
  mealPlan: MealPlan;
}

export function MealPlanHeader({ mealPlan }: MealPlanHeaderProps) {
  const getNutritionValue = (value: number | null) => value || 0;

  return (
    <>
      {/* Compact Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            {mealPlan.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            {mealPlan.duration} dní • {mealPlan.meals?.length || 0} jídel • {getNutritionValue(mealPlan.caloriesPerDay)} kal/den
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-xs">
            {Math.ceil(mealPlan.duration / 7)} Týdnů
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {mealPlan.meals?.filter((m: any) => m.mealType === 'BREAKFAST').length || 0} B
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {mealPlan.meals?.filter((m: any) => m.mealType === 'LUNCH').length || 0} L
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {mealPlan.meals?.filter((m: any) => m.mealType === 'DINNER').length || 0} D
          </Badge>
        </div>
      </div>

      {/* Compact Nutrition Overview */}
      <Card className="border border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="w-4 h-4 text-primary" />
            Denní cíle
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
              <div className="text-lg font-bold text-red-600 dark:text-red-400">{getNutritionValue(mealPlan.caloriesPerDay)}</div>
              <p className="text-xs text-red-700 dark:text-red-300">Kalorie</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{getNutritionValue(mealPlan.proteinPerDay)}g</div>
              <p className="text-xs text-blue-700 dark:text-blue-300">Bílkoviny</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
              <div className="text-lg font-bold text-green-600 dark:text-green-400">{getNutritionValue(mealPlan.carbsPerDay)}g</div>
              <p className="text-xs text-green-700 dark:text-green-300">Sacharidy</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
              <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{getNutritionValue(mealPlan.fatPerDay)}g</div>
              <p className="text-xs text-orange-700 dark:text-orange-300">Tuky</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}