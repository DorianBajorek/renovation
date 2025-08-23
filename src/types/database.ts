export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          password_hash: string;
          first_name: string;
          last_name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          password_hash: string;
          first_name: string;
          last_name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          password_hash?: string;
          first_name?: string;
          last_name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      rooms: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          budget: number;
          icon: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          budget: number;
          icon?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          budget?: number;
          icon?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string;
          budget: number;
          start_date: string;
          end_date: string;
          status: 'active' | 'planning' | 'completed';
          rooms: string[];
          icon: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description: string;
          budget: number;
          start_date: string;
          end_date: string;
          status?: 'active' | 'planning' | 'completed';
          rooms?: string[];
          icon?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string;
          budget?: number;
          start_date?: string;
          end_date?: string;
          status?: 'active' | 'planning' | 'completed';
          rooms?: string[];
          icon?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
