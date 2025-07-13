import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, MessageCircle, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ServicesSection = () => {
  const navigate = useNavigate();
  
  const services = [
    {
      icon: Shield,
      title: "Confissões Anônimas",
      description: "Compartilhe seus pensamentos de forma segura e anônima, sem julgamentos.",
      action: () => navigate('/login'),
    },
    {
      icon: Users,
      title: "Comunidade Acolhedora",
      description: "Conecte-se com pessoas que passaram por experiências similares.",
      action: () => navigate('/login'),
    },
    {
      icon: MessageCircle,
      title: "Conversas Privadas",
      description: "Tenha conversas privadas e seguras com outros membros da comunidade.",
      action: () => navigate('/login'),
    },
    {
      icon: Heart,
      title: "Apoio Emocional",
      description: "Receba e ofereça apoio emocional em um ambiente seguro e respeitoso.",
      action: () => navigate('/login'),
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-foreground">
            Funcionalidades
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Uma plataforma completa e gratuita para confissões anônimas e apoio comunitário
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <service.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl mb-2">{service.title}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary mb-4">
                  Grátis
                </div>
                <Button className="w-full" onClick={service.action}>
                  Começar Agora
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;