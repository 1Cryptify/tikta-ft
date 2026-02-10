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

export interface PaymentMethod {
    id: string;
    name: string;
    type: string;
    details?: Record<string, any>;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface WithdrawalAccount {
    id: string;
    company_id: string;
    account_holder_name: string;
    account_number: string;
    bank_name: string;
    bank_code?: string;
    branch_code?: string;
    swift_code?: string;
    iban?: string;
    currency_code?: string;
    payment_method?: string; // payment method name
    payment_method_id?: string;
    status: 'pending' | 'verified' | 'rejected';
    verification_details?: Record<string, any>;
    created_at?: string;
    updated_at?: string;
}

interface WithdrawalState {
    withdrawalAccounts: WithdrawalAccount[];
    isLoading: boolean;
    error: string | null;
    successMessage: string | null;
}

interface UseWithdrawalReturn extends WithdrawalState {
    getWithdrawalAccounts: () => Promise<void>;
    getWithdrawalAccountById: (id: string) => Promise<WithdrawalAccount | null>;
    createWithdrawalAccount: (data: Partial<WithdrawalAccount>) => Promise<WithdrawalAccount | null>;
    updateWithdrawalAccount: (id: string, data: Partial<WithdrawalAccount>) => Promise<WithdrawalAccount | null>;
    deleteWithdrawalAccount: (id: string) => Promise<boolean>;
    verifyWithdrawalAccount: (id: string) => Promise<boolean>;
    rejectWithdrawalAccount: (id: string, reason?: string) => Promise<boolean>;
    getCompanyWithdrawalAccounts: (companyId: string) => Promise<WithdrawalAccount[]>;
    getPaymentMethods: () => Promise<PaymentMethod[]>;
    linkPaymentMethod: (withdrawalId: string, paymentMethodName: string) => Promise<WithdrawalAccount | null>;
    unlinkPaymentMethod: (withdrawalId: string) => Promise<WithdrawalAccount | null>;
}

export const useWithdrawal = (): UseWithdrawalReturn => {
    const { user } = useAuth();
    const [state, setState] = useState<WithdrawalState>({
        withdrawalAccounts: [],
        isLoading: false,
        error: null,
        successMessage: null,
    });

    // Get all withdrawal accounts
    const getWithdrawalAccounts = useCallback(async () => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await axiosInstance.get('/withdrawal-accounts/');
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);

            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }

            if (response.data.status === 'success') {
                setState(prev => ({
                    ...prev,
                    withdrawalAccounts: response.data.withdrawal_accounts || [],
                    isLoading: false,
                }));
            } else if (response.data.status === 'error') {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Failed to fetch withdrawal accounts',
                }));
            }
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to fetch withdrawal accounts',
            }));
        }
    }, []);

    // Get single withdrawal account by ID
    const getWithdrawalAccountById = useCallback(async (id: string): Promise<WithdrawalAccount | null> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await axiosInstance.get(`/withdrawal-accounts/${id}/`);
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);

            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }

            if (response.data.status === 'success') {
                setState(prev => ({ ...prev, isLoading: false }));
                return response.data.withdrawal_account;
            } else if (response.data.status === 'error') {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Failed to fetch withdrawal account',
                }));
            }
            return null;
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to fetch withdrawal account',
            }));
            return null;
        }
    }, []);

    // Create new withdrawal account
    const createWithdrawalAccount = useCallback(async (data: Partial<WithdrawalAccount>): Promise<WithdrawalAccount | null> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            // Auto-add company_id from active company if not a superuser
            const accountData = { ...data };
            if (user && !user.is_superuser && user.active_company) {
                accountData.company_id = user.active_company.id;
            }

            const response = await axiosInstance.post('/withdrawal-accounts/create/', accountData);
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);

            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }

            if (response.data.status === 'success') {
                const newAccount = response.data.withdrawal_account;
                setState(prev => ({
                    ...prev,
                    withdrawalAccounts: [...prev.withdrawalAccounts, newAccount],
                    isLoading: false,
                    successMessage: response.data.message || 'Withdrawal account created successfully',
                }));
                return newAccount;
            } else if (response.data.status === 'error') {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Failed to create withdrawal account',
                }));
            }
            return null;
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to create withdrawal account',
            }));
            return null;
        }
    }, [user]);

    // Update withdrawal account
    const updateWithdrawalAccount = useCallback(async (id: string, data: Partial<WithdrawalAccount>): Promise<WithdrawalAccount | null> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await axiosInstance.post(`/withdrawal-accounts/${id}/update/`, data);
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);

            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }

            if (response.data.status === 'success') {
                const updatedAccount = response.data.withdrawal_account;
                setState(prev => ({
                    ...prev,
                    withdrawalAccounts: prev.withdrawalAccounts.map(a => a.id === id ? updatedAccount : a),
                    isLoading: false,
                    successMessage: response.data.message || 'Withdrawal account updated successfully',
                }));
                return updatedAccount;
            } else if (response.data.status === 'error') {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Failed to update withdrawal account',
                }));
            }
            return null;
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to update withdrawal account',
            }));
            return null;
        }
    }, []);

    // Delete withdrawal account
    const deleteWithdrawalAccount = useCallback(async (id: string): Promise<boolean> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await axiosInstance.post(`/withdrawal-accounts/${id}/delete/`);
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);

            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }

            if (response.data.status === 'success') {
                setState(prev => ({
                    ...prev,
                    withdrawalAccounts: prev.withdrawalAccounts.filter(a => a.id !== id),
                    isLoading: false,
                    successMessage: response.data.message || 'Withdrawal account deleted successfully',
                }));
                return true;
            } else if (response.data.status === 'error') {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Failed to delete withdrawal account',
                }));
            }
            return false;
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to delete withdrawal account',
            }));
            return false;
        }
    }, []);

    // Verify withdrawal account
    const verifyWithdrawalAccount = useCallback(async (id: string): Promise<boolean> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await axiosInstance.post(`/withdrawal-accounts/${id}/verify/`);
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);

            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }

            if (response.data.status === 'success') {
                const updatedAccount = response.data.withdrawal_account;
                setState(prev => ({
                    ...prev,
                    withdrawalAccounts: prev.withdrawalAccounts.map(a => a.id === id ? updatedAccount : a),
                    isLoading: false,
                    successMessage: response.data.message || 'Withdrawal account verified successfully',
                }));
                return true;
            } else if (response.data.status === 'error') {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Failed to verify withdrawal account',
                }));
            }
            return false;
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to verify withdrawal account',
            }));
            return false;
        }
    }, []);

    // Reject withdrawal account
    const rejectWithdrawalAccount = useCallback(async (id: string, reason?: string): Promise<boolean> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await axiosInstance.post(`/withdrawal-accounts/${id}/reject/`, { reason });
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);

            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }

            if (response.data.status === 'success') {
                const updatedAccount = response.data.withdrawal_account;
                setState(prev => ({
                    ...prev,
                    withdrawalAccounts: prev.withdrawalAccounts.map(a => a.id === id ? updatedAccount : a),
                    isLoading: false,
                    successMessage: response.data.message || 'Withdrawal account rejected successfully',
                }));
                return true;
            } else if (response.data.status === 'error') {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Failed to reject withdrawal account',
                }));
            }
            return false;
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to reject withdrawal account',
            }));
            return false;
        }
    }, []);

    // Get withdrawal accounts for a specific company
    const getCompanyWithdrawalAccounts = useCallback(async (companyId: string): Promise<WithdrawalAccount[]> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await axiosInstance.get(`/companies/${companyId}/withdrawal-accounts/`);
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);

            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }

            if (response.data.status === 'success') {
                setState(prev => ({ ...prev, isLoading: false }));
                return response.data.withdrawal_accounts || [];
            } else if (response.data.status === 'error') {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Failed to fetch company withdrawal accounts',
                }));
            }
            return [];
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to fetch company withdrawal accounts',
            }));
            return [];
        }
    }, []);

    // Get available payment methods
    const getPaymentMethods = useCallback(async (): Promise<PaymentMethod[]> => {
        try {
            const response = await axiosInstance.get('/payment-methods/');
            if (response.data.status === 'success') {
                return response.data.payment_methods || [];
            } else if (response.data.status === 'error') {
                setState(prev => ({
                    ...prev,
                    error: response.data.message || 'Failed to fetch payment methods',
                }));
            }
            return [];
        } catch (error) {
            setState(prev => ({
                ...prev,
                error: 'Failed to fetch payment methods',
            }));
            return [];
        }
    }, []);

    // Link payment method to withdrawal account
    const linkPaymentMethod = useCallback(async (withdrawalId: string, paymentMethodName: string): Promise<WithdrawalAccount | null> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await axiosInstance.post(`/withdrawal-accounts/${withdrawalId}/payment-methods/${paymentMethodName}/link/`, {});
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);

            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }

            if (response.data.status === 'success') {
                const updatedAccount = response.data.withdrawal_account;
                setState(prev => ({
                    ...prev,
                    withdrawalAccounts: prev.withdrawalAccounts.map(a => a.id === withdrawalId ? updatedAccount : a),
                    isLoading: false,
                    successMessage: response.data.message || 'Payment method linked successfully',
                }));
                return updatedAccount;
            } else if (response.data.status === 'error') {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Failed to link payment method',
                }));
            }
            return null;
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to link payment method',
            }));
            return null;
        }
    }, []);

    // Unlink payment method from withdrawal account
    const unlinkPaymentMethod = useCallback(async (withdrawalId: string): Promise<WithdrawalAccount | null> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await axiosInstance.post(`/withdrawal-accounts/${withdrawalId}/payment-methods/unlink/`, {});
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);

            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }

            if (response.data.status === 'success') {
                const updatedAccount = response.data.withdrawal_account;
                setState(prev => ({
                    ...prev,
                    withdrawalAccounts: prev.withdrawalAccounts.map(a => a.id === withdrawalId ? updatedAccount : a),
                    isLoading: false,
                    successMessage: response.data.message || 'Payment method unlinked successfully',
                }));
                return updatedAccount;
            } else if (response.data.status === 'error') {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Failed to unlink payment method',
                }));
            }
            return null;
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to unlink payment method',
            }));
            return null;
        }
    }, []);

    // Initialize - fetch data on mount
    useEffect(() => {
        getWithdrawalAccounts();
    }, [getWithdrawalAccounts]);

    return {
        ...state,
        getWithdrawalAccounts,
        getWithdrawalAccountById,
        createWithdrawalAccount,
        updateWithdrawalAccount,
        deleteWithdrawalAccount,
        verifyWithdrawalAccount,
        rejectWithdrawalAccount,
        getCompanyWithdrawalAccounts,
        getPaymentMethods,
        linkPaymentMethod,
        unlinkPaymentMethod,
    };
};
