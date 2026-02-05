/**
 * Payment Service
 * Handles all payment and transaction related API calls
 */

import { apiGet, apiPost, endpoints, ApiResponse } from './api';

export interface Payment {
  id: string;
  company: string;
  amount: string;
  currency: string;
  payment_type: 'deposit' | 'withdrawal' | 'refund';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  description: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentTransaction {
  id: string;
  payment: string;
  amount: string;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  gateway_transaction_id: string;
  gateway_response: any;
  created_at: string;
  updated_at: string;
}

export interface PaymentBalance {
  id: string;
  company: string;
  available_balance: string;
  pending_balance: string;
  total_balance: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface InitiatePaymentPayload {
  company_id: string;
  amount: string | number;
  currency: string;
  payment_type?: 'deposit' | 'withdrawal' | 'refund';
  description?: string;
  email: string;
  phone: string;
  channel?: string;
  client_ip?: string;
}

export interface VerifyPaymentPayload {
  reference: string;
}

/**
 * List payments for a company
 */
export async function listPayments(companyId: string): Promise<ApiResponse<Payment[]>> {
  try {
    return await apiGet(endpoints.payments.list(companyId));
  } catch (error) {
    console.error('Failed to fetch payments:', error);
    throw error;
  }
}

/**
 * Get payment details
 */
export async function getPaymentDetail(paymentId: string): Promise<ApiResponse<Payment>> {
  try {
    return await apiGet(endpoints.payments.detail(paymentId));
  } catch (error) {
    console.error('Failed to fetch payment details:', error);
    throw error;
  }
}

/**
 * Initiate a new payment
 */
export async function initiatePayment(
  payload: InitiatePaymentPayload
): Promise<ApiResponse<{
  payment_id: string;
  transaction_id: string;
  reference: string;
  gateway_reference?: string;
  authorization_url?: string;
  channel_processed?: boolean;
  channel_error?: string;
}>> {
  try {
    return await apiPost(endpoints.payments.initiate, {
      ...payload,
      amount: String(payload.amount),
    });
  } catch (error) {
    console.error('Failed to initiate payment:', error);
    throw error;
  }
}

/**
 * Verify payment status
 */
export async function verifyPayment(
  payload: VerifyPaymentPayload
): Promise<ApiResponse<{
  reference: string;
  status: string;
  amount: string;
  currency: string;
}>> {
  try {
    return await apiPost(endpoints.payments.verify, payload);
  } catch (error) {
    console.error('Failed to verify payment:', error);
    throw error;
  }
}

/**
 * Cancel payment
 */
export async function cancelPayment(paymentId: string): Promise<ApiResponse> {
  try {
    return await apiPost(endpoints.payments.cancel(paymentId));
  } catch (error) {
    console.error('Failed to cancel payment:', error);
    throw error;
  }
}

/**
 * List transactions
 */
export async function listTransactions(): Promise<ApiResponse<PaymentTransaction[]>> {
  try {
    return await apiGet(endpoints.transactions.list);
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    throw error;
  }
}

/**
 * Get transaction details
 */
export async function getTransactionDetail(
  transactionId: string
): Promise<ApiResponse<PaymentTransaction>> {
  try {
    return await apiGet(endpoints.transactions.detail(transactionId));
  } catch (error) {
    console.error('Failed to fetch transaction details:', error);
    throw error;
  }
}

/**
 * Get company transactions
 */
export async function getCompanyTransactions(
  companyId: string
): Promise<ApiResponse<PaymentTransaction[]>> {
  try {
    return await apiGet(endpoints.transactions.company(companyId));
  } catch (error) {
    console.error('Failed to fetch company transactions:', error);
    throw error;
  }
}

/**
 * Get balance for a company
 */
export async function getBalance(companyId: string): Promise<ApiResponse<PaymentBalance>> {
  try {
    return await apiGet(endpoints.balance.detail(companyId));
  } catch (error) {
    console.error('Failed to fetch balance:', error);
    throw error;
  }
}

/**
 * Type guards
 */
export function isPayment(data: any): data is Payment {
  return (
    data &&
    typeof data === 'object' &&
    'id' in data &&
    'amount' in data &&
    'status' in data
  );
}

export function isPaymentTransaction(data: any): data is PaymentTransaction {
  return (
    data &&
    typeof data === 'object' &&
    'id' in data &&
    'payment' in data &&
    'status' in data
  );
}

export function isPaymentBalance(data: any): data is PaymentBalance {
  return (
    data &&
    typeof data === 'object' &&
    'id' in data &&
    'available_balance' in data &&
    'company' in data
  );
}
