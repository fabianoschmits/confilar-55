import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, Send, User, Plus, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  created_at: string;
  updated_at: string;
  other_participant?: {
    full_name?: string;
    avatar_url?: string;
  };
  last_message?: {
    content: string;
    created_at: string;
  };
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  sender?: {
    full_name?: string;
    avatar_url?: string;
  };
}

const Chat = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
      // Configurar realtime para mensagens
      const channel = supabase
        .channel(`messages:${selectedConversation}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${selectedConversation}`,
          },
          (payload) => {
            fetchMessages(selectedConversation);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      // Temporarily disable conversations until table types are updated
      const data: any[] = [];
      const error = null;

      if (error) throw error;

      // Buscar informações dos outros participantes
      const conversationsWithParticipants = await Promise.all(
        (data || []).map(async (conv) => {
          const otherParticipantId = conv.participant1_id === user?.id 
            ? conv.participant2_id 
            : conv.participant1_id;

          const { data: participantData } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('user_id', otherParticipantId)
            .single();

          return {
            ...conv,
            other_participant: participantData,
            last_message: conv.messages?.[0] || null
          };
        })
      );

      setConversations(conversationsWithParticipants);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as conversas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      // Temporarily disable messages until table types are updated
      const data: any[] = [];
      const error = null;

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setSendingMessage(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          content: newMessage.trim(),
          sender_id: user?.id,
          receiver_id: 'temp', // This needs to be updated once conversations table is working
        }]);

      if (error) throw error;

      // Conversation update temporarily disabled

      setNewMessage('');
      fetchConversations(); // Atualizar lista de conversas
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem.",
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-muted/30">
        <Navigation />
        <div className="container mx-auto px-4 py-6">
          <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            {/* Lista de Conversas */}
            <Card className="lg:col-span-1 bg-card rounded-2xl shadow-lg border-0">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground">Conversas</h2>
                  <Button size="sm" variant="outline" className="rounded-full">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-4 space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="animate-pulse flex items-center space-x-3 p-3">
                        <div className="w-12 h-12 bg-muted rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nenhuma conversa</h3>
                    <p className="text-muted-foreground text-sm">
                      Inicie uma conversa visitando o perfil de alguém
                    </p>
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`p-4 cursor-pointer hover:bg-muted/50 transition-all duration-200 border-l-4 ${
                          selectedConversation === conversation.id 
                            ? 'bg-primary/10 border-l-primary' 
                            : 'border-l-transparent'
                        }`}
                        onClick={() => setSelectedConversation(conversation.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                            <AvatarImage src={conversation.other_participant?.avatar_url} />
                            <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                              {conversation.other_participant?.full_name?.[0] || <User className="h-5 w-5" />}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground truncate">
                              {conversation.other_participant?.full_name || 'Usuário'}
                            </p>
                            {conversation.last_message && (
                              <>
                                <p className="text-sm text-muted-foreground truncate">
                                  {conversation.last_message.content}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(conversation.last_message.created_at), { 
                                    addSuffix: true, 
                                    locale: ptBR 
                                  })}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Área de Chat */}
            <Card className="lg:col-span-2 flex flex-col bg-card rounded-2xl shadow-lg border-0">
              {selectedConversation ? (
                <>
                  {/* Header do Chat */}
                  <CardHeader className="border-b border-border/50">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                        <AvatarImage src={conversations.find(c => c.id === selectedConversation)?.other_participant?.avatar_url} />
                        <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                          {conversations.find(c => c.id === selectedConversation)?.other_participant?.full_name?.[0] || <User className="h-5 w-5" />}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">
                          {conversations.find(c => c.id === selectedConversation)?.other_participant?.full_name || 'Usuário'}
                        </h3>
                        <p className="text-sm text-muted-foreground">Online</p>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Mensagens */}
                  <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
                    {messages.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                          <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                          <p className="text-muted-foreground">
                            Nenhuma mensagem ainda. Seja o primeiro a enviar!
                          </p>
                        </div>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                              message.sender_id === user?.id
                                ? 'bg-gradient-primary text-primary-foreground rounded-br-md'
                                : 'bg-card border border-border/50 text-foreground rounded-bl-md'
                            }`}
                          >
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                            <p className={`text-xs mt-2 ${
                              message.sender_id === user?.id 
                                ? 'text-primary-foreground/70' 
                                : 'text-muted-foreground'
                            }`}>
                              {formatDistanceToNow(new Date(message.created_at), { 
                                addSuffix: true, 
                                locale: ptBR 
                              })}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </CardContent>

                  {/* Input de Mensagem */}
                  <div className="p-4 border-t border-border/50 bg-card">
                    <div className="flex gap-3">
                      <Input
                        placeholder="Digite sua mensagem..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1 rounded-full border-2 focus:border-primary bg-background"
                        disabled={sendingMessage}
                      />
                      <Button 
                        onClick={sendMessage} 
                        disabled={!newMessage.trim() || sendingMessage}
                        className="rounded-full px-6 bg-gradient-primary hover:opacity-90 transition-all duration-200"
                        size="sm"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <CardContent className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="h-20 w-20 mx-auto text-muted-foreground mb-6" />
                    <h3 className="text-2xl font-bold mb-3 text-foreground">Selecione uma conversa</h3>
                    <p className="text-muted-foreground max-w-md">
                      Escolha uma conversa da lista ao lado para começar a trocar mensagens de forma fácil e intuitiva.
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
        <div className="h-20 lg:hidden"></div>
      </div>
    </ProtectedRoute>
  );
};

export default Chat;