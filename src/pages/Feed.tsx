import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Heart, MessageCircle, Share2, MapPin, Clock, Edit3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Post {
  id: string;
  content: string;
  is_anonymous: boolean;
  location: string | null;
  created_at: string;
  user_id: string;
  likes: any[];
  comments: any[];
}

const Feed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          likes(id),
          comments(id)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os posts.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPost = async () => {
    if (!newPost.trim()) return;
    
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('posts')
        .insert([{
          content: newPost,
          is_anonymous: isAnonymous,
          user_id: user?.id,
        }]);

      if (error) throw error;

      setNewPost('');
      setShowCreatePost(false);
      await fetchPosts();
      
      toast({
        title: "Post criado!",
        description: "Sua confissão foi publicada.",
      });
    } catch (error) {
      console.error('Erro ao criar post:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o post.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleLike = async (postId: string) => {
    try {
      // Verificar se já curtiu
      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user?.id)
        .single();

      if (existingLike) {
        // Remover like
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('id', existingLike.id);
        
        if (error) throw error;
      } else {
        // Adicionar like
        const { error } = await supabase
          .from('likes')
          .insert([{
            post_id: postId,
            user_id: user?.id,
          }]);
        
        if (error) throw error;
      }

      await fetchPosts();
    } catch (error) {
      console.error('Erro ao curtir post:', error);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          {/* Criar Post */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Compartilhe sua confissão</h2>
                <Button
                  variant={showCreatePost ? "outline" : "default"}
                  size="sm"
                  onClick={() => setShowCreatePost(!showCreatePost)}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  {showCreatePost ? 'Cancelar' : 'Nova Confissão'}
                </Button>
              </div>
            </CardHeader>
            {showCreatePost && (
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Conte sua confissão... Seja respeitoso e authentic."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="min-h-[120px]"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="anonymous"
                      checked={isAnonymous}
                      onCheckedChange={setIsAnonymous}
                    />
                    <Label htmlFor="anonymous">Postar anonimamente</Label>
                  </div>
                  <Button 
                    onClick={createPost} 
                    disabled={!newPost.trim() || submitting}
                  >
                    {submitting ? 'Publicando...' : 'Publicar'}
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Posts */}
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                      <div className="h-4 bg-muted rounded w-full"></div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Edit3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhuma confissão ainda</h3>
                <p className="text-muted-foreground mb-4">
                  Seja o primeiro a compartilhar uma confissão!
                </p>
                <Button onClick={() => setShowCreatePost(true)}>
                  Criar primeira confissão
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header do Post */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-primary-foreground text-sm font-medium">
                              {post.is_anonymous ? '?' : 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {post.is_anonymous ? 'Confissão Anônima' : 'Usuário'}
                            </p>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatDistanceToNow(new Date(post.created_at), { 
                                addSuffix: true, 
                                locale: ptBR 
                              })}
                              {post.location && (
                                <>
                                  <span className="mx-2">•</span>
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {post.location}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Conteúdo */}
                      <p className="text-sm leading-relaxed">{post.content}</p>

                      {/* Ações */}
                      <div className="flex items-center space-x-6 pt-2 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleLike(post.id)}
                          className="text-muted-foreground hover:text-primary"
                        >
                          <Heart className="h-4 w-4 mr-2" />
                          {post.likes?.length || 0}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-primary"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          {post.comments?.length || 0}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-primary"
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Compartilhar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Espaçamento para navegação mobile */}
        <div className="h-20 lg:hidden"></div>
      </div>
    </ProtectedRoute>
  );
};

export default Feed;