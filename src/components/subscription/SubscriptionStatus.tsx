import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useCreateSubscription } from '@/hooks/useCreateSubscription';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { Check, Loader2, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface SubscriptionStatusProps {
  showPlans?: boolean;
}

const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({
  showPlans = false,
}) => {
  const { user } = useAuth();
  const { subscription, isLoading, error } = useSubscription();
  const [plans, setPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const { createCheckout } = useCreateSubscription();

  const handlePlanSelect = async (plan: any, interval: string) => {
    // Determine the correct Stripe price ID based on interval
    let priceId;
    if (interval === 'monthly') priceId = plan.stripe_price_id_monthly;
    else if (interval === 'yearly') priceId = plan.stripe_price_id_annual;
    else if (interval === 'lifetime') priceId = plan.stripe_price_id_lifetime;

    try {
      // Call your edge function to create a checkout session
      await createCheckout(plan, priceId);
    } catch (err) {
      alert('An error occurred. Please try again.');
      console.error(err);
    }
  };

  // Fetch available plans if showPlans is true
  useEffect(() => {
    if (showPlans) {
      const fetchPlans = async () => {
        setLoadingPlans(true);
        try {
          const { data, error } = await supabase.rpc(
            'get_public_plan_configurations'
          );

          if (error) throw error;

          setPlans(data || []);
        } catch (error) {
          console.error('Error fetching plans:', error);
        } finally {
          setLoadingPlans(false);
        }
      };

      fetchPlans();
    }
  }, [showPlans]);

  if (isLoading) {
    return (
      <div className="bg-muted/20 rounded-md p-6 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
          <p className="text-sm text-muted-foreground">
            Loading your subscription information...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 rounded-md p-6">
        <p className="text-destructive font-medium">
          Error loading subscription
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Please try again later
        </p>
      </div>
    );
  }

  // Current subscription display
  const subscriptionDisplay = (
    <div className="bg-muted/20 rounded-md p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg">
              {subscription?.tier || 'Free Plan'}
            </h3>
            {subscription?.active && (
              <Badge
                variant="outline"
                className="bg-green-500/10 text-green-600 border-green-500/20"
              >
                Active
              </Badge>
            )}
            {!subscription?.active && subscription?.tier && (
              <Badge
                variant="outline"
                className="bg-amber-500/10 text-amber-600 border-amber-500/20"
              >
                Expired
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {subscription?.tier
              ? `Your subscription ${
                  subscription.active ? 'is active' : 'has expired'
                }`
              : 'You are currently on the free plan'}
          </p>
          {subscription?.endDate && (
            <p className="text-xs text-muted-foreground mt-1">
              {subscription.active
                ? `Renews on ${new Date(
                    subscription.endDate
                  ).toLocaleDateString()}`
                : `Expired on ${new Date(
                    subscription.endDate
                  ).toLocaleDateString()}`}
            </p>
          )}
        </div>
        {showPlans && (
          <Button variant="outline" onClick={() => navigate('/pricing')}>
            {subscription?.tier ? 'Change Plan' : 'Upgrade'}
          </Button>
        )}
      </div>
    </div>
  );

  // Show only current subscription if not showing plans
  if (!showPlans) {
    return subscriptionDisplay;
  }

  // Show current subscription and available plans
  return (
    <div className="space-y-6">
      {subscriptionDisplay}

      <h3 className="text-xl font-semibold mt-6">Available Plans</h3>

      {loadingPlans ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="yearly">
          <div className="flex justify-center">
            <TabsList className="relative">
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly (Save 17%)</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="monthly">
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className="flex flex-col hover:border-primary"
                >
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="flex flex-col justify-between gap-2 mt-2">
                      {plan.monthly_price ||
                      plan.annual_price ||
                      plan.lifetime_price ? (
                        <div>
                          <span className="text-3xl font-bold">
                            ${plan.monthly_price}
                          </span>
                          <span className="text-muted-foreground">/month</span>
                        </div>
                      ) : (
                        <span className="text-3xl font-bold">Free</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1 justify-between">
                    <ul className="space-y-2 mb-6">
                      {plan.features.map(
                        (
                          feature: { included: boolean; text: string },
                          i: number
                        ) => (
                          <li key={i} className="flex items-center gap-2">
                            {feature.included ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <X className="h-4 w-4 text-red-500" />
                            )}
                            <span className="text-sm">{feature.text}</span>
                          </li>
                        )
                      )}
                    </ul>
                    <div className="flex flex-col justify-between gap-2">
                      {plan.monthly_price !== null && (
                        <Button
                          className="w-full"
                          variant={
                            subscription?.plan_id === plan.plan_id
                              ? 'outline'
                              : 'default'
                          }
                          disabled={subscription?.plan_id === plan.plan_id}
                          onClick={() => handlePlanSelect(plan, 'monthly')}
                        >
                          {subscription?.plan_id === plan.plan_id
                            ? 'Current Plan'
                            : 'Select'}
                        </Button>
                      )}

                      {plan.lifetime_price !== null && (
                        <Button
                          className="w-full"
                          variant={
                            subscription?.plan_id === plan.plan_id
                              ? 'outline'
                              : 'default'
                          }
                          disabled={subscription?.plan_id === plan.plan_id}
                          onClick={() => handlePlanSelect(plan, 'lifetime')}
                        >
                          {subscription?.plan_id === plan.plan_id
                            ? 'Current Plan'
                            : 'Select Lifetime Plan'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="yearly">
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className="flex flex-col hover:border-primary"
                >
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="flex flex-col justify-between gap-2 mt-2">
                      {plan.monthly_price ||
                      plan.annual_price ||
                      plan.lifetime_price ? (
                        <div>
                          <span className="text-3xl font-bold">
                            ${plan.annual_price / 12}
                          </span>
                          <span className="text-muted-foreground">/year</span>
                          {plan.name === 'Legacy Builder' && (
                            <span className="text-muted-foreground">
                              {' '}
                              <br />
                              (3 Days Free, then ${plan.annual_price})
                            </span>
                          )}
                          {plan.name === 'Legacy Master' && (
                            <span className="text-muted-foreground">
                              {' '}
                              <br />
                              (3 Days Free, then ${plan.annual_price})
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-3xl font-bold">Free</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1 justify-between">
                    <ul className="space-y-2 mb-6">
                      {plan.features.map(
                        (
                          feature: { included: boolean; text: string },
                          i: number
                        ) => (
                          <li key={i} className="flex items-center gap-2">
                            {feature.included ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <X className="h-4 w-4 text-red-500" />
                            )}
                            <span className="text-sm">{feature.text}</span>
                          </li>
                        )
                      )}
                    </ul>
                    <div className="flex flex-col justify-between gap-2">
                      {plan.annual_price !== null && (
                        <Button
                          className="w-full"
                          variant={
                            subscription?.plan_id === plan.plan_id
                              ? 'outline'
                              : 'default'
                          }
                          disabled={subscription?.plan_id === plan.plan_id}
                          onClick={() => handlePlanSelect(plan, 'yearly')}
                        >
                          {subscription?.plan_id === plan.plan_id
                            ? 'Current Plan'
                            : 'Select'}
                        </Button>
                      )}

                      {plan.lifetime_price !== null && (
                        <Button
                          className="w-full"
                          variant={
                            subscription?.plan_id === plan.plan_id
                              ? 'outline'
                              : 'default'
                          }
                          disabled={subscription?.plan_id === plan.plan_id}
                          onClick={() => handlePlanSelect(plan, 'lifetime')}
                        >
                          {subscription?.plan_id === plan.plan_id
                            ? 'Current Plan'
                            : 'Select Lifetime Plan'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default SubscriptionStatus;
