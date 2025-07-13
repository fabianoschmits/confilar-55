import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Bell,
  MessageCircle,
  Star,
  Heart,
  UserPlus,
  Calendar,
  Check,
  X,
  Settings,
  Filter
} from "lucide-react";
import Navigation from "@/components/Navigation";

// Mock data
const notifications = [
  {
    id: 1,
    type: "message",
    title: "Nova mensagem",
    content: "João Silva enviou uma mensagem",
    user: {
      name: "João Silva",
      avatar: null,
      role: "Cuidador de Idosos"
    },
    time: "Há 5 min",
    read: false
  },
  {
    id: 2,
    type: "review",
    title: "Nova avaliação",
    content: "Ana Costa deixou uma avaliação de 5 estrelas para você",
    user: {
      name: "Ana Costa",
      avatar: null,
      role: "Cliente"
    },
    time: "Há 1 hora",
    read: false
  },
  {
    id: 3,
    type: "like",
    title: "Curtida no post",
    content: "Maria Santos curtiu sua publicação",
    user: {
      name: "Maria Santos",
      avatar: null,
      role: "Diarista"
    },
    time: "Há 2 horas",
    read: true
  },
  {
    id: 4,
    type: "follow",
    title: "Novo seguidor",
    content: "Carlos Lima começou a seguir você",
    user: {
      name: "Carlos Lima",
      avatar: null,
      role: "Cliente"
    },
    time: "Há 3 horas",
    read: true
  },
  {
    id: 5,
    type: "booking",
    title: "Novo agendamento",
    content: "Fernanda Oliveira agendou um serviço para amanhã",
    user: {
      name: "Fernanda Oliveira",
      avatar: null,
      role: "Cliente"
    },
    time: "Há 5 horas",
    read: false
  }
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "message":
      return MessageCircle;
    case "review":
      return Star;
    case "like":
      return Heart;
    case "follow":
      return UserPlus;
    case "booking":
      return Calendar;
    default:
      return Bell;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case "message":
      return "text-blue-500";
    case "review":
      return "text-yellow-500";
    case "like":
      return "text-red-500";
    case "follow":
      return "text-green-500";
    case "booking":
      return "text-purple-500";
    default:
      return "text-gray-500";
  }
};

const Notifications = () => {
  const [filter, setFilter] = useState("all");
  const [readNotifications, setReadNotifications] = useState<number[]>([3, 4]);

  const markAsRead = (notificationId: number) => {
    setReadNotifications(prev => 
      prev.includes(notificationId) 
        ? prev 
        : [...prev, notificationId]
    );
  };

  const markAllAsRead = () => {
    setReadNotifications(notifications.map(n => n.id));
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === "unread") return !readNotifications.includes(notification.id);
    if (filter === "read") return readNotifications.includes(notification.id);
    return true;
  });

  const unreadCount = notifications.filter(n => !readNotifications.includes(n.id)).length;

  return (
    <div className="min-h-screen bg-muted/30 pb-20 md:pb-0">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Notificações</h1>
              {unreadCount > 0 && (
                <p className="text-muted-foreground">
                  Você tem {unreadCount} notificação{unreadCount > 1 ? 'ões' : ''} não lida{unreadCount > 1 ? 's' : ''}
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  <Check className="h-4 w-4 mr-2" />
                  Marcar todas como lidas
                </Button>
              )}
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              Todas ({notifications.length})
            </Button>
            <Button
              variant={filter === "unread" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("unread")}
            >
              Não lidas ({unreadCount})
            </Button>
            <Button
              variant={filter === "read" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("read")}
            >
              Lidas ({notifications.length - unreadCount})
            </Button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {filter === "unread" ? "Nenhuma notificação não lida" : "Nenhuma notificação"}
                </h3>
                <p className="text-muted-foreground">
                  {filter === "unread" 
                    ? "Todas as suas notificações foram lidas!" 
                    : "Você não tem notificações ainda."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => {
              const isRead = readNotifications.includes(notification.id);
              const Icon = getNotificationIcon(notification.type);
              const iconColor = getNotificationColor(notification.type);

              return (
                <Card 
                  key={notification.id} 
                  className={`cursor-pointer transition-all hover:shadow-medium ${
                    !isRead ? 'border-l-4 border-l-primary bg-primary/5' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      {/* Notification Icon */}
                      <div className={`p-2 bg-muted rounded-full ${iconColor}`}>
                        <Icon className="h-4 w-4" />
                      </div>

                      {/* User Avatar */}
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={notification.user.avatar || undefined} />
                        <AvatarFallback className="bg-gradient-primary text-white text-sm">
                          {notification.user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className={`font-semibold ${!isRead ? 'text-primary' : ''}`}>
                              {notification.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-1">
                              {notification.content}
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <span>{notification.user.role}</span>
                              <span>•</span>
                              <span>{notification.time}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {!isRead && (
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                            )}
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Load More */}
        {filteredNotifications.length > 0 && (
          <div className="text-center mt-6">
            <Button variant="outline">
              Carregar mais notificações
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;