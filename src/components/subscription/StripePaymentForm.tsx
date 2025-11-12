import {
  CardElement,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import React, { useMemo, useState } from "react";
import { supabase } from "../../integrations/supabase/client";

interface StripePaymentFormProps {
  plan: any;
  onSuccess: () => void;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  plan,
  onSuccess,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardholderName, setCardholderName] = useState(""); // NEW

  // Detect dark mode (Tailwind's 'dark' class on <html>)
  const isDark = useMemo(
    () =>
      typeof window !== "undefined" &&
      document.documentElement.classList.contains("dark"),
    []
  );

  const cardElementOptions = useMemo(
    () => ({
      style: {
        base: {
          fontSize: "16px",
          color: isDark ? "#F3F4F6" : "#1F2937", // Tailwind zinc-100 or gray-800
          backgroundColor: isDark ? "#18181B" : "#fff", // Tailwind zinc-900 or white
          "::placeholder": {
            color: isDark ? "#A1A1AA" : "#6B7280", // Tailwind zinc-400 or gray-400
          },
          iconColor: isDark ? "#FBBF24" : "#6366F1", // accent color
        },
        invalid: {
          color: "#EF4444", // Tailwind red-500
        },
      },
    }),
    [isDark]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!stripe || !elements) {
      setError("Stripe has not loaded yet.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: {
        plan: plan,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const result = await stripe.confirmCardPayment(data.url, {
      payment_method: {
        card: elements.getElement(CardElement)!,
      },
    });

    if (result.error) {
      setError(result.error.message || "Payment failed");
    } else if (result.paymentIntent?.status === "succeeded") {
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div
        className={`rounded-md border px-3 py-2 ${
          isDark ? "bg-zinc-900 border-zinc-700" : "bg-white border-zinc-300"
        }`}
      >
        {/* <label className="text-sm font-medium">Card Details</label>
        <CardElement options={cardElementOptions} /> */}

        <PaymentElement />
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={loading || !stripe}
        onClick={handleSubmit}
      >
        {loading
          ? "Processing..."
          : `Subscribe to ${
              plan.interval === "monthly"
                ? `$${plan.monthly_price}`
                : plan.interval === "yearly"
                ? `$${plan.annual_price}`
                : `$${plan.lifetime_price}`
            }`}
      </button>
    </form>
  );
};

export default StripePaymentForm;
