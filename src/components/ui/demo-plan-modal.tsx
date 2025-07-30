"use client"

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Target, Dumbbell, Scale, User, Users, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trcp/client";
import { useQuery } from "@tanstack/react-query";
import { useClerk } from "@clerk/nextjs";

interface DemoPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DemoPlanOption {
  id: string;
  title: string;
  description: string;
  gender: string;
  goal: string;
  icon: React.ReactNode;
  features: string[];
  planId: string;
}

export function DemoPlanModal({ isOpen, onClose }: DemoPlanModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<DemoPlanOption | null>(null);
  const router = useRouter();
  const trpc = useTRPC();
  const { user } = useClerk();

  // Fetch demo plans from database
  const { data: demoPlansData, isLoading } = useQuery({
    ...trpc.fitness.getPublicDemoPlans.queryOptions(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Transform database data to demo plan options
  const demoPlans: DemoPlanOption[] = demoPlansData?.map((plan) => {
    const gender = plan.fitnessProfile.gender || 'unknown';
    const goal = plan.fitnessProfile.fitnessGoal || 'GENERAL_FITNESS';

    const getGoalText = (goal: string) => {
      switch (goal) {
        case 'WEIGHT_LOSS': return 'Hubnutí';
        case 'MUSCLE_GAIN': return 'Nabírání svalů';
        case 'ENDURANCE': return 'Vytrvalost';
        case 'STRENGTH': return 'Síla';
        case 'FLEXIBILITY': return 'Flexibilita';
        case 'GENERAL_FITNESS': return 'Obecná fitness';
        default: return 'Fitness';
      }
    };

    const getGenderText = (gender: string) => {
      return gender === 'male' ? 'Muž' : gender === 'female' ? 'Žena' : 'Obecné';
    };

    const getIcon = (goal: string) => {
      switch (goal) {
        case 'MUSCLE_GAIN':
        case 'STRENGTH':
          return <Dumbbell className="w-6 h-6" />;
        case 'WEIGHT_LOSS':
          return <Scale className="w-6 h-6" />;
        case 'ENDURANCE':
          return <Target className="w-6 h-6" />;
        default:
          return <Target className="w-6 h-6" />;
      }
    };

    const getFeatures = (plan: any) => {
      const features = [];
      const workoutCount = plan.workouts?.length || 0;

      if (workoutCount > 0) {
        features.push(`${workoutCount} tréninků týdně`);
      }

      if (plan.fitnessProfile.mealPlanningEnabled) {
        features.push('AI generovaný jídelníček');
      }

      features.push(`${plan.duration} týdnů`);
      features.push(`${plan.fitnessProfile.experienceLevel} úroveň`);

      return features;
    };

    return {
      id: plan.id, // Use the actual workout plan ID as the unique key
      title: `${getGenderText(gender)} - ${getGoalText(goal)}`,
      description: plan.description || `Personalizovaný plán pro ${getGenderText(gender).toLowerCase()} zaměřený na ${getGoalText(goal).toLowerCase()}`,
      gender,
      goal,
      icon: getIcon(goal),
      features: getFeatures(plan),
      planId: plan.id,
    };
  }) || [];

  const handlePlanSelect = (plan: DemoPlanOption) => {
    setSelectedPlan(plan);
  };

  const handleContinue = () => {
    if (selectedPlan) {
      if (user) {
        // Uživatel je přihlášený - přímo na dashboard
        router.push(`/dashboard?demoPlanId=${selectedPlan.planId}`);
      } else {
        // Uživatel není přihlášený - na přihlášení s demo parametrem
        router.push(`/sign-in?demoPlanId=${selectedPlan.planId}`);
      }
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Vyberte si demo plán
          </DialogTitle>
          <DialogDescription className="text-center">
            Prohlédněte si, jak vypadá reálný fitness plán přizpůsobený vašim potřebám
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="ml-2">Načítání demo plánů...</span>
            </div>
          )}

          {/* Plan Selection */}
          {!isLoading && demoPlans.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Momentálně nejsou k dispozici žádné demo plány.</p>
            </div>
          )}

          {!isLoading && demoPlans.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {demoPlans.map((plan) => (
              <Card
                key={plan.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedPlan?.id === plan.id
                    ? "ring-2 ring-primary bg-primary/5"
                    : "hover:bg-muted/50"
                }`}
                onClick={() => handlePlanSelect(plan)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {plan.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{plan.title}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Zrušit
            </Button>
            <Button
              onClick={handleContinue}
              disabled={!selectedPlan}
              className="min-w-[120px]"
            >
              Pokračovat
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}