import { useState, useCallback } from 'react';
import { endpoints, apiGet, apiPost, apiPut } from '../services/api';

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  exchange_rate?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface CurrencyState {
  currencies: Currency[];
  currentCurrency: Currency | null;
  isLoading: boolean;
  error: string | null;
}

export const useCurrency = () => {
  const [state, setState] = useState<CurrencyState>({
    currencies: [],
    currentCurrency: null,
    isLoading: false,
    error: null,
  });

  const listCurrencies = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiGet(endpoints.currency.list);
      setState(prev => ({
        ...prev,
        currencies: response.data || response.currencies || [],
        isLoading: false,
      }));
      return { success: true, data: response.data || response.currencies };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to list currencies';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  const getCurrencyDetail = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiGet(endpoints.currency.detail(id));
      setState(prev => ({
        ...prev,
        currentCurrency: response.data || response.currency,
        isLoading: false,
      }));
      return { success: true, data: response.data || response.currency };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to get currency details';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  const createCurrency = useCallback(async (data: Partial<Currency>) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiPost(endpoints.currency.create, data);
      const newCurrency = response.data || response.currency;
      setState(prev => ({
        ...prev,
        currencies: [...prev.currencies, newCurrency],
        isLoading: false,
      }));
      return { success: true, data: newCurrency };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to create currency';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  const updateCurrency = useCallback(async (id: string, data: Partial<Currency>) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiPut(endpoints.currency.update(id), data);
      const updatedCurrency = response.data || response.currency;
      setState(prev => ({
        ...prev,
        currencies: prev.currencies.map(c => c.id === id ? updatedCurrency : c),
        currentCurrency: prev.currentCurrency?.id === id ? updatedCurrency : prev.currentCurrency,
        isLoading: false,
      }));
      return { success: true, data: updatedCurrency };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to update currency';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  return {
    ...state,
    listCurrencies,
    getCurrencyDetail,
    createCurrency,
    updateCurrency,
  };
};
