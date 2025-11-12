import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useContentCount = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const [legacyPostCount, setLegacyPostCount] = useState(0);
  const [ideaCount, setIdeaCount] = useState(0);
  const [timelessMessageCount, setTimelessMessageCount] = useState(0);
  const [wisdomResourceCount, setWisdomResourceCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      if (!user) return;
      setIsProcessing(true);
      try {
        const legacyCount = await getLegacyPostCount();
        const ideaCount = await getIdeaCount();
        const timelessCount = await getTimelessMessageCount();
        const wisdomCount = await getWisdomResourceCount();
        setLegacyPostCount(legacyCount);
        setIdeaCount(ideaCount);
        setTimelessMessageCount(timelessCount);
        setWisdomResourceCount(wisdomCount);
      } catch (error) {
        console.error("Error fetching counts:", error);
      } finally {
        setIsProcessing(false);
      }
    };
    fetchCounts();
  }, [user]);

  const getLegacyPostCount = async () => {
    const { data, error } = await supabase
      .from("legacy_posts")
      .select("*")
      .eq("user_id", user.id)
      .eq('is_deleted', false);

    if (error) {
      console.error("Error getting legacy post count:", error);
      return 0;
    }

    return data.length;
  };

  const getIdeaCount = async () => {
    const { data, error } = await supabase
      .from("idea_posts")
      .select("*")
      .eq("user_id", user.id)
      .eq('is_deleted', false);

    if (error) {
      console.error("Error getting idea count:", error);
      return 0;
    }

    return data.length;
  };

  const getTimelessMessageCount = async () => {
    const { data, error } = await supabase
      .from("timeless_messages")
      .select("*")
      .eq("user_id", user.id)
      .eq('is_deleted', false);

    if (error) {
      console.error("Error getting timeless message count:", error);
      return 0;
    }

    return data.length;
  };

  const getWisdomResourceCount = async () => {
    const { data, error } = await supabase
      .from("wisdom_resources")
      .select("*")
      .eq("created_by", user.id)
      .eq('is_deleted', false);

    if (error) {
      console.error("Error getting wisdom resource count:", error);
      return 0;
    }

    return data.length;
  };

  return {
    legacyPostCount,
    ideaCount,
    timelessMessageCount,
    wisdomResourceCount,
    isProcessing,
  };
};
