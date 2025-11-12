import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User, Session } from "@supabase/supabase-js";

type UserRole = "admin" | "mentor" | "disciple" | "guest";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  roles: UserRole[];
  isLoading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isAdmin: () => boolean;
  isMentor: () => boolean;
  isDisciple: () => boolean;
  isAuthenticated: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authSubscription, setAuthSubscription] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // 1) Subscribe first, but bail early on INITIAL_SESSION / SIGNED_IN
    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log(
          "[onAuthStateChange] event:",
          event,
          newSession ? "session exists" : "no session"
        );

        // If the user just signed out, clear state & remain not-loading (we know there's no user)
        if (event === "SIGNED_OUT") {
          setUser(null);
          setSession(null);
          setProfile(null);
          setRoles(["guest"]);
          // We do not set isLoading here, because initializeAuth will already be done.
          return;
        }

        // If Supabase is replaying a saved session on page load, you typically get "INITIAL_SESSION"
        // Or it may fire "SIGNED_IN" right after a cookie‐session is detected.
        if (
          (event === "INITIAL_SESSION" || event === "SIGNED_IN") &&
          newSession?.user
        ) {
          // Immediately populate user/session and turn off loading
          setUser(newSession.user);
          setSession(newSession);
          setIsLoading(false);

          // Now fetch profile & roles in the background. If these hang, they won't block the UI.
          fetchUserProfile(newSession.user.id).catch(console.error);
          fetchUserRoles(newSession.user.id).catch(console.error);
          return;
        }

        // (Optional) If token refresh events also matter:
        if (event === "TOKEN_REFRESHED" && newSession?.user) {
          setUser(newSession.user);
          setSession(newSession);
          setIsLoading(false);
          fetchUserProfile(newSession.user.id).catch(console.error);
          fetchUserRoles(newSession.user.id).catch(console.error);
          return;
        }

        // For any other event, just unfreeze the UI
        setIsLoading(false);
      }
    );

    setAuthSubscription(subscription);

    // 2) In parallel, do a one‐time initializeAuth to handle the “no session” case
    const initializeAuth = async () => {
      console.log("[initializeAuth] start");
      try {
        // This will be null if there's no saved session in localStorage / cookie
        const {
          data: { session },
        } = await supabase.auth.getSession();
        console.log("[initializeAuth] got session:", session);

        if (session?.user) {
          // We already handled the “SIGNED_IN” event above, so you could skip,
          // but in case the listener fires too slowly, we ensure user/session get set.
          setUser(session.user);
          setSession(session);
          setIsLoading(false);
          // Fire these in the background too
          fetchUserProfile(session.user.id).catch(console.error);
          fetchUserRoles(session.user.id).catch(console.error);
        } else {
          // No user found → guest
          setUser(null);
          setSession(null);
          setProfile(null);
          setRoles(["guest"]);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("[initializeAuth] ERROR:", err);
        toast({
          title: "Authentication Error",
          description: "There was a problem checking your session.",
          variant: "destructive",
        });
        setUser(null);
        setSession(null);
        setProfile(null);
        setRoles(["guest"]);
        setIsLoading(false);
      }
    };

    initializeAuth();

    // 3) Cleanup on unmount
    return () => {
      if (authSubscription) {
        authSubscription.unsubscribe(); // <-- TS complains: ‘unsubscribe’ does not exist on { subscription: RealtimeSubscription }
      }
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const fetchUserRoles = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc("get_user_roles", {
        input_user_id: userId,
      });

      if (error) throw error;

      if (data && data.length > 0) {
        setRoles(data as UserRole[]);
      } else {
        setRoles(["disciple"]);
      }
    } catch (error) {
      console.error("Error fetching user roles:", error);
      setRoles(["disciple"]);
    }
  };

  const refreshProfile = async () => {
    if (!user) return;

    try {
      await fetchUserProfile(user.id);
      await fetchUserRoles(user.id);

      return;
    } catch (error) {
      console.error("Error refreshing profile:", error);
      toast({
        title: "Profile refresh failed",
        description: "There was an error refreshing your profile data.",
        variant: "destructive",
      });
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Account created!",
        description: "Please check your email to confirm your account. Check your spam folder as well.",
      });

      navigate("/signin");
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (
    email: string,
    password: string,
    callbackUrl?: string
  ) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });

      if (callbackUrl) {
        navigate(callbackUrl);
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setSession(null);
      setProfile(null);
      setRoles(["guest"]);

      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });

      navigate("/");
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isAdmin = () => roles.includes("admin");
  const isMentor = () => roles.includes("mentor");
  const isDisciple = () => roles.includes("disciple");
  const isAuthenticated = () => !!user;

  const value = {
    user,
    session,
    profile,
    roles,
    isLoading,
    signUp,
    signIn,
    signOut,
    refreshProfile,
    isAdmin,
    isMentor,
    isDisciple,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
