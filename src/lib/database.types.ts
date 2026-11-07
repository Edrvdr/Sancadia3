export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          created_at: string | null;
          display_name: string | null;
          id: string;
        };
        Insert: {
          created_at?: string | null;
          display_name?: string | null;
          id: string;
        };
        Update: {
          created_at?: string | null;
          display_name?: string | null;
          id?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
