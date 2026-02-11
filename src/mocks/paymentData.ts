import {
  Product,
  Offer,
  OfferGroup,
  PaymentMethod,
  PaymentDetails,
} from '../types/payment.types';

// ==================== PRODUCTS ====================
export const PRODUCTS: Product[] = [
  {
    id: 'PROD_001',
    name: 'Starter Package',
    description: 'Perfect for individuals and small projects',
    price: 99.99,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=400&h=300&fit=crop',
    featured: false,
  },
  {
    id: 'PROD_002',
    name: 'Professional Suite',
    description: 'Comprehensive tools for growing businesses',
    price: 199.99,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    featured: false,
  },
  {
    id: 'PROD_003',
    name: 'Enterprise Solution',
    description: 'Premium features for large-scale operations',
    price: 499.99,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
    featured: false,
  },
  {
    id: 'PROD_004',
    name: 'Analytics Plus',
    description: 'Advanced analytics and reporting tools',
    price: 149.99,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    featured: false,
  },
  {
    id: 'PROD_005',
    name: 'Security Pro',
    description: 'Enhanced security and compliance features',
    price: 249.99,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=400&h=300&fit=crop',
    featured: false,
  },
];

// ==================== OFFERS ====================
export const OFFERS: Offer[] = [
  {
    id: 'OFFER_001',
    name: 'Summer Sale',
    description: 'Limited time offer - 30% discount',
    price: 69.99,
    originalPrice: 99.99,
    currency: 'USD',
    discount: 30,
    validUntil: new Date('2026-08-31'),
    image: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=400&h=300&fit=crop',
  },
  {
    id: 'OFFER_002',
    name: 'Black Friday Bundle',
    description: 'Special bundle - 25% off',
    price: 149.99,
    originalPrice: 199.99,
    currency: 'USD',
    discount: 25,
    validUntil: new Date('2026-12-01'),
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
  },
  {
    id: 'OFFER_003',
    name: 'Early Bird Special',
    description: 'New customer offer - 20% off',
    price: 79.99,
    originalPrice: 99.99,
    currency: 'USD',
    discount: 20,
    validUntil: new Date('2026-03-31'),
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
  },
];

// ==================== OFFER GROUPS ====================
export const OFFER_GROUPS: OfferGroup[] = [
  {
    id: 'GROUP_001',
    name: 'Starter Bundle',
    description: 'All essentials for beginners',
    price: 249.97,
    originalPrice: 299.97,
    currency: 'USD',
    discount: 15,
    image: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&h=400&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=1200&h=400&fit=crop',
    purchasable: true,
    items: [PRODUCTS[0], OFFERS[2]],
  },
  {
    id: 'GROUP_002',
    name: 'Professional Package',
    description: 'Complete solution for professionals',
    price: 0,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=400&fit=crop',
    purchasable: false,
    items: [PRODUCTS[1], PRODUCTS[3], OFFERS[0]],
  },
  {
    id: 'GROUP_003',
    name: 'Ultimate Suite',
    description: 'Everything you need for enterprise success',
    price: 1299.97,
    originalPrice: 1749.97,
    currency: 'USD',
    discount: 25,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=400&fit=crop',
    purchasable: true,
    items: [PRODUCTS[2], PRODUCTS[3], PRODUCTS[4], OFFERS[1]],
  },
  {
    id: 'GROUP_004',
    name: 'Product Selection',
    description: 'Choose any product from our collection',
    price: 0,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&h=400&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=1200&h=400&fit=crop',
    purchasable: false,
    items: PRODUCTS.slice(0, 3),
  },
];

// ==================== PAYMENT METHODS ====================
export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'CC',
    name: 'Credit Card',
    type: 'credit_card',
    icon: 'credit_card',
  },
  {
    id: 'PAYPAL',
    name: 'PayPal',
    type: 'paypal',
    icon: 'paypal',
  },
  {
    id: 'BANK',
    name: 'Bank Transfer',
    type: 'bank_transfer',
    icon: 'bank',
  },
  {
    id: 'MOBILE_MONEY',
    name: 'Mobile Money',
    type: 'mobile_money',
    icon: 'phone',
  },
  {
    id: 'BANK_ACCOUNT',
    name: 'Bank Account',
    type: 'bank_account',
    icon: 'account_balance',
  },
];

// ==================== PAYMENT DETAILS (MOCK) ====================
export const MOCK_PAYMENT_DETAILS = {
  completed: {
    transactionId: 'TXN_1234567890ABC',
    amount: 249.97,
    currency: 'USD',
    paymentMethod: 'Credit Card',
    status: 'completed' as const,
    date: new Date(),
    items: [
      { name: 'Starter Package', price: 99.99, quantity: 1 },
      { name: 'Early Bird Special', price: 69.99, quantity: 1 },
    ],
    subtotal: 169.98,
    tax: 16.99,
    total: 249.97,
  },
  failed: {
    transactionId: 'TXN_FAILED_123456',
    amount: 199.99,
    currency: 'USD',
    paymentMethod: 'Credit Card',
    status: 'failed' as const,
    date: new Date(),
    items: [{ name: 'Professional Suite', price: 199.99, quantity: 1 }],
    subtotal: 199.99,
    tax: 0,
    total: 199.99,
  },
};

// ==================== HELPER FUNCTIONS ====================

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function getOfferById(id: string): Offer | undefined {
  return OFFERS.find((o) => o.id === id);
}

export function getOfferGroupById(id: string): OfferGroup | undefined {
  return OFFER_GROUPS.find((g) => g.id === id);
}

export function getAllProducts(): Product[] {
  return PRODUCTS;
}

export function getAllOffers(): Offer[] {
  return OFFERS;
}

export function getAllOfferGroups(): OfferGroup[] {
  return OFFER_GROUPS;
}

export function getPaymentMethods(): PaymentMethod[] {
  return PAYMENT_METHODS;
}

export function calculatePaymentTotal(
  subtotal: number,
  taxRate: number = 0.1,
  discount: number = 0
): number {
  const tax = subtotal * taxRate;
  const total = subtotal + tax - discount;
  return Math.round(total * 100) / 100;
}

export function formatPrice(price: number, currency: string = 'USD'): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(price);
}
