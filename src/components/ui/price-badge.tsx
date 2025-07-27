"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PRODUCT_PRICE, PRICE_COMPARISONS } from "@/lib/constants";
import { Sparkles, Zap } from "lucide-react";

interface PriceBadgeProps {
  variant?: "default" | "highlighted" | "compact";
  showComparison?: boolean;
  className?: string;
  onClick?: () => void;
}

export function PriceBadge({
  variant = "default",
  showComparison = true,
  className = "",
  onClick
}: PriceBadgeProps) {
  const [currentComparison, setCurrentComparison] = useState(0);

  useEffect(() => {
    if (showComparison) {
      const interval = setInterval(() => {
        setCurrentComparison((prev) => (prev + 1) % PRICE_COMPARISONS.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [showComparison]);

  const comparison = PRICE_COMPARISONS[currentComparison];

          if (variant === "compact") {
    return (
      <div className="relative group cursor-pointer" onClick={onClick}>
        {/* Glowing background effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-green-600 via-emerald-500 to-blue-600 rounded-lg blur-md opacity-50 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
        {/* Badge with neutral styling */}
        <Badge
          variant="secondary"
          className={`relative bg-white dark:bg-slate-800 text-foreground border border-border hover:bg-muted transition-all duration-300 transform hover:scale-105 ${className}`}
        >
          <Sparkles className="w-3 h-3 mr-1 text-green-600 dark:text-green-400" />
          {PRODUCT_PRICE} Kč
        </Badge>
      </div>
    );
  }

  if (variant === "highlighted") {
    return (
      <div className="relative group cursor-pointer" onClick={onClick}>
        {/* Glowing background effect */}
        <div className="absolute -inset-2 bg-gradient-to-r from-green-600 via-emerald-500 to-blue-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
        {/* Card with neutral styling */}
        <Card className={`relative bg-white dark:bg-slate-800 border border-border hover:bg-muted shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${className}`}>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
              <span className="text-3xl font-bold text-foreground">
                {PRODUCT_PRICE} Kč
              </span>
              <span className="text-sm text-muted-foreground">jednorázově</span>
            </div>
            {showComparison && (
              <div className="text-sm text-muted-foreground animate-pulse">
                <span className="mr-1">{comparison.icon}</span>
                = {comparison.text}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

        return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative group cursor-pointer" onClick={onClick}>
        {/* Glowing background effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-green-600 via-emerald-500 to-blue-600 rounded-lg blur-md opacity-50 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
        {/* Badge with neutral styling */}
        <Badge
          variant="secondary"
          className="relative bg-white dark:bg-slate-800 text-foreground border border-border hover:bg-muted shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <Sparkles className="w-4 h-4 mr-1 text-green-600 dark:text-green-400" />
          {PRODUCT_PRICE} Kč
        </Badge>
      </div>
      {showComparison && (
        <div className="text-sm text-muted-foreground animate-pulse">
          <span className="mr-1">{comparison.icon}</span>
          = {comparison.text}
        </div>
      )}
    </div>
  );
}