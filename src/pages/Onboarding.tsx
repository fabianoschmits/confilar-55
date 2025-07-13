import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  ArrowLeft,
  Check,
  Users,
  Briefcase,
  Home,
  Baby,
  ChefHat,
  Heart,
  Stethoscope,
  Sparkles,
  MapPin,
  Clock
} from "lucide-react";
import { Link } from "react-router-dom";
import confiarLogo from "@/assets/confilar-logo.png";

const services = [
  { id: "diarista", label: "Diarista", icon: Sparkles },
  { id: "domestica", label: "Empregada Doméstica", icon: Home },
  { id: "baba", label: "Babá", icon: Baby },
  { id: "cozinheira", label: "Cozinheira", icon: ChefHat },
  { id: "cuidador", label: "Cuidador de Idosos", icon: Heart },
  { id: "enfermeira", label: "Enfermeira", icon: Stethoscope }
];

const availability = [
  "Segunda-feira", "Terça-feira", "Quarta-feira", 
  "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"
];

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [userType, setUserType] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    services: [] as string[],
    availability: [] as string[],
    hourlyRate: "",
    bio: ""
  });

  const totalSteps = userType === "professional" ? 5 : 3;

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleService = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter(s => s !== serviceId)
        : [...prev.services, serviceId]
    }));
  };

  const toggleAvailability = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(day)
        ? prev.availability.filter(d => d !== day)
        : [...prev.availability, day]
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center space-y-6">
            <div className="mb-8">
              <img src={confiarLogo} alt="ConfiLar" className="h-16 w-16 mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-2">Bem-vindo ao ConfiLar</h1>
              <p className="text-muted-foreground">
                A rede social que conecta profissionais de confiança com quem precisa
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Como você quer usar o ConfiLar?</h2>
              
              <RadioGroup value={userType} onValueChange={setUserType}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="professional" id="professional" />
                    <div className="flex-1 text-left">
                      <div className="flex items-center space-x-2 mb-1">
                        <Briefcase className="h-5 w-5 text-primary" />
                        <Label htmlFor="professional" className="font-semibold">Sou Profissional</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Ofereço serviços domésticos e quero encontrar clientes
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="client" id="client" />
                    <div className="flex-1 text-left">
                      <div className="flex items-center space-x-2 mb-1">
                        <Users className="h-5 w-5 text-primary" />
                        <Label htmlFor="client" className="font-semibold">Busco Profissionais</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Preciso contratar serviços domésticos de confiança
                      </p>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Suas informações básicas</h2>
              <p className="text-muted-foreground">
                Vamos criar seu perfil no ConfiLar
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  placeholder="Seu nome completo"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  placeholder="(11) 99999-9999"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="location">Localização</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="location"
                    placeholder="Cidade, Estado"
                    className="pl-10"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        if (userType === "professional") {
          return (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Quais serviços você oferece?</h2>
                <p className="text-muted-foreground">
                  Selecione todos os serviços que você realiza
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                {services.map((service) => {
                  const isSelected = formData.services.includes(service.id);
                  return (
                    <div
                      key={service.id}
                      onClick={() => toggleService(service.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          isSelected ? 'bg-primary text-white' : 'bg-muted'
                        }`}>
                          <service.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{service.label}</h3>
                        </div>
                        {isSelected && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        } else {
          return (
            <div className="text-center space-y-6">
              <div>
                <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Tudo pronto!</h2>
                <p className="text-muted-foreground mb-6">
                  Seu perfil foi criado com sucesso. Agora você pode começar a buscar 
                  profissionais de confiança perto de você.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-1">Busque</h3>
                  <p className="text-muted-foreground">Encontre profissionais verificados</p>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-1">Converse</h3>
                  <p className="text-muted-foreground">Chat direto com profissionais</p>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Heart className="h-4 w-4 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-1">Avalie</h3>
                  <p className="text-muted-foreground">Deixe sua avaliação</p>
                </div>
              </div>

              <Link to="/feed">
                <Button size="lg" className="btn-hero">
                  Começar a usar ConfiLar
                </Button>
              </Link>
            </div>
          );
        }

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Sua disponibilidade</h2>
              <p className="text-muted-foreground">
                Em quais dias você está disponível?
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  <Clock className="h-4 w-4 inline mr-2" />
                  Dias da semana
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {availability.map((day) => {
                    const isSelected = formData.availability.includes(day);
                    return (
                      <div
                        key={day}
                        onClick={() => toggleAvailability(day)}
                        className={`p-3 border rounded-lg cursor-pointer text-center transition-all ${
                          isSelected 
                            ? 'border-primary bg-primary text-white' 
                            : 'border-border hover:bg-muted/50'
                        }`}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <Label htmlFor="hourlyRate">Valor por hora</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    R$
                  </span>
                  <Input
                    id="hourlyRate"
                    placeholder="35,00"
                    className="pl-8"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Conte um pouco sobre você</h2>
              <p className="text-muted-foreground">
                Descreva sua experiência e diferencial
              </p>
            </div>

            <div>
              <Label htmlFor="bio">Descrição do perfil</Label>
              <textarea
                id="bio"
                placeholder="Ex: Sou uma profissional dedicada com 5 anos de experiência..."
                className="w-full p-3 border border-input rounded-md resize-none"
                rows={6}
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Esta descrição aparecerá no seu perfil público
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                <Check className="h-10 w-10 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Perfil quase pronto!</h3>
                <p className="text-muted-foreground">
                  Clique em finalizar para começar a receber solicitações
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-strong">
        <CardContent className="p-8">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Passo {currentStep} de {totalSteps}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round((currentStep / totalSteps) * 100)}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Step Content */}
          <div className="mb-8">
            {renderStep()}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar</span>
            </Button>

            {currentStep === totalSteps ? (
              <Link to="/feed">
                <Button className="btn-hero flex items-center space-x-2">
                  <span>Finalizar</span>
                  <Check className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Button
                onClick={nextStep}
                disabled={
                  (currentStep === 1 && !userType) ||
                  (currentStep === 2 && (!formData.name || !formData.email)) ||
                  (currentStep === 3 && userType === "professional" && formData.services.length === 0)
                }
                className="btn-hero flex items-center space-x-2"
              >
                <span>Continuar</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;