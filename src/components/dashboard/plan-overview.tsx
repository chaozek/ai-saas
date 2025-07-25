"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { WorkoutPlan } from "./types";

interface PlanOverviewProps {
  workoutPlan: WorkoutPlan;
}

export function PlanOverview({ workoutPlan }: PlanOverviewProps) {
  const getCzechDifficulty = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER': return 'Začátečník';
      case 'INTERMEDIATE': return 'Střední';
      case 'ADVANCED': return 'Pokročilý';
      default: return difficulty;
    }
  };

  return (
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
            <Badge variant="secondary" className="text-sm">{getCzechDifficulty(workoutPlan.difficulty)}</Badge>
            <Badge variant="outline" className="text-sm">{workoutPlan.duration} týdnů</Badge>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}