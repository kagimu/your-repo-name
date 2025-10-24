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

export interface DeliveryDetails {
  fullName: string;
  email: string;
  phone: string;
  coordinates: { lat: number; lng: number };
  address: string;
  district: string;
  city: string;
  postalCode?: string;
  instructions?: string;
  deliveryFee?: number;
  distanceKm?: number;
}

export interface PendingCheckoutDetails {
  deliveryDetails?: DeliveryDetails;
  items?: CartItem[];
}

export interface CartContextType {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  addToCart: (product: CartItem, qty?: number) => Promise<void>;
  removeFromCart: (id: number) => Promise<void>;
  updateQuantity: (id: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartCount: () => number;
  getCartTotal: () => number;
  mergeGuestCart: () => Promise<boolean | void>;
  pendingCheckoutDetails: PendingCheckoutDetails | null;
  savePendingCheckout: (details: PendingCheckoutDetails) => void;
  clearPendingCheckout: () => void;
}