import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import AuthGuard from "@/components/auth/AuthGuard";
import BlobLogo from "@/components/BlobLogo";

const formSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof formSchema>;

const ResetPassword = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [validSession, setValidSession] = useState(false);
  const [resetCompleted, setResetCompleted] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Validate session from URL tokens or existing session
  useEffect(() => {
    if (resetCompleted) return;
    setSessionLoading(true);
    setError(null);
    setValidSession(false);

    const validateSession = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get("token");
      const type = params.get("type");

      try {
        if (type === "recovery" && token) {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: "recovery",
          });
          if (error || !data.session)
            throw new Error("Invalid or expired reset link.");
          setValidSession(true);
        } else {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session) setValidSession(true);
          else throw new Error("Please use the reset link from your email.");
        }
      } catch (err: any) {
        setError(err.message || "Unable to process reset link.");
        setValidSession(false);
      } finally {
        setSessionLoading(false);
      }
    };

    validateSession();
    // Clean up auth state change subscription
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" && session) setValidSession(true);
      if (event === "SIGNED_OUT") setValidSession(false);
    });
    return () => subscription.unsubscribe();
  }, [location.search, resetCompleted]);

  // Handle password reset form submission
  const onSubmit = async (values: FormData) => {
    if (!validSession) {
      setError("Invalid session. Please request a new password reset link.");
      return;
    }
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session)
        throw new Error("Session expired. Please request a new reset link.");
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });
      if (error) throw new Error(error.message);
      setSuccess(
        "Password has been reset successfully! Redirecting to sign in..."
      );
      setResetCompleted(true);
      form.reset();
      await supabase.auth.signOut();
      setTimeout(() => navigate("/signin", { replace: true }), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (sessionLoading) {
    return (
      <AuthGuard requireAuth={false}>
        <div className="flex min-h-screen items-center justify-center bg-background dark:bg-[#0a0a0a]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-foreground dark:text-gray-200">
              Validating reset link...
            </span>
          </div>
        </div>
      </AuthGuard>
    );
  }

  // Error state
  if (!validSession && !resetCompleted) {
    return (
      <AuthGuard requireAuth={false}>
        <div className="flex min-h-screen items-center justify-center bg-background dark:bg-[#0a0a0a] py-12 px-4 sm:px-6 lg:px-8">
          <Card className="w-full max-w-md bg-card dark:bg-[#18181b] border border-border dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-center text-foreground dark:text-gray-100">
                Reset Link Issue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Unable to Process Reset Link</AlertTitle>
                <AlertDescription>
                  {error ||
                    "This password reset link is invalid or has expired."}
                </AlertDescription>
              </Alert>
              <p className="text-center text-sm text-muted-foreground dark:text-gray-400 mb-4">
                Please request a new password reset link to continue.
              </p>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => navigate("/forgot-password")}
                  className="w-full bg-primary dark:bg-orange-600 text-primary-foreground dark:text-white hover:bg-orange-500 dark:hover:bg-orange-700"
                >
                  Request New Reset Link
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="w-full"
                >
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AuthGuard>
    );
  }

  // Main form
  return (
    <AuthGuard requireAuth={false}>
      <div className="flex min-h-screen items-center justify-center bg-background dark:bg-[#0a0a0a] py-12 px-4 sm:px-6 lg:px-8 relative transition-colors">
        <Button
          variant="ghost"
          className="absolute top-4 left-4 flex items-center gap-2 text-foreground dark:text-gray-200"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center justify-center">
            <BlobLogo size="md" className="mb-4" />
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground dark:text-gray-100">
              Reset Password
            </h2>
            <p className="mt-2 text-center text-sm text-muted-foreground dark:text-gray-400">
              Enter your new password below.
            </p>
          </div>
          <Card className="bg-card dark:bg-[#18181b] border border-border dark:border-gray-700 shadow-lg transition-colors">
            <CardHeader>
              <CardTitle className="text-xl text-foreground dark:text-gray-100">
                Set New Password
              </CardTitle>
              <CardDescription className="text-muted-foreground dark:text-gray-400">
                Please enter your new password below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert
                  variant="default"
                  className="mb-6 border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertTitle className="text-green-800 dark:text-green-200">
                    Success
                  </AlertTitle>
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    {success}
                  </AlertDescription>
                </Alert>
              )}
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground dark:text-gray-200">
                          New Password
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter new password"
                            type="password"
                            autoComplete="new-password"
                            className="bg-input dark:bg-[#232326] text-foreground dark:text-gray-100 border border-border dark:border-gray-700"
                            disabled={loading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground dark:text-gray-200">
                          Confirm New Password
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Confirm new password"
                            type="password"
                            autoComplete="new-password"
                            className="bg-input dark:bg-[#232326] text-foreground dark:text-gray-100 border border-border dark:border-gray-700"
                            disabled={loading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full bg-primary dark:bg-orange-600 text-primary-foreground dark:text-white hover:bg-orange-500 dark:hover:bg-orange-700 transition-colors"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resetting Password...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-center text-sm text-muted-foreground dark:text-gray-400">
                Remembered your password?{" "}
                <Link
                  to="/signin"
                  className="font-medium text-primary dark:text-orange-400 hover:underline"
                >
                  Sign In
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
};

export default ResetPassword;
