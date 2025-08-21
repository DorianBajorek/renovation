// Project related interfaces
export interface Project {
  id: string;
  name: string;
  description: string;
  budget: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'planning' | 'completed';
  rooms: string[];
  icon: string;
}

// Status types
export type ProjectStatus = 'active' | 'planning' | 'completed';
