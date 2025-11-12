
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Home, Book, MessageSquare, UserCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import DashboardAnimatedBackground from '@/components/dashboard/DashboardAnimatedBackground';

interface DashboardData {
  legacyPostsCount: number;
  timelessMessagesCount: number;
  wisdomResourcesCount: number;
  storageUsed: number;
  storageQuota: number;
}

const Dashboard: React.FC = () => {
  const { user, profile, roles, isLoading, isAdmin, isMentor, isDisciple } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    legacyPostsCount: 0,
    timelessMessagesCount: 0,
    wisdomResourcesCount: 0,
    storageUsed: 0,
    storageQuota: 1000 // Default quota in MB
  });
  const [isDataLoading, setIsDataLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setIsDataLoading(true);
      
      // Fetch legacy posts count
      const { count: legacyCount, error: legacyError } = await supabase
        .from('legacy_posts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user?.id);
      
      // Fetch timeless messages count
      const { count: messagesCount, error: messagesError } = await supabase
        .from('timeless_messages')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user?.id);
      
      // Fetch wisdom resources count
      const { count: resourcesCount, error: resourcesError } = await supabase
        .from('wisdom_resources')
        .select('id', { count: 'exact', head: true })
        .eq('created_by', user?.id);
      
      // Calculate storage used (this is a placeholder, actual implementation would depend on how you track storage)
      // For this example, we'll use a random number between 50 and 500 MB
      const storageUsed = Math.floor(Math.random() * 450) + 50;
      
      setDashboardData({
        legacyPostsCount: legacyCount || 0,
        timelessMessagesCount: messagesCount || 0,
        wisdomResourcesCount: resourcesCount || 0,
        storageUsed,
        storageQuota: 1000 // 1GB quota
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsDataLoading(false);
    }
  };

  const navigateTo = (path: string) => {
    navigate(path);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  const calculateStoragePercentage = () => {
    return Math.min(100, Math.round((dashboardData.storageUsed / dashboardData.storageQuota) * 100));
  };

  return (
    <DashboardAnimatedBackground>
      <div className="container mx-auto py-8 px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto"
        >
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Welcome, {profile?.full_name || user?.email}
            </h1>
            <p className="text-muted-foreground">
              {isAdmin() 
                ? "You have administrator access to the Mind Mortal platform." 
                : isMentor() 
                  ? "You are a mentor, ready to share your knowledge and wisdom."
                  : "Welcome to your personal space for growth and legacy."}
            </p>
          </motion.div>

          {/* Stats Section */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-background to-secondary/10 hover:shadow-md transition-all">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Your Legacy Content</CardTitle>
                </CardHeader>
                <CardContent>
                  {isDataLoading ? (
                    <div className="h-24 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2">
                        <p className="text-3xl font-bold">{dashboardData.legacyPostsCount}</p>
                        <p className="text-xs text-muted-foreground">Legacy Posts</p>
                      </div>
                      <div className="p-2">
                        <p className="text-3xl font-bold">{dashboardData.timelessMessagesCount}</p>
                        <p className="text-xs text-muted-foreground">Messages</p>
                      </div>
                      <div className="p-2">
                        <p className="text-3xl font-bold">{dashboardData.wisdomResourcesCount}</p>
                        <p className="text-xs text-muted-foreground">Resources</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-background to-secondary/10 hover:shadow-md transition-all">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Storage Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  {isDataLoading ? (
                    <div className="h-24 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative pt-1">
                        <div className="overflow-hidden h-4 text-xs flex rounded bg-secondary/20">
                          <div 
                            style={{ width: `${calculateStoragePercentage()}%` }} 
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"
                          ></div>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>{dashboardData.storageUsed} MB used</span>
                        <span>{dashboardData.storageQuota} MB total</span>
                      </div>
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        {calculateStoragePercentage()}% of your storage quota used
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-background to-secondary/10 hover:shadow-md transition-all">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Account Status</CardTitle>
                </CardHeader>
                <CardContent>
                  {isDataLoading ? (
                    <div className="h-24 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="bg-primary/10 p-2 rounded-md flex items-center justify-between">
                        <span className="text-sm font-medium">Plan</span>
                        <span className="bg-primary text-white px-2 py-1 rounded text-xs">Free</span>
                      </div>
                      <div className="bg-secondary/10 p-2 rounded-md flex items-center justify-between">
                        <span className="text-sm font-medium">Profile</span>
                        <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs">
                          {profile?.full_name ? 'Complete' : 'Incomplete'}
                        </span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-2"
                        onClick={() => navigateTo('/dashboard/profile')}
                      >
                        Manage Account
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              {isAdmin() && <TabsTrigger value="admin">Admin</TabsTrigger>}
              {isMentor() && <TabsTrigger value="mentor">Mentor</TabsTrigger>}
              {isDisciple() && <TabsTrigger value="disciple">Disciple</TabsTrigger>}
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
              >
                <motion.div 
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => navigateTo('/dashboard/profile')}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <UserCircle className="h-5 w-5 text-primary" />
                        Profile
                      </CardTitle>
                      <CardDescription>View and update your profile information</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full">Manage Profile</Button>
                    </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div 
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => navigateTo('/dashboard/legacy-vault')}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Book className="h-5 w-5 text-primary" />
                        Legacy
                      </CardTitle>
                      <CardDescription>Access your personal legacy</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full">Open Legacy</Button>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div 
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => navigateTo('/dashboard/timeless-messages')}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        Messages
                      </CardTitle>
                      <CardDescription>Manage your timeless messages</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full">View Messages</Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </TabsContent>
            
            {isAdmin() && (
              <TabsContent value="admin" className="space-y-4">
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                >
                  <motion.div variants={itemVariants}>
                    <Card>
                      <CardHeader>
                        <CardTitle>User Management</CardTitle>
                        <CardDescription>Manage users and roles</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button className="w-full">Manage Users</Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <Card>
                      <CardHeader>
                        <CardTitle>System Settings</CardTitle>
                        <CardDescription>Configure system settings</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button className="w-full">Settings</Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              </TabsContent>
            )}
            
            {isMentor() && (
              <TabsContent value="mentor" className="space-y-4">
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                >
                  <motion.div variants={itemVariants}>
                    <Card>
                      <CardHeader>
                        <CardTitle>Disciples</CardTitle>
                        <CardDescription>Manage your disciples</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button className="w-full">View Disciples</Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <Card>
                      <CardHeader>
                        <CardTitle>Sessions</CardTitle>
                        <CardDescription>Manage your mentoring sessions</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button className="w-full">View Sessions</Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              </TabsContent>
            )}
            
            {isDisciple() && (
              <TabsContent value="disciple" className="space-y-4">
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                >
                  <motion.div variants={itemVariants}>
                    <Card>
                      <CardHeader>
                        <CardTitle>Find a Mentor</CardTitle>
                        <CardDescription>Connect with mentors</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button className="w-full">Search Mentors</Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <Card>
                      <CardHeader>
                        <CardTitle>My Learning</CardTitle>
                        <CardDescription>Track your learning journey</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button className="w-full">View Progress</Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              </TabsContent>
            )}
          </Tabs>
        </motion.div>
      </div>
    </DashboardAnimatedBackground>
  );
};

export default Dashboard;
