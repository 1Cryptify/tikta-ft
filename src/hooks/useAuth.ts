import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { API_USERS_BASE_URL } from '../services/api';

// Délai minimum du loader en millisecondes
const LOADER_DURATION = 1000;

export const axiosInstance = axios.create({
    baseURL: API_USERS_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

export interface Company {
    id: string;
    name: string;
    is_verified: boolean;
    is_blocked: boolean;
    is_deleted: boolean;
}

export interface NotificationItem {
    id: string;
    type: string;
    title: string;
    message: string;
    data: Record<string, any>;
    is_read: boolean;
    created_at: string;
}

export interface User {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    is_staff: boolean;
    is_superuser: boolean;
    is_active: boolean;
    is_verified: boolean;
    email_verified: boolean;
    is_blocked: boolean;
    must_change_password: boolean;
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
    confirmLogin: (email: string, code: string) => Promise<{ success: boolean; error?: string; mustChangePassword?: boolean }>;
    resendCode: (email: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    getCurrentUser: () => Promise<void>;
    setActiveCompany: (companyId: string) => Promise<Company>;
    register: (data: { email: string; password: string; first_name?: string; last_name?: string }) => Promise<{ success: boolean; error?: string }>;
    verifyEmail: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
    forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
    firstLoginChangePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
    updateProfile: (data: { first_name?: string; last_name?: string }) => Promise<{ success: boolean; error?: string }>;
    getSessions: () => Promise<{ sessions: any[]; error?: string }>;
    revokeSession: (sessionKeyPrefix: string) => Promise<{ success: boolean; error?: string }>;
    getNotifications: (unreadOnly?: boolean) => Promise<{ notifications: NotificationItem[]; unread_count: number; error?: string }>;
    markNotificationRead: (notificationId?: string, markAll?: boolean) => Promise<{ success: boolean; error?: string }>;
    getNotificationPreferences: () => Promise<{ preferences: Record<string, boolean>; types: { key: string; label: string }[]; error?: string }>;
    updateNotificationPreferences: (preferences: Record<string, boolean>) => Promise<{ success: boolean; error?: string }>;
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
            console.log('Confirm login response:', response.data);
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
            
            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }

            if (response.data.status === 'error') {
                const errorMessage = response.data.message ;
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: errorMessage,
                }));
                return { success: false, error: errorMessage };
            }

            if (response.data.status === 'success') {
                // Cookies are automatically stored by axios when withCredentials: true
                // and server returns Set-Cookie header
                await getCurrentUser();
                return { success: true, mustChangePassword: response.data.must_change_password === true };
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

    // Register new user
    const register = useCallback(async (data: { email: string; password: string; first_name?: string; last_name?: string }) => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.post('/register/', data);
            setState(prev => ({ ...prev, isLoading: false, error: null }));
            if (response.data.status === 'error') {
                return { success: false, error: response.data.message || 'Registration failed' };
            }
            return { success: true };
        } catch (error) {
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || error.message
                : 'An error occurred';
            setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
            return { success: false, error: errorMessage };
        }
    }, []);

    // Verify email
    const verifyEmail = useCallback(async (email: string, code: string) => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.post('/verify-email/', { email, code });
            setState(prev => ({ ...prev, isLoading: false, error: null }));
            if (response.data.status === 'error') {
                return { success: false, error: response.data.message || 'Verification failed' };
            }
            return { success: true };
        } catch (error) {
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || error.message
                : 'An error occurred';
            setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
            return { success: false, error: errorMessage };
        }
    }, []);

    // Forgot password
    const forgotPassword = useCallback(async (email: string) => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.post('/forgot-password/', { email });
            setState(prev => ({ ...prev, isLoading: false, error: null }));
            if (response.data.status === 'error') {
                return { success: false, error: response.data.message || 'Failed to send reset email' };
            }
            return { success: true };
        } catch (error) {
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || error.message
                : 'An error occurred';
            setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
            return { success: false, error: errorMessage };
        }
    }, []);

    // Change password
    const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.post('/change-password/', {
                current_password: currentPassword,
                new_password: newPassword,
            });
            setState(prev => ({ ...prev, isLoading: false, error: null }));
            if (response.data.status === 'error') {
                return { success: false, error: response.data.message || 'Failed to change password' };
            }
            setState(prev => ({
                ...prev,
                user: prev.user ? { ...prev.user, must_change_password: false } : null,
            }));
            return { success: true };
        } catch (error) {
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || error.message
                : 'An error occurred';
            setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
            return { success: false, error: errorMessage };
        }
    }, []);

    // First login forced password change
    const firstLoginChangePassword = useCallback(async (newPassword: string) => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.post('/first-login-change-password/', {
                new_password: newPassword,
            });
            setState(prev => ({ ...prev, isLoading: false, error: null }));
            if (response.data.status === 'error') {
                return { success: false, error: response.data.message || 'Failed to change password' };
            }
            setState(prev => ({
                ...prev,
                user: prev.user ? { ...prev.user, must_change_password: false } : null,
            }));
            return { success: true };
        } catch (error) {
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || error.message
                : 'An error occurred';
            setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
            return { success: false, error: errorMessage };
        }
    }, []);

    // Update profile
    const updateProfile = useCallback(async (data: { first_name?: string; last_name?: string }) => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.post('/update-profile/', data);
            setState(prev => ({ ...prev, isLoading: false, error: null }));
            if (response.data.status === 'error') {
                return { success: false, error: response.data.message || 'Failed to update profile' };
            }
            await getCurrentUser();
            return { success: true };
        } catch (error) {
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || error.message
                : 'An error occurred';
            setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
            return { success: false, error: errorMessage };
        }
    }, [getCurrentUser]);

    // Get notifications
    const getNotifications = useCallback(async (unreadOnly = false) => {
        try {
            const response = await axiosInstance.get('/notifications/', {
                params: { unread: unreadOnly ? 'true' : 'false' },
            });
            if (response.data.status === 'success') {
                return {
                    notifications: response.data.notifications || [],
                    unread_count: response.data.unread_count || 0,
                };
            }
            return { notifications: [], unread_count: 0, error: response.data.message || 'Failed to fetch notifications' };
        } catch (error) {
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || error.message
                : 'An error occurred';
            return { notifications: [], unread_count: 0, error: errorMessage };
        }
    }, []);

    // Mark notification(s) as read
    const markNotificationRead = useCallback(async (notificationId?: string, markAll = false) => {
        try {
            const response = await axiosInstance.post('/notifications/mark-read/', {
                notification_id: notificationId,
                mark_all: markAll,
            });
            if (response.data.status === 'success') {
                return { success: true };
            }
            return { success: false, error: response.data.message || 'Failed to mark notification as read' };
        } catch (error) {
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || error.message
                : 'An error occurred';
            return { success: false, error: errorMessage };
        }
    }, []);

    // Get notification preferences
    const getNotificationPreferences = useCallback(async () => {
        try {
            const response = await axiosInstance.get('/notification-preferences/');
            if (response.data.status === 'success') {
                return {
                    preferences: response.data.preferences || {},
                    types: response.data.types || [],
                };
            }
            return { preferences: {}, types: [], error: response.data.message || 'Failed to fetch preferences' };
        } catch (error) {
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || error.message
                : 'An error occurred';
            return { preferences: {}, types: [], error: errorMessage };
        }
    }, []);

    // Update notification preferences
    const updateNotificationPreferences = useCallback(async (preferences: Record<string, boolean>) => {
        try {
            const response = await axiosInstance.post('/notification-preferences/', { preferences });
            if (response.data.status === 'success') {
                return { success: true };
            }
            return { success: false, error: response.data.message || 'Failed to update preferences' };
        } catch (error) {
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || error.message
                : 'An error occurred';
            return { success: false, error: errorMessage };
        }
    }, []);

    // Get active sessions
    const getSessions = useCallback(async () => {
        try {
            const response = await axiosInstance.get('/sessions/');
            if (response.data.status === 'success') {
                return { sessions: response.data.sessions || [] };
            }
            return { sessions: [], error: response.data.message || 'Failed to fetch sessions' };
        } catch (error) {
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || error.message
                : 'An error occurred';
            return { sessions: [], error: errorMessage };
        }
    }, []);

    // Revoke a session
    const revokeSession = useCallback(async (sessionKeyPrefix: string) => {
        try {
            const response = await axiosInstance.post('/revoke-session/', { session_key_prefix: sessionKeyPrefix });
            if (response.data.status === 'success') {
                return { success: true };
            }
            return { success: false, error: response.data.message || 'Failed to revoke session' };
        } catch (error) {
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || error.message
                : 'An error occurred';
            return { success: false, error: errorMessage };
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
        register,
        verifyEmail,
        forgotPassword,
        changePassword,
        firstLoginChangePassword,
        updateProfile,
        getSessions,
        revokeSession,
        getNotifications,
        markNotificationRead,
        getNotificationPreferences,
        updateNotificationPreferences,
    };
};

