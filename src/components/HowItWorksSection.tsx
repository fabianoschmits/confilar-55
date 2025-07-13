import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, MessageCircle, Star, UserPlus, Heart, Shield } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    number: "01",
    title: "Cadastre-se",
    description: "Crie seu perfil gratuitamente escolhendo se você é profissional ou contratante.",
    color: "bg-blue-500"
  },
  {
    icon: Search,
    number: "02", 
    title: "Busque e Filtre",
    description: "Use nossos filtros avançados para encontrar o profissional ideal próximo a você.",
    color: "bg-orange-500"
  },
  {
    icon: MessageCircle,
    number: "03",
    title: "Converse",
    description: "Chat direto com o profissional para tirar dúvidas e agendar o serviço.",
    color: "bg-green-500"
  },
  {
    icon: Star,
    number: "04",
    title: "Avalie",
    description: "Após o serviço, deixe sua avaliação para ajudar outros usuários.",
    color: "bg-purple-500"
  }
];

const benefits = [
  {
    icon: Shield,
    title: "Segurança Garantida",
    description: "Todos os profissionais passam por verificação de identidade e referências."
  },
  {
    icon: Star,
    title: "Avaliações Reais",
    description: "Sistema transparente de avaliações de clientes anteriores."
  },
  {
    icon: Heart,
    title: "Relacionamento Humano",
    description: "Priorizamos a construção de relacionamentos de confiança duradouros."
  }
];

const HowItWorksSection = () => {
  return (
    <section id="como-funciona" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Como Funciona */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center space-x-2 bg-primary/10 rounded-full px-4 py-2 mb-4 text-primary text-sm">
            <Shield className="h-4 w-4" />
            <span>Processo Simples e Seguro</span>
          </div>
          
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Como Funciona o
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              ConfiLar?
            </span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Em poucos passos você encontra o profissional ideal ou começa a receber 
            solicitações para seus serviços. É fácil, rápido e seguro.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {steps.map((step, index) => (
            <div key={step.number} className="relative animate-slide-up" style={{animationDelay: `${index * 0.2}s`}}>
              <Card className="text-center hover:shadow-medium transition-all duration-300 border-border/50 group">
                <CardContent className="p-6">
                  <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <div className="text-3xl font-bold text-muted-foreground/30 mb-2">
                    {step.number}
                  </div>
                  
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {step.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
              
              {/* Arrow for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                  <div className="w-6 h-0.5 bg-gradient-primary"></div>
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-primary border-t-2 border-b-2 border-t-transparent border-b-transparent"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div className="bg-gradient-peach rounded-3xl p-8 lg:p-12 animate-fade-in">
          <div className="text-center mb-12">
            <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
              Por que escolher o ConfiLar?
            </h3>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Mais que uma plataforma, somos uma comunidade dedicada à confiança e qualidade.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div 
                key={benefit.title} 
                className="text-center animate-slide-up"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-soft">
                  <benefit.icon className="h-8 w-8 text-primary" />
                </div>
                
                <h4 className="text-xl font-semibold text-foreground mb-3">
                  {benefit.title}
                </h4>
                
                <p className="text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" className="btn-hero text-lg px-8 py-4">
              Começar Agora
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;