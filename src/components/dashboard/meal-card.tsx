"use client"

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChefHat, ChevronDown } from "lucide-react";
import { Meal, Recipe } from "./types";

interface MealCardProps {
  meal: Meal;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER';
  isExpanded: boolean;
  onToggleExpansion: () => void;
}

export function MealCard({ meal, mealType, isExpanded, onToggleExpansion }: MealCardProps) {
  const getMealTypeLabel = (type: string) => {
    switch (type) {
      case 'BREAKFAST': return 'SNÍDANĚ';
      case 'LUNCH': return 'OBĚD';
      case 'DINNER': return 'VEČEŘE';
      case 'SNACK': return 'SVAČINA';
      default: return type;
    }
  };

  const getMealTypeVariant = (type: string) => {
    switch (type) {
      case 'BREAKFAST': return 'default';
      case 'LUNCH': return 'secondary';
      case 'DINNER': return 'outline';
      case 'SNACK': return 'secondary';
      default: return 'secondary';
    }
  };

  const getTotalTime = () => {
    const prepTime = meal.prepTime || 0;
    const cookTime = meal.cookTime || 0;
    return prepTime + cookTime;
  };

  const getNutritionValue = (value: number | null) => value || 0;

  const renderIngredients = (recipe: Recipe) => {
    try {
      const ingredients = JSON.parse(recipe.ingredients);
      return ingredients.map((ingredient: any, idx: number) => (
        <div key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
          <div className="w-1 h-1 rounded-full bg-muted-foreground"></div>
          {ingredient.amount} {ingredient.unit} {ingredient.name}
        </div>
      ));
    } catch (e) {
      return <div className="text-xs text-muted-foreground">Suroviny nejsou k dispozici</div>;
    }
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggleExpansion}>
      <div className="group hover:bg-muted/50 transition-colors rounded-lg p-3 border border-border">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h5 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
              {meal.name}
            </h5>
            <p className="text-xs text-muted-foreground">
              {getTotalTime()} min
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getMealTypeVariant(mealType) as any} className="text-xs flex-shrink-0">
              {getMealTypeLabel(mealType)}
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
            <div className="text-xs text-muted-foreground">kal</div>
          </div>
          <div className="flex-1 text-center p-2 rounded bg-blue-50 dark:bg-blue-950/20">
            <div className="text-xs font-bold text-blue-600 dark:text-blue-400">{getNutritionValue(meal.protein)}g</div>
            <div className="text-xs text-muted-foreground">P</div>
          </div>
          <div className="flex-1 text-center p-2 rounded bg-green-50 dark:bg-green-950/20">
            <div className="text-xs font-bold text-green-600 dark:text-green-400">{getNutritionValue(meal.carbs)}g</div>
            <div className="text-xs text-muted-foreground">C</div>
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
                <div className="flex items-center gap-2">
                  <ChefHat className="w-3 h-3 text-primary" />
                  <p className="text-xs font-medium">{recipe.name}</p>
                </div>

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
                    <p className="text-xs text-muted-foreground">{recipe.instructions}</p>
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