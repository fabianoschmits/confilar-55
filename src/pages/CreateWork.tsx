import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Upload, X, Image as ImageIcon, Video } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CreateWork = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      return isImage || isVideo;
    });
    
    setMediaFiles(prev => [...prev, ...validFiles].slice(0, 5)); // Máximo 5 arquivos
  };

  const removeFile = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    const uploadedUrls: string[] = [];
    
    for (const file of mediaFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('work-media')
        .upload(fileName, file);
        
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('work-media')
        .getPublicUrl(data.path);
        
      uploadedUrls.push(publicUrl);
    }
    
    return uploadedUrls;
  };

  const createWork = async () => {
    if (!title.trim() || !description.trim()) {
      toast({
        title: "Erro",
        description: "Título e descrição são obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    setSubmitting(true);
    try {
      let mediaUrls: string[] = [];
      
      if (mediaFiles.length > 0) {
        mediaUrls = await uploadFiles();
      }
      
      const { error } = await supabase
        .from('work_posts')
        .insert([{
          title,
          description,
          price: price ? parseFloat(price) : null,
          location,
          category,
          media_urls: mediaUrls,
          is_anonymous: isAnonymous,
          user_id: user?.id,
        }]);

      if (error) throw error;

      toast({
        title: "Trabalho publicado!",
        description: "Seu trabalho foi publicado com sucesso.",
      });
      
      navigate('/');
    } catch (error) {
      console.error('Erro ao criar trabalho:', error);
      toast({
        title: "Erro",
        description: "Não foi possível publicar o trabalho.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-bold">Postar Trabalho</h1>
            <p className="text-muted-foreground">Compartilhe seu trabalho com fotos e vídeos</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="title">Título do Trabalho</Label>
              <Input
                id="title"
                placeholder="Ex: Limpeza residencial completa"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descreva o trabalho realizado..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[120px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  placeholder="Ex: Limpeza"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="price">Preço (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0,00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Localização</Label>
              <Input
                id="location"
                placeholder="Cidade, Estado"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div>
              <Label>Fotos e Vídeos</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Clique para adicionar fotos ou vídeos do seu trabalho
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="media-upload"
                  />
                  <label htmlFor="media-upload">
                    <Button type="button" variant="outline" asChild>
                      <span>Escolher arquivos</span>
                    </Button>
                  </label>
                </div>
                
                {mediaFiles.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {mediaFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                          {file.type.startsWith('image/') ? (
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          ) : (
                            <Video className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <p className="text-xs text-center mt-1 truncate">{file.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="anonymous"
                  checked={isAnonymous}
                  onCheckedChange={setIsAnonymous}
                />
                <Label htmlFor="anonymous">Postar anonimamente</Label>
              </div>
              <Button 
                onClick={createWork} 
                disabled={!title.trim() || !description.trim() || submitting}
              >
                {submitting ? 'Publicando...' : 'Publicar Trabalho'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateWork;