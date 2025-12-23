import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database.types";

export type Movie = Database["public"]["Tables"]["movies"]["Row"];

export async function getMovieBySlug(slug: string): Promise<Movie | null> {
  const { data, error } = await supabase
    .from("movies")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    if ((error as { code?: string }).code === "PGRST116") {
      return null;
    }
    throw error;
  }

  return data;
}
