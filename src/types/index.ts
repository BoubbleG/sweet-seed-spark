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
  header_style?: string;
  category_layout?: string;
  product_card_layout?: string;
  background_color?: string;
  text_color?: string;
  show_search?: boolean;
  show_categories?: boolean;
  custom_css?: string;
  created_at?: string;
  edit_token?: string;
  accepts_delivery?: boolean;
  accepts_pickup?: boolean;
  payment_methods?: {
    pix?: boolean;
    credit_card?: boolean;
    debit_card?: boolean;
    cash?: boolean;
    meal_voucher?: boolean;
  } | null;
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
  promo_price?: number | null;
  is_on_promo?: boolean;
  promo_label?: string | null;
  has_sizes?: boolean;
  price_p?: number | null;
  price_m?: number | null;
  price_g?: number | null;
  sides_note?: string | null;
  option_groups?: ProductOptionGroup[];
}

export type OptionPricingMode = 'free' | 'per_option' | 'most_expensive';

export interface ProductOption {
  id: string;
  group_id: string;
  name: string;
  extra_price: number;
  is_available: boolean;
  display_order: number;
}

export interface ProductOptionGroup {
  id: string;
  product_id: string;
  name: string;
  min_select: number;
  max_select: number;
  pricing_mode: OptionPricingMode;
  display_order: number;
  options: ProductOption[];
}

export type ProductSize = "P" | "M" | "G";

export interface CartItem extends Product {
  quantity: number;
  selectedOptions?: any[];
  notes?: string;
  size?: ProductSize;
}

export type OrderStatus = "novo" | "preparando" | "pronto" | "entregue" | "cancelado";

export interface OrderItem {
  id: string;
  order_id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  notes?: string | null;
  size?: string | null;
}

export interface Order {
  id: string;
  restaurant_id: string;
  order_number: number;
  customer_name: string;
  customer_phone?: string | null;
  customer_address?: string | null;
  customer_neighborhood?: string | null;
  customer_reference?: string | null;
  payment_method?: string | null;
  change_for?: number | null;
  notes?: string | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  order_type: string;
  status: OrderStatus;
  printed_at?: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}