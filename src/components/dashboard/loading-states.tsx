"use client"

import { Button } from "@/components/ui/button";
import { Dumbbell, Calendar } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  description?: string;
}

export function LoadingState({
  message = "Inicializace nástěnky...",
  description
}: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-lg font-medium">{message}</p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
}

interface ErrorStateProps {
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  icon?: React.ReactNode;
}

export function ErrorState({
  title,
  description,
  actionText,
  actionHref,
  icon = <Dumbbell className="w-8 h-8 text-primary" />
}: ErrorStateProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          {icon}
        </div>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
        {actionText && actionHref && (
          <Button onClick={() => window.location.href = actionHref}>
            {actionText}
          </Button>
        )}
      </div>
    </div>
  );
}

export function NoProfileState() {
  return (
    <ErrorState
      title="Profil fitness nenalezen"
      description="Prosím, dokončete fitness hodnocení pro vygenerování vašeho plánu."
      actionText="Začít hodnocení"
      actionHref="/"
    />
  );
}

export function NoWorkoutPlanState() {
  return (
    <ErrorState
      title="Nebyl nalezen žádný tréninkový plán"
      description="Dokončete fitness hodnocení pro vygenerování vašeho plánu."
      actionText="Začít hodnocení"
      actionHref="/"
    />
  );
}

export function UnauthorizedState() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">Přihlášení vyžadováno</h2>
        <p className="text-muted-foreground">Prosím, přihlaste se pro přístup k vaší fitness nástěnce.</p>
        <Button onClick={() => window.location.href = '/sign-in'}>
          Přihlásit se
        </Button>
      </div>
    </div>
  );
}