/**
 * Withdrawal Service
 * Handles all withdrawal and withdrawal account related API calls
 */

import { apiGet, apiPost, endpoints, ApiResponse } from './api';

export interface WithdrawalAccount {
  id: string;
  company: string;
  account_holder_name: string;
  account_number: string;
  bank_name: string;
  account_type: 'checking' | 'savings' | 'mobile_money' | 'wallet';
  currency: string;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Withdrawal {
  id: string;
  company: string;
  account: string;
  amount: string;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  reference: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface CreateWithdrawalAccountPayload {
  company_id: string;
  account_holder_name: string;
  account_number: string;
  bank_name: string;
  account_type: 'checking' | 'savings' | 'mobile_money' | 'wallet';
  currency: string;
  is_default?: boolean;
}

export interface UpdateWithdrawalAccountPayload {
  account_id: string;
  account_holder_name?: string;
  account_number?: string;
  bank_name?: string;
  account_type?: 'checking' | 'savings' | 'mobile_money' | 'wallet';
  currency?: string;
  is_default?: boolean;
}

export interface InitiateWithdrawalPayload {
  company_id: string;
  account_id: string;
  amount: string | number;
  description?: string;
}

/**
 * List withdrawal accounts for a company
 */
export async function listWithdrawalAccounts(
  companyId: string
): Promise<ApiResponse<WithdrawalAccount[]>> {
  try {
    return await apiGet(endpoints.withdrawals.accounts(companyId));
  } catch (error) {
    console.error('Failed to fetch withdrawal accounts:', error);
    throw error;
  }
}

/**
 * Create withdrawal account
 */
export async function createWithdrawalAccount(
  payload: CreateWithdrawalAccountPayload
): Promise<ApiResponse<WithdrawalAccount>> {
  try {
    return await apiPost(endpoints.withdrawals.createAccount, payload);
  } catch (error) {
    console.error('Failed to create withdrawal account:', error);
    throw error;
  }
}

/**
 * Update withdrawal account
 */
export async function updateWithdrawalAccount(
  payload: UpdateWithdrawalAccountPayload
): Promise<ApiResponse<WithdrawalAccount>> {
  try {
    const { account_id, ...data } = payload;
    return await apiPost(endpoints.withdrawals.updateAccount(account_id), data);
  } catch (error) {
    console.error('Failed to update withdrawal account:', error);
    throw error;
  }
}

/**
 * Delete withdrawal account
 */
export async function deleteWithdrawalAccount(accountId: string): Promise<ApiResponse> {
  try {
    return await apiPost(endpoints.withdrawals.deleteAccount(accountId));
  } catch (error) {
    console.error('Failed to delete withdrawal account:', error);
    throw error;
  }
}

/**
 * Initiate withdrawal
 */
export async function initiateWithdrawal(
  payload: InitiateWithdrawalPayload
): Promise<ApiResponse<Withdrawal>> {
  try {
    return await apiPost(endpoints.withdrawals.initiate, {
      ...payload,
      amount: String(payload.amount),
    });
  } catch (error) {
    console.error('Failed to initiate withdrawal:', error);
    throw error;
  }
}

/**
 * Get withdrawal history for company
 */
export async function getWithdrawalHistory(
  companyId: string
): Promise<ApiResponse<Withdrawal[]>> {
  try {
    return await apiGet(endpoints.withdrawals.history(companyId));
  } catch (error) {
    console.error('Failed to fetch withdrawal history:', error);
    throw error;
  }
}

/**
 * Type guards
 */
export function isWithdrawalAccount(data: any): data is WithdrawalAccount {
  return (
    data &&
    typeof data === 'object' &&
    'id' in data &&
    'account_number' in data &&
    'bank_name' in data
  );
}

export function isWithdrawal(data: any): data is Withdrawal {
  return (
    data &&
    typeof data === 'object' &&
    'id' in data &&
    'amount' in data &&
    'status' in data
  );
}

/**
 * Get account type label
 */
export function getAccountTypeLabel(type: WithdrawalAccount['account_type']): string {
  const labels: Record<WithdrawalAccount['account_type'], string> = {
    checking: 'Checking Account',
    savings: 'Savings Account',
    mobile_money: 'Mobile Money',
    wallet: 'Wallet',
  };
  return labels[type] || type;
}

/**
 * Get withdrawal status color
 */
export function getWithdrawalStatusColor(status: Withdrawal['status']): string {
  const colors: Record<Withdrawal['status'], string> = {
    pending: '#fef3c7',
    processing: '#bfdbfe',
    completed: '#d1f2e8',
    failed: '#fee2e2',
    cancelled: '#e5e7eb',
  };
  return colors[status] || '#f3f4f6';
}

/**
 * Get withdrawal status text color
 */
export function getWithdrawalStatusTextColor(status: Withdrawal['status']): string {
  const colors: Record<Withdrawal['status'], string> = {
    pending: '#b45309',
    processing: '#1e40af',
    completed: '#047857',
    failed: '#dc2626',
    cancelled: '#374151',
  };
  return colors[status] || '#6b7280';
}
