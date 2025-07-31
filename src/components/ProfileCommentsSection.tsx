import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, Trash2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProfileComment {
  id: string;
  comment: string;
  rating: number;
  created_at: string;
  reviewer_id: string;
  professional_id: string;
  updated_at: string;
  commenter_profile?: {
    full_name: string;
    avatar_url: string;
  };
}

interface ProfileCommentsSectionProps {
  profileUserId: string;
  isOwnProfile?: boolean;
}

const ProfileCommentsSection = ({ profileUserId, isOwnProfile = false }: ProfileCommentsSectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<ProfileComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [profileUserId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const { data: commentsData, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('professional_id', profileUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch commenter profiles separately
      const commenterIds = commentsData?.map(c => c.reviewer_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', commenterIds);

      const commentsWithProfiles = commentsData?.map(comment => ({
        ...comment,
        commenter_profile: profiles?.find(p => p.user_id === comment.reviewer_id)
      })) || [];

      setComments(commentsWithProfiles);
    } catch (error) {
      console.error('Erro ao buscar comentários:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os comentários.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const submitComment = async () => {
    if (!user || !newComment.trim() || isOwnProfile) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          professional_id: profileUserId,
          reviewer_id: user.id,
          comment: newComment.trim(),
          rating: newRating
        });

      if (error) throw error;

      setNewComment("");
      setNewRating(5);
      fetchComments();
      toast({
        title: "Comentário enviado",
        description: "Seu comentário foi publicado com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao enviar comentário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o comentário.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      setComments(prev => prev.filter(c => c.id !== commentId));
      toast({
        title: "Comentário removido",
        description: "O comentário foi removido com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao deletar comentário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o comentário.",
        variant: "destructive",
      });
    }
  };

  const canDeleteComment = (comment: ProfileComment) => {
    return user && (comment.reviewer_id === user.id || isOwnProfile);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Avaliações e Comentários</h3>
            <p className="text-muted-foreground">{comments.length} avaliações</p>
          </div>
          {comments.length > 0 && (
            <div className="text-right">
              <div className="flex items-center space-x-1">
                {renderStars(Math.round(comments.reduce((acc, c) => acc + c.rating, 0) / comments.length))}
              </div>
              <p className="text-sm text-muted-foreground">
                {(comments.reduce((acc, c) => acc + c.rating, 0) / comments.length).toFixed(1)} de 5
              </p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Form para novo comentário */}
        {!isOwnProfile && user && (
          <div className="mb-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-3">Deixe sua avaliação</h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Avaliação</label>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setNewRating(i + 1)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-5 w-5 ${i < newRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <Textarea
                placeholder="Conte como foi trabalhar com este profissional..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[100px]"
              />
              <Button 
                onClick={submitComment} 
                disabled={!newComment.trim() || submitting}
                className="btn-hero"
              >
                <Send className="h-4 w-4 mr-2" />
                {submitting ? "Enviando..." : "Enviar Avaliação"}
              </Button>
            </div>
          </div>
        )}

        {/* Lista de comentários */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">Carregando comentários...</div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">
                {isOwnProfile ? "Você ainda não recebeu avaliações." : "Seja o primeiro a avaliar este profissional!"}
              </div>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={comment.commenter_profile?.avatar_url} />
                      <AvatarFallback>
                        {comment.commenter_profile?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">
                        {comment.commenter_profile?.full_name || 'Usuário Anônimo'}
                      </p>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          {renderStars(comment.rating)}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {canDeleteComment(comment) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteComment(comment.id)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-sm leading-relaxed">{comment.comment}</p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCommentsSection;