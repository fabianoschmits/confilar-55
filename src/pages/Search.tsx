import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search as SearchIcon, 
  MapPin, 
  Star, 
  Filter,
  Heart,
  MessageCircle,
  Phone,
  ChevronDown
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navigation from "@/components/Navigation";

// Mock data
const professionals = [
  {
    id: 1,
    name: "Maria Santos",
    role: "Diarista",
    rating: 4.9,
    reviews: 127,
    location: "São Paulo, SP",
    distance: "2.5 km",
    hourlyRate: "R$ 35/hora",
    avatar: null,
    verified: true,
    favorite: false,
    bio: "Especialista em limpeza residencial com 8 anos de experiência. Trabalho com produtos ecológicos.",
    services: ["Limpeza Geral", "Organização", "Passar Roupa"],
    availability: "Disponível hoje"
  },
  {
    id: 2,
    name: "João Silva",
    role: "Cuidador de Idosos",
    rating: 5.0,
    reviews: 89,
    location: "São Paulo, SP",
    distance: "3.2 km",
    hourlyRate: "R$ 45/hora",
    avatar: null,
    verified: true,
    favorite: true,
    bio: "Enfermeiro especializado em cuidados geriátricos. Experiência com Alzheimer e demência.",
    services: ["Cuidados Básicos", "Medicamentos", "Companhia"],
    availability: "Disponível amanhã"
  },
  {
    id: 3,
    name: "Ana Costa",
    role: "Babá",
    rating: 4.8,
    reviews: 203,
    location: "São Paulo, SP",
    distance: "1.8 km",
    hourlyRate: "R$ 40/hora",
    avatar: null,
    verified: true,
    favorite: false,
    bio: "Pedagoga com especialização em desenvolvimento infantil. Amo trabalhar com crianças!",
    services: ["Cuidar de Crianças", "Atividades Educativas", "Refeições"],
    availability: "Disponível hoje"
  }
];

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedRating, setSelectedRating] = useState("");
  const [favorites, setFavorites] = useState<number[]>([2]);
  const [showFilters, setShowFilters] = useState(false);

  const toggleFavorite = (professionalId: number) => {
    setFavorites(prev => 
      prev.includes(professionalId) 
        ? prev.filter(id => id !== professionalId)
        : [...prev, professionalId]
    );
  };

  const filteredProfessionals = professionals.filter(professional => {
    const matchesSearch = professional.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         professional.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesService = !selectedService || professional.services.some(service => 
      service.toLowerCase().includes(selectedService.toLowerCase()));
    const matchesRating = !selectedRating || professional.rating >= parseFloat(selectedRating);
    
    return matchesSearch && matchesService && matchesRating;
  });

  return (
    <div className="min-h-screen bg-muted/30 pb-20 md:pb-0">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6">
        {/* Search Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">Encontrar Profissionais</h1>
          
          {/* Search Bar */}
          <div className="relative mb-4">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Buscar por nome, serviço ou localização..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 text-lg"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center space-x-3 mb-4">
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Filtros</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
            
            <div className="flex space-x-2">
              <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-white">
                Próximo a mim
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-white">
                Disponível hoje
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-white">
                Melhor avaliados
              </Badge>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Serviço</label>
                    <Select value={selectedService} onValueChange={setSelectedService}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os serviços" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos os serviços</SelectItem>
                        <SelectItem value="diarista">Diarista</SelectItem>
                        <SelectItem value="baba">Babá</SelectItem>
                        <SelectItem value="cuidador">Cuidador de Idosos</SelectItem>
                        <SelectItem value="cozinheira">Cozinheira</SelectItem>
                        <SelectItem value="enfermeira">Enfermeira</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Avaliação Mínima</label>
                    <Select value={selectedRating} onValueChange={setSelectedRating}>
                      <SelectTrigger>
                        <SelectValue placeholder="Qualquer avaliação" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Qualquer avaliação</SelectItem>
                        <SelectItem value="4.5">4.5+ estrelas</SelectItem>
                        <SelectItem value="4.0">4.0+ estrelas</SelectItem>
                        <SelectItem value="3.5">3.5+ estrelas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Distância</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Qualquer distância" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Até 1 km</SelectItem>
                        <SelectItem value="5">Até 5 km</SelectItem>
                        <SelectItem value="10">Até 10 km</SelectItem>
                        <SelectItem value="20">Até 20 km</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {filteredProfessionals.length} profissionais encontrados
            </h2>
            <Select defaultValue="rating">
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Melhor avaliados</SelectItem>
                <SelectItem value="distance">Mais próximos</SelectItem>
                <SelectItem value="price">Menor preço</SelectItem>
                <SelectItem value="reviews">Mais avaliações</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredProfessionals.map((professional) => (
            <Card key={professional.id} className="hover:shadow-medium transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start space-x-4 mb-4 md:mb-0">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={professional.avatar || undefined} />
                      <AvatarFallback className="bg-gradient-primary text-white text-lg">
                        {professional.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-xl font-semibold">{professional.name}</h3>
                        {professional.verified && (
                          <Badge variant="secondary" className="text-xs">
                            ✓ Verificado
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-muted-foreground mb-1">{professional.role}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{professional.rating}</span>
                          <span>({professional.reviews} avaliações)</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{professional.distance}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm mb-2">{professional.bio}</p>
                      
                      <div className="flex flex-wrap gap-1 mb-2">
                        {professional.services.map((service) => (
                          <Badge key={service} variant="outline" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold text-primary">{professional.hourlyRate}</span>
                          <span className="text-sm text-green-600 ml-2">• {professional.availability}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 md:ml-4">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => toggleFavorite(professional.id)}
                        className={favorites.includes(professional.id) ? 'text-red-500 border-red-500' : ''}
                      >
                        <Heart className={`h-4 w-4 ${favorites.includes(professional.id) ? 'fill-current' : ''}`} />
                      </Button>
                      
                      <Button variant="outline" size="icon">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      
                      <Button variant="outline" size="icon">
                        <Phone className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Button className="btn-hero">
                      Ver Perfil
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Search;