
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminSubscriptionPlan } from '@/types';
import { Edit, Plus, Trash, Check, X } from 'lucide-react';

const SubscriptionPlans = () => {
  // Mock data for subscription plans
  const initialPlans: AdminSubscriptionPlan[] = [
    {
      id: '1',
      name: 'Basic',
      price: 9.99,
      interval: 'monthly',
      features: [
        'Legacy Vault (Limited)',
        'Timeless Messages (5/month)',
        'Basic Support'
      ],
      isActive: true
    },
    {
      id: '2',
      name: 'Pro',
      price: 19.99,
      interval: 'monthly',
      features: [
        'Full Legacy Vault',
        'Unlimited Timeless Messages',
        'Idea Vault',
        'Priority Support'
      ],
      isActive: true
    },
    {
      id: '3',
      name: 'Ultimate',
      price: 99.99,
      interval: 'yearly',
      features: [
        'All Pro Features',
        'Mentorship Access',
        'Premium Support',
        'Early Access to New Features'
      ],
      isActive: true
    },
    {
      id: '4',
      name: 'Legacy',
      price: 299.99,
      interval: 'lifetime',
      features: [
        'All Ultimate Features',
        'Lifetime Access',
        'Private Consultation',
        'Custom Legacy Preservation'
      ],
      isActive: true
    }
  ];

  const [plans, setPlans] = useState<AdminSubscriptionPlan[]>(initialPlans);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>('monthly');

  // Filter plans based on selected tab
  const filteredPlans = plans.filter(plan => plan.interval === selectedTab);

  // Function to toggle plan active status
  const togglePlanStatus = (id: string) => {
    setPlans(plans.map(plan => 
      plan.id === id 
        ? { ...plan, isActive: !plan.isActive } 
        : plan
    ));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Subscription Plans</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add New Plan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Plans</CardTitle>
          <CardDescription>Configure pricing and features for subscription plans</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="monthly" value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
              <TabsTrigger value="lifetime">Lifetime</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="space-y-6">
              {filteredPlans.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  No plans found for this interval
                </div>
              ) : (
                filteredPlans.map(plan => (
                  <Card key={plan.id} className={!plan.isActive ? "opacity-60" : ""}>
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{plan.name}</CardTitle>
                          <CardDescription>
                            ${plan.price.toFixed(2)} / 
                            {plan.interval === 'monthly' 
                              ? 'month' 
                              : plan.interval === 'yearly' 
                                ? 'year' 
                                : 'lifetime'}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center space-x-2">
                            <Switch 
                              id={`plan-status-${plan.id}`}
                              checked={plan.isActive}
                              onCheckedChange={() => togglePlanStatus(plan.id)}
                            />
                            <Label htmlFor={`plan-status-${plan.id}`}>
                              {plan.isActive ? 'Active' : 'Inactive'}
                            </Label>
                          </div>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h4 className="text-sm font-medium mb-2">Features:</h4>
                      <ul className="space-y-1">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="h-4 w-4 mr-2 text-green-500 shrink-0 mt-0.5" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-4">
                      <div className="text-sm text-muted-foreground">
                        ID: {plan.id}
                      </div>
                      <Button variant="destructive" size="sm">
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plan Settings</CardTitle>
          <CardDescription>Global settings for subscription plans</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="trial-days">Free Trial Period (Days)</Label>
              <Input id="trial-days" type="number" defaultValue="14" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grace-period">Payment Grace Period (Days)</Label>
              <Input id="grace-period" type="number" defaultValue="3" />
            </div>
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Switch id="auto-cancel" />
            <Label htmlFor="auto-cancel">Auto-cancel after failed payments</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch id="prorate" defaultChecked />
            <Label htmlFor="prorate">Prorate subscription changes</Label>
          </div>
        </CardContent>
        <CardFooter>
          <Button>Save Settings</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SubscriptionPlans;
