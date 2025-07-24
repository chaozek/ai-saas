"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export function ProgressTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Progresní analýzy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2 p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">12</div>
              <p className="text-sm text-muted-foreground">Tréninky dokončeny</p>
            </div>
            <div className="text-center space-y-2 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">85%</div>
              <p className="text-sm text-muted-foreground">Spojitost</p>
            </div>
            <div className="text-center space-y-2 p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">540</div>
              <p className="text-sm text-muted-foreground">Minut trénováno</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}