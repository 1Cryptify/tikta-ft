import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
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
    timeout: 60000,
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

export interface LoginResult {
    success: boolean;
    requiresVerification?: boolean;
    notVerified?: boolean;
    mustChangePassword?: boolean;
    error?: string;
}

interface UseAuthReturn extends AuthState {
    login: (email: string, password: string) => Promise<LoginResult>;
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

const AuthContext = createContext<UseAuthReturn | null>(null);

const waitForLoader = async (startTime: number) => {
    const elapsed = Date.now() - startTime;
    const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
    if (delayNeeded > 0) {
        await new Promise(resolve => setTimeout(resolve, delayNeeded));
    }
};

const extractErrorMessage = (error: unknown, fallback: string): string => {
    if (error instanceof axios.AxiosError) {
        return error.response?.data?.message || error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return fallback;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        // Start in loading state so a page reload does not briefly render the
        // disconnected UI (login redirect) before /me/ resolves.
        isLoading: true,
        error: null,
    });

    // Get current authenticated user
    const getCurrentUser = useCallback(async () => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.get('/me/');
            await waitForLoader(startTime);

            if (response.data.status === 'success') {
                setState(prev => ({
                    ...prev,
                    user: response.data.user,
                    isAuthenticated: true,
                    isLoading: false,
                }));
            } else {
                setState(prev => ({
                    ...prev,
                    user: null,
                    isAuthenticated: false,
                    isLoading: false,
                }));
            }
        } catch (error) {
            await waitForLoader(startTime);
            // A 401 here simply means "not logged in" — it is not an application
            // error, so we must not surface a global error message for it.
            const status = error instanceof axios.AxiosError ? error.response?.status : undefined;
            setState(prev => ({
                ...prev,
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: status === 401 ? null : extractErrorMessage(error, 'Failed to fetch user'),
            }));
        }
    }, []);

    // Login with email and password
    const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.post('/login/', { email, password });

            if (response.data.status === 'error') {
                const errorMessage = response.data.message || 'Login failed';
                setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
                return { success: false, error: errorMessage };
            }

            if (response.data.status === 'not_verified') {
                const errorMessage = response.data.message || 'Please verify your email to activate your account.';
                setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
                return { success: false, notVerified: true, requiresVerification: true, error: errorMessage };
            }

            // Email verified recently: server logged us in, no code required.
            if (response.data.status === 'success' && response.data.logged_in) {
                await getCurrentUser();
                return { success: true, mustChangePassword: response.data.must_change_password === true };
            }

            // Active account outside the trust window: a single code is required.
            if (response.data.status === 'verification_required') {
                setState(prev => ({ ...prev, isLoading: false, error: null }));
                return { success: false, requiresVerification: true };
            }

            if (response.data.status === 'success') {
                setState(prev => ({ ...prev, isLoading: false, error: null }));
                return { success: false, requiresVerification: true };
            }
            return { success: false, error: 'Unknown response' };
        } catch (error) {
            const errorMessage = extractErrorMessage(error, 'An error occurred during login');
            setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
            return { success: false, error: errorMessage };
        }
    }, [getCurrentUser]);

    // Confirm login with email and confirmation code
    const confirmLogin = useCallback(async (email: string, code: string) => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.post('/confirm/', { email, code });
            await waitForLoader(startTime);

            if (response.data.status === 'error') {
                const errorMessage = response.data.message;
                setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
                return { success: false, error: errorMessage };
            }

            if (response.data.status === 'success') {
                // The session cookie is set by the server on this response. Refresh
                // the auth state so the whole app sees the authenticated user.
                await getCurrentUser();
                return { success: true, mustChangePassword: response.data.must_change_password === true };
            }
            return { success: false, error: 'Unknown response' };
        } catch (error) {
            await waitForLoader(startTime);
            const errorMessage = extractErrorMessage(error, 'An error occurred');
            setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
            return { success: false, error: errorMessage };
        }
    }, [getCurrentUser]);

    // Logout user
    const logout = useCallback(async () => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            await axiosInstance.post('/logout/');
            await waitForLoader(startTime);
            setState({ user: null, isAuthenticated: false, isLoading: false, error: null });
        } catch (error) {
            await waitForLoader(startTime);
            const errorMessage = extractErrorMessage(error, 'Logout failed');
            setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
        }
    }, []);

    // Resend confirmation code
    const resendCode = useCallback(async (email: string) => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.post('/resend-code/', { email });
            await waitForLoader(startTime);

            if (response.data.status === 'error') {
                const errorMessage = response.data.message || 'Failed to resend code';
                setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
                return { success: false, error: errorMessage };
            }

            if (response.data.status === 'success') {
                setState(prev => ({ ...prev, isLoading: false, error: null }));
                return { success: true };
            }
            return { success: false, error: 'Unknown response' };
        } catch (error) {
            await waitForLoader(startTime);
            const errorMessage = extractErrorMessage(error, 'An error occurred');
            setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
            return { success: false, error: errorMessage };
        }
    }, []);

    // Set active company for user
    const setActiveCompany = useCallback(async (companyId: string): Promise<Company> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.post('/set-active-company/', { company_id: companyId });
            await waitForLoader(startTime);

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
            await waitForLoader(startTime);
            const errorMessage = extractErrorMessage(error, 'An error occurred');
            setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
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
            const errorMessage = extractErrorMessage(error, 'An error occurred');
            setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
            return { success: false, error: errorMessage };
        }
    }, []);

    // Verify email
    const verifyEmail = useCallback(async (email: string, code: string) => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.post('/verify-email/', { email, code });
            if (response.data.status === 'error') {
                const errorMessage = response.data.message || 'Verification failed';
                setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
                return { success: false, error: errorMessage };
            }
            // The server now logs the user in as part of the verification step.
            await getCurrentUser();
            return { success: true, mustChangePassword: response.data.must_change_password === true };
        } catch (error) {
            const errorMessage = extractErrorMessage(error, 'An error occurred');
            setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
            return { success: false, error: errorMessage };
        }
    }, [getCurrentUser]);

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
            const errorMessage = extractErrorMessage(error, 'An error occurred');
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
            const errorMessage = extractErrorMessage(error, 'An error occurred');
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
            const errorMessage = extractErrorMessage(error, 'An error occurred');
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
            const errorMessage = extractErrorMessage(error, 'An error occurred');
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
            return { notifications: [], unread_count: 0, error: extractErrorMessage(error, 'An error occurred') };
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
            return { success: false, error: extractErrorMessage(error, 'An error occurred') };
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
            return { preferences: {}, types: [], error: extractErrorMessage(error, 'An error occurred') };
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
            return { success: false, error: extractErrorMessage(error, 'An error occurred') };
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
            return { sessions: [], error: extractErrorMessage(error, 'An error occurred') };
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
            return { success: false, error: extractErrorMessage(error, 'An error occurred') };
        }
    }, []);

    // Initialize auth state on mount (once, shared across the whole app)
    useEffect(() => {
        getCurrentUser();
    }, [getCurrentUser]);

    const value: UseAuthReturn = {
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

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): UseAuthReturn => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
