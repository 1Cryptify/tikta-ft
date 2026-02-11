// Payment System Type Definitions

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image?: string;
  featured?: boolean;
}

export interface Offer {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  currency: string;
  discount?: number;
  validUntil?: Date;
  image?: string;
}

export interface OfferGroup {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  currency: string;
  discount?: number;
  image?: string;
  coverImage?: string;
  items: (Product | Offer)[];
  purchasable: boolean; // true = buy directly as bundle, false = choose one product
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'credit_card' | 'paypal' | 'bank_transfer';
  icon?: string;
}

export interface PaymentFormData {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  paymentMethod: string;
  acceptTerms: boolean;
}

export interface PaymentDetails {
  transactionId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'completed' | 'failed' | 'pending';
  date: Date;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  data?: PaymentDetails;
}
