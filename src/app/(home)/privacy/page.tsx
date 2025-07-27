import { Shield, Mail, MapPin, Building, Clock, Users, Database, Eye, Lock, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ochrana osobních údajů | FitnessAI",
  description: "Informace o ochraně osobních údajů v souladu s GDPR. Zjistěte, jak zpracováváme vaše data v aplikaci FitnessAI.",
  keywords: "ochrana osobních údajů, GDPR, soukromí, FitnessAI, osobní údaje",
};

export default function PrivacyPage() {
  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="text-center mb-12 pt-16">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl lg:text-5xl font-bold mb-4">
          Ochrana osobních údajů
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Vaše soukromí bereme vážně. Níže naleznete informace o tom, jak zpracováváme osobní údaje v souladu s GDPR.
        </p>
      </div>

      <div className="space-y-8 max-w-4xl mx-auto w-full">
        {/* Správce údajů */}
        <Card className="border-2 border-green-100 dark:border-green-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Building className="w-6 h-6 text-green-600" />
              Správce údajů
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <span className="font-semibold">FitnessAI</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <span>Praha, Česká republika</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <a href="mailto:privacy@fitnessai.cz" className="text-green-600 hover:underline">
                    privacy@fitnessai.cz
                  </a>
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Pro jakékoliv dotazy týkající se ochrany osobních údajů nás neváhejte kontaktovat.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Jaké údaje zpracováváme */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Database className="w-6 h-6 text-blue-600" />
              Jaké údaje zpracováváme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Základní údaje</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Jméno a e-mail (pokud vyplníte formulář)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Vaše zadané cíle, věk, pohlaví
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Výška a váha (pro výpočet plánu)
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Technické údaje</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Cookies a IP adresa
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Informace o používání webu
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Analytické údaje (Google Analytics)
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Účel zpracování */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Target className="w-6 h-6 text-purple-600" />
              Účel zpracování
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-purple-600 font-semibold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Generování personalizovaných plánů</h4>
                    <p className="text-muted-foreground text-sm">
                      Vytváření jídelníčků a tréninkových plánů na míru vašim cílům a potřebám.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-purple-600 font-semibold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Odpověď na dotazy</h4>
                    <p className="text-muted-foreground text-sm">
                      Poskytování odpovědí na vaše dotazy a poskytování podpory.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-purple-600 font-semibold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Vylepšování služeb</h4>
                    <p className="text-muted-foreground text-sm">
                      Analýza používání pro zlepšení našich služeb a webu.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-purple-600 font-semibold">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Statistické účely</h4>
                    <p className="text-muted-foreground text-sm">
                      Sběr anonymizovaných dat pro statistické a analytické účely.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Právní základ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Lock className="w-6 h-6 text-orange-600" />
              Právní základ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg">
                  <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">
                    Plnění smlouvy
                  </h4>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    Poskytnutí personalizovaného plánu na základě vašich požadavků.
                  </p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg">
                  <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">
                    Souhlas uživatele
                  </h4>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    Pro marketingové účely a cookies (můžete kdykoliv odvolat).
                  </p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg">
                  <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">
                    Oprávněný zájem
                  </h4>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    Analýza návštěvnosti a zlepšování služeb.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Doba uchování */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Clock className="w-6 h-6 text-red-600" />
              Doba uchování
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 dark:bg-red-950 p-6 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">
                    Maximálně 2 roky
                  </h4>
                  <p className="text-muted-foreground">
                    Osobní údaje uchováváme po dobu maximálně 2 let nebo do odvolání souhlasu.
                    Po této době jsou údaje automaticky smazány nebo anonymizovány.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Předávání třetím stranám */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Users className="w-6 h-6 text-indigo-600" />
              Předávání třetím stranám
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Data můžeme předat poskytovatelům služeb (např. webhosting, analytika) – vždy v souladu s GDPR.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Poskytovatelé služeb:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Webhosting a infrastruktura</li>
                    <li>• Analytické nástroje (Google Analytics)</li>
                    <li>• Platební procesory (pokud používáte placené služby)</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Záruky:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Všechny smlouvy obsahují GDPR klauzule</li>
                    <li>• Data zůstávají v EU/EEA</li>
                    <li>• Minimální nutné množství dat</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vaše práva */}
        <Card className="border-2 border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Shield className="w-6 h-6 text-green-600" />
              Vaše práva
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <p className="text-lg font-medium">
                Máte právo na přístup, opravu, výmaz, omezení zpracování, námitku a přenositelnost údajů.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Základní práva:</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Právo na přístup k údajům
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Právo na opravu nepřesných údajů
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Právo na výmaz údajů
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Právo na omezení zpracování
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Další práva:</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Právo na námitku proti zpracování
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Právo na přenositelnost údajů
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Právo na odvolání souhlasu
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Právo podat stížnost
                    </li>
                  </ul>
                </div>
              </div>

              <Separator />

              <div className="bg-green-50 dark:bg-green-950 p-6 rounded-lg">
                <h4 className="font-semibold text-lg mb-3">Kontakt a stížnosti:</h4>
                <div className="space-y-2 text-muted-foreground">
                  <p>
                    V případě pochybností se můžete obrátit na nás nebo na Úřad pro ochranu osobních údajů.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 mt-4">
                    <a
                      href="mailto:privacy@fitnessai.cz"
                      className="inline-flex items-center gap-2 text-green-600 hover:underline font-medium"
                    >
                      <Mail className="w-4 h-4" />
                      privacy@fitnessai.cz
                    </a>
                    <a
                      href="https://www.uoou.cz"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-green-600 hover:underline font-medium"
                    >
                      <Shield className="w-4 h-4" />
                      www.uoou.cz
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Poslední aktualizace: {new Date().toLocaleDateString('cs-CZ')}
          </p>
        </div>
      </div>
    </div>
  );
}