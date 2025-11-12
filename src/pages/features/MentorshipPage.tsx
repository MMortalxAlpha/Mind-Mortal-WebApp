
import React from 'react';
import { motion } from 'framer-motion';
import { Users, GanttChart, Rocket, ArrowRight, ArrowLeft, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from '@/components/AnimatedBackground';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const MentorshipFeaturePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <AnimatedBackground objectCount={7}>
        <div className="container mx-auto px-4 py-16 relative z-10">
          {/* Back button */}
          <Button
            variant="ghost"
            className="mb-8 flex items-center gap-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
              <Users className="h-10 w-10 text-primary" />
            </div>
            
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Mentorship
            </motion.h1>
            
            <motion.p 
              className="text-xl max-w-3xl mx-auto text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Guidance from experience to ignite your growth. Get support from experts who can guide you through your journey, offering valuable insight and support to help bring your ideas to life.
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="mb-2">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Expert Guidance</CardTitle>
                <CardDescription>
                  Learn from industry veterans
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Connect with mentors who have decades of experience in their fields, ready to share their knowledge and help you avoid common pitfalls.</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="mb-2">
                  <GanttChart className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Structured Growth</CardTitle>
                <CardDescription>
                  Follow proven development paths
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Work with your mentor to create customized growth plans that help you achieve your goals through actionable steps and regular feedback.</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="mb-2">
                  <Rocket className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Accelerated Progress</CardTitle>
                <CardDescription>
                  Move faster with directed assistance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Skip years of trial and error by learning directly from those who've already walked the path, helping you achieve your goals in record time.</p>
              </CardContent>
            </Card>
          </div>
          
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90"
              onClick={() => navigate("/signup")}
            >
              Find a Mentor <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <p className="mt-4 text-muted-foreground">
              Already have an account? <a href="/signin" className="text-primary hover:underline">Sign in</a> to connect with mentors.
            </p>
          </motion.div>
        </div>
      </AnimatedBackground>
    </div>
  );
};

export default MentorshipFeaturePage;
