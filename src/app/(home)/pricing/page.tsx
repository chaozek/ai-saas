"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Crown, Zap, Target } from "lucide-react"
import { useClerk } from "@clerk/nextjs"
import Link from "next/link"

const pricingPlans = [
  {
    name: "Starter",
    description: "Ideální pro začátečníky na začátku své fitness cesty",
    price: "Zdarma",
    period: "forever",
    features: [
      "AI-powered fitness assessment",
      "Basic workout plan (4 weeks)",
      "Progress tracking",
      "Exercise library",
      "Email support"
    ],
    icon: <Target className="w-6 h-6" />,
    popular: false,
    cta: "Začít zdarma"
  },
  {
    name: "Pro",
    description: "Pro seriózní fitness entuziasty, kteří chtějí osobní koučování",
    price: "$19",
    period: "za měsíc",
    features: [
      "Vše v Starter",
      "8-týdenní osobně přizpůsobené plány",
      "Pokročilé analýzy progresu",
      "Nutriční doporučení",
      "Pracovní plány s modifikacemi",
      "Prioritní podpora",
      "Přístup k mobilní aplikaci"
    ],
    icon: <Zap className="w-6 h-6" />,
    popular: true,
    cta: "Vyzkoušet zdarma"
  },
  {
    name: "Elite",
    description: "Ultimate fitness coaching s premium funkcemi",
    price: "$39",
    period: "za měsíc",
    features: [
      "Vše v Pro",
      "12-týdenní pokročilé programy",
      "1-na-1 konzultace",
      "Vlastní plány na jídlo",
      "Sledování obnovy",
      "Videový analytický formulář",
      "24/7 prioritní podpora",
      "Výhradní knihovna obsahu"
    ],
    icon: <Crown className="w-6 h-6" />,
    popular: false,
    cta: "Vyzkoušet zdarma"
  }
];

export default function PricingPage() {
  const { openSignUp } = useClerk();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl">💪</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Vyberte si svou fitness cestu
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Začněte s naším bezplatným vyšetřením a vyberte si tarif, který odpovídá vašim cílům.
            Žádná kreditní karta není potřeba pro bezplatné plány.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {pricingPlans.map((plan, index) => (
            <Card
              key={index}
              className={`relative transition-all duration-300 hover:shadow-xl ${
                plan.popular
                  ? 'ring-2 ring-green-500 scale-105'
                  : 'hover:scale-105'
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white">
                  Nejoblíbenější
                </Badge>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="p-2 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg">
                    {plan.icon}
                  </div>
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-base">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period !== "forever" && (
                      <span className="text-gray-500">/{plan.period}</span>
                    )}
                  </div>
                  {plan.period === "forever" && (
                    <p className="text-sm text-gray-500 mt-1">Žádná kreditní karta není potřeba</p>
                  )}
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${
                    plan.popular
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                  onClick={() => openSignUp()}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Nejčastější dotazy</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Můžu se zrušit kdykoli?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Ano! Můžete zrušit své předplatné v jakýkoliv čas. Vaše přístupové právo pokračuje do konce vašeho fakturačního období.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Co když nejsem spokojen?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Nabízíme 30denní záruku vrácení peněz. Pokud nejste spokojeni s výsledky, vrátíme vám své předplatné.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Potřebuji vybavení?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Ne! Vytvoříme plány, které fungují s jakýmkoli vybavením, od žádného vybavení až po úplnou tělocvičnu.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Jak jsou plány osobně přizpůsobeny?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Velmi! Naše AI zvažuje vaše cíle, zkušenosti, rozvrh, vybavení, zranění a preference k vytvoření skutečně osobně přizpůsobených plánů.
                </p>
              </CardContent>
            </Card>
          </div>
               </div>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardContent className="py-8">
              <h3 className="text-2xl font-bold mb-4">Jste připraveni transformovat své fitness?</h3>
              <p className="text-gray-600 mb-6">
                Připojte se tisíce uživatelů, kteří již dosáhli svých fitness cílů pomocí naší AI-powered koučování.
               </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={() => openSignUp()}>
                  Začít zdarma
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/">Zjistit více</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
     </div>
  );
}
