import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { User, Scale, Ruler, Target, Dumbbell, Clock } from "lucide-react";

interface UserInfoProps {
  fitnessProfile: {
    age?: number | null;
    gender?: string | null;
    height?: number | null;
    weight?: number | null;
    targetWeight?: number | null;
    fitnessGoal?: string | null;
    activityLevel?: string | null;
    experienceLevel?: string | null;
    workoutDuration?: number | null;
    availableDays?: string | null;
    equipment?: string | null;
    hasInjuries?: boolean;
    injuries?: string | null;
    medicalConditions?: string | null;
  };
}

export function UserInfo({ fitnessProfile }: UserInfoProps) {
  const formatHeight = (height: number | null | undefined) => {
    if (!height) return "Neuvedeno";
    return `${height} cm`;
  };

  const formatWeight = (weight: number | null | undefined) => {
    if (!weight) return "Neuvedeno";
    return `${weight} kg`;
  };

  const formatDuration = (duration: number | null | undefined) => {
    if (!duration) return "Neuvedeno";
    return `${duration} min`;
  };

  const formatDays = (days: string | null | undefined) => {
    if (!days) return "Neuvedeno";
    return days;
  };

  const getGoalColor = (goal: string | null) => {
    switch (goal) {
      case "WEIGHT_LOSS":
        return "bg-red-100 text-red-800";
      case "MUSCLE_GAIN":
        return "bg-blue-100 text-blue-800";
      case "STRENGTH":
        return "bg-purple-100 text-purple-800";
      case "ENDURANCE":
        return "bg-green-100 text-green-800";
      case "GENERAL_FITNESS":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getActivityColor = (level: string | null) => {
    switch (level) {
      case "SEDENTARY":
        return "bg-gray-100 text-gray-800";
      case "LIGHTLY_ACTIVE":
        return "bg-yellow-100 text-yellow-800";
      case "MODERATELY_ACTIVE":
        return "bg-orange-100 text-orange-800";
      case "VERY_ACTIVE":
        return "bg-green-100 text-green-800";
      case "EXTREMELY_ACTIVE":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getExperienceColor = (level: string | null) => {
    switch (level) {
      case "BEGINNER":
        return "bg-green-100 text-green-800";
      case "INTERMEDIATE":
        return "bg-yellow-100 text-yellow-800";
      case "ADVANCED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const translateGender = (gender: string | null | undefined) => {
    switch ((gender || "").toUpperCase()) {
      case "MALE":
        return "Muž";
      case "FEMALE":
        return "Žena";
      case "OTHER":
        return "Jiné";
      case "NON_BINARY":
        return "Neutrální";
      default:
        return "Neuvedeno";
    }
  };

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="user-info">
        <AccordionTrigger>
          <span className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informace o uživateli
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <Card className="w-full">
            <CardContent className="space-y-6 pt-6">
              {/* Základní informace */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Věk</p>
                    <p className="font-medium">{fitnessProfile.age || "Neuvedeno"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Pohlaví</p>
                    <p className="font-medium">{translateGender(fitnessProfile.gender)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Ruler className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Výška</p>
                    <p className="font-medium">{formatHeight(fitnessProfile.height ?? null)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Scale className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Aktuální váha</p>
                    <p className="font-medium">{formatWeight(fitnessProfile.weight ?? null)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Cílová váha</p>
                    <p className="font-medium">{formatWeight(fitnessProfile.targetWeight ?? null)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Délka tréninku</p>
                    <p className="font-medium">{formatDuration(fitnessProfile.workoutDuration ?? null)}</p>
                  </div>
                </div>
              </div>

              {/* Cíle a úrovně */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Fitness cíl</p>
                  <Badge className={getGoalColor(fitnessProfile.fitnessGoal ?? null)}>
                    {fitnessProfile.fitnessGoal === "WEIGHT_LOSS" && "Hubnutí"}
                    {fitnessProfile.fitnessGoal === "MUSCLE_GAIN" && "Nabírání svalů"}
                    {fitnessProfile.fitnessGoal === "STRENGTH" && "Síla"}
                    {fitnessProfile.fitnessGoal === "ENDURANCE" && "Výdrž"}
                    {fitnessProfile.fitnessGoal === "GENERAL_FITNESS" && "Obecná kondice"}
                    {!fitnessProfile.fitnessGoal && "Neuvedeno"}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Úroveň aktivity</p>
                    <Badge className={getActivityColor(fitnessProfile.activityLevel ?? null)}>
                      {fitnessProfile.activityLevel === "SEDENTARY" && "Sedavý"}
                      {fitnessProfile.activityLevel === "LIGHTLY_ACTIVE" && "Lehce aktivní"}
                      {fitnessProfile.activityLevel === "MODERATELY_ACTIVE" && "Středně aktivní"}
                      {fitnessProfile.activityLevel === "VERY_ACTIVE" && "Velmi aktivní"}
                      {fitnessProfile.activityLevel === "EXTREMELY_ACTIVE" && "Extrémně aktivní"}
                      {!fitnessProfile.activityLevel && "Neuvedeno"}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Zkušenosti</p>
                    <Badge className={getExperienceColor(fitnessProfile.experienceLevel ?? null)}>
                      {fitnessProfile.experienceLevel === "BEGINNER" && "Začátečník"}
                      {fitnessProfile.experienceLevel === "INTERMEDIATE" && "Pokročilý"}
                      {fitnessProfile.experienceLevel === "ADVANCED" && "Expert"}
                      {!fitnessProfile.experienceLevel && "Neuvedeno"}
                    </Badge>
                  </div>
                </div>
              </div>


              {/* Zdravotní informace */}
              {(fitnessProfile.hasInjuries || fitnessProfile.injuries || fitnessProfile.medicalConditions) && (
                <div className="space-y-3 pt-4 border-t">
                  <h4 className="font-medium text-sm">Zdravotní informace</h4>

                  {fitnessProfile.hasInjuries && (
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">Zranění</Badge>
                      {fitnessProfile.injuries && (
                        <span className="text-sm text-muted-foreground">{fitnessProfile.injuries}</span>
                      )}
                    </div>
                  )}

                  {fitnessProfile.medicalConditions && (
                    <div>
                      <p className="text-sm text-muted-foreground">Zdravotní stav</p>
                      <p className="text-sm">{fitnessProfile.medicalConditions}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}