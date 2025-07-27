"use client";

import { Button } from "@/components/ui/button";
import { PriceBadge } from "@/components/ui/price-badge";
import { ArrowRight } from "lucide-react";

export function FinalCTASection() {
  const handleGetPlanClick = () => {
    // Trigger highlight event for MainFeaturesSection
    window.dispatchEvent(new CustomEvent('highlight-fitness-form'));
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-r from-green-600 to-blue-600 text-white">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h2 className="text-3xl lg:text-4xl font-bold">
          Připraveni transformovat vaši fitness cestu?
        </h2>
                <p className="text-xl opacity-90 max-w-2xl mx-auto">
          <strong>Buďte transparentní ve svém rozhodování</strong> - prohlédněte si demo a připojte se k tisícům uživatelů,
          kteří již dosáhli svých fitness cílů s naším AI-powered koučovacím systémem.
        </p>
        <div className="flex flex-col items-center gap-4">
          <PriceBadge variant="default" onClick={handleGetPlanClick} />
          <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
            Zobrazit demo účtu
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}