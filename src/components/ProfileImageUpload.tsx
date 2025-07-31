import { useState, useRef } from 'react';
import { Camera, Upload, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { validateFile } from '@/lib/sanitize';

interface ProfileImageUploadProps {
  currentImageUrl?: string;
  fullName?: string;
  onImageUpdate: (imageUrl: string) => void;
  userId: string;
}

const ProfileImageUpload = ({ 
  currentImageUrl, 
  fullName, 
  onImageUpdate, 
  userId 
}: ProfileImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const resizeImage = (file: File, maxSize: number = 512): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions maintaining aspect ratio
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }
        
        // For square crop, use the smaller dimension
        const size = Math.min(width, height);
        canvas.width = size;
        canvas.height = size;
        
        // Draw image centered and cropped to square
        const offsetX = (width - size) / 2;
        const offsetY = (height - size) / 2;
        
        ctx.drawImage(
          img,
          offsetX,
          offsetY,
          size,
          size,
          0,
          0,
          size,
          size
        );
        
        canvas.toBlob(
          (blob) => resolve(blob!),
          'image/jpeg',
          0.8
        );
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      toast({
        title: "Arquivo inválido",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      
      // Show preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      // Resize and compress image
      const resizedImage = await resizeImage(file);
      
      // Generate unique filename with user folder structure
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${userId}/avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, resizedImage, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      onImageUpdate(publicUrl);
      setPreviewUrl(null);
      
      toast({
        title: "Sucesso",
        description: "Foto de perfil atualizada com sucesso!",
      });

    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a foto de perfil.",
        variant: "destructive",
      });
      setPreviewUrl(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = async () => {
    try {
      setUploading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('user_id', userId);

      if (error) throw error;

      onImageUpdate('');
      
      toast({
        title: "Sucesso",
        description: "Foto de perfil removida com sucesso!",
      });

    } catch (error) {
      console.error('Erro ao remover imagem:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a foto de perfil.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const displayUrl = previewUrl || currentImageUrl;

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
          <AvatarImage 
            src={displayUrl} 
            className="object-cover"
          />
          <AvatarFallback className="bg-gradient-primary text-white text-3xl">
            {fullName ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : <User className="h-12 w-12" />}
          </AvatarFallback>
        </Avatar>
        
        {uploading && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
        
        <Button
          size="sm"
          className="absolute -bottom-2 -right-2 rounded-full h-10 w-10 p-0"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Camera className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-col items-center space-y-2">
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center space-x-2"
        >
          <Upload className="h-4 w-4" />
          <span>{currentImageUrl ? 'Alterar foto' : 'Adicionar foto'}</span>
        </Button>
        
        {currentImageUrl && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveImage}
            disabled={uploading}
            className="text-destructive hover:text-destructive flex items-center space-x-1"
          >
            <X className="h-3 w-3" />
            <span>Remover foto</span>
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <p className="text-xs text-muted-foreground text-center max-w-xs">
        Recomendamos uma imagem quadrada de pelo menos 400x400px. 
        A imagem será redimensionada automaticamente.
      </p>
    </div>
  );
};

export default ProfileImageUpload;