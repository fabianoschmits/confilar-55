-- Create table for user likes (users can like other users)
CREATE TABLE public.user_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID NOT NULL,
  to_user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(from_user_id, to_user_id)
);

-- Enable RLS
ALTER TABLE public.user_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for user_likes
CREATE POLICY "user_likes_select_all" 
ON public.user_likes 
FOR SELECT 
USING (true);

CREATE POLICY "user_likes_insert_own" 
ON public.user_likes 
FOR INSERT 
WITH CHECK (from_user_id = auth.uid());

CREATE POLICY "user_likes_delete_own" 
ON public.user_likes 
FOR DELETE 
USING (from_user_id = auth.uid());

-- Create table for profile comments (comments on user profiles)
CREATE TABLE public.profile_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_user_id UUID NOT NULL,
  commenter_user_id UUID NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profile_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for profile_comments
CREATE POLICY "profile_comments_select_all" 
ON public.profile_comments 
FOR SELECT 
USING (true);

CREATE POLICY "profile_comments_insert_own" 
ON public.profile_comments 
FOR INSERT 
WITH CHECK (commenter_user_id = auth.uid());

CREATE POLICY "profile_comments_update_own" 
ON public.profile_comments 
FOR UPDATE 
USING (commenter_user_id = auth.uid());

CREATE POLICY "profile_comments_delete_own_or_received" 
ON public.profile_comments 
FOR DELETE 
USING (commenter_user_id = auth.uid() OR profile_user_id = auth.uid());

-- Create trigger for automatic timestamp updates on profile_comments
CREATE TRIGGER update_profile_comments_updated_at
BEFORE UPDATE ON public.profile_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for new tables
ALTER TABLE public.user_likes REPLICA IDENTITY FULL;
ALTER TABLE public.profile_comments REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profile_comments;