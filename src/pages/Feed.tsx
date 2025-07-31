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
import { Heart, MessageCircle, Share2, MapPin, Clock, Edit3, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import CommentSection from '@/components/CommentSection';
import HashtagMentionInput from '@/components/HashtagMentionInput';
import ReactionButton from '@/components/ReactionButton';
import BlockReportMenu from '@/components/BlockReportMenu';
import { Link, useNavigate } from 'react-router-dom';

interface Post {
  id: string;
  content: string;
  is_anonymous: boolean;
  location: string | null;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name?: string;
  } | null;
  likes: any[];
  comments: any[];
}

const Feed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [extractedHashtags, setExtractedHashtags] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      // Buscar posts de todas as tabelas (posts e work_posts) com critério de relevância
      const [postsData, workPostsData] = await Promise.all([
        supabase
          .from('posts')
          .select(`
            *,
            profiles!inner(full_name)
          `)
          .order('created_at', { ascending: false }),
        
        Promise.resolve({ data: [], error: null }) // work_posts table doesn't exist
      ]);

      if (postsData.error) throw postsData.error;
      if (workPostsData.error) throw workPostsData.error;

      // No work posts since table doesn't exist
      const convertedWorkPosts: any[] = [];

      // Combinar e embaralhar posts para criar feed aleatório com relevância
      const allPosts = [...(postsData.data || []), ...convertedWorkPosts];
      
      // Algoritmo simples de relevância: posts mais recentes têm maior chance de aparecer primeiro
      const shuffledPosts = allPosts
        .map(post => ({
          ...post,
          relevanceScore: Math.random() + (new Date(post.created_at).getTime() / Date.now()) * 0.5
        }))
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .map(({ relevanceScore, ...post }) => post);

      setPosts(shuffledPosts as Post[]);

      // Verificar quais posts o usuário já curtiu
      if (user?.id) {
        const { data: likesData } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', user.id);
        
        const liked = new Set(likesData?.map(like => like.post_id) || []);
        setLikedPosts(liked);
      }
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
          hashtags: extractedHashtags.length > 0 ? extractedHashtags : null,
        }]);

      if (error) throw error;

      setNewPost('');
      setShowCreatePost(false);
      await fetchPosts();
      
      toast({
        title: "Post criado!",
        description: "Seu serviço foi publicado.",
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
      const isLiked = likedPosts.has(postId);

      if (isLiked) {
        // Remover like
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user?.id);
        
        if (error) throw error;
        
        setLikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      } else {
        // Adicionar like
        const { error } = await supabase
          .from('post_likes')
          .insert([{
            post_id: postId,
            user_id: user?.id,
          }]);
        
        if (error) throw error;
        
        setLikedPosts(prev => new Set(prev).add(postId));
      }

      // Atualizar contagem de likes
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                likes: isLiked 
                  ? post.likes.slice(0, -1) 
                  : [...post.likes, { id: 'temp' }]
              }
            : post
        )
      );
    } catch (error) {
      console.error('Erro ao curtir post:', error);
      toast({
        title: "Erro",
        description: "Não foi possível curtir o post.",
        variant: "destructive",
      });
    }
  };

  const handleCommentsChange = (postId: string, newCount: number) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { ...post, comments: Array(newCount).fill({ id: 'temp' }) }
          : post
      )
    );
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-muted/30">
        <Navigation />
        
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          {/* Criar Post */}
          <Card className="mb-6 bg-card rounded-3xl shadow-lg border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800">Compartilha Serviço</h2>
                <div className="flex gap-2">
                  <Button
                    variant="soft"
                    size="sm"
                    onClick={() => navigate('/postar-trabalho')}
                    className="hover:scale-105 transition-all duration-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Trabalho
                  </Button>
                  <Button
                    variant={showCreatePost ? "outline" : "premium"}
                    size="sm"
                    onClick={() => setShowCreatePost(!showCreatePost)}
                    className="hover:scale-105 transition-all duration-200"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    {showCreatePost ? 'Cancelar' : 'Novo Serviço'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            {showCreatePost && (
              <CardContent className="space-y-4">
                <HashtagMentionInput
                  value={newPost}
                  onChange={setNewPost}
                  onHashtagsExtracted={setExtractedHashtags}
                  placeholder="Descreva seu serviço ou trabalho... Use #hashtags e @mentions. Seja respeitoso e autêntico."
                  className="min-h-[120px]"
                  rows={5}
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
                    variant="premium"
                    className="hover:scale-105 transition-all duration-200"
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
                <Card key={i} className="animate-pulse bg-card rounded-3xl shadow-lg border-0">
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
            <Card className="bg-card rounded-3xl shadow-lg border-0">
              <CardContent className="p-12 text-center">
                <Edit3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum serviço ainda</h3>
                <p className="text-muted-foreground mb-4">
                  Seja o primeiro a compartilhar um serviço!
                </p>
                <Button 
                  onClick={() => setShowCreatePost(true)}
                  variant="premium"
                  className="hover:scale-105 transition-all duration-200"
                >
                  Criar primeiro serviço
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <Card key={post.id} className="bg-card rounded-3xl shadow-lg border-0 overflow-hidden">
                  <CardContent className="p-0">
                    {/* Header do Post */}
                    <div className="flex items-center justify-between p-4 pb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {post.is_anonymous ? '?' : (post.profiles?.full_name?.[0] || 'U')}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-lg">
                            {post.is_anonymous ? (
                              'Serviço Anônimo'
                            ) : (
                              <Link 
                                to={`/perfil/${post.user_id}`}
                                className="hover:text-primary transition-colors"
                              >
                                {post.profiles?.full_name || 'Usuário'}
                              </Link>
                            )}
                          </p>
                          <p className="text-slate-600 text-sm">
                            Profissional
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-slate-600">
                        ⋯
                      </Button>
                    </div>

                    {/* Imagem placeholder (simulando imagem do serviço) */}
                    <div className="w-full h-64 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                      <div className="text-slate-500 text-center">
                        <div className="text-sm font-medium">Imagem do Serviço</div>
                        <div className="text-xs mt-1">Configure nas configurações</div>
                      </div>
                    </div>

                    {/* Conteúdo */}
                    <div className="p-4">
                      <p className="text-slate-700 leading-relaxed mb-4">{post.content}</p>
                      
                      {post.location && (
                        <div className="flex items-center text-sm text-slate-500 mb-4">
                          <MapPin className="h-4 w-4 mr-1" />
                          {post.location}
                        </div>
                      )}

                      {/* Ações */}
                      <div className="flex items-center justify-center space-x-8 pt-4 border-t border-gray-100">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-600 hover:text-blue-600 flex items-center space-x-2 text-base font-medium"
                          onClick={() => toggleLike(post.id)}
                        >
                          <Heart className={`h-5 w-5 ${likedPosts.has(post.id) ? 'fill-red-500 text-red-500' : ''}`} />
                          <span>Curtir</span>
                        </Button>
                        
                        <div className="text-slate-600 hover:text-blue-600 flex items-center space-x-2 text-base font-medium">
                          <CommentSection 
                            postId={post.id}
                            commentsCount={post.comments?.length || 0}
                            onCommentsChange={(count) => handleCommentsChange(post.id, count)}
                          />
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-600 hover:text-blue-600 flex items-center space-x-2 text-base font-medium"
                          onClick={() => {
                            if (!post.is_anonymous) {
                              navigate(`/perfil/${post.user_id}`);
                            }
                          }}
                        >
                          <Share2 className="h-5 w-5" />
                          <span>Entrar em contato</span>
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