/**
 * Custom Hook: useCurrencies
 * Manages currency-related state and operations
 */

import { useState, useCallback, useEffect } from 'react';
import {
  Currency,
  listCurrencies,
  getCurrencyDetail,
} from '../services/currencies';
import { getErrorMessage } from '../services/api';

export interface UseCurrenciesState {
  currencies: Currency[];
  selectedCurrency: Currency | null;
  loading: boolean;
  error: string | null;
}

export interface UseCurrenciesActions {
  fetchCurrencies: () => Promise<void>;
  fetchCurrencyDetail: (currencyId: string) => Promise<void>;
  clearError: () => void;
  clearSelection: () => void;
}

export function useCurrencies(autoFetch: boolean = true): UseCurrenciesState & UseCurrenciesActions {
  const [state, setState] = useState<UseCurrenciesState>({
    currencies: [],
    selectedCurrency: null,
    loading: false,
    error: null,
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const fetchCurrencies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listCurrencies();
      const currencies = response.currencies || response.data || [];
      setState(prev => ({
        ...prev,
        currencies: Array.isArray(currencies) ? currencies : [],
      }));
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCurrencyDetail = useCallback(async (currencyId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCurrencyDetail(currencyId);
      const currency = response.currency || response.data;
      if (currency) {
        setState(prev => ({ ...prev, selectedCurrency: currency }));
      }
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearSelection = useCallback(() => {
    setState(prev => ({ ...prev, selectedCurrency: null }));
  }, []);

  // Auto fetch currencies on mount if autoFetch is true
  useEffect(() => {
    if (autoFetch) {
      fetchCurrencies();
    }
  }, [autoFetch, fetchCurrencies]);

  return {
    ...state,
    fetchCurrencies,
    fetchCurrencyDetail,
    clearError,
    clearSelection,
  };
}
