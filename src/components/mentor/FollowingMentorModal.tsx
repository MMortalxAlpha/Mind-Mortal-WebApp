import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const fetchFollowingMentors = async (userId: string) => {
  const { data: mentorMentee } = await supabase
    .from("mentor_mentee_matches")
    .select("*")
    .eq("mentee_id", userId)
    .eq("status", true);

  const { data: mentorProfiles } = await supabase
    .from("mentor_profiles")
    .select(`*`)
    .neq("id", userId)
    .order("created_at", { ascending: false });

  const ids = mentorProfiles.map((m) => m.id);

  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select(`id, username, avatar_url, full_name`)
    .in("id", ids);

  if (profileError) {
    console.error("Error fetching profiles:", profileError);
    return [];
  }

  const merged = mentorProfiles.map((mentor) => ({
    ...mentor,
    profile: profiles.find((p) => p.id === mentor.id),
  }));

  const matchedMentors = merged.filter((mentor) =>
    mentorMentee.some((match) => match.mentor_id === mentor.id)
  );

  return matchedMentors;
};

export default function FollowingMentorModal({
  onUnfollowMentor,
}: {
  onUnfollowMentor: () => void;
}) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: mentors, isFetching } = useQuery({
    queryKey: ["followingMentors"],
    queryFn: () => fetchFollowingMentors(user.id),
  });

  const handleUnfollowMentor = async (mentorId: string) => {
    const { data } = await supabase
      .from("mentor_mentee_matches")
      .select("*")
      .eq("mentor_id", mentorId)
      .eq("mentee_id", user?.id)
      .single();

    if (data) {
      // Already following this mentor
      await supabase
        .from("mentor_mentee_matches")
        .update({ status: false })
        .eq("id", data.id);
      queryClient.invalidateQueries({ queryKey: ["followingMentors"] });
      queryClient.invalidateQueries({ queryKey: ["mentorProfiles"] });
      onUnfollowMentor();
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-[#6E4C84]/60 hover:bg-[#6E4C84]/50"
        >
          Following Mentors
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Following Mentors</DialogTitle>
          <DialogDescription>Manage your following mentors</DialogDescription>
        </DialogHeader>
        <div>
          {isFetching ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : mentors && mentors.length > 0 ? (
            mentors.map((mentor) => (
              <Card key={mentor.id} className="p-3 mb-2">
                <div className="flex justify-between items-center">
                  <div className="flex gap-4">
                    <Avatar>
                      <AvatarImage
                        src={mentor.profile.avatar_url || ""}
                        alt={mentor.profile.full_name}
                      />
                      <AvatarFallback>
                        <UserIcon className="size-6 text-muted-foreground" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p>{mentor.profile.full_name}</p>
                      <p className="text-muted-foreground mt-2 text-xs">
                        {mentor.expertise.join(", ")}
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
                    onClick={() => handleUnfollowMentor(mentor.id)}
                  >
                    Unfollow
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <p>No mentors available</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
