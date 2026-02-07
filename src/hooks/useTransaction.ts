import { useState, useCallback } from 'react';
import { endpoints, apiGet, apiPost, apiPut, apiDelete } from '../services/api';

export interface Transaction {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  status: 'pending' | 'completed' | 'failed';
  description?: string;
  reference?: string;
  company_id?: string;
  created_at?: string;
  updated_at?: string;
}

interface TransactionState {
  transactions: Transaction[];
  currentTransaction: Transaction | null;
  isLoading: boolean;
  error: string | null;
}

export const useTransaction = () => {
  const [state, setState] = useState<TransactionState>({
    transactions: [],
    currentTransaction: null,
    isLoading: false,
    error: null,
  });

  const listTransactions = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiGet(endpoints.transaction.list);
      setState(prev => ({
        ...prev,
        transactions: response.data || response.transactions || [],
        isLoading: false,
      }));
      return { success: true, data: response.data || response.transactions };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to list transactions';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  const getTransactionDetail = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiGet(endpoints.transaction.detail(id));
      setState(prev => ({
        ...prev,
        currentTransaction: response.data || response.transaction,
        isLoading: false,
      }));
      return { success: true, data: response.data || response.transaction };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to get transaction details';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  const createTransaction = useCallback(async (data: Partial<Transaction>) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiPost(endpoints.transaction.create, data);
      const newTransaction = response.data || response.transaction;
      setState(prev => ({
        ...prev,
        transactions: [...prev.transactions, newTransaction],
        isLoading: false,
      }));
      return { success: true, data: newTransaction };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to create transaction';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  const updateTransaction = useCallback(async (id: string, data: Partial<Transaction>) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiPut(endpoints.transaction.update(id), data);
      const updatedTransaction = response.data || response.transaction;
      setState(prev => ({
        ...prev,
        transactions: prev.transactions.map(t => t.id === id ? updatedTransaction : t),
        currentTransaction: prev.currentTransaction?.id === id ? updatedTransaction : prev.currentTransaction,
        isLoading: false,
      }));
      return { success: true, data: updatedTransaction };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to update transaction';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await apiDelete(endpoints.transaction.delete(id));
      setState(prev => ({
        ...prev,
        transactions: prev.transactions.filter(t => t.id !== id),
        currentTransaction: prev.currentTransaction?.id === id ? null : prev.currentTransaction,
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to delete transaction';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  return {
    ...state,
    listTransactions,
    getTransactionDetail,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
};
