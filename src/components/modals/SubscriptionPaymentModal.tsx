import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import StripePaymentForm from "../subscription/StripePaymentForm";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: any;
}

const SubscriptionPaymentModal: React.FC<SubscriptionPaymentModalProps> = ({
  isOpen,
  onClose,
  plan,
}) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    const fetchClientSecret = async () => {
      const response = await supabase.functions.invoke(
        "create-payment-intent",
        {
          body: {
            amount: Math.round(plan.monthly_price * 100),
            currency: "usd",
            metadata: {
              name: JSON.stringify(plan.name),
              monthly_price: JSON.stringify(plan.monthly_price),
              yearly_price: JSON.stringify(plan.yearly_price),
              lifetime_price: JSON.stringify(plan.lifetime_price),
              interval: JSON.stringify(plan.interval),
              stripe_price_id: JSON.stringify(plan.stripe_price_id_monthly),
            },
          },
        }
      );
      console.log(response, "response");
      if (response) {
        console.log(response, "response");
        console.log(response.data, "response.data");
        setClientSecret(response.data.client_secret);
      } else {
        console.error("Failed to fetch client secret:", response.error);
      }
    };
    fetchClientSecret();
  }, [plan]);

  if (!plan) return null;
  console.log(plan);
  console.log(clientSecret);

  const stripePromise = loadStripe(
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ""
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {plan.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            {plan.description}
          </div>
          {/* Only render Elements when clientSecret is available */}
          {clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <StripePaymentForm plan={plan} onSuccess={onClose} />
            </Elements>
          ) : (
            <div>Loading payment form...</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionPaymentModal;
