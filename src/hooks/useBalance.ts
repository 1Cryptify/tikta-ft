import { useState, useCallback } from 'react';
import { endpoints, apiGet } from '../services/api';

export interface Balance {
  id: string;
  company_id: string;
  amount: number;
  currency: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface BalanceState {
  balances: Balance[];
  currentBalance: Balance | null;
  isLoading: boolean;
  error: string | null;
}

export const useBalance = () => {
  const [state, setState] = useState<BalanceState>({
    balances: [],
    currentBalance: null,
    isLoading: false,
    error: null,
  });

  const listBalances = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiGet(endpoints.balance.list);
      setState(prev => ({
        ...prev,
        balances: response.data || response.balances || [],
        isLoading: false,
      }));
      return { success: true, data: response.data || response.balances };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to list balances';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  const getBalanceDetail = useCallback(async (companyId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiGet(endpoints.balance.detail(companyId));
      setState(prev => ({
        ...prev,
        currentBalance: response.data || response.balance,
        isLoading: false,
      }));
      return { success: true, data: response.data || response.balance };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to get balance details';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  return {
    ...state,
    listBalances,
    getBalanceDetail,
  };
};
