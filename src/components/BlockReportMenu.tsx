import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MoreHorizontal, Flag, UserX, MessageSquareWarning } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface BlockReportMenuProps {
  userId?: string;
  postId?: string;
  commentId?: string;
  onUserBlocked?: () => void;
}

const reportReasons = [
  'Spam ou conteúdo comercial não solicitado',
  'Assédio ou bullying',
  'Conteúdo inapropriado ou ofensivo',
  'Informações falsas',
  'Violação de direitos autorais',
  'Outro motivo'
];

const BlockReportMenu = ({ userId, postId, commentId, onUserBlocked }: BlockReportMenuProps) => {
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleBlock = async () => {
    if (!user?.id || !userId) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('blocked_users')
        .insert({
          blocker_user_id: user.id,
          blocked_user_id: userId,
        });

      if (error) throw error;

      toast({
        title: "Usuário bloqueado",
        description: "O usuário foi bloqueado com sucesso.",
      });

      setBlockDialogOpen(false);
      onUserBlocked?.();
    } catch (error) {
      console.error('Erro ao bloquear usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível bloquear o usuário.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReport = async () => {
    if (!user?.id || !selectedReason) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('reports')
        .insert({
          reporter_user_id: user.id,
          reported_user_id: userId || null,
          reported_post_id: postId || null,
          reported_comment_id: commentId || null,
          reason: selectedReason,
          description: description || null,
        });

      if (error) throw error;

      toast({
        title: "Denúncia enviada",
        description: "Sua denúncia foi enviada e será analisada pela nossa equipe.",
      });

      setReportDialogOpen(false);
      setSelectedReason('');
      setDescription('');
    } catch (error) {
      console.error('Erro ao enviar denúncia:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a denúncia.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
          <DialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Flag className="h-4 w-4 mr-2" />
              Denunciar
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Denunciar conteúdo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Motivo da denúncia</Label>
                <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
                  {reportReasons.map((reason) => (
                    <div key={reason} className="flex items-center space-x-2">
                      <RadioGroupItem value={reason} id={reason} />
                      <Label htmlFor={reason} className="text-sm">
                        {reason}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              {selectedReason === 'Outro motivo' && (
                <div>
                  <Label htmlFor="description">Descreva o problema</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descreva detalhadamente o problema..."
                    rows={3}
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setReportDialogOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleReport}
                  disabled={!selectedReason || submitting}
                  className="flex-1"
                  variant="destructive"
                >
                  {submitting ? 'Enviando...' : 'Denunciar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {userId && (
          <>
            <DropdownMenuSeparator />
            <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <UserX className="h-4 w-4 mr-2" />
                  Bloquear usuário
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Bloquear usuário</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Tem certeza que deseja bloquear este usuário? Ele não poderá mais:
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                    <li>Ver seu perfil</li>
                    <li>Enviar mensagens para você</li>
                    <li>Comentar em seus posts</li>
                    <li>Ver seus posts no feed</li>
                  </ul>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setBlockDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleBlock}
                      disabled={submitting}
                      className="flex-1"
                      variant="destructive"
                    >
                      {submitting ? 'Bloqueando...' : 'Bloquear'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default BlockReportMenu;