import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Award {
  id: string;
  year: number;
  title: string;
  description: string | null;
  hero_image_url: string | null;
  is_active: boolean;
}

export interface AwardCategory {
  id: string;
  award_id: string;
  name: string;
  icon: string | null;
  sort_order: number;
}

export interface AwardHost {
  id: string;
  award_id: string;
  name: string;
  image_url: string | null;
  role: string;
  sort_order: number;
}

export interface AwardGallery {
  id: string;
  award_id: string;
  image_url: string;
  type: string;
  title: string | null;
  youtube_url: string | null;
  sort_order: number;
}

export function useAwards() {
  return useQuery({
    queryKey: ['awards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('awards')
        .select('*')
        .eq('is_active', true)
        .order('year', { ascending: false });
      
      if (error) throw error;
      return data as Award[];
    },
  });
}

export function useAward(year: number) {
  return useQuery({
    queryKey: ['award', year],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('awards')
        .select('*')
        .eq('year', year)
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      return data as Award;
    },
    enabled: !!year,
  });
}

export function useAwardCategories(awardId: string) {
  return useQuery({
    queryKey: ['award-categories', awardId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('award_categories')
        .select('*')
        .eq('award_id', awardId)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as AwardCategory[];
    },
    enabled: !!awardId,
  });
}

export function useAwardHosts(awardId: string) {
  return useQuery({
    queryKey: ['award-hosts', awardId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('award_hosts')
        .select('*')
        .eq('award_id', awardId)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as AwardHost[];
    },
    enabled: !!awardId,
  });
}

export function useAwardGallery(awardId: string) {
  return useQuery({
    queryKey: ['award-gallery', awardId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('award_gallery')
        .select('*')
        .eq('award_id', awardId)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as AwardGallery[];
    },
    enabled: !!awardId,
  });
}
