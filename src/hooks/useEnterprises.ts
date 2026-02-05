/**
 * Custom Hook: useEnterprises
 * Manages enterprise/company-related state and operations
 */

import { useState, useCallback } from 'react';
import {
  CompanyInfo,
  UploadDocumentsPayload,
  getCompanyInfo,
  uploadCompanyDocuments,
  deleteCompany,
} from '../services/enterprises';
import { getErrorMessage } from '../services/api';

export interface UseEnterprisesState {
  company: CompanyInfo | null;
  loading: boolean;
  error: string | null;
  uploading: boolean;
}

export interface UseEnterprisesActions {
  fetchCompanyInfo: (companyId: string) => Promise<void>;
  uploadDocuments: (payload: UploadDocumentsPayload) => Promise<void>;
  deleteCompanyRequest: (companyId: string) => Promise<void>;
  clearError: () => void;
}

export function useEnterprises(): UseEnterprisesState & UseEnterprisesActions {
  const [state, setState] = useState<UseEnterprisesState>({
    company: null,
    loading: false,
    error: null,
    uploading: false,
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setUploading = useCallback((uploading: boolean) => {
    setState(prev => ({ ...prev, uploading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const fetchCompanyInfo = useCallback(async (companyId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCompanyInfo(companyId);
      const company = response.company || response.data;
      if (company) {
        setState(prev => ({ ...prev, company }));
      }
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadDocuments = useCallback(async (payload: UploadDocumentsPayload) => {
    try {
      setUploading(true);
      setError(null);
      const response = await uploadCompanyDocuments(payload);
      const company = response.company || response.data;
      if (company) {
        setState(prev => ({ ...prev, company }));
      }
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      setError(errorMsg);
      throw error;
    } finally {
      setUploading(false);
    }
  }, []);

  const deleteCompanyRequest = useCallback(async (companyId: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteCompany(companyId);
      setState(prev => ({ ...prev, company: null }));
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
    fetchCompanyInfo,
    uploadDocuments,
    deleteCompanyRequest,
    clearError,
  };
}
