import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Logo from "@/components/Logo";
import {
  ArrowLeft,
  BookOpen,
  Archive,
  Shield,
  Tags,
  Clock,
} from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";

const LegacyVaultFeaturePage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <AnimatedBackground
      mouseInteraction={true}
      density={30}
      speed={10}
      interactionStrength={100}
      particleSize="mixed"
    >
      <div className="min-h-screen text-foreground">
        {/* Back button */}
        <motion.button
          className="fixed top-6 left-6 z-50 flex items-center space-x-2 text-foreground/80 hover:text-foreground"
          whileHover={{ scale: 1.05, x: -3 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </motion.button>

        {/* Header */}
        <header className="pt-20 pb-10 px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center mb-4">
              <Logo
                variant="light"
                className="w-12 h-12 mr-4"
                interactive={false}
              />
              <div>
                <h1 className="text-4xl font-bold text-foreground">
                  Legacy Vault
                </h1>
                <p className="text-muted-foreground">
                  Share and preserve your most valuable ideas
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="px-8 pb-24">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left Column - Description */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground">
                  Preserve Your Most Valuable Memories
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Legacy Vault allows you to upload and preserve your most
                  cherished memories, ideas, and wisdom for future generations.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start space-x-3">
                    <div className="bg-primary/20 p-2 rounded-lg">
                      <Archive className="text-primary" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium text-foreground">
                        Upload media content
                      </h3>
                      <p className="text-muted-foreground">
                        Store photos, videos, documents, and audio recordings
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-primary/20 p-2 rounded-lg">
                      <Shield className="text-primary" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium text-foreground">
                        Set privacy options
                      </h3>
                      <p className="text-muted-foreground">
                        Control access with immediate or future release dates
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-primary/20 p-2 rounded-lg">
                      <Tags className="text-primary" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium text-foreground">
                        Organize with tags
                      </h3>
                      <p className="text-muted-foreground">
                        Categorize content to make it easily discoverable
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-primary/20 p-2 rounded-lg">
                      <Clock className="text-primary" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium text-foreground">
                        Create time capsules
                      </h3>
                      <p className="text-muted-foreground">
                        Build digital time capsules for your loved ones
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white rounded-full"
                  onClick={() => navigate("/signup")}
                >
                  Start Your Legacy
                </Button>
              </motion.div>

              {/* Right Column - Preview */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-black/30 backdrop-blur-md rounded-xl p-6 border border-white/10"
              >
                <div className="flex items-center mb-6">
                  <BookOpen size={24} className="text-primary mr-2" />
                  <h3 className="text-2xl font-bold text-foreground">
                    Legacy Vault Preview
                  </h3>
                </div>

                {/* Collection preview */}
                <Card className="bg-black/30 border-white/5 text-foreground mb-6">
                  <CardContent className="p-4">
                    <h4 className="text-lg font-medium mb-2">
                      Family Recipes Collection
                    </h4>
                    <p className="text-sm text-muted dark:text-muted-foreground mb-3">
                      A collection of our family's recipes passed down through
                      generations.
                    </p>
                    <div className="flex space-x-2">
                      <Badge className="bg-white/10 dark:bg-white hover:bg-white/20">
                        Documents
                      </Badge>
                      <Badge className="bg-white/10 dark:bg-white hover:bg-white/20">
                        Photos
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-black/30 border-white/5 text-foreground mb-6">
                  <CardContent className="p-4">
                    <h4 className="text-lg font-medium mb-2">
                      Wisdom for My Children
                    </h4>
                    <p className="text-sm text-muted dark:text-muted-foreground mb-3">
                      Life lessons and advice I want to share with my children
                      when they're older.
                    </p>
                    <div className="flex space-x-2">
                      <Badge className="bg-white/10 dark:bg-white hover:bg-white/20">
                        Video
                      </Badge>
                      <Badge className="bg-white/10 dark:bg-white hover:bg-white/20">
                        Private
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-black/30 border-white/5 text-foreground mb-6">
                  <CardContent className="p-4">
                    <h4 className="text-lg font-medium mb-2">My Life Story</h4>
                    <p className="text-sm text-muted dark:text-muted-foreground mb-3">
                      An autobiographical account of my life's journey and
                      experiences.
                    </p>
                    <div className="flex space-x-2">
                      <Badge className="bg-white/20 dark:bg-white hover:bg-white/20">
                        Audio
                      </Badge>
                      <Badge className="bg-white/10 dark:bg-white hover:bg-white/20">
                        Text
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <div className="text-center mt-8">
                  <p className="text-muted-foreground mb-4">
                    Sign in to create your own Legacy Vault
                  </p>
                  <Button
                    variant="outline"
                    className="border-white/20 text-foreground hover:bg-white/10 w-full"
                    onClick={() => navigate("/signin")}
                  >
                    Sign In
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedBackground>
  );
};

export default LegacyVaultFeaturePage;
