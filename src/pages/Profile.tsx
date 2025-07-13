import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Share2
} from "lucide-react";
import Navigation from "@/components/Navigation";

// Mock data
const userProfile = {
  id: 1,
  name: "Maria Santos",
  role: "Diarista Profissional",
  avatar: null,
  rating: 4.9,
  reviews: 127,
  location: "São Paulo, SP",
  memberSince: "Janeiro 2022",
  verified: true,
  premium: true,
  bio: "Sou uma profissional dedicada com mais de 8 anos de experiência em limpeza residencial. Trabalho com carinho e atenção aos detalhes, sempre buscando deixar sua casa impecável. Utilizo produtos ecológicos e tenho total flexibilidade de horários.",
  services: [
    "Limpeza Geral",
    "Organização",
    "Passar Roupa",
    "Lavar Louça",
    "Limpeza de Vidros"
  ],
  hourlyRate: "R$ 35/hora",
  availability: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"],
  phone: "(11) 99999-9999",
  email: "maria.santos@email.com",
  stats: {
    totalJobs: 245,
    repeatClients: 89,
    responseTime: "2h"
  }
};

const reviews = [
  {
    id: 1,
    user: "Ana Paula",
    rating: 5,
    comment: "Maria é excepcional! Muito cuidadosa e atenciosa. Minha casa ficou impecável!",
    date: "Há 2 dias",
    verified: true
  },
  {
    id: 2,
    user: "Carlos Silva",
    rating: 5,
    comment: "Profissional excelente! Pontual, organizada e de confiança. Super recomendo!",
    date: "Há 1 semana",
    verified: true
  },
  {
    id: 3,
    user: "Fernanda Costa",
    rating: 4,
    comment: "Muito boa profissional. Deixou tudo organizado e limpo. Voltarei a contratar.",
    date: "Há 2 semanas",
    verified: true
  }
];

const portfolioImages = [
  "/placeholder.svg",
  "/placeholder.svg",
  "/placeholder.svg",
  "/placeholder.svg",
  "/placeholder.svg",
  "/placeholder.svg"
];

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("sobre");
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setProfile(data);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
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
                
                <Button 
                  variant="outline" 
                  className="w-full md:w-auto"
                  onClick={() => navigate('/perfil/editar')}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Perfil
                </Button>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <h1 className="text-3xl font-bold">{profile?.full_name || 'Usuário'}</h1>
                      {userProfile.verified && (
                        <Badge className="bg-blue-500">
                          <Shield className="h-3 w-3 mr-1" />
                          Verificado
                        </Badge>
                      )}
                      {userProfile.premium && (
                        <Badge className="bg-gradient-primary">
                          <Award className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-xl text-muted-foreground mb-3">Profissional ConfiLar</p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{userProfile.rating}</span>
                        <span>({userProfile.reviews} avaliações)</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{profile?.location || 'Localização não informada'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Membro desde {userProfile.memberSince}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {userProfile.hourlyRate}
                    </div>
                    <div className="text-sm text-green-600">
                      Disponível hoje
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{userProfile.stats.totalJobs}</div>
                    <div className="text-sm text-muted-foreground">Trabalhos</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{userProfile.stats.repeatClients}</div>
                    <div className="text-sm text-muted-foreground">Clientes Fixos</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{userProfile.stats.responseTime}</div>
                    <div className="text-sm text-muted-foreground">Tempo Resposta</div>
                  </div>
                </div>

                {/* Contact Buttons */}
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
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
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
                    <div className="flex flex-wrap gap-2">
                      {userProfile.services.map((service) => (
                        <Badge key={service} variant="outline">
                          {service}
                        </Badge>
                      ))}
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
                    <h4 className="font-semibold mb-2">Dias da Semana</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"].map((day) => (
                        <div
                          key={day}
                          className={`p-2 text-center text-sm rounded-lg ${
                            userProfile.availability.includes(day)
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {day}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Horários</h4>
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>8:00 - 18:00</span>
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
                <div className="grid md:grid-cols-3 gap-4">
                  {portfolioImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Trabalho ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg group-hover:opacity-75 transition-opacity cursor-pointer"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="avaliacoes" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Avaliações</h3>
                    <p className="text-muted-foreground">{userProfile.reviews} avaliações de clientes</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">{userProfile.rating}</div>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className="h-4 w-4 fill-yellow-400 text-yellow-400" 
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold">{review.user}</h4>
                          {review.verified && (
                            <Badge variant="outline" className="text-xs">
                              ✓ Verificado
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star} 
                                className={`h-3 w-3 ${
                                  star <= review.rating 
                                    ? 'fill-yellow-400 text-yellow-400' 
                                    : 'text-gray-300'
                                }`} 
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">{review.date}</span>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
                      <p className="text-muted-foreground">{userProfile.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Localização</p>
                      <p className="text-muted-foreground">{userProfile.location}</p>
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