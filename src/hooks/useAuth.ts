import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { API_USERS_BASE_URL } from '../services/api';

// Délai minimum du loader en millisecondes
const LOADER_DURATION = 1000;

const axiosInstance = axios.create({
    baseURL: API_USERS_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface Company {
    id: string;
    name: string;
    is_verified: boolean;
    is_blocked: boolean;
    is_deleted: boolean;
}

export interface User {
    id: string;
    email: string;
    is_staff: boolean;
    is_superuser: boolean;
    is_active: boolean;
    is_verified: boolean;
    is_blocked: boolean;
    active_company?: Company | null;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

interface LoginCredentials {
    email: string;
    password: string;
}

interface ConfirmationData {
    email: string;
    code: string;
}

interface UseAuthReturn extends AuthState {
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    confirmLogin: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
    resendCode: (email: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    getCurrentUser: () => Promise<void>;
    setActiveCompany: (companyId: string) => Promise<Company>;
}

export const useAuth = (): UseAuthReturn => {
    const [state, setState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
    });

    // Get current authenticated user
    const getCurrentUser = useCallback(async () => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.get('/me/');
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
            
            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }
            
            if (response.data.status === 'success') {
                setState(prev => ({
                    ...prev,
                    user: response.data.user,
                    isAuthenticated: true,
                    isLoading: false,
                }));
            }
        } catch (error) {
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
            
            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }
            
            setState(prev => ({
                ...prev,
                isAuthenticated: false,
                isLoading: false,
                error: error instanceof axios.AxiosError
                    ? error.response?.data?.message || 'Failed to fetch user'
                    : 'An error occurred',
            }));
        }
    }, []);

    // Login with email and password
    const login = useCallback(async (email: string, password: string) => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.post('/login/', { email, password });

            if (response.data.status === 'error') {
                const errorMessage = response.data.message || 'Login failed';
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: errorMessage,
                }));
                return { success: false, error: errorMessage };
            }

            if (response.data.status === 'success') {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: null,
                }));
                return { success: true };
            }
            return { success: false, error: 'Unknown response' };
        } catch (error) {
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || error.message
                : error instanceof Error
                    ? error.message
                    : 'An error occurred during login';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return { success: false, error: errorMessage };
        }
    }, []);

    // Confirm login with email and confirmation code
    const confirmLogin = useCallback(async (email: string, code: string) => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.post('/confirm/', { email, code });
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
            
            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }

            if (response.data.status === 'error') {
                const errorMessage = response.data.message || 'Confirmation failed';
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: errorMessage,
                }));
                return { success: false, error: errorMessage };
            }

            if (response.data.status === 'success') {
                // After confirmation, fetch current user
                await getCurrentUser();
                return { success: true };
            }
            return { success: false, error: 'Unknown response' };
        } catch (error) {
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
            
            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }
            
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || error.message
                : error instanceof Error
                    ? error.message
                    : 'An error occurred during confirmation';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return { success: false, error: errorMessage };
        }
    }, [getCurrentUser]);

    // Logout user
    const logout = useCallback(async () => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            await axiosInstance.post('/logout/');
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
            
            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }
            
            setState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            });
        } catch (error) {
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
            
            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }
            
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || 'Logout failed'
                : 'An error occurred during logout';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
        }
    }, []);

    // Resend confirmation code
    const resendCode = useCallback(async (email: string) => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.post('/resend-code/', { email });
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
            
            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }

            if (response.data.status === 'error') {
                const errorMessage = response.data.message || 'Failed to resend code';
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: errorMessage,
                }));
                return { success: false, error: errorMessage };
            }

            if (response.data.status === 'success') {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: null,
                }));
                return { success: true };
            }
            return { success: false, error: 'Unknown response' };
        } catch (error) {
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
            
            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }
            
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || error.message
                : error instanceof Error
                    ? error.message
                    : 'An error occurred';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return { success: false, error: errorMessage };
        }
    }, []);

    // Set active company for user
    const setActiveCompany = useCallback(async (companyId: string): Promise<Company> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.post('/set-active-company/', { company_id: companyId });
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
            
            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }

            if (response.data.status === 'error') {
                throw new Error(response.data.message || 'Failed to set active company');
            }

            if (response.data.status === 'success') {
                const company = response.data.company;
                setState(prev => ({
                    ...prev,
                    user: prev.user ? { ...prev.user, active_company: company } : null,
                    isLoading: false,
                    error: null,
                }));
                return company;
            }

            throw new Error('Unexpected response from server');
        } catch (error) {
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
            
            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }
            
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || error.message
                : error instanceof Error
                    ? error.message
                    : 'An error occurred';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            throw error;
        }
    }, []);

    // Initialize auth state on mount
    useEffect(() => {
        getCurrentUser();
    }, [getCurrentUser]);

    return {
        ...state,
        login,
        confirmLogin,
        resendCode,
        logout,
        getCurrentUser,
        setActiveCompany,
    };
};

