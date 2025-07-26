"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar } from "lucide-react";
import { MealPlanHeader } from "./meal-plan-header";
import { WeekMeals } from "./week-meals";
import { ShoppingListModal } from "./shopping-list-modal";
import { MealPlan, Meal } from "./types";
import { useTRPC } from "@/trcp/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
  const [generatingMealPlan, setGeneratingMealPlan] = useState(false);
  const [regeneratingMeals, setRegeneratingMeals] = useState<Set<string>>(new Set());
  const [shoppingListModalOpen, setShoppingListModalOpen] = useState(false);
  const [selectedWeekNumber, setSelectedWeekNumber] = useState<number | null>(null);
  const [shoppingListContent, setShoppingListContent] = useState<string>('');
  const trpc = useTRPC();
  const queryClient = useQueryClient();

    const enableMealPlanningAndGenerate = useMutation(trpc.fitness.enableMealPlanningAndGenerate.mutationOptions({
    onSuccess: (data) => {
      toast.success("Jídelní plánování povoleno a generování zahájeno!");
      setGeneratingMealPlan(false);

      // Invalidate queries to refresh data
      queryClient.invalidateQueries(trpc.fitness.getProfile.queryOptions());
      queryClient.invalidateQueries(trpc.fitness.getCurrentMealPlan.queryOptions());
      queryClient.invalidateQueries(trpc.fitness.getMealPlans.queryOptions());

      // Start polling for updates and errors
      const interval = setInterval(async () => {
        try {
          // Check for error projects using TRPC
          const projects = await queryClient.fetchQuery(trpc.projects.getmany.queryOptions());

          // Check for error messages
          const errorProject = projects?.find((p: any) =>
            p.name?.includes('Error') &&
            p.messages?.some((m: any) => m.type === 'ERROR')
          );

          if (errorProject) {
            const errorMessage = errorProject.messages.find((m: any) => m.type === 'ERROR')?.content;
            if (errorMessage) {
              toast.error(errorMessage);
              clearInterval(interval);
              setGeneratingMealPlan(false);
              return;
            }
          }

          // Check for successful completion
          queryClient.invalidateQueries(trpc.fitness.getProfile.queryOptions());
          queryClient.invalidateQueries(trpc.fitness.getCurrentMealPlan.queryOptions());
          queryClient.invalidateQueries(trpc.fitness.getMealPlans.queryOptions());
        } catch (error) {
          console.error("Error polling for updates:", error);
        }
      }, 3000); // Check every 3 seconds

      // Stop polling after 2 minutes
      setTimeout(() => {
        clearInterval(interval);
      }, 120000);
    },
    onError: (error: any) => {
      toast.error(error.message || "Nepodařilo se povolit jídelní plánování. Zkuste to prosím znovu.");
      setGeneratingMealPlan(false);
      console.error("Meal planning enable error:", error);
    }
  }));

  const generateMealPlanOnly = useMutation(trpc.fitness.generateMealPlanOnly.mutationOptions({
    onSuccess: (data) => {
      toast.success("Generování jídelního plánu zahájeno!");
      setGeneratingMealPlan(false);

      // Invalidate queries to refresh data
      queryClient.invalidateQueries(trpc.fitness.getCurrentMealPlan.queryOptions());
      queryClient.invalidateQueries(trpc.fitness.getMealPlans.queryOptions());

      // Start polling for updates and errors
      const interval = setInterval(async () => {
        try {
          // Check for error projects using TRPC
          const projects = await queryClient.fetchQuery(trpc.projects.getmany.queryOptions());

          // Check for error messages
          const errorProject = projects?.find((p: any) =>
            p.name?.includes('Error') &&
            p.messages?.some((m: any) => m.type === 'ERROR')
          );

          if (errorProject) {
            const errorMessage = errorProject.messages.find((m: any) => m.type === 'ERROR')?.content;
            if (errorMessage) {
              toast.error(errorMessage);
              clearInterval(interval);
              setGeneratingMealPlan(false);
              return;
            }
          }

          // Check for successful completion
          queryClient.invalidateQueries(trpc.fitness.getCurrentMealPlan.queryOptions());
          queryClient.invalidateQueries(trpc.fitness.getMealPlans.queryOptions());
        } catch (error) {
          console.error("Error polling for updates:", error);
        }
      }, 3000); // Check every 3 seconds

      // Stop polling after 2 minutes
      setTimeout(() => {
        clearInterval(interval);
      }, 120000);
    },
    onError: (error: any) => {
      // Zobraz konkrétní chybovou zprávu
      const errorMessage = error.message || "Nepodařilo se vygenerovat jídelní plán. Zkuste to prosím znovu.";
      toast.error(errorMessage);
      setGeneratingMealPlan(false);
      console.error("Meal plan generation error:", error);
    }
  }));

  const regenerateMeal = useMutation(trpc.fitness.regenerateMeal.mutationOptions({
    onSuccess: (data) => {
      // Show that regeneration started
      toast.info("Regenerování jídla začalo...");
      console.log("Meal regeneration started for meal:", data.mealId);

      // Store original meal data for comparison
      const originalMeal = mealPlan?.meals?.find((meal: any) => meal.id === data.mealId);
      const originalName = originalMeal?.name;

      // Start polling for completion
      const pollInterval = setInterval(async () => {
        try {
          // Get fresh data to check if meal was updated
          const freshData = await queryClient.fetchQuery(trpc.fitness.getCurrentMealPlan.queryOptions());

          if (freshData) {
            // Check if the meal was actually regenerated (has new name)
            const updatedMeal = freshData.meals?.find((meal: any) => meal.id === data.mealId);

            console.log("Polling check:", {
              mealId: data.mealId,
              originalName,
              currentName: updatedMeal?.name,
              hasChanged: updatedMeal && updatedMeal.name !== originalName
            });

            if (updatedMeal && updatedMeal.name !== originalName) {
              // Meal was successfully regenerated
              clearInterval(pollInterval);
              toast.success("Jídlo úspěšně regenerováno!");
              setRegeneratingMeals(new Set());

              // Final refresh
              queryClient.invalidateQueries(trpc.fitness.getProfile.queryOptions());
              queryClient.invalidateQueries(trpc.fitness.getCurrentMealPlan.queryOptions());
              queryClient.invalidateQueries(trpc.fitness.getMealPlans.queryOptions());
            }
          }
        } catch (error) {
          console.error("Error polling for meal regeneration:", error);
        }
      }, 3000); // Check every 3 seconds

      // Stop polling after 2 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        setRegeneratingMeals(new Set());
        toast.error("Regenerování jídla trvalo příliš dlouho. Zkuste to prosím znovu.");
      }, 120000);
    },
    onError: (error: any) => {
      toast.error("Nepodařilo se regenerovat jídlo. Zkuste to prosím znovu.");
      // Clear all regenerating meals on error
      setRegeneratingMeals(new Set());
      console.error("Meal regeneration error:", error);
    }
  }));

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

    const generateShoppingList = useMutation(trpc.fitness.generateShoppingList.mutationOptions({
    onSuccess: (data) => {
      toast.success("Generování nákupního seznamu zahájeno!");
      // Reset loading state for all weeks since we don't know which one was clicked
      setGeneratingList({});
    },
    onError: (error: any) => {
      toast.error("Nepodařilo se vygenerovat nákupní seznam. Zkuste to prosím znovu.");
      // Reset loading state for all weeks
      setGeneratingList({});
      console.error("Shopping list generation error:", error);
    }
  }));

  const handleGenerateShoppingList = async (weekNumber: number, weekMeals: Meal[]) => {
    setGeneratingList(prev => ({ ...prev, [weekNumber]: true }));
    generateShoppingList.mutate({
      weekNumber,
      weekMeals
    });
  };

  const handleFetchShoppingList = async (weekNumber: number) => {
    try {
      const response = await fetch(`/api/shopping-list/${weekNumber}`);

      if (!response.ok) {
        if (response.status === 404) {
          toast.error(`Nákupní seznam pro týden ${weekNumber} nebyl nalezen. Vygenerujte ho nejdříve.`);
        } else {
          toast.error('Chyba při načítání nákupního seznamu');
        }
        return;
      }

      const data = await response.json();
      setShoppingListContent(data.content);
      setSelectedWeekNumber(weekNumber);
      setShoppingListModalOpen(true);
    } catch (error) {
      console.error('Error fetching shopping list:', error);
      toast.error('Chyba při načítání nákupního seznamu');
    }
  };

  const handleGenerateMealPlan = () => {
    setGeneratingMealPlan(true);
    if (!fitnessProfile?.mealPlanningEnabled) {
      enableMealPlanningAndGenerate.mutate();
    } else {
      generateMealPlanOnly.mutate();
    }
  };

  const handleRegenerateMeal = (mealId: string) => {
    setRegeneratingMeals(prev => new Set(prev).add(mealId));
    regenerateMeal.mutate({ mealId });
  };

  if (!fitnessProfile?.mealPlanningEnabled) {
    return (
      <div className="text-center space-y-4 py-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto relative">
          <Calendar className="w-8 h-8 text-primary" />
          {/* Glowing badge */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
              Doporučujeme
            </div>
          </div>
        </div>
        <h2 className="text-xl font-bold">Jídelní plánování není povoleno</h2>
        <p className="text-muted-foreground max-w-md mx-auto text-sm">
          Povolte jídelní plánování v vašem fitness hodnocení pro získání osobních jídelních plánů s AI generovanými recepty.
        </p>
        <Button onClick={handleGenerateMealPlan} disabled={generatingMealPlan} className="mt-4">
          {generatingMealPlan ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generuji...
            </>
          ) : (
            "Povolit jídelní plánování"
          )}
        </Button>
      </div>
    );
  }

  // Check if meal plan is still generating - this should be checked FIRST
  if (generatingMealPlan || shouldShowLoading || (currentMealPlanLoading && !currentMealPlan)) {
    return (
      <div className="space-y-4">
        <div className="text-center space-y-4 py-8">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <h3 className="text-lg font-medium">Generuji jídelní plán...</h3>
          <p className="text-sm text-muted-foreground">Vytvářím personalizovaná jídla a recepty pro vaše nutriční cíle</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span>Může to trvat několik minut</span>
          </div>
        </div>

        {/* Show empty weeks structure while generating */}
        <div className="space-y-4">
          {Array.from({ length: 4 }, (_, weekIndex) => {
            const weekNumber = weekIndex + 1;
            return (
              <div key={weekIndex} className="border rounded-lg p-4 bg-muted/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Týden {weekNumber}</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span className="text-sm text-muted-foreground">Generuji...</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {['Snídaně', 'Oběd', 'Večeře'].map((mealType, mealIndex) => (
                    <div key={mealIndex} className="flex items-center justify-between p-3 bg-background rounded-md">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-muted rounded-full animate-pulse"></div>
                        <div>
                          <div className="h-4 bg-muted rounded animate-pulse w-32"></div>
                          <div className="h-3 bg-muted rounded animate-pulse w-24 mt-1"></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                        <span className="text-xs text-muted-foreground">Generuji {mealType.toLowerCase()}...</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
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
        <Button
          onClick={handleGenerateMealPlan}
          disabled={generatingMealPlan}
          className="mt-4"
        >
          {generatingMealPlan ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generuji...
            </>
          ) : (
            "Vygenerovat nový jídelní plán"
          )}
        </Button>
      </div>
    );
  }

  // Ensure mealPlan exists before rendering
  if (!mealPlan) {
    return null;
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
              onRegenerateMeal={handleRegenerateMeal}
              regeneratingMeals={regeneratingMeals}
            />
          );
        })}
      </div>

      {/* Shopping List Modal */}
      <ShoppingListModal
        open={shoppingListModalOpen}
        onOpenChange={setShoppingListModalOpen}
        selectedWeekNumber={selectedWeekNumber}
        shoppingListContent={shoppingListContent}
      />
    </div>
  );
}