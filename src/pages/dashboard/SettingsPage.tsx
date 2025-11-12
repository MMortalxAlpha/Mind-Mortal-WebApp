import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSubscription } from "@/hooks/useSubscription";
import SubscriptionStatus from "@/components/subscription/SubscriptionStatus";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const SettingsPage = () => {
  const { user } = useAuth();
  const { isLoading: isSubscriptionLoading } = useSubscription();
  const [passwordChanging, setPasswordChanging] = useState(false);
  const [emailChanging, setEmailChanging] = useState(false);
  const { toast } = useToast();

  /*const handleChangeEmail = async () => {
    setEmailChanging(true);

    try {
      const email = prompt("Enter your new email address:");

      if (!email) {
        setEmailChanging(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({ email });

      if (error) throw error;

      toast({
        title: "Verification email sent",
        description: "Please check your email to confirm the change.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to initiate email change",
        variant: "destructive",
      });
    } finally {
      setEmailChanging(false);
    }
  };
  */

  const handleChangePassword = async () => {
    setPasswordChanging(true);

    try {
      const currentPassword = prompt("Enter your current password:");

      if (!currentPassword) {
        setPasswordChanging(false);
        return;
      }

      const newPassword = prompt("Enter your new password:");

      if (!newPassword) {
        setPasswordChanging(false);
        return;
      }

      const confirmPassword = prompt("Confirm your new password:");

      if (newPassword !== confirmPassword) {
        toast({
          title: "Passwords don't match",
          description: "The new passwords you entered don't match.",
          variant: "destructive",
        });
        setPasswordChanging(false);
        return;
      }

      // Supabase requires re-authentication before password change
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: currentPassword,
      });

      if (signInError) throw signInError;

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setPasswordChanging(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirm = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (!confirm) return;

    const confirmText = prompt('Type "DELETE" to confirm account deletion:');

    if (confirmText !== "DELETE") {
      toast({
        title: "Account deletion cancelled",
        description: "You did not type DELETE to confirm.",
      });
      return;
    }

    try {
      // In a real app, you would typically call a server-side function
      // since Supabase doesn't allow users to delete their own accounts directly
      toast({
        title: "Account deletion requested",
        description: "Our team will process your account deletion request.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to request account deletion",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container py-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/*<div>
                  <h3 className="text-lg font-medium mb-2">Email Address</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your email address is <strong>{user?.email}</strong>
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleChangeEmail}
                    disabled={emailChanging}
                  >
                    {emailChanging ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Changing Email...
                      </>
                    ) : (
                      "Change Email"
                    )}
                  </Button>
                </div>
                */}

                <div>
                  <h3 className="text-lg font-medium mb-2">Password</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Change your password for better security
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleChangePassword}
                    disabled={passwordChanging}
                  >
                    {passwordChanging ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Changing Password...
                      </>
                    ) : (
                      "Change Password"
                    )}
                  </Button>
                </div>

                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Danger Zone</AlertTitle>
                  <AlertDescription>
                    Once you delete your account, there is no going back. All
                    your data will be permanently removed.
                  </AlertDescription>
                  <Button
                    variant="destructive"
                    className="mt-4"
                    onClick={handleDeleteAccount}
                  >
                    Delete Account
                  </Button>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

         {/* <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Management</CardTitle>
                <CardDescription>
                  View and manage your subscription plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isSubscriptionLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <SubscriptionStatus showPlans={true} />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent> */}

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Manage how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Notification preferences will be available in a future
                    update.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsPage;
