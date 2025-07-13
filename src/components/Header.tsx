import { Button } from "@/components/ui/button";
import { Heart, Menu, User } from "lucide-react";
import confiarLogo from "@/assets/confilar-logo.png";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-border shadow-soft">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <img src={confiarLogo} alt="ConfiLar" className="h-10 w-10" />
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            ConfiLar
          </h1>
        </div>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#home" className="text-foreground hover:text-primary transition-colors">
            Início
          </a>
          <a href="#profissionais" className="text-foreground hover:text-primary transition-colors">
            Profissionais
          </a>
          <a href="#como-funciona" className="text-foreground hover:text-primary transition-colors">
            Como Funciona
          </a>
          <a href="#sobre" className="text-foreground hover:text-primary transition-colors">
            Sobre
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          <Button variant="ghost" className="hidden sm:flex" asChild>
            <a href="/login">Entrar</a>
          </Button>
          <Button className="btn-hero hidden sm:flex" asChild>
            <a href="/login">Cadastrar</a>
          </Button>
          
          {/* Mobile menu button */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;