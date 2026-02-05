/**
 * Custom Hook: usePayments
 * Manages payment-related state and operations
 */

import { useState, useCallback, useEffect } from 'react';
import {
  Payment,
  PaymentTransaction,
  PaymentBalance,
  InitiatePaymentPayload,
  listPayments,
  getPaymentDetail,
  initiatePayment,
  verifyPayment,
  cancelPayment,
  listTransactions,
  getCompanyTransactions,
  getBalance,
} from '../services/payments';
import { getErrorMessage } from '../services/api';

export interface UsePaymentsState {
  payments: Payment[];
  transactions: PaymentTransaction[];
  balance: PaymentBalance | null;
  loading: boolean;
  error: string | null;
}

export interface UsePaymentsActions {
  fetchPayments: (companyId: string) => Promise<void>;
  fetchTransactions: (companyId: string) => Promise<void>;
  fetchBalance: (companyId: string) => Promise<void>;
  createPayment: (payload: InitiatePaymentPayload) => Promise<any>;
  verifyPaymentStatus: (reference: string) => Promise<any>;
  cancelPaymentRequest: (paymentId: string) => Promise<void>;
  clearError: () => void;
}

export function usePayments(): UsePaymentsState & UsePaymentsActions {
  const [state, setState] = useState<UsePaymentsState>({
    payments: [],
    transactions: [],
    balance: null,
    loading: false,
    error: null,
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const fetchPayments = useCallback(async (companyId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await listPayments(companyId);
      const payments = response.payments || response.data || [];
      setState(prev => ({ ...prev, payments: Array.isArray(payments) ? payments : [] }));
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTransactions = useCallback(async (companyId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCompanyTransactions(companyId);
      const transactions = response.transactions || response.data || [];
      setState(prev => ({
        ...prev,
        transactions: Array.isArray(transactions) ? transactions : [],
      }));
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBalance = useCallback(async (companyId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getBalance(companyId);
      const balance = response.balance || response.data;
      setState(prev => ({ ...prev, balance }));
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  const createPayment = useCallback(async (payload: InitiatePaymentPayload) => {
    try {
      setLoading(true);
      setError(null);
      const response = await initiatePayment(payload);
      return response;
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      setError(errorMsg);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyPaymentStatus = useCallback(async (reference: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await verifyPayment({ reference });
      return response;
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      setError(errorMsg);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelPaymentRequest = useCallback(async (paymentId: string) => {
    try {
      setLoading(true);
      setError(null);
      await cancelPayment(paymentId);
      // Refresh payments list
      setState(prev => ({
        ...prev,
        payments: prev.payments.filter(p => p.id !== paymentId),
      }));
    } catch (error) {
      setError(getErrorMessage(error));
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    ...state,
    fetchPayments,
    fetchTransactions,
    fetchBalance,
    createPayment,
    verifyPaymentStatus,
    cancelPaymentRequest,
    clearError,
  };
}
