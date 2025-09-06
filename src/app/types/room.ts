// Room related interfaces
export interface Room {
  id?: string;
  user_id?: string;
  project_id?: string | null;
  name: string;
  expenses?: number; // Suma wydatków (obliczana dynamicznie)
  project_budget?: number; // Budżet projektu (dodane dla paska postępu)
  icon: any;
  visualization_images?: string[] | null; // Array URL-ów do zdjęć wizualizacji pokoju
  created_at?: string;
  updated_at?: string;
}
