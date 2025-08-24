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
