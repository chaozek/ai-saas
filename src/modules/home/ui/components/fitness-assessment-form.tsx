"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Loader2, ArrowRight, ArrowLeft, Target, Activity, Dumbbell, Calendar, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { toast } from "sonner";
import { useTRPC } from "@/trcp/client";
import { useMutation } from "@tanstack/react-query";

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
}

const FITNESS_GOALS = [
  { value: "WEIGHT_LOSS", label: "Hmotnostní ztráta", icon: "⚖️" },
  { value: "MUSCLE_GAIN", label: "Svalová získání", icon: "💪" },
  { value: "ENDURANCE", label: "Endurance", icon: "🏃" },
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

export const FitnessAssessmentForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trainerAnimation, setTrainerAnimation] = useState(false);
  const router = useRouter();
  const { user } = useClerk();
  const trpc = useTRPC();

  const [data, setData] = useState<AssessmentData>({
    age: "",
    gender: "",
    height: "",
    weight: "",
    targetWeight: "",
    fitnessGoal: "GENERAL_FITNESS",
    activityLevel: "SEDENTARY",
    experienceLevel: "BEGINNER",
    hasInjuries: false,
    injuries: "",
    medicalConditions: "",
    availableDays: [],
    workoutDuration: "45",
    preferredExercises: "",
    equipment: [],
    mealPlanningEnabled: false,
    dietaryRestrictions: [],
    allergies: [],
    budgetPerWeek: "1000",
    mealPrepTime: "30",
    preferredCuisines: [],
    cookingSkill: "BEGINNER",
  });

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

  const updateData = (field: keyof AssessmentData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    // Check if we're on step 4 (preferences step) and validate available days
    if (currentStep === 4 && data.availableDays.length === 0) {
      toast.error("Prosím, vyberte alespoň jeden den pro vaše cvičení");
      return;
    }

    if (currentStep < steps.length - 1) {
      setTrainerAnimation(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setTrainerAnimation(false);
      }, 300);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generatePlan = useMutation(trpc.fitness.generatePlan.mutationOptions({
    onSuccess: async (data) => {
      toast.success("Generování fitness plánu zahájeno! Přesměrování na řídicí panel...");
      router.push('/dashboard?generating=true');
    },
    onError: (error) => {
      if (error.data?.code === "TOO_MANY_REQUESTS") {
        toast.error("Dosáhli jste denní limit generování fitness plánů. Prosím, upgradujte na placený plán pro pokračování.");
        setTimeout(() => {
          router.push("/pricing");
        }, 1000);
      } else {
        toast.error(error.message || "Něco se pokazilo. Prosím, zkuste to znovu.");
      }
    }
  }));

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Prosím, přihlaste se pro pokračování");
      return;
    }

    if (data.availableDays.length === 0) {
      toast.error("Prosím, vyberte alespoň jeden den pro vaše cvičení");
      return;
    }

    setIsSubmitting(true);
    generatePlan.mutate(data, {
      onSettled: () => {
        setIsSubmitting(false);
      }
    });
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

      case 3:
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

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label>Které dny jste k dispozici pro cvičení?</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={day.value}
                      checked={data.availableDays.includes(day.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateData("availableDays", [...data.availableDays, day.value]);
                        } else {
                          updateData("availableDays", data.availableDays.filter(d => d !== day.value));
                        }
                      }}
                    />
                    <Label htmlFor={day.value} className="text-sm">{day.label}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <Label>Preferovaná doba trvání cvičení (minuty)</Label>
              <Select value={data.workoutDuration} onValueChange={(value) => updateData("workoutDuration", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minut</SelectItem>
                  <SelectItem value="45">45 minut</SelectItem>
                  <SelectItem value="60">60 minut</SelectItem>
                  <SelectItem value="90">90 minut</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-4">
              <Label>Jaké vybavení máte k dispozici?</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {EQUIPMENT_OPTIONS.map((equipment) => (
                  <div key={equipment.value} className="flex items-center space-x-2">
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
              <Label htmlFor="preferredExercises">Preferované cvičení nebo aktivity (Volitelné)</Label>
              <Textarea
                id="preferredExercises"
                placeholder="např. běhání, jóga, tělesné výcviky, plavání..."
                value={data.preferredExercises}
                onChange={(e) => updateData("preferredExercises", e.target.value)}
              />
            </div>
          </div>
        );

      case 5:
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
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative">
                        {/* Trainer image positioned absolutely at the top right */}
      <div className="absolute -top-32 right-0 z-0">
        <img
          src="/trainer.png"
          alt="Fitness Trainer"
          className={`w-32 h-32 object-contain transition-all duration-300 ${
            trainerAnimation
              ? 'scale-110 rotate-6 translate-x-2 translate-y-2'
              : 'scale-100 rotate-0 translate-x-0 translate-y-0'
          }`}
        />
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
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Vytvoření plánu...
                </>
              ) : (
                <>
                  Generovat plán
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
    </div>
  );
};