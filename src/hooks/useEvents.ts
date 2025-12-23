import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Event {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  full_description: string | null;
  image_url: string | null;
  date: string;
  time: string;
  duration: string | null;
  venue: string;
  location: string;
  parking: string | null;
  type: string;
  badge: string | null;
  has_tickets: boolean;
  is_active: boolean;
}

export interface TicketCategory {
  id: string;
  event_id: string;
  name: string;
  price: number;
  total_seats: number;
  available_seats: number;
  description: string | null;
  sort_order: number;
}

export interface EventGallery {
  id: string;
  event_id: string;
  image_url: string;
  sort_order: number;
}

export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .order('date', { ascending: true });
      
      if (error) throw error;
      return data as Event[];
    },
  });
}

export function useEvent(slug: string) {
  return useQuery({
    queryKey: ['event', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      return data as Event;
    },
    enabled: !!slug,
  });
}

export function useTicketCategories(eventId: string) {
  return useQuery({
    queryKey: ['ticket-categories', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ticket_categories')
        .select('*')
        .eq('event_id', eventId)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as TicketCategory[];
    },
    enabled: !!eventId,
  });
}

export function useEventGallery(eventId: string) {
  return useQuery({
    queryKey: ['event-gallery', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_gallery')
        .select('*')
        .eq('event_id', eventId)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as EventGallery[];
    },
    enabled: !!eventId,
  });
}
