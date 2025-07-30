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
  PlanDetails,
  UserInfo,
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

  // Demo mode detection
  const demoPlanId = searchParams.get("demoPlanId") || searchParams.get("demoPlanid");
  const isDemoMode = !!demoPlanId;

  // Shopping list modal state
  const [shoppingListModalOpen, setShoppingListModalOpen] = useState(false);
  const [selectedWeekNumber, setSelectedWeekNumber] = useState<number | null>(null);
  const [shoppingListContent, setShoppingListContent] = useState<string>("");

  // Fetch fitness profile and plans with fresh data - only in non-demo mode
  const { data: fitnessProfile, isLoading: profileLoading, error: profileError } = useQuery({
    ...trpc.fitness.getProfile.queryOptions(),
    enabled: !isDemoMode, // Only fetch in non-demo mode
    staleTime: 10000, // 10 seconds stale time - more responsive
    refetchOnMount: true, // Always refetch on mount
  });

  const { data: workoutPlans, isLoading: plansLoading, error: plansError } = useQuery({
    ...trpc.fitness.getWorkoutPlans.queryOptions(),
    enabled: !isDemoMode, // Only fetch in non-demo mode
    staleTime: 0, // Always fresh data
    refetchOnMount: true, // Always refetch on mount
  });

  const { data: mealPlans, isLoading: mealPlansLoading, error: mealPlansError } = useQuery({
    ...trpc.fitness.getMealPlans.queryOptions(),
    enabled: !isDemoMode && !profileLoading && !!fitnessProfile && fitnessProfile.mealPlanningEnabled, // Only fetch in non-demo mode, after profile is loaded, and if meal planning is enabled
    staleTime: 0, // Always fresh data
    refetchOnMount: true, // Always refetch on mount
  });



  const { data: currentMealPlan, isLoading: currentMealPlanLoading, error: currentMealPlanError } = useQuery({
    ...trpc.fitness.getCurrentMealPlan.queryOptions(),
    enabled: !isDemoMode && !profileLoading && !!fitnessProfile && fitnessProfile.mealPlanningEnabled, // Only fetch in non-demo mode, after profile is loaded, and if meal planning is enabled
    staleTime: 0, // Always fresh data
    refetchOnMount: true, // Always refetch on mount
  });

  // Check if user has paid plan
  const { data: paidPlanData, isLoading: paidPlanLoading } = useQuery({
    ...trpc.fitness.hasPaidPlan.queryOptions(),
    enabled: !isDemoMode, // Only fetch in non-demo mode
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Demo plan query - always call useQuery but conditionally enable it
  const { data: demoPlanData, isLoading: demoPlanLoading, error: demoPlanError } = useQuery({
    ...trpc.fitness.getPublicDemoPlan.queryOptions({ planId: demoPlanId || '' }),
    enabled: isDemoMode && !!demoPlanId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const error = (isDemoMode ? demoPlanError : (profileError || plansError || mealPlansError || currentMealPlanError));
  const isLoading = (isDemoMode ? demoPlanLoading : (profileLoading || paidPlanLoading));

  // Debug logging
  if (profileError) {
    console.error('Profile error:', profileError);
  }
  if (plansError) {
    console.error('Plans error:', plansError);
  }
  // Use demo data or user data based on mode
  const workoutPlan = isDemoMode ? demoPlanData?.workoutPlan : (fitnessProfile?.currentPlan || null);
  const mealPlan = isDemoMode ? demoPlanData?.mealPlan : (currentMealPlan || mealPlans?.[0]);
  const profile = isDemoMode ? demoPlanData?.workoutPlan.fitnessProfile : fitnessProfile;

  // Ensure we have valid data before rendering - move this after all hooks are called

  // Debug logging for data structure
  if (fitnessProfile && !isDemoMode) {
    console.log('Fitness profile loaded:', {
      hasCurrentPlan: !!fitnessProfile.currentPlan,
      currentPlanWorkouts: fitnessProfile.currentPlan?.workouts?.length || 0
    });
  }

  if (demoPlanData && isDemoMode) {
    console.log('Demo plan loaded:', {
      hasWorkoutPlan: !!demoPlanData.workoutPlan,
      workoutCount: demoPlanData.workoutPlan?.workouts?.length || 0,
      hasMealPlan: !!demoPlanData.mealPlan
    });
  }
console.log(workoutPlan?.isActive, "workoutPlan")
  // Continuous refresh loop until workoutPlan.isActive becomes true
  useEffect(() => {
    // Only run this effect for non-demo mode
    if (!isDemoMode && paidPlanData?.hasPaidPlan && (!workoutPlan || (workoutPlan && workoutPlan.isActive === false))) {
      const interval = setInterval(() => {
        queryClient.invalidateQueries(trpc.fitness.getProfile.queryOptions());
      }, 3000); // Refresh every 3 seconds

      return () => clearInterval(interval);
    }
  }, [isDemoMode, paidPlanData?.hasPaidPlan, workoutPlan?.isActive, queryClient, trpc.fitness.getProfile]);

  // Continuous refresh loop until mealPlan.isActive becomes true
  useEffect(() => {
    // Only run this effect for non-demo mode, after profile is loaded, and if meal planning is enabled
    if (!isDemoMode && !profileLoading && !!fitnessProfile && fitnessProfile.mealPlanningEnabled && mealPlan && mealPlan.isActive === false) {
      const interval = setInterval(() => {
        queryClient.invalidateQueries(trpc.fitness.getCurrentMealPlan.queryOptions());
        queryClient.invalidateQueries(trpc.fitness.getMealPlans.queryOptions());
      }, 3000); // Refresh every 3 seconds

      return () => clearInterval(interval);
    }
  }, [isDemoMode, profileLoading, fitnessProfile?.mealPlanningEnabled, mealPlan?.isActive, queryClient, trpc.fitness.getCurrentMealPlan, trpc.fitness.getMealPlans]);

  // Check if we should show loading for workout plan
  const shouldShowWorkoutLoading = useMemo(() => {
    return !isDemoMode && paidPlanData?.hasPaidPlan && (!workoutPlan || (workoutPlan && workoutPlan.isActive === false));
  }, [isDemoMode, paidPlanData?.hasPaidPlan, workoutPlan?.isActive]);

  // Check if we should show loading for meal plan
  const shouldShowMealLoading = useMemo(() => {
    return !isDemoMode && !profileLoading && !!fitnessProfile && fitnessProfile.mealPlanningEnabled && mealPlan && mealPlan.isActive === false;
  }, [isDemoMode, profileLoading, fitnessProfile?.mealPlanningEnabled, mealPlan?.isActive]);

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

  // Handle other errors (including 500 errors)
  if (error) {
    console.error('Dashboard error:', error);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-destructive">Chyba při načítání dat</h2>
          <p className="text-muted-foreground">
            {error.message || 'Nastala neočekávaná chyba. Prosím, zkuste obnovit stránku.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Obnovit stránku
          </button>
        </div>
      </div>
    );
  }

  // Show loading only if we don't have any data yet
  if (isDemoMode) {
    if (demoPlanLoading) {
      return <LoadingState />;
    }
    if (!demoPlanData?.workoutPlan) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-destructive">Demo plán nenalezen</h2>
            <p className="text-muted-foreground">
              Požadovaný demo plán nebyl nalezen nebo není veřejně dostupný.
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Zpět na hlavní stránku
            </button>
          </div>
        </div>
      );
    }
  } else {
    if (isLoading && !fitnessProfile) {
      return <LoadingState />;
    }

    // Show assessment prompt if no profile exists
    if (!fitnessProfile) {
      return <NoProfileState />;
    }
console.log(fitnessProfile, "fitnessProfile")
    // If user has paid but no workout plan yet, continue to dashboard
    // The workout plan will be generating in the background and shown in the appropriate tab

    // Show assessment prompt if no workout plan and no paid plan
    if (!workoutPlan && !paidPlanData?.hasPaidPlan) {
      return <NoWorkoutPlanState />;
    }
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
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <DashboardHeader userName={isDemoMode ? "Demo uživatel" : user?.firstName} />

        {/* User Info */}
        <UserInfo fitnessProfile={profile!} />

        {/* Stats Overview */}
        <StatsOverview
          currentWeek={1}
          workoutPlan={workoutPlan}
          weekProgress={getWeekProgress()}
          currentWeekWorkouts={getCurrentWeekWorkouts()}
        />

        {/* Plan Overview */}
        <PlanOverview workoutPlan={workoutPlan} />

        {/* Plan Details */}
        <PlanDetails workoutPlan={workoutPlan} />

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
              shouldShowLoading={shouldShowWorkoutLoading}
              isDemoMode={isDemoMode}
            />
          </TabsContent>

          <TabsContent value="meals" className="space-y-4">
            <MealsTab
              fitnessProfile={profile!}
              shouldShowLoading={shouldShowMealLoading}
              currentMealPlanLoading={isDemoMode ? false : currentMealPlanLoading}
              currentMealPlan={isDemoMode ? mealPlan : currentMealPlan}
              mealPlan={mealPlan}
              isDemoMode={isDemoMode}
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