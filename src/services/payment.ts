import { apiPost, apiGet, apiPut, apiDelete, endpoints, ApiResponse } from './api';

export interface Payment {
  id: string;
  company: string;
  amount: string;
  currency: string;
  payment_type: 'deposit' | 'withdrawal';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  company_name?: string;
  currency_code?: string;
  transactions?: PaymentTransaction[];
}

export interface PaymentTransaction {
  id: string;
  payment: string;
  amount: string;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  gateway_transaction_id?: string;
  gateway_response?: any;
  created_at: string;
  updated_at: string;
}

export interface InitiatePaymentRequest {
  amount: number;
  currency: string;
  payment_type: 'deposit' | 'withdrawal';
  description?: string;
  email: string;
  phone: string;
  channel?: string;
  client_ip?: string;
  company_id?: string;
}

export interface CompletePaymentRequest {
  reference?: string;
}

export interface ProcessPaymentRequest {
  reference?: string;
  channel?: string;
}

export interface CreateTransactionRequest {
  payment_id: string;
  amount: number;
  currency_id: string;
}

export interface UpdateTransactionRequest {
  status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  gateway_transaction_id?: string;
  gateway_response?: any;
}

export const paymentService = {
  initiate: (data: InitiatePaymentRequest) =>
    apiPost<ApiResponse<Payment>>(endpoints.payment.initiate, data),

  list: () =>
    apiGet<ApiResponse<{ payments: Payment[] }>>(endpoints.payment.list),

  detail: (id: string) =>
    apiGet<ApiResponse<{ payment: Payment }>>(endpoints.payment.detail(id)),

  complete: (id: string, data?: CompletePaymentRequest) =>
    apiPost<ApiResponse<{ payment: Payment }>>(
      endpoints.payment.complete(id),
      data
    ),

  cancel: (id: string) =>
    apiPost<ApiResponse>(endpoints.payment.cancel(id)),

  processPayment: (id: string, data?: ProcessPaymentRequest) =>
    apiPost<ApiResponse<{ payment: Payment }>>(
      endpoints.payment.processPayment(id),
      data
    ),

  createTransaction: (data: CreateTransactionRequest) =>
    apiPost<ApiResponse<{ transaction: PaymentTransaction }>>(
      endpoints.transaction.create,
      data
    ),

  listTransactions: () =>
    apiGet<ApiResponse<{ transactions: PaymentTransaction[] }>>(
      endpoints.transaction.list
    ),

  getTransactionDetail: (id: string) =>
    apiGet<ApiResponse<{ transaction: PaymentTransaction }>>(
      endpoints.transaction.detail(id)
    ),

  updateTransaction: (id: string, data: UpdateTransactionRequest) =>
    apiPut<ApiResponse<{ transaction: PaymentTransaction }>>(
      endpoints.transaction.update(id),
      data
    ),

  deleteTransaction: (id: string) =>
    apiDelete<ApiResponse>(endpoints.transaction.delete(id)),
};
