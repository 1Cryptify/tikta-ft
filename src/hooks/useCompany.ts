import { useState, useCallback } from 'react';
import { endpoints, apiGet, apiPost, apiPut, apiDelete } from '../services/api';

export interface Company {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  logo?: string;
  is_verified?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface CompanyState {
  companies: Company[];
  currentCompany: Company | null;
  isLoading: boolean;
  error: string | null;
}

export const useCompany = () => {
  const [state, setState] = useState<CompanyState>({
    companies: [],
    currentCompany: null,
    isLoading: false,
    error: null,
  });

  const listCompanies = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiGet(endpoints.company.list);
      setState(prev => ({
        ...prev,
        companies: response.data || response.companies || [],
        isLoading: false,
      }));
      return { success: true, data: response.data || response.companies };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to list companies';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  const getCompanyDetail = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiGet(endpoints.company.detail(id));
      setState(prev => ({
        ...prev,
        currentCompany: response.data || response.company,
        isLoading: false,
      }));
      return { success: true, data: response.data || response.company };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to get company details';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  const createCompany = useCallback(async (data: Partial<Company>) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiPost(endpoints.company.create, data);
      const newCompany = response.data || response.company;
      setState(prev => ({
        ...prev,
        companies: [...prev.companies, newCompany],
        isLoading: false,
      }));
      return { success: true, data: newCompany };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to create company';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  const updateCompany = useCallback(async (id: string, data: Partial<Company>) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiPut(endpoints.company.update(id), data);
      const updatedCompany = response.data || response.company;
      setState(prev => ({
        ...prev,
        companies: prev.companies.map(c => c.id === id ? updatedCompany : c),
        currentCompany: prev.currentCompany?.id === id ? updatedCompany : prev.currentCompany,
        isLoading: false,
      }));
      return { success: true, data: updatedCompany };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to update company';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  const deleteCompany = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await apiDelete(endpoints.company.delete(id));
      setState(prev => ({
        ...prev,
        companies: prev.companies.filter(c => c.id !== id),
        currentCompany: prev.currentCompany?.id === id ? null : prev.currentCompany,
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to delete company';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  const uploadDocuments = useCallback(async (formData: FormData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}${endpoints.company.uploadDocuments}`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Upload failed');
      setState(prev => ({ ...prev, isLoading: false }));
      return { success: true, data };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to upload documents';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  const verifyCompany = useCallback(async (data: any) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiPost(endpoints.company.verify, data);
      setState(prev => ({ ...prev, isLoading: false }));
      return { success: true, data: response };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to verify company';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  const listOwners = useCallback(async (companyId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiGet(endpoints.company.ownerList(companyId));
      setState(prev => ({ ...prev, isLoading: false }));
      return { success: true, data: response.data || response.owners || [] };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to list owners';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  return {
    ...state,
    listCompanies,
    getCompanyDetail,
    createCompany,
    updateCompany,
    deleteCompany,
    uploadDocuments,
    verifyCompany,
    listOwners,
  };
};
