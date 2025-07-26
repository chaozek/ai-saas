"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Play, SkipForward } from "lucide-react";
import Link from "next/link";
import { Workout, DAYS } from "./types";

interface WorkoutCardProps {
  workout: Workout;
}

export function WorkoutCard({ workout }: WorkoutCardProps) {
  return (
    <Card className="transition-all duration-200 hover:shadow-lg border-border">
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
          <p className="text-sm font-medium">
            {workout.workoutExercises?.length ?? 0} cviků
          </p>
        </div>

        <div className="flex gap-2">
          <Button size="sm" className="flex-1" asChild>
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
  );
}