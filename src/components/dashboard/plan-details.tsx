"use client"

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, Clock, Target, ChevronDown, ChevronUp } from "lucide-react";
import { WorkoutPlan } from "./types";

interface PlanDetailsProps {
  workoutPlan: WorkoutPlan | undefined | null;
}

export function PlanDetails({ workoutPlan }: PlanDetailsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Convert markdown-like content to HTML for better display
  const formatPlanContent = (content: string) => {
    return content
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-6 mb-3 text-foreground">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-8 mb-4 text-foreground">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4 text-foreground">$1</h1>')

      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')

      // Lists
      .replace(/^\n- (.*$)/gim, '<li class="ml-4">• $1</li>')
      .replace(/^\n• (.*$)/gim, '<li class="ml-4">• $1</li>')

      // Wrap lists in ul tags
      .replace(/(<li.*?<\/li>)/g, '<ul class="list-disc ml-6 space-y-1 my-3">$1</ul>')

      // Paragraphs (handle after headers and lists)
      .replace(/\n\n/g, '</p><p class="mb-3">')
      .replace(/\n/g, '<br>')
      .replace(/^/, '<p class="mb-3">')
      .replace(/$/, '</p>')

      // Clean up any double ul tags
      .replace(/<ul[^>]*><ul[^>]*>/g, '<ul class="list-disc ml-6 space-y-1 my-3">')
      .replace(/<\/ul><\/ul>/g, '</ul>');
  };

  if (!workoutPlan || workoutPlan === null) {
    return (
      <Card className="border-2 border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              <CardTitle className="text-xl">Detailní popis plánu</CardTitle>
            </div>
          </div>
          <CardDescription>
            Kompletní tréninkový program se právě generuje...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Generování detailního popisu plánu...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show plan content if available, even if workouts aren't ready yet
  if (workoutPlan.planContent) {
    return (
      <Card className="border-2 border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              <CardTitle className="text-xl">Detailní popis plánu</CardTitle>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isExpanded ? (
                <>
                  <span>Skrýt</span>
                  <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Zobrazit</span>
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
          <CardDescription>
            Kompletní tréninkový program přizpůsobený vašim potřebám
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Plan Overview */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{workoutPlan.duration || '-'} týdnů</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Denní tréninky</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="w-4 h-4" />
                <span>Personalizovaný</span>
              </div>
            </div>

            {/* Plan Content - Collapsible */}
            {isExpanded && (
              <>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <div
                    className="space-y-4 text-sm leading-relaxed [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mt-8 [&>h1]:mb-4 [&>h2]:text-xl [&>h2]:font-bold [&>h2]:mt-6 [&>h2]:mb-3 [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:mt-4 [&>h3]:mb-2 [&>p]:mb-3 [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:space-y-1 [&>ul]:my-3 [&>strong]:font-semibold [&>em]:italic"
                    dangerouslySetInnerHTML={{
                      __html: formatPlanContent(workoutPlan.planContent)
                    }}
                  />
                </div>

                {/* Important Notes */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Důležité poznámky:
                  </h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Vždy poslouchejte své tělo a nepřetěžujte se</li>
                    <li>• Před zahájením tréninku se poraďte s lékařem</li>
                    <li>• Postupně zvyšujte intenzitu podle svých možností</li>
                    <li>• Pravidelně sledujte svůj pokrok</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // If no plan content, return null
  return null;
}