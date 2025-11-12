
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, Users, CreditCard, Clock, ShieldCheck } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';

interface StatsData {
  totalUsers: number;
  subscribers: number;
  recentActivity: number;
  adminActions: number;
}

const AdminOverview = () => {
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    subscribers: 0,
    recentActivity: 0,
    adminActions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total users count
        const { count: usersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Fetch subscribers count
        const { count: subscribersCount } = await supabase
          .from('subscribers')
          .select('*', { count: 'exact', head: true })
          .eq('subscribed', true);

        // Fetch recent activity (posts from last week)
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const { count: recentActivityCount } = await supabase
          .from('legacy_posts')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', oneWeekAgo);

        // Fetch admin users count
        const { count: adminCount } = await supabase
          .from('user_roles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'admin');

        setStats({
          totalUsers: usersCount || 0,
          subscribers: subscribersCount || 0,
          recentActivity: recentActivityCount || 0,
          adminActions: adminCount || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsDisplay = [
    { 
      title: "Total Users", 
      value: stats.totalUsers.toString(), 
      change: "+12%", 
      description: "From last month", 
      icon: Users 
    },
    { 
      title: "Subscribers", 
      value: stats.subscribers.toString(), 
      change: "+18%", 
      description: "From last month", 
      icon: CreditCard 
    },
    { 
      title: "Recent Activity", 
      value: stats.recentActivity.toString(), 
      change: "+7%", 
      description: "From last week", 
      icon: Clock 
    },
    { 
      title: "Admin Users", 
      value: stats.adminActions.toString(), 
      change: "+2%", 
      description: "Total admins", 
      icon: ShieldCheck 
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the MMortal admin dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsDisplay.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stat.value}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <span className="text-emerald-500 flex items-center">
                  {stat.change}
                  <ArrowUpRight className="h-3 w-3 ml-1" />
                </span>
                <span className="ml-1">{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent User Activity</CardTitle>
            <CardDescription>Overview of user activity across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-10 text-muted-foreground">
              <p>Activity chart will be displayed here</p>
              <p className="text-sm mt-2">Data collection in progress</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Metrics</CardTitle>
            <CardDescription>Current subscription data and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-10 text-muted-foreground">
              <p>Subscription metrics will be displayed here</p>
              <p className="text-sm mt-2">Data collection in progress</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;
