import { Card, CardContent } from "@/components/ui/card";
import { 
  Home, 
  Baby, 
  ChefHat, 
  Heart, 
  Stethoscope, 
  Sparkles,
  UserCheck,
  Shield
} from "lucide-react";

const services = [
  {
    icon: Sparkles,
    title: "Diaristas",
    description: "Profissionais especializados em limpeza doméstica, organizados e confiáveis.",
    color: "bg-blue-50 text-blue-600"
  },
  {
    icon: Home,
    title: "Empregadas Domésticas",
    description: "Cuidado completo do lar com profissionais experientes e dedicados.",
    color: "bg-orange-50 text-orange-600"
  },
  {
    icon: Baby,
    title: "Babás",
    description: "Cuidadoras especializadas no bem-estar e desenvolvimento das crianças.",
    color: "bg-pink-50 text-pink-600"
  },
  {
    icon: ChefHat,
    title: "Cozinheiras",
    description: "Especialistas culinárias para preparar refeições saudáveis e saborosas.",
    color: "bg-green-50 text-green-600"
  },
  {
    icon: Heart,
    title: "Cuidadores de Idosos",
    description: "Profissionais dedicados ao cuidado e companhia de pessoas da terceira idade.",
    color: "bg-purple-50 text-purple-600"
  },
  {
    icon: Stethoscope,
    title: "Enfermeiras",
    description: "Cuidados de saúde especializados no conforto do seu lar.",
    color: "bg-red-50 text-red-600"
  }
];

const ServicesSection = () => {
  return (
    <section id="profissionais" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center space-x-2 bg-accent/20 rounded-full px-4 py-2 mb-4 text-accent-foreground text-sm">
            <UserCheck className="h-4 w-4" />
            <span>Profissionais Verificados</span>
          </div>
          
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Serviços Domésticos e
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              Cuidados Pessoais
            </span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Encontre profissionais qualificados e verificados para todos os tipos de serviços domésticos. 
            Cada perfil é cuidadosamente analisado para garantir sua tranquilidade.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <Card 
              key={service.title} 
              className="group hover:shadow-medium transition-all duration-300 hover:-translate-y-1 animate-slide-up border-border/50"
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-xl ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon className="h-6 w-6" />
                </div>
                
                <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
                
                <div className="flex items-center mt-4 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 mr-2 text-primary" />
                  <span>Perfis verificados</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Card className="inline-block glass-card p-6 animate-pulse-soft">
            <div className="flex items-center justify-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">98%</div>
                <div className="text-sm text-muted-foreground">Taxa de Aprovação</div>
              </div>
              <div className="w-px h-12 bg-border"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">24h</div>
                <div className="text-sm text-muted-foreground">Resposta Média</div>
              </div>
              <div className="w-px h-12 bg-border"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">4.9★</div>
                <div className="text-sm text-muted-foreground">Avaliação Média</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;