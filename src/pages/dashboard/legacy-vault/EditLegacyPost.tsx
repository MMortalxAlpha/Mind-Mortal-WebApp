import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Calendar as ImagePlus, X } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Archive } from "lucide-react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { usePlanGate } from '@/hooks/usePlanGate';


const STORAGE_KEY = "legacy_vault_form_data";

const legacyVaultSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters long" }),
  content: z
    .string()
    .min(10, { message: "Content must be at least 10 characters long" }),
  category: z
    .string()
    .min(1, { message: "Please select at least one category" }),
  releaseDate: z.date().optional(),
});

type LegacyVaultFormValues = z.infer<typeof legacyVaultSchema>;

const fetchLegacyPostById = async (id: string) => {
  const { data, error } = await supabase
    .from("legacy_posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
};

export default function EditLegacyPost() {
  const queryClient = useQueryClient();
  const { id } = useParams();
  const { data: post } = useSuspenseQuery({
    queryFn: () => fetchLegacyPostById(id),
    queryKey: ["legacy_post", id],
  });

  console.log(post);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreview, setMediaPreview] = useState<string[]>(
    post?.media_urls ?? []
  );

  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const form = useForm<LegacyVaultFormValues>({
    resolver: zodResolver(legacyVaultSchema),
    values: {
      title: post?.title ?? "",
      category: post?.categories.join(", ") ?? "",
      content: post?.content ?? "",
      releaseDate: post?.release_date ? new Date(post.release_date) : undefined,
    },
  });

  const onSubmit = async (values: LegacyVaultFormValues) => {
    try {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "You need to be logged in to create content.",
          variant: "destructive",
        });
        return;
      }

      // Upload media files if any (no caching for files)
      const mediaUrls: string[] =
        mediaPreview.length > 0
          ? mediaPreview.filter((url) => post.media_urls.includes(url))
          : [];
      if (mediaFiles.length > 0) {
        for (const file of mediaFiles) {
          const fileExt = file.name.split(".").pop();
          const fileName = `${Math.random()
            .toString(36)
            .substring(2, 15)}.${fileExt}`;
          const filePath = `${user.id}/${fileName}`;

          const { data: uploadData, error: uploadError } =
            await supabase.storage.from("content_media").upload(filePath, file);
          if (uploadError) throw uploadError;

          const {
            data: { publicUrl },
          } = supabase.storage.from("content_media").getPublicUrl(filePath);
          mediaUrls.push(publicUrl);
        }
      }

      console.log("Media URLs:", mediaUrls);

      let legacyPost = {
        title: values.title,
        content: values.content,
        categories: [values.category],
        release_date:
          post.subcategory === "time-capsule"
            ? values.releaseDate.toISOString()
            : null,
        visibility: "public",
        user_id: user.id,
        media_urls: mediaUrls,
      };

      const { error } = await supabase
        .from("legacy_posts")
        .update(legacyPost)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Legacy post updated",
        description: "Your legacy post has been updated successfully.",
      });

      // Clear local storage cache on success
      localStorage.removeItem(STORAGE_KEY);

      form.reset();
      setMediaFiles([]);
      setMediaPreview([]);
      queryClient.invalidateQueries({ queryKey: ["legacy_post", id] });
      navigate("/dashboard/legacy-vault");
    } catch (error) {
      console.error("Error creating legacy post:", error);
      toast({
        title: "Error",
        description: "There was an error creating your legacy post.",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Limit to 5 files
    if (mediaFiles.length + files.length > 5) {
      toast({
        title: "Too many files",
        description: "You can upload a maximum of 5 files per post.",
        variant: "destructive",
      });
      return;
    }

    // Create preview URLs
    const newPreviews = files.map((file) => URL.createObjectURL(file));

    setMediaFiles((prev) => [...prev, ...files]);
    setMediaPreview((prev) => [...prev, ...newPreviews]);
  };

  const removeMedia = (index: number) => {
    // Release object URL to prevent memory leaks
    URL.revokeObjectURL(mediaPreview[index]);

    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setMediaPreview((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCancel = () => {
    form.reset();
    setMediaFiles([]);
    setMediaPreview([]);
    navigate("/dashboard/legacy-vault");
  };

  return (
    <div>
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center gap-2 mb-2">
            <Archive className="h-6 w-6 text-primary" />
            <CardTitle>Edit Legacy Post</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="xs:p-0 pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter a title for your post"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="E.g., Technology, Life, Nature, Books"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {post.subcategory === "time-capsule" && (
                <FormField
                  control={form.control}
                  name="releaseDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Release Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Media Upload Section */}
              <div className="space-y-2">
                <FormLabel>Media (optional)</FormLabel>
                <div className="flex flex-wrap gap-2 mb-4">
                  {mediaPreview.map((url, index) => (
                    <div
                      key={index}
                      className="relative w-24 h-24 bg-muted rounded-md overflow-hidden"
                    >
                      <img
                        src={url}
                        alt={`Preview ${index}`}
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 w-6 h-6 rounded-full p-0"
                        onClick={() => removeMedia(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {mediaFiles.length < 5 && (
                    <label className="flex items-center justify-center w-24 h-24 bg-muted rounded-md border border-dashed border-muted-foreground/50 cursor-pointer hover:bg-muted/80 transition-colors xs:m-auto">
                      <div className="flex flex-col items-center gap-1">
                        <ImagePlus className="h-8 w-8 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Add Media
                        </span>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,video/*"
                        onChange={handleFileChange}
                        multiple
                      />
                    </label>
                  )}
                </div>
                {mediaFiles.length > 0 && (
                  <div className="flex gap-2">
                    {mediaFiles.map((file, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {file.name.slice(0, 15)}
                        {file.name.length > 15 ? "..." : ""}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share your legacy..."
                        className="min-h-[200px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* TODO: Add visibility toggle; Kept for future reference */}
              {/* <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visibility</FormLabel>
                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant={field.value === "public" ? "default" : "outline"}
                      onClick={() => field.onChange("public")}
                    >
                      Public
                    </Button>
                    <Button
                      type="button"
                      variant={field.value === "draft" ? "default" : "outline"}
                      onClick={() => field.onChange("draft")}
                    >
                      Draft
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

              {/* <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visibility</FormLabel>
                  <div className="flex items-center space-x-4">
                    <Switch
                      id="visibility"
                      checked={field.value == "public"}
                      onCheckedChange={() =>
                        field.value == "public"
                          ? field.onChange("private")
                          : field.onChange("public")
                      }
                    />
                    <div className="flex flex-col gap-1">
                      <Label
                        htmlFor="visibility"
                        className="flex items-center gap-2"
                      >
                        {field.value == "public" ? (
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

                  <FormMessage />
                </FormItem>
              )}
            /> */}

              <div className="flex justify-end space-x-4 xs:space-x-0 xs:flex-col xs:items-start xs:gap-2">
                <Button
                  className="xs:w-full"
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button className="xs:w-full" type="submit">
                  Save
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
