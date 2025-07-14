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
import { useToast } from "@/hooks/use-toast";

// Dados reais do usuário serão carregados do Supabase

const Profile = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [activeTab, setActiveTab] = useState("sobre");
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profileOwner, setProfileOwner] = useState<any>(null);
  const { toast } = useToast();
  
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

  const handleStartConversation = async () => {
    if (!currentUser || !profile?.user_id) return;

    try {
      // Verificar se já existe uma conversa entre os usuários
      const { data: existingConversation, error: searchError } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant1_id.eq.${currentUser.id},participant2_id.eq.${profile.user_id}),and(participant1_id.eq.${profile.user_id},participant2_id.eq.${currentUser.id})`)
        .maybeSingle();

      if (searchError && searchError.code !== 'PGRST116') {
        throw searchError;
      }

      let conversationId = existingConversation?.id;

      // Se não existe conversa, criar uma nova
      if (!conversationId) {
        const { data: newConversation, error: createError } = await supabase
          .from('conversations')
          .insert([{
            participant1_id: currentUser.id,
            participant2_id: profile.user_id,
          }])
          .select('id')
          .single();

        if (createError) throw createError;
        conversationId = newConversation.id;
      }

      // Navegar para o chat
      navigate('/chat');
    } catch (error) {
      console.error('Erro ao iniciar conversa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar a conversa.",
        variant: "destructive",
      });
    }
  };

  const handleShareProfile = async () => {
    const profileUrl = `${window.location.origin}/perfil/${profile?.user_id}`;
    const shareText = `Confira o perfil de ${profile?.full_name || 'Usuário'} no ConfiLar`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareText,
          url: profileUrl,
        });
      } catch (error) {
        // Se o usuário cancelar o compartilhamento, não mostrar erro
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Erro ao compartilhar:', error);
        }
      }
    } else {
      // Fallback: copiar para clipboard
      try {
        await navigator.clipboard.writeText(profileUrl);
        toast({
          title: "Link copiado!",
          description: "O link do perfil foi copiado para a área de transferência.",
        });
      } catch (error) {
        console.error('Erro ao copiar link:', error);
        toast({
          title: "Erro",
          description: "Não foi possível copiar o link.",
          variant: "destructive",
        });
      }
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
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-pink-50 pb-20 md:pb-0">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Profile Header */}
        <Card className="mb-6 bg-white rounded-3xl shadow-lg border-0 overflow-hidden">
          <CardContent className="p-0">
            {/* Background Header */}
            <div className="h-32 bg-gradient-to-r from-blue-400 to-purple-500 relative">
              <div className="absolute inset-0 bg-black/20"></div>
            </div>
            
            <div className="px-6 pb-6">
              {/* Avatar */}
              <div className="flex justify-center -mt-16 mb-4">
                <div className="relative">
                  <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-primary text-white text-3xl">
                      {profile?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              
              {/* Profile Info */}
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">
                  {profile?.full_name || 'Usuário'}
                </h1>
                
                <p className="text-slate-600 text-lg mb-3">
                  {profile?.bio || 'Diarista'}
                </p>
                
                {/* Rating */}
                <div className="flex items-center justify-center space-x-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-slate-700 font-semibold ml-2">5</span>
                </div>
                
                {/* Location */}
                <div className="flex items-center justify-center text-slate-600 mb-6">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{profile?.location || 'São Paulo, SP'}</span>
                </div>
              </div>
              
              {/* Portfolio Grid */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="aspect-square bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-slate-500 text-xs text-center">
                        <div>Foto</div>
                        <div>{item}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Description */}
              <div className="text-center mb-6">
                <p className="text-slate-700 leading-relaxed">
                  {profile?.bio || 'Com mais de 5 anos de experiência no cuidado do lar, sou dedicada a oferecer serviço de qualidade e atenção aos detalhes.'}
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-3">
                {!isOwnProfile ? (
                  <>
                    <Button 
                      variant="outline"
                      className="flex-1 py-3 rounded-2xl border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
                      onClick={handleStartConversation}
                    >
                      Chat
                    </Button>
                    <Button 
                      className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-semibold"
                    >
                      Agendar Serviço
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      className="flex-1 py-3 rounded-2xl border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
                      onClick={() => navigate('/perfil/editar')}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Perfil
                    </Button>
                    <Button 
                      className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-semibold"
                      onClick={() => navigate('/configuracoes')}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Configurações
                    </Button>
                  </>
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