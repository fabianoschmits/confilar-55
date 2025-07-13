-- Phase 1: Critical Security Fixes (Fixed)

-- Create role change audit log table
CREATE TABLE public.role_change_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  old_role public.user_role,
  new_role public.user_role NOT NULL,
  changed_by UUID NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.role_change_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view role change logs" 
ON public.role_change_logs 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Create secure role assignment function
CREATE OR REPLACE FUNCTION public.assign_user_role(
  target_user_id UUID,
  new_role public.user_role,
  reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_role public.user_role;
  requesting_user_id UUID;
BEGIN
  -- Get the requesting user ID
  requesting_user_id := auth.uid();
  
  -- Only admins can assign roles
  IF NOT public.has_role(requesting_user_id, 'admin') THEN
    RAISE EXCEPTION 'Only administrators can assign roles';
  END IF;
  
  -- Prevent self-demotion of the last admin
  IF requesting_user_id = target_user_id AND new_role != 'admin' THEN
    -- Count other admins
    IF (SELECT COUNT(*) FROM public.user_roles WHERE role = 'admin' AND user_id != target_user_id) = 0 THEN
      RAISE EXCEPTION 'Cannot remove the last administrator';
    END IF;
  END IF;
  
  -- Get current role
  SELECT role INTO current_role 
  FROM public.user_roles 
  WHERE user_id = target_user_id;
  
  -- Log the role change
  INSERT INTO public.role_change_logs (user_id, old_role, new_role, changed_by, reason)
  VALUES (target_user_id, current_role, new_role, requesting_user_id, reason);
  
  -- Update or insert the role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, new_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Remove old role if different
  IF current_role IS NOT NULL AND current_role != new_role THEN
    DELETE FROM public.user_roles 
    WHERE user_id = target_user_id AND role = current_role;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Create function to remove user role safely
CREATE OR REPLACE FUNCTION public.remove_user_role(
  target_user_id UUID,
  reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_role public.user_role;
  requesting_user_id UUID;
BEGIN
  requesting_user_id := auth.uid();
  
  -- Only admins can remove roles
  IF NOT public.has_role(requesting_user_id, 'admin') THEN
    RAISE EXCEPTION 'Only administrators can remove roles';
  END IF;
  
  -- Get current role
  SELECT role INTO current_role 
  FROM public.user_roles 
  WHERE user_id = target_user_id;
  
  -- Prevent removing the last admin
  IF current_role = 'admin' THEN
    IF (SELECT COUNT(*) FROM public.user_roles WHERE role = 'admin' AND user_id != target_user_id) = 0 THEN
      RAISE EXCEPTION 'Cannot remove the last administrator';
    END IF;
  END IF;
  
  -- Log the role change
  INSERT INTO public.role_change_logs (user_id, old_role, new_role, changed_by, reason)
  VALUES (target_user_id, current_role, 'user', requesting_user_id, reason);
  
  -- Remove the role (user becomes regular user)
  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  
  RETURN TRUE;
END;
$$;