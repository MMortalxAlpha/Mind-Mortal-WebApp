import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Eye, EyeOff, Lightbulb } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

const wisdomZodSchema = z.object({
  title: z.string().min(1, "Title is required"),
  resource_type: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
  experience: z.string().min(1, "Experience is required"),
  isPublic: z.boolean().default(true),
});

type WisdomFormSchema = z.infer<typeof wisdomZodSchema>;

const fetchWisdomResourceById = async (id: string) => {
  const { data } = await supabase
    .from("wisdom_resources")
    .select("*")
    .eq("id", id)
    .single();
  return data;
};

const updateWisdomResource = async ({
  id,
  values,
}: {
  id: string;
  values: WisdomFormSchema;
}) => {
  await supabase
    .from("wisdom_resources")
    .update({
      title: values.title,
      resource_type: values.resource_type,
      description: values.description,
      experience: values.experience,
      is_public: values.isPublic,
    })
    .eq("id", id);
  return true;
};

export default function EditWisdomResource() {
  const navigate = useNavigate();
  const params = useParams();
  const resourceId = params.id;
  const { data } = useSuspenseQuery({
    queryKey: ["myResources", resourceId],
    queryFn: () => fetchWisdomResourceById(resourceId),
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: updateWisdomResource,
    onSuccess: () => {
      toast.success("Wisdom resource updated successfully");
      navigate("/dashboard/mentorship");
    },
    onError: (error) => {
      toast.error(`Failed to update resource: ${error.message}`);
    },
  });

  const form = useForm<WisdomFormSchema>({
    resolver: zodResolver(wisdomZodSchema),
    values: {
      title: data?.title ?? "",
      resource_type: data?.resource_type ?? "",
      description: data?.description ?? "",
      experience: data?.experience ?? "",
      isPublic: data?.is_public ?? true,
    },
  });

  const onSubmit = async (values: WisdomFormSchema) => {
    await mutateAsync({ id: resourceId, values });
  };

  return (
    <div className="container mx-auto pb-8">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Edit Mentorship Resource</h1>
      </div>
      <p className="text-muted-foreground mb-6">
        Update your innovative mentorship resource and share your improvements
        with the world.
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Edit Mentorship Resource Details</CardTitle>
            </CardHeader>
            <CardContent className="xs:p-2 space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter title" {...field} />
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
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="E.g., Technology, Business, Arts"
                        {...field}
                      />
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what is mentorship resource is about"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share your experience in this area"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="flex items-center gap-2">
                        {field.value ? (
                          <Eye className="size-4" />
                        ) : (
                          <EyeOff className="size-4" />
                        )}
                        {field.value ? "Public" : "Private"}
                      </FormLabel>
                    </div>
                    <FormDescription>
                      {field.value
                        ? "Your resource will be visible to everyone"
                        : "Your resource will be visible only to you"}
                    </FormDescription>
                  </FormItem>
                )}
              />
            </CardContent>

            <CardFooter className="flex justify-between xs:flex-col xs:items-start xs:gap-2 xs:p-2">
              <Button
                className="xs:w-full"
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard/mentorship")}
              >
                Cancel
              </Button>
              <Button className="xs:w-full" type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
