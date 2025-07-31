import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type UserRole = 'user' | 'admin' | 'moderator';

export function useUserRole() {
  const [role, setRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setRole('user');
      setLoading(false);
      return;
    }

    fetchUserRole();
  }, [user]);

  const fetchUserRole = async () => {
    try {
      // Temporarily set all users as regular users
      // until user_roles table is properly implemented
      setRole('user');
    } catch (error) {
      console.error('Erro ao buscar role:', error);
      setRole('user');
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = () => role === 'admin';
  const isModerator = () => role === 'moderator' || role === 'admin';

  return {
    role,
    loading,
    isAdmin,
    isModerator,
    refetch: fetchUserRole
  };
}