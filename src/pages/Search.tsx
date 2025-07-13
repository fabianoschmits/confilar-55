import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search as SearchIcon, User, MapPin, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SearchResult {
  id: string;
  content: string;
  is_anonymous: boolean;
  location: string | null;
  created_at: string;
  profiles?: {
    full_name?: string;
  } | null;
  likes: any[];
  comments: any[];
}

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState<'posts' | 'users'>('posts');

  const searchPosts = async (term: string) => {
    if (!term.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const { data: postsData, error } = await supabase
        .from('posts')
        .select('*')
        .ilike('content', `%${term}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Fetch related data separately
      const postIds = postsData?.map(post => post.id) || [];
      const userIds = postsData?.map(post => post.user_id) || [];

      const [profilesData, likesData, commentsData] = await Promise.all([
        supabase.from('profiles').select('user_id, full_name').in('user_id', userIds),
        supabase.from('likes').select('id, post_id').in('post_id', postIds),
        supabase.from('comments').select('id, post_id').in('post_id', postIds)
      ]);

      // Combine data
      const postsWithData = postsData?.map(post => ({
        ...post,
        profiles: profilesData.data?.find(p => p.user_id === post.user_id) || null,
        likes: likesData.data?.filter(l => l.post_id === post.id) || [],
        comments: commentsData.data?.filter(c => c.post_id === post.id) || []
      })) || [];

      setResults(postsWithData);
    } catch (error) {
      console.error('Erro na busca:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (term: string) => {
    if (!term.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('full_name', `%${term}%`)
        .limit(20);

      if (error) throw error;
      
      // Transform user data to match SearchResult type
      const userResults = data?.map(user => ({
        ...user,
        content: user.bio || '',
        is_anonymous: false,
        likes: [],
        comments: []
      })) || [];

      setResults(userResults);
    } catch (error) {
      console.error('Erro na busca:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchType === 'posts') {
      searchPosts(searchTerm);
    } else {
      searchUsers(searchTerm);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <Card className="mb-6">
            <CardHeader>
              <div className="space-y-4">
                <h1 className="text-2xl font-bold">Buscar</h1>
                
                {/* Filtros de tipo de busca */}
                <div className="flex gap-2">
                  <Button
                    variant={searchType === 'posts' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSearchType('posts')}
                  >
                    Posts
                  </Button>
                  <Button
                    variant={searchType === 'users' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSearchType('users')}
                  >
                    Usuários
                  </Button>
                </div>

                {/* Barra de busca */}
                <div className="flex gap-2">
                  <Input
                    placeholder={`Buscar ${searchType === 'posts' ? 'confissões' : 'usuários'}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                  />
                  <Button onClick={handleSearch} disabled={loading}>
                    <SearchIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Resultados */}
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
          ) : results.length === 0 && searchTerm ? (
            <Card>
              <CardContent className="p-12 text-center">
                <SearchIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum resultado encontrado</h3>
                <p className="text-muted-foreground">
                  Tente usar palavras-chave diferentes ou verifique a ortografia.
                </p>
              </CardContent>
            </Card>
          ) : results.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <SearchIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Busque por confissões ou usuários</h3>
                <p className="text-muted-foreground">
                  Use a barra de busca acima para encontrar conteúdo na plataforma.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {searchType === 'posts' ? (
                // Resultados de posts
                results.map((post: any) => (
                  <Card key={post.id}>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                              <span className="text-primary-foreground text-sm font-medium">
                                {post.is_anonymous ? '?' : (post.profiles?.full_name?.[0] || 'U')}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {post.is_anonymous ? 'Confissão Anônima' : post.profiles?.full_name || 'Usuário'}
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
                        <p className="text-sm leading-relaxed">{post.content}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>{post.likes?.length || 0} curtidas</span>
                          <span>{post.comments?.length || 0} comentários</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                // Resultados de usuários
                results.map((user: any) => (
                  <Card key={user.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{user.full_name || 'Usuário'}</h3>
                          {user.bio && (
                            <p className="text-sm text-muted-foreground mt-1">{user.bio}</p>
                          )}
                          {user.location && (
                            <div className="flex items-center mt-2 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3 mr-1" />
                              {user.location}
                            </div>
                          )}
                        </div>
                        <Button variant="outline" size="sm">
                          Ver Perfil
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
        <div className="h-20 lg:hidden"></div>
      </div>
    </ProtectedRoute>
  );
};

export default Search;