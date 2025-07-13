import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Star, 
  MapPin, 
  Clock,
  MoreHorizontal,
  Camera,
  Plus
} from "lucide-react";
import Navigation from "@/components/Navigation";

// Mock data
const posts = [
  {
    id: 1,
    user: {
      name: "Maria Santos",
      role: "Diarista",
      avatar: null,
      rating: 4.9,
      verified: true
    },
    content: "Acabei de finalizar um trabalho incrível! Casa toda organizada e brilhando ✨",
    images: ["/placeholder.svg"],
    likes: 24,
    comments: 8,
    shares: 3,
    timeAgo: "2h",
    location: "São Paulo, SP"
  },
  {
    id: 2,
    user: {
      name: "João Silva",
      role: "Cuidador de Idosos",
      avatar: null,
      rating: 5.0,
      verified: true
    },
    content: "Hoje foi um dia especial cuidando da Dona Helena. Fizemos um bolo de chocolate juntos! 👨‍🍳❤️",
    images: ["/placeholder.svg", "/placeholder.svg"],
    likes: 45,
    comments: 12,
    shares: 6,
    timeAgo: "4h",
    location: "Rio de Janeiro, RJ"
  },
  {
    id: 3,
    user: {
      name: "Ana Costa",
      role: "Babá",
      avatar: null,
      rating: 4.8,
      verified: true
    },
    content: "Brincadeira no parque com os pequenos! Nada melhor que ver eles felizes e aprendendo 🌟",
    images: ["/placeholder.svg"],
    likes: 67,
    comments: 15,
    shares: 9,
    timeAgo: "6h",
    location: "Belo Horizonte, MG"
  }
];

const Feed = () => {
  const [likedPosts, setLikedPosts] = useState<number[]>([]);

  const toggleLike = (postId: number) => {
    setLikedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-20 md:pb-0">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Create Post Card */}
        <Card className="mb-6 shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback className="bg-gradient-primary text-white">
                  M
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-muted-foreground"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Compartilhe seu trabalho...
                </Button>
              </div>
              <Button size="icon" variant="outline">
                <Camera className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.map((post) => (
            <Card key={post.id} className="shadow-soft hover:shadow-medium transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={post.user.avatar || undefined} />
                      <AvatarFallback className="bg-gradient-primary text-white">
                        {post.user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{post.user.name}</h3>
                        {post.user.verified && (
                          <Badge variant="secondary" className="text-xs">
                            ✓ Verificado
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>{post.user.role}</span>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{post.user.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{post.location}</span>
                        <span>•</span>
                        <Clock className="h-3 w-3" />
                        <span>{post.timeAgo}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="mb-4 leading-relaxed">{post.content}</p>
                
                {/* Images */}
                {post.images.length > 0 && (
                  <div className={`grid gap-2 mb-4 ${
                    post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                  }`}>
                    {post.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Trabalho de ${post.user.name}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Engagement Stats */}
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-3 pb-3 border-b">
                  <div className="flex items-center space-x-4">
                    <span>{post.likes} curtidas</span>
                    <span>{post.comments} comentários</span>
                  </div>
                  <span>{post.shares} compartilhamentos</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center space-x-2 ${
                      likedPosts.includes(post.id) 
                        ? 'text-red-500 hover:text-red-600' 
                        : 'hover:text-red-500'
                    }`}
                  >
                    <Heart 
                      className={`h-5 w-5 ${
                        likedPosts.includes(post.id) ? 'fill-current' : ''
                      }`} 
                    />
                    <span>Curtir</span>
                  </Button>
                  
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <MessageCircle className="h-5 w-5" />
                    <span>Comentar</span>
                  </Button>
                  
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <Share2 className="h-5 w-5" />
                    <span>Compartilhar</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button variant="outline" size="lg">
            Carregar mais posts
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Feed;