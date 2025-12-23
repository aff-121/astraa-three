import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Movie {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  synopsis: string | null;
  image_url: string | null;
  status: string;
  release_date: string | null;
  director: string | null;
  cast_members: string[] | null;
  genre: string | null;
  duration: string | null;
  youtube_url: string | null;
  bookmyshow_url: string | null;
  is_active: boolean;
}

export function useMovies() {
  return useQuery({
    queryKey: ['movies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Movie[];
    },
  });
}

export function useMovie(slug: string) {
  return useQuery({
    queryKey: ['movie', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      return data as Movie;
    },
    enabled: !!slug,
  });
}
