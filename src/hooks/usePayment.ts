import { useState, useCallback } from 'react';
import { endpoints, apiGet, apiPost, apiPut, apiDelete } from '../services/api';

export interface Payment {
  id: string;
  amount: number;
  currency?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description?: string;
  payment_method?: string;
  company_id?: string;
  created_at?: string;
  updated_at?: string;
}

interface PaymentState {
  payments: Payment[];
  currentPayment: Payment | null;
  isLoading: boolean;
  error: string | null;
}

export const usePayment = () => {
  const [state, setState] = useState<PaymentState>({
    payments: [],
    currentPayment: null,
    isLoading: false,
    error: null,
  });

  const listPayments = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiGet(endpoints.payment.list);
      setState(prev => ({
        ...prev,
        payments: response.data || response.payments || [],
        isLoading: false,
      }));
      return { success: true, data: response.data || response.payments };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to list payments';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  const getPaymentDetail = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiGet(endpoints.payment.detail(id));
      setState(prev => ({
        ...prev,
        currentPayment: response.data || response.payment,
        isLoading: false,
      }));
      return { success: true, data: response.data || response.payment };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to get payment details';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  const initiatePayment = useCallback(async (data: Partial<Payment>) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiPost(endpoints.payment.initiate, data);
      const newPayment = response.data || response.payment;
      setState(prev => ({
        ...prev,
        payments: [...prev.payments, newPayment],
        isLoading: false,
      }));
      return { success: true, data: newPayment };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to initiate payment';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  const completePayment = useCallback(async (id: string, data?: any) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiPost(endpoints.payment.complete(id), data);
      const updatedPayment = response.data || response.payment;
      setState(prev => ({
        ...prev,
        payments: prev.payments.map(p => p.id === id ? updatedPayment : p),
        currentPayment: prev.currentPayment?.id === id ? updatedPayment : prev.currentPayment,
        isLoading: false,
      }));
      return { success: true, data: updatedPayment };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to complete payment';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  const cancelPayment = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiDelete(endpoints.payment.cancel(id));
      const updatedPayment = response.data || response.payment;
      setState(prev => ({
        ...prev,
        payments: prev.payments.map(p => p.id === id ? updatedPayment : p),
        currentPayment: prev.currentPayment?.id === id ? updatedPayment : prev.currentPayment,
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to cancel payment';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  const processPayment = useCallback(async (id: string, data?: any) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiPost(endpoints.payment.processPayment(id), data);
      const processedPayment = response.data || response.payment;
      setState(prev => ({
        ...prev,
        payments: prev.payments.map(p => p.id === id ? processedPayment : p),
        isLoading: false,
      }));
      return { success: true, data: processedPayment };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to process payment';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  return {
    ...state,
    listPayments,
    getPaymentDetail,
    initiatePayment,
    completePayment,
    cancelPayment,
    processPayment,
  };
};
