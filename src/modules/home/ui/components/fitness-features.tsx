import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Target,
  TrendingUp,
  Calendar,
  Shield,
  Users,
  Zap,
  BarChart3
} from "lucide-react";

const features = [
  {
    icon: <Brain className="w-6 h-6" />,
    title: "AI-Powered Personalizace",
    description: "Náš pokročilý AI analyzuje vaše cíle, zkušenosti a preference, aby vytvořil perfektní tréninkový plán přesně pro vás.",
    badge: "Chytré"
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: "Cíle Orientované Plány",
    description: "Ať už chcete zhubnout, nabrat svaly nebo zlepšit vytrvalost, vytváříme plány, které odpovídají vašim konkrétním cílům.",
    badge: "Zaměřené"
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Sledování Pokroku",
    description: "Sledujte svou fitness cestu s detailními záznamy pokroku, měřeními a analytikou výkonu.",
    badge: "Analytika"
  },
  {
    icon: <Calendar className="w-6 h-6" />,
    title: "Flexibilní Plánování",
    description: "Tréninky, které se přizpůsobují vašemu životnímu stylu. Vyberte si dostupné dny a preferovanou délku.",
    badge: "Adaptivní"
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Bezpečnost Na Prvním Místě",
    description: "Bereme v úvahu vaše zranění, zdravotní stav a úroveň zkušeností, abychom zajistili bezpečné a efektivní tréninky.",
    badge: "Bezpečné"
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Odborné Vedení",
    description: "Přístup k profesionálním fitness znalostem a technikám, personalizovaným pro vaši úroveň a vybavení.",
    badge: "Odborné"
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Rychlé Hodnocení",
    description: "Získejte svůj personalizovaný plán během minut s naším zjednodušeným 5krokovým procesem hodnocení.",
    badge: "Rychlé"
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Komplexní Dashboard",
    description: "Zobrazte svůj tréninkový plán, sledujte pokrok a spravujte svou fitness cestu vše na jednom místě.",
    badge: "Kompletní"
  }
];

export function FitnessFeatures() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Proč si vybrat našeho AI fitness trenéra?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Zažijte budoucnost fitness s personalizovaným AI koučováním, které se přizpůsobuje vašim potřebám a pomáhá vám dosáhnout vašich cílů rychleji.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg group-hover:from-green-200 group-hover:to-blue-200 dark:group-hover:from-green-800/30 dark:group-hover:to-blue-800/30 transition-colors">
                      {feature.icon}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {feature.badge}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/50 dark:to-blue-950/50 rounded-2xl p-8 text-center space-y-4">
            <h3 className="text-2xl font-bold text-green-800 dark:text-green-200">
              Připraveni transformovat vaši fitness cestu?
            </h3>
            <p className="text-green-700 dark:text-green-300 max-w-2xl mx-auto">
              Připojte se k tisícům uživatelů, kteří již dosáhli svých fitness cílů s naším AI-powered koučovacím systémem.
              Začněte svou personalizovanou fitness cestu ještě dnes!
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-green-600 dark:text-green-400">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>5minutové hodnocení</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Okamžité vytvoření plánu</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Začít zdarma</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}