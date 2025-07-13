import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MessageCircle, Clock, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface Comment {
  id: string;
  content: string;
  is_anonymous: boolean;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name?: string;
  } | null;
}

interface CommentSectionProps {
  postId: string;
  commentsCount: number;
  onCommentsChange: (count: number) => void;
}

const CommentSection = ({ postId, commentsCount, onCommentsChange }: CommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchComments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles(full_name)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
    } finally {
      setLoading(false);
    }
  };

  const createComment = async () => {
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert([{
          content: newComment,
          is_anonymous: isAnonymous,
          post_id: postId,
          user_id: user?.id,
        }]);

      if (error) throw error;

      setNewComment('');
      await fetchComments();
      onCommentsChange(comments.length + 1);
      
      toast({
        title: "Comentário adicionado!",
        description: "Seu comentário foi publicado.",
      });
    } catch (error) {
      console.error('Erro ao criar comentário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o comentário.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleComments = () => {
    setShowComments(!showComments);
    if (!showComments && comments.length === 0) {
      fetchComments();
    }
  };

  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleComments}
        className="text-muted-foreground hover:text-primary"
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        {commentsCount} comentários
      </Button>

      {showComments && (
        <div className="space-y-4 pl-4 border-l-2 border-muted">
          {/* Formulário de novo comentário */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <Textarea
                placeholder="Adicione um comentário..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px] resize-none"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`anonymous-comment-${postId}`}
                    checked={isAnonymous}
                    onCheckedChange={setIsAnonymous}
                  />
                  <Label htmlFor={`anonymous-comment-${postId}`} className="text-sm">
                    Comentar anonimamente
                  </Label>
                </div>
                <Button 
                  onClick={createComment} 
                  disabled={!newComment.trim() || submitting}
                  size="sm"
                >
                  <Send className="h-3 w-3 mr-2" />
                  {submitting ? 'Enviando...' : 'Comentar'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de comentários */}
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded w-1/4"></div>
                      <div className="h-4 bg-muted rounded w-full"></div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhum comentário ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <Card key={comment.id}>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-primary-foreground text-xs font-medium">
                              {comment.is_anonymous ? '?' : (comment.profiles?.full_name?.[0] || 'U')}
                            </span>
                          </div>
                          <span className="text-sm font-medium">
                            {comment.is_anonymous ? 'Anônimo' : comment.profiles?.full_name || 'Usuário'}
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDistanceToNow(new Date(comment.created_at), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentSection;