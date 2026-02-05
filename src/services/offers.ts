/**
 * Offer Service
 * Handles all offer related API calls
 */

import { apiGet, apiPost, endpoints, ApiResponse } from './api';

export interface Offer {
  id: string;
  company: string;
  name: string;
  description: string;
  discount_percentage?: number;
  discount_amount?: string;
  discount_currency?: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateOfferPayload {
  company_id: string;
  name: string;
  description: string;
  discount_percentage?: number;
  discount_amount?: string;
  discount_currency?: string;
  start_date: string;
  end_date: string;
}

export interface UpdateOfferPayload {
  offer_id: string;
  name?: string;
  description?: string;
  discount_percentage?: number;
  discount_amount?: string;
  discount_currency?: string;
  start_date?: string;
  end_date?: string;
}

/**
 * List offers for a company
 */
export async function listOffers(companyId: string): Promise<ApiResponse<Offer[]>> {
  try {
    return await apiGet(endpoints.offers.list(companyId));
  } catch (error) {
    console.error('Failed to fetch offers:', error);
    throw error;
  }
}

/**
 * Get offer details
 */
export async function getOfferDetail(offerId: string): Promise<ApiResponse<Offer>> {
  try {
    return await apiGet(endpoints.offers.detail(offerId));
  } catch (error) {
    console.error('Failed to fetch offer details:', error);
    throw error;
  }
}

/**
 * Create a new offer
 */
export async function createOffer(payload: CreateOfferPayload): Promise<ApiResponse<Offer>> {
  try {
    return await apiPost(endpoints.offers.create, payload);
  } catch (error) {
    console.error('Failed to create offer:', error);
    throw error;
  }
}

/**
 * Update offer
 */
export async function updateOffer(payload: UpdateOfferPayload): Promise<ApiResponse<Offer>> {
  try {
    const { offer_id, ...data } = payload;
    return await apiPost(endpoints.offers.update(offer_id), data);
  } catch (error) {
    console.error('Failed to update offer:', error);
    throw error;
  }
}

/**
 * Delete offer
 */
export async function deleteOffer(offerId: string): Promise<ApiResponse> {
  try {
    return await apiPost(endpoints.offers.delete(offerId));
  } catch (error) {
    console.error('Failed to delete offer:', error);
    throw error;
  }
}

/**
 * Type guard for offer
 */
export function isOffer(data: any): data is Offer {
  return (
    data &&
    typeof data === 'object' &&
    'id' in data &&
    'name' in data &&
    'company' in data
  );
}
