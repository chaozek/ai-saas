import { Card, CardContent } from "@/components/ui/card";
import { Users, Zap, Shield, TrendingUp } from "lucide-react";

export function AwardsSection() {
  const features = [
    {
      icon: Users,
      title: "1000+ uživatelů",
      description: "Důvěřují nám"
    },
    {
      icon: Zap,
      title: "AI technologie",
      description: "Nejmodernější"
    },
    {
      icon: Shield,
      title: "Bezpečnost",
      description: "Vaše data v bezpečí"
    },
    {
      icon: TrendingUp,
      title: "Rychlý růst",
      description: "Každý den noví"
    }
  ];

  return (
    <section className="py-16 px-4 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900/50 dark:to-blue-900/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-8">
          <h2 className="text-2xl lg:text-3xl font-bold">
            Proč si nás <span className="text-green-600">vybírají</span>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <feature.icon className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold text-sm">{feature.title}</p>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}