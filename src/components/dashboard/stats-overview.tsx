"use client"

import { Card, CardContent } from "@/components/ui/card";
import { Activity, Target, Dumbbell, Clock } from "lucide-react";
import { WorkoutPlan } from "./types";

interface StatsOverviewProps {
  currentWeek: number;
  workoutPlan: WorkoutPlan;
  weekProgress: number;
  currentWeekWorkouts: any[];
}

// Pomocná třída pro glowing border
const borderGlow = {
  green: "relative hover:before:content-[''] before:absolute before:left-0 before:top-3 before:bottom-3 before:w-3 before:rounded-lg before:bg-green-500 before:blur-md before:opacity-40 before:z-0 before:opacity-0 hover:before:opacity-40 before:transition-opacity before:duration-300",
  blue: "relative hover:before:content-[''] before:absolute before:left-0 before:top-3 before:bottom-3 before:w-3 before:rounded-lg before:bg-blue-500 before:blur-md before:opacity-40 before:z-0 before:opacity-0 hover:before:opacity-40 before:transition-opacity before:duration-300",
  purple: "relative hover:before:content-[''] before:absolute before:left-0 before:top-3 before:bottom-3 before:w-3 before:rounded-lg before:bg-purple-500 before:blur-md before:opacity-40 before:z-0 before:opacity-0 hover:before:opacity-40 before:transition-opacity before:duration-300",
  orange: "relative hover:before:content-[''] before:absolute before:left-0 before:top-3 before:bottom-3 before:w-3 before:rounded-lg before:bg-orange-500 before:blur-md before:opacity-40 before:z-0 before:opacity-0 hover:before:opacity-40 before:transition-opacity before:duration-300",
};

export function StatsOverview({
  currentWeek,
  workoutPlan,
  weekProgress,
  currentWeekWorkouts
}: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className={`border-l-4 border-l-green-500 ${borderGlow.green}`}>
        <CardContent className="p-6 pl-10 relative z-10">
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

      <Card className={`border-l-4 border-l-blue-500 ${borderGlow.blue}`}>
        <CardContent className="p-6 pl-10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Průběh týdne</p>
              <p className="text-2xl font-bold">{Math.round(weekProgress)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={`border-l-4 border-l-purple-500 ${borderGlow.purple}`}>
        <CardContent className="p-6 pl-10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tréninky tento týden</p>
              <p className="text-2xl font-bold">{currentWeekWorkouts.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={`border-l-4 border-l-orange-500 ${borderGlow.orange}`}>
        <CardContent className="p-6 pl-10 relative z-10">
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
  );
}