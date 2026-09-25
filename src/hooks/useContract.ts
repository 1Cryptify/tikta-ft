import { useState, useCallback } from 'react';
import axios from 'axios';
import { API_USERS_BASE_URL } from '../services/api';

export interface ContractTemplate {
    id: string;
    title: string;
    file: string | null;
    version: number;
    notes: string;
    is_active: boolean;
    uploaded_by?: string | null;
    uploaded_by_email?: string | null;
    created_at?: string;
    updated_at?: string;
}

interface UseContractReturn {
    templates: ContractTemplate[];
    current: ContractTemplate | null;
    isLoading: boolean;
    error: string | null;
    getTemplates: () => Promise<void>;
    getCurrentTemplate: () => Promise<ContractTemplate | null>;
    uploadTemplate: (file: File, title?: string, notes?: string) => Promise<ContractTemplate | null>;
    activateTemplate: (id: string) => Promise<boolean>;
    deleteTemplate: (id: string) => Promise<boolean>;
    getTemplateUrl: (path: string | null | undefined) => string;
}

const axiosInstance = axios.create({
    baseURL: API_USERS_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use((config) => {
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }
    return config;
});

const extractError = (error: unknown, fallback: string): string => {
    if (error instanceof axios.AxiosError) {
        return error.response?.data?.message || error.response?.data?.error || error.message || fallback;
    }
    if (error instanceof Error) return error.message;
    return fallback;
};

export const useContract = (): UseContractReturn => {
    const [templates, setTemplates] = useState<ContractTemplate[]>([]);
    const [current, setCurrent] = useState<ContractTemplate | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getTemplates = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axiosInstance.get('/contract-templates/');
            if (response.data.status === 'success') {
                setTemplates(response.data.templates || []);
                setCurrent(response.data.current || null);
            }
        } catch (err) {
            setError(extractError(err, 'Failed to fetch contract templates'));
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getCurrentTemplate = useCallback(async (): Promise<ContractTemplate | null> => {
        try {
            const response = await axiosInstance.get('/contract-templates/current/');
            if (response.data.status === 'success') {
                setCurrent(response.data.template || null);
                return response.data.template || null;
            }
            return null;
        } catch (err) {
            setError(extractError(err, 'Failed to fetch current contract template'));
            return null;
        }
    }, []);

    const uploadTemplate = useCallback(async (file: File, title?: string, notes?: string): Promise<ContractTemplate | null> => {
        setIsLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('file', file);
            if (title) formData.append('title', title);
            if (notes) formData.append('notes', notes);

            const response = await axiosInstance.post('/contract-templates/', formData);
            if (response.data.status === 'success') {
                await getTemplates();
                return response.data.template as ContractTemplate;
            }
            setError(response.data.message || 'Failed to upload contract template');
            return null;
        } catch (err) {
            setError(extractError(err, 'Failed to upload contract template'));
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [getTemplates]);

    const activateTemplate = useCallback(async (id: string): Promise<boolean> => {
        setError(null);
        try {
            const response = await axiosInstance.post(`/contract-templates/${id}/activate/`);
            if (response.data.status === 'success') {
                await getTemplates();
                return true;
            }
            return false;
        } catch (err) {
            setError(extractError(err, 'Failed to activate contract template'));
            return false;
        }
    }, [getTemplates]);

    const deleteTemplate = useCallback(async (id: string): Promise<boolean> => {
        setError(null);
        try {
            const response = await axiosInstance.delete(`/contract-templates/${id}/`);
            if (response.data.status === 'success') {
                await getTemplates();
                return true;
            }
            return false;
        } catch (err) {
            setError(extractError(err, 'Failed to delete contract template'));
            return false;
        }
    }, [getTemplates]);

    const getTemplateUrl = useCallback((path: string | null | undefined): string => {
        if (!path) return '';
        if (path.startsWith('http://') || path.startsWith('https://')) return path;
        if (path.startsWith('/media/')) return `${API_USERS_BASE_URL.split('/api/users')[0]}${path}`;
        const clean = path.startsWith('media/') ? path.substring(6) : path;
        return `${API_USERS_BASE_URL.split('/api/users')[0]}/media/${clean}`;
    }, []);

    return {
        templates,
        current,
        isLoading,
        error,
        getTemplates,
        getCurrentTemplate,
        uploadTemplate,
        activateTemplate,
        deleteTemplate,
        getTemplateUrl,
    };
};

export default useContract;
