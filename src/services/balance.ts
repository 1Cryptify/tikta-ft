import { apiGet, endpoints, ApiResponse } from './api';

export interface PaymentBalance {
  id: string;
  company: string;
  available_balance: string;
  pending_balance: string;
  total_deposits: string;
  total_withdrawals: string;
  currency: string;
  last_updated: string;
}

export const balanceService = {
  list: () =>
    apiGet<ApiResponse<{ balances: PaymentBalance[] }>>(endpoints.balance.list),

  detail: (companyId: string) =>
    apiGet<ApiResponse<{ balance: PaymentBalance }>>(
      endpoints.balance.detail(companyId)
    ),
};
