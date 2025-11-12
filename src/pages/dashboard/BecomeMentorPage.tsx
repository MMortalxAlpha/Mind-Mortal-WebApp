import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import DashboardAnimatedBackground from "@/components/dashboard/DashboardAnimatedBackground";

const BecomeMentorPage: React.FC = () => {
  const [expertise, setExpertise] = useState<string[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [experienceYears, setExperienceYears] = useState<number>(0);
  const [monthlyAvailability, setMonthlyAvailability] = useState<number>(0);
  const [newExpertise, setNewExpertise] = useState("");
  const [newIndustry, setNewIndustry] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const addExpertise = () => {
    if (newExpertise.trim() && !expertise.includes(newExpertise.trim())) {
      setExpertise([...expertise, newExpertise.trim()]);
      setNewExpertise("");
    }
  };

  const removeExpertise = (item: string) => {
    setExpertise(expertise.filter((e) => e !== item));
  };

  const addIndustry = () => {
    if (newIndustry.trim() && !industries.includes(newIndustry.trim())) {
      setIndustries([...industries, newIndustry.trim()]);
      setNewIndustry("");
    }
  };

  const removeIndustry = (item: string) => {
    setIndustries(industries.filter((i) => i !== item));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to submit your mentor application.",
        variant: "destructive",
      });
      return;
    }

    if (expertise.length === 0 || industries.length === 0) {
      toast({
        title: "Missing information",
        description: "Please add at least one area of expertise and industry.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.rpc(
        "request_mentor_verification",
        {
          expertise,
          industries,
          experience_years: experienceYears,
          monthly_availability: monthlyAvailability,
        }
      );

      if (error) throw error;

      await refreshProfile();

      toast({
        title: "Application submitted!",
        description:
          "Your mentor application has been submitted for review. You'll be notified once it's processed.",
      });

      navigate("/dashboard/mentorship");
    } catch (error: any) {
      console.error("Error submitting mentor application:", error);
      toast({
        title: "Submission failed",
        description:
          error.message ||
          "Failed to submit your mentor application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardAnimatedBackground>
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mt-2">
            <CardHeader>
              <CardTitle className="text-3xl">Become a Mentor</CardTitle>
              <CardDescription>
                Share your knowledge and experience with the next generation.
                Fill out this application to become a verified mentor.
              </CardDescription>
            </CardHeader>
            <CardContent className="xs:p-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Experience Years */}
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    type="number"
                    min="0"
                    value={experienceYears}
                    onChange={(e) =>
                      setExperienceYears(parseInt(e.target.value) || 0)
                    }
                    placeholder="e.g., 10"
                    required
                  />
                </div>

                {/* Monthly Availability */}
                <div className="space-y-2">
                  <Label htmlFor="availability">
                    Monthly Availability (hours)
                  </Label>
                  <Input
                    id="availability"
                    type="number"
                    min="0"
                    value={monthlyAvailability}
                    onChange={(e) =>
                      setMonthlyAvailability(parseInt(e.target.value) || 0)
                    }
                    placeholder="e.g., 20"
                    required
                  />
                </div>

                {/* Areas of Expertise */}
                <div className="space-y-2">
                  <Label>Areas of Expertise</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newExpertise}
                      onChange={(e) => setNewExpertise(e.target.value)}
                      placeholder="e.g., Leadership, Product Management"
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), addExpertise())
                      }
                    />
                    <Button type="button" onClick={addExpertise} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {expertise.map((item, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() => removeExpertise(item)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Industries */}
                <div className="space-y-2">
                  <Label>Industries</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newIndustry}
                      onChange={(e) => setNewIndustry(e.target.value)}
                      placeholder="e.g., Technology, Healthcare"
                      onKeyPress={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addIndustry())
                      }
                    />
                    <Button type="button" onClick={addIndustry} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {industries.map((item, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() => removeIndustry(item)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-6 xs:flex-col xs:items-start xs:gap-2">
                  <Button
                    className="xs:w-full"
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/dashboard/mentorship")}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="xs:w-full"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardAnimatedBackground>
  );
};

export default BecomeMentorPage;
