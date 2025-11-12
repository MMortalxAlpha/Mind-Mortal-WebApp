// src/pages/dashboard/ProfilePage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import SubscriptionStatus from '@/components/subscription/SubscriptionStatus';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

const BUCKET = 'content_media';

const formSchema = z.object({
  username: z.string().min(1, 'Username is required').email(),
  full_name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  bio: z.string().optional(),
  website: z.string().url({ message: 'Please enter a valid URL' }).optional().nullable().or(z.literal('')),
  location: z.string().optional(),
});

const ProfilePage = () => {
  const { user, profile, isLoading, refreshProfile } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      username: profile?.username || '',
      full_name: profile?.full_name || '',
      bio: profile?.bio || '',
      website: profile?.website || '',
      location: profile?.location || '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;

    setIsUpdating(true);
    try {
      let avatarUrl = profile?.avatar_url;

      if (avatarFile) {
        const ext = (avatarFile.name.split('.').pop() || 'jpg').toLowerCase();
        const filePath = `${user.id}/profile/avatar.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(filePath, avatarFile, {
            upsert: true,
            contentType: avatarFile.type || undefined,
          });

        if (uploadError) throw new Error(uploadError.message || 'Upload failed');

        const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
        avatarUrl = pub.publicUrl;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          username: values.username,
          full_name: values.full_name,
          bio: values.bio,
          website: values.website || null,
          location: values.location,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      toast({ title: 'Profile Updated', description: 'Your profile has been updated successfully.' });
      setAvatarFile(null);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      toast({ variant: 'destructive', title: 'Error', description: err?.message || 'Failed to update profile.' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);

      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center h-[600px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-muted-foreground">Manage your profile information</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Profile Completion</CardTitle>
                <CardDescription>Complete your profile to get the most out of MMortal</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <div className="flex gap-2 items-center">
                      {profile?.full_name ? <Check className="h-5 w-5 text-green-500" /> : <AlertCircle className="h-5 w-5 text-amber-500" />}
                      <span>Add your full name</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex gap-2 items-center">
                      {profile?.bio ? <Check className="h-5 w-5 text-green-500" /> : <AlertCircle className="h-5 w-5 text-amber-500" />}
                      <span>Add a bio</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex gap-2 items-center">
                      {profile?.avatar_url || avatarPreview ? <Check className="h-5 w-5 text-green-500" /> : <AlertCircle className="h-5 w-5 text-amber-500" />}
                      <span>Upload a profile photo</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex gap-2 items-center">
                      {profile?.location ? <Check className="h-5 w-5 text-green-500" /> : <AlertCircle className="h-5 w-5 text-amber-500" />}
                      <span>Add your location</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Subscription</CardTitle>
                <CardDescription>Your current subscription plan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <SubscriptionStatus showPlans={false} />
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full" variant="outline">Manage Subscription</Button>
                  </DialogTrigger>
                  <DialogContent
                    className="
                      w-[96vw] sm:max-w-3xl md:max-w-5xl
                      max-h-[90vh] p-0 overflow-hidden
                    "
                  >
                    <DialogHeader className="px-4 sm:px-6 pt-5 pb-0">
                      <DialogTitle>Subscription</DialogTitle>
                    </DialogHeader>
                    <div className="px-4 sm:px-6 pb-6 pt-4">
                      <ScrollArea className="h-[70vh] sm:h-[72vh] pr-2">
                        <SubscriptionStatus showPlans={true} />
                      </ScrollArea>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>

          {/* Main form */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information and how others see you on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={avatarPreview || profile?.avatar_url || ''} />
                        <AvatarFallback>{profile?.full_name?.charAt(0) || user?.email?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">Profile Photo</h3>
                        <p className="text-sm text-muted-foreground mb-2">This will be displayed on your profile</p>
                        <div className="flex gap-2">
                          <Button type="button" variant="outline" size="sm" asChild>
                            <label>
                              Upload
                              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                            </label>
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="full_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl><Input {...field} disabled /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl><Textarea placeholder="Tell us a bit about yourself" className="resize-none h-24" {...field} /></FormControl>
                          <FormDescription>Brief description for your profile. URLs are hyperlinked.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl><Input placeholder="https://yourwebsite.com" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl><Input placeholder="San Francisco, CA" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isUpdating}>
                        {isUpdating ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving</>) : ('Save Changes')}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
