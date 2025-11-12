import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const FeaturedMentorsSection = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen max-h-screen flex flex-col items-center justify-center py-16 md:py-20 px-4 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Become our featured mentor
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with experienced professionals who can guide your growth
            journey.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="flex flex-row justify-center gap-4 overflow-x-auto md:gap-6 md:overflow-visible max-w-5xl mx-auto my-12"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {[1].map((_, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="min-w-[260px] max-w-xs w-full md:w-auto md:min-w-0 md:max-w-none flex-shrink-0"
            >
              <Card className="text-center border border-primary/10 hover:border-primary/30 transition-all hover:shadow-md">
                <CardContent className="pt-6">
                  <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium">You?</h3>
                  <p className="text-sm text-muted-foreground my-2">
                    Future Featured Mentor – This Could Be You
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            variant="outline"
            size="lg"
            className="bg-background hover:bg-background/80 border-primary/20 text-primary hover:text-primary/90"
            onClick={() => navigate("/signup")}
          >
            Apply to Become a Mentor
          </Button>

          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90"
            onClick={() => navigate("/features/mentorship")}
          >
            Find Mentors
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default FeaturedMentorsSection;
