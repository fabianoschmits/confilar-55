import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { LogIn, UserPlus, Mail, ArrowLeft } from 'lucide-react';

const Login = () => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp, resetPassword, signInWithProvider, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/feed');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      
      if (mode === 'login') {
        result = await signIn(email, password);
      } else if (mode === 'signup') {
        if (password !== confirmPassword) {
          toast({
            title: "Senhas não coincidem",
            description: "As senhas devem ser iguais.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        if (!fullName.trim() || !city.trim() || !state.trim() || !birthDate || !gender) {
          toast({
            title: "Campos obrigatórios",
            description: "Por favor, preencha todos os campos obrigatórios.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        result = await signUp({
          email,
          password,
          fullName,
          city,
          state,
          birthDate,
          gender,
          bio,
        });
      } else if (mode === 'forgot') {
        result = await resetPassword(email);
      }

      if (result?.error) {
        let errorMessage = result.error.message;
        
        // Traduzir mensagens de erro comuns
        if (errorMessage.includes('Invalid login credentials')) {
          errorMessage = 'Email ou senha incorretos.';
        } else if (errorMessage.includes('User already registered')) {
          errorMessage = 'Este email já está cadastrado. Tente fazer login.';
        } else if (errorMessage.includes('Password should be at least')) {
          errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
        }

        toast({
          title: "Erro na autenticação",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        if (mode === 'signup') {
          toast({
            title: "Conta criada!",
            description: "Verifique seu email para confirmar a conta.",
          });
          setMode('login');
        } else if (mode === 'login') {
          toast({
            title: "Login realizado!",
            description: "Bem-vindo ao ConfiLar!",
          });
        } else if (mode === 'forgot') {
          toast({
            title: "Email enviado!",
            description: "Verifique seu email para redefinir a senha.",
          });
          setMode('login');
        }
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Algo deu errado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    setLoading(true);
    try {
      const result = await signInWithProvider(provider);
      if (result.error) {
        toast({
          title: "Erro no login social",
          description: result.error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível fazer login. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setCity('');
    setState('');
    setBirthDate('');
    setGender('');
    setBio('');
  };

  const switchMode = (newMode: 'login' | 'signup' | 'forgot') => {
    setMode(newMode);
    resetForm();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            {mode === 'login' && 'Entrar'}
            {mode === 'signup' && 'Criar Conta'}
            {mode === 'forgot' && 'Recuperar Senha'}
          </CardTitle>
          <CardDescription>
            {mode === 'login' && 'Entre em sua conta no ConfiLar'}
            {mode === 'signup' && 'Crie sua conta completa no ConfiLar'}
            {mode === 'forgot' && 'Digite seu email para recuperar a senha'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {mode !== 'forgot' && (
            <>
              {/* Login Social */}
              <div className="space-y-3 mb-6">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSocialLogin('google')}
                  disabled={loading}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continuar com Google
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSocialLogin('facebook')}
                  disabled={loading}
                >
                  <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Continuar com Facebook
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSocialLogin('apple')}
                  disabled={loading}
                >
                  <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
                  </svg>
                  Continuar com Apple
                </Button>
              </div>

              <div className="relative mb-6">
                <Separator />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-background px-2 text-sm text-muted-foreground">
                    ou
                  </span>
                </div>
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {mode !== 'forgot' && (
              <>
                {/* Senha */}
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                {mode === 'signup' && (
                  <>
                    {/* Confirmar Senha */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirme sua senha"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>

                    {/* Nome Completo */}
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nome Completo *</Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Seu nome completo"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>

                    {/* Cidade e Estado */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">Cidade *</Label>
                        <Input
                          id="city"
                          type="text"
                          placeholder="São Paulo"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">Estado *</Label>
                        <Input
                          id="state"
                          type="text"
                          placeholder="SP"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          required
                          maxLength={2}
                        />
                      </div>
                    </div>

                    {/* Data de Nascimento */}
                    <div className="space-y-2">
                      <Label htmlFor="birthDate">Data de Nascimento *</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        required
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    {/* Gênero */}
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gênero *</Label>
                      <Select value={gender} onValueChange={setGender}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione seu gênero" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="masculino">Masculino</SelectItem>
                          <SelectItem value="feminino">Feminino</SelectItem>
                          <SelectItem value="nao_binario">Não Binário</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                          <SelectItem value="prefiro_nao_dizer">Prefiro não dizer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Bio (Opcional) */}
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio (Opcional)</Label>
                      <Textarea
                        id="bio"
                        placeholder="Conte um pouco sobre você..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        maxLength={500}
                      />
                      <p className="text-xs text-muted-foreground">
                        {bio.length}/500 caracteres
                      </p>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Botão Principal */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                'Carregando...'
              ) : mode === 'login' ? (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Entrar
                </>
              ) : mode === 'signup' ? (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Criar Conta
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar Email
                </>
              )}
            </Button>
          </form>

          {/* Links de Navegação */}
          <div className="mt-6 space-y-2 text-center">
            {mode === 'login' && (
              <>
                <Button
                  variant="link"
                  onClick={() => switchMode('signup')}
                  className="text-sm w-full"
                >
                  Não tem conta? Criar uma
                </Button>
                <Button
                  variant="link"
                  onClick={() => switchMode('forgot')}
                  className="text-sm w-full"
                >
                  Esqueceu a senha?
                </Button>
              </>
            )}
            
            {mode === 'signup' && (
              <Button
                variant="link"
                onClick={() => switchMode('login')}
                className="text-sm w-full"
              >
                Já tem uma conta? Entrar
              </Button>
            )}
            
            {mode === 'forgot' && (
              <Button
                variant="link"
                onClick={() => switchMode('login')}
                className="text-sm w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para login
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;