import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Menu, Moon, Sun } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "./Logo";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

interface HomeNavigationProps {
  currentSection: number;
  onNavigate: (index: number) => void;
}

const HomeNavigation: React.FC<HomeNavigationProps> = ({
  currentSection,
  onNavigate,
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { isAuthenticated, signOut } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    const storedDarkMode = localStorage.getItem("darkMode");
    const isDark = storedDarkMode === null ? true : storedDarkMode === "true";
    setIsDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("darkMode", String(newMode));
    document.documentElement.classList.toggle("dark", newMode);
  };

  const sections = ["Home", "Features", "Experts", "Case Studies", "Join Us"];

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (isMobile) {
    return (
      <>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger aria-label="Open navigation menu">
            <Button size="icon">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="bg-background/30">
            {/* Sections navigation buttons */}
            {sections.map((section, index) => (
              <motion.div
                key={section}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant={currentSection === index ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    onNavigate(index);
                    setIsSheetOpen(false);
                  }}
                  className={`whitespace-nowrap ${
                    currentSection === index ? "font-medium" : ""
                  }`}
                >
                  {section}
                </Button>
              </motion.div>
            ))}

            {/* Dark mode toggle button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                title={
                  isDarkMode ? "Switch to light mode" : "Switch to dark mode"
                }
              >
                {isDarkMode ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            </motion.div>

            {/* Sign in, Sign up & Dashboard buttons */}
            {isAuthenticated() ? (
              <>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigate("/dashboard");
                      setIsSheetOpen(false);
                    }}
                  >
                    Dashboard
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="ghost" size="sm" onClick={handleSignOut}>
                    Sign Out
                  </Button>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/signin")}
                  >
                    Sign In
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/signup")}
                  >
                    Sign Up
                  </Button>
                </motion.div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </>
    );
  }

  // Desktop version
  return (
    <motion.div
      className="flex items-center gap-2 bg-background/80 backdrop-blur-md rounded-full px-4 py-2 shadow-lg border border-border"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      <div className="flex items-center mr-4">
        <Logo variant={isDarkMode ? "light" : "default"} className="w-8 h-8" />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
        {sections.map((section, index) => (
          <motion.div
            key={section}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant={currentSection === index ? "default" : "ghost"}
              size="sm"
              onClick={() => onNavigate(index)}
              className={`whitespace-nowrap ${
                currentSection === index ? "font-medium" : ""
              }`}
            >
              {section}
            </Button>
          </motion.div>
        ))}
      </div>

      <div className="w-px h-6 bg-border mx-2" />

      <motion.div
        whileHover={{ scale: 1.1, rotate: 15 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
      </motion.div>

      <div className="w-px h-6 bg-border mx-2" />

      <div className="flex gap-2">
        {isAuthenticated() ? (
          <>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="sm" onClick={() => navigate("/dashboard")}>
                Dashboard
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </motion.div>
          </>
        ) : (
          <>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/signin")}
              >
                Sign In
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="sm" onClick={() => navigate("/signup")}>
                Sign Up
              </Button>
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default HomeNavigation;
