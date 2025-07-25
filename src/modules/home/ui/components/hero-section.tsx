import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { ScrollIndicator } from "@/components/ui/scroll-indicator";
import { ArrowRight, Play, CheckCircle } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-8">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Logo alt="logo" width={150} height={75} />
          </div>

          <h1 className="text-4xl lg:text-6xl leading-tight">
            Váš AI trenér <br />
            <span className="font-bold text-green-600">
              pro lepší zítřek
            </span>
          </h1>

          <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Investujte do svého zdraví s AI-powered fitness trenérem. Personalizované plány,
            sledování pokroku a odborné vedení v jedné aplikaci.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="text-lg px-8 py-6">
              Začněte zdarma
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              <Play className="mr-2 h-5 w-5" />
              Zobrazit demo
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 mt-12 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>5minutové hodnocení</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Bezplatný plán</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Odborné vedení</span>
            </div>
          </div>

          <ScrollIndicator />
        </div>
      </div>
    </section>
  );
}