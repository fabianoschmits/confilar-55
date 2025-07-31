import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Users, Star, Search } from "lucide-react";
import heroIllustration from "@/assets/hero-illustration.png";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white rounded-full animate-float"></div>
        <div className="absolute bottom-32 right-20 w-24 h-24 bg-white rounded-full animate-pulse-soft"></div>
        <div className="absolute top-1/2 right-10 w-16 h-16 bg-white rounded-full animate-float" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="text-center lg:text-left animate-fade-in">
            <div className="inline-flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2 mb-6 text-white text-sm">
              <Shield className="h-4 w-4" />
              <span>Rede Profissional Confiável</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Conecte-se com
              <span className="block bg-gradient-warm bg-clip-text text-transparent">
                profissionais de confiança
              </span>
            </h1>
            
            <p className="text-xl text-white/90 mb-8 max-w-lg">
              A rede social que conecta profissionais qualificados em serviços domésticos 
              e cuidados pessoais com quem realmente precisa. Segurança e confiança em primeiro lugar.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link to="/login">
                <Button size="lg" className="btn-hero text-lg px-8 py-4 w-full sm:w-auto">
                  <Users className="mr-2 h-5 w-5" />
                  Encontrar Profissionais
                </Button>
              </Link>
              <Link to="/login">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-lg px-8 py-4 w-full sm:w-auto"
                >
                  Sou Profissional
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 text-white/90">
              <div className="text-center">
                <div className="text-2xl font-bold">1000+</div>
                <div className="text-sm">Profissionais</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">5000+</div>
                <div className="text-sm">Avaliações</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">98%</div>
                <div className="text-sm">Satisfação</div>
              </div>
            </div>
          </div>

          {/* Right content - Illustration */}
          <div className="relative animate-slide-up">
            <div className="relative">
              <img 
                src={heroIllustration} 
                alt="ConfiLar - Conectando profissionais e famílias" 
                className="w-full h-auto rounded-2xl shadow-strong"
              />
              
              {/* Floating cards */}
              <Card className="absolute -top-4 -left-4 p-4 glass-card animate-float">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  <span className="text-sm font-semibold">4.9/5 ★★★★★</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Maria - Diarista</p>
              </Card>
              
              <Card className="absolute -bottom-4 -right-4 p-4 glass-card animate-float" style={{animationDelay: '0.5s'}}>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="text-sm font-semibold">Verificado</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">João - Cuidador</p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;