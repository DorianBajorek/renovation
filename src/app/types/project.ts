// Project related interfaces
export interface Project {
  id?: string;
  user_id?: string;
  name: string;
  description: string;
  budget: number;
  expenses?: number; // Suma wydatków (obliczana dynamicznie)
  startDate: string;
  endDate: string;
  status: 'active' | 'planning' | 'completed';
  icon: string;
  created_at?: string;
  updated_at?: string;
}

// Status types
export type ProjectStatus = 'active' | 'planning' | 'completed';
