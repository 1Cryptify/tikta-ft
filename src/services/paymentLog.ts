import { apiGet, endpoints, ApiResponse } from './api';

export interface PaymentLog {
  id: string;
  payment?: string;
  company: string;
  user?: string;
  action: string;
  details?: string;
  created_at: string;
}

export const paymentLogService = {
  list: (companyId: string) =>
    apiGet<ApiResponse<{ payment_logs: PaymentLog[] }>>(
      endpoints.paymentLog.list(companyId)
    ),
};
