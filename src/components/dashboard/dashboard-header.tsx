"use client"

import { Button } from "@/components/ui/button";
import { Settings, Plus } from "lucide-react";
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
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Nastavení
        </Button>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Nový plán
        </Button>
      </div>
    </div>
  );
}