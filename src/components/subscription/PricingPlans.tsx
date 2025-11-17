import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useCreateSubscription } from '@/hooks/useCreateSubscription';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { Check, X, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PricingPlanProps {
  title: string;
  description: string;
  features: { included: boolean; text: string }[];
  popular?: boolean;
  current?: boolean;
  plan: any;
}

const PricingPlan = ({
  title,
  description,
  features,
  popular = false,
  current = false,
  plan,
}: PricingPlanProps) => {
  const { subscription } = useSubscription();
  const { createCheckout, isLoading: isCheckoutLoading } =
    useCreateSubscription();

  const handlePlanSelect = async (interval: string) => {
    try {
      const priceId =
        interval === 'monthly'
          ? plan.stripe_price_id_monthly
          : interval === 'yearly'
          ? plan.stripe_price_id_annual
          : plan.stripe_price_id_lifetime;

      await createCheckout(plan, priceId);
    } catch (err) {
      console.error(err);
      alert('An error occurred. Please try again.');
    }
  };

  // Identify current plan and interval
  const isLegacyKeeper =
    title?.trim().toLowerCase() === 'legacy keeper' &&
    (!subscription?.tier || subscription?.tier === null);

  const isCurrentPlan = subscription?.plan_id === plan.plan_id || current;

  // ✅ Safe fallback for missing type
  const currentInterval = (subscription as any)?.interval || null;

  // Helper: Disable only the exact current plan + interval
  const isButtonDisabled = (interval: string) => {
    if (isLegacyKeeper && interval === 'monthly') return true;
    return (
      (isCurrentPlan &&
        subscription?.plan_id === plan.plan_id &&
        currentInterval === interval) ||
      isCheckoutLoading
    );
  };

  return (
    <Card
      className={`relative flex flex-col justify-between h-full w-full transition-all duration-200 
        ${popular ? 'border-primary shadow-lg' : 'border-border/50'} 
        ${
          isCurrentPlan || isLegacyKeeper ? 'bg-primary/5 border-green-500' : ''
        }
      `}
    >
      {/* Badges */}
      {popular && (
        <div className="absolute top-0 right-0 rounded-bl rounded-tr px-3 py-1 text-xs font-medium bg-primary text-primary-foreground">
          Popular
        </div>
      )}

      {(isCurrentPlan || isLegacyKeeper) && (
        <div
          className={`absolute top-0 left-0 rounded-br rounded-tl px-3 py-1 text-xs font-medium ${
            isLegacyKeeper
              ? 'bg-gray-500 text-white'
              : 'bg-green-500 text-white'
          }`}
        >
          {isLegacyKeeper ? 'Default Plan' : 'Current Plan'}
        </div>
      )}

      {/* Header */}
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>

        {/* Pricing */}
        <div className="flex flex-col items-start mt-3 space-y-2">
          {plan.monthly_price && (
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">${plan.monthly_price}</span>
              <span className="text-muted-foreground ml-1">/month</span>
            </div>
          )}

          {plan.annual_price && (
            <>
              <div className="flex items-center text-xs text-muted-foreground">
                <div className="flex-grow border-t border-border" />
                <span className="mx-2">OR</span>
                <div className="flex-grow border-t border-border" />
              </div>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">${plan.annual_price}</span>
                <span className="text-muted-foreground ml-1">/year</span>
              </div>
            </>
          )}

          {plan.lifetime_price && (
            <>
              <div className="flex items-center text-xs text-muted-foreground">
                <div className="flex-grow border-t border-border" />
                <span className="mx-2">OR</span>
                <div className="flex-grow border-t border-border" />
              </div>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">
                  ${plan.lifetime_price}
                </span>
                <span className="text-muted-foreground ml-1">/lifetime</span>
              </div>
            </>
          )}
        </div>

        <CardDescription className="mt-2 text-sm text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>

      {/* Features */}
      <CardContent className="flex-1">
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center text-sm">
              {feature.included ? (
                <Check className="h-4 w-4 mr-2 text-green-500" />
              ) : (
                <X className="h-4 w-4 mr-2 text-red-500" />
              )}
              <span>{feature.text}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      {/* Footer */}
      <CardFooter className="mt-auto flex flex-col sm:flex-row gap-3 w-full p-4 pt-0">
        {plan.monthly_price && (
          <Button
            className="flex-1 py-4 text-[15px]"
            variant={isButtonDisabled('monthly') ? 'outline' : 'default'}
            disabled={isButtonDisabled('monthly')}
            onClick={() => handlePlanSelect('monthly')}
          >
            {isCheckoutLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isButtonDisabled('monthly') ? (
              'Current Plan'
            ) : (
              'Select Monthly Plan'
            )}
          </Button>
        )}

        {plan.annual_price && (
          <Button
            className="flex-1 py-4 text-[15px]"
            variant={isButtonDisabled('yearly') ? 'outline' : 'default'}
            disabled={isButtonDisabled('yearly')}
            onClick={() => handlePlanSelect('yearly')}
          >
            {isCheckoutLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isButtonDisabled('yearly') ? (
              'Current Plan'
            ) : (
              'Select Yearly Plan'
            )}
          </Button>
        )}

        {plan.lifetime_price && (
          <Button
            className="flex-1 py-4 text-[15px]"
            variant={isButtonDisabled('lifetime') ? 'outline' : 'default'}
            disabled={isButtonDisabled('lifetime')}
            onClick={() => handlePlanSelect('lifetime')}
          >
            {isCheckoutLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isButtonDisabled('lifetime') ? (
              'Current Plan'
            ) : (
              'Select Lifetime Plan'
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

const PricingPlans = () => {
  const { subscription } = useSubscription();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleManageSubscription = () => {
    console.log('Managing subscription');
    // TODO: Implement Stripe customer portal
  };

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase.rpc(
          'get_public_plan_configurations'
        );
        if (error) throw error;
        setPlans(data || []);
      } catch (err) {
        console.error('Error fetching plans:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  return (
    <div className="container mx-auto py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Subscription Plans</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose the plan that works best for you and your legacy journey.
        </p>
        {subscription?.tier && (
          <Button
            variant="outline"
            className="mt-4"
            onClick={handleManageSubscription}
          >
            Manage Current Subscription
          </Button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {loading ? (
          <div className="col-span-3 flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          plans.map((plan) => {
            const hasActiveSub = Boolean(subscription?.tier);
            const isLegacyKeeper =
              plan.name?.trim().toLowerCase() === 'legacy keeper';
            const isCurrent =
              (hasActiveSub && subscription?.tier === plan.name) ||
              (!hasActiveSub && isLegacyKeeper);

            return (
              <PricingPlan
                key={plan.id}
                title={plan.name}
                description={plan.description}
                features={plan.features}
                current={isCurrent}
                popular={plan.is_popular}
                plan={plan}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default PricingPlans;
