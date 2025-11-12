import { motion } from "framer-motion";
import {
  Lightbulb,
  GanttChart,
  Users,
  Rocket,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import AnimatedBackground from "@/components/AnimatedBackground";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const IdeaVaultFeaturePage = () => {
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

          {/* Rest of the component remains the same */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
              <Lightbulb className="h-10 w-10 text-primary" />
            </div>

            <motion.h1
              className="text-4xl md:text-6xl font-bold mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Idea Vault
            </motion.h1>

            <motion.p
              className="text-xl max-w-3xl mx-auto text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Refine, share, and fund your ideas. Turn your dreams into reality
              by documenting, collaborating, and receiving funding from
              investors.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="mb-2">
                  <GanttChart className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Idea Development</CardTitle>
                <CardDescription>
                  Structure your thoughts and refine your concepts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Organize your ideas with our structured templates, helping you
                  develop raw concepts into fully-formed proposals ready for
                  action.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="mb-2">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Collaboration</CardTitle>
                <CardDescription>
                  Share your ideas with potential collaborators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Connect with like-minded individuals who can contribute to
                  your vision, providing feedback and expertise to strengthen
                  your idea.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="mb-2">
                  <Rocket className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Funding Opportunities</CardTitle>
                <CardDescription>
                  Connect with investors interested in your vision
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Showcase your ideas to potential investors who are looking for
                  the next big thing, helping you transform concepts into
                  reality.
                </p>
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
              Start Your Idea <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <p className="mt-4 text-muted-foreground">
              Already have an account?{" "}
              <a href="/signin" className="text-primary hover:underline">
                Sign in
              </a>{" "}
              to access your Idea Vault.
            </p>
          </motion.div>
        </div>
      </AnimatedBackground>
    </div>
  );
};

export default IdeaVaultFeaturePage;
