import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FitnessAssessmentForm } from "./fitness-assessment-form";
import { Zap, CheckCircle, ArrowRight } from "lucide-react";

export function MainFeaturesSection() {
  const features = [
    "Analýza vašich cílů a zkušeností",
    "Přizpůsobení vašemu vybavení",
    "Úprava podle časových možností",
    "Sledování pokroku v reálném čase"
  ];

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

            <Button size="lg" className="mt-6">
              Získat svůj plán
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-8">
              <FitnessAssessmentForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}