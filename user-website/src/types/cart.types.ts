export interface CartItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  image: string;
  stock: number;
}

export interface Cart {
  id?: string;
  userId?: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  itemCount: number;
  updatedAt?: string;
}

export interface AddToCartData {
  productId: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  image: string;
  stock: number;
}
