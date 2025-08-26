// Project related interfaces
export interface Project {
  id?: string;
  user_id?: string;
  name: string;
  description?: string;
  budget: number;
  expenses?: number; // Suma wydatków (obliczana dynamicznie)
  status: 'active' | 'completed';
  icon: string;
  created_at?: string;
  updated_at?: string;
  owner_name?: string; // Nazwa właściciela projektu (dla udostępnionych projektów)
  permission_type?: 'read' | 'edit'; // Typ uprawnień dla udostępnionych projektów
  is_shared?: boolean; // Czy projekt jest udostępniony
}

// Status types
export type ProjectStatus = 'active' | 'completed';

// Project sharing interfaces
export interface ProjectShare {
  id: string;
  project_id: string;
  owner_id: string;
  shared_with_id: string;
  permission_type: 'read' | 'edit';
  created_at: string;
  updated_at: string;
  project_name?: string;
  owner_name?: string;
  shared_with_name?: string;
  // Relacje z API
  shared_with?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  owner?: {
    first_name: string;
    last_name: string;
  };
}

export interface ShareProjectRequest {
  projectId: string;
  userEmail: string;
  permissionType: 'read' | 'edit';
}

export interface RemoveShareRequest {
  projectId: string;
  sharedWithId: string;
}
