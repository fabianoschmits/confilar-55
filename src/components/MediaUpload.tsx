import { Upload, X, Image as ImageIcon, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface MediaUploadProps {
  mediaFiles: File[];
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
}

const MediaUpload = ({ mediaFiles, onFileChange, onRemoveFile }: MediaUploadProps) => {
  return (
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
            onChange={onFileChange}
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
                  onClick={() => onRemoveFile(index)}
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
  );
};

export default MediaUpload;