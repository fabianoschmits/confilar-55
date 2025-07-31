-- Create blocked_users table for user blocking functionality
CREATE TABLE public.blocked_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_user_id UUID NOT NULL,
  blocked_user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(blocker_user_id, blocked_user_id)
);

-- Enable RLS
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- Create policies for blocked_users
CREATE POLICY "Users can create their own blocks" 
ON public.blocked_users 
FOR INSERT 
WITH CHECK (auth.uid() = blocker_user_id);

CREATE POLICY "Users can view their own blocks" 
ON public.blocked_users 
FOR SELECT 
USING (auth.uid() = blocker_user_id);

CREATE POLICY "Users can delete their own blocks" 
ON public.blocked_users 
FOR DELETE 
USING (auth.uid() = blocker_user_id);

-- Create reports table for reporting functionality
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_user_id UUID NOT NULL,
  reported_user_id UUID,
  reported_post_id UUID,
  reported_comment_id UUID,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Create policies for reports
CREATE POLICY "Users can create their own reports" 
ON public.reports 
FOR INSERT 
WITH CHECK (auth.uid() = reporter_user_id);

CREATE POLICY "Users can view their own reports" 
ON public.reports 
FOR SELECT 
USING (auth.uid() = reporter_user_id);

-- Add trigger for timestamps
CREATE TRIGGER update_reports_updated_at
BEFORE UPDATE ON public.reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();