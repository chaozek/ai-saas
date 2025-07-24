"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Pause,
  SkipForward,
  CheckCircle,
  ArrowLeft,
  Timer,
  Target
} from "lucide-react";
import { useTRPC } from "@/trcp/client";
import { useQuery } from "@tanstack/react-query";
import { Workout, Exercise } from "@/components/dashboard/types";

interface WorkoutWithCompleted extends Workout {
  completed?: boolean;
  exercises: (Exercise & { completed?: boolean })[];
}

export const WorkoutView = ({ workoutId }: { workoutId: string }) => {
  const router = useRouter();
  const trpc = useTRPC();
  const [isActive, setIsActive] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());

  const { data: workout, isLoading } = useQuery({
    ...trpc.fitness.getWorkout.queryOptions({ workoutId }),
  });

  useEffect(() => {
    if (workout && completedExercises.size === workout.exercises.length) {
      // All exercises completed
      setIsActive(false);
    }
  }, [completedExercises, workout]);

  const startWorkout = () => {
    setIsActive(true);
    setCurrentExercise(0);
  };

  const completeExercise = (exerciseId: string) => {
    setCompletedExercises(prev => new Set([...prev, exerciseId]));

    // Move to next exercise
    if (workout && currentExercise < workout.exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
    }
  };

  const skipExercise = () => {
    if (workout && currentExercise < workout.exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
    }
  };

  const getCurrentExercise = () => {
    if (!workout || !workout.exercises[currentExercise]) return null;
    return workout.exercises[currentExercise];
  };

  const getProgress = () => {
    if (!workout) return 0;
    return (completedExercises.size / workout.exercises.length) * 100;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p>Načítám trénink...</p>
        </div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Trénink nenalezen</h2>
          <Button onClick={() => router.push('/dashboard')}>
            Zpět na řídicí panel
          </Button>
        </div>
      </div>
    );
  }

  const currentExerciseData = getCurrentExercise();
  const isWorkoutCompleted = completedExercises.size === workout.exercises.length;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zpět na řídicí panel
          </Button>
          <div className="text-right">
            <h1 className="text-2xl font-bold">{workout.name}</h1>
            <p className="text-muted-foreground">{workout.description}</p>
          </div>
        </div>

        {/* Progress */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Průběh tréninku</span>
                <span>{Math.round(getProgress())}%</span>
              </div>
              <Progress value={getProgress()} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {completedExercises.size} z {workout.exercises.length} cvičení dokončeno
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Current Exercise */}
        {isActive && currentExerciseData && (
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Aktuální cvičení: {currentExerciseData.name}
              </CardTitle>
              <CardDescription>
                {currentExercise + 1} z {workout.exercises.length}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{currentExerciseData.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {currentExerciseData.sets && (
                  <div className="text-center p-3 rounded-lg bg-blue-50">
                    <div className="text-2xl font-bold text-blue-600">{currentExerciseData.sets}</div>
                    <p className="text-sm text-blue-700">Série</p>
                  </div>
                )}
                {currentExerciseData.reps && (
                  <div className="text-center p-3 rounded-lg bg-green-50">
                    <div className="text-2xl font-bold text-green-600">{currentExerciseData.reps}</div>
                    <p className="text-sm text-green-700">Opakování</p>
                  </div>
                )}
                {currentExerciseData.duration && (
                  <div className="text-center p-3 rounded-lg bg-orange-50">
                    <div className="text-2xl font-bold text-orange-600">{currentExerciseData.duration}s</div>
                    <p className="text-sm text-orange-700">Doba</p>
                  </div>
                )}
                {currentExerciseData.restTime && (
                  <div className="text-center p-3 rounded-lg bg-purple-50">
                    <div className="text-2xl font-bold text-purple-600">{currentExerciseData.restTime}s</div>
                    <p className="text-sm text-purple-700">Odpočinek</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={() => completeExercise(currentExerciseData.id)}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Dokončit
                </Button>
                <Button variant="outline" onClick={skipExercise}>
                  <SkipForward className="w-4 h-4 mr-2" />
                  Přeskočit
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Exercise List */}
        <Card>
          <CardHeader>
            <CardTitle>Všechna cvičení</CardTitle>
            <CardDescription>
              {workout.exercises.length} cvičení • {workout.duration} minut
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {workout.exercises.map((exercise: any, index: number) => (
                <div
                  key={exercise.id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                    completedExercises.has(exercise.id)
                      ? 'bg-green-50 border-green-200'
                      : index === currentExercise && isActive
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      completedExercises.has(exercise.id)
                        ? 'bg-green-500 text-white'
                        : index === currentExercise && isActive
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {completedExercises.has(exercise.id) ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{exercise.name}</h3>
                      <p className="text-sm text-gray-600">{exercise.description}</p>
                      <div className="flex items-center gap-4 mt-1">
                        {exercise.sets && (
                          <span className="text-xs text-gray-500">{exercise.sets} série</span>
                        )}
                        {exercise.reps && (
                          <span className="text-xs text-gray-500">{exercise.reps} opakování</span>
                        )}
                        {exercise.duration && (
                          <span className="text-xs text-gray-500">{exercise.duration}s</span>
                        )}
                        {exercise.restTime && (
                          <span className="text-xs text-gray-500">{exercise.restTime}s odpočinek</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge variant={completedExercises.has(exercise.id) ? "default" : "secondary"}>
                    {exercise.category}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Workout Controls */}
        <div className="flex gap-4">
          {!isActive && !isWorkoutCompleted && (
            <Button size="lg" className="flex-1" onClick={startWorkout}>
              <Play className="w-5 h-5 mr-2" />
              Začít trénink
            </Button>
          )}

          {isWorkoutCompleted && (
            <Card className="w-full bg-green-50 border-green-200">
              <CardContent className="py-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-800 mb-2">Trénink dokončen!</h3>
                <p className="text-green-700 mb-4">
                  Výborně! Dokončili jste všechna {workout.exercises.length} cvičení.
                </p>
                <Button onClick={() => router.push('/dashboard')}>
                  Zpět na řídicí panel
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};