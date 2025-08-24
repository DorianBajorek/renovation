// Product related interfaces
export interface Product {
  id?: string;
  room_id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  category?: string;
  status: 'planned' | 'purchased' | 'installed';
  room_name?: string; // Added for export functionality
  created_at?: string;
  updated_at?: string;
}

export interface ProductFormData {
  name: string;
  description?: string;
  price: number;
  quantity: number;
  category?: string;
  status: 'planned' | 'purchased' | 'installed';
}
