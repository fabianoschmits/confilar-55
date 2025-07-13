import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

interface WorkFormProps {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  price: string;
  setPrice: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  isAnonymous: boolean;
  setIsAnonymous: (value: boolean) => void;
  onSubmit: () => void;
  submitting: boolean;
}

const WorkForm = ({
  title,
  setTitle,
  description,
  setDescription,
  category,
  setCategory,
  price,
  setPrice,
  location,
  setLocation,
  isAnonymous,
  setIsAnonymous,
  onSubmit,
  submitting
}: WorkFormProps) => {
  return (
    <>
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
          onClick={onSubmit} 
          disabled={!title.trim() || !description.trim() || submitting}
        >
          {submitting ? 'Publicando...' : 'Publicar Trabalho'}
        </Button>
      </div>
    </>
  );
};

export default WorkForm;