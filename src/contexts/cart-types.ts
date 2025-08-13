export interface CartItem {
  id: number;                 // This represents product_id from API
  name: string;
  price: number;
  quantity: number;
  image: string;              // This is the "avatar" field from API
  category?: string;
  unit?: string;
}

export interface ApiCartItem {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  avatar: string;
  category?: string;
  unit?: string;
}

export interface CartContextType {
  items: CartItem[];
  addToCart: (product: CartItem) => Promise<void>;
  removeFromCart: (id: number) => Promise<void>;
  updateQuantity: (id: number, quantity: number) => Promise<void>;
  clearCart: () => void;
  getCartCount: () => number;
  getCartTotal: () => number;
}