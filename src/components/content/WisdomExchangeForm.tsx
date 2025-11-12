
import React from 'react';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import RichTextEditor from "../editor/RichTextEditor";
import FileUpload from "../editor/FileUpload";

const wisdomSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters long" }),
  content: z.string().min(10, { message: "Content must be at least 10 characters long" }),
  tags: z.string().optional(),
  resource_type: z.string().min(1, { message: "Please select a resource type" }),
  resource_url: z.string().url().optional().or(z.literal("")),
});

type WisdomFormValues = z.infer<typeof wisdomSchema>;

const resourceTypes = [
  "Article", 
  "Video", 
  "Audio", 
  "Book", 
  "Course", 
  "Tutorial", 
  "Podcast",
  "Other"
];

const WisdomExchangeForm: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const form = useForm<WisdomFormValues>({
    resolver: zodResolver(wisdomSchema),
    defaultValues: {
      title: "",
      description: "",
      content: "<p>Share your wisdom here...</p>",
      tags: "",
      resource_type: "Article",
      resource_url: "",
    },
  });

  const onSubmit = async (values: WisdomFormValues) => {
    try {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "You need to be logged in to share wisdom.",
          variant: "destructive",
        });
        return;
      }

      // Prepare tags
      const tagsArray = values.tags 
        ? values.tags.split(",").map(tag => tag.trim()) 
        : [];

      // Prepare data for the database
      const wisdomResource = {
        title: values.title,
        description: values.description,
        resource_type: values.resource_type,
        resource_url: values.resource_url || null,
        tags: tagsArray,
        created_by: user.id,
        published_status: "draft",
      };

      const { error } = await supabase
        .from("wisdom_resources")
        .insert(wisdomResource);

      if (error) throw error;

      toast({
        title: "Wisdom shared",
        description: "Your wisdom has been shared successfully.",
      });

      // Reset form
      form.reset();
    } catch (error) {
      console.error("Error sharing wisdom:", error);
      toast({
        title: "Error",
        description: "There was an error sharing your wisdom.",
        variant: "destructive",
      });
    }
  };

  const handleFileUploaded = (url: string) => {
    form.setValue("resource_url", url);
  };

  return (
    <div className="w-full p-4">
      <h2 className="text-2xl font-bold mb-6">Share Your Wisdom</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter a title for your wisdom" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brief Description</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="A short description of what you're sharing" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="resource_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resource Type</FormLabel>
                <FormControl>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    {...field}
                  >
                    {resourceTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags (comma separated)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="E.g., Technology, Life advice, Career" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="space-y-2">
            <FormLabel>Related Media (Optional)</FormLabel>
            <FileUpload onFileUploaded={handleFileUploaded} />
          </div>
          
          <FormField
            control={form.control}
            name="resource_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resource URL (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="https://example.com/resource" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <RichTextEditor
                    content={field.value}
                    onChange={field.onChange}
                    placeholder="Share your wisdom..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline">
              Save as Draft
            </Button>
            <Button type="submit">
              Publish
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default WisdomExchangeForm;
