import { useState } from "react";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Search, 
  MessageCircle, 
  User, 
  Menu, 
  Bell,
  Heart,
  Settings,
  LogOut,
  Plus,
  Shield,
  TrendingUp
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import confiarLogo from "@/assets/confilar-logo.png";

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isAdmin } = useUserRole();
  const { signOut } = useAuth();

  const navItems = [
    { icon: Home, label: "Início", path: "/feed", badge: null, description: "Atividades de todos os usuários" },
    { icon: TrendingUp, label: "Explorar", path: "/explorar", badge: null, description: "Descubra conteúdo em alta" },
    { icon: Search, label: "Buscar", path: "/buscar", badge: null, description: "Buscar posts e usuários" },
    { icon: MessageCircle, label: "Chat", path: "/chat", badge: null, description: "Conversas" },
    { icon: Bell, label: "Notificações", path: "/notificacoes", badge: null, description: "Notificações" },
    { icon: User, label: "Perfil", path: "/perfil", badge: null, description: "Meu perfil" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden md:flex sticky top-0 z-50 w-full bg-white/98 backdrop-blur-md border-b border-border/30 shadow-soft">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/feed" className="flex items-center space-x-3">
            <img src={confiarLogo} alt="ConfiLar" className="h-10 w-10" />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              ConfiLar
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? "bg-primary text-white"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <div className="relative">
                  <item.icon className="h-5 w-5" />
                  {item.badge && (
                    <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs bg-destructive">
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            <Link to="/postar-trabalho">
              <Button size="sm" className="btn-hero">
                <Plus className="h-4 w-4 mr-2" />
                Publicar
              </Button>
            </Link>
            {isAdmin() && (
              <Link to="/admin">
                <Button variant="outline" size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              </Link>
            )}
            <Link to="/configuracoes">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Mobile Header */}
        <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-border shadow-soft">
          <div className="flex items-center justify-between px-4 h-16">
            <Link to="/feed" className="flex items-center space-x-2">
              <img src={confiarLogo} alt="ConfiLar" className="h-8 w-8" />
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                ConfiLar
              </h1>
            </Link>

            <div className="flex items-center space-x-2">
              <Link to="/notificacoes">
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                </Button>
              </Link>
              
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="flex flex-col space-y-4 mt-8">
                    <div className="flex items-center space-x-3 p-4 bg-muted rounded-lg">
                      <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-semibold">
                        M
                      </div>
                      <div>
                        <h3 className="font-semibold">Maria Silva</h3>
                        <p className="text-sm text-muted-foreground">Profissional</p>
                      </div>
                    </div>

                    <nav className="space-y-2">
                      {navItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                            isActive(item.path)
                              ? "bg-primary text-white"
                              : "hover:bg-muted"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <item.icon className="h-5 w-5" />
                            <span className="font-medium">{item.label}</span>
                          </div>
                          {item.badge && (
                            <Badge className="bg-destructive">
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      ))}
                    </nav>

                    <div className="border-t pt-4 space-y-2">
                      {isAdmin() && (
                        <Link 
                          to="/admin"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted"
                        >
                          <Shield className="h-5 w-5" />
                          <span>Administração</span>
                        </Link>
                      )}
                      
                      <Link 
                        to="/configuracoes"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted"
                      >
                        <Settings className="h-5 w-5" />
                        <span>Configurações</span>
                      </Link>
                      
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-destructive hover:bg-destructive/10"
                        onClick={async () => {
                          try {
                            await signOut();
                            window.location.href = '/';
                          } catch (error) {
                            console.error('Erro ao sair:', error);
                          }
                        }}
                      >
                        <LogOut className="h-5 w-5 mr-3" />
                        Sair
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border shadow-strong">
          <div className="flex items-center justify-around py-2">
            {navItems.slice(0, 5).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <div className="relative">
                  <item.icon className="h-5 w-5" />
                  {item.badge && (
                    <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs bg-destructive">
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
};

export default Navigation;