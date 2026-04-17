export interface Variant {
  size: string;
  price: number;
  label?: string;
}

export interface Addon {
  id: string;
  name: string;
  price: number;
}

export interface Restaurant {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  category?: string;
  is_active: boolean;
}

export interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category?: string;
  restaurant_id?: number;
  restaurant_name?: string;
  variants?: Variant[];
  addons?: Addon[];
}

export interface CartItem extends MenuItem {
  quantity: number;
  selected_variant?: Variant;
  selected_addons?: Addon[];
  _cartKey: string;
}

export interface RestaurantGroup {
  restaurant_id: number | null;
  restaurant_name: string;
  items: CartItem[];
  subtotal: number;
}
