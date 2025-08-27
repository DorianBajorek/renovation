export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          first_name: string;
          last_name: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      rooms: {
        Row: {
          id: string;
          user_id: string;
          project_id: string | null;
          name: string;
          icon: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id?: string | null;
          name: string;
          icon?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          project_id?: string | null;
          name?: string;
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
          description: string | null;
          budget: number;
          status: 'active' | 'completed';
          icon: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          budget: number;
          status?: 'active' | 'completed';
          icon?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          budget?: number;
          status?: 'active' | 'completed';
          icon?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          room_id: string;
          name: string;
          description: string | null;
          price: number;
          quantity: number;
          category: string | null;
          status: 'planned' | 'purchased';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          name: string;
          description?: string | null;
          price: number;
          quantity?: number;
          category?: string | null;
          status?: 'planned' | 'purchased';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          quantity?: number;
          category?: string | null;
          status?: 'planned' | 'purchased';
          created_at?: string;
          updated_at?: string;
        };
      };
      project_shares: {
        Row: {
          id: string;
          project_id: string;
          owner_id: string;
          shared_with_id: string;
          permission_type: 'read' | 'edit';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          owner_id: string;
          shared_with_id: string;
          permission_type: 'read' | 'edit';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          owner_id?: string;
          shared_with_id?: string;
          permission_type?: 'read' | 'edit';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Functions: {
      get_room_expenses: {
        Args: {
          room_uuid: string;
        };
        Returns: number;
      };
      get_project_expenses: {
        Args: {
          project_uuid: string;
        };
        Returns: number;
      };
    };
  };
}
