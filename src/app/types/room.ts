// Room related interfaces
export interface Room {
  id?: string;
  user_id?: string;
  name: string;
  budget: number;
  icon: any;
  created_at?: string;
  updated_at?: string;
}
