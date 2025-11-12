import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { XCircle, PlusCircle, Lightbulb, Eye, EyeOff } from "lucide-react";

interface IdeaFormState {
  title: string;
  description: string;
  content: string;
  tags: string[];
  isPublic: boolean;
}

const EditIdeaPost = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [currentTag, setCurrentTag] = useState("");
  const [formState, setFormState] = useState<IdeaFormState>({
    title: "",
    description: "",
    content: "",
    tags: [],
    isPublic: true,
  });

  // Fetch idea post data on mount
  useEffect(() => {
    const fetchIdea = async () => {
      if (!id) return;
      setIsLoading(true);
      setFetchError(null);
      const { data, error } = await supabase
        .from("idea_posts")
        .select("*")
        .eq("id", id)
        .single();
      if (error || !data) {
        setFetchError("Failed to load idea post.");
        setIsLoading(false);
        return;
      }
      setFormState({
        title: data.title || "",
        description: data.description || "",
        content: data.content || "",
        tags: data.tags || [],
        isPublic: data.is_public ?? true,
      });
      setIsLoading(false);
    };
    fetchIdea();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTag = () => {
    if (currentTag && !formState.tags.includes(currentTag)) {
      setFormState((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag],
      }));
      setCurrentTag("");
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormState((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleToggleVisibility = () => {
    setFormState((prev) => ({ ...prev, isPublic: !prev.isPublic }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be signed in to edit ideas.",
        variant: "destructive",
      });
      return;
    }

    if (!formState.title || !formState.description) {
      toast({
        title: "Missing Information",
        description: "Please provide a title and description for your idea.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("idea_posts")
        .update({
          title: formState.title,
          description: formState.description,
          content: formState.content,
          tags: formState.tags,
          is_public: formState.isPublic,
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Idea Updated",
        description: "Your idea has been updated successfully!",
      });

      navigate("/dashboard/idea-vault");
    } catch (error: any) {
      console.error("Error updating idea:", error);
      toast({
        title: "Update Failed",
        description:
          error.message || "Failed to update your idea. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto pb-8 flex justify-center items-center h-96">
        <span className="text-muted-foreground">Loading idea post...</span>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="container mx-auto pb-8 flex justify-center items-center h-96">
        <span className="text-destructive">{fetchError}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto pb-8">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Edit Idea</h1>
      </div>
      <p className="text-muted-foreground mb-6">
        Update your innovative idea and share your improvements with the world.
      </p>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Edit Idea Details</CardTitle>
          </CardHeader>
          <CardContent className="xs:p-2 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="Give your idea a clear, catchy title"
                value={formState.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Short Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Provide a brief summary of your idea (1-2 sentences)"
                value={formState.description}
                onChange={handleChange}
                required
                className="h-20"
              />
            </div>

            <div className="space-y-2">
              <Label>Detailed Explanation</Label>
              <Textarea
                id="content"
                name="content"
                placeholder="Describe your idea in detail. What problem does it solve? How does it work?"
                value={formState.content}
                onChange={handleChange}
                className="min-h-[300px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  placeholder="Add tags (e.g., tech, business, education)"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>

              {formState.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formState.tags.map((tag) => (
                    <Badge key={tag} className="flex items-center gap-1">
                      {tag}
                      <XCircle
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="visibility"
                checked={formState.isPublic}
                onCheckedChange={handleToggleVisibility}
              />
              <div className="flex flex-col gap-1">
                <Label htmlFor="visibility" className="flex items-center gap-2">
                  {formState.isPublic ? (
                    <>
                      <Eye className="h-4 w-4" />
                      Public
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4" />
                      Private
                    </>
                  )}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {formState.isPublic
                    ? "Your idea will be visible to everyone"
                    : "Your idea will be visible only to you"}
                </p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between xs:flex-col xs:items-start xs:gap-2 xs:p-2">
            <Button
              className="xs:w-full"
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard/idea-vault")}
            >
              Cancel
            </Button>
            <Button className="xs:w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default EditIdeaPost;
