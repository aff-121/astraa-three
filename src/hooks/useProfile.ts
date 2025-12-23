import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface Profile {
  id: string;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as Profile | null;
    },
    enabled: !!user,
  });
}

interface UpdateProfileParams {
  full_name?: string;
  phone?: string;
  avatar_url?: string;
}

export function useUpdateProfile() {
  const { user, session } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: UpdateProfileParams) => {
      if (!user) throw new Error('Not authenticated');
      if (!session?.access_token) throw new Error('No session token available');
      
      // Call our backend API with JWT token in Authorization header
      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`, // ✅ Send JWT token
        },
        body: JSON.stringify(params), // ✅ No userId in body - backend extracts it from token
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      const { profile } = await response.json();
      return profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
