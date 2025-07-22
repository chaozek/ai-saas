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
    description: "Perfect for beginners starting their fitness journey",
    price: "Free",
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
    cta: "Get Started Free"
  },
  {
    name: "Pro",
    description: "For serious fitness enthusiasts who want personalized coaching",
    price: "$19",
    period: "per month",
    features: [
      "Everything in Starter",
      "8-week personalized plans",
      "Advanced progress analytics",
      "Nutrition guidance",
      "Workout modifications",
      "Priority support",
      "Mobile app access"
    ],
    icon: <Zap className="w-6 h-6" />,
    popular: true,
    cta: "Start Free Trial"
  },
  {
    name: "Elite",
    description: "Ultimate fitness coaching with premium features",
    price: "$39",
    period: "per month",
    features: [
      "Everything in Pro",
      "12-week advanced programs",
      "1-on-1 coaching sessions",
      "Custom meal plans",
      "Recovery tracking",
      "Video form analysis",
      "24/7 priority support",
      "Exclusive content library"
    ],
    icon: <Crown className="w-6 h-6" />,
    popular: false,
    cta: "Start Free Trial"
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
              Choose Your Fitness Journey
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start with our free assessment and choose the plan that fits your goals.
            No credit card required for free plans.
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
                  Most Popular
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
                    <p className="text-sm text-gray-500 mt-1">No credit card required</p>
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
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I cancel anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes! You can cancel your subscription at any time. Your access will continue until the end of your billing period.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What if I'm not satisfied?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We offer a 30-day money-back guarantee. If you're not happy with your results, we'll refund your subscription.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do I need equipment?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  No! We create plans that work with whatever equipment you have, from no equipment to a full gym setup.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How personalized are the plans?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Very! Our AI considers your goals, experience, schedule, equipment, injuries, and preferences to create truly personalized plans.
                </p>
              </CardContent>
            </Card>
          </div>
               </div>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardContent className="py-8">
              <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Fitness?</h3>
              <p className="text-gray-600 mb-6">
                Join thousands of users who have already achieved their fitness goals with our AI-powered coaching.
               </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={() => openSignUp()}>
                  Start Free Assessment
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/">Learn More</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
     </div>
  );
}
