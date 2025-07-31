import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface UserLikeButtonProps {
  targetUserId: string;
  isOwnProfile?: boolean;
}

const UserLikeButton = ({ targetUserId, isOwnProfile = false }: UserLikeButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && targetUserId) {
      fetchLikeStatus();
      fetchLikesCount();
    }
  }, [user, targetUserId]);

  const fetchLikeStatus = async () => {
    // Disabled for now - user_likes table doesn't exist
    setIsLiked(false);
  };

  const fetchLikesCount = async () => {
    // Disabled for now - user_likes table doesn't exist
    setLikesCount(0);
  };

  const toggleLike = async () => {
    // Disabled for now - user_likes table doesn't exist
    toast({
      title: "Em desenvolvimento",
      description: "Funcionalidade de likes será implementada em breve.",
    });
  };

  if (isOwnProfile) {
    return (
      <Button variant="outline" disabled className="flex items-center space-x-2">
        <Heart className="h-4 w-4" />
        <span>{likesCount} likes</span>
      </Button>
    );
  }

  return (
    <Button 
      variant={isLiked ? "default" : "outline"} 
      onClick={toggleLike}
      disabled={loading}
      className="flex items-center space-x-2"
    >
      <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
      <span>{likesCount} likes</span>
    </Button>
  );
};

export default UserLikeButton;