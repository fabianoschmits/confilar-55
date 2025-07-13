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
    if (!user || isOwnProfile) return;

    try {
      const { data } = await supabase
        .from('user_likes')
        .select('id')
        .eq('from_user_id', user.id)
        .eq('to_user_id', targetUserId)
        .maybeSingle();

      setIsLiked(!!data);
    } catch (error) {
      console.error('Erro ao verificar like:', error);
    }
  };

  const fetchLikesCount = async () => {
    try {
      const { count } = await supabase
        .from('user_likes')
        .select('*', { count: 'exact', head: true })
        .eq('to_user_id', targetUserId);

      setLikesCount(count || 0);
    } catch (error) {
      console.error('Erro ao buscar contagem de likes:', error);
    }
  };

  const toggleLike = async () => {
    if (!user || isOwnProfile) return;

    setLoading(true);
    try {
      if (isLiked) {
        await supabase
          .from('user_likes')
          .delete()
          .eq('from_user_id', user.id)
          .eq('to_user_id', targetUserId);

        setIsLiked(false);
        setLikesCount(prev => prev - 1);
        toast({
          title: "Like removido",
          description: "Você removeu seu like deste usuário.",
        });
      } else {
        await supabase
          .from('user_likes')
          .insert({
            from_user_id: user.id,
            to_user_id: targetUserId
          });

        setIsLiked(true);
        setLikesCount(prev => prev + 1);
        toast({
          title: "Like adicionado",
          description: "Você curtiu este usuário!",
        });
      }
    } catch (error) {
      console.error('Erro ao dar like:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar seu like.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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