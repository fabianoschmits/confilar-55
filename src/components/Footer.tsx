import { Heart, Shield, Star, Mail, Phone, MapPin } from "lucide-react";
import confiarLogo from "@/assets/confilar-logo.png";

const Footer = () => {
  return (
    <footer className="bg-gradient-blue text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <img src={confiarLogo} alt="ConfiLar" className="h-12 w-12" />
              <h3 className="text-2xl font-bold">ConfiLar</h3>
            </div>
            
            <p className="text-white/80 mb-6 max-w-md">
              A rede social que conecta profissionais qualificados em serviços domésticos 
              e cuidados pessoais com quem realmente precisa. Segurança e confiança em primeiro lugar.
            </p>
            
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <Shield className="h-4 w-4" />
                <span>Verificado</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Star className="h-4 w-4" />
                <span>4.9/5 Avaliação</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Heart className="h-4 w-4" />
                <span>1000+ Profissionais</span>
              </div>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-white/80">
              <li><a href="#home" className="hover:text-white transition-colors">Início</a></li>
              <li><a href="#profissionais" className="hover:text-white transition-colors">Profissionais</a></li>
              <li><a href="#como-funciona" className="hover:text-white transition-colors">Como Funciona</a></li>
              <li><a href="#sobre" className="hover:text-white transition-colors">Sobre Nós</a></li>
              <li><a href="#contato" className="hover:text-white transition-colors">Contato</a></li>
            </ul>
          </div>

          {/* Serviços */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Serviços</h4>
            <ul className="space-y-2 text-white/80">
              <li>Diaristas</li>
              <li>Empregadas Domésticas</li>
              <li>Babás e Cuidadoras</li>
              <li>Cozinheiras</li>
              <li>Cuidadores de Idosos</li>
              <li>Enfermeiras</li>
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-white/20 mt-12 pt-8">
          <div className="grid md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <Mail className="h-5 w-5" />
              <span>contato@confilar.com.br</span>
            </div>
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <Phone className="h-5 w-5" />
              <span>(11) 99999-9999</span>
            </div>
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <MapPin className="h-5 w-5" />
              <span>São Paulo, Brasil</span>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-white/60">
          <p>&copy; 2024 ConfiLar. Todos os direitos reservados.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#privacidade" className="hover:text-white transition-colors">Política de Privacidade</a>
            <a href="#termos" className="hover:text-white transition-colors">Termos de Uso</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;