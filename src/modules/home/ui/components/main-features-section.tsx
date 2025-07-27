"use client"

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FitnessAssessmentForm } from "./fitness-assessment-form";
import { Zap, CheckCircle, ArrowRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function MainFeaturesSection() {
  const [isFormHighlighted, setIsFormHighlighted] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const features = [
    "Analýza vašich cílů a zkušeností",
    "Přizpůsobení vašemu vybavení",
    "Úprava podle časových možností",
    "Sledování pokroku v reálném čase"
  ];

  const handleGetPlanClick = () => {
    // Scroll to form with smooth animation
    if (formRef.current) {
      formRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }

    // Trigger highlight animation
    setIsFormHighlighted(true);

    // Remove highlight after animation completes
    setTimeout(() => {
      setIsFormHighlighted(false);
    }, 3000);
  };

  // Listen for highlight events from other components
  useEffect(() => {
    const handleHighlightForm = () => {
      handleGetPlanClick();
    };

    window.addEventListener('highlight-fitness-form', handleHighlightForm);
    return () => {
      window.removeEventListener('highlight-fitness-form', handleHighlightForm);
    };
  }, []);

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <Badge variant="secondary" className="text-sm">
              <Zap className="mr-1 h-3 w-3" />
              AI-Powered
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold">
              Personalizovaný fitness plán na míru
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Náš pokročilý AI analyzuje vaše cíle, zkušenosti a preference, aby vytvořil
              perfektní tréninkový plán přesně pro vás. Žádné univerzální řešení - pouze
              plány, které skutečně fungují.
            </p>

            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <Button size="lg" className="mt-6" onClick={handleGetPlanClick}>
              Získat svůj plán
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

                    <div
            id="fitness-assessment-form"
            ref={formRef}
            className={`relative transition-all duration-700 ease-out ${
              isFormHighlighted
                ? 'scale-105'
                : 'scale-100'
            }`}
          >
                        <div className={`bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-8 transition-all duration-700 ${
              isFormHighlighted
                ? 'ring-4 ring-green-400/50 ring-offset-4 ring-offset-white dark:ring-offset-slate-900'
                : ''
            }`} style={{
              filter: isFormHighlighted
                ? 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.25))'
                : 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.1))'
            }}>
              {/* Animated border effect */}
              {isFormHighlighted && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-400/20 via-blue-400/20 to-green-400/20 animate-pulse"></div>
              )}

              {/* Floating particles during highlight */}
              {isFormHighlighted && (
                <>
                  <div className="absolute -top-2 -left-2 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-75"></div>
                  <div className="absolute -top-4 -right-4 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-75" style={{ animationDelay: '0.3s' }}></div>
                  <div className="absolute -bottom-2 -left-4 w-2 h-2 bg-emerald-400 rounded-full animate-ping opacity-75" style={{ animationDelay: '0.6s' }}></div>
                  <div className="absolute -bottom-4 -right-2 w-3 h-3 bg-cyan-400 rounded-full animate-ping opacity-75" style={{ animationDelay: '0.9s' }}></div>
                </>
              )}

              <div className="relative z-10">
                <FitnessAssessmentForm isHighlighted={isFormHighlighted} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}