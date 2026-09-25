import { API_PAYMENTS_BASE_URL, API_ZONES_BASE_URL } from "./api";
import {
  GENERIC_FALLBACK_MESSAGE,
  GATEWAY_CONFIG_ERROR_MESSAGE,
  NETWORK_ERROR_MESSAGE,
  getUserFriendlyErrorMessage,
} from "../utils/errorMessages";
import {
  InitiatePaymentApiResponse,
  PaymentMethodApiResponse,
  VerifyPaymentApiResponse,
} from "../types/payment.types";

const API_BASE = API_PAYMENTS_BASE_URL;

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

export type PaymentErrorKind = 'network' | 'server' | 'client' | 'json';

/** Error thrown by the payment API layer, already carrying a user-friendly message. */
export class PaymentApiError extends Error {
  status: number;
  kind: PaymentErrorKind;
  code?: string;

  constructor(message: string, status = 0, kind: PaymentErrorKind = 'server', code?: string) {
    super(message);
    this.name = 'PaymentApiError';
    this.status = status;
    this.kind = kind;
    this.code = code;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  baseUrl?: string;
  /**
   * When false, a payload with `status: 'error'` is returned instead of thrown
   * (used by verify endpoints where an error is a legitimate status).
   */
  throwOnAppError?: boolean;
  /** Fallback message used when the backend does not provide one. */
  fallbackMessage?: string;
}

/**
 * Single entry point for payment HTTP calls.
 * - Never crashes on HTML/empty bodies (Django 404/500 pages).
 * - Turns network failures and malformed responses into friendly `PaymentApiError`.
 */
const request = async <T = any>(path: string, opts: RequestOptions = {}): Promise<T> => {
  const {
    method = 'GET',
    body,
    baseUrl = API_BASE,
    throwOnAppError = true,
    fallbackMessage = GENERIC_FALLBACK_MESSAGE,
  } = opts;

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: getAuthHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new PaymentApiError(NETWORK_ERROR_MESSAGE, 0, 'network');
  }

  const raw = await response.text().catch(() => '');
  let data: any = {};
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      // HTML error page or truncated body (e.g. non-existing endpoint)
      throw new PaymentApiError(
        GATEWAY_CONFIG_ERROR_MESSAGE,
        response.status || 500,
        'json'
      );
    }
  }

  const appError = data && data.status === 'error';
  if ((!response.ok || appError) && throwOnAppError) {
    throw new PaymentApiError(
      getUserFriendlyErrorMessage(data?.message, fallbackMessage),
      response.status,
      response.status >= 500 ? 'server' : response.status > 0 ? 'client' : 'network',
      data?.payment_status
    );
  }

  return data as T;
};

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
    try {
      const data = await request<any>('/zones/nearest/', {
        method: 'POST',
        baseUrl: API_ZONES_BASE_URL,
        body: { latitude, longitude },
        fallbackMessage: GENERIC_FALLBACK_MESSAGE,
      });
      if (data?.status === 'success') return data;
      return { status: 'success', mode: 'none', zone: null, distance_m: null };
    } catch {
      // La géolocalisation n'est pas bloquante : on retourne "aucune zone".
      return { status: 'success', mode: 'none', zone: null, distance_m: null };
    }
  },
};

// ============ Offer Group Operations ============

export const paymentService = {
  // Offer Groups
  async getOfferGroup(groupId: string) {
    const data = await request<any>(`/offer-groups/${groupId}/`, {
      fallbackMessage: "Impossible de charger ce pack. Veuillez réessayer.",
    });
    // Merge status with offer_group data so callers can access both.
    return { status: data.status, ...data.offer_group };
  },

  async listOfferGroups() {
    return request<any>('/offer-groups/', {
      fallbackMessage: "Impossible de charger les packs.",
    });
  },

  // Offers
  async getOffer(offerId: string) {
    return request<any>(`/offers/${offerId}/`, {
      fallbackMessage: "Impossible de charger cette offre.",
    });
  },

  async listOffers() {
    return request<any>('/offers/', {
      fallbackMessage: "Impossible de charger les offres.",
    });
  },

  // Products
  async getProduct(productId: string) {
    return request<any>(`/products/${productId}/`, {
      fallbackMessage: "Impossible de charger ce produit.",
    });
  },

  async listProducts() {
    return request<any>('/products/', {
      fallbackMessage: "Impossible de charger les produits.",
    });
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
  }): Promise<InitiatePaymentApiResponse> {
    return request<InitiatePaymentApiResponse>('/offers-payment/initiate/', {
      method: 'POST',
      body: payload,
      fallbackMessage: "Le paiement de l'offre n'a pas pu être lancé.",
    });
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
  }): Promise<InitiatePaymentApiResponse> {
    return request<InitiatePaymentApiResponse>('/product-payment/initiate/', {
      method: 'POST',
      body: payload,
      fallbackMessage: "Le paiement du produit n'a pas pu être lancé.",
    });
  },

  async verifyOfferPayment(payload: {
    gateway_reference?: string;
    payment_id?: string;
    offer_id: string;
  }): Promise<VerifyPaymentApiResponse> {
    return request<VerifyPaymentApiResponse>('/offers-payment/verify/', {
      method: 'POST',
      body: {
        reference: payload.gateway_reference,
        payment_id: payload.payment_id,
        offer_id: payload.offer_id,
      },
      throwOnAppError: false,
    });
  },

  async verifyProductPayment(payload: {
    gateway_reference?: string;
    payment_id?: string;
    product_id: string;
  }): Promise<VerifyPaymentApiResponse> {
    return request<VerifyPaymentApiResponse>('/product-payment/verify/', {
      method: 'POST',
      body: {
        reference: payload.gateway_reference,
        payment_id: payload.payment_id,
        product_id: payload.product_id,
      },
      throwOnAppError: false,
    });
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
  }): Promise<InitiatePaymentApiResponse> {
    return request<InitiatePaymentApiResponse>('/offer-groups-payment/initiate/', {
      method: 'POST',
      body: payload,
      fallbackMessage: "Le paiement du pack n'a pas pu être lancé.",
    });
  },

  async verifyGroupPayment(payload: {
    gateway_reference?: string;
    payment_id?: string;
    group_id: string;
  }): Promise<VerifyPaymentApiResponse> {
    return request<VerifyPaymentApiResponse>('/offer-groups-payment/verify/', {
      method: 'POST',
      body: {
        reference: payload.gateway_reference,
        payment_id: payload.payment_id,
        group_id: payload.group_id,
      },
      throwOnAppError: false,
    });
  },

  // ============ Payment List Operations ============

  async listPayments() {
    return request<any>('/payments/', { fallbackMessage: 'Impossible de charger les paiements.' });
  },

  async getPayment(paymentId: string) {
    return request<any>(`/payments/${paymentId}/`, { fallbackMessage: 'Impossible de charger le paiement.' });
  },

  async completePayment(paymentId: string) {
    return request<any>(`/payments/${paymentId}/complete/`, {
      method: 'POST',
      fallbackMessage: 'Impossible de finaliser le paiement.',
    });
  },

  async cancelPayment(paymentId: string) {
    return request<any>(`/payments/${paymentId}/cancel/`, {
      method: 'POST',
      fallbackMessage: "Impossible d'annuler le paiement.",
    });
  },

  // ============ Transactions ============

  async listTransactions() {
    return request<any>('/transactions/', { fallbackMessage: 'Impossible de charger les transactions.' });
  },

  async getTransaction(transactionId: string) {
    return request<any>(`/transactions/${transactionId}/`, {
      fallbackMessage: 'Impossible de charger la transaction.',
    });
  },

  // ============ Currencies ============

  async listCurrencies() {
    return request<any>('/currencies/', { fallbackMessage: 'Impossible de charger les devises.' });
  },

  async getCurrency(currencyId: string) {
    return request<any>(`/currencies/${currencyId}/`, { fallbackMessage: 'Impossible de charger la devise.' });
  },

  // ============ Payment Methods ============

  async listPaymentMethods(): Promise<PaymentMethodApiResponse> {
    const data = await request<PaymentMethodApiResponse>('/payment-methods/', {
      fallbackMessage: 'Impossible de charger les moyens de paiement.',
    });
    return data;
  },

  async getPaymentMethod(methodId: string) {
    return request<any>(`/payment-methods/${methodId}/`, {
      fallbackMessage: 'Impossible de charger le moyen de paiement.',
    });
  },

  // ============ Balance ============

  async getBalance(companyId?: string) {
    const url = companyId ? `/balances/${companyId}/` : '/balances/';
    return request<any>(url, { fallbackMessage: 'Impossible de charger le solde.' });
  },

  // ============ Logs ============

  async listPaymentLogs() {
    return request<any>('/logs/', { fallbackMessage: 'Impossible de charger les journaux.' });
  },

  async getUserPaymentLogs(userId: string) {
    return request<any>(`/logs/user/${userId}/`, { fallbackMessage: 'Impossible de charger les journaux.' });
  },

  async getCompanyPaymentLogs(companyId: string) {
    return request<any>(`/logs/company/${companyId}/`, { fallbackMessage: 'Impossible de charger les journaux.' });
  },

  // ============ Public ticket recovery ============

  /**
   * Recover ticket(s) from a Mobile Money transaction ID (public, no auth).
   * Returns the backend payload, or `{ status: 'rate_limited', retryAfter }`
   * when the server asks us to wait (HTTP 429).
   */
  async recoverTicket(transactionReference: string, fingerprint: string) {
    let response: Response;
    try {
      response = await fetch(`${API_BASE}/recover-ticket/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction_reference: transactionReference,
          fingerprint,
        }),
      });
    } catch {
      throw new PaymentApiError(NETWORK_ERROR_MESSAGE, 0, 'network');
    }

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
