"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { WorkoutCard } from "./workout-card";
import { WorkoutPlan } from "./types";

interface WorkoutsTabProps {
  workoutPlan: WorkoutPlan;
  shouldShowLoading: boolean | null | undefined;
  isDemoMode?: boolean;
}

export function WorkoutsTab({ workoutPlan, shouldShowLoading, isDemoMode = false }: WorkoutsTabProps) {
  const [currentWeek, setCurrentWeek] = useState(1);

  const getCurrentWeekWorkouts = () => {
    if (!workoutPlan?.workouts) return [];
    return workoutPlan.workouts.filter((w: any) => w.weekNumber === currentWeek);
  };

  const getWeekProgress = () => {
    const weekWorkouts = getCurrentWeekWorkouts();
    return weekWorkouts.length > 0 ? 0 : 0; // For now, return 0 progress
  };

  if (shouldShowLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <h3 className="text-lg font-medium">
            Generuji tréninkový plán...
          </h3>
          <p className="text-sm text-muted-foreground">
            Vytvářím personalizované tréninky pro vaše fitness cíle
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span>Může to trvat několik minut</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
          <WorkoutCard key={workout.id} workout={workout} isDemoMode={isDemoMode} />
        ))}
      </div>
    </div>
  );
}