/**
 * Database Types for Supabase
 * 
 * Note: These are manually defined types.
 * For auto-generated types, run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID
 */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          phone: string | null;
          full_name: string | null;
          avatar_url: string | null;
          phone_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          phone?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          phone_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          phone?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          phone_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      events: {
        Row: {
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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description?: string | null;
          full_description?: string | null;
          image_url?: string | null;
          date: string;
          time: string;
          duration?: string | null;
          venue: string;
          location: string;
          parking?: string | null;
          type: string;
          badge?: string | null;
          has_tickets?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          description?: string | null;
          full_description?: string | null;
          image_url?: string | null;
          date?: string;
          time?: string;
          duration?: string | null;
          venue?: string;
          location?: string;
          parking?: string | null;
          type?: string;
          badge?: string | null;
          has_tickets?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      ticket_categories: {
        Row: {
          id: string;
          event_id: string;
          name: string;
          price: number;
          total_seats: number;
          available_seats: number;
          description: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          name: string;
          price: number;
          total_seats: number;
          available_seats: number;
          description?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          name?: string;
          price?: number;
          total_seats?: number;
          available_seats?: number;
          description?: string | null;
          sort_order?: number;
          created_at?: string;
        };
      };
      tickets: {
        Row: {
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
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_id: string;
          category_id: string;
          ticket_number: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          status?: string;
          qr_code_url?: string;
          purchase_time?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_id?: string;
          category_id?: string;
          ticket_number?: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          status?: string;
          qr_code_url?: string;
          purchase_time?: string;
          created_at?: string;
        };
      };
      movies: {
        Row: {
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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description?: string | null;
          synopsis?: string | null;
          image_url?: string | null;
          status?: string;
          release_date?: string | null;
          director?: string | null;
          cast_members?: string[] | null;
          genre?: string | null;
          duration?: string | null;
          youtube_url?: string | null;
          bookmyshow_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          description?: string | null;
          synopsis?: string | null;
          image_url?: string | null;
          status?: string;
          release_date?: string | null;
          director?: string | null;
          cast_members?: string[] | null;
          genre?: string | null;
          duration?: string | null;
          youtube_url?: string | null;
          bookmyshow_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      news: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string | null;
          content: string | null;
          image_url: string | null;
          youtube_url: string | null;
          published_at: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description?: string | null;
          content?: string | null;
          image_url?: string | null;
          youtube_url?: string | null;
          published_at?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          description?: string | null;
          content?: string | null;
          image_url?: string | null;
          youtube_url?: string | null;
          published_at?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      awards: {
        Row: {
          id: string;
          year: number;
          title: string;
          description: string | null;
          hero_image_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          year: number;
          title: string;
          description?: string | null;
          hero_image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          year?: number;
          title?: string;
          description?: string | null;
          hero_image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      contact_messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          subject: string | null;
          message: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          subject?: string | null;
          message: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          subject?: string | null;
          message?: string;
          is_read?: boolean;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      purchase_ticket: {
        Args: {
          p_user_id: string;
          p_event_id: string;
          p_category_id: string;
          p_quantity: number;
        };
        Returns: {
          ticket_id: string;
          ticket_number: string;
          new_available_seats: number;
        }[];
      };
    };
    Enums: Record<string, never>;
  };
}
