import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

// import our icons
import { MentorshipIcon } from "./icons/MentorshipIcon";
import { IdeaIcon } from "./icons/IdeaIcon";
import { LegacyIcon } from "./icons/LegacyIcon";
import { TimelessMessageIcon } from "./icons/TimelessMessageIcon";
import { usePlanGate } from "@/hooks/usePlanGate"; 
import { Home } from "lucide-react";
import Logo from "./Logo";

type MenuItem = {
  name: string;
  path: string;
  icon: React.ComponentType<any>;
};

const menuItems: MenuItem[] = [
  { name: "Home", path: "/dashboard", icon: Home },
  { name: "Legacy Vault", path: "/dashboard/legacy-vault", icon: LegacyIcon },
  { name: "Idea Vault", path: "/dashboard/idea-vault", icon: IdeaIcon },
  { name: "Mentorship", path: "/dashboard/mentorship", icon: MentorshipIcon },
  { name: "Timeless Messages", path: "/dashboard/timeless-messages", icon: TimelessMessageIcon},
];

const sidebarAnimation = {
  /* unchanged */
};
const itemAnimation = {
  /* unchanged */
};

const DashboardSidebar: React.FC = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { limits } = usePlanGate(); 
  const visibleMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (item.name === "Mentorship") {
        return limits.mentorship !== "none";        // show for Builder/Master
      }
      return true;
    });
  }, [limits.mentorship]);

  if (isMobile) {
    // Render bottom navigation for mobile
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-20 flex justify-around items-center h-16 bg-sidebar border-t border-sidebar-border md:hidden">
        {visibleMenuItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/dashboard" &&
              location.pathname.startsWith(item.path));
          return (
            <Link
              to={item.path}
              key={item.name}
              className="flex-1 flex justify-center"
            >
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-10 w-10 rounded-md flex flex-col items-center justify-center",
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                {React.createElement(item.icon, {
                  className: cn(
                    "h-6 w-6 mb-0.5",
                    isActive ? "text-primary" : "text-sidebar-foreground"
                  ),
                  "aria-hidden": "true",
                })}
                <span className="sr-only">{item.name}</span>
              </Button>
            </Link>
          );
        })}
      </nav>
    );
  }
  //== Desktop sidebar
  return (
    <motion.aside
      className="sticky top-0 h-screen w-16 bg-sidebar border-r border-sidebar-border flex-col items-center py-6 z-10 hidden md:flex"
      initial="hidden"
      animate="visible"
      variants={sidebarAnimation}
    >
      <div className="mb-8">
        <Logo interactive={false} className="w-10 h-10" />
      </div>

      <nav className="flex-1 flex flex-col items-center space-y-4 w-full">
        <TooltipProvider>
          {visibleMenuItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/dashboard" &&
                location.pathname.startsWith(item.path));
            return (
              <motion.div
                key={item.name}
                variants={itemAnimation}
                className="w-full px-2"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to={item.path} className="w-full block">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "w-full h-10 rounded-md",
                          isActive
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        {/* render SVG or lucide */}
                        {React.createElement(item.icon, {
                          className: cn(
                            "h-6 w-6",
                            isActive
                              ? "text-primary"
                              : "text-sidebar-foreground"
                          ),
                          "aria-hidden": "true",
                        })}
                        <span className="sr-only">{item.name}</span>
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{item.name}</p>
                  </TooltipContent>
                </Tooltip>
              </motion.div>
            );
          })}
        </TooltipProvider>
      </nav>
    </motion.aside>
  );
};

export default DashboardSidebar;
