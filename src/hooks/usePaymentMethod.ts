import { useState, useCallback } from 'react';
import { endpoints, apiGet, apiPost, apiPut, apiDelete } from '../services/api';

export interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  is_active?: boolean;
  description?: string;
  icon?: string;
  created_at?: string;
  updated_at?: string;
}

interface PaymentMethodState {
  paymentMethods: PaymentMethod[];
  currentPaymentMethod: PaymentMethod | null;
  isLoading: boolean;
  error: string | null;
}

export const usePaymentMethod = () => {
  const [state, setState] = useState<PaymentMethodState>({
    paymentMethods: [],
    currentPaymentMethod: null,
    isLoading: false,
    error: null,
  });

  const listPaymentMethods = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiGet(endpoints.paymentMethod.list);
      setState(prev => ({
        ...prev,
        paymentMethods: response.data || response.paymentMethods || response.payment_methods || [],
        isLoading: false,
      }));
      return { success: true, data: response.data || response.paymentMethods || response.payment_methods };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to list payment methods';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  const getPaymentMethodDetail = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiGet(endpoints.paymentMethod.detail(id));
      setState(prev => ({
        ...prev,
        currentPaymentMethod: response.data || response.paymentMethod || response.payment_method,
        isLoading: false,
      }));
      return { success: true, data: response.data || response.paymentMethod || response.payment_method };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to get payment method details';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  const createPaymentMethod = useCallback(async (data: Partial<PaymentMethod>) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiPost(endpoints.paymentMethod.create, data);
      const newPaymentMethod = response.data || response.paymentMethod || response.payment_method;
      setState(prev => ({
        ...prev,
        paymentMethods: [...prev.paymentMethods, newPaymentMethod],
        isLoading: false,
      }));
      return { success: true, data: newPaymentMethod };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to create payment method';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  const updatePaymentMethod = useCallback(async (id: string, data: Partial<PaymentMethod>) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiPut(endpoints.paymentMethod.update(id), data);
      const updatedPaymentMethod = response.data || response.paymentMethod || response.payment_method;
      setState(prev => ({
        ...prev,
        paymentMethods: prev.paymentMethods.map(pm => pm.id === id ? updatedPaymentMethod : pm),
        currentPaymentMethod: prev.currentPaymentMethod?.id === id ? updatedPaymentMethod : prev.currentPaymentMethod,
        isLoading: false,
      }));
      return { success: true, data: updatedPaymentMethod };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to update payment method';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  const deletePaymentMethod = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await apiDelete(endpoints.paymentMethod.delete(id));
      setState(prev => ({
        ...prev,
        paymentMethods: prev.paymentMethods.filter(pm => pm.id !== id),
        currentPaymentMethod: prev.currentPaymentMethod?.id === id ? null : prev.currentPaymentMethod,
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to delete payment method';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  return {
    ...state,
    listPaymentMethods,
    getPaymentMethodDetail,
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
  };
};
