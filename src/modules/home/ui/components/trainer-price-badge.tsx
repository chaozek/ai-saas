"use client";

import Image from "next/image";
import { PriceBadge } from "@/components/ui/price-badge";

export function TrainerPriceBadge() {
  const handleGetPlanClick = () => {
    // Trigger highlight event for MainFeaturesSection
    window.dispatchEvent(new CustomEvent('highlight-fitness-form'));
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Trainer badge image */}
      <div className="relative">
        <Image
          src="/trainer_badge.png"
          alt="AI Trainer Badge"
          width={120}
          height={120}
          className="drop-shadow-lg"
        />

        {/* Price badge positioned in the center of trainer's hands */}
        <div className="absolute bottom-7 left-1/2 transform -translate-x-1/2 z-10">
                    <PriceBadge
            variant="compact"
            showComparison={false}
            className="shadow-xl"
            onClick={handleGetPlanClick}
          />
        </div>

        {/* Optional: Add a subtle glow effect around the trainer */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full blur-xl animate-pulse"></div>
      </div>
    </div>
  );
}