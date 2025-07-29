"use client"

import { useState, useEffect, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CreditCard, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useTRPC } from '@/trcp/client';
import { useMutation } from '@tanstack/react-query';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripePaymentFormProps {
  amount: number;
  currency: string;
  planName: string;
  onSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
  assessmentData?: any;
  clientSecret?: string | null;
}

const PaymentForm = ({ amount, currency, planName, onSuccess, onCancel, assessmentData, clientSecret }: StripePaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const trpc = useTRPC();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (error) {
        toast.error(error.message || 'Platba selhala. Zkuste to prosím znovu.');
      } else if (paymentIntent.status === 'succeeded') {
        toast.success('Platba byla úspěšně zpracována!');
        onSuccess(paymentIntent.id);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Něco se pokazilo při zpracování platby. Zkuste to prosím znovu.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Připravujeme platbu...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Platební údaje
          </CardTitle>
          <CardDescription>
            Zadejte údaje vaší platební karty pro bezpečnou platbu
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg bg-gray-50">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <div>
              <p className="font-medium text-green-800">{planName}</p>
              <p className="text-sm text-green-600">Jednorázová platba</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-green-800">{amount} {currency}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1"
        >
          Zrušit
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Zpracování...
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              Zaplatit {amount} {currency}
            </>
          )}
        </Button>
      </div>

      <div className="text-center text-xs text-gray-500 space-y-1">
        <p>Vaše platba je chráněna SSL šifrováním</p>
        <p>Žádné skryté poplatky, žádné předplatné</p>
      </div>
    </form>
  );
};

export const StripePaymentForm = (props: StripePaymentFormProps) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
};