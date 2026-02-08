import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { API_USERS_BASE_URL} from '../services/api';

const axiosInstance = axios.create({
    baseURL: API_USERS_BASE_URL,
    ...AXIOS_CONFIG,
});

export interface Business {
    id: string;
    name: string;
    nui?: string;
    commerce_register?: string;
    website?: string;
    logo?: string;
    is_active: boolean;
    is_blocked: boolean;
    is_verified: boolean;
    nui_document?: string;
    commerce_register_document?: string;
    website_document?: string;
    creation_document?: string;
    created_at?: string;
    updated_at?: string;
}

interface BusinessState {
    businesses: Business[];
    isLoading: boolean;
    error: string | null;
}

interface UseBusinessReturn extends BusinessState {
    getBusinesses: () => Promise<void>;
    getBusinessById: (id: string) => Promise<Business | null>;
    createBusiness: (data: Partial<Business>) => Promise<Business | null>;
    updateBusiness: (id: string, data: Partial<Business>) => Promise<Business | null>;
    deleteBusiness: (id: string) => Promise<boolean>;
    blockBusiness: (id: string, reason?: string) => Promise<boolean>;
    unblockBusiness: (id: string) => Promise<boolean>;
    markActiveCompany: (id: string) => Promise<boolean>;
    uploadDocuments: (id: string, documents: FormData) => Promise<boolean>;
    uploadLogo: (id: string, file: File) => Promise<boolean>;
}

export const useBusiness = (): UseBusinessReturn => {
    const [state, setState] = useState<BusinessState>({
        businesses: [],
        isLoading: false,
        error: null,
    });

    // Get all businesses for current company
    const getBusinesses = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.get('/');
            if (response.data.status === 'success') {
                setState(prev => ({
                    ...prev,
                    businesses: response.data.companies || [],
                    isLoading: false,
                }));
            }
        } catch (error) {
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || 'Failed to fetch businesses'
                : 'An error occurred';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
        }
    }, []);

    // Get single business by ID
    const getBusinessById = useCallback(async (id: string): Promise<Business | null> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.get(`/${id}/`);
            if (response.data.status === 'success') {
                setState(prev => ({ ...prev, isLoading: false }));
                return response.data.company;
            }
            return null;
        } catch (error) {
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || 'Failed to fetch business'
                : 'An error occurred';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return null;
        }
    }, []);

    // Create new business
    const createBusiness = useCallback(async (data: Partial<Business>): Promise<Business | null> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.post('/create/', data);
            if (response.data.status === 'success') {
                const newBusiness = response.data.company;
                setState(prev => ({
                    ...prev,
                    businesses: [...prev.businesses, newBusiness],
                    isLoading: false,
                }));
                return newBusiness;
            }
            return null;
        } catch (error) {
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || 'Failed to create business'
                : 'An error occurred';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return null;
        }
    }, []);

    // Update business
    const updateBusiness = useCallback(async (id: string, data: Partial<Business>): Promise<Business | null> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.post(`/${id}/update/`, data);
            if (response.data.status === 'success') {
                const updatedBusiness = response.data.company;
                setState(prev => ({
                    ...prev,
                    businesses: prev.businesses.map(b => b.id === id ? updatedBusiness : b),
                    isLoading: false,
                }));
                return updatedBusiness;
            }
            return null;
        } catch (error) {
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || 'Failed to update business'
                : 'An error occurred';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return null;
        }
    }, []);

    // Delete business
    const deleteBusiness = useCallback(async (id: string): Promise<boolean> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.delete(`/${id}/delete/`);
            if (response.data.status === 'success') {
                setState(prev => ({
                    ...prev,
                    businesses: prev.businesses.filter(b => b.id !== id),
                    isLoading: false,
                }));
                return true;
            }
            return false;
        } catch (error) {
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || 'Failed to delete business'
                : 'An error occurred';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return false;
        }
    }, []);

    // Block business
    const blockBusiness = useCallback(async (id: string, reason?: string): Promise<boolean> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.post(`/${id}/block/`, { reason });
            if (response.data.status === 'success') {
                const updatedBusiness = response.data.company;
                setState(prev => ({
                    ...prev,
                    businesses: prev.businesses.map(b => b.id === id ? updatedBusiness : b),
                    isLoading: false,
                }));
                return true;
            }
            return false;
        } catch (error) {
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || 'Failed to block business'
                : 'An error occurred';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return false;
        }
    }, []);

    // Unblock business
    const unblockBusiness = useCallback(async (id: string): Promise<boolean> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.post(`/${id}/unblock/`);
            if (response.data.status === 'success') {
                const updatedBusiness = response.data.company;
                setState(prev => ({
                    ...prev,
                    businesses: prev.businesses.map(b => b.id === id ? updatedBusiness : b),
                    isLoading: false,
                }));
                return true;
            }
            return false;
        } catch (error) {
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || 'Failed to unblock business'
                : 'An error occurred';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return false;
        }
    }, []);

    // Mark company as active
    const markActiveCompany = useCallback(async (id: string): Promise<boolean> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.post('/set-active-company/', { company_id: id });
            if (response.data.status === 'success') {
                setState(prev => ({ ...prev, isLoading: false }));
                return true;
            }
            return false;
        } catch (error) {
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || 'Failed to set active company'
                : 'An error occurred';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return false;
        }
    }, []);

    // Upload business documents
    const uploadDocuments = useCallback(async (id: string, documents: FormData): Promise<boolean> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            documents.append('company_id', id);
            const response = await axiosInstance.post('/upload-company-documents/', documents);
            if (response.data.status === 'success') {
                const updatedBusiness = response.data.company;
                setState(prev => ({
                    ...prev,
                    businesses: prev.businesses.map(b => b.id === id ? updatedBusiness : b),
                    isLoading: false,
                }));
                return true;
            }
            return false;
        } catch (error) {
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || 'Failed to upload documents'
                : 'An error occurred';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return false;
        }
    }, []);

    // Upload business logo
    const uploadLogo = useCallback(async (id: string, file: File): Promise<boolean> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const formData = new FormData();
            formData.append('company_id', id);
            formData.append('logo', file);

            const response = await axiosInstance.post('/upload-company-documents/', formData);
            if (response.data.status === 'success') {
                const updatedBusiness = response.data.company;
                setState(prev => ({
                    ...prev,
                    businesses: prev.businesses.map(b => b.id === id ? updatedBusiness : b),
                    isLoading: false,
                }));
                return true;
            }
            return false;
        } catch (error) {
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || 'Failed to upload logo'
                : 'An error occurred';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return false;
        }
    }, []);

    // Initialize - fetch businesses on mount
    useEffect(() => {
        getBusinesses();
    }, [getBusinesses]);

    return {
        ...state,
        getBusinesses,
        getBusinessById,
        createBusiness,
        updateBusiness,
        deleteBusiness,
        blockBusiness,
        unblockBusiness,
        markActiveCompany,
        uploadDocuments,
        uploadLogo,
    };
};
