-- 1. Add privacy settings to profiles
ALTER TABLE public.profiles 
ADD COLUMN is_private boolean DEFAULT false,
ADD COLUMN show_email boolean DEFAULT false,
ADD COLUMN show_phone boolean DEFAULT false,
ADD COLUMN is_verified boolean DEFAULT false;

-- 2. Create blocked users table
CREATE TABLE public.blocked_users (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_user_id uuid NOT NULL,
  blocked_user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(blocker_user_id, blocked_user_id)
);

-- Enable RLS on blocked_users
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- Policies for blocked_users
CREATE POLICY "Users can view their own blocks" ON public.blocked_users
FOR SELECT USING (blocker_user_id = auth.uid());

CREATE POLICY "Users can create their own blocks" ON public.blocked_users
FOR INSERT WITH CHECK (blocker_user_id = auth.uid());

CREATE POLICY "Users can delete their own blocks" ON public.blocked_users
FOR DELETE USING (blocker_user_id = auth.uid());

-- 3. Create reports table
CREATE TABLE public.reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_user_id uuid NOT NULL,
  reported_user_id uuid,
  reported_post_id uuid,
  reported_comment_id uuid,
  reason text NOT NULL,
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Policies for reports
CREATE POLICY "Users can create reports" ON public.reports
FOR INSERT WITH CHECK (reporter_user_id = auth.uid());

CREATE POLICY "Admins can view all reports" ON public.reports
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- 4. Add hashtag support to posts
ALTER TABLE public.posts ADD COLUMN hashtags text[];

-- 5. Create post views tracking
CREATE TABLE public.post_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL,
  user_id uuid NOT NULL,
  viewed_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Enable RLS on post_views
ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;

-- Policies for post_views
CREATE POLICY "Anyone can track views" ON public.post_views
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view all post views" ON public.post_views
FOR SELECT USING (true);

-- 6. Add reactions support (beyond just likes)
CREATE TYPE public.reaction_type AS ENUM ('like', 'love', 'laugh', 'angry', 'sad', 'wow');

CREATE TABLE public.reactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  post_id uuid,
  comment_id uuid,
  reaction_type reaction_type NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id, comment_id)
);

-- Enable RLS on reactions
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

-- Policies for reactions
CREATE POLICY "Anyone can view reactions" ON public.reactions
FOR SELECT USING (true);

CREATE POLICY "Users can create their own reactions" ON public.reactions
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own reactions" ON public.reactions
FOR DELETE USING (user_id = auth.uid());

-- 7. Create friend/connection requests
CREATE TABLE public.friend_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_user_id uuid NOT NULL,
  receiver_user_id uuid NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(sender_user_id, receiver_user_id)
);

-- Enable RLS on friend_requests
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;

-- Policies for friend_requests
CREATE POLICY "Users can view their own requests" ON public.friend_requests
FOR SELECT USING (sender_user_id = auth.uid() OR receiver_user_id = auth.uid());

CREATE POLICY "Users can create friend requests" ON public.friend_requests
FOR INSERT WITH CHECK (sender_user_id = auth.uid());

CREATE POLICY "Users can update requests they received" ON public.friend_requests
FOR UPDATE USING (receiver_user_id = auth.uid());