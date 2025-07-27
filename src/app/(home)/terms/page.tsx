import { FileText, Shield, AlertTriangle, Users, Copyright, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Podmínky použití | FitnessAI",
  description: "Podmínky použití služby FitnessAI. Přečtěte si pravidla a podmínky pro používání našeho webu.",
  keywords: "podmínky použití, pravidla, FitnessAI, služby, autorská práva",
};

export default function TermsPage() {
  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="text-center mb-12 pt-16">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl lg:text-5xl font-bold mb-4">
          Podmínky použití
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Používáním tohoto webu souhlasíte s níže uvedenými podmínkami. Pokud s nimi nesouhlasíte, web nepoužívejte.
        </p>
      </div>

      <div className="space-y-8 max-w-4xl mx-auto w-full">
        {/* 1. Služba */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">1</span>
              </div>
              Služba
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              Tento web nabízí automatizované generování jídelníčků a tréninkových plánů na základě uživatelem zadaných údajů.
              Výsledky mají informativní charakter a nenahrazují odborné poradenství (např. lékaře nebo výživového specialistu).
            </p>
          </CardContent>
        </Card>

        {/* 2. Odpovědnost */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                <span className="text-orange-600 font-semibold">2</span>
              </div>
              Odpovědnost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Používání služeb je na vlastní riziko. Neodpovídáme za případné škody vzniklé na základě použití vygenerovaných plánů.
                Před zahájením cvičení nebo diety se poraďte s odborníkem.
              </p>
              <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-1">
                      Důležité upozornění
                    </h4>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      Vygenerované plány jsou pouze informativní a nenahrazují odborné poradenství.
                      Před zahájením jakéhokoliv cvičebního nebo výživového programu se vždy poraďte s lékařem.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Uživatelská data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold">3</span>
              </div>
              Uživatelská data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Zadané údaje slouží výhradně pro výpočet plánů. Více viz Ochrana osobních údajů.
              </p>
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-green-800 dark:text-green-200 mb-1">
                      Ochrana soukromí
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Vaše data jsou chráněna v souladu s GDPR. Podrobné informace najdete na stránce
                      <a href="/privacy" className="text-green-600 hover:underline font-medium ml-1">
                        Ochrana osobních údajů
                      </a>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. Duševní vlastnictví */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-semibold">4</span>
              </div>
              Duševní vlastnictví
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Veškerý obsah webu (včetně vygenerovaných plánů, textů a designu) je chráněn autorským právem.
                Bez písemného souhlasu jej nelze dále šířit ani komerčně využívat.
              </p>
              <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-start gap-3">
                  <Copyright className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-1">
                      Autorská práva
                    </h4>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      Všechny vygenerované plány, texty a design jsou chráněny autorským právem.
                      Pro komerční využití je nutný písemný souhlas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 5. Změny podmínek */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-semibold">5</span>
              </div>
              Změny podmínek
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Vyhrazujeme si právo tyto podmínky kdykoli upravit. Aktuální verze je vždy dostupná na této stránce.
              </p>
              <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-3">
                  <Edit className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-red-800 dark:text-red-200 mb-1">
                      Aktualizace podmínek
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Pravidelně kontrolujte tuto stránku pro případné změny podmínek použití.
                      Pokračováním v používání služby souhlasíte s aktuálními podmínkami.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kontakt a dotazy */}
        <Card className="border-2 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Users className="w-6 h-6 text-blue-600" />
              Kontakt a dotazy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Máte-li jakékoliv dotazy týkající se těchto podmínek použití, neváhejte nás kontaktovat.
              </p>
              <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                  <a
                    href="mailto:terms@fitnessai.cz"
                    className="inline-flex items-center gap-2 text-blue-600 hover:underline font-medium"
                  >
                    <FileText className="w-4 h-4" />
                    terms@fitnessai.cz
                  </a>
                  <span className="text-muted-foreground">|</span>
                  <a
                    href="/privacy"
                    className="inline-flex items-center gap-2 text-blue-600 hover:underline font-medium"
                  >
                    <Shield className="w-4 h-4" />
                    Ochrana osobních údajů
                  </a>
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