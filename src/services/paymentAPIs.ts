/**
 * Payment API Service
 * Handles all payment API configuration and management
 */

import { apiGet, apiPost, endpoints, ApiResponse } from './api';

export interface PaymentAPI {
  id: string;
  company: string;
  api_key: string;
  api_secret?: string;
  webhook_url?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentAPILog {
  id: string;
  api: string;
  action: string;
  status: 'success' | 'failure';
  request: any;
  response: any;
  created_at: string;
}

export interface CreatePaymentAPIPayload {
  company_id: string;
  webhook_url?: string;
}

export interface UpdatePaymentAPIPayload {
  api_id: string;
  webhook_url?: string;
  is_active?: boolean;
}

/**
 * List payment APIs
 */
export async function listPaymentAPIs(): Promise<ApiResponse<PaymentAPI[]>> {
  try {
    return await apiGet(endpoints.paymentAPIs.list);
  } catch (error) {
    console.error('Failed to fetch payment APIs:', error);
    throw error;
  }
}

/**
 * Get payment API details
 */
export async function getPaymentAPIDetail(apiId: string): Promise<ApiResponse<PaymentAPI>> {
  try {
    return await apiGet(endpoints.paymentAPIs.detail(apiId));
  } catch (error) {
    console.error('Failed to fetch payment API details:', error);
    throw error;
  }
}

/**
 * Create payment API
 */
export async function createPaymentAPI(
  payload: CreatePaymentAPIPayload
): Promise<ApiResponse<PaymentAPI>> {
  try {
    return await apiPost(endpoints.paymentAPIs.create, payload);
  } catch (error) {
    console.error('Failed to create payment API:', error);
    throw error;
  }
}

/**
 * Update payment API
 */
export async function updatePaymentAPI(
  payload: UpdatePaymentAPIPayload
): Promise<ApiResponse<PaymentAPI>> {
  try {
    const { api_id, ...data } = payload;
    return await apiPost(endpoints.paymentAPIs.update(api_id), data);
  } catch (error) {
    console.error('Failed to update payment API:', error);
    throw error;
  }
}

/**
 * Delete payment API
 */
export async function deletePaymentAPI(apiId: string): Promise<ApiResponse> {
  try {
    return await apiPost(endpoints.paymentAPIs.delete(apiId));
  } catch (error) {
    console.error('Failed to delete payment API:', error);
    throw error;
  }
}

/**
 * Get payment API logs
 */
export async function getPaymentAPILogs(
  apiId: string
): Promise<ApiResponse<PaymentAPILog[]>> {
  try {
    return await apiGet(endpoints.paymentAPIs.logs(apiId));
  } catch (error) {
    console.error('Failed to fetch payment API logs:', error);
    throw error;
  }
}

/**
 * Type guards
 */
export function isPaymentAPI(data: any): data is PaymentAPI {
  return (
    data &&
    typeof data === 'object' &&
    'id' in data &&
    'api_key' in data &&
    'company' in data
  );
}

export function isPaymentAPILog(data: any): data is PaymentAPILog {
  return (
    data &&
    typeof data === 'object' &&
    'id' in data &&
    'action' in data &&
    'status' in data
  );
}
