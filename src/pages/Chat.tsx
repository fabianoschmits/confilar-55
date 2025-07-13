import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Send, 
  Search,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  ArrowLeft
} from "lucide-react";
import Navigation from "@/components/Navigation";

// Mock data
const conversations = [
  {
    id: 1,
    user: {
      name: "Maria Santos",
      role: "Diarista",
      avatar: null,
      online: true
    },
    lastMessage: "Perfeito! Posso começar amanhã às 8h",
    time: "10:30",
    unread: 2
  },
  {
    id: 2,
    user: {
      name: "João Silva",
      role: "Cuidador de Idosos",
      avatar: null,
      online: false
    },
    lastMessage: "Obrigado pela confiança! Vou cuidar muito bem da sua mãe",
    time: "09:45",
    unread: 0
  },
  {
    id: 3,
    user: {
      name: "Ana Costa",
      role: "Babá",
      avatar: null,
      online: true
    },
    lastMessage: "As crianças adoraram as atividades de hoje!",
    time: "Ontem",
    unread: 1
  }
];

const messages = [
  {
    id: 1,
    text: "Oi! Vi seu perfil e gostaria de saber se você tem disponibilidade para uma faxina completa na próxima semana?",
    isMine: true,
    time: "09:30"
  },
  {
    id: 2,
    text: "Olá! Claro, tenho sim! Qual seria o dia e horário que você prefere?",
    isMine: false,
    time: "09:32"
  },
  {
    id: 3,
    text: "Seria na terça-feira pela manhã. O apartamento tem 3 quartos e 2 banheiros.",
    isMine: true,
    time: "09:35"
  },
  {
    id: 4,
    text: "Perfeito! Para esse tamanho, cobro R$ 120 e levo cerca de 4 horas. Inclui todos os cômodos e produtos de limpeza.",
    isMine: false,
    time: "09:40"
  },
  {
    id: 5,
    text: "Ótimo! Pode vir às 8h da manhã?",
    isMine: true,
    time: "10:25"
  },
  {
    id: 6,
    text: "Perfeito! Posso começar amanhã às 8h",
    isMine: false,
    time: "10:30"
  }
];

const Chat = () => {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(1);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      console.log("Enviando mensagem:", newMessage);
      setNewMessage("");
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedUser = conversations.find(conv => conv.id === selectedConversation)?.user;

  return (
    <div className="min-h-screen bg-muted/30 pb-20 md:pb-0">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <div className={`${selectedConversation ? 'hidden md:block' : ''} md:col-span-1`}>
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3">
                <h2 className="text-xl font-bold">Conversas</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar conversas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-y-auto p-0">
                <div className="space-y-1">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation.id)}
                      className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors border-l-4 ${
                        selectedConversation === conversation.id 
                          ? 'bg-primary/10 border-l-primary' 
                          : 'border-l-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={conversation.user.avatar || undefined} />
                            <AvatarFallback className="bg-gradient-primary text-white">
                              {conversation.user.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          {conversation.user.online && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold truncate">{conversation.user.name}</h3>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-muted-foreground">{conversation.time}</span>
                              {conversation.unread > 0 && (
                                <Badge className="bg-primary text-white h-5 w-5 p-0 text-xs flex items-center justify-center">
                                  {conversation.unread}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{conversation.user.role}</p>
                          <p className="text-sm text-muted-foreground truncate mt-1">
                            {conversation.lastMessage}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className={`${!selectedConversation ? 'hidden md:block' : ''} md:col-span-2`}>
            {selectedConversation ? (
              <Card className="h-full flex flex-col">
                {/* Chat Header */}
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setSelectedConversation(null)}
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </Button>
                      
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={selectedUser?.avatar || undefined} />
                          <AvatarFallback className="bg-gradient-primary text-white">
                            {selectedUser?.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {selectedUser?.online && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="font-semibold">{selectedUser?.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedUser?.online ? 'Online agora' : 'Visto por último há 2h'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon">
                        <Phone className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Video className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          message.isMine
                            ? 'bg-primary text-white'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p className={`text-xs mt-1 ${
                          message.isMine ? 'text-white/70' : 'text-muted-foreground'
                        }`}>
                          {message.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon">
                      <Paperclip className="h-5 w-5" />
                    </Button>
                    
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Digite sua mensagem..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="pr-10"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2"
                      >
                        <Smile className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Button
                      onClick={handleSendMessage}
                      className="btn-hero"
                      disabled={!newMessage.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Selecione uma conversa</h3>
                  <p className="text-muted-foreground">
                    Escolha uma conversa da lista para começar a conversar
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;