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
}

export interface PaymentTransaction {
    id: string;
    payment_id: string;
    amount: number;
    currency_id?: string;
    currency?: Currency;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    gateway_transaction_id?: string;
    gateway_response?: Record<string, any>;
    created_at?: string;
    updated_at?: string;
}

interface TransactionState {
    transactions: PaymentTransaction[];
    isLoading: boolean;
    error: string | null;
    successMessage: string | null;
}

interface UseTransactionReturn extends TransactionState {
    getTransactions: () => Promise<void>;
    getTransactionById: (id: string) => Promise<PaymentTransaction | null>;
    createTransaction: (data: Partial<PaymentTransaction>) => Promise<PaymentTransaction | null>;
    updateTransaction: (id: string, data: Partial<PaymentTransaction>) => Promise<PaymentTransaction | null>;
    deleteTransaction: (id: string) => Promise<boolean>;
}

export const useTransaction = (): UseTransactionReturn => {
    const [state, setState] = useState<TransactionState>({
        transactions: [],
        isLoading: false,
        error: null,
        successMessage: null,
    });

    // Get all transactions
    const getTransactions = useCallback(async () => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await axiosInstance.get('/transactions/');
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);

            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }

            if (response.data.status === 'success') {
                setState(prev => ({
                    ...prev,
                    transactions: response.data.transactions || [],
                    isLoading: false,
                }));
            } else if (response.data.status === 'error') {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Failed to fetch transactions',
                }));
            }
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to fetch transactions',
            }));
        }
    }, []);

    // Get single transaction by ID
    const getTransactionById = useCallback(async (id: string): Promise<PaymentTransaction | null> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await axiosInstance.get(`/transactions/${id}/`);
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);

            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }

            if (response.data.status === 'success') {
                setState(prev => ({ ...prev, isLoading: false }));
                return response.data.transaction;
            } else if (response.data.status === 'error') {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Failed to fetch transaction',
                }));
            }
            return null;
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to fetch transaction',
            }));
            return null;
        }
    }, []);

    // Create new transaction
    const createTransaction = useCallback(async (data: Partial<PaymentTransaction>): Promise<PaymentTransaction | null> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await axiosInstance.post('/transactions/create/', data);
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);

            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }

            if (response.data.status === 'success') {
                const newTransaction = response.data.transaction;
                setState(prev => ({
                    ...prev,
                    transactions: [...prev.transactions, newTransaction],
                    isLoading: false,
                    successMessage: response.data.message || 'Transaction created successfully',
                }));
                return newTransaction;
            } else if (response.data.status === 'error') {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Failed to create transaction',
                }));
            }
            return null;
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to create transaction',
            }));
            return null;
        }
    }, []);

    // Update transaction
    const updateTransaction = useCallback(async (id: string, data: Partial<PaymentTransaction>): Promise<PaymentTransaction | null> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await axiosInstance.post(`/transactions/${id}/update/`, data);
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);

            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }

            if (response.data.status === 'success') {
                const updatedTransaction = response.data.transaction;
                setState(prev => ({
                    ...prev,
                    transactions: prev.transactions.map(t => t.id === id ? updatedTransaction : t),
                    isLoading: false,
                    successMessage: response.data.message || 'Transaction updated successfully',
                }));
                return updatedTransaction;
            } else if (response.data.status === 'error') {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Failed to update transaction',
                }));
            }
            return null;
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to update transaction',
            }));
            return null;
        }
    }, []);

    // Delete transaction
    const deleteTransaction = useCallback(async (id: string): Promise<boolean> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await axiosInstance.post(`/transactions/${id}/delete/`);
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);

            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }

            if (response.data.status === 'success') {
                setState(prev => ({
                    ...prev,
                    transactions: prev.transactions.filter(t => t.id !== id),
                    isLoading: false,
                    successMessage: response.data.message || 'Transaction deleted successfully',
                }));
                return true;
            } else if (response.data.status === 'error') {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Failed to delete transaction',
                }));
            }
            return false;
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to delete transaction',
            }));
            return false;
        }
    }, []);

    // Initialize - fetch data on mount
    useEffect(() => {
        getTransactions();
    }, [getTransactions]);

    return {
        ...state,
        getTransactions,
        getTransactionById,
        createTransaction,
        updateTransaction,
        deleteTransaction,
    };
};
