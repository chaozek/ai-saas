"use client"

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChefHat, ChevronDown, RefreshCw } from "lucide-react";
import { Meal, Recipe } from "./types";

interface MealCardProps {
  meal: Meal;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SUPPLEMENT' | 'SNACK';
  isExpanded: boolean;
  onToggleExpansion: () => void;
  onRegenerateMeal?: (mealId: string) => void;
  isRegenerating?: boolean;
}

export function MealCard({
  meal,
  mealType,
  isExpanded,
  onToggleExpansion,
  onRegenerateMeal,
  isRegenerating = false
}: MealCardProps) {
  // Debug logging for meal nutrition data
  console.log(`MealCard render for ${mealType}:`, {
    id: meal.id,
    name: meal.name,
    calories: meal.calories,
    protein: meal.protein,
    carbs: meal.carbs,
    fat: meal.fat,
    caloriesType: typeof meal.calories,
    proteinType: typeof meal.protein,
    carbsType: typeof meal.carbs,
    fatType: typeof meal.fat
  });

  function getMealTypeLabel(meal: Meal): string {
    if (meal._supplementaryType) {
      switch (meal._supplementaryType) {
        case 'morning_snack':
          return 'Ranní svačina';
        case 'afternoon_snack':
          return 'Odpolední svačina';
        default:
          return 'Doplňující svačina';
      }
    }

    switch (meal.mealType) {
      case 'BREAKFAST':
        return 'Snídaně';
      case 'LUNCH':
        return 'Oběd';
      case 'DINNER':
        return 'Večeře';
      case 'SUPPLEMENT':
      case 'SNACK':
        return 'Doplňující svačina';
      default:
        return meal.mealType || 'Jídlo';
    }
  }

  const getMealTypeVariant = (type: string) => {
    if (meal._supplementaryType) {
      switch (meal._supplementaryType) {
        case 'morning_snack':
          return 'secondary';
        case 'afternoon_snack':
          return 'destructive';
        default:
          return 'destructive';
      }
    }

    switch (type) {
      case 'BREAKFAST':
        return 'default';
      case 'LUNCH':
        return 'secondary';
      case 'DINNER':
        return 'outline';
      case 'SUPPLEMENT':
      case 'SNACK':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getMealTypeColors = (type: string) => {
    if (meal._supplementaryType) {
      switch (meal._supplementaryType) {
        case 'morning_snack':
          return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200';
        case 'afternoon_snack':
          return 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200';
        default:
          return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200';
      }
    }

    switch (type) {
      case 'BREAKFAST':
        return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
      case 'LUNCH':
        return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200';
      case 'DINNER':
        return 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200';
      case 'SUPPLEMENT':
        return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200';
    }
  };



  const getNutritionValue = (value: number | null) => {
    const numValue = value || 0;
    return Number(numValue.toFixed(1));
  };

  const renderIngredients = (recipe: Recipe) => {
    try {
      const ingredients = JSON.parse(recipe.ingredients);
      const totalCost = ingredients.reduce((sum: number, ingredient: any) => {
        return sum + (parseFloat(ingredient.estimatedCost) || 0);
      }, 0);

      return (
        <div className="space-y-1">
          {ingredients.map((ingredient: any, idx: number) => (
            <div key={idx} className="text-xs text-muted-foreground flex items-center justify-between">
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-muted-foreground"></div>
                {ingredient.amount} {ingredient.unit} {ingredient.name}
              </div>
              {ingredient.estimatedCost && (
                <span className="text-green-600 dark:text-green-400 font-medium">
                  {ingredient.estimatedCost} Kč
                </span>
              )}
            </div>
          ))}
          <div className="text-xs font-semibold text-green-700 dark:text-green-300 flex items-center justify-between pt-1 border-t border-border">
            <span>Odhadovaná cena:</span>
            <span>{totalCost.toFixed(0)} Kč</span>
          </div>
        </div>
      );
    } catch (e) {
      return <div className="text-xs text-muted-foreground">Suroviny nejsou k dispozici</div>;
    }
  };

    const renderInstructions = (instructions: string) => {
    // Split instructions by numbered steps (e.g., "1. ", "2. ", etc.)
    const steps = instructions.split(/(?=\d+\.)/).filter(step => step.trim());

    if (steps.length === 0) {
      return <p className="text-xs text-muted-foreground">{instructions}</p>;
    }

    return (
      <ol className="list-decimal list-inside space-y-1">
        {steps.map((step, index) => (
          <li key={index} className="text-xs text-muted-foreground">
            {step.trim().replace(/^\d+\.\s*/, '')}
          </li>
        ))}
      </ol>
    );
  };

  const handleRegenerate = () => {
    if (onRegenerateMeal) {
      onRegenerateMeal(meal.id);
    }
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggleExpansion}>
      <div className="group hover:bg-muted/50 transition-colors rounded-lg p-3 border border-border">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h5 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                {meal.name}
              </h5>
              {onRegenerateMeal && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Přegenerovat jídlo"
                >
                  {isRegenerating ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3 w-3" />
                  )}
                </Button>
              )}
            </div>

          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`text-xs flex-shrink-0 font-semibold border-2 transition-all duration-200 ${getMealTypeColors(mealType)}`}
            >
              {getMealTypeLabel(meal)}
            </Badge>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <ChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>

        {/* Compact Nutrition */}
        <div className="flex gap-2 mb-3">
          <div className="flex-1 text-center p-2 rounded bg-red-50 dark:bg-red-950/20">
            <div className="text-xs font-bold text-red-600 dark:text-red-400">{getNutritionValue(meal.calories)}</div>
            <div className="text-xs text-muted-foreground">Kal</div>
          </div>
          <div className="flex-1 text-center p-2 rounded bg-blue-50 dark:bg-blue-950/20">
            <div className="text-xs font-bold text-blue-600 dark:text-blue-400">{getNutritionValue(meal.protein)}g</div>
            <div className="text-xs text-muted-foreground">P</div>
          </div>
          <div className="flex-1 text-center p-2 rounded bg-green-50 dark:bg-green-950/20">
            <div className="text-xs font-bold text-green-600 dark:text-green-400">{getNutritionValue(meal.carbs)}g</div>
            <div className="text-xs text-muted-foreground">K</div>
          </div>
          <div className="flex-1 text-center p-2 rounded bg-yellow-50 dark:bg-yellow-950/20">
            <div className="text-xs font-bold text-yellow-600 dark:text-yellow-400">{getNutritionValue(meal.fat)}g</div>
            <div className="text-xs text-muted-foreground">T</div>
          </div>
        </div>

        {/* Recipe Info */}
        {meal.recipes?.map((recipe: Recipe) => (
          <div key={recipe.id} className="space-y-1">
            <div className="flex items-center gap-2">
              <ChefHat className="w-3 h-3 text-primary" />
              <p className="text-xs font-medium">{recipe.name}</p>
            </div>
          </div>
        ))}

        {/* Collapsible Details */}
        <CollapsibleContent className="mt-3 pt-3 border-t border-border">
          <div className="space-y-3">
            {meal.recipes?.map((recipe: Recipe) => (
              <div key={recipe.id} className="space-y-2">
                {/* Ingredients */}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-primary">Suroviny:</p>
                  <div className="grid grid-cols-1 gap-1">
                    {renderIngredients(recipe)}
                  </div>
                </div>

                {/* Instructions */}
                {recipe.instructions && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-primary">Pokyny:</p>
                    {renderInstructions(recipe.instructions)}
                  </div>
                )}

                {/* Tags */}
                {recipe.tags && recipe.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {recipe.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}