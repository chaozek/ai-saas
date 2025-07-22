"use client"

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Loader2
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

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

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
      toast.success("Test plan generated!");
      setIsGeneratingPlan(false);
      window.location.reload();
    },
    onError: (error: any) => {
      toast.error("Failed to generate test plan");
      console.error("Test plan error:", error);
      setIsGeneratingPlan(false);
    },
  }));

  // Function to generate shopping list for a week
  const generateShoppingList = useMutation(trpc.fitness.generateShoppingList.mutationOptions({
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error: any) => {
      toast.error("Failed to generate shopping list");
      console.error("Shopping list error:", error);
    },
  }));

  const handleGenerateShoppingList = async (weekNumber: number, weekMeals: any[]) => {
    setGeneratingList(prev => ({ ...prev, [weekNumber]: true }));

    generateShoppingList.mutate({
      weekNumber,
      weekMeals,
    }, {
      onSettled: () => {
        setGeneratingList(prev => ({ ...prev, [weekNumber]: false }));
      }
    });
  };

  // Handle authentication errors
  if (error && error.message?.includes('UNAUTHORIZED')) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Authentication Required</h2>
          <p className="text-muted-foreground">Please sign in to access your fitness dashboard.</p>
          <Button onClick={() => window.location.href = '/sign-in'}>
            Sign In
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
          <p className="text-lg font-medium">Initializing dashboard...</p>
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
          <h2 className="text-2xl font-bold">No Fitness Profile Found</h2>
          <p className="text-muted-foreground">Please complete the fitness assessment to generate your plan.</p>
          <Button onClick={() => window.location.href = '/'}>
            Start Assessment
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
          <h2 className="text-2xl font-bold">No Workout Plan Found</h2>
          <p className="text-muted-foreground">Please complete the fitness assessment to generate your plan.</p>
          <Button onClick={() => window.location.href = '/'}>
            Start Assessment
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
            <h1 className="text-3xl font-bold">Your Fitness Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.firstName || 'Fitness Enthusiast'}!</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Plan
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
              {testGeneratePlan.isPending ? "Generating..." : "Test Plan"}
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
                  <p className="text-sm text-muted-foreground">Current Week</p>
                  <p className="text-2xl font-bold">{currentWeek} of {workoutPlan.duration}</p>
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
                  <p className="text-sm text-muted-foreground">Week Progress</p>
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
                  <p className="text-sm text-muted-foreground">Workouts This Week</p>
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
                  <p className="text-sm text-muted-foreground">Avg. Duration</p>
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
                <Badge variant="outline" className="text-sm">{workoutPlan.duration} weeks</Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="workouts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-muted">
            <TabsTrigger value="workouts" className="data-[state=active]:bg-background">This Week's Workouts</TabsTrigger>
            <TabsTrigger value="meals" className="data-[state=active]:bg-background">Meal Plans</TabsTrigger>
            <TabsTrigger value="progress" className="data-[state=active]:bg-background">Progress Tracking</TabsTrigger>
            <TabsTrigger value="overview" className="data-[state=active]:bg-background">Plan Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="workouts" className="space-y-6">
            {/* Check if workout plan is still generating */}
            {(isGeneratingPlan || (generationStatus && !generationStatus.workoutPlanComplete)) ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                  <h3 className="text-lg font-medium">Generating Workout Plan...</h3>
                  <p className="text-sm text-muted-foreground">Creating personalized workouts for your fitness goals</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span>This may take a few minutes</span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Week Navigation */}
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Week {currentWeek} Workouts</h2>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentWeek(Math.max(1, currentWeek - 1))}
                      disabled={currentWeek === 1}
                    >
                      Previous Week
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentWeek(Math.min(workoutPlan.duration, currentWeek + 1))}
                      disabled={currentWeek === workoutPlan.duration}
                    >
                      Next Week
                    </Button>
                  </div>
                </div>

                {/* Week Progress */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Week {currentWeek} Progress</span>
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
                      {workout.duration} minutes
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{workout.description}</p>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Exercises:</p>
                      <div className="space-y-1">
                        {workout.exercises?.slice(0, 3).map((exercise: any) => (
                          <div key={exercise.id} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <span>{exercise.name}</span>
                          </div>
                        ))}
                        {workout.exercises?.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{workout.exercises.length - 3} more exercises
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
                          Start Workout
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
                    <h3 className="text-lg font-medium">Generating Meal Plan...</h3>
                    <p className="text-sm text-muted-foreground">Creating personalized meals and recipes for your nutrition goals</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      <span>This may take a few minutes</span>
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
                        {mealPlan.duration} days • {mealPlan.meals?.length || 0} meals • {mealPlan.caloriesPerDay} cal/day
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {Math.ceil(mealPlan.duration / 7)} Weeks
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
                        Daily Targets
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-4 gap-3">
                        <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                          <div className="text-lg font-bold text-red-600 dark:text-red-400">{mealPlan.caloriesPerDay}</div>
                          <p className="text-xs text-red-700 dark:text-red-300">Calories</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{mealPlan.proteinPerDay}g</div>
                          <p className="text-xs text-blue-700 dark:text-blue-300">Protein</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                          <div className="text-lg font-bold text-green-600 dark:text-green-400">{mealPlan.carbsPerDay}g</div>
                          <p className="text-xs text-green-700 dark:text-green-300">Carbs</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
                          <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{mealPlan.fatPerDay}g</div>
                          <p className="text-xs text-orange-700 dark:text-orange-300">Fat</p>
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
                      ) || [];

                      return (
                        <Card key={weekIndex} className="border border-border">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-sm font-bold text-primary">{weekNumber}</span>
                                </div>
                                <div>
                                  <CardTitle className="text-base">Week {weekNumber}</CardTitle>
                                  <CardDescription className="text-xs">
                                    {weekMeals.length} meals • Days {(weekIndex * 7) + 1}-{Math.min((weekIndex + 1) * 7, mealPlan.duration)}
                                  </CardDescription>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {weekMeals.length} meals
                                </Badge>
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
                                      Generating...
                                    </>
                                  ) : (
                                    <>
                                      <ShoppingCart className="w-3 h-3 mr-1" />
                                      Shopping List
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-3">
                              {weekMeals.map((meal: any) => (
                                <div key={meal.id} className="group hover:bg-muted/50 transition-colors rounded-lg p-3 border border-border">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1 min-w-0">
                                      <h4 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                                        {meal.name}
                                      </h4>
                                      <p className="text-xs text-muted-foreground">
                                        Day {meal.dayOfWeek} • {meal.prepTime + meal.cookTime} min
                                      </p>
                                    </div>
                                    <Badge
                                      variant={meal.mealType === 'BREAKFAST' ? 'default' : meal.mealType === 'LUNCH' ? 'secondary' : 'outline'}
                                      className="text-xs ml-2 flex-shrink-0"
                                    >
                                      {meal.mealType}
                                    </Badge>
                                  </div>

                                  {/* Compact Nutrition */}
                                  <div className="flex gap-2 mb-3">
                                    <div className="flex-1 text-center p-2 rounded bg-red-50 dark:bg-red-950/20">
                                      <div className="text-xs font-bold text-red-600 dark:text-red-400">{meal.calories}</div>
                                      <div className="text-xs text-muted-foreground">cal</div>
                                    </div>
                                    <div className="flex-1 text-center p-2 rounded bg-blue-50 dark:bg-blue-950/20">
                                      <div className="text-xs font-bold text-blue-600 dark:text-blue-400">{meal.protein}g</div>
                                      <div className="text-xs text-muted-foreground">P</div>
                                    </div>
                                    <div className="flex-1 text-center p-2 rounded bg-green-50 dark:bg-green-950/20">
                                      <div className="text-xs font-bold text-green-600 dark:text-green-400">{meal.carbs}g</div>
                                      <div className="text-xs text-muted-foreground">C</div>
                                    </div>
                                  </div>

                                  {/* Compact Recipe Info */}
                                  {meal.recipes?.map((recipe: any) => (
                                    <div key={recipe.id} className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <ChefHat className="w-3 h-3 text-primary" />
                                        <p className="text-xs font-medium">{recipe.name}</p>
                                      </div>

                                      {/* Compact Ingredients */}
                                      <div className="space-y-1">
                                        <p className="text-xs font-medium text-primary">Ingredients:</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
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
                                              return <div className="text-xs text-muted-foreground">Ingredients not available</div>;
                                            }
                                          })()}
                                        </div>
                                      </div>

                                      {/* Compact Tags */}
                                      <div className="flex gap-1 flex-wrap">
                                        {recipe.tags?.slice(0, 2).map((tag: string, index: number) => (
                                          <Badge key={index} variant="secondary" className="text-xs">
                                            {tag}
                                          </Badge>
                                        ))}
                                        {recipe.tags && recipe.tags.length > 2 && (
                                          <Badge variant="outline" className="text-xs">
                                            +{recipe.tags.length - 2}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center space-y-4 py-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Calendar className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold">No Meal Plan Found</h2>
                  <p className="text-muted-foreground max-w-md mx-auto text-sm">
                    Your meal plan is being generated. Please check back in a few minutes.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span>Generating your personalized meal plan...</span>
                  </div>
                </div>
              )
            ) : (
              <div className="text-center space-y-4 py-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Calendar className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold">Meal Planning Not Enabled</h2>
                <p className="text-muted-foreground max-w-md mx-auto text-sm">
                  Enable meal planning in your fitness assessment to get personalized meal plans with AI-generated recipes.
                </p>
                <Button onClick={() => window.location.href = '/'} className="mt-4">
                  Update Assessment
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Progress Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center space-y-2 p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">12</div>
                    <p className="text-sm text-muted-foreground">Workouts Completed</p>
                  </div>
                  <div className="text-center space-y-2 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">85%</div>
                    <p className="text-sm text-muted-foreground">Consistency Rate</p>
                  </div>
                  <div className="text-center space-y-2 p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">540</div>
                    <p className="text-sm text-muted-foreground">Minutes Trained</p>
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
                  Full Plan Overview
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
                        <p className="font-medium">Week {week + 1}</p>
                        <p className="text-sm text-muted-foreground">
                          {workoutPlan.workouts.filter(w => w.weekNumber === week + 1).length} workouts
                        </p>
                      </div>
                      <Badge variant={week + 1 === currentWeek ? "default" : "secondary"}>
                        {week + 1 === currentWeek ? "Current" : "Upcoming"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}