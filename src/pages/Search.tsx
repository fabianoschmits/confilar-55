import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon } from 'lucide-react';

const Search = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-6">
                <SearchIcon className="h-5 w-5 text-muted-foreground" />
                <Input placeholder="Buscar posts, usuários..." />
              </div>
              <div className="text-center py-12">
                <SearchIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">Busca</h3>
                <p className="text-muted-foreground">
                  A funcionalidade de busca ainda não foi implementada.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="h-20 lg:hidden"></div>
      </div>
    </ProtectedRoute>
  );
};

export default Search;