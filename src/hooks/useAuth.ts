import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { API_USERS_BASE_URL } from '../services/api';

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
    login: (credentials: LoginCredentials) => Promise<void>;
    confirmLogin: (data: ConfirmationData) => Promise<void>;
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
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.get('/me/');
            if (response.data.status === 'success') {
                setState(prev => ({
                    ...prev,
                    user: response.data.user,
                    isAuthenticated: true,
                    isLoading: false,
                }));
            }
        } catch (error) {
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
    const login = useCallback(async (credentials: LoginCredentials) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      try {
        const response = await axiosInstance.post('/login/', credentials);
        
        if (response.data.status === 'error') {
          throw new Error(response.data.message || 'Login failed');
        }
        
        if (response.data.status === 'success') {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: null,
          }));
        }
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
        throw error;
      }
    }, []);

    // Confirm login with email and confirmation code
    const confirmLogin = useCallback(async (data: ConfirmationData) => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.post('/confirm/', data);
            if (response.data.status === 'success') {
                // After confirmation, fetch current user
                await getCurrentUser();
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: null,
                }));
            } else {
                throw new Error(response.data.message || 'Confirmation failed');
            }
        } catch (error) {
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || error.message
                : 'An error occurred during confirmation';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            throw error;
        }
    }, [getCurrentUser]);

    // Logout user
    const logout = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            await axiosInstance.post('/logout/');
            setState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            });
        } catch (error) {
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

    // Set active company for user
    const setActiveCompany = useCallback(async (companyId: string): Promise<Company> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.post('/set-active-company/', { company_id: companyId });
            if (response.data.status === 'success') {
                const company = response.data.company;
                setState(prev => ({
                    ...prev,
                    user: prev.user ? { ...prev.user, active_company: company } : null,
                    isLoading: false,
                    error: null,
                }));
                return company;
            } else {
                throw new Error(response.data.message || 'Failed to set active company');
            }
        } catch (error) {
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || error.message
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
        logout,
        getCurrentUser,
        setActiveCompany,
    };
};

