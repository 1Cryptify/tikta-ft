import { apiPost, apiGet, apiPut, apiDelete, endpoints, ApiResponse } from './api';

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'bank_account' | 'card' | 'mobile_money' | 'wallet';
  details: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentMethodRequest {
  name: string;
  type: 'bank_account' | 'card' | 'mobile_money' | 'wallet';
  details: any;
  is_active?: boolean;
}

export interface UpdatePaymentMethodRequest {
  name?: string;
  type?: 'bank_account' | 'card' | 'mobile_money' | 'wallet';
  details?: any;
  is_active?: boolean;
}

export const paymentMethodService = {
  list: () =>
    apiGet<ApiResponse<{ payment_methods: PaymentMethod[] }>>(
      endpoints.paymentMethod.list
    ),

  detail: (id: string) =>
    apiGet<ApiResponse<{ payment_method: PaymentMethod }>>(
      endpoints.paymentMethod.detail(id)
    ),

  create: (data: CreatePaymentMethodRequest) =>
    apiPost<ApiResponse<{ payment_method: PaymentMethod }>>(
      endpoints.paymentMethod.create,
      data
    ),

  update: (id: string, data: UpdatePaymentMethodRequest) =>
    apiPut<ApiResponse<{ payment_method: PaymentMethod }>>(
      endpoints.paymentMethod.update(id),
      data
    ),

  delete: (id: string) =>
    apiDelete<ApiResponse>(endpoints.paymentMethod.delete(id)),
};
