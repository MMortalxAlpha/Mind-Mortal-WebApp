import React, { useState } from "react";
import DashboardSidebar from "./DashboardSidebar";
import DashboardAnimatedBackground from "./dashboard/DashboardAnimatedBackground";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { User, Settings, Shield, LogOut, BadgeCheck } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ThemeToggle } from "./ThemeToggle";
import SubscriptionStatusModal from "@/components/modals/SubscriptionStatusModal";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, profile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [subOpen, setSubOpen] = useState(false);

  const handleProfileClick = () => {
    navigate("/dashboard/profile");
  };

  const handleSubscriptionClick = () => {
    setSubOpen(true);
  };

  const handleSettingsClick = () => {
    navigate("/dashboard/settings");
  };

  const handleAdminClick = () => {
    navigate("/admin");
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(" ")
        .map((name: string) => name[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  return (
    <DashboardAnimatedBackground>
      <div
        className={
          isMobile
            ? "flex flex-col min-h-screen bg-background"
            : "flex h-screen bg-background"
        }
      >
        {!isMobile && <DashboardSidebar />}

        <main
          className={
            isMobile ? "flex-1 overflow-auto p-2 pb-28" : "flex-1 overflow-auto"
          }
        >
          <div className="flex justify-end gap-3 items-center p-4 border-b">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={profile?.avatar_url}
                      alt={profile?.full_name || user?.email}
                    />
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem onClick={handleProfileClick}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>

                {/* NEW: Subscription (opens modal) */}
                <DropdownMenuItem onClick={handleSubscriptionClick}>
                  <BadgeCheck className="mr-2 h-4 w-4" />
                  <span>Subscription</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleSettingsClick}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>

                {isAdmin() && (
                  <DropdownMenuItem onClick={handleAdminClick}>
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Go To Admin Dashboard</span>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="container mx-auto p-6 xs:p-0">{children}</div>
        </main>

        {isMobile && <DashboardSidebar />}

        {/* Modal lives at layout level so it’s available everywhere */}
        <SubscriptionStatusModal open={subOpen} onOpenChange={setSubOpen} />
      </div>
    </DashboardAnimatedBackground>
  );
};

export default DashboardLayout;
