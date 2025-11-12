
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { useAuth } from './useAuth';

type PostType = 'legacy_post' | 'timeless_message' | 'wisdom_resource' | 'idea';

export const usePostLikes = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  /**
   * Toggles the like status of a post
   */
  const toggleLike = async (postId: string, postType: PostType, isCurrentlyLiked: boolean): Promise<boolean> => {
    if (isProcessing || !user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to like posts.",
        variant: "destructive"
      });
      return isCurrentlyLiked;
    }
    
    setIsProcessing(true);
    
    try {
      if (isCurrentlyLiked) {
        // Unlike the post
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('post_type', postType)
          .eq('user_id', user.id);
          
        if (error) {
          console.error('Error unliking post:', error);
          toast({
            title: "Couldn't unlike",
            description: "There was an issue removing your like. Please try again.",
            variant: "destructive"
          });
          return isCurrentlyLiked;
        }
        
        return false;
      } else {
        // Like the post - first check if it already exists
        const { data: existingLike } = await supabase
          .from('post_likes')
          .select('id')
          .eq('post_id', postId)
          .eq('post_type', postType)
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (existingLike) {
          // Like already exists, no need to create a new one
          return true;
        }
        
        // Create new like
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            post_type: postType,
            user_id: user.id
          });
          
        if (error) {
          console.error('Error liking post:', error);
          toast({
            title: "Couldn't like",
            description: "There was an issue adding your like. Please try again.",
            variant: "destructive"
          });
          return isCurrentlyLiked;
        }
        
        return true;
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Action failed",
        description: "There was an issue processing your request. Please try again.",
        variant: "destructive"
      });
      return isCurrentlyLiked;
    } finally {
      setIsProcessing(false);
    }
  };
  
  return {
    toggleLike,
    isProcessing
  };
};
