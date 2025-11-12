// src/components/content/LegacyVaultForm.tsx
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ImagePlus, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { usePlanGate } from "@/hooks/usePlanGate";

const STORAGE_KEY = "legacy_vault_form_data";
const BUCKET = "content_media";

const legacyVaultSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long" }),
  content: z.string().min(10, { message: "Content must be at least 10 characters long" }),
  category: z.string().min(1, { message: "Please select at least one category" }),
  subcategory: z.enum(["public-gallery", "time-capsule"]),
  releaseDate: z.date().optional(),
});

type LegacyVaultFormValues = z.infer<typeof legacyVaultSchema>;

function randomName(ext: string) {
  const id = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
  return `${id}.${ext}`;
}

export default function LegacyVaultForm() {
  const [activeTab, setActiveTab] = useState<string>("public-gallery");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreview, setMediaPreview] = useState<string[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { requireCapacity } = usePlanGate();

  const cachedData = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
  const initialFormValues = cachedData ? JSON.parse(cachedData) : null;

  const form = useForm<LegacyVaultFormValues>({
    resolver: zodResolver(legacyVaultSchema),
    defaultValues: {
      title: initialFormValues?.title ?? "",
      content: initialFormValues?.content ?? "",
      category: initialFormValues?.category ?? "",
      subcategory: initialFormValues?.subcategory ?? "public-gallery",
      releaseDate: initialFormValues?.releaseDate ? new Date(initialFormValues.releaseDate) : undefined,
    },
  });

  useEffect(() => {
    if (initialFormValues?.subcategory) setActiveTab(initialFormValues.subcategory);
  }, [initialFormValues]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      const dataToCache = {
        ...value,
        releaseDate: value.releaseDate ? value.releaseDate.toISOString() : null,
        subcategory: activeTab,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToCache));
    });
    return () => subscription.unsubscribe();
  }, [form, activeTab]);

  const onSubmit = async (values: LegacyVaultFormValues) => {
    try {
      if (!user) {
        toast({ title: "Authentication required", description: "You need to be logged in to create content.", variant: "destructive" });
        return;
      }
      const gate = requireCapacity("legacy");
      if (!gate.ok) return;

      // 1) Upload media (folder prefix = user.id/legacy)
      const mediaUrls: string[] = [];
      if (mediaFiles.length > 0) {
        for (const file of mediaFiles) {
          const ext = (file.name.split(".").pop() || "bin").toLowerCase();
          const fileName = randomName(ext);
          const filePath = `${user.id}/legacy/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from(BUCKET)
            .upload(filePath, file, { contentType: file.type || undefined });

          if (uploadError) {
            console.error("Upload error:", uploadError);
            throw new Error(uploadError.message || "Upload failed");
          }

          const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
          mediaUrls.push(pub.publicUrl);
        }
      }

      // 2) Insert post
      const legacyPost: any = {
        title: values.title,
        content: values.content,
        categories: [values.category],
        visibility: "public",
        subcategory: values.subcategory,
        user_id: user.id,
        media_urls: mediaUrls,
        is_time_capsule: values.subcategory === "time-capsule",
      };

      if (values.subcategory === "time-capsule" && values.releaseDate) {
        legacyPost.release_date = values.releaseDate.toISOString();
      }

      const { error } = await supabase.from("legacy_posts").insert(legacyPost);
      if (error) throw error;

      toast({ title: "Legacy post created", description: "Your legacy post has been created successfully." });

      localStorage.removeItem(STORAGE_KEY);
      form.reset();
      setMediaFiles([]);
      setMediaPreview([]);
      navigate("/dashboard/legacy-vault");
    } catch (err: any) {
      console.error("Error creating legacy post:", err);
      toast({
        title: "Upload failed",
        description: err?.message || "There was an error creating your legacy post.",
        variant: "destructive",
      });
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    form.setValue("subcategory", value as any);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (mediaFiles.length + files.length > 5) {
      toast({ title: "Too many files", description: "You can upload a maximum of 5 files per post.", variant: "destructive" });
      return;
    }

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setMediaFiles((prev) => [...prev, ...files]);
    setMediaPreview((prev) => [...prev, ...newPreviews]);
  };

  const removeMedia = (index: number) => {
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
    <div className="w-full p-6 xs:p-2 sm:p-4">
      <h2 className="text-2xl font-bold mb-6">Create Legacy Post</h2>

      <Tabs defaultValue="public-gallery" onValueChange={handleTabChange}>
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="public-gallery">Gallery</TabsTrigger>
          <TabsTrigger value="time-capsule">Time Capsule</TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl><Input placeholder="Enter a title for your post" {...field} /></FormControl>
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
                  <FormControl><Input placeholder="E.g., Technology, Life, Nature, Books" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <TabsContent value="time-capsule">
              <FormField
                control={form.control}
                name="releaseDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Release Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            {/* Media Upload */}
            <div className="space-y-2">
              <FormLabel>Media (optional)</FormLabel>
              <div className="flex flex-wrap gap-2 mb-4">
                {mediaPreview.map((url, index) => (
                  <div key={index} className="relative w-24 h-24 bg-muted rounded-md overflow-hidden">
                    <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
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
                      <span className="text-xs text-muted-foreground">Add Media</span>
                    </div>
                    <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileChange} multiple />
                  </label>
                )}
              </div>
              {mediaFiles.length > 0 && (
                <div className="flex gap-2">
                  {mediaFiles.map((file, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {file.name.slice(0, 15)}{file.name.length > 15 ? "..." : ""}
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
                  <FormControl><Textarea placeholder="Share your legacy..." className="min-h-[200px] resize-y" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4 xs:space-x-0 xs:flex-col xs:items-start xs:gap-2">
              <Button className="xs:w-full" type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
              <Button className="xs:w-full" type="submit">Publish</Button>
            </div>
          </form>
        </Form>
      </Tabs>
    </div>
  );
}
