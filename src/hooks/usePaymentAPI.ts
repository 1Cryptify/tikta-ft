import { useState, useCallback } from 'react';
import { endpoints, apiGet, apiPost, apiPut } from '../services/api';

export interface PaymentAPI {
  id: string;
  name: string;
  api_key?: string;
  is_active?: boolean;
  company_id?: string;
  created_at?: string;
  updated_at?: string;
}

interface PaymentAPIState {
  paymentAPIs: PaymentAPI[];
  currentPaymentAPI: PaymentAPI | null;
  isLoading: boolean;
  error: string | null;
}

export const usePaymentAPI = () => {
  const [state, setState] = useState<PaymentAPIState>({
    paymentAPIs: [],
    currentPaymentAPI: null,
    isLoading: false,
    error: null,
  });

  const listPaymentAPIs = useCallback(async (companyId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiGet(endpoints.paymentAPI.list(companyId));
      setState(prev => ({
        ...prev,
        paymentAPIs: response.data || response.paymentAPIs || response.payment_apis || [],
        isLoading: false,
      }));
      return { success: true, data: response.data || response.paymentAPIs || response.payment_apis };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to list payment APIs';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  const getPaymentAPIDetail = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiGet(endpoints.paymentAPI.detail(id));
      setState(prev => ({
        ...prev,
        currentPaymentAPI: response.data || response.paymentAPI || response.payment_api,
        isLoading: false,
      }));
      return { success: true, data: response.data || response.paymentAPI || response.payment_api };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to get payment API details';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  const createPaymentAPI = useCallback(async (data: Partial<PaymentAPI>) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiPost(endpoints.paymentAPI.create, data);
      const newPaymentAPI = response.data || response.paymentAPI || response.payment_api;
      setState(prev => ({
        ...prev,
        paymentAPIs: [...prev.paymentAPIs, newPaymentAPI],
        isLoading: false,
      }));
      return { success: true, data: newPaymentAPI };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to create payment API';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  const updatePaymentAPI = useCallback(async (id: string, data: Partial<PaymentAPI>) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiPut(endpoints.paymentAPI.update(id), data);
      const updatedPaymentAPI = response.data || response.paymentAPI || response.payment_api;
      setState(prev => ({
        ...prev,
        paymentAPIs: prev.paymentAPIs.map(pa => pa.id === id ? updatedPaymentAPI : pa),
        currentPaymentAPI: prev.currentPaymentAPI?.id === id ? updatedPaymentAPI : prev.currentPaymentAPI,
        isLoading: false,
      }));
      return { success: true, data: updatedPaymentAPI };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to update payment API';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  const revokePaymentAPI = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiPost(endpoints.paymentAPI.revoke(id), {});
      setState(prev => ({
        ...prev,
        paymentAPIs: prev.paymentAPIs.filter(pa => pa.id !== id),
        currentPaymentAPI: prev.currentPaymentAPI?.id === id ? null : prev.currentPaymentAPI,
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to revoke payment API';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  return {
    ...state,
    listPaymentAPIs,
    getPaymentAPIDetail,
    createPaymentAPI,
    updatePaymentAPI,
    revokePaymentAPI,
  };
};
