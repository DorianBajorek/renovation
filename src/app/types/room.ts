// Room related interfaces
export interface Room {
  id?: string;
  user_id?: string;
  project_id?: string | null;
  name: string;
  expenses?: number; // Suma wydatków (obliczana dynamicznie)
  icon: any;
  created_at?: string;
  updated_at?: string;
}
