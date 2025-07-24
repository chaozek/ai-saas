"use client"

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useClerk } from "@clerk/nextjs";
import { useTRPC } from "@/trcp/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

// Import all dashboard components
import {
  DashboardHeader,
  StatsOverview,
  PlanOverview,
  WorkoutsTab,
  MealsTab,
  ProgressTab,
  OverviewTab,
  ShoppingListModal,
  LoadingState,
  NoProfileState,
  NoWorkoutPlanState,
  UnauthorizedState,
  WorkoutPlan,
  FitnessProfile
} from "@/components/dashboard";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const { user } = useClerk();
  const { signOut } = useClerk();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  // Shopping list modal state
  const [shoppingListModalOpen, setShoppingListModalOpen] = useState(false);
  const [selectedWeekNumber, setSelectedWeekNumber] = useState<number | null>(null);
  const [shoppingListContent, setShoppingListContent] = useState<string>("");

  // Fetch fitness profile and plans with fresh data
  const { data: fitnessProfile, isLoading: profileLoading, error: profileError } = useQuery({
    ...trpc.fitness.getProfile.queryOptions(),
    staleTime: 10000, // 10 seconds stale time - more responsive
    refetchOnMount: true, // Always refetch on mount
  });

  const { data: workoutPlans, isLoading: plansLoading, error: plansError } = useQuery({
    ...trpc.fitness.getWorkoutPlans.queryOptions(),
    staleTime: 0, // Always fresh data
    refetchOnMount: true, // Always refetch on mount
  });

  const { data: mealPlans, isLoading: mealPlansLoading, error: mealPlansError } = useQuery({
    ...trpc.fitness.getMealPlans.queryOptions(),
    staleTime: 0, // Always fresh data
    refetchOnMount: true, // Always refetch on mount
  });

  const { data: currentMealPlan, isLoading: currentMealPlanLoading, error: currentMealPlanError } = useQuery({
    ...trpc.fitness.getCurrentMealPlan.queryOptions(),
    staleTime: 0, // Always fresh data
    refetchOnMount: true, // Always refetch on mount
  });

  const error = profileError || plansError;
  // Use currentPlan from profile - this should always be the most recent active plan
  const workoutPlan = fitnessProfile?.currentPlan;
  const mealPlan = currentMealPlan || mealPlans?.[0];

  // Simple refresh: if plan exists but has no workouts, keep refreshing
  useEffect(() => {
    if (workoutPlan && workoutPlan.workouts.length === 0) {
      const interval = setInterval(() => {
        queryClient.invalidateQueries(trpc.fitness.getProfile.queryOptions());
      }, 3000); // Refresh every 3 seconds

      return () => clearInterval(interval);
    }
  }, [workoutPlan?.workouts?.length, queryClient, trpc.fitness.getProfile]);

  // Check if we should show loading (simple check)
  const shouldShowLoading = useMemo(() => {
    return workoutPlan && workoutPlan.workouts.length === 0;
  }, [workoutPlan?.workouts?.length]);

  // Function to generate shopping list for a week
  const generateShoppingList = useMutation(trpc.fitness.generateShoppingList.mutationOptions({
    onSuccess: (data) => {
      toast.success(data.message);
      // Wait a moment for the Inngest function to complete, then fetch the shopping list
      setTimeout(() => {
        fetchShoppingListContent(selectedWeekNumber!);
      }, 3000); // Wait 3 seconds for the Inngest function to complete
    },
    onError: (error: any) => {
      toast.error("Neúspěšné vygenerování nákupního seznamu");
      console.error("Shopping list error:", error);
    },
  }));

  // Function to fetch shopping list content from the generated project
  const fetchShoppingListContent = async (weekNumber: number) => {
    try {
      setSelectedWeekNumber(weekNumber);
      setShoppingListContent("Načítám nákupní seznam...");
      setShoppingListModalOpen(true);

      // Fetch the shopping list using the new API endpoint
      const response = await fetch(`/api/shopping-list/${weekNumber}`);

      if (response.ok) {
        const data = await response.json();
        setShoppingListContent(data.content);
      } else if (response.status === 404) {
        setShoppingListContent(`Nákupní seznam pro týden ${weekNumber} nenalezen. Nejprve jej vygenerujte.`);
      } else {
        throw new Error('Failed to fetch shopping list');
      }
    } catch (error) {
      console.error("Error fetching shopping list:", error);
      toast.error("Neúspěšné načítání nákupního seznamu. Prosím, zkuste to znovu.");
      setShoppingListContent("Chyba při načítání nákupního seznamu. Prosím, zkuste to znovu.");
    }
  };

  const handleGenerateShoppingList = async (weekNumber: number, weekMeals: any[]) => {
    generateShoppingList.mutate({
      weekNumber,
      weekMeals,
    });
  };

  const handleFetchShoppingList = async (weekNumber: number) => {
    await fetchShoppingListContent(weekNumber);
  };

  // Handle authentication errors
  if (error && error.message?.includes('UNAUTHORIZED')) {
    return <UnauthorizedState />;
  }

  // Show loading only if we don't have any data yet
  if (profileLoading && !fitnessProfile) {
    return <LoadingState />;
  }

  // Show assessment prompt if no profile exists
  if (!fitnessProfile) {
    return <NoProfileState />;
  }

  if (!workoutPlan) {
    return <NoWorkoutPlanState />;
  }

  const getCurrentWeekWorkouts = () => {
    if (!workoutPlan?.workouts) return [];
    return workoutPlan.workouts.filter((w: any) => w.weekNumber === 1); // Default to week 1
  };

  const getWeekProgress = () => {
    const weekWorkouts = getCurrentWeekWorkouts();
    return weekWorkouts.length > 0 ? 0 : 0; // For now, return 0 progress
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <DashboardHeader userName={user?.firstName} />

        {/* Stats Overview */}
        <StatsOverview
          currentWeek={1}
          workoutPlan={workoutPlan}
          weekProgress={getWeekProgress()}
          currentWeekWorkouts={getCurrentWeekWorkouts()}
        />

        {/* Plan Overview */}
        <PlanOverview workoutPlan={workoutPlan} />

        {/* Main Content */}
        <Tabs defaultValue="workouts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-muted">
            <TabsTrigger value="workouts" className="data-[state=active]:bg-background">Tréninky tohoto týdne</TabsTrigger>
            <TabsTrigger value="meals" className="data-[state=active]:bg-background">Jídelní plány</TabsTrigger>
            <TabsTrigger value="progress" className="data-[state=active]:bg-background">Sledování pokroku</TabsTrigger>
            <TabsTrigger value="overview" className="data-[state=active]:bg-background">Přehled plánu</TabsTrigger>
          </TabsList>

          <TabsContent value="workouts" className="space-y-6">
            <WorkoutsTab
              workoutPlan={workoutPlan}
              shouldShowLoading={shouldShowLoading}
            />
          </TabsContent>

          <TabsContent value="meals" className="space-y-4">
            <MealsTab
              fitnessProfile={fitnessProfile}
              shouldShowLoading={shouldShowLoading}
              currentMealPlanLoading={currentMealPlanLoading}
              currentMealPlan={currentMealPlan}
              mealPlan={mealPlan}
            />
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <ProgressTab />
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <OverviewTab workoutPlan={workoutPlan} currentWeek={1} />
          </TabsContent>
        </Tabs>
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