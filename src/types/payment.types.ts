// Payment System Type Definitions

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image?: string;
  featured?: boolean;
  /** true when the owning company has at least one active zone (location required). */
  company_has_zones?: boolean;
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
  icon?: string | null;
  icon_background?: string | null;
  callback_url?: string;
  /** true when the owning company has at least one active zone (location required). */
  company_has_zones?: boolean;
}

export interface OfferGroup {
  id: string;
  name: string;
  description: string;
  price?: number; // Price when is_package is true
  originalPrice?: number;
  currency?: string;
  currency_id?: string;
  discount?: number;
  image?: string;
  coverImage?: string;
  /** Optional HTML header (only <div> with inline style) shown on the sales page. */
  header_html?: string;
  items: (Product | Offer)[];
  offers?: (Product | Offer)[];
  is_package: boolean; // true = buy directly as package, false = just a collection of offers
  is_active: boolean;
  is_featured: boolean;
  purchasable?: boolean; // legacy field, use is_package instead
  company_id?: string;
  /** true when the owning company has at least one active zone (location required). */
  company_has_zones?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'credit_card' | 'paypal' | 'bank_transfer' | 'mobile_money' | 'bank_account' | 'card' | 'wallet';
  icon?: string;
  channel?: string;  // e.g., 'cm.mtn', 'cm.orange', 'cm.paypal'
  country?: string;  // ISO 3166-1 alpha-2 country code (e.g., 'CM', 'GA', 'CI')
  logo?: string;     // URL to payment method logo
  is_active?: boolean;
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
  // Mobile Money fields
  mobileMoneyNumber?: string;
  // Bank Transfer fields
  bankAccountNumber?: string;
  bankAccountName?: string;
  bankCode?: string;
  // Credit Card fields
  cardNumber?: string;
  cardExpiry?: string;
  cardCvc?: string;
  // Delivery options
  sendEmail?: boolean;
  sendSms?: boolean;
  smsPhoneNumber?: string;
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

// ============ API Response Contracts ============

export interface PaymentMethodApiResponse {
  status: 'success' | 'error';
  message?: string;
  payment_methods?: PaymentMethod[];
}

export interface InitiatePaymentApiResponse {
  status: 'success' | 'error';
  message?: string;
  payment_id?: string;
  transaction_id?: string;
  offer_id?: string;
  group_id?: string;
  product_id?: string;
  reference?: string;
  gateway_reference?: string | null;
  amount?: string;
  currency?: string;
  zone?: { id: string; name: string; color?: string; company_name?: string } | null;
  pay_url?: string | null;
  ussd_code?: string | null;
}

export interface PaymentZoneInfo {
  id: string;
  name: string;
  color?: string;
  company_name?: string;
  mode?: string;
  distance_m?: number | null;
}

export interface VerifyPaymentApiResponse {
  status: 'success' | 'pending' | 'error';
  message?: string;
  payment_status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  payment_id?: string;
  offer_id?: string;
  group_id?: string;
  offer_type?: string;
  offer_name?: string;
  group_name?: string;
  transaction_reference?: string;
  ticket?: any;
  tickets?: any[];
  ticket_available?: boolean;
  all_tickets_available?: boolean;
  admin_contact_message?: string;
  offers_without_tickets?: string[];
  callback_url?: string;
}

export interface PaymentItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  image?: string;
  icon?: string | null;
  icon_background?: string | null;
  type?: string;
}

// ============ Cameroon Mobile Money Helpers ============

export type MobileOperator = 'mtn' | 'orange' | 'unknown';

/** Keep only digits and normalize to the local 9-digit Cameroonian format. */
export const normalizeLocalPhone = (raw: string): string => {
  let digits = (raw || '').replace(/\D/g, '');
  if (digits.startsWith('237')) digits = digits.slice(3);
  digits = digits.replace(/^0+/, '');
  return digits.slice(0, 9);
};

/** Display helper: 6XX XX XX XX */
export const formatLocalPhone = (raw: string): string => {
  const digits = normalizeLocalPhone(raw);
  if (!digits) return '';
  return digits.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
};

/** Infer the CamPay operator from a (local or international) number. */
export const detectOperator = (raw: string): MobileOperator => {
  const digits = normalizeLocalPhone(raw);
  if (digits.length < 2) return 'unknown';
  if (/^(65|66|67|68)/.test(digits)) return 'mtn';
  if (/^69/.test(digits)) return 'orange';
  return 'unknown';
};

/** Map a payment-method channel/name to a known operator (or null). */
export const operatorFromChannel = (channel?: string, name?: string): MobileOperator => {
  const haystack = `${channel || ''} ${name || ''}`.toLowerCase();
  if (/(^|[^a-z])(mtn)/.test(haystack) || haystack.includes('momo')) return 'mtn';
  if (haystack.includes('orange')) return 'orange';
  return 'unknown';
};

/** A valid Cameroonian mobile number starts with 6 and has 9 digits. */
export const isValidMobileNumber = (raw: string): boolean => {
  const digits = normalizeLocalPhone(raw);
  return digits.length === 9 && digits.startsWith('6');
};
