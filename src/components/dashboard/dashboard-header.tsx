"use client"

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useClerk } from "@clerk/nextjs";

interface DashboardHeaderProps {
  userName?: string | null;
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Vaše fitness nástěnka</h1>
        <p className="text-muted-foreground">
          Vítejte zpět, {userName || 'Fitness nadšenec'}!
        </p>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Nový plán
        </Button>
      </div>
    </div>
  );
}