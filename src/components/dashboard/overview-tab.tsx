"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3 } from "lucide-react";
import { WorkoutPlan } from "./types";

interface OverviewTabProps {
  workoutPlan: WorkoutPlan;
  currentWeek: number;
}

export function OverviewTab({ workoutPlan, currentWeek }: OverviewTabProps) {
  return (
    <div className="space-y-6">
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
    </div>
  );
}