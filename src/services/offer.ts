import { apiPost, apiGet, apiPut, apiDelete, endpoints, ApiResponse } from './api';

export interface Offer {
  id: string;
  company: string;
  name: string;
  description?: string;
  price: string;
  currency: string;
  offer_type: 'ticket' | 'digital_product';
  discount_percentage?: string;
  discount_amount?: string;
  discount_currency?: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  is_featured: boolean;
  valid_from?: string;
  valid_to?: string;
  category?: string;
  tags?: string[];
  webhook_url?: string;
  redirect_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOfferRequest {
  name: string;
  description?: string;
  price: number;
  currency: string;
  offer_type: 'ticket' | 'digital_product';
  discount_percentage?: number;
  discount_amount?: number;
  discount_currency?: string;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
  is_featured?: boolean;
  valid_from?: string;
  valid_to?: string;
  category?: string;
  tags?: string[];
  webhook_url?: string;
  redirect_url?: string;
}

export interface UpdateOfferRequest {
  name?: string;
  description?: string;
  price?: number;
  currency?: string;
  offer_type?: 'ticket' | 'digital_product';
  discount_percentage?: number;
  discount_amount?: number;
  discount_currency?: string;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
  is_featured?: boolean;
  valid_from?: string;
  valid_to?: string;
  category?: string;
  tags?: string[];
  webhook_url?: string;
  redirect_url?: string;
}

export const offerService = {
  list: (companyId: string) =>
    apiGet<ApiResponse<{ offers: Offer[] }>>(endpoints.offer.list(companyId)),

  detail: (id: string) =>
    apiGet<ApiResponse<{ offer: Offer }>>(endpoints.offer.detail(id)),

  create: (data: CreateOfferRequest) =>
    apiPost<ApiResponse<{ offer: Offer }>>(endpoints.offer.create, data),

  update: (id: string, data: UpdateOfferRequest) =>
    apiPut<ApiResponse<{ offer: Offer }>>(endpoints.offer.update(id), data),

  delete: (id: string) =>
    apiDelete<ApiResponse>(endpoints.offer.delete(id)),
};
