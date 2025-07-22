"use client"

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Pause,
  SkipForward,
  Timer,
  Target,
  Clock,
  CheckCircle,
  ArrowLeft,
  Volume2
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Exercise {
  id: string;
  name: string;
  description: string;
  category: string;
  sets?: number;
  reps?: number;
  duration?: number;
  restTime?: number;
  weight?: number;
  completed?: boolean;
}

interface Workout {
  id: string;
  name: string;
  description: string;
  duration: number;
  exercises: Exercise[];
  completed?: boolean;
}

// Mock data - in a real app, this would come from the database
const mockWorkout: Workout = {
  id: "1",
  name: "Upper Body Strength",
  description: "Focus on chest, shoulders, and arms",
  duration: 45,
  exercises: [
    {
      id: "1",
      name: "Push-ups",
      description: "Standard push-ups targeting chest and triceps",
      category: "strength",
      sets: 3,
      reps: 12,
      restTime: 90,
      completed: false
    },
    {
      id: "2",
      name: "Dumbbell Shoulder Press",
      description: "Standing shoulder press with dumbbells",
      category: "strength",
      sets: 3,
      reps: 10,
      restTime: 120,
      completed: false
    },
    {
      id: "3",
      name: "Bent-over Rows",
      description: "Back exercise with dumbbells",
      category: "strength",
      sets: 3,
      reps: 12,
      restTime: 90,
      completed: false
    },
    {
      id: "4",
      name: "Plank Hold",
      description: "Core stability exercise",
      category: "strength",
      duration: 60,
      restTime: 60,
      completed: false
    },
    {
      id: "5",
      name: "Tricep Dips",
      description: "Bodyweight tricep exercise",
      category: "strength",
      sets: 3,
      reps: 15,
      restTime: 90,
      completed: false
    }
  ],
  completed: false
};

export default function WorkoutPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [workout, setWorkout] = useState<Workout>(mockWorkout);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isResting, setIsResting] = useState(false);

  const completedExercises = workout.exercises.filter(ex => ex.completed).length;
  const progress = (completedExercises / workout.exercises.length) * 100;

  const startWorkout = () => {
    setIsActive(true);
    setCurrentExercise(0);
  };

  const completeExercise = (exerciseId: string) => {
    setWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex =>
        ex.id === exerciseId ? { ...ex, completed: true } : ex
      )
    }));

    // Move to next exercise or complete workout
    if (currentExercise < workout.exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
    } else {
      // Workout completed
      setWorkout(prev => ({ ...prev, completed: true }));
      setIsActive(false);
    }
  };

  const skipExercise = () => {
    if (currentExercise < workout.exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
    }
  };

  const getCurrentExercise = () => {
    return workout.exercises[currentExercise];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zpět
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{workout.name}</h1>
            <p className="text-gray-600">{workout.description}</p>
          </div>
        </div>

        {/* Workout Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Průběh tréninku
                </CardTitle>
                <CardDescription>
                  {completedExercises} z {workout.exercises.length} cvičení dokončeno
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{workout.duration} min</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Průběh</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Current Exercise */}
        {isActive && getCurrentExercise() && (
          <Card className="border-2 border-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5 text-green-600" />
                Aktuální cvičení: {getCurrentExercise().name}
              </CardTitle>
              <CardDescription>
                {getCurrentExercise().description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {getCurrentExercise().sets && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{getCurrentExercise().sets}</div>
                    <div className="text-sm text-gray-600">Série</div>
                  </div>
                )}
                {getCurrentExercise().reps && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{getCurrentExercise().reps}</div>
                    <div className="text-sm text-gray-600">Opakování</div>
                  </div>
                )}
                {getCurrentExercise().duration && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{getCurrentExercise().duration}s</div>
                    <div className="text-sm text-gray-600">Doba trvání</div>
                  </div>
                )}
                {getCurrentExercise().restTime && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{getCurrentExercise().restTime}s</div>
                    <div className="text-sm text-gray-600">Odpočinek</div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => completeExercise(getCurrentExercise().id)}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Dokončit cvičení
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
              {workout.exercises.map((exercise, index) => (
                <div
                  key={exercise.id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                    exercise.completed
                      ? 'bg-green-50 border-green-200'
                      : index === currentExercise && isActive
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      exercise.completed
                        ? 'bg-green-500 text-white'
                        : index === currentExercise && isActive
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {exercise.completed ? (
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
                  <Badge variant={exercise.completed ? "default" : "secondary"}>
                    {exercise.category}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Workout Controls */}
        <div className="flex gap-4">
          {!isActive && !workout.completed && (
            <Button size="lg" className="flex-1" onClick={startWorkout}>
              <Play className="w-5 h-5 mr-2" />
              Začít trénink
            </Button>
          )}

          {workout.completed && (
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
}