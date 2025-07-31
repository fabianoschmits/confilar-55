import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent } from '@/components/ui/card';
import { BellOff } from 'lucide-react';

const Notifications = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <Card>
            <CardContent className="p-12 text-center">
              <BellOff className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">Nenhuma notificação</h3>
              <p className="text-muted-foreground">
                O sistema de notificações ainda não foi implementado.
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="h-20 lg:hidden"></div>
      </div>
    </ProtectedRoute>
  );
};

export default Notifications;