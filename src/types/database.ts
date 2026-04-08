// Custom types for the boutique application
// These extend the auto-generated Supabase types

export interface Category {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  category_id: string | null;
  season: 'summer' | 'winter' | 'all_season' | null;
  size_options: string[];
  images: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  category?: Category;
}

export interface ProductWithPrice extends Product {
  original_price: number;
  discount_percent: number;
  final_price: number;
  sale_name: string | null;
}

export interface Sale {
  id: string;
  name: string;
  discount_percent: number;
  target_type: 'product' | 'category';
  target_ids: string[];
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  season: 'summer' | 'winter' | null;
  created_at: string;
}

export interface FeaturedProduct {
  id: string;
  product_id: string;
  position: number;
  created_at: string;
  product?: Product;
}

export type OrderStatus = 'en_attente' | 'confirmee' | 'en_route' | 'livree' | 'annulee';

export interface Order {
  id: string;
  short_id: string;
  client_name: string;
  client_phone: string;
  client_city: string;
  client_address: string;
  product_id: string | null;
  product_name_snapshot: string;
  product_price_snapshot: number;
  discount_applied: number;
  final_price: number;
  size_selected: string;
  notes: string | null;
  status: OrderStatus;
  status_change_reason: string | null;
  status_change_history: Array<{
    from: string;
    to: string;
    reason: string;
    timestamp: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface Settings {
  id: string;
  whatsapp_number: string | null;
  telegram_username: string | null;
  delivery_zones: string | null;
  show_footer_credit: boolean;
  telegram_bot_token: string | null;
  telegram_chat_id: string | null;
  whatsapp_api_token: string | null;
  whatsapp_phone_id: string | null;
  notifications_enabled: boolean;
  low_stock_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface OrderFormData {
  client_name: string;
  client_phone: string;
  client_city: string;
  client_address: string;
  client_email?: string;
  size_selected: string;
  notes?: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribed_at: string;
  is_active: boolean;
}
