import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Smile, 
  Frown, 
  Angry, 
  Zap, 
  Laugh,
  ChevronDown
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ReactionButtonProps {
  postId?: string;
  commentId?: string;
  reactions: any[];
  onReactionChange?: (newCount: number) => void;
}

const reactionTypes = [
  { type: 'like', icon: Heart, label: 'Curtir', color: 'text-coral' },
  { type: 'love', icon: Heart, label: 'Amar', color: 'text-red-500' },
  { type: 'laugh', icon: Laugh, label: 'Rir', color: 'text-yellow-500' },
  { type: 'wow', icon: Zap, label: 'Uau', color: 'text-blue-500' },
  { type: 'sad', icon: Frown, label: 'Triste', color: 'text-gray-500' },
  { type: 'angry', icon: Angry, label: 'Raiva', color: 'text-red-600' },
];

const ReactionButton = ({ postId, commentId, reactions, onReactionChange }: ReactionButtonProps) => {
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({});
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadUserReaction();
    calculateReactionCounts();
  }, [reactions, user?.id]);

  const loadUserReaction = async () => {
    // Disabled for now - reactions table doesn't exist
    return;
  };

  const calculateReactionCounts = () => {
    // Disabled for now - reactions table doesn't exist
    setReactionCounts({});
  };

  const handleReaction = async (reactionType: string) => {
    // Disabled for now - reactions table doesn't exist
    toast({
      title: "Em desenvolvimento",
      description: "Reações serão implementadas em breve.",
    });
  };

  const totalReactions = Object.values(reactionCounts).reduce((sum, count) => sum + count, 0);
  const mostUsedReaction = Object.entries(reactionCounts).sort(([,a], [,b]) => b - a)[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="transition-all duration-200 hover:scale-105"
        >
          {userReaction ? (
            <>
              {reactionTypes.find(r => r.type === userReaction)?.icon && (
                <div className={reactionTypes.find(r => r.type === userReaction)?.color}>
                  {(() => {
                    const IconComponent = reactionTypes.find(r => r.type === userReaction)?.icon;
                    return IconComponent ? <IconComponent className="h-4 w-4 mr-2 fill-current" /> : null;
                  })()}
                </div>
              )}
            </>
          ) : (
            <Heart className="h-4 w-4 mr-2" />
          )}
          {totalReactions > 0 ? totalReactions : 'Reagir'}
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 p-2">
        <div className="grid grid-cols-3 gap-2">
          {reactionTypes.map(({ type, icon: Icon, label, color }) => (
            <Button
              key={type}
              variant={userReaction === type ? "default" : "ghost"}
              size="sm"
              onClick={() => handleReaction(type)}
              className={`flex flex-col items-center p-2 h-auto ${color} hover:${color}`}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs">{label}</span>
              {reactionCounts[type] && (
                <span className="text-xs text-muted-foreground">
                  {reactionCounts[type]}
                </span>
              )}
            </Button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ReactionButton;