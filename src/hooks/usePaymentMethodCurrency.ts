import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { API_PAYMENTS_BASE_URL } from '../services/api';
import { useAuth } from './useAuth';

const LOADER_DURATION = 1000;

const axiosInstance = axios.create({
    baseURL: API_PAYMENTS_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface Currency {
    id: string;
    code: string;
    name: string;
    symbol: string;
    value_in_usd: number;
    decimal_places: number;
    is_active: boolean;
    is_default: boolean;
    created_at?: string;
    updated_at?: string;
    last_updated_rate?: string;
}

export interface PaymentMethod {
    id: string;
    name: string;
    type: 'bank_account' | 'card' | 'mobile_money' | 'wallet';
    logo?: string;
    details: Record<string, unknown>;
    channel?: string;
    country?: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

interface PaymentMethodCurrencyState {
    currencies: Currency[];
    paymentMethods: PaymentMethod[];
    isLoading: boolean;
    error: string | null;
    successMessage: string | null;
}

interface UsePaymentMethodCurrencyReturn extends PaymentMethodCurrencyState {
    // Currency operations
    getCurrencies: () => Promise<void>;
    getCurrencyById: (id: string) => Promise<Currency | null>;
    createCurrency: (data: Omit<Currency, 'id' | 'created_at' | 'updated_at'>) => Promise<Currency | null>;
    updateCurrency: (id: string, data: Partial<Currency>) => Promise<Currency | null>;
    deleteCurrency: (id: string) => Promise<boolean>;

    // Payment Method operations
    getPaymentMethods: () => Promise<void>;
    getPaymentMethodById: (id: string) => Promise<PaymentMethod | null>;
    createPaymentMethod: (data: Omit<PaymentMethod, 'id' | 'created_at' | 'updated_at'>) => Promise<PaymentMethod | null>;
    updatePaymentMethod: (id: string, data: Partial<PaymentMethod>) => Promise<PaymentMethod | null>;
    deletePaymentMethod: (id: string) => Promise<boolean>;
    uploadPaymentMethodLogo: (id: string, file: File) => Promise<PaymentMethod | null>;
}

export const usePaymentMethodCurrency = (): UsePaymentMethodCurrencyReturn => {
    const { user } = useAuth();
    const [state, setState] = useState<PaymentMethodCurrencyState>({
        currencies: [],
        paymentMethods: [],
        isLoading: false,
        error: null,
        successMessage: null,
    });

    // ============ Currency Operations ============

    const getCurrencies = useCallback(async () => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await axiosInstance.get('/currencies/');
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);

            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }

            if (response.data.status === 'success') {
                setState(prev => ({
                    ...prev,
                    currencies: response.data.currencies || [],
                    isLoading: false,
                }));
            } else {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Failed to fetch currencies',
                }));
            }
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to fetch currencies',
            }));
        }
    }, []);

    const getCurrencyById = useCallback(async (id: string): Promise<Currency | null> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await axiosInstance.get(`/currencies/${id}/`);
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);

            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }

            if (response.data.status === 'success') {
                setState(prev => ({ ...prev, isLoading: false }));
                return response.data.currency;
            } else {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Failed to fetch currency',
                }));
            }
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to fetch currency',
            }));
        }
        return null;
    }, []);

    const createCurrency = useCallback(async (data: Omit<Currency, 'id' | 'created_at' | 'updated_at'>): Promise<Currency | null> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await axiosInstance.post('/currencies/create/', data);
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);

            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }

            if (response.data.status === 'success') {
                const newCurrency = response.data.currency;
                setState(prev => ({
                    ...prev,
                    currencies: [...prev.currencies, newCurrency],
                    isLoading: false,
                    successMessage: response.data.message || 'Currency created successfully',
                }));
                return newCurrency;
            } else {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Failed to create currency',
                }));
            }
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to create currency',
            }));
        }
        return null;
    }, []);

    const updateCurrency = useCallback(async (id: string, data: Partial<Currency>): Promise<Currency | null> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await axiosInstance.post(`/currencies/${id}/update/`, data);
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);

            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }

            if (response.data.status === 'success') {
                const updatedCurrency = response.data.currency;
                setState(prev => ({
                    ...prev,
                    currencies: prev.currencies.map(c => c.id === id ? updatedCurrency : c),
                    isLoading: false,
                    successMessage: response.data.message || 'Currency updated successfully',
                }));
                return updatedCurrency;
            } else {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Failed to update currency',
                }));
            }
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to update currency',
            }));
        }
        return null;
    }, []);

    const deleteCurrency = useCallback(async (id: string): Promise<boolean> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await axiosInstance.post(`/currencies/${id}/delete/`);
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);

            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }

            if (response.data.status === 'success') {
                setState(prev => ({
                    ...prev,
                    currencies: prev.currencies.filter(c => c.id !== id),
                    isLoading: false,
                    successMessage: response.data.message || 'Currency deleted successfully',
                }));
                return true;
            } else {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Failed to delete currency',
                }));
            }
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to delete currency',
            }));
        }
        return false;
    }, []);

    // ============ Payment Method Operations ============

    const getPaymentMethods = useCallback(async () => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await axiosInstance.get('/payment-methods/');
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);

            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }

            if (response.data.status === 'success') {
                setState(prev => ({
                    ...prev,
                    paymentMethods: response.data.payment_methods || [],
                    isLoading: false,
                }));
            } else {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Failed to fetch payment methods',
                }));
            }
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to fetch payment methods',
            }));
        }
    }, []);

    const getPaymentMethodById = useCallback(async (id: string): Promise<PaymentMethod | null> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await axiosInstance.get(`/payment-methods/${id}/`);
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);

            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }

            if (response.data.status === 'success') {
                setState(prev => ({ ...prev, isLoading: false }));
                return response.data.payment_method;
            } else {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Failed to fetch payment method',
                }));
            }
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to fetch payment method',
            }));
        }
        return null;
    }, []);

    const createPaymentMethod = useCallback(async (data: Omit<PaymentMethod, 'id' | 'created_at' | 'updated_at'>): Promise<PaymentMethod | null> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await axiosInstance.post('/payment-methods/create/', data);
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);

            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }

            if (response.data.status === 'success') {
                const newMethod = response.data.payment_method;
                setState(prev => ({
                    ...prev,
                    paymentMethods: [...prev.paymentMethods, newMethod],
                    isLoading: false,
                    successMessage: response.data.message || 'Payment method created successfully',
                }));
                return newMethod;
            } else {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Failed to create payment method',
                }));
            }
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to create payment method',
            }));
        }
        return null;
    }, []);

    const updatePaymentMethod = useCallback(async (id: string, data: Partial<PaymentMethod>): Promise<PaymentMethod | null> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await axiosInstance.post(`/payment-methods/${id}/update/`, data);
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);

            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }

            if (response.data.status === 'success') {
                const updatedMethod = response.data.payment_method;
                setState(prev => ({
                    ...prev,
                    paymentMethods: prev.paymentMethods.map(m => m.id === id ? updatedMethod : m),
                    isLoading: false,
                    successMessage: response.data.message || 'Payment method updated successfully',
                }));
                return updatedMethod;
            } else {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Failed to update payment method',
                }));
            }
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to update payment method',
            }));
        }
        return null;
    }, []);

    const deletePaymentMethod = useCallback(async (id: string): Promise<boolean> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await axiosInstance.post(`/payment-methods/${id}/delete/`);
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);

            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }

            if (response.data.status === 'success') {
                setState(prev => ({
                    ...prev,
                    paymentMethods: prev.paymentMethods.filter(m => m.id !== id),
                    isLoading: false,
                    successMessage: response.data.message || 'Payment method deleted successfully',
                }));
                return true;
            } else {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Failed to delete payment method',
                }));
            }
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to delete payment method',
            }));
        }
        return false;
    }, []);

    const uploadPaymentMethodLogo = useCallback(async (id: string, file: File): Promise<PaymentMethod | null> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const formData = new FormData();
            formData.append('logo', file);

            const response = await axiosInstance.post(`/payment-methods/${id}/upload-logo/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);

            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }

            if (response.data.status === 'success') {
                const updatedMethod = response.data.payment_method;
                setState(prev => ({
                    ...prev,
                    paymentMethods: prev.paymentMethods.map(m => m.id === id ? updatedMethod : m),
                    isLoading: false,
                    successMessage: response.data.message || 'Logo uploaded successfully',
                }));
                return updatedMethod;
            } else {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Failed to upload logo',
                }));
            }
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to upload logo',
            }));
        }
        return null;
    }, []);

    // Initialize - fetch data on mount
    useEffect(() => {
        getCurrencies();
        getPaymentMethods();
    }, [getCurrencies, getPaymentMethods]);

    return {
        ...state,
        getCurrencies,
        getCurrencyById,
        createCurrency,
        updateCurrency,
        deleteCurrency,
        getPaymentMethods,
        getPaymentMethodById,
        createPaymentMethod,
        updatePaymentMethod,
        deletePaymentMethod,
        uploadPaymentMethodLogo,
    };
};
