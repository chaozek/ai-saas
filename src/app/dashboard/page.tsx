"use client"

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  Target,
  TrendingUp,
  Dumbbell,
  Clock,
  CheckCircle,
  Play,
  Pause,
  SkipForward,
  BarChart3,
  Settings,
  Plus,
  Activity,
  Zap,
  Users,
  Trophy,
  ChefHat,
  ShoppingCart,
  Sparkles,
  Loader2,
  X,
  ChevronDown
} from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { useTRPC } from "@/trcp/client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

interface WorkoutPlan {
  name: string;
  description: string;
  duration: number; // weeks
  difficulty: string;
  workouts: Workout[];
}

interface Workout {
  id: string;
  name: string;
  description: string;
  dayOfWeek: number;
  weekNumber: number;
  duration: number;
  exercises: Exercise[];
  completed?: boolean;
}

interface Exercise {
  id: string;
  name: string;
  description: string;
  category: string;
  sets?: number;
  reps?: number;
  duration?: number;
  restTime?: number;
  weight?: number;
}

const DAYS = ["Neděle", "Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota"];

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const { user } = useClerk();
  const { signOut } = useClerk();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [shoppingLists, setShoppingLists] = useState<{[weekNumber: number]: string}>({});
  const [generatingList, setGeneratingList] = useState<{[weekNumber: number]: boolean}>({});
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const trpc = useTRPC();
  const [currentWeek, setCurrentWeek] = useState(1);
  const [debugData, setDebugData] = useState<any>(null);

  // Shopping list modal state
  const [shoppingListModalOpen, setShoppingListModalOpen] = useState(false);
  const [selectedWeekNumber, setSelectedWeekNumber] = useState<number | null>(null);
  const [shoppingListContent, setShoppingListContent] = useState<string>("");

  // Meal card expansion state
  const [expandedMeals, setExpandedMeals] = useState<Set<string>>(new Set());

  // Week expansion state
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set());

  // Check if we're coming from plan generation
  const isGeneratingFromURL = searchParams.get('generating') === 'true';

  // Fetch generation status with polling
  const { data: generationStatus, isLoading: statusLoading } = useQuery({
    ...trpc.fitness.checkGenerationStatus.queryOptions(),
    refetchInterval: 5000, // Check every 5 seconds
    refetchIntervalInBackground: true,
  });

  // Set generating state if coming from URL or if generation is in progress
  useEffect(() => {
    if (isGeneratingFromURL) {
      setIsGeneratingPlan(true);
      // Clear the URL parameter
      router.replace('/dashboard', { scroll: false });
    }
  }, [isGeneratingFromURL, router]);

  // Fetch fitness profile and plans
  const { data: fitnessProfile, isLoading: profileLoading, error: profileError } = useQuery(trpc.fitness.getProfile.queryOptions());

  // Reset generating state when data is successfully loaded
  useEffect(() => {
    if (generationStatus && generationStatus.workoutPlanComplete &&
        (!generationStatus.mealPlanComplete || !fitnessProfile?.mealPlanningEnabled)) {
      setIsGeneratingPlan(false);
    }
  }, [generationStatus, fitnessProfile?.mealPlanningEnabled]);

  const { data: workoutPlans, isLoading: plansLoading, error: plansError } = useQuery(trpc.fitness.getWorkoutPlans.queryOptions());
  const { data: mealPlans, isLoading: mealPlansLoading, error: mealPlansError } = useQuery(trpc.fitness.getMealPlans.queryOptions());
  const { data: currentMealPlan, isLoading: currentMealPlanLoading, error: currentMealPlanError } = useQuery(trpc.fitness.getCurrentMealPlan.queryOptions());

  const error = profileError || plansError;
  // Use currentPlan from profile if available, otherwise fall back to most recent plan
  const workoutPlan = fitnessProfile?.currentPlan || workoutPlans?.[0];
  const mealPlan = currentMealPlan || mealPlans?.[0];



  // Debug query
  const { data: debugDataResult } = useQuery(trpc.fitness.debugPlans.queryOptions());
  console.log('Debug Data:', debugDataResult);

  // Test plan generation
  const testGeneratePlan = useMutation(trpc.fitness.testGeneratePlan.mutationOptions({
    onMutate: () => {
      setIsGeneratingPlan(true);
    },
    onSuccess: () => {
      toast.success("Test plán vygenerován!");
      setIsGeneratingPlan(false);
      window.location.reload();
    },
    onError: (error: any) => {
      toast.error("Neúspěšné vygenerování testovacího plánu");
      console.error("Test plan error:", error);
      setIsGeneratingPlan(false);
    },
  }));

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
    setGeneratingList(prev => ({ ...prev, [weekNumber]: true }));
    setSelectedWeekNumber(weekNumber);

    generateShoppingList.mutate({
      weekNumber,
      weekMeals,
    }, {
      onSettled: () => {
        setGeneratingList(prev => ({ ...prev, [weekNumber]: false }));
      }
    });
  };

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

  // Handle authentication errors
  if (error && error.message?.includes('UNAUTHORIZED')) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Přihlášení vyžadováno</h2>
          <p className="text-muted-foreground">Prosím, přihlaste se pro přístup k vaší fitness nástěnce.</p>
          <Button onClick={() => window.location.href = '/sign-in'}>
            Přihlásit se
          </Button>
        </div>
      </div>
    );
  }

  const getCurrentWeekWorkouts = () => {
    if (!workoutPlan?.workouts) return [];
    return workoutPlan.workouts.filter((w: any) => w.weekNumber === currentWeek);
  };

  const getWeekProgress = () => {
    const weekWorkouts = getCurrentWeekWorkouts();
    return weekWorkouts.length > 0 ? 0 : 0; // For now, return 0 progress
  };



  // Show loading only if we don't have any data yet
  if (statusLoading && !generationStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-lg font-medium">Inicializace nástěnky...</p>
        </div>
      </div>
    );
  }

  // Show assessment prompt if no profile exists
  if (generationStatus && !generationStatus.hasProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Dumbbell className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Profil fitness nenalezen</h2>
          <p className="text-muted-foreground">Prosím, dokončete fitness hodnocení pro vygenerování vašeho plánu.</p>
          <Button onClick={() => window.location.href = '/'}>
            Začít hodnocení
          </Button>
        </div>
      </div>
    );
  }



  if (!workoutPlan) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Dumbbell className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Nebyl nalezen žádný tréninkový plán</h2>
          <p className="text-muted-foreground">Dokončete fitness hodnocení pro vygenerování vašeho plánu.</p>
          <Button onClick={() => window.location.href = '/'}>
            Začít hodnocení
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Vaše fitness nástěnka</h1>
            <p className="text-muted-foreground">Vítejte zpět, {user?.firstName || 'Fitness nadšenec'}!</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Nastavení
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nový plán
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log('Debug Data:', debugDataResult);
                console.log('Profile:', fitnessProfile);
                console.log('Plans:', workoutPlans);
              }}
            >
              Debug
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => testGeneratePlan.mutateAsync()}
              disabled={testGeneratePlan.isPending}
            >
              {testGeneratePlan.isPending ? "Generuji..." : "Test plán"}
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Aktuální týden</p>
                  <p className="text-2xl font-bold">{currentWeek} z {workoutPlan.duration}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Průběh týdne</p>
                  <p className="text-2xl font-bold">{Math.round(getWeekProgress())}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tréninky tento týden</p>
                  <p className="text-2xl font-bold">{getCurrentWeekWorkouts().length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Prům. doba trvání</p>
                  <p className="text-2xl font-bold">45 min</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plan Overview */}
        <Card className="border-2 border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  {workoutPlan.name}
                </CardTitle>
                <CardDescription className="text-base">{workoutPlan.description}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-sm">{workoutPlan.difficulty}</Badge>
                <Badge variant="outline" className="text-sm">{workoutPlan.duration} týdnů</Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="workouts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-muted">
            <TabsTrigger value="workouts" className="data-[state=active]:bg-background">Tréninky tohoto týdne</TabsTrigger>
            <TabsTrigger value="meals" className="data-[state=active]:bg-background">Jídelní plány</TabsTrigger>
            <TabsTrigger value="progress" className="data-[state=active]:bg-background">Sledování pokroku</TabsTrigger>
            <TabsTrigger value="overview" className="data-[state=active]:bg-background">Přehled plánu</TabsTrigger>
          </TabsList>

          <TabsContent value="workouts" className="space-y-6">
            {/* Check if workout plan is still generating */}
            {(isGeneratingPlan || (generationStatus && !generationStatus.workoutPlanComplete)) ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                  <h3 className="text-lg font-medium">Generuji tréninkový plán...</h3>
                  <p className="text-sm text-muted-foreground">Vytvářím personalizované tréninky pro vaše fitness cíle</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span>Může to trvat několik minut</span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Week Navigation */}
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Tréninky týdne {currentWeek}</h2>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentWeek(Math.max(1, currentWeek - 1))}
                      disabled={currentWeek === 1}
                    >
                      Předchozí týden
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentWeek(Math.min(workoutPlan.duration, currentWeek + 1))}
                      disabled={currentWeek === workoutPlan.duration}
                    >
                      Další týden
                    </Button>
                  </div>
                </div>

                {/* Week Progress */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Průběh týdne {currentWeek}</span>
                        <span>{Math.round(getWeekProgress())}%</span>
                      </div>
                      <Progress value={getWeekProgress()} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                {/* Workouts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getCurrentWeekWorkouts().map((workout: any) => (
                <Card key={workout.id} className="transition-all duration-200 hover:shadow-lg border-border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{workout.name}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {DAYS[workout.dayOfWeek]}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {workout.duration} minut
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{workout.description}</p>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Cvičení:</p>
                      <div className="space-y-1">
                        {workout.exercises?.slice(0, 3).map((exercise: any) => (
                          <div key={exercise.id} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <span>{exercise.name}</span>
                          </div>
                        ))}
                        {workout.exercises?.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{workout.exercises.length - 3} dalších cvičení
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        asChild
                      >
                        <Link href={`/workout/${workout.id}`}>
                          <Play className="w-4 h-4 mr-2" />
                          Začít trénink
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm">
                        <SkipForward className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="meals" className="space-y-4">
            {fitnessProfile?.mealPlanningEnabled ? (
              // Check if meal plan is still generating
              (isGeneratingPlan || (generationStatus && !generationStatus.mealPlanComplete)) ? (
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
              ) : mealPlan ? (
                <>
                  {/* Compact Header with Stats */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        {mealPlan.name}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {mealPlan.duration} dní • {mealPlan.meals?.length || 0} jídel • {mealPlan.caloriesPerDay} kal/den
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
                          <div className="text-lg font-bold text-red-600 dark:text-red-400">{mealPlan.caloriesPerDay}</div>
                          <p className="text-xs text-red-700 dark:text-red-300">Kalorie</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{mealPlan.proteinPerDay}g</div>
                          <p className="text-xs text-blue-700 dark:text-blue-300">Bílkoviny</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                          <div className="text-lg font-bold text-green-600 dark:text-green-400">{mealPlan.carbsPerDay}g</div>
                          <p className="text-xs text-green-700 dark:text-green-300">Sacharidy</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
                          <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{mealPlan.fatPerDay}g</div>
                          <p className="text-xs text-orange-700 dark:text-orange-300">Tuky</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

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
                        <Collapsible
                          key={weekIndex}
                          open={expandedWeeks.has(weekNumber)}
                          onOpenChange={() => toggleWeekExpansion(weekNumber)}
                        >
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
                                      {weekMeals.length} jídel • Dny {(weekIndex * 7) + 1}-{Math.min((weekIndex + 1) * 7, mealPlan.duration)}
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
                                      onClick={() => handleGenerateShoppingList(weekNumber, weekMeals)}
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
                                      onClick={() => fetchShoppingListContent(weekNumber)}
                                      className="text-xs"
                                    >
                                      <ShoppingCart className="w-3 h-3 mr-1" />
                                      Zobrazit
                                    </Button>
                                  </div>
                                  <CollapsibleTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <ChevronDown className={`h-4 w-4 transition-transform ${expandedWeeks.has(weekNumber) ? 'rotate-180' : ''}`} />
                                    </Button>
                                  </CollapsibleTrigger>
                                </div>
                              </div>
                            </CardHeader>
                            <CollapsibleContent>
                              <CardContent className="pt-0">
                                <div className="space-y-4">
                              {/* Group meals by day and display in 3-column layout */}
                              {(() => {
                                // Group meals by day
                                const mealsByDay: { [day: number]: any[] } = {};
                                weekMeals.forEach((meal: any) => {
                                  if (!mealsByDay[meal.dayOfWeek]) {
                                    mealsByDay[meal.dayOfWeek] = [];
                                  }
                                  mealsByDay[meal.dayOfWeek].push(meal);
                                });

                                // Sort days and render
                                return Object.keys(mealsByDay)
                                  .map(Number)
                                  .sort((a, b) => a - b)
                                  .map(day => {
                                    const dayMeals = mealsByDay[day];
                                    const breakfast = dayMeals.find((m: any) => m.mealType === 'BREAKFAST');
                                    const lunch = dayMeals.find((m: any) => m.mealType === 'LUNCH');
                                    const dinner = dayMeals.find((m: any) => m.mealType === 'DINNER');

                                    return (
                                      <div key={day} className="space-y-2">
                                        <h4 className="text-sm font-semibold text-primary">Den {day}</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                          {/* Breakfast */}
                                          <Collapsible
                                            open={breakfast ? expandedMeals.has(breakfast.id) : false}
                                            onOpenChange={() => breakfast && toggleMealExpansion(breakfast.id)}
                                          >
                                            <div className="group hover:bg-muted/50 transition-colors rounded-lg p-3 border border-border">
                                              <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1 min-w-0">
                                                  <h5 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                                                    {breakfast?.name || 'Snídaně není naplánována'}
                                                  </h5>
                                                  <p className="text-xs text-muted-foreground">
                                                    {breakfast ? `${breakfast.prepTime + breakfast.cookTime} min` : ''}
                                                  </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                  <Badge variant="default" className="text-xs flex-shrink-0">
                                                    SNÍDANĚ
                                                  </Badge>
                                                  {breakfast && (
                                                    <CollapsibleTrigger asChild>
                                                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                                        <ChevronDown className={`h-3 w-3 transition-transform ${expandedMeals.has(breakfast.id) ? 'rotate-180' : ''}`} />
                                                      </Button>
                                                    </CollapsibleTrigger>
                                                  )}
                                                </div>
                                              </div>

                                              {breakfast && (
                                                <>
                                                  {/* Compact Nutrition */}
                                                  <div className="flex gap-2 mb-3">
                                                    <div className="flex-1 text-center p-2 rounded bg-red-50 dark:bg-red-950/20">
                                                      <div className="text-xs font-bold text-red-600 dark:text-red-400">{breakfast.calories}</div>
                                                      <div className="text-xs text-muted-foreground">kal</div>
                                                    </div>
                                                    <div className="flex-1 text-center p-2 rounded bg-blue-50 dark:bg-blue-950/20">
                                                      <div className="text-xs font-bold text-blue-600 dark:text-blue-400">{breakfast.protein}g</div>
                                                      <div className="text-xs text-muted-foreground">P</div>
                                                    </div>
                                                    <div className="flex-1 text-center p-2 rounded bg-green-50 dark:bg-green-950/20">
                                                      <div className="text-xs font-bold text-green-600 dark:text-green-400">{breakfast.carbs}g</div>
                                                      <div className="text-xs text-muted-foreground">C</div>
                                                    </div>
                                                  </div>

                                                  {/* Recipe Info */}
                                                  {breakfast.recipes?.map((recipe: any) => (
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
                                                      {breakfast.recipes?.map((recipe: any) => (
                                                        <div key={recipe.id} className="space-y-2">
                                                          <div className="flex items-center gap-2">
                                                            <ChefHat className="w-3 h-3 text-primary" />
                                                            <p className="text-xs font-medium">{recipe.name}</p>
                                                          </div>

                                                          {/* Ingredients */}
                                                          <div className="space-y-1">
                                                            <p className="text-xs font-medium text-primary">Suroviny:</p>
                                                            <div className="grid grid-cols-1 gap-1">
                                                              {(() => {
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
                                                              })()}
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
                                                </>
                                              )}
                                            </div>
                                          </Collapsible>

                                          {/* Lunch */}
                                          <Collapsible
                                            open={lunch ? expandedMeals.has(lunch.id) : false}
                                            onOpenChange={() => lunch && toggleMealExpansion(lunch.id)}
                                          >
                                            <div className="group hover:bg-muted/50 transition-colors rounded-lg p-3 border border-border">
                                              <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1 min-w-0">
                                                  <h5 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                                                    {lunch?.name || 'Oběd není naplánován'}
                                                  </h5>
                                                  <p className="text-xs text-muted-foreground">
                                                    {lunch ? `${lunch.prepTime + lunch.cookTime} min` : ''}
                                                  </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                                                    OBĚD
                                                  </Badge>
                                                  {lunch && (
                                                    <CollapsibleTrigger asChild>
                                                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                                        <ChevronDown className={`h-3 w-3 transition-transform ${expandedMeals.has(lunch.id) ? 'rotate-180' : ''}`} />
                                                      </Button>
                                                    </CollapsibleTrigger>
                                                  )}
                                                </div>
                                              </div>

                                              {lunch && (
                                                <>
                                                  {/* Compact Nutrition */}
                                                  <div className="flex gap-2 mb-3">
                                                    <div className="flex-1 text-center p-2 rounded bg-red-50 dark:bg-red-950/20">
                                                      <div className="text-xs font-bold text-red-600 dark:text-red-400">{lunch.calories}</div>
                                                      <div className="text-xs text-muted-foreground">kal</div>
                                                    </div>
                                                    <div className="flex-1 text-center p-2 rounded bg-blue-50 dark:bg-blue-950/20">
                                                      <div className="text-xs font-bold text-blue-600 dark:text-blue-400">{lunch.protein}g</div>
                                                      <div className="text-xs text-muted-foreground">P</div>
                                                    </div>
                                                    <div className="flex-1 text-center p-2 rounded bg-green-50 dark:bg-green-950/20">
                                                      <div className="text-xs font-bold text-green-600 dark:text-green-400">{lunch.carbs}g</div>
                                                      <div className="text-xs text-muted-foreground">C</div>
                                                    </div>
                                                  </div>

                                                  {/* Recipe Info */}
                                                  {lunch.recipes?.map((recipe: any) => (
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
                                                      {lunch.recipes?.map((recipe: any) => (
                                                        <div key={recipe.id} className="space-y-2">
                                                          <div className="flex items-center gap-2">
                                                            <ChefHat className="w-3 h-3 text-primary" />
                                                            <p className="text-xs font-medium">{recipe.name}</p>
                                                          </div>

                                                          {/* Ingredients */}
                                                          <div className="space-y-1">
                                                            <p className="text-xs font-medium text-primary">Suroviny:</p>
                                                            <div className="grid grid-cols-1 gap-1">
                                                              {(() => {
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
                                                              })()}
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
                                                </>
                                              )}
                                            </div>
                                          </Collapsible>

                                          {/* Dinner */}
                                          <Collapsible
                                            open={dinner ? expandedMeals.has(dinner.id) : false}
                                            onOpenChange={() => dinner && toggleMealExpansion(dinner.id)}
                                          >
                                            <div className="group hover:bg-muted/50 transition-colors rounded-lg p-3 border border-border">
                                              <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1 min-w-0">
                                                  <h5 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                                                    {dinner?.name || 'Večeře není naplánována'}
                                                  </h5>
                                                  <p className="text-xs text-muted-foreground">
                                                    {dinner ? `${dinner.prepTime + dinner.cookTime} min` : ''}
                                                  </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                  <Badge variant="outline" className="text-xs flex-shrink-0">
                                                    VEČEŘE
                                                  </Badge>
                                                  {dinner && (
                                                    <CollapsibleTrigger asChild>
                                                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                                        <ChevronDown className={`h-3 w-3 transition-transform ${expandedMeals.has(dinner.id) ? 'rotate-180' : ''}`} />
                                                      </Button>
                                                    </CollapsibleTrigger>
                                                  )}
                                                </div>
                                              </div>

                                              {dinner && (
                                                <>
                                                  {/* Compact Nutrition */}
                                                  <div className="flex gap-2 mb-3">
                                                    <div className="flex-1 text-center p-2 rounded bg-red-50 dark:bg-red-950/20">
                                                      <div className="text-xs font-bold text-red-600 dark:text-red-400">{dinner.calories}</div>
                                                      <div className="text-xs text-muted-foreground">kal</div>
                                                    </div>
                                                    <div className="flex-1 text-center p-2 rounded bg-blue-50 dark:bg-blue-950/20">
                                                      <div className="text-xs font-bold text-blue-600 dark:text-blue-400">{dinner.protein}g</div>
                                                      <div className="text-xs text-muted-foreground">P</div>
                                                    </div>
                                                    <div className="flex-1 text-center p-2 rounded bg-green-50 dark:bg-green-950/20">
                                                      <div className="text-xs font-bold text-green-600 dark:text-green-400">{dinner.carbs}g</div>
                                                      <div className="text-xs text-muted-foreground">C</div>
                                                    </div>
                                                  </div>

                                                  {/* Recipe Info */}
                                                  {dinner.recipes?.map((recipe: any) => (
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
                                                      {dinner.recipes?.map((recipe: any) => (
                                                        <div key={recipe.id} className="space-y-2">
                                                          <div className="flex items-center gap-2">
                                                            <ChefHat className="w-3 h-3 text-primary" />
                                                            <p className="text-xs font-medium">{recipe.name}</p>
                                                          </div>

                                                          {/* Ingredients */}
                                                          <div className="space-y-1">
                                                            <p className="text-xs font-medium text-primary">Suroviny:</p>
                                                            <div className="grid grid-cols-1 gap-1">
                                                              {(() => {
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
                                                              })()}
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
                                                </>
                                              )}
                                            </div>
                                          </Collapsible>
                                        </div>
                                      </div>
                                    );
                                  });
                              })()}
                            </div>
                          </CardContent>
                            </CollapsibleContent>
                        </Card>
                          </Collapsible>
                      );
                    })}
                  </div>
                </>
              ) : (
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
              )
            ) : (
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
            )}
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Progresní analýzy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center space-y-2 p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">12</div>
                    <p className="text-sm text-muted-foreground">Tréninky dokončeny</p>
                  </div>
                  <div className="text-center space-y-2 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">85%</div>
                    <p className="text-sm text-muted-foreground">Spojitost</p>
                  </div>
                  <div className="text-center space-y-2 p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">540</div>
                    <p className="text-sm text-muted-foreground">Minut trénováno</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Úplný přehled plánu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: workoutPlan.duration }, (_, week) => (
                    <div key={week} className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                        week + 1 === currentWeek
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {week + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Týden {week + 1}</p>
                        <p className="text-sm text-muted-foreground">
                          {workoutPlan.workouts.filter(w => w.weekNumber === week + 1).length} tréninky
                        </p>
                      </div>
                      <Badge variant={week + 1 === currentWeek ? "default" : "secondary"}>
                        {week + 1 === currentWeek ? "Aktuální" : "Příští"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Shopping List Modal */}
      <Dialog open={shoppingListModalOpen} onOpenChange={setShoppingListModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Nákupní seznam pro týden {selectedWeekNumber}
            </DialogTitle>
            <DialogDescription>
              Vaše organizovaný nákupní seznam pro všechny jídla v týdnu {selectedWeekNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                {shoppingListContent || "Načítám nákupní seznam..."}
              </pre>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setShoppingListModalOpen(false)}
              >
                Zavřít
              </Button>
              <Button
                onClick={() => {
                  // Copy to clipboard
                  navigator.clipboard.writeText(shoppingListContent);
                  toast.success("Nákupní seznam zkopírován do schránky!");
                }}
              >
                Kopírovat do schránky
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}