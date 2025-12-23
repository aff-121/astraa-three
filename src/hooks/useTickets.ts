import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { devLog } from '@/lib/logger';

export interface Ticket {
  id: string;
  user_id: string;
  event_id: string;
  category_id: string;
  ticket_number: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: string;
  qr_code_url: string;
  purchase_time: string;
  event?: {
    title: string;
    date: string;
    time: string;
    venue: string;
    location: string;
    image_url: string | null;
  };
  category?: {
    name: string;
  };
}

export function useUserTickets() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-tickets', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('tickets')
        .select(`
          *,
          event:events(title, date, time, venue, location, image_url),
          category:ticket_categories(name)
        `)
        .eq('user_id', user.id)
        .order('purchase_time', { ascending: false });
      
      if (error) throw error;
      return data as Ticket[];
    },
    enabled: !!user,
  });
}

export function useTicket(ticketId: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('tickets')
        .select(`
          *,
          event:events(title, date, time, venue, location, image_url),
          category:ticket_categories(name)
        `)
        .eq('id', ticketId)
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data as Ticket;
    },
    enabled: !!ticketId && !!user,
  });
}

function generateTicketNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ASTRA-${timestamp}-${random}`;
}

interface CreateTicketParams {
  eventId: string;
  categoryId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export function useCreateTicket() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation<Ticket, Error, CreateTicketParams>({
    mutationFn: async (params: CreateTicketParams) => {
      if (!user) throw new Error('Not authenticated');
      
      // 🔒 Call atomic RPC function: purchase_ticket()
      // This handles everything in a single PostgreSQL transaction with row-level locking
      // Prevents race conditions: check + create + update all happen atomically
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).rpc('purchase_ticket', {
        p_user_id: user.id,
        p_event_id: params.eventId,
        p_category_id: params.categoryId,
        p_quantity: params.quantity,
      });
      
      if (error) {
        devLog.error("Error creating ticket via RPC:", error);
        throw new Error(error.message || 'Failed to create ticket');
      }
      
      if (!data || data.length === 0) {
        throw new Error('Failed to create ticket: No data returned');
      }
      
      // The RPC returns one row with: ticket_id, ticket_number, new_available_seats
      const purchaseResult = data[0];
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://jsquare.com/tickets/${purchaseResult.ticket_number}`)}`;
      
      // Create a Ticket object matching the frontend interface
      const ticket: Ticket = {
        id: purchaseResult.ticket_id,
        user_id: user.id,
        event_id: params.eventId,
        category_id: params.categoryId,
        ticket_number: purchaseResult.ticket_number,
        quantity: params.quantity,
        unit_price: params.unitPrice,
        total_price: params.totalPrice,
        status: 'confirmed',
        qr_code_url: qrCodeUrl,
        purchase_time: new Date().toISOString(),
      };
      
      devLog.log(`✅ Ticket created atomically! Seats updated: → ${purchaseResult.new_available_seats}`);
      devLog.log(`🔒 Transaction guaranteed: No race condition possible`);
      
      return ticket;
    },
    onSuccess: () => {
      // Refresh ticket categories to show updated availability
      queryClient.invalidateQueries({ queryKey: ['user-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket-categories'] });
    },
  });
}
