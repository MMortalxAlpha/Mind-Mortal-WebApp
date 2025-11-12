// src/pages/dashboard/mentorship/CreateWisdomResource.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, FileCheck, Eye, EyeOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { usePlanGate } from "@/hooks/usePlanGate";
import UnauthorizedPage from "@/pages/UnauthorizedPage";

const STORAGE_KEY = "create_wisdom_resource_form";

const CreateWisdomResource: React.FC = () => {
  // --- hooks MUST always be called, every render, in the same order ---
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { limits, loading } = usePlanGate();

  // form state hooks (declare BEFORE any early returns)
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [experience, setExperience] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // load cached draft
  useEffect(() => {
    const cached = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (!cached) return;
    try {
      const data = JSON.parse(cached);
      if (data.title) setTitle(data.title);
      if (data.category) setCategory(data.category);
      if (data.description) setDescription(data.description);
      if (data.experience) setExperience(data.experience);
      if (typeof data.isPublic === "boolean") setIsPublic(data.isPublic);
    } catch (e) {
      console.warn("Failed to parse cached wisdom resource form data", e);
    }
  }, []);

  // persist draft
  useEffect(() => {
    const payload = { title, category, description, experience, isPublic };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [title, category, description, experience, isPublic]);

  // --- after ALL hooks are declared, we can branch in render ---
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Only mentor-capable plans can access this page
  const isAllowed = limits.mentorship === "mentor_mentee";
  if (!isAllowed) {
    return <UnauthorizedPage />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be signed in to create a resource.",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim() || !category.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both a title and a category.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // server-side truth: ensure plan allows creating wisdom resources
      const { data: canCreate, error: canErr } = await supabase.rpc("can_create", {
        p_user: user.id,
        p_resource: "wisdom_resources",
      });
      if (canErr) {
        console.error("can_create RPC error:", canErr);
        toast({
          title: "Unable to verify limits",
          description: "Please try again shortly.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      if (!canCreate) {
        toast({
          title: "Not allowed",
          description: "Your current plan does not allow creating mentorship resources.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const { error: insertErr } = await supabase.from("wisdom_resources").insert({
        title: title.trim(),
        resource_type: category.trim(),
        description: description.trim() || null,
        created_by: user.id,
        is_public: isPublic,
        published_status: "draft",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        experience: experience.trim() || null,
      });
      if (insertErr) throw insertErr;

      toast({
        title: "Resource created",
        description: "Your mentorship resource has been created successfully.",
      });

      localStorage.removeItem(STORAGE_KEY);
      setTitle("");
      setCategory("");
      setDescription("");
      setExperience("");
      setIsPublic(true);

      navigate("/dashboard/mentorship");
    } catch (err: any) {
      console.error("Error inserting wisdom resource:", err);
      toast({
        title: "Failed to create resource",
        description: err?.message ?? "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard/mentorship")}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Create Mentorship Resource</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resource Information</CardTitle>
        </CardHeader>
        <CardContent className="xs:p-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter a title for your resource"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="E.g., Technology, Business, Arts"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this mentorship resource is about"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Your Experience</Label>
              <Textarea
                id="experience"
                placeholder="Share your experience in this area"
                rows={4}
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex items-center space-x-4">
              <Switch
                id="visibility"
                checked={isPublic}
                onCheckedChange={() => setIsPublic((v) => !v)}
              />
              <div className="flex flex-col gap-1">
                <Label htmlFor="visibility" className="flex items-center gap-2">
                  {isPublic ? (
                    <>
                      <Eye className="h-4 w-4" />
                      <span className="text-lg">Public</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4" />
                      <span className="text-lg">Private</span>
                    </>
                  )}
                </Label>
              </div>
            </div>

            <div className="pt-4 flex justify-end space-x-2 xs:space-x-0 xs:flex-col xs:items-start xs:gap-2">
              <Button
                className="xs:w-full"
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard/mentorship")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button className="xs:w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <FileCheck className="mr-2 h-4 w-4 animate-pulse" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Resource
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateWisdomResource;
