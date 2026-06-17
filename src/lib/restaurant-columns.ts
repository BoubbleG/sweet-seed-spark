// Safe restaurant columns for the public Data API.
// Excludes pin_hash, pin_failed_attempts, pin_locked_until — those are
// revoked at column level from anon/authenticated.
export const RESTAURANT_COLUMNS =
  "id, name, slug, logo_url, banner_url, business_type, description, whatsapp, address, city, opening_hours, delivery_fee, min_order_for_free_delivery, average_delivery_time, instagram, status, primary_color, secondary_color, button_color, visual_style, created_at, updated_at, font_family, border_radius, card_style, show_delivery_status, header_style, category_layout, product_card_layout, background_color, text_color, show_search, show_categories, custom_css, accepts_delivery, accepts_pickup, payment_methods, is_demo";