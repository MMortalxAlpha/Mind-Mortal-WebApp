import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users, Plus, BookOpen, Star, Award, UserIcon, EyeOff, MoreVertical,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import PostInteractions from "@/components/social/PostInteractions";
import PostDetailsModal from "@/components/modals/PostDetailsModal";
import { Badge } from "@/components/ui/badge";
import DashboardAnimatedBackground from "@/components/dashboard/DashboardAnimatedBackground";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import FollowingMentorModal from "@/components/mentor/FollowingMentorModal";
import { usePlanGate } from "@/hooks/usePlanGate";
import UnauthorizedPage from "@/pages/UnauthorizedPage";

const fetchMentorsWithProfile = async (userId: string) => {
  const { data: mentorMentee = [] } = await supabase
    .from("mentor_mentee_matches")
    .select("*")
    .eq("mentee_id", userId)
    .eq("status", true);

  const { data: mentorProfiles = [] } = await supabase
    .from("mentor_profiles")
    .select(`*`)
    .neq("id", userId)
    .order("created_at", { ascending: false });

  const ids = mentorProfiles.map((m) => m.id);
  if (!ids.length) return [];

  const { data: profiles = [] } = await supabase
    .from("profiles")
    .select(`id, username, avatar_url, full_name`)
    .in("id", ids);

  const merged = mentorProfiles.map((mentor) => ({
    ...mentor,
    profile: profiles.find((p) => p.id === mentor.id),
  }));

  const unMatchedMentors = merged.filter(
    (mentor) => !mentorMentee.some((match) => match.mentor_id === mentor.id)
  );

  return unMatchedMentors;
};

const fetchMyResources = async (userId: string) => {
  const { data = [] } = await supabase
    .from("wisdom_resources")
    .select("*")
    .eq("created_by", userId)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });
  return data;
};

const MentorshipPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { user, roles } = useAuth();
  const navigate = useNavigate();

  // --- plan gate (no early returns) ---
  const { limits, planId } = usePlanGate();
  const canViewMentorship = limits.mentorship !== "none";
  const isMentorPlan = limits.mentorship === "mentor_mentee";
  const isMentorUser = roles.includes("mentor");
  // ------------------------------------

  useEffect(() => {
    if (!user || !canViewMentorship) return;
    (async () => {
      try {
        const { data: mentorMentees = [] } = await supabase
          .from("mentor_mentee_matches")
          .select("*")
          .eq("mentee_id", user.id)
          .eq("status", true);

        const mentorIds = mentorMentees.map((m) => m.mentor_id);
        if (!mentorIds.length) {
          setResources([]);
          setLoading(false);
          return;
        }

        const { data: mentorsProfile = [] } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", mentorIds);

        setLoading(true);
        const { data = [], error } = await supabase
          .from("wisdom_resources")
          .select("*")
          .eq("is_public", true)
          .in("created_by", mentorIds)
          .order("created_at", { ascending: false });

        if (error) console.error("Error fetching resources:", error);

        const resourcesWithMentorInfo = (data || []).map((resource) => {
          const mentorProfile = mentorsProfile.find(
            (p) => p.id === resource.created_by
          );
          return { ...resource, mentor: mentorProfile?.full_name ?? "Mentor" };
        });

        setResources(resourcesWithMentorInfo);
      } catch (err) {
        console.error("Error in fetch operation:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id, canViewMentorship]);

  const handleResourceDelete = async (resourceId: string) => {
    await supabase
      .from("wisdom_resources")
      .update({ is_deleted: true })
      .eq("id", resourceId);
    queryClient.invalidateQueries({ queryKey: ["myResources", user?.id] });
  };

  // Queries are defined unconditionally; execution is gated by `enabled`
  const { data: myResources = [], isFetching: isMyResourcesFetching } = useQuery({
    queryKey: ["myResources", user?.id],
    queryFn: () => fetchMyResources(user!.id),
    enabled: !!user && canViewMentorship && isMentorPlan && isMentorUser,
  });

  const { data: mentors = [], isFetching } = useQuery({
    queryKey: ["mentorProfiles", user?.id],
    queryFn: () => fetchMentorsWithProfile(user!.id),
    enabled: !!user && canViewMentorship,
  });

  const handleCreateResource = () => navigate("/dashboard/mentorship/create");
  const handleBecomeMentor = () => navigate("/dashboard/become-mentor");
  const handleViewDetails = (resource: any) => {
    setSelectedResource(resource);
    setIsModalOpen(true);
  };

  const containerVariants = useMemo(
    () => ({
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    }),
    []
  );
  const itemVariants = useMemo(
    () => ({
      hidden: { y: 20, opacity: 0 },
      visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 10 } },
    }),
    []
  );

  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case "article": return <BookOpen className="h-5 w-5 text-blue-500" />;
      case "video":   return <Users className="h-5 w-5 text-green-500" />;
      case "course":  return <Award className="h-5 w-5 text-purple-500" />;
      default:        return <BookOpen className="h-5 w-5 text-primary" />;
    }
  };

  const handleFollowMentor = async (mentorId: string) => {
    if (!user) return;
    const { data } = await supabase
      .from("mentor_mentee_matches")
      .select("*")
      .eq("mentor_id", mentorId)
      .eq("mentee_id", user.id)
      .maybeSingle();

    if (data) {
      await supabase
        .from("mentor_mentee_matches")
        .update({ status: !data.status })
        .eq("id", data.id);
    } else {
      await supabase.from("mentor_mentee_matches").insert({
        mentor_id: mentorId,
        mentee_id: user.id,
        status: true,
        match_score: 0,
      });
    }
    queryClient.invalidateQueries({ queryKey: ["mentorProfiles", user.id] });
  };

  const onUnfollowMentor = () => {
    if (user) queryClient.invalidateQueries({ queryKey: ["mentorProfiles", user.id] });
  };

  return (
    <DashboardAnimatedBackground objectCount={6}>
      {/* Render the unauthorized view AFTER hooks have run */}
      {!canViewMentorship ? (
        <UnauthorizedPage />
      ) : (
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-between items-center xs:flex-col xs:items-start xs:p-2 xs:gap-2">
              <div>
                <h1 className="text-3xl font-bold">Mentorship</h1>
                <p className="text-muted-foreground mt-2">
                  Share your knowledge and learn from others in the community
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  plan: <b>{planId}</b>
                </p>
              </div>

              {isMentorPlan && isMentorUser ? (
                <Button
                  className="flex bg-[#6E4C84] hover:bg-[#6E4C84]/80 items-center gap-2"
                  onClick={handleCreateResource}
                >
                  <Plus className="h-4 w-4" />
                  Create Resource
                </Button>
              ) : (
                <Button
                  className="flex bg-[#6E4C84] hover:bg-[#6E4C84]/90 items-center gap-2"
                  onClick={handleBecomeMentor}
                >
                  <Users className="h-4 w-4" />
                  Become a Mentor
                </Button>
              )}
            </div>
          </motion.div>

          <Tabs defaultValue="my_resources">
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
              <TabsList>
                {isMentorPlan && isMentorUser && (
                  <TabsTrigger value="my_resources">My Resources</TabsTrigger>
                )}
                <TabsTrigger value="wisdom_resources">Mentor Resources</TabsTrigger>
                <TabsTrigger value="mentorship">Mentors</TabsTrigger>
              </TabsList>
              <FollowingMentorModal onUnfollowMentor={onUnfollowMentor} />
            </div>

            {/* My resources (mentor only) */}
            {isMentorPlan && isMentorUser && (
              <TabsContent value="my_resources">
                {isMyResourcesFetching ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 gap-6"
                  >
                    {myResources.map((resource: any) => (
                      <motion.div
                        key={resource.id}
                        variants={itemVariants}
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Card className="hover:shadow-lg hover:bg-[#6E4C84]/10 hover:border-[#6E4C84] transition-all duration-300">
                          <CardHeader className="relative">
                            <div className="absolute top-2 right-2 z-10">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 p-0 hover:bg-[#6E4C84]/50"
                                  >
                                    <MoreVertical className="h-5 w-5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild className="focus:bg-[#6E4C84]/30">
                                    <Link to={`/dashboard/mentorship/edit/${resource.id}`}>Edit</Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleResourceDelete(resource.id)}
                                    className="text-destructive focus:bg-destructive/80"
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <CardTitle className="flex items-center gap-2">
                              {getResourceTypeIcon(resource.resource_type)}
                              {resource.title}
                              {resource.is_featured && (
                                <Badge variant="secondary" className="ml-2">
                                  <Star className="h-3 w-3 mr-1" />
                                  Featured
                                </Badge>
                              )}
                              {resource.approved && (
                                <Badge variant="default" className="ml-2">Approved</Badge>
                              )}
                              {!resource.is_public && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                  <EyeOff className="h-3 w-3 mr-1" /> Private
                                </Badge>
                              )}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-4">
                              <span className="text-xs text-muted-foreground">
                                Created on {new Date(resource.created_at).toLocaleDateString()}
                              </span>
                              <Badge variant="outline">{resource.resource_type}</Badge>
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            {resource.description && (
                              <p className="text-muted-foreground mb-3">{resource.description}</p>
                            )}
                            {resource.tags && resource.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {resource.tags.map((t: string, i: number) => (
                                  <Badge key={i} variant="outline">{t}</Badge>
                                ))}
                              </div>
                            )}
                            <div className="flex justify-between items-center">
                              <PostInteractions
                              postId={resource.id}
                              postType="wisdom_resource"
                              onUpdate={() => {}}
                            />
                              <div className="flex justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-[#6E4C84] text-white hover:bg-[#6E4C84]/50"
                                  onClick={() => handleViewDetails(resource)}
                                >
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                            
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
                <PostDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                post={selectedResource}
                postType="wisdom_resource"
                onUpdate={() => {}}
              />
              </TabsContent>
            )}

            {/* Public mentor resources */}
            <TabsContent value="wisdom_resources">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 gap-6"
                >
                  {resources.map((resource) => (
                    <motion.div key={resource.id} variants={itemVariants} whileHover={{ scale: 1.01 }}>
                      <Card className="hover:shadow-lg transition-all duration-300 hover:bg-[#6E4C84]/10 hover:border-[#6E4C84]">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            {getResourceTypeIcon(resource.resource_type)}
                            {resource.title}
                            {resource.is_featured && (
                              <Badge variant="secondary" className="ml-2">
                                <Star className="h-3 w-3 mr-1" /> Featured
                              </Badge>
                            )}
                            {resource.approved && <Badge variant="default" className="ml-2">Approved</Badge>}
                          </CardTitle>
                          <CardDescription className="flex flex-col gap-2 md:flex-row">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                Created on {new Date(resource.created_at).toLocaleDateString()}
                              </span>
                              <span className="text-xs text-muted-foreground">by {resource.mentor}</span>
                            </div>
                            <Badge variant="outline" className="w-fit">
                              {resource.resource_type}
                            </Badge>
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {resource.description && (
                            <p className="text-muted-foreground mb-3">{resource.description}</p>
                          )}
                          {resource.tags && resource.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {resource.tags.map((tag: string, index: number) => (
                                <Badge key={index} variant="outline">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                          <div className="flex justify-between items-center">
                            <PostInteractions
                              postId={resource.id}
                              postType="wisdom_resource"
                              onUpdate={() => {}}
                            />
                            <div className="flex justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-[#6E4C84] text-white hover:bg-[#6E4C84]/50"
                                onClick={() => handleViewDetails(resource)}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}

                  {resources.length === 0 && (
                    <motion.div variants={itemVariants}>
                      <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                          <Users className="h-12 w-12 mb-4 text-muted-foreground" />
                          <h3 className="text-xl font-medium mb-2">No resources yet</h3>
                          <p className="text-muted-foreground mb-6 text-center max-w-md">
                            Start sharing your knowledge and experience with the community
                          </p>
                          {isMentorPlan && isMentorUser ? (
                            <Button onClick={handleCreateResource} className="bg-[#6E4C84] hover:bg-[#6E4C84]/90">
                              <Plus className="h-4 w-4 mr-2" /> Share Your First Resource
                            </Button>
                          ) : (
                            <Button onClick={handleBecomeMentor} className="bg-[#6E4C84] hover:bg-[#6E4C84]/90">
                              <Users className="h-4 w-4 mr-2" /> Become a Mentor
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </motion.div>
              )}

              <PostDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                post={selectedResource}
                postType="wisdom_resource"
                onUpdate={() => {}}
              />
            </TabsContent>

            {/* Mentors list */}
            <TabsContent value="mentorship">
              {isFetching ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : mentors && mentors.length > 0 ? (
                mentors.map((mentor: any) => (
                  <Card key={mentor.id} className="mb-4 p-5 hover:bg-[#6E4C84]/10">
                    <div className="flex justify-between items-center">
                      <div className="flex gap-4">
                        <Avatar>
                          <AvatarImage
                            src={mentor.profile?.avatar_url || ""}
                            alt={mentor.profile?.full_name || "Mentor"}
                          />
                          <AvatarFallback>
                            <UserIcon className="size-6 text-muted-foreground" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p>{mentor.profile?.full_name ?? "Mentor"}</p>
                          <p className="text-muted-foreground mt-2 text-xs">
                            {(mentor.expertise || []).join(", ")}
                          </p>
                          <p className="text-xs">
                            {mentor.experience_years} years of experience
                          </p>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-[#6E4C84] text-white hover:bg-[#6E4C84]/50"
                        onClick={() => handleFollowMentor(mentor.id)}
                      >
                        Follow
                      </Button>
                    </div>
                  </Card>
                ))
              ) : (
                <p>No mentors available</p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </DashboardAnimatedBackground>
  );
};

export default MentorshipPage;
