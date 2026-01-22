
export interface Product {
  id: string;
  productName: string;
  barcode: string;
  category: string;
  imageUrl: string;
  brand: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  city: string;
}

export interface Supermarket {
  id: string;
  name: string;
  logoUrl: string;
  cep?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  parentId?: string; // Se presente, indica que é uma filial de outro supermercado
}

export interface PriceRecord {
  id: string;
  productId: string;
  supermarketId: string; // Refere-se ao ID da unidade (filial ou matriz)
  price: number;
  originalPrice?: number;
  stock?: number;
  lastUpdated: number;
}

export interface ShoppingListItem {
  product: Product;
  quantity: number;
}

export interface Feedback {
  id: string;
  userName: string;
  userPhoto?: string;
  rating: number;
  comment: string;
  date: string;
  likes: number;
}

export type ViewState = 'CONSUMER' | 'ADMIN' | 'LOGIN' | 'LIST' | 'GMAIL_INTEGRATION' | 'STORE_REGISTRATION' | 'SUBSCRIPTION_PLAN' | 'USER_REGISTRATION' | 'FEEDBACK';
