// src/pages/dashboard/DashboardHome.tsx
import React from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import DashboardAnimatedBackground from "@/components/dashboard/DashboardAnimatedBackground";
import { useContentCount } from "@/hooks/useContentCount";
import LegacyIcon from "@/assets/icons/Legacy.svg?react";
import IdeaIcon from "@/assets/icons/Idea.svg?react";
import MentorshipIcon from "@/assets/icons/Mentorship.svg?react";
import TimelessMessageIcon from "@/assets/icons/TimelessMessage.svg?react";
import { Plus } from "lucide-react";
import { usePlanGate } from "@/hooks/usePlanGate";

const DashboardHome: React.FC = () => {
  const navigate = useNavigate();
  const { roles } = useAuth();

  // Plan / gating
  const { limits, canSeeProgressTracker } = usePlanGate();

  // Content counters
  const {
    legacyPostCount,
    ideaCount,
    timelessMessageCount,
    wisdomResourceCount,
  } = useContentCount();

  const handleCreateClick = (type: string) => {
    switch (type) {
      case "legacy":
        return navigate("/dashboard/legacy-vault/create");
      case "idea":
        return navigate("/dashboard/idea-vault/create");
      case "message":
        return navigate("/dashboard/timeless-messages/create");
      case "resource":
        return navigate("/dashboard/mentorship/create");
      default:
        return;
    }
  };

  // (optional) motion variants
  const containerVariants = {};
  const itemVariants = {};

  return (
    <DashboardAnimatedBackground>
      <div className="container mx-auto max-w-6xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header + Build */}
          <motion.div variants={itemVariants} className="text-center">
            <h1 className="text-4xl font-bold mb-4">Welcome to Your Dashboard</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Your journey to immortality begins here. Create, share, and
              preserve your legacy.
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="lg" className="text-lg px-8 py-6 bg-[#F47B20]">
                  <Plus className="mr-2 h-5 w-5" />
                  Build Your Legacy
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-56">
                <DropdownMenuItem onClick={() => handleCreateClick("legacy")}>
                  <LegacyIcon className="mr-2 h-4 w-4" />
                  Legacy Post
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCreateClick("idea")}>
                  <IdeaIcon className="mr-2 h-4 w-4" />
                  Idea Post
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCreateClick("message")}>
                  <TimelessMessageIcon className="mr-2 h-4 w-4" />
                  Timeless Message
                </DropdownMenuItem>
                {roles.includes("mentor") && limits.mentorship === "mentor_mentee" && (
                  <DropdownMenuItem onClick={() => handleCreateClick("resource")}>
                    <MentorshipIcon className="mr-2 h-4 w-4" />
                    Mentorship Resource
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>

          {/* Quick Stats / Legacy Progress Tracker */}
          {canSeeProgressTracker ? (
            <motion.div variants={itemVariants}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Legacy */}
                <Card className="hover:shadow-lg bg-[#B79D6B]/10 transition-shadow border border-transparent hover:border-[#B79D6B] hover:bg-[#B79D6B]/5">
                  <CardHeader className="flex items-center justify-between pb-2">
                    <LegacyIcon className="h-5 w-5" style={{ color: "#B79D6B" }} />
                    <CardTitle className="text-sm font-medium">Legacy</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <div className="text-2xl font-bold">{legacyPostCount}</div>
                    <p className="text-xs text-muted-foreground">Stories for the future</p>
                  </CardContent>
                </Card>

                {/* Ideas */}
                <Card className="hover:shadow-lg bg-[#7C9885]/10 transition-shadow border border-transparent hover:border-[#7C9885] hover:bg-[#7C9885]/5">
                  <CardHeader className="flex items-center justify-between pb-2">
                    <IdeaIcon className="h-5 w-5" style={{ color: "#7C9885" }} />
                    <CardTitle className="text-sm font-medium">Ideas</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <div className="text-2xl font-bold">{ideaCount}</div>
                    <p className="text-xs text-muted-foreground">Innovations documented</p>
                  </CardContent>
                </Card>

                {/* Mentorship (stats shown for mentor plan only) */}
                {limits.mentorship !== "none" && (
                  <Card className="hover:shadow-lg bg-[#6E4C84]/10 transition-shadow border border-transparent hover:border-[#6E4C84] hover:bg-[#6E4C84]/5">
                    <CardHeader className="flex items-center justify-between pb-2">
                      <MentorshipIcon className="h-5 w-5" style={{ color: "#6E4C84" }} />
                      <CardTitle className="text-sm font-medium">Mentorship</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                      <div className="text-2xl font-bold">{wisdomResourceCount}</div>
                      <p className="text-xs text-muted-foreground">Resources shared</p>
                    </CardContent>
                  </Card>
                )}

                {/* Timeless Messages */}
                <Card className="hover:shadow-lg bg-[#4C6B8A]/10 transition-shadow border border-transparent hover:border-[#4C6B8A] hover:bg-[#4C6B8A]/5">
                  <CardHeader className="flex items-center justify-between pb-2">
                    <TimelessMessageIcon className="h-5 w-5" style={{ color: "#4C6B8A" }} />
                    <CardTitle className="text-sm font-medium">Messages Scheduled</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <div className="text-2xl font-bold">{timelessMessageCount}</div>
                    <p className="text-xs text-muted-foreground">Future connections</p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          ) : (
            <section className="rounded-xl border p-6">
              <h3 className="text-lg font-semibold">Legacy Progress Tracker</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Unlock this tracker with a paid plan.
              </p>
              <a href="/pricing" className="mt-4 inline-block rounded-md border px-4 py-2">
                View Plans
              </a>
            </section>
          )}

          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card
                className="cursor-pointer bg-[#B79D6B]/10 hover:shadow-lg transition-all duration-300 hover:scale-105 hover:border-[#B79D6B] hover:bg-[#B79D6B]/5"
                onClick={() => navigate("/dashboard/legacy-vault")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LegacyIcon className="h-5 w-5" style={{ color: "#B79D6B" }} />
                    Legacy
                  </CardTitle>
                  <CardDescription>
                    Preserve your memories and stories for future generations
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card
                className="cursor-pointer bg-[#7C9885]/10 hover:shadow-lg transition-all duration-300 hover:scale-105 hover:border-[#7C9885] hover:bg-[#7C9885]/5"
                onClick={() => navigate("/dashboard/idea-vault")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IdeaIcon className="h-5 w-5" style={{ color: "#7C9885" }} />
                    Ideas
                  </CardTitle>
                  <CardDescription>Document, refine, and fund your ideas</CardDescription>
                </CardHeader>
              </Card>

              {/* SHOW mentorship quick action to BOTH mentor & mentee on paid plans */}
              {limits.mentorship !== "none" && (
                <Card
                  className="cursor-pointer bg-[#6E4C84]/10 hover:shadow-lg transition-all duration-300 hover:scale-105 hover:border-[#6E4C84] hover:bg-[#6E4C84]/5"
                  onClick={() => navigate("/dashboard/mentorship")}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MentorshipIcon className="h-5 w-5" style={{ color: "#6E4C84" }} />
                      Mentorship
                    </CardTitle>
                    <CardDescription>Learn, follow mentors, and share</CardDescription>
                  </CardHeader>
                </Card>
              )}

              <Card
                className="cursor-pointer bg-[#4C6B8A]/10 hover:shadow-lg transition-all duration-300 hover:scale-105 hover:border-[#4C6B8A] hover:bg-[#4C6B8A]/5"
                onClick={() => navigate("/dashboard/timeless-messages")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TimelessMessageIcon className="h-5 w-5" style={{ color: "#4C6B8A" }} />
                    Timeless Messages
                  </CardTitle>
                  <CardDescription>Schedule messages for the future</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </DashboardAnimatedBackground>
  );
};

export default DashboardHome;
