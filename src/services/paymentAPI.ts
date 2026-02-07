import { apiPost, apiGet, apiPut, endpoints, ApiResponse } from './api';

export interface PaymentAPI {
  id: string;
  company: string;
  name: string;
  api_key: string;
  api_secret: string;
  provider: 'stripe' | 'paypal' | 'flutterwave' | 'mpesa' | 'other';
  is_active: boolean;
  is_revoked: boolean;
  created_at: string;
  updated_at: string;
  revoked_at?: string;
  total_payments: number;
  total_amount: string;
  daily_limit?: string;
  monthly_limit?: string;
  total_limit?: string;
}

export interface CreatePaymentAPIRequest {
  name: string;
  api_key: string;
  api_secret: string;
  provider: 'stripe' | 'paypal' | 'flutterwave' | 'mpesa' | 'other';
  is_active?: boolean;
  daily_limit?: number;
  monthly_limit?: number;
  total_limit?: number;
}

export interface UpdatePaymentAPIRequest {
  name?: string;
  api_key?: string;
  api_secret?: string;
  provider?: 'stripe' | 'paypal' | 'flutterwave' | 'mpesa' | 'other';
  is_active?: boolean;
  daily_limit?: number;
  monthly_limit?: number;
  total_limit?: number;
}

export const paymentAPIService = {
  list: (companyId: string) =>
    apiGet<ApiResponse<{ payment_apis: PaymentAPI[] }>>(
      endpoints.paymentAPI.list(companyId)
    ),

  detail: (id: string) =>
    apiGet<ApiResponse<{ payment_api: PaymentAPI }>>(
      endpoints.paymentAPI.detail(id)
    ),

  create: (data: CreatePaymentAPIRequest) =>
    apiPost<ApiResponse<{ payment_api: PaymentAPI }>>(
      endpoints.paymentAPI.create,
      data
    ),

  update: (id: string, data: UpdatePaymentAPIRequest) =>
    apiPut<ApiResponse<{ payment_api: PaymentAPI }>>(
      endpoints.paymentAPI.update(id),
      data
    ),

  revoke: (id: string) =>
    apiPost<ApiResponse>(endpoints.paymentAPI.revoke(id)),
};
