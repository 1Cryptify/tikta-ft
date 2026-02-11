import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { API_PAYMENTS_BASE_URL } from '../services/api';
import { useAuth } from './useAuth';

// Délai minimum du loader en millisecondes
const LOADER_DURATION = 1000;

const axiosInstance = axios.create({
    baseURL: API_PAYMENTS_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface PaymentLog {
    id: string;
    payment_id?: string;
    company_id: string;
    user_id: string;
    action: string;
    details?: Record<string, any>;
    created_at?: string;
    updated_at?: string;
}

interface PaymentLogState {
    logs: PaymentLog[];
    isLoading: boolean;
    error: string | null;
    successMessage: string | null;
}

interface UsePaymentLogsReturn extends PaymentLogState {
    getLogs: () => Promise<void>;
    getLogById: (id: string) => Promise<PaymentLog | null>;
    getCompanyLogs: (companyId: string) => Promise<PaymentLog[]>;
    getUserLogs: (userId: string) => Promise<PaymentLog[]>;
}

export const usePaymentLogs = (): UsePaymentLogsReturn => {
    const { user } = useAuth();
    const [state, setState] = useState<PaymentLogState>({
        logs: [],
        isLoading: false,
        error: null,
        successMessage: null,
    });

    // Get all payment logs
    const getLogs = useCallback(async () => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await axiosInstance.get('/logs/');
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);

            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }

            if (response.data.status === 'success') {
                const sortedLogs = (response.data.logs || []).sort(
                    (a: PaymentLog, b: PaymentLog) => {
                        const dateA = new Date(a.created_at || 0).getTime();
                        const dateB = new Date(b.created_at || 0).getTime();
                        return dateB - dateA; // Descending order (newest first)
                    }
                );
                setState(prev => ({
                    ...prev,
                    logs: sortedLogs,
                    isLoading: false,
                }));
            } else if (response.data.status === 'error') {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Failed to fetch payment logs',
                }));
            }
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to fetch payment logs',
            }));
        }
    }, []);

    // Get single payment log by ID
    const getLogById = useCallback(async (id: string): Promise<PaymentLog | null> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await axiosInstance.get(`/logs/${id}/`);
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);

            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }

            if (response.data.status === 'success') {
                setState(prev => ({ ...prev, isLoading: false }));
                return response.data.log;
            } else if (response.data.status === 'error') {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Failed to fetch payment log',
                }));
            }
            return null;
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to fetch payment log',
            }));
            return null;
        }
    }, []);

    // Get payment logs for a specific company
    const getCompanyLogs = useCallback(async (companyId: string): Promise<PaymentLog[]> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await axiosInstance.get(`/logs/company/${companyId}/`);
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);

            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }

            if (response.data.status === 'success') {
                setState(prev => ({ ...prev, isLoading: false }));
                const sortedLogs = (response.data.logs || []).sort(
                    (a: PaymentLog, b: PaymentLog) => {
                        const dateA = new Date(a.created_at || 0).getTime();
                        const dateB = new Date(b.created_at || 0).getTime();
                        return dateB - dateA; // Descending order (newest first)
                    }
                );
                return sortedLogs;
            } else if (response.data.status === 'error') {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Failed to fetch company logs',
                }));
            }
            return [];
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to fetch company logs',
            }));
            return [];
        }
    }, []);

    // Get payment logs for a specific user
    const getUserLogs = useCallback(async (userId: string): Promise<PaymentLog[]> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await axiosInstance.get(`/logs/user/${userId}/`);
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);

            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }

            if (response.data.status === 'success') {
                setState(prev => ({ ...prev, isLoading: false }));
                const sortedLogs = (response.data.logs || []).sort(
                    (a: PaymentLog, b: PaymentLog) => {
                        const dateA = new Date(a.created_at || 0).getTime();
                        const dateB = new Date(b.created_at || 0).getTime();
                        return dateB - dateA; // Descending order (newest first)
                    }
                );
                return sortedLogs;
            } else if (response.data.status === 'error') {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Failed to fetch user logs',
                }));
            }
            return [];
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to fetch user logs',
            }));
            return [];
        }
    }, []);

    // Initialize - fetch data on mount
    useEffect(() => {
        getLogs();
    }, [getLogs]);

    return {
        ...state,
        getLogs,
        getLogById,
        getCompanyLogs,
        getUserLogs,
    };
};
