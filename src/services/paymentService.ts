import { API_PAYMENTS_BASE_URL, API_ZONES_BASE_URL } from "./api";
import { getUserFriendlyErrorMessage } from "../utils/errorMessages";

const API_BASE = API_PAYMENTS_BASE_URL;

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

// ============ Zones (géolocalisation du paiement) ============

/** Position du client partagée (consentement + CGU) pour l'attribution d'une zone. */
export interface PaymentLocation {
  latitude?: number;
  longitude?: number;
  location_shared: boolean;
  terms_accepted: boolean;
  zone_id?: string;
}

export const zoneService = {
  /** Trouve la zone qui contient / est la plus proche d'une position GPS (public). */
  async nearestZone(latitude: number, longitude: number) {
    const response = await fetch(`${API_ZONES_BASE_URL}/zones/nearest/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude, longitude }),
    });
    const data = await response.json().catch(() => ({}));
    if (data.status === 'success') return data;
    return { status: 'success', mode: 'none', zone: null, distance_m: null };
  },
};

const throwPaymentError = (data: any, fallback: string) => {
  const rawMessage = data?.message || fallback;
  throw new Error(getUserFriendlyErrorMessage(rawMessage, rawMessage));
};

// ============ Offer Group Operations ============

export const paymentService = {
  // Offer Groups
  async getOfferGroup(groupId: string) {
    console.log('getOfferGroup called with groupId:', groupId);
    const response = await fetch(
      `${API_BASE}/offer-groups/${groupId}/`,
      { headers: getAuthHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch offer group');
    const data = await response.json();
    console.log('getOfferGroup response:', data);
    // Merge status with offer_group data so code can access both response.status and response.id, etc.
    return { status: data.status, ...data.offer_group };
  },

  async listOfferGroups() {
    console.log('listOfferGroups called');
    const response = await fetch(`${API_BASE}/offer-groups/`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch offer groups');
    const data = await response.json();
    console.log('listOfferGroups response:', data);
    return data;
  },

  // Offers
  async getOffer(offerId: string) {
    const response = await fetch(
      `${API_BASE}/offers/${offerId}/`,
      { headers: getAuthHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch offer');
    return response.json();
  },

  async listOffers() {
    const response = await fetch(`${API_BASE}/offers/`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch offers');
    return response.json();
  },

  // Products
  async getProduct(productId: string) {
    const response = await fetch(
      `${API_BASE}/products/${productId}/`,
      { headers: getAuthHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch product');
    return response.json();
  },

  async listProducts() {
    const response = await fetch(`${API_BASE}/products/`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  // ============ Payment Operations ============

  async initiateOfferPayment(payload: {
    offer_id: string;
    email?: string;
    phone: string;
    payment_method_id: string;
    channel?: string;
    amount?: number;
    currency?: string;
    client_ip?: string;
    send_sms?: boolean;
    send_email?: boolean;
    sms_phone?: string;
    latitude?: number;
    longitude?: number;
    location_shared?: boolean;
    terms_accepted?: boolean;
    zone_id?: string;
  }) {
    const response = await fetch(
      `${API_BASE}/offers-payment/initiate/`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok || data.status === 'error') {
      throwPaymentError(data, `Failed to initiate offer payment: HTTP ${response.status}`);
    }

    return data;
  },

  async initiateProductPayment(payload: {
    product_id: string;
    email?: string;
    phone: string;
    payment_method_id: string;
    channel?: string;
    amount?: number;
    currency?: string;
    client_ip?: string;
    send_sms?: boolean;
    send_email?: boolean;
    sms_phone?: string;
    latitude?: number;
    longitude?: number;
    location_shared?: boolean;
    terms_accepted?: boolean;
    zone_id?: string;
  }) {
    const response = await fetch(
      `${API_BASE}/product-payment/initiate/`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();
    

    if (!response.ok || data.status === 'error') {
      throwPaymentError(data, `Failed to initiate product payment: HTTP ${response.status}`);
    }

    return data;
  },

  async verifyOfferPayment(payload: {
    gateway_reference?: string;
    payment_id?: string;
    offer_id: string;
  }) {
    const response = await fetch(
      `${API_BASE}/offers-payment/verify/`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          reference: payload.gateway_reference,
          payment_id: payload.payment_id,
          offer_id: payload.offer_id,
        }),
      }
    );

    const data = await response.json();
    return data;
  },

  async verifyProductPayment(payload: {
    gateway_reference?: string;
    payment_id?: string;
    product_id: string;
  }) {
    const response = await fetch(
      `${API_BASE}/product-payment/verify/`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          reference: payload.gateway_reference,
          payment_id: payload.payment_id,
          product_id: payload.product_id,
        }),
      }
    );

    const data = await response.json();
    return data;
  },

  async initiateGroupPayment(payload: {
    group_id: string;
    email?: string;
    phone: string;
    payment_method_id: string;
    channel?: string;
    amount?: number;
    currency?: string;
    client_ip?: string;
    send_sms?: boolean;
    send_email?: boolean;
    sms_phone?: string;
    latitude?: number;
    longitude?: number;
    location_shared?: boolean;
    terms_accepted?: boolean;
    zone_id?: string;
  }) {
    console.log('initiateGroupPayment called with payload:', payload);
    const response = await fetch(
      `${API_BASE}/offer-groups-payment/initiate/`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();
    console.log('initiateGroupPayment response:', data);

    if (!response.ok || data.status === 'error') {
      throwPaymentError(data, `Failed to initiate group payment: HTTP ${response.status}`);
    }

    return data;
  },

  async verifyGroupPayment(payload: {
    gateway_reference?: string;
    payment_id?: string;
    group_id: string;
  }) {
    console.log('verifyGroupPayment called with payload:', payload);
    const response = await fetch(
      `${API_BASE}/offer-groups-payment/verify/`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          reference: payload.gateway_reference,
          payment_id: payload.payment_id,
          group_id: payload.group_id,
        }),
      }
    );

    const data = await response.json();
    console.log('verifyGroupPayment response:', data);
    return data;
  },

  // ============ Payment List Operations ============

  async listPayments() {
    const response = await fetch(`${API_BASE}/payments/`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch payments');
    return response.json();
  },

  async getPayment(paymentId: string) {
    const response = await fetch(
      `${API_BASE}/payments/${paymentId}/`,
      { headers: getAuthHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch payment');
    return response.json();
  },

  async completePayment(paymentId: string) {
    const response = await fetch(
      `${API_BASE}/payments/${paymentId}/complete/`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
      }
    );
    if (!response.ok) throw new Error('Failed to complete payment');
    return response.json();
  },

  async cancelPayment(paymentId: string) {
    const response = await fetch(
      `${API_BASE}/payments/${paymentId}/cancel/`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
      }
    );
    if (!response.ok) throw new Error('Failed to cancel payment');
    return response.json();
  },

  // ============ Transactions ============

  async listTransactions() {
    const response = await fetch(`${API_BASE}/transactions/`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return response.json();
  },

  async getTransaction(transactionId: string) {
    const response = await fetch(
      `${API_BASE}/transactions/${transactionId}/`,
      { headers: getAuthHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch transaction');
    return response.json();
  },

  // ============ Currencies ============

  async listCurrencies() {
    const response = await fetch(`${API_BASE}/currencies/`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch currencies');
    return response.json();
  },

  async getCurrency(currencyId: string) {
    const response = await fetch(
      `${API_BASE}/currencies/${currencyId}/`,
      { headers: getAuthHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch currency');
    return response.json();
  },

  // ============ Payment Methods ============

  async listPaymentMethods() {
    const response = await fetch(`${API_BASE}/payment-methods/`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch payment methods');
    return response.json();
  },

  async getPaymentMethod(methodId: string) {
    const response = await fetch(
      `${API_BASE}/payment-methods/${methodId}/`,
      { headers: getAuthHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch payment method');
    return response.json();
  },

  // ============ Balance ============

  async getBalance(companyId?: string) {
    const url = companyId
      ? `${API_BASE}/balances/${companyId}/`
      : `${API_BASE}/balances/`;

    const response = await fetch(url, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch balance');
    return response.json();
  },

  // ============ Logs ============

  async listPaymentLogs() {
    const response = await fetch(`${API_BASE}/logs/`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch logs');
    return response.json();
  },

  async getUserPaymentLogs(userId: string) {
    const response = await fetch(
      `${API_BASE}/logs/user/${userId}/`,
      { headers: getAuthHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch user logs');
    return response.json();
  },

  async getCompanyPaymentLogs(companyId: string) {
    const response = await fetch(
      `${API_BASE}/logs/company/${companyId}/`,
      { headers: getAuthHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch company logs');
    return response.json();
  },

  // ============ Public ticket recovery ============

  /**
   * Recover ticket(s) from a Mobile Money transaction ID (public, no auth).
   * Returns the backend payload, or `{ status: 'rate_limited', retryAfter }`
   * when the server asks us to wait (HTTP 429).
   */
  async recoverTicket(transactionReference: string, fingerprint: string) {
    const response = await fetch(`${API_BASE}/recover-ticket/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transaction_reference: transactionReference,
        fingerprint,
      }),
    });

    const data = await response.json().catch(() => ({} as any));

    if (response.status === 429) {
      const retryAfter = parseInt(response.headers.get('Retry-After') || '60', 10);
      return {
        status: 'rate_limited',
        message: data?.message || 'Too many requests. Please wait.',
        retryAfter: Number.isFinite(retryAfter) ? retryAfter : 60,
      };
    }

    return data;
  },
};
