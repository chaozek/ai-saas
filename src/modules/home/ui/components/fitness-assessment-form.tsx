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
  { value: "WEIGHT_LOSS", label: "Weight Loss", icon: "⚖️" },
  { value: "MUSCLE_GAIN", label: "Muscle Gain", icon: "💪" },
  { value: "ENDURANCE", label: "Endurance", icon: "🏃" },
  { value: "STRENGTH", label: "Strength", icon: "🏋️" },
  { value: "FLEXIBILITY", label: "Flexibility", icon: "🧘" },
  { value: "GENERAL_FITNESS", label: "General Fitness", icon: "🌟" },
];

const ACTIVITY_LEVELS = [
  { value: "SEDENTARY", label: "Sedentary (little to no exercise)" },
  { value: "LIGHTLY_ACTIVE", label: "Lightly Active (light exercise 1-3 days/week)" },
  { value: "MODERATELY_ACTIVE", label: "Moderately Active (moderate exercise 3-5 days/week)" },
  { value: "VERY_ACTIVE", label: "Very Active (hard exercise 6-7 days/week)" },
  { value: "EXTREMELY_ACTIVE", label: "Extremely Active (very hard exercise, physical job)" },
];

const EXPERIENCE_LEVELS = [
  { value: "BEGINNER", label: "Beginner (0-1 years)" },
  { value: "INTERMEDIATE", label: "Intermediate (1-3 years)" },
  { value: "ADVANCED", label: "Advanced (3+ years)" },
];

const DAYS_OF_WEEK = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

const EQUIPMENT_OPTIONS = [
  { value: "none", label: "No Equipment" },
  { value: "dumbbells", label: "Dumbbells" },
  { value: "resistance_bands", label: "Resistance Bands" },
  { value: "pull_up_bar", label: "Pull-up Bar" },
  { value: "bench", label: "Bench" },
  { value: "barbell", label: "Barbell" },
  { value: "kettlebell", label: "Kettlebell" },
  { value: "gym_access", label: "Full Gym Access" },
];

const DIETARY_RESTRICTIONS = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "gluten_free", label: "Gluten-Free" },
  { value: "dairy_free", label: "Dairy-Free" },
  { value: "keto", label: "Keto" },
  { value: "paleo", label: "Paleo" },
  { value: "mediterranean", label: "Mediterranean" },
  { value: "low_carb", label: "Low-Carb" },
  { value: "none", label: "No Restrictions" },
];

const CUISINE_OPTIONS = [
  { value: "italian", label: "Italian" },
  { value: "mexican", label: "Mexican" },
  { value: "asian", label: "Asian" },
  { value: "mediterranean", label: "Mediterranean" },
  { value: "american", label: "American" },
  { value: "indian", label: "Indian" },
  { value: "thai", label: "Thai" },
  { value: "japanese", label: "Japanese" },
  { value: "greek", label: "Greek" },
  { value: "french", label: "French" },
];

const COOKING_SKILLS = [
  { value: "BEGINNER", label: "Beginner (basic cooking skills)" },
  { value: "INTERMEDIATE", label: "Intermediate (can follow recipes)" },
  { value: "ADVANCED", label: "Advanced (experienced cook)" },
];

export const FitnessAssessmentForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    budgetPerWeek: "100",
    mealPrepTime: "30",
    preferredCuisines: [],
    cookingSkill: "BEGINNER",
  });

  const steps = [
    {
      title: "Personal Information",
      description: "Let's start with some basic information about you",
      icon: <Target className="w-5 h-5" />,
    },
    {
      title: "Fitness Goals",
      description: "What are your primary fitness objectives?",
      icon: <Activity className="w-5 h-5" />,
    },
    {
      title: "Experience & Activity",
      description: "Tell us about your current fitness level",
      icon: <Dumbbell className="w-5 h-5" />,
    },
    {
      title: "Health Information",
      description: "Any injuries or medical conditions we should know about?",
      icon: <Activity className="w-5 h-5" />,
    },
    {
      title: "Preferences",
      description: "What works best for your schedule and equipment?",
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      title: "Meal Planning",
      description: "Let's set up your nutrition plan",
      icon: <Calendar className="w-5 h-5" />,
    },
  ];

  const updateData = (field: keyof AssessmentData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generatePlan = useMutation(trpc.fitness.generatePlan.mutationOptions({
    onSuccess: async (data) => {
      toast.success("Fitness plan generation started! Redirecting to dashboard...");
      router.push('/dashboard?generating=true');
    },
    onError: (error) => {
      if (error.data?.code === "TOO_MANY_REQUESTS") {
        toast.error("You have reached your daily limit of fitness plan generations. Please upgrade to a paid plan to continue.");
        setTimeout(() => {    
          router.push("/pricing");
        }, 1000);
      } else {
        toast.error(error.message || "Something went wrong. Please try again.");
      }
    }
  }));

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please sign in to continue");
      return;
    }

    if (data.availableDays.length === 0) {
      toast.error("Please select at least one day for your workouts");
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
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="25"
                  value={data.age}
                  onChange={(e) => updateData("age", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={data.gender} onValueChange={(value) => updateData("gender", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="175"
                  value={data.height}
                  onChange={(e) => updateData("height", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Current Weight (kg)</Label>
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
              <Label htmlFor="targetWeight">Target Weight (kg) - Optional</Label>
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
              <Label>What's your primary fitness goal?</Label>
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
              <Label>What's your current activity level?</Label>
              <Select value={data.activityLevel} onValueChange={(value) => updateData("activityLevel", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select activity level" />
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
              <Label>What's your fitness experience level?</Label>
              <Select value={data.experienceLevel} onValueChange={(value) => updateData("experienceLevel", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select experience level" />
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
                <Label htmlFor="hasInjuries">Do you have any injuries or limitations?</Label>
              </div>
              {data.hasInjuries && (
                <Textarea
                  placeholder="Please describe your injuries or limitations..."
                  value={data.injuries}
                  onChange={(e) => updateData("injuries", e.target.value)}
                />
              )}
            </div>
            <div className="space-y-4">
              <Label htmlFor="medicalConditions">Medical Conditions (Optional)</Label>
              <Textarea
                id="medicalConditions"
                placeholder="Any medical conditions we should be aware of..."
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
              <Label>Which days are you available for workouts?</Label>
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
              <Label>Preferred workout duration (minutes)</Label>
              <Select value={data.workoutDuration} onValueChange={(value) => updateData("workoutDuration", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-4">
              <Label>What equipment do you have access to?</Label>
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
              <Label htmlFor="preferredExercises">Preferred exercises or activities (Optional)</Label>
              <Textarea
                id="preferredExercises"
                placeholder="e.g., running, yoga, weightlifting, swimming..."
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
                <Label htmlFor="mealPlanningEnabled" className="text-lg font-medium">Enable Meal Planning</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Get personalized meal plans and recipes tailored to your fitness goals and preferences.
              </p>
            </div>

            {data.mealPlanningEnabled && (
              <>
                <div className="space-y-4">
                  <Label>Dietary Restrictions</Label>
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
                  <Label htmlFor="allergies">Food Allergies (Optional)</Label>
                  <Textarea
                    id="allergies"
                    placeholder="e.g., nuts, shellfish, dairy..."
                    value={data.allergies.join(', ')}
                    onChange={(e) => updateData("allergies", e.target.value.split(',').map(item => item.trim()).filter(item => item))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <Label>Weekly Food Budget ($)</Label>
                    <Select value={data.budgetPerWeek} onValueChange={(value) => updateData("budgetPerWeek", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="50">$50</SelectItem>
                        <SelectItem value="75">$75</SelectItem>
                        <SelectItem value="100">$100</SelectItem>
                        <SelectItem value="150">$150</SelectItem>
                        <SelectItem value="200">$200</SelectItem>
                        <SelectItem value="250">$250</SelectItem>
                        <SelectItem value="300">$300+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <Label>Meal Prep Time (minutes per day)</Label>
                    <Select value={data.mealPrepTime} onValueChange={(value) => updateData("mealPrepTime", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                        <SelectItem value="90">90+ minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Preferred Cuisines</Label>
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
                  <Label>Cooking Skill Level</Label>
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
    <Card className="w-full">
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
            Previous
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
                  Creating Plan...
                </>
              ) : (
                <>
                  Generate Plan
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          ) : (
            <Button onClick={nextStep}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};