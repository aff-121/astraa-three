import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface SendMessageParams {
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
}

export function useSendContactMessage() {
  return useMutation({
    mutationFn: async (params: SendMessageParams) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('contact_messages')
        .insert(params)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
  });
}
