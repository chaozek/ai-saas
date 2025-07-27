import { Button } from "@/components/ui/button";
import { Brain, Target, TrendingUp, Heart } from "lucide-react";
import Image from "next/image";

export function AITrainerFeaturesSection() {
  return (
    <section className="py-20 px-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/50 dark:to-blue-950/50">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl lg:text-4xl font-bold dark:text-white">
              Váš osobní AI fitness trenér
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed dark:text-slate-300">
              Objevte sílu umělé inteligence ve fitness světě. Náš AI trenér vytváří
              personalizované plány, sleduje váš pokrok a motivuje vás k dosažení vašich cílů.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Brain className="h-6 w-6 text-green-600 dark:text-green-400" />
                <span className="font-medium dark:text-white">AI analýza</span>
              </div>
              <div className="flex items-center space-x-3">
                <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <span className="font-medium dark:text-white">Osobní cíle</span>
              </div>
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                <span className="font-medium dark:text-white">Sledování pokroku</span>
              </div>
              <div className="flex items-center space-x-3">
                <Heart className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                <span className="font-medium dark:text-white">Motivace</span>
              </div>
            </div>

            <Button size="lg" className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 dark:from-green-500 dark:to-blue-500 dark:hover:from-green-600 dark:hover:to-blue-600">
              Začít s AI trenérem
            </Button>
          </div>

          <div className="flex justify-center">
            <div className="relative">
              <Image
                src="/trainer_thumbs-up-min.png"
                alt="AI Fitness Trainer"
                width={200}
                height={250}
              />
              <div className="absolute -top-4 -right-4 bg-white dark:bg-slate-800 rounded-full p-3 shadow-lg">
                <Brain className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}