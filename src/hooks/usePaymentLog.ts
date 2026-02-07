import { useState, useCallback } from 'react';
import { endpoints, apiGet } from '../services/api';

export interface PaymentLog {
  id: string;
  payment_id?: string;
  action: string;
  status: string;
  details?: string;
  timestamp?: string;
  company_id?: string;
}

interface PaymentLogState {
  paymentLogs: PaymentLog[];
  isLoading: boolean;
  error: string | null;
}

export const usePaymentLog = () => {
  const [state, setState] = useState<PaymentLogState>({
    paymentLogs: [],
    isLoading: false,
    error: null,
  });

  const listPaymentLogs = useCallback(async (companyId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiGet(endpoints.paymentLog.list(companyId));
      setState(prev => ({
        ...prev,
        paymentLogs: response.data || response.paymentLogs || response.payment_logs || [],
        isLoading: false,
      }));
      return { success: true, data: response.data || response.paymentLogs || response.payment_logs };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to list payment logs';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  return {
    ...state,
    listPaymentLogs,
  };
};
