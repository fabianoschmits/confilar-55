import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  Heart, 
  MessageCircle,
  UserPlus,
  Hash,
  Star
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';

interface TrendingPost {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  is_anonymous: boolean;
  likes_count: number;
  comments_count: number;
  views_count: number;
  profiles?: {
    full_name?: string;
  };
}

interface PopularUser {
  user_id: string;
  full_name: string;
  bio?: string;
  avatar_url?: string;
  likes_received: number;
  posts_count: number;
  is_verified: boolean;
}

interface TrendingHashtag {
  hashtag: string;
  count: number;
  posts: any[];
}

const Explore = () => {
  const [trendingPosts, setTrendingPosts] = useState<TrendingPost[]>([]);
  const [popularUsers, setPopularUsers] = useState<PopularUser[]>([]);
  const [trendingHashtags, setTrendingHashtags] = useState<TrendingHashtag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExploreData();
  }, []);

  const loadExploreData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadTrendingPosts(),
        loadPopularUsers(),
        loadTrendingHashtags()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados de exploração:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTrendingPosts = async () => {
    try {
      // Get posts without profiles first
      const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Get engagement data and profiles for each post
      const postsWithEngagement = await Promise.all(
        posts?.map(async (post) => {
          const [likesData, commentsData, viewsData, profileData] = await Promise.all([
            supabase.from('likes').select('id').eq('post_id', post.id),
            supabase.from('comments').select('id').eq('post_id', post.id),
            supabase.from('post_views').select('id').eq('post_id', post.id),
            supabase.from('profiles').select('full_name').eq('user_id', post.user_id).maybeSingle()
          ]);

          return {
            ...post,
            likes_count: likesData.data?.length || 0,
            comments_count: commentsData.data?.length || 0,
            views_count: viewsData.data?.length || 0,
            profiles: profileData.data || null
          };
        }) || []
      );

      // Sort by engagement score
      const sorted = postsWithEngagement.sort((a, b) => {
        const scoreA = (a.likes_count * 3) + (a.comments_count * 5) + (a.views_count * 1);
        const scoreB = (b.likes_count * 3) + (b.comments_count * 5) + (b.views_count * 1);
        return scoreB - scoreA;
      });

      setTrendingPosts(sorted.slice(0, 10));
    } catch (error) {
      console.error('Erro ao carregar posts em alta:', error);
    }
  };

  const loadPopularUsers = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(20);

      if (error) throw error;

      // Calculate user popularity
      const usersWithStats = await Promise.all(
        profiles?.map(async (profile) => {
          const [postsData, likesData] = await Promise.all([
            supabase.from('posts').select('id').eq('user_id', profile.user_id),
            supabase
              .from('likes')
              .select('id')
              .in('post_id', 
                (await supabase.from('posts').select('id').eq('user_id', profile.user_id)).data?.map(p => p.id) || []
              )
          ]);

          return {
            ...profile,
            posts_count: postsData.data?.length || 0,
            likes_received: likesData.data?.length || 0
          };
        }) || []
      );

      const sorted = usersWithStats.sort((a, b) => 
        (b.likes_received + b.posts_count * 2) - (a.likes_received + a.posts_count * 2)
      );

      setPopularUsers(sorted.slice(0, 8));
    } catch (error) {
      console.error('Erro ao carregar usuários populares:', error);
    }
  };

  const loadTrendingHashtags = async () => {
    try {
      const { data: posts, error } = await supabase
        .from('posts')
        .select('hashtags')
        .not('hashtags', 'is', null)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const hashtagCounts: Record<string, number> = {};
      posts?.forEach(post => {
        post.hashtags?.forEach((tag: string) => {
          hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
        });
      });

      const trending = Object.entries(hashtagCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([hashtag, count]) => ({
          hashtag,
          count,
          posts: []
        }));

      setTrendingHashtags(trending);
    } catch (error) {
      console.error('Erro ao carregar hashtags em alta:', error);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Navigation />
          <div className="container mx-auto px-4 py-6">
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
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
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="flex items-center mb-6">
            <TrendingUp className="h-6 w-6 mr-2 text-primary" />
            <h1 className="text-2xl font-bold">Explorar</h1>
          </div>

          <Tabs defaultValue="trending" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="trending">Em Alta</TabsTrigger>
              <TabsTrigger value="users">Usuários</TabsTrigger>
              <TabsTrigger value="hashtags">Hashtags</TabsTrigger>
            </TabsList>

            <TabsContent value="trending" className="space-y-4">
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Posts em Alta
                  </h2>
                  <p className="text-muted-foreground">
                    Os posts mais populares da semana
                  </p>
                </CardHeader>
              </Card>

              {trendingPosts.map((post, index) => (
                <Card key={post.id}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge variant="secondary" className="text-xs">
                            #{index + 1}
                          </Badge>
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-primary-foreground text-sm font-medium">
                              {post.is_anonymous ? '?' : (post.profiles?.full_name?.[0] || 'U')}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {post.is_anonymous ? (
                                'Post Anônimo'
                              ) : (
                                <Link 
                                  to={`/perfil/${post.user_id}`}
                                  className="hover:text-primary transition-colors"
                                >
                                  {post.profiles?.full_name || 'Usuário'}
                                </Link>
                              )}
                            </p>
                            <div className="flex items-center text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(post.created_at), { 
                                addSuffix: true, 
                                locale: ptBR 
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm leading-relaxed">{post.content}</p>

                      <div className="flex items-center space-x-6 text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <Heart className="h-4 w-4 mr-1" />
                          {post.likes_count}
                        </div>
                        <div className="flex items-center">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {post.comments_count}
                        </div>
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {post.views_count}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Usuários Populares
                  </h2>
                  <p className="text-muted-foreground">
                    Descubra novos perfis interessantes
                  </p>
                </CardHeader>
              </Card>

              <div className="grid md:grid-cols-2 gap-4">
                {popularUsers.map((user) => (
                  <Card key={user.user_id}>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-primary-foreground font-semibold">
                            {user.full_name?.[0] || 'U'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h3 className="font-medium">
                              {user.full_name || 'Usuário'}
                            </h3>
                            {user.is_verified && (
                              <Star className="h-4 w-4 ml-1 text-primary fill-current" />
                            )}
                          </div>
                          {user.bio && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {user.bio.substring(0, 60)}...
                            </p>
                          )}
                          <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                            <span>{user.posts_count} posts</span>
                            <span>{user.likes_received} curtidas</span>
                          </div>
                        </div>
                        <Link to={`/perfil/${user.user_id}`}>
                          <Button variant="outline" size="sm">
                            <UserPlus className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="hashtags" className="space-y-4">
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold flex items-center">
                    <Hash className="h-5 w-5 mr-2" />
                    Hashtags Populares
                  </h2>
                  <p className="text-muted-foreground">
                    As hashtags mais usadas esta semana
                  </p>
                </CardHeader>
              </Card>

              <div className="grid md:grid-cols-2 gap-4">
                {trendingHashtags.map((hashtag, index) => (
                  <Card key={hashtag.hashtag}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge variant="secondary" className="text-xs">
                            #{index + 1}
                          </Badge>
                          <div>
                            <p className="font-semibold text-primary">
                              #{hashtag.hashtag}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {hashtag.count} posts
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            // Navigate to search with hashtag
                            window.location.href = `/buscar?q=%23${hashtag.hashtag}`;
                          }}
                        >
                          Ver posts
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="h-20 lg:hidden"></div>
      </div>
    </ProtectedRoute>
  );
};

export default Explore;