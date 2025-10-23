export interface Product {
  id: number;
  name: string;
  category: string;
  avatar: string;
  images: string;
  color: string;
  rating: string;
  in_stock: string;
  condition: string;
  price: string;
  unit: string;
  desc: string;
  purchaseType: 'purchase' | 'hire';
  created_at: string;
  updated_at: string;
  avatar_url: string;
  images_url?: string[];
}