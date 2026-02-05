/**
 * Custom Hook: usePaymentAPIs
 * Manages payment API configuration and logs
 */

import { useState, useCallback } from 'react';
import {
  PaymentAPI,
  PaymentAPILog,
  CreatePaymentAPIPayload,
  UpdatePaymentAPIPayload,
  listPaymentAPIs,
  getPaymentAPIDetail,
  createPaymentAPI,
  updatePaymentAPI,
  deletePaymentAPI,
  getPaymentAPILogs,
} from '../services/paymentAPIs';
import { getErrorMessage } from '../services/api';

export interface UsePaymentAPIsState {
  apis: PaymentAPI[];
  selectedAPI: PaymentAPI | null;
  logs: PaymentAPILog[];
  loading: boolean;
  error: string | null;
}

export interface UsePaymentAPIsActions {
  fetchAPIs: () => Promise<void>;
  fetchAPIDetail: (apiId: string) => Promise<void>;
  fetchAPILogs: (apiId: string) => Promise<void>;
  createNewAPI: (payload: CreatePaymentAPIPayload) => Promise<PaymentAPI>;
  updateAPIData: (payload: UpdatePaymentAPIPayload) => Promise<PaymentAPI>;
  deleteAPIData: (apiId: string) => Promise<void>;
  clearError: () => void;
  clearSelection: () => void;
}

export function usePaymentAPIs(): UsePaymentAPIsState & UsePaymentAPIsActions {
  const [state, setState] = useState<UsePaymentAPIsState>({
    apis: [],
    selectedAPI: null,
    logs: [],
    loading: false,
    error: null,
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const fetchAPIs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listPaymentAPIs();
      const apis = response.apis || response.data || [];
      setState(prev => ({
        ...prev,
        apis: Array.isArray(apis) ? apis : [],
      }));
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAPIDetail = useCallback(async (apiId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPaymentAPIDetail(apiId);
      const api = response.api || response.data;
      if (api) {
        setState(prev => ({ ...prev, selectedAPI: api }));
      }
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAPILogs = useCallback(async (apiId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPaymentAPILogs(apiId);
      const logs = response.logs || response.data || [];
      setState(prev => ({
        ...prev,
        logs: Array.isArray(logs) ? logs : [],
      }));
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  const createNewAPI = useCallback(async (payload: CreatePaymentAPIPayload) => {
    try {
      setLoading(true);
      setError(null);
      const response = await createPaymentAPI(payload);
      const api = response.api || response.data;
      if (api) {
        setState(prev => ({
          ...prev,
          apis: [...prev.apis, api],
        }));
        return api;
      }
      throw new Error('Failed to create payment API');
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      setError(errorMsg);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAPIData = useCallback(async (payload: UpdatePaymentAPIPayload) => {
    try {
      setLoading(true);
      setError(null);
      const response = await updatePaymentAPI(payload);
      const api = response.api || response.data;
      if (api) {
        setState(prev => ({
          ...prev,
          apis: prev.apis.map(a => (a.id === api.id ? api : a)),
          selectedAPI: prev.selectedAPI?.id === api.id ? api : prev.selectedAPI,
        }));
        return api;
      }
      throw new Error('Failed to update payment API');
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      setError(errorMsg);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAPIData = useCallback(async (apiId: string) => {
    try {
      setLoading(true);
      setError(null);
      await deletePaymentAPI(apiId);
      setState(prev => ({
        ...prev,
        apis: prev.apis.filter(a => a.id !== apiId),
        selectedAPI: prev.selectedAPI?.id === apiId ? null : prev.selectedAPI,
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

  const clearSelection = useCallback(() => {
    setState(prev => ({ ...prev, selectedAPI: null }));
  }, []);

  return {
    ...state,
    fetchAPIs,
    fetchAPIDetail,
    fetchAPILogs,
    createNewAPI,
    updateAPIData,
    deleteAPIData,
    clearError,
    clearSelection,
  };
}
