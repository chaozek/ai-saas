"use client"

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Loader2, CreditCard, Shield } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { toast } from "sonner";
import { StripePaymentForm } from "./stripe-payment-form";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  assessmentData?: any;
  clientSecret?: string | null;
}

// Single fitness plan configuration
const FITNESS_PLAN = {
  name: "Fitness Plán",
  description: "Osobně přizpůsobený fitness plán s jídelníčkem",
  price: 199, // Změňte cenu zde
  currency: "CZK",
  features: [
    "Osobně přizpůsobený 8-týdenní tréninkový plán",
    "Detailní jídelníček s recepty",
    "AI-powered doporučení a úpravy",
    "Sledování pokroku a statistiky",
    "Přístup k mobilní aplikaci",
    "Emailová podpora",
    "30denní záruka vrácení peněz"
  ],
  icon: <Zap className="w-6 h-6" />,
};

export const PaymentModal = ({ isOpen, onClose, onSuccess, assessmentData, clientSecret }: PaymentModalProps) => {
  const { user } = useClerk();
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const handlePaymentSuccess = (paymentIntentId: string) => {
    toast.success("Platba byla úspěšně zpracována!");
    onClose();
    onSuccess();
  };

  const handleStartPayment = () => {
    if (!user) {
      toast.error("Prosím, přihlaste se pro pokračování");
      return;
    }
    setShowPaymentForm(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Vyberte si svůj fitness plán
          </DialogTitle>
          <DialogDescription className="text-center">
            Jednorázová platba - žádné předplatné, žádné skryté poplatky
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!showPaymentForm ? (
            <>
              {/* Security and Trust Badges */}
              <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>Bezpečná platba</span>
                </div>
                <div className="flex items-center gap-1">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>SSL šifrování</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>30denní záruka</span>
                </div>
              </div>

              {/* Single Pricing Card */}
              <Card className="relative transition-all duration-300 max-w-md mx-auto">
                <CardHeader className="text-center pb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="p-2 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg">
                      {FITNESS_PLAN.icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl">{FITNESS_PLAN.name}</CardTitle>
                  <CardDescription className="text-sm">{FITNESS_PLAN.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-3xl font-bold">{FITNESS_PLAN.price}</span>
                      <span className="text-gray-500">{FITNESS_PLAN.currency}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Jednorázová platba</p>
                  </div>

                  <ul className="space-y-2">
                    {FITNESS_PLAN.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Zrušit
                </Button>
                <Button
                  onClick={handleStartPayment}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pokračovat k platbě
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="text-center text-xs text-gray-500 space-y-1">
                <p>Vaše platba je chráněna SSL šifrováním</p>
                <p>Můžete kdykoli zrušit a získat 30denní záruku vrácení peněz</p>
                <p>Žádné skryté poplatky, žádné předplatné</p>
              </div>
            </>
          ) : (
            <StripePaymentForm
              amount={FITNESS_PLAN.price}
              currency={FITNESS_PLAN.currency}
              planName={FITNESS_PLAN.name}
              onSuccess={handlePaymentSuccess}
              onCancel={() => setShowPaymentForm(false)}
              assessmentData={assessmentData}
              clientSecret={clientSecret}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};