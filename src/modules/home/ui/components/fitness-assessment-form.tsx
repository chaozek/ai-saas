"use client"

import { useEffect, useCallback, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Loader2, ArrowRight, ArrowLeft, Target, Activity, Dumbbell, Calendar, Clock, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { SignIn, SignInButton, useClerk } from "@clerk/nextjs";
import { toast } from "sonner";
import { useTRPC } from "@/trcp/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFitnessAssessmentStore } from "@/lib/fitness-assessment-store";
import { PaymentModal } from "@/components/ui/payment-modal";

interface AssessmentData {
  // Personal Information
  age: string;
  gender: string;
  height: string;
  weight: string;
  targetWeight?: string;

  // Fitness Goals
  fitnessGoal: "WEIGHT_LOSS" | "MUSCLE_GAIN" | "ENDURANCE" | "STRENGTH" | "FLEXIBILITY" | "GENERAL_FITNESS";
  activityLevel: "SEDENTARY" | "LIGHTLY_ACTIVE" | "MODERATELY_ACTIVE" | "VERY_ACTIVE" | "EXTREMELY_ACTIVE";
  experienceLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

  // Health Information
  hasInjuries: boolean;
  injuries?: string;
  medicalConditions?: string;

  // Preferences
  availableDays: string[];
  workoutDuration: string;
  preferredExercises?: string;
  equipment: string[];

  // Meal Planning
  mealPlanningEnabled: boolean;
  dietaryRestrictions: string[];
  allergies: string[];
  budgetPerWeek: string;
  mealPrepTime: string;
  preferredCuisines: string[];
  cookingSkill: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

  // Consent
  consent: boolean;
}

const FITNESS_GOALS = [
  { value: "WEIGHT_LOSS", label: "Hmotnostní ztráta", icon: "⚖️" },
  { value: "MUSCLE_GAIN", label: "Svalová získání", icon: "💪" },
  { value: "ENDURANCE", label: "Vytrvalost", icon: "🏃" },
  { value: "STRENGTH", label: "Síla", icon: "🏋️" },
  { value: "FLEXIBILITY", label: "Flexibilita", icon: "🧘" },
  { value: "GENERAL_FITNESS", label: "Obecná fitness", icon: "🌟" },
];

const ACTIVITY_LEVELS = [
  { value: "SEDENTARY", label: "Sedentární (málo nebo žádná pohybová aktivita)" },
  { value: "LIGHTLY_ACTIVE", label: "Lehce aktivní (lehká cvičení 1-3x týdně)" },
  { value: "MODERATELY_ACTIVE", label: "Středně aktivní (střední cvičení 3-5x týdně)" },
  { value: "VERY_ACTIVE", label: "Velmi aktivní (těžká cvičení 6-7x týdně)" },
  { value: "EXTREMELY_ACTIVE", label: "Velmi těžce aktivní (velmi těžké cvičení, fyzická práce)" },
];

const EXPERIENCE_LEVELS = [
  { value: "BEGINNER", label: "Začátečník (0-1 roky)" },
  { value: "INTERMEDIATE", label: "Střední (1-3 roky)" },
  { value: "ADVANCED", label: "Pokročilý (3+ roky)" },
];

const DAYS_OF_WEEK = [
  { value: "monday", label: "Pondělí" },
  { value: "tuesday", label: "Úterý" },
  { value: "wednesday", label: "Středa" },
  { value: "thursday", label: "Čtvrtek" },
  { value: "friday", label: "Pátek" },
  { value: "saturday", label: "Sobota" },
  { value: "sunday", label: "Neděle" },
];

const EQUIPMENT_OPTIONS = [
  { value: "none", label: "Žádné vybavení" },
  { value: "dumbbells", label: "Halové váhy" },
  { value: "resistance_bands", label: "Odporové pásy" },
  { value: "pull_up_bar", label: "Vlákno pro zvedání" },
  { value: "bench", label: "Stůl" },
  { value: "barbell", label: "Barbell" },
  { value: "kettlebell", label: "Kettlebell" },
  { value: "home_equipment", label: "Domácí cvičení" },
  { value: "gym_access", label: "Plné gymnastické centrum" },
];

const DIETARY_RESTRICTIONS = [
  { value: "vegetarian", label: "Vegetariánské" },
  { value: "vegan", label: "Vegan" },
  { value: "gluten_free", label: "Bezlepkové" },
  { value: "dairy_free", label: "Bezmléčné" },
  { value: "keto", label: "Keto" },
  { value: "paleo", label: "Paleo" },
  { value: "mediterranean", label: "Mediterránské" },
  { value: "low_carb", label: "Nízkohladinové" },
  { value: "none", label: "Žádné omezení" },
];

const CUISINE_OPTIONS = [
  { value: "czech", label: "České" },
  { value: "italian", label: "Italské" },
  { value: "mexican", label: "Mexické" },
  { value: "asian", label: "Asijské" },
  { value: "mediterranean", label: "Mediterránské" },
  { value: "american", label: "Americké" },
  { value: "indian", label: "Indické" },
  { value: "thai", label: "Thajské" },
  { value: "japanese", label: "Japonské" },
  { value: "greek", label: "Řecké" },
  { value: "french", label: "Francouzské" },
];

const COOKING_SKILLS = [
  { value: "BEGINNER", label: "Začátečník (základní kuchařské dovednosti)" },
  { value: "INTERMEDIATE", label: "Střední (může následovat recepty)" },
  { value: "ADVANCED", label: "Pokročilý (zkušený kuchař)" },
];

const getMuscleGroups = (gender?: string) => {
  const isFemale = gender === "female";
  const basePath = isFemale ? "/bodyParts/lady" : "/bodyParts";

  return [
    { value: "chest", label: "Hrudník", image: `${basePath}/chest.png` },
    { value: "back", label: "Záda", image: `${basePath}/back.png` },
    { value: "shoulders", label: "Ramena", image: `${basePath}/shoulders.png` },
    { value: "arms", label: "Paže (biceps, triceps)", image: `${basePath}/arm.png` },
    { value: "legs", label: "Nohy (stehna, lýtka)", image: `${basePath}/legs.png` },
    { value: "glutes", label: "Hýždě", image: `${basePath}/bottom.png` },
    { value: "core", label: "Břicho a core", image: `${basePath}/core.png` },
    { value: "full_body", label: "Celé tělo", image: `${basePath}/full_body.png` },
  ];
};

export const FitnessAssessmentForm = ({ isHighlighted = false }: { isHighlighted?: boolean }) => {
  const router = useRouter();
  const { user } = useClerk();
  const trpc = useTRPC();
  const clerk = useClerk();
  const queryClient = useQueryClient();

  // Use Zustand store instead of local state
  const {
    data,
    currentStep,
    isSubmitting,
    trainerAnimation,
    pendingSubmission,
    hasHydrated,
    updateData,
    setCurrentStep,
    setIsSubmitting,
    setTrainerAnimation,
    setPendingSubmission,
    setHasHydrated,
    reset,
    nextStep: storeNextStep,
    prevStep: storePrevStep,
  } = useFitnessAssessmentStore();

  // Add state to prevent step message flash after highlight
  const [showStepMessage, setShowStepMessage] = useState(true);

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentClientSecret, setPaymentClientSecret] = useState<string | null>(null);

  // Check if user has already paid
  const { data: paymentStatus, isLoading: paymentStatusLoading } = useQuery({
    ...trpc.fitness.hasPaidPlan.queryOptions(),
    enabled: !!user, // Only run query if user is logged in
  });

  // Handle highlight state changes
  useEffect(() => {
    if (isHighlighted) {
      setShowStepMessage(false);
    } else {
      // Delay showing step message after highlight ends
      const timer = setTimeout(() => {
        setShowStepMessage(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isHighlighted]);

  // Create payment intent mutation
  const createPaymentIntent = useMutation(trpc.fitness.createPaymentIntent.mutationOptions({
    onSuccess: (data) => {
      if (data.clientSecret) {
        setPaymentClientSecret(data.clientSecret);
        setShowPaymentModal(true);
      } else {
        toast.error('Nepodařilo se vytvořit platbu. Zkuste to prosím znovu.');
      }
    },
    onError: (error) => {
      console.error('Error creating payment intent:', error);
      toast.error(error.message || 'Nepodařilo se vytvořit platbu. Zkuste to prosím znovu.');
    }
  }));

  // Remove current plan mutation
  const removeCurrentPlan = useMutation(trpc.fitness.removeCurrentPlan.mutationOptions({
    onError: (error) => {
      console.error('Error removing current plan:', error);
      // Don't show error toast as we still want to redirect
    }
  }));

  const disableMealPlanning = useMutation(trpc.fitness.disableMealPlanning.mutationOptions({
    onError: (error) => {
      console.error('Error disabling meal planning:', error);
    },
  }));

  // Set payment completed mutation
  const setPaymentCompleted = useMutation(trpc.fitness.setPaymentCompleted.mutationOptions({
    onError: (error) => {
      console.error('Error setting payment completed:', error);
    },
  }));

  const handleSubmit = useCallback(async () => {
    if (!user) {
      toast.error("Prosím, přihlaste se pro pokračování");
      setPendingSubmission(true); // Mark that we have a pending submission
      clerk.openSignIn();
      return;
    }

    if (data.availableDays.length === 0) {
      toast.error("Prosím, vyberte alespoň jeden den pro vaše cvičení");
      return;
    }

    if (!data.consent) {
      toast.error("Prosím, souhlaste se zpracováním osobních údajů pro pokračování");
      return;
    }

    // Create payment intent first, then show modal
    createPaymentIntent.mutate({
      planName: "Fitness Plán",
      planPrice: 199,
      planCurrency: "CZK",
      assessmentData: data,
    });
  }, [user, data, setPendingSubmission, clerk, createPaymentIntent]);

  // Check if we're in any loading state
  const isLoading = isSubmitting || createPaymentIntent.isPending;

    const handlePaymentSuccess = useCallback(async () => {
    try {
      // Set payment as completed immediately
      if (paymentClientSecret) {
        // Extract payment intent ID from client secret
        const paymentIntentId = paymentClientSecret.split('_secret_')[0];
        await setPaymentCompleted.mutateAsync({ paymentIntentId });

        // Invalidate hasPaidPlan query to refresh the data
        queryClient.invalidateQueries(trpc.fitness.hasPaidPlan.queryOptions());
      }

      // Remove current plan before redirecting (if it exists)
      await removeCurrentPlan.mutateAsync();
      await disableMealPlanning.mutateAsync();

      // After successful payment, the webhook will handle plan generation
      // Just redirect to dashboard where the user can see their plan being generated
      toast.success("Platba byla úspěšná! Váš fitness plán se generuje...");
      router.push('/dashboard');
    } catch (error) {
      console.error('Error in payment success handler:', error);
      // Still redirect even if there are any errors
      toast.success("Platba byla úspěšná! Váš fitness plán se generuje...");
      router.push('/dashboard');
    }
  }, [router, removeCurrentPlan, disableMealPlanning, setPaymentCompleted, paymentClientSecret, queryClient, trpc.fitness.hasPaidPlan]);

  // Handle pending submission after authentication
  useEffect(() => {
    if (user && pendingSubmission) {
      // User has returned from authentication, submit the form
      setPendingSubmission(false);
      handleSubmit();
    }
  }, [user, pendingSubmission, setPendingSubmission, handleSubmit]);

  const steps = [
    {
      title: "Osobní údaje",
      description: "Začneme několika základními informacemi o vás",
      icon: <Target className="w-5 h-5" />,
    },
    {
      title: "Fitness cíle",
      description: "Jaké jsou vaše primární fitness cíle?",
      icon: <Activity className="w-5 h-5" />,
    },
    {
      title: "Cílové partie",
      description: "Na které partie se chcete zaměřit?",
      icon: <Dumbbell className="w-5 h-5" />,
    },
    {
      title: "Zkušenost a aktivita",
      description: "Řekněte nám o vaší současné úrovni fitness",
      icon: <Dumbbell className="w-5 h-5" />,
    },
    {
      title: "Zdravotní stav",
      description: "Máte nějaké zranění nebo lékařské podmínky, které bychom měli znát?",
      icon: <Activity className="w-5 h-5" />,
    },
    {
      title: "Preferované",
      description: "Co je pro vás nejlepší pro vaši rozvrh a vybavení?",
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      title: "Občerstvení",
      description: "Nastavme vaši dietní plán",
      icon: <Calendar className="w-5 h-5" />,
    },
  ];

  const nextStep = () => {
    // Check if we're on step 5 (preferences step) and validate available days
    if (currentStep === 5 && (data.availableDays || []).length === 0) {
      toast.error("Prosím, vyberte alespoň jeden den pro vaše cvičení");
      return;
    }

    const success = storeNextStep();
    if (success) {
      // Enhanced trainer animation sequence
      setTrainerAnimation(true);

      // Create a sequence of animations
      setTimeout(() => {
        setTrainerAnimation(false);
      }, 1200);
    }
  };

  const prevStep = () => {
    storePrevStep();
  };

  // AI recommendation logic for step 5
  const queryEnabled = currentStep === 5 && !!data.age && !!data.fitnessGoal && !!data.activityLevel && !!data.experienceLevel;

  const { data: aiRecommendationsData, isLoading: aiRecommendationsLoading, error: aiRecommendationsError } = useQuery({
    ...trpc.fitness.getAIRecommendations.queryOptions({
      age: data.age,
      gender: data.gender,
      height: data.height,
      weight: data.weight,
      targetWeight: data.targetWeight,
      fitnessGoal: data.fitnessGoal,
      activityLevel: data.activityLevel,
      experienceLevel: data.experienceLevel,
      targetMuscleGroups: data.targetMuscleGroups || [],
      hasInjuries: data.hasInjuries,
      injuries: data.injuries,
      medicalConditions: data.medicalConditions,
    }),
    enabled: queryEnabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Debug logging
  console.log("AI Recommendations Query State:", {
    currentStep,
    queryEnabled,
    hasAge: !!data.age,
    hasFitnessGoal: !!data.fitnessGoal,
    hasActivityLevel: !!data.activityLevel,
    hasExperienceLevel: !!data.experienceLevel,
    isLoading: aiRecommendationsLoading,
    hasError: !!aiRecommendationsError,
    hasData: !!aiRecommendationsData,
    data: aiRecommendationsData
  });

  const applyAIRecommendations = () => {
    console.log("Applying AI recommendations:", aiRecommendationsData);

    if (aiRecommendationsData?.recommendations) {
      const recommendations = aiRecommendationsData.recommendations;
      console.log("Recommendations to apply:", recommendations);

      updateData("availableDays", recommendations.availableDays);
      updateData("workoutDuration", recommendations.workoutDuration);
      updateData("equipment", recommendations.equipment);
      updateData("preferredExercises", recommendations.preferredExercises);

      toast.success("AI doporučení byla úspěšně aplikována!");
    } else {
      console.log("No recommendations data available:", aiRecommendationsData);
      toast.error("AI doporučení nejsou k dispozici. Zkuste to prosím znovu.");
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Věk</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="25"
                  value={data.age}
                  onChange={(e) => updateData("age", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Pohlaví</Label>
                <Select value={data.gender} onValueChange={(value) => updateData("gender", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Vyberte pohlaví" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Muž</SelectItem>
                    <SelectItem value="female">Žena</SelectItem>
                    <SelectItem value="other">Jiné</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">Výška (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="175"
                  value={data.height}
                  onChange={(e) => updateData("height", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Aktuální váha (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="70"
                  value={data.weight}
                  onChange={(e) => updateData("weight", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetWeight">Cílová váha (kg) - Volitelné</Label>
              <Input
                id="targetWeight"
                type="number"
                placeholder="65"
                value={data.targetWeight}
                onChange={(e) => updateData("targetWeight", e.target.value)}
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label>Jaké jsou vaše primární fitness cíle?</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {FITNESS_GOALS.map((goal) => (
                  <Button
                    key={goal.value}
                    variant={data.fitnessGoal === goal.value ? "default" : "outline"}
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => updateData("fitnessGoal", goal.value)}
                  >
                    <span className="text-2xl">{goal.icon}</span>
                    <span className="font-medium">{goal.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label>Na které partie se chcete zaměřit?</Label>
              <p className="text-sm text-muted-foreground">
                Vyberte partie, které chcete primárně trénovat. Můžete vybrat více partií nebo "Celé tělo" pro vyvážený trénink.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {getMuscleGroups(data.gender).map((group) => (
                                                      <Button
                    key={group.value}
                    variant={(data.targetMuscleGroups || []).includes(group.value) ? "default" : "outline"}
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => {
                      const currentGroups = data.targetMuscleGroups || [];

                      if (group.value === "full_body") {
                        // If "full body" is selected, clear other selections
                        updateData("targetMuscleGroups", ["full_body"]);
                      } else {
                        // Remove "full_body" if it was selected
                        const newGroups = currentGroups.filter(g => g !== "full_body");

                        if (currentGroups.includes(group.value)) {
                          // Remove if already selected
                          updateData("targetMuscleGroups", newGroups.filter(g => g !== group.value));
                        } else {
                          // Add if not selected
                          updateData("targetMuscleGroups", [...newGroups, group.value]);
                        }
                      }
                    }}
                  >
                    <img
                      src={group.image}
                      alt={group.label}
                      className="w-12 h-12 object-contain"
                    />
                    <span className="font-medium">{group.label}</span>
                  </Button>
                ))}
              </div>
              {(data.targetMuscleGroups || []).length > 0 && (
                <div className="mt-4">
                  <Label>Vybrané partie:</Label>
                                         <div className="flex flex-wrap gap-2 mt-2">
                         {(data.targetMuscleGroups || []).map((group) => {
                           const muscleGroup = getMuscleGroups(data.gender).find(g => g.value === group);
                           return (
                             <Badge key={group} variant="secondary" className="flex items-center gap-1">
                               <img
                                 src={muscleGroup?.image}
                                 alt={muscleGroup?.label}
                                 className="w-4 h-4 object-contain"
                               />
                               {muscleGroup?.label}
                             </Badge>
                           );
                         })}
                       </div>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label>Jaká je vaše aktuální úroveň aktivity?</Label>
              <Select value={data.activityLevel} onValueChange={(value) => updateData("activityLevel", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Vyberte úroveň aktivity" />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-4">
              <Label>Jaká je vaše zkušenost s fitness?</Label>
              <Select value={data.experienceLevel} onValueChange={(value) => updateData("experienceLevel", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Vyberte úroveň zkušenosti" />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasInjuries"
                  checked={data.hasInjuries}
                  onCheckedChange={(checked) => updateData("hasInjuries", checked)}
                />
                <Label htmlFor="hasInjuries">Máte nějaké zranění nebo omezení?</Label>
              </div>
              {data.hasInjuries && (
                <Textarea
                  placeholder="Prosím, popište vaše zranění nebo omezení..."
                  value={data.injuries}
                  onChange={(e) => updateData("injuries", e.target.value)}
                />
              )}
            </div>
            <div className="space-y-4">
              <Label htmlFor="medicalConditions">Lékařské podmínky (Volitelné)</Label>
              <Textarea
                id="medicalConditions"
                placeholder="Jaké lékařské podmínky bychom měli být vědomi..."
                value={data.medicalConditions}
                onChange={(e) => updateData("medicalConditions", e.target.value)}
              />
            </div>
          </div>
        );

      case 5:
        const aiRecommendations = aiRecommendationsData?.recommendations || {
          availableDays: [],
          workoutDuration: "",
          equipment: [],
          preferredExercises: "",
          reasoning: { days: "", duration: "", equipment: "", exercises: "" }
        };
        return (
          <div className="space-y-6">
                        {/* AI Recommendations Header */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-blue-800 dark:text-blue-200">AI Doporučení</span>
                {aiRecommendationsLoading && (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                {aiRecommendationsLoading
                  ? "Generujeme AI doporučení na základě vašich odpovědí..."
                  : aiRecommendationsError
                  ? "Nepodařilo se načíst AI doporučení. Zkuste to prosím znovu."
                  : "Na základě vašich odpovědí jsme připravili doporučení pro optimální tréninkový plán."
                }
              </p>
                            <Button
                variant="outline"
                size="sm"
                onClick={applyAIRecommendations}
                disabled={aiRecommendationsLoading || !!aiRecommendationsError || !aiRecommendationsData}
                className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-950/20"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {aiRecommendationsLoading ? "Načítání..." : aiRecommendationsError ? "Chyba" : "Použít AI doporučení"}
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label>Které dny jste k dispozici pro cvičení?</Label>
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI doporučení
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {DAYS_OF_WEEK.map((day) => {
                  const isRecommended = aiRecommendations.availableDays.includes(day.value);
                  return (
                    <div key={day.value} className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                      isRecommended ? 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800' : ''
                    }`}>
                      <Checkbox
                        id={day.value}
                        checked={(data.availableDays || []).includes(day.value)}
                        onCheckedChange={(checked) => {
                          const currentDays = data.availableDays || [];
                          if (checked) {
                            updateData("availableDays", [...currentDays, day.value]);
                          } else {
                            updateData("availableDays", currentDays.filter(d => d !== day.value));
                          }
                        }}
                      />
                      <Label htmlFor={day.value} className="text-sm">{day.label}</Label>
                      {isRecommended && (
                        <Sparkles className="w-3 h-3 text-green-600 dark:text-green-400 ml-auto" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label>Preferovaná doba trvání cvičení (minuty)</Label>
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI doporučení
                </Badge>
              </div>
              <Select value={data.workoutDuration} onValueChange={(value) => updateData("workoutDuration", value)}>
                <SelectTrigger className={aiRecommendations.workoutDuration === data.workoutDuration ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950/20' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minut</SelectItem>
                  <SelectItem value="45">45 minut</SelectItem>
                  <SelectItem value="60">60 minut</SelectItem>
                  <SelectItem value="75">75 minut</SelectItem>
                  <SelectItem value="90">90 minut</SelectItem>
                </SelectContent>
              </Select>
              {aiRecommendations.workoutDuration && (
                <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Doporučeno: {aiRecommendations.workoutDuration} minut
                </p>
              )}
            </div>

            <div className="space-y-4">
              <Label>Jaké vybavení máte k dispozici?</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {EQUIPMENT_OPTIONS.map((equipment) => (
                  <div key={equipment.value} className="flex items-center space-x-2 p-2 rounded-lg">
                    <Checkbox
                      id={equipment.value}
                      checked={data.equipment.includes(equipment.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateData("equipment", [...data.equipment, equipment.value]);
                        } else {
                          updateData("equipment", data.equipment.filter(e => e !== equipment.value));
                        }
                      }}
                    />
                    <Label htmlFor={equipment.value} className="text-sm">{equipment.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="preferredExercises">Preferované cvičení nebo aktivity (Volitelné)</Label>
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI doporučení
                </Badge>
              </div>
              <Textarea
                id="preferredExercises"
                placeholder="např. běhání, jóga, tělesné výcviky, plavání..."
                value={data.preferredExercises}
                onChange={(e) => updateData("preferredExercises", e.target.value)}
                className={aiRecommendations.preferredExercises && data.preferredExercises === aiRecommendations.preferredExercises ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950/20' : ''}
              />
              {aiRecommendations.preferredExercises && (
                <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Doporučeno: {aiRecommendations.preferredExercises}
                </p>
              )}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="mealPlanningEnabled"
                  checked={data.mealPlanningEnabled}
                  onCheckedChange={(checked) => updateData("mealPlanningEnabled", checked)}
                />
                <Label htmlFor="mealPlanningEnabled" className="text-lg font-medium">Povolit plánování jídla</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Získejte osobně upravené plány jídla a recepty přizpůsobené vašim fitness cílům a preferencím.
              </p>
            </div>

            {data.mealPlanningEnabled && (
              <>
                <div className="space-y-4">
                  <Label>Stravovací omezení</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {DIETARY_RESTRICTIONS.map((restriction) => (
                      <div key={restriction.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={restriction.value}
                          checked={data.dietaryRestrictions.includes(restriction.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateData("dietaryRestrictions", [...data.dietaryRestrictions, restriction.value]);
                            } else {
                              updateData("dietaryRestrictions", data.dietaryRestrictions.filter(r => r !== restriction.value));
                            }
                          }}
                        />
                        <Label htmlFor={restriction.value} className="text-sm">{restriction.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="allergies">Alergie na jídlo (Volitelné)</Label>
                  <Textarea
                    id="allergies"
                    placeholder="např. oříšky, mořské plody, mléko..."
                    value={data.allergies.join(', ')}
                    onChange={(e) => updateData("allergies", e.target.value.split(',').map(item => item.trim()).filter(item => item))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <Label>Týdenní rozpočet jídla (CZK)</Label>
                    <Select value={data.budgetPerWeek} onValueChange={(value) => updateData("budgetPerWeek", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="500">500 Kč</SelectItem>
                        <SelectItem value="750">750 Kč</SelectItem>
                        <SelectItem value="1000">1000 Kč</SelectItem>
                        <SelectItem value="1500">1500 Kč</SelectItem>
                        <SelectItem value="2000">2000 Kč</SelectItem>
                        <SelectItem value="2500">2500 Kč</SelectItem>
                        <SelectItem value="3000">3000+ Kč</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <Label>Čas přípravy jídla (minut na den)</Label>
                    <Select value={data.mealPrepTime} onValueChange={(value) => updateData("mealPrepTime", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minut</SelectItem>
                        <SelectItem value="30">30 minut</SelectItem>
                        <SelectItem value="45">45 minut</SelectItem>
                        <SelectItem value="60">60 minut</SelectItem>
                        <SelectItem value="90">90+ minut</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Preferované kulinářské směny</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {CUISINE_OPTIONS.map((cuisine) => (
                      <div key={cuisine.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={cuisine.value}
                          checked={data.preferredCuisines.includes(cuisine.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateData("preferredCuisines", [...data.preferredCuisines, cuisine.value]);
                            } else {
                              updateData("preferredCuisines", data.preferredCuisines.filter(c => c !== cuisine.value));
                            }
                          }}
                        />
                        <Label htmlFor={cuisine.value} className="text-sm">{cuisine.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Úroveň kuchařských dovedností</Label>
                  <Select value={data.cookingSkill} onValueChange={(value) => updateData("cookingSkill", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COOKING_SKILLS.map((skill) => (
                        <SelectItem key={skill.value} value={skill.value}>
                          {skill.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

                                                {/* Consent Checkbox */}
            <Separator className="my-2" />
            <div className="space-y-2">
              <div className="flex items-center space-x-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800">
                <Checkbox
                  id="consent"
                  checked={data.consent}
                  onCheckedChange={(checked) => updateData("consent", checked)}
                  required
                />
                <Label htmlFor="consent" className="text-xs leading-tight block">
                  Souhlasím se zpracováním mých osobních údajů za účelem vytvoření jídelníčku a tréninkového plánu v souladu s{" "}
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    zásadami ochrany osobních údajů
                  </a>
                  .
                </Label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Don't render until the store has been hydrated
  if (!hasHydrated) {
    return (
      <div className="relative">
        <Card className="w-full relative z-10">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5" />
              <div>
                <CardTitle>Načítání...</CardTitle>
                <CardDescription>Načítáme vaše údaje...</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state while checking payment status
  if (user && paymentStatusLoading) {
    return (
      <div className="relative">
        <Card className="w-full relative z-10">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <CardTitle>Kontrolujeme váš plán...</CardTitle>
                <CardDescription>Načítáme informace o vašem fitness plánu</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-slate-600 dark:text-slate-400" />
              <p className="text-slate-600 dark:text-slate-400">
                Kontrolujeme, zda máte již zaplacený plán...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show dashboard button if user has already paid
  if (user && !paymentStatusLoading && paymentStatus?.hasPaidPlan) {
    return (
      <div className="relative">
        {/* Enhanced Trainer Animation Container */}
        <div className="absolute -top-20 -right-8 z-0">
          {/* Floating background elements */}
          <div className="absolute inset-0">
            {/* Animated circles */}
            <div className="absolute top-4 right-4 w-4 h-4 bg-green-400 rounded-full animate-ping opacity-75"></div>
            <div className="absolute top-8 right-12 w-3 h-3 bg-blue-400 rounded-full animate-ping opacity-75" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute top-2 right-20 w-2 h-2 bg-emerald-400 rounded-full animate-ping opacity-75" style={{ animationDelay: '1s' }}></div>

            {/* Floating particles */}
            <div className="absolute top-6 right-6 w-1 h-1 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="absolute top-12 right-16 w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.7s' }}></div>
            <div className="absolute top-8 right-24 w-1 h-1 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '1.2s' }}></div>
          </div>

          {/* Main trainer image with enhanced animations */}
          <div className="relative">
            {/* Glow effect behind trainer */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/30 to-blue-400/30 rounded-full blur-xl scale-150 opacity-80"></div>

            {/* Show both trainers when no gender is selected, or single trainer based on selection */}
            <div className="relative w-32 h-32">
              {/* Male trainer - always present but conditionally visible */}
              <img
                src="/trainer.png"
                alt="Male Fitness Trainer"
                className={`absolute w-24 h-24 object-contain transition-all duration-700 ease-out scale-125 rotate-12 translate-x-2 translate-y-2 drop-shadow-2xl animate-float ${
                  // Transition based on gender selection
                  !data.gender
                    ? 'opacity-100 left-[-8px] top-[4px] z-[2]'
                    : data.gender === "female"
                      ? 'opacity-0 left-[-8px] top-[4px] z-[1]'
                      : 'opacity-100 left-[0px] top-[0px] z-[2] w-32 h-32'
                }`}
                style={{
                  filter: 'brightness(1.2) contrast(1.1)',
                }}
              />

              {/* Female trainer - always present but conditionally visible */}
              <img
                src="/trainer_lady.png"
                alt="Female Fitness Trainer"
                className={`absolute w-24 h-24 object-contain transition-all duration-700 ease-out scale-125 rotate-12 translate-x-2 translate-y-2 drop-shadow-2xl animate-float ${
                  // Transition based on gender selection
                  !data.gender
                    ? 'opacity-100 left-[24px] top-[4px] z-[1]'
                    : data.gender === "female"
                      ? 'opacity-100 left-[0px] top-[0px] z-[2] w-32 h-32'
                      : 'opacity-0 left-[24px] top-[4px] z-[1]'
                }`}
                style={{
                  filter: 'brightness(1.2) contrast(1.1)',
                  animationDelay: !data.gender ? '0.5s' : '0s',
                }}
              />
            </div>

            {/* Success sparkles */}
            <>
              <div className="absolute -top-2 -right-2 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
              <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-green-400 rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
              <div className="absolute top-1/2 -right-4 w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0.6s' }}></div>
            </>
          </div>

          {/* Motivational text bubble */}
          <div className="absolute -top-20 -right-2 transition-all duration-500 opacity-100 scale-100 translate-y-0" style={{ zIndex: 2 }}>
            <div className="relative">
              {/* Main bubble */}
              <div className="bg-white dark:bg-slate-800 rounded-xl px-4 py-3 shadow-xl">
                <div className="text-xs font-medium text-green-600 dark:text-green-400">
                  Máte již zaplacený plán! 🎉
                </div>
              </div>
              {/* Seamless arrow */}
              <div className="absolute -bottom-1 left-6 w-2 h-2 bg-white dark:bg-slate-800 transform rotate-45"></div>
            </div>
          </div>
        </div>

        <Card className="w-full relative z-10">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400 text-lg">✅</span>
              </div>
              <div>
                <CardTitle>Váš fitness plán je připraven!</CardTitle>
                <CardDescription>Máte již zaplacený plán a můžete pokračovat na dashboard</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-8">
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 dark:text-green-400 text-2xl">🎯</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Vítejte zpět!
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Váš personalizovaný fitness plán čeká na dashboardu. Pokračujte ve své fitness cestě!
                </p>
              </div>

              <Button
                onClick={() => router.push('/dashboard')}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
              >
                <Activity className="w-5 h-5 mr-2" />
                Přejít na Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Enhanced Trainer Animation Container */}
      <div className="absolute -top-20 -right-8 z-0">
        {/* Floating background elements */}
        <div className="absolute inset-0">
          {/* Animated circles */}
          <div className="absolute top-4 right-4 w-4 h-4 bg-green-400 rounded-full animate-ping opacity-75"></div>
          <div className="absolute top-8 right-12 w-3 h-3 bg-blue-400 rounded-full animate-ping opacity-75" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-2 right-20 w-2 h-2 bg-emerald-400 rounded-full animate-ping opacity-75" style={{ animationDelay: '1s' }}></div>

          {/* Floating particles */}
          <div className="absolute top-6 right-6 w-1 h-1 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="absolute top-12 right-16 w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.7s' }}></div>
          <div className="absolute top-8 right-24 w-1 h-1 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '1.2s' }}></div>
        </div>

        {/* Main trainer image with enhanced animations */}
        <div className="relative">
          {/* Glow effect behind trainer */}
          <div className={`absolute inset-0 bg-gradient-to-r from-green-400/30 to-blue-400/30 rounded-full blur-xl transition-all duration-500 ${
            trainerAnimation ? 'scale-150 opacity-80' : 'scale-100 opacity-40'
          }`}></div>

          {/* Show both trainers when no gender is selected, or single trainer based on selection */}
          <div className="relative w-32 h-32">
            {/* Male trainer - always present but conditionally visible */}
            <img
              src="/trainer.png"
              alt="Male Fitness Trainer"
              className={`absolute w-24 h-24 object-contain transition-all duration-700 ease-out ${
                trainerAnimation
                  ? 'scale-125 rotate-12 translate-x-2 translate-y-2 drop-shadow-2xl'
                  : 'scale-100 rotate-0 translate-x-0 translate-y-0 drop-shadow-lg'
              } ${
                // Continuous floating animation
                'animate-float'
              } ${
                // Transition based on gender selection
                !data.gender
                  ? 'opacity-100 left-[-8px] top-[4px] z-[2]'
                  : data.gender === "female"
                    ? 'opacity-0 left-[-8px] top-[4px] z-[1]'
                    : 'opacity-100 left-[0px] top-[0px] z-[2] w-32 h-32'
              }`}
              style={{
                filter: trainerAnimation ? 'brightness(1.2) contrast(1.1)' : 'brightness(1) contrast(1)',
              }}
            />

            {/* Female trainer - always present but conditionally visible */}
            <img
              src="/trainer_lady.png"
              alt="Female Fitness Trainer"
              className={`absolute w-24 h-24 object-contain transition-all duration-700 ease-out ${
                trainerAnimation
              ? 'scale-125 rotate-12 translate-x-2 translate-y-2 drop-shadow-2xl'
                  : 'scale-100 rotate-0 translate-x-0 translate-y-0 drop-shadow-lg'
              } ${
                // Continuous floating animation with slight delay
                'animate-float'
              } ${
                // Transition based on gender selection
                !data.gender
                  ? 'opacity-100 left-[24px] top-[4px] z-[1]'
                  : data.gender === "female"
                    ? 'opacity-100 left-[0px] top-[0px] z-[2] w-32 h-32'
                    : 'opacity-0 left-[24px] top-[4px] z-[1]'
              }`}
              style={{
                filter: trainerAnimation ? 'brightness(1.2) contrast(1.1)' : 'brightness(1) contrast(1)',
                animationDelay: !data.gender ? '0.5s' : '0s',
              }}
            />
          </div>

          {/* Success sparkles when animation triggers */}
          {trainerAnimation && (
            <>
              <div className="absolute -top-2 -right-2 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
              <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-green-400 rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
              <div className="absolute top-1/2 -right-4 w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0.6s' }}></div>
            </>
          )}
        </div>

                                                        {/* Motivational text bubble with integrated arrow */}
        {(() => {
          const message = isHighlighted ? "Pokračujte vyplněním formuláře! 📝" :
            showStepMessage && currentStep === 0 ? "Skvěle! 🎯" :
            showStepMessage && currentStep === 1 ? "Výborný cíl! 💪" :
            showStepMessage && currentStep === 2 ? "Perfektní 🏃‍♂️" :
            showStepMessage && currentStep === 3 ? "Perfektní partie! 🏋️!" :
            showStepMessage && currentStep === 4 ? "Důležité info! 🏥" :
            showStepMessage && currentStep === 5 ? "Skvělý plán! 📅" :
            showStepMessage && currentStep === 6 ? "Téměř hotovo! 🍎" : "";

          return message && (
            <div className={`absolute -top-20 -right-2 transition-all duration-500 ${
              (trainerAnimation || isHighlighted || (showStepMessage && trainerAnimation)) ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'
            }`} style={{ zIndex: 2 }}>
              <div className="relative">
                {/* Main bubble */}
                <div className="bg-white dark:bg-slate-800 rounded-xl px-4 py-3 shadow-xl">
                  <div className="text-xs font-medium text-green-600 dark:text-green-400">
                    {message}
                  </div>
                </div>
                {/* Seamless arrow */}
                <div className="absolute -bottom-1 left-6 w-2 h-2 bg-white dark:bg-slate-800 transform rotate-45"></div>
              </div>
            </div>
          );
        })()}
      </div>

      <Card className="w-full relative z-10">
        <CardHeader>
          <div className="flex items-center gap-3">
            {steps[currentStep].icon}
            <div>
              <CardTitle>{steps[currentStep].title}</CardTitle>
              <CardDescription>{steps[currentStep].description}</CardDescription>
            </div>
          </div>
          <Progress value={((currentStep + 1) / steps.length) * 100} className="mt-4" />
        </CardHeader>
        <CardContent className="space-y-6">
          {renderStep()}

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Předchozí
            </Button>

            {currentStep === steps.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="min-w-[120px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {createPaymentIntent.isPending ? 'Připravujeme platbu...' : 'Generování plánu...'}
                  </>
                ) : (
                  <>
                    Pokračovat k platbě
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={nextStep}>
                Další
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add custom CSS for floating animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
        assessmentData={data}
        clientSecret={paymentClientSecret}
      />
    </div>
  );
};