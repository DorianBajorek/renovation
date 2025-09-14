// Product related interfaces
export interface Product {
  id?: string;
  room_id?: string;
  name: string;
  description?: string;
  link?: string;
  shop?: string;
  price: number;
  quantity: number;
  category?: string;
  status: 'planned' | 'purchased';
  room_name?: string; // Added for export functionality
  image_url?: string; // Added for product image
  // New fields for shared projects
  project_name?: string; // Name of the project this product belongs to
  project_id?: string; // ID of the project this product belongs to
  is_shared?: boolean; // Whether this product is from a shared project
  is_own_room?: boolean; // Whether this product is from user's own room
  owner_name?: string; // Name of the product owner (for shared products)
  created_at?: string;
  updated_at?: string;
}

export interface ProductFormData {
  name: string;
  description?: string;
  link?: string;
  shop?: string;
  price: number;
  quantity: number;
  category?: string;
  status: 'planned' | 'purchased';
  image_url?: string; // Added for product image
}
