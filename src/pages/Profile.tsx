import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Star, 
  MapPin, 
  Calendar,
  Phone,
  Mail,
  Edit,
  Camera,
  Shield,
  Award,
  Clock,
  Heart,
  MessageCircle,
  Share2,
  Settings
} from "lucide-react";
import Navigation from "@/components/Navigation";
import UserLikeButton from "@/components/UserLikeButton";
import ProfileCommentsSection from "@/components/ProfileCommentsSection";

// Dados reais do usuário serão carregados do Supabase

const Profile = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [activeTab, setActiveTab] = useState("sobre");
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profileOwner, setProfileOwner] = useState<any>(null);
  
  const isOwnProfile = !userId || userId === currentUser?.id;

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      setCurrentUser(user);

      // Determina qual perfil carregar
      const targetUserId = userId || user.id;

      // Busca o perfil do usuário alvo
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', targetUserId)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      // Se for perfil de outro usuário, busca dados do auth também
      let profileOwnerData = null;
      if (!isOwnProfile) {
        const { data: { user: ownerUser }, error: ownerError } = await supabase.auth.admin.getUserById(targetUserId);
        if (!ownerError) {
          profileOwnerData = ownerUser;
        }
      }

      setProfileOwner(profileOwnerData || user);
      setProfile(profileData || {
        user_id: targetUserId,
        full_name: profileOwnerData?.email || user.email,
        bio: null,
        location: null,
        phone: null,
        avatar_url: null
      });
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      if (!isOwnProfile) {
        navigate('/perfil');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 pb-20 md:pb-0 flex items-center justify-center">
        <div className="text-center">Carregando perfil...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-20 md:pb-0">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Profile Header */}
        <Card className="mb-6 shadow-soft">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
              {/* Avatar and Basic Info */}
              <div className="flex flex-col items-center md:items-start mb-6 md:mb-0">
                <div className="relative">
                  <Avatar className="h-32 w-32 mb-4">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-primary text-white text-3xl">
                      {profile?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Button 
                    size="icon" 
                    className="absolute bottom-2 right-2 h-8 w-8 bg-white shadow-medium hover:bg-gray-50"
                  >
                    <Camera className="h-4 w-4 text-gray-600" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {isOwnProfile ? (
                    <>
                      <Button 
                        variant="outline" 
                        className="w-full md:w-auto"
                        onClick={() => navigate('/perfil/editar')}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar Perfil
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full md:w-auto"
                        onClick={() => navigate('/configuracoes')}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Configurações
                      </Button>
                    </>
                  ) : (
                    <UserLikeButton 
                      targetUserId={profile?.user_id} 
                      isOwnProfile={false}
                    />
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <h1 className="text-3xl font-bold">{profile?.full_name || 'Usuário'}</h1>
                    </div>
                    
                    <p className="text-xl text-muted-foreground mb-3">Profissional ConfiLar</p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{profile?.location || 'Localização não informada'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Mail className="h-4 w-4" />
                        <span>{profileOwner?.email || 'Email não informado'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      {isOwnProfile ? "Complete seu perfil para começar" : "Profissional ConfiLar"}
                    </div>
                  </div>
                </div>

                {/* Profile completion prompt - only for own profile */}
                {isOwnProfile && (
                  <div className="grid grid-cols-1 gap-4 mb-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-lg font-semibold text-muted-foreground mb-2">
                        Complete seu perfil
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Adicione mais informações para atrair clientes
                      </div>
                    </div>
                  </div>
                )}

                {/* Contact Buttons */}
                {!isOwnProfile && (
                  <div className="flex flex-wrap gap-2">
                    <Button className="btn-hero flex-1 md:flex-none">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Conversar
                    </Button>
                    <Button variant="outline" className="flex-1 md:flex-none">
                      <Phone className="h-4 w-4 mr-2" />
                      Ligar
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sobre">Sobre</TabsTrigger>
            <TabsTrigger value="portfolio">Portfólio</TabsTrigger>
            <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
            <TabsTrigger value="contato">Contato</TabsTrigger>
          </TabsList>

          <TabsContent value="sobre" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Sobre Mim</h3>
                </CardHeader>
                <CardContent>
                  <p className="leading-relaxed mb-4">{profile?.bio || 'Biografia não informada ainda.'}</p>
                  
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Serviços Oferecidos</h4>
                    <div className="text-sm text-muted-foreground">
                      Configure seus serviços nas configurações do perfil
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Disponibilidade</h3>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Disponibilidade</h4>
                    <div className="text-sm text-muted-foreground">
                      Configure sua disponibilidade nas configurações do perfil
                    </div>
                  </div>
                  
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="portfolio" className="mt-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Meus Trabalhos</h3>
                <p className="text-muted-foreground">Veja alguns dos meus trabalhos realizados</p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-muted-foreground">
                    Você ainda não adicionou nenhum trabalho ao seu portfólio.
                  </div>
                  <Button variant="outline" className="mt-4">
                    Adicionar Trabalhos
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="avaliacoes" className="mt-6">
            <ProfileCommentsSection 
              profileUserId={profile?.user_id} 
              isOwnProfile={isOwnProfile}
            />
          </TabsContent>

          <TabsContent value="contato" className="mt-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Informações de Contato</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Telefone</p>
                      <p className="text-muted-foreground">{profile?.phone || 'Não informado'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">E-mail</p>
                      <p className="text-muted-foreground">{profileOwner?.email || 'Não informado'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Localização</p>
                      <p className="text-muted-foreground">{profile?.location || 'Não informado'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Horário de Atendimento</h4>
                  <p className="text-sm text-muted-foreground">
                    Segunda a Sexta: 8:00 - 18:00<br />
                    Resposta em até 2 horas
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;