import { apiPost, apiGet, apiPut, apiDelete, endpoints, ApiResponse } from './api';

export interface WithdrawalAccount {
  id: string;
  company: string;
  account_type: 'mobile_money' | 'bank_account' | 'wallet' | 'other';
  provider: string;
  account_number: string;
  account_name?: string;
  details?: any;
  is_active: boolean;
  is_verified: boolean;
  verification_status: 'pending' | 'verified' | 'rejected';
  verification_notes?: string;
  created_at: string;
  updated_at: string;
  verified_at?: string;
}

export interface CreateWithdrawalAccountRequest {
  account_type: 'mobile_money' | 'bank_account' | 'wallet' | 'other';
  provider: string;
  account_number: string;
  account_name?: string;
  details?: any;
  is_active?: boolean;
}

export interface UpdateWithdrawalAccountRequest {
  account_type?: 'mobile_money' | 'bank_account' | 'wallet' | 'other';
  provider?: string;
  account_number?: string;
  account_name?: string;
  details?: any;
  is_active?: boolean;
  verification_status?: 'pending' | 'verified' | 'rejected';
  verification_notes?: string;
}

export const withdrawalAccountService = {
  list: (companyId: string) =>
    apiGet<ApiResponse<{ withdrawal_accounts: WithdrawalAccount[] }>>(
      endpoints.withdrawalAccount.list(companyId)
    ),

  detail: (id: string) =>
    apiGet<ApiResponse<{ withdrawal_account: WithdrawalAccount }>>(
      endpoints.withdrawalAccount.detail(id)
    ),

  create: (data: CreateWithdrawalAccountRequest) =>
    apiPost<ApiResponse<{ withdrawal_account: WithdrawalAccount }>>(
      endpoints.withdrawalAccount.create,
      data
    ),

  update: (id: string, data: UpdateWithdrawalAccountRequest) =>
    apiPut<ApiResponse<{ withdrawal_account: WithdrawalAccount }>>(
      endpoints.withdrawalAccount.update(id),
      data
    ),

  delete: (id: string) =>
    apiDelete<ApiResponse>(endpoints.withdrawalAccount.delete(id)),
};
