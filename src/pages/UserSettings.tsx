import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  User,
  Bell,
  Shield,
  Lock,
  LogOut,
  Edit,
  Trash2,
  Download,
  ArrowLeft
} from "lucide-react";
import Navigation from "@/components/Navigation";

interface PrivacySettings {
  profile_visible: boolean;
  show_phone: boolean;
  show_email: boolean;
}

interface NotificationSettings {
  messages: boolean;
  reviews: boolean;
  bookings: boolean;
  marketing: boolean;
}

const UserSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("profile");
  
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profile_visible: true,
    show_phone: false,
    show_email: false
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    messages: true,
    reviews: true,
    bookings: true,
    marketing: false
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      setProfile(data || {
        user_id: user.id,
        full_name: user.email,
        bio: null,
        location: null,
        phone: null,
        avatar_url: null
      });
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o perfil",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Erro ao sair:', error);
      toast({
        title: "Erro",
        description: "Não foi possível sair da conta",
        variant: "destructive"
      });
    }
  };

  const updatePrivacySetting = (key: keyof PrivacySettings, value: boolean) => {
    setPrivacySettings(prev => ({ ...prev, [key]: value }));
    // Aqui você pode adicionar a lógica para salvar no Supabase se necessário
  };

  const updateNotificationSetting = (key: keyof NotificationSettings, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [key]: value }));
    // Aqui você pode adicionar a lógica para salvar no Supabase se necessário
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 pb-20 md:pb-0 flex items-center justify-center">
        <div className="text-center">Carregando configurações...</div>
      </div>
    );
  }

  const renderProfileSection = () => (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Informações do Perfil</h2>
        <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-gradient-primary text-white text-2xl">
              {profile?.full_name ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <div className="text-lg font-semibold">{profile?.full_name || 'Usuário'}</div>
            <div className="text-sm text-muted-foreground">{user?.email}</div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => navigate('/editar-perfil')}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar perfil
            </Button>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Nome completo</label>
            <div className="text-sm text-muted-foreground">{profile?.full_name || 'Não informado'}</div>
          </div>
          <div>
            <label className="text-sm font-medium">Localização</label>
            <div className="text-sm text-muted-foreground">{profile?.location || 'Não informado'}</div>
          </div>
          <div>
            <label className="text-sm font-medium">Telefone</label>
            <div className="text-sm text-muted-foreground">{profile?.phone || 'Não informado'}</div>
          </div>
          <div>
            <label className="text-sm font-medium">Biografia</label>
            <div className="text-sm text-muted-foreground">{profile?.bio || 'Não informado'}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderNotificationSection = () => (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Preferências de Notificação</h2>
        <p className="text-muted-foreground">Escolha como você quer ser notificado</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Mensagens</h3>
            <p className="text-sm text-muted-foreground">Notificações de novas mensagens</p>
          </div>
          <Switch
            checked={notificationSettings.messages}
            onCheckedChange={(checked) => updateNotificationSetting('messages', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Avaliações</h3>
            <p className="text-sm text-muted-foreground">Notificações de novas avaliações</p>
          </div>
          <Switch
            checked={notificationSettings.reviews}
            onCheckedChange={(checked) => updateNotificationSetting('reviews', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Agendamentos</h3>
            <p className="text-sm text-muted-foreground">Notificações de novos agendamentos</p>
          </div>
          <Switch
            checked={notificationSettings.bookings}
            onCheckedChange={(checked) => updateNotificationSetting('bookings', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Marketing</h3>
            <p className="text-sm text-muted-foreground">Dicas, promoções e novidades</p>
          </div>
          <Switch
            checked={notificationSettings.marketing}
            onCheckedChange={(checked) => updateNotificationSetting('marketing', checked)}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderPrivacySection = () => (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Privacidade e Segurança</h2>
        <p className="text-muted-foreground">Controle quem pode ver suas informações</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Perfil visível</h3>
            <p className="text-sm text-muted-foreground">Permitir que outros vejam seu perfil</p>
          </div>
          <Switch
            checked={privacySettings.profile_visible}
            onCheckedChange={(checked) => updatePrivacySetting('profile_visible', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Mostrar telefone</h3>
            <p className="text-sm text-muted-foreground">Exibir seu telefone no perfil público</p>
          </div>
          <Switch
            checked={privacySettings.show_phone}
            onCheckedChange={(checked) => updatePrivacySetting('show_phone', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Mostrar e-mail</h3>
            <p className="text-sm text-muted-foreground">Exibir seu e-mail no perfil público</p>
          </div>
          <Switch
            checked={privacySettings.show_email}
            onCheckedChange={(checked) => updatePrivacySetting('show_email', checked)}
          />
        </div>

        <Separator />

        <div className="space-y-3">
          <h3 className="font-medium">Segurança da Conta</h3>
          <Button variant="outline" className="w-full justify-start">
            <Lock className="h-4 w-4 mr-3" />
            Alterar senha
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Download className="h-4 w-4 mr-3" />
            Baixar meus dados
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderAccountSection = () => (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Ações da Conta</h2>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-3" />
          Sair da conta
        </Button>
        
        <Button variant="outline" className="w-full justify-start text-destructive hover:bg-destructive/10">
          <Trash2 className="h-4 w-4 mr-3" />
          Excluir conta
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-muted/30 pb-20 md:pb-0">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/perfil')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Configurações</h1>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Settings Menu */}
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-1">
                  <Button 
                    variant="ghost" 
                    className={`w-full justify-start ${activeSection === 'profile' ? 'bg-primary/10 text-primary' : ''}`}
                    onClick={() => setActiveSection('profile')}
                  >
                    <User className="h-4 w-4 mr-3" />
                    Perfil
                  </Button>
                  <Button 
                    variant="ghost" 
                    className={`w-full justify-start ${activeSection === 'notifications' ? 'bg-primary/10 text-primary' : ''}`}
                    onClick={() => setActiveSection('notifications')}
                  >
                    <Bell className="h-4 w-4 mr-3" />
                    Notificações
                  </Button>
                  <Button 
                    variant="ghost" 
                    className={`w-full justify-start ${activeSection === 'privacy' ? 'bg-primary/10 text-primary' : ''}`}
                    onClick={() => setActiveSection('privacy')}
                  >
                    <Shield className="h-4 w-4 mr-3" />
                    Privacidade
                  </Button>
                  <Button 
                    variant="ghost" 
                    className={`w-full justify-start ${activeSection === 'account' ? 'bg-primary/10 text-primary' : ''}`}
                    onClick={() => setActiveSection('account')}
                  >
                    <Lock className="h-4 w-4 mr-3" />
                    Conta
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="md:col-span-2 space-y-6">
            {activeSection === 'profile' && renderProfileSection()}
            {activeSection === 'notifications' && renderNotificationSection()}
            {activeSection === 'privacy' && renderPrivacySection()}
            {activeSection === 'account' && renderAccountSection()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;