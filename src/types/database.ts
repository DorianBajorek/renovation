export interface Database {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: string;
          name: string;
          budget: number;
          icon: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          budget: number;
          icon?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
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
