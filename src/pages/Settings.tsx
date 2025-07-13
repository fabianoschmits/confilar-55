import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  User,
  Bell,
  Shield,
  CreditCard,
  HelpCircle,
  LogOut,
  Camera,
  Mail,
  Phone,
  MapPin,
  Lock,
  Trash2,
  Download
} from "lucide-react";
import Navigation from "@/components/Navigation";

const Settings = () => {
  const [notifications, setNotifications] = useState({
    messages: true,
    reviews: true,
    bookings: true,
    marketing: false
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showPhone: false,
    showEmail: false
  });

  return (
    <div className="min-h-screen bg-muted/30 pb-20 md:pb-0">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Configurações</h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Settings Menu */}
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-1">
                  <Button variant="ghost" className="w-full justify-start bg-primary/10 text-primary">
                    <User className="h-4 w-4 mr-3" />
                    Perfil
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Bell className="h-4 w-4 mr-3" />
                    Notificações
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Shield className="h-4 w-4 mr-3" />
                    Privacidade
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <CreditCard className="h-4 w-4 mr-3" />
                    Pagamentos
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <HelpCircle className="h-4 w-4 mr-3" />
                    Ajuda
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">Informações do Perfil</h2>
                <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={undefined} />
                    <AvatarFallback className="bg-gradient-primary text-white text-2xl">
                      M
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button size="sm" className="flex items-center space-x-2">
                      <Camera className="h-4 w-4" />
                      <span>Alterar foto</span>
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remover
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Basic Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome completo</Label>
                    <Input id="name" defaultValue="Maria Santos" />
                  </div>
                  <div>
                    <Label htmlFor="role">Profissão</Label>
                    <Input id="role" defaultValue="Diarista Profissional" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Descrição do perfil</Label>
                  <textarea
                    id="bio"
                    className="w-full p-3 border border-input rounded-md resize-none"
                    rows={4}
                    defaultValue="Sou uma profissional dedicada com mais de 8 anos de experiência em limpeza residencial..."
                  />
                </div>

                {/* Contact Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    Informações de Contato
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">E-mail</Label>
                      <Input id="email" type="email" defaultValue="maria.santos@email.com" />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input id="phone" defaultValue="(11) 99999-9999" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location">Localização</Label>
                    <Input id="location" defaultValue="São Paulo, SP" />
                  </div>
                </div>

                <Button className="btn-hero">
                  Salvar alterações
                </Button>
              </CardContent>
            </Card>

            {/* Notification Settings */}
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
                    checked={notifications.messages}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, messages: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Avaliações</h3>
                    <p className="text-sm text-muted-foreground">Notificações de novas avaliações</p>
                  </div>
                  <Switch
                    checked={notifications.reviews}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, reviews: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Agendamentos</h3>
                    <p className="text-sm text-muted-foreground">Notificações de novos agendamentos</p>
                  </div>
                  <Switch
                    checked={notifications.bookings}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, bookings: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Marketing</h3>
                    <p className="text-sm text-muted-foreground">Dicas, promoções e novidades</p>
                  </div>
                  <Switch
                    checked={notifications.marketing}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, marketing: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
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
                    checked={privacy.profileVisible}
                    onCheckedChange={(checked) => 
                      setPrivacy(prev => ({ ...prev, profileVisible: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Mostrar telefone</h3>
                    <p className="text-sm text-muted-foreground">Exibir seu telefone no perfil público</p>
                  </div>
                  <Switch
                    checked={privacy.showPhone}
                    onCheckedChange={(checked) => 
                      setPrivacy(prev => ({ ...prev, showPhone: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Mostrar e-mail</h3>
                    <p className="text-sm text-muted-foreground">Exibir seu e-mail no perfil público</p>
                  </div>
                  <Switch
                    checked={privacy.showEmail}
                    onCheckedChange={(checked) => 
                      setPrivacy(prev => ({ ...prev, showEmail: checked }))
                    }
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

            {/* Account Actions */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">Ações da Conta</h2>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4 mr-3" />
                  Excluir conta
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <LogOut className="h-4 w-4 mr-3" />
                  Sair da conta
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;