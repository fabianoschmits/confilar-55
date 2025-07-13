import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const useCreateWork = () => {
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
        .from('posts')
        .insert([{
          content: `${title}\n\n${description}\n\nPreço: ${price ? `R$ ${price}` : 'A combinar'}\nCategoria: ${category}`,
          location,
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

  return {
    title,
    setTitle,
    description,
    setDescription,
    isAnonymous,
    setIsAnonymous,
    price,
    setPrice,
    location,
    setLocation,
    category,
    setCategory,
    mediaFiles,
    submitting,
    handleFileChange,
    removeFile,
    createWork
  };
};