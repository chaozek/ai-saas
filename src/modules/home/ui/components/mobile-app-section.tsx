import { Button } from "@/components/ui/button";
import { Download, Smartphone } from "lucide-react";

export function MobileAppSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Stáhněte si naši aplikaci
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Mějte svůj AI fitness trenér vždy po ruce. Sledujte pokrok, upravujte plány
              a získejte motivaci kdykoliv a kdekoliv.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" size="lg" className="justify-start">
                <Download className="mr-2 h-5 w-5" />
                App Store
              </Button>
              <Button variant="outline" size="lg" className="justify-start">
                <Download className="mr-2 h-5 w-5" />
                Google Play
              </Button>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="relative">
              <Smartphone className="h-64 w-32 text-slate-300" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-40 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}