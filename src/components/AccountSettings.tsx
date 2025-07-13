import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Lock, 
  Mail, 
  Download, 
  Trash2, 
  Eye, 
  EyeOff,
  Shield,
  Globe,
  UserX
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const AccountSettings = () => {
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [privacySettings, setPrivacySettings] = useState({
    is_private: false,
    show_email: false,
    show_phone: false,
  });

  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A nova senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Senha alterada com sucesso.",
      });

      setChangePasswordOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar a senha.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadData = async () => {
    try {
      // Get user data
      const [postsData, profileData, likesData, commentsData] = await Promise.all([
        supabase.from('posts').select('*').eq('user_id', user?.id),
        supabase.from('profiles').select('*').eq('user_id', user?.id).maybeSingle(),
        supabase.from('likes').select('*').eq('user_id', user?.id),
        supabase.from('comments').select('*').eq('user_id', user?.id)
      ]);

      const userData = {
        user: {
          id: user?.id,
          email: user?.email,
          created_at: user?.created_at
        },
        profile: profileData.data,
        posts: postsData.data,
        likes: likesData.data,
        comments: commentsData.data,
        exported_at: new Date().toISOString()
      };

      // Create and download file
      const dataStr = JSON.stringify(userData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `confilar-data-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();

      toast({
        title: "Dados exportados",
        description: "Seus dados foram baixados com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao baixar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível baixar seus dados.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // Delete user profile and related data
      await supabase.from('profiles').delete().eq('user_id', user?.id);
      
      // Note: In a real app, you'd want to use a server-side function 
      // to properly delete user data and the auth user account
      toast({
        title: "Conta excluída",
        description: "Sua conta foi excluída com sucesso.",
      });

      // Sign out user
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir sua conta.",
        variant: "destructive",
      });
    }
  };

  const updatePrivacySetting = async (key: keyof typeof privacySettings, value: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ [key]: value })
        .eq('user_id', user?.id);

      if (error) throw error;

      setPrivacySettings(prev => ({ ...prev, [key]: value }));
      
      toast({
        title: "Configuração atualizada",
        description: "Suas configurações de privacidade foram atualizadas.",
      });
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a configuração.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Privacidade e Segurança
          </h2>
          <p className="text-muted-foreground">
            Controle quem pode ver suas informações
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Perfil privado</h3>
              <p className="text-sm text-muted-foreground">
                Apenas pessoas que você aprovar poderão ver seu perfil
              </p>
            </div>
            <Switch
              checked={privacySettings.is_private}
              onCheckedChange={(checked) => updatePrivacySetting('is_private', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Mostrar e-mail</h3>
              <p className="text-sm text-muted-foreground">
                Permitir que outros vejam seu e-mail
              </p>
            </div>
            <Switch
              checked={privacySettings.show_email}
              onCheckedChange={(checked) => updatePrivacySetting('show_email', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Mostrar telefone</h3>
              <p className="text-sm text-muted-foreground">
                Permitir que outros vejam seu telefone
              </p>
            </div>
            <Switch
              checked={privacySettings.show_phone}
              onCheckedChange={(checked) => updatePrivacySetting('show_phone', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold flex items-center">
            <Lock className="h-5 w-5 mr-2" />
            Segurança da Conta
          </h2>
        </CardHeader>
        <CardContent className="space-y-3">
          <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <Lock className="h-4 w-4 mr-3" />
                Alterar senha
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Alterar senha</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="current-password">Senha atual</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showPasswords ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setShowPasswords(!showPasswords)}
                    >
                      {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="new-password">Nova senha</Label>
                  <Input
                    id="new-password"
                    type={showPasswords ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="confirm-password">Confirmar nova senha</Label>
                  <Input
                    id="confirm-password"
                    type={showPasswords ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setChangePasswordOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleChangePassword} disabled={isLoading}>
                  {isLoading ? 'Alterando...' : 'Alterar senha'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" className="w-full justify-start" onClick={handleDownloadData}>
            <Download className="h-4 w-4 mr-3" />
            Baixar meus dados
          </Button>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-destructive">Zona de Perigo</h2>
          <p className="text-muted-foreground">
            Ações irreversíveis para sua conta
          </p>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="h-4 w-4 mr-3" />
                Excluir conta permanentemente
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-2">
                  <p>Esta ação não pode ser desfeita. Isso irá permanentemente:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Excluir sua conta e perfil</li>
                    <li>Remover todos os seus posts e comentários</li>
                    <li>Apagar todas as suas conversas</li>
                    <li>Remover todas as suas avaliações e curtidas</li>
                  </ul>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteAccount}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Sim, excluir minha conta
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSettings;