import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import {
  Users,
  MessageSquare,
  Shield,
  Settings,
  Trash2,
  UserCheck,
  UserX,
  Search,
  Plus,
  Edit,
  AlertTriangle
} from "lucide-react";

const Admin = () => {
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Estados para dados
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalComments: 0,
    totalLikes: 0
  });

  // Estados para modais/formulários
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    if (!roleLoading && !isAdmin()) {
      navigate('/feed');
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para acessar esta página",
        variant: "destructive"
      });
    }
  }, [isAdmin, roleLoading, navigate, toast]);

  useEffect(() => {
    if (isAdmin()) {
      fetchStats();
      fetchUsers();
      fetchPosts();
    }
  }, [isAdmin]);

  const fetchStats = async () => {
    try {
      const [usersResult, postsResult, commentsResult, likesResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('posts').select('id', { count: 'exact' }),
        supabase.from('comments').select('id', { count: 'exact' }),
        supabase.from('likes').select('id', { count: 'exact' })
      ]);

      setStats({
        totalUsers: usersResult.count || 0,
        totalPosts: postsResult.count || 0,
        totalComments: commentsResult.count || 0,
        totalLikes: likesResult.count || 0
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { action: 'get_users' }
      });

      if (error) throw error;
      setUsers(data?.data || []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles(full_name),
          comments(id),
          likes(id)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
    }
  };

  const promoteUser = async (userId: string, role: 'admin' | 'moderator') => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          action: 'assign_role', 
          payload: { 
            userId, 
            role,
            reason: `Promoted to ${role} via admin panel`
          } 
        }
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Usuário promovido a ${role === 'admin' ? 'administrador' : 'moderador'}`
      });

      fetchUsers();
    } catch (error) {
      console.error('Erro ao promover usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível promover o usuário",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const removeRole = async (userId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          action: 'remove_role', 
          payload: { 
            userId,
            reason: 'Role removed via admin panel'
          } 
        }
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Privilégios removidos do usuário"
      });

      fetchUsers();
    } catch (error) {
      console.error('Erro ao remover role:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover privilégios",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId: string, postType: 'normal' | 'work' = 'normal') => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          action: 'delete_post', 
          payload: { 
            postId,
            postType,
            reason: 'Deleted via admin panel'
          } 
        }
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Post removido com sucesso"
      });

      fetchPosts();
      fetchStats();
    } catch (error) {
      console.error('Erro ao deletar post:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o post",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const searchUserByEmail = async () => {
    if (!searchEmail.trim()) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { action: 'get_users' }
      });

      if (error) throw error;
      
      // Filtrar usuários localmente baseado no termo de busca
      const filteredUsers = (data?.data || []).filter((user: any) =>
        user.full_name?.toLowerCase().includes(searchEmail.toLowerCase()) ||
        user.location?.toLowerCase().includes(searchEmail.toLowerCase())
      );
      
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Erro na busca:', error);
      toast({
        title: "Erro",
        description: "Erro ao buscar usuário",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (roleLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div>Carregando...</div>
      </div>
    );
  }

  if (!isAdmin()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-20 md:pb-0">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center mb-6">
          <Shield className="h-8 w-8 mr-3 text-primary" />
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Usuários</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Posts</p>
                  <p className="text-2xl font-bold">{stats.totalPosts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Edit className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Comentários</p>
                  <p className="text-2xl font-bold">{stats.totalComments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Plus className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Likes</p>
                  <p className="text-2xl font-bold">{stats.totalLikes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs para diferentes seções */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          {/* Gerenciamento de Usuários */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Usuários</CardTitle>
                <div className="flex gap-2">
                  <Input
                    placeholder="Buscar por nome..."
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    className="max-w-sm"
                  />
                  <Button onClick={searchUserByEmail} disabled={loading}>
                    <Search className="h-4 w-4" />
                  </Button>
                  <Button onClick={fetchUsers} variant="outline">
                    Todos
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {user.full_name?.[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold">{user.full_name || 'Nome não informado'}</p>
                          <p className="text-sm text-muted-foreground">{user.location || 'Localização não informada'}</p>
                          <p className="text-xs text-muted-foreground">
                            Criado em: {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {user.user_roles?.[0]?.role && (
                          <Badge variant={user.user_roles[0].role === 'admin' ? 'default' : 'secondary'}>
                            {user.user_roles[0].role}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {!user.user_roles?.[0]?.role && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => promoteUser(user.user_id, 'moderator')}
                              disabled={loading}
                            >
                              <UserCheck className="h-4 w-4 mr-1" />
                              Moderador
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => promoteUser(user.user_id, 'admin')}
                              disabled={loading}
                            >
                              <Shield className="h-4 w-4 mr-1" />
                              Admin
                            </Button>
                          </>
                        )}
                        
                        {user.user_roles?.[0]?.role && user.user_roles[0].role !== 'admin' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeRole(user.user_id)}
                            disabled={loading}
                          >
                            <UserX className="h-4 w-4 mr-1" />
                            Remover
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gerenciamento de Posts */}
          <TabsContent value="posts">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div key={post.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">
                            {post.is_anonymous ? 'Confissão Anônima' : post.profiles?.full_name || 'Usuário'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(post.created_at).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deletePost(post.id)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <p className="mb-2">{post.content}</p>
                      
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>{post.likes?.length || 0} likes</span>
                        <span>{post.comments?.length || 0} comentários</span>
                        {post.location && <span>📍 {post.location}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações do Sistema */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Estatísticas do Sistema</h3>
                    <Button onClick={fetchStats} className="mr-2">
                      Atualizar Estatísticas
                    </Button>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Banco de Dados</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Ferramentas para manutenção do banco de dados
                    </p>
                    <div className="flex gap-2">
                      <Button onClick={fetchUsers} variant="outline">
                        Recarregar Usuários
                      </Button>
                      <Button onClick={fetchPosts} variant="outline">
                        Recarregar Posts
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg border-orange-200 bg-orange-50">
                    <div className="flex items-center mb-2">
                      <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
                      <h3 className="font-semibold text-orange-800">Zona de Perigo</h3>
                    </div>
                    <p className="text-sm text-orange-700 mb-4">
                      Ações irreversíveis que afetam todo o sistema
                    </p>
                    <p className="text-xs text-orange-600">
                      Use com extrema cautela. Sempre faça backup antes de executar ações destrutivas.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;