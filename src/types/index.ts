export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  banner_url?: string;
  business_type: string;
  description?: string;
  whatsapp: string;
  address?: string;
  city?: string;
  opening_hours?: string;
  delivery_fee: number;
  min_order_for_free_delivery?: number;
  average_delivery_time?: string;
  instagram?: string;
  status: 'active' | 'inactive';
  primary_color: string;
  secondary_color: string;
  button_color: string;
  visual_style: string;
  font_family?: string;
  border_radius?: string;
  card_style?: string;
  show_delivery_status?: boolean;
  created_at?: string;
}

export interface Category {
  id: string;
  restaurant_id: string;
  name: string;
  icon?: string;
  banner_url?: string;
  display_order: number;
  status: 'active' | 'inactive';
  is_active?: boolean;
}

export interface Product {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_featured: boolean;
  is_best_seller: boolean;
  is_available: boolean;
  options: any[];
  internal_notes?: string;
  estimated_time?: string;
  nutritional_info?: string;
  variants?: any[];
}

export interface CartItem extends Product {
  quantity: number;
  selectedOptions?: any[];
  notes?: string;
}