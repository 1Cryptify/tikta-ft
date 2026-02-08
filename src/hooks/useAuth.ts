import { useState, useCallback, useEffect } from 'react';
import { API_USERS_BASE_URL } from '../services/api'; 

export interface User {
  id: string;
  email: string;
  is_staff: boolean;
  is_superuser: boolean;
  is_active: boolean;
  is_verified: boolean;
  is_blocked: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });

  // Check if user is already authenticated
  const checkAuth = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await apiRequest(endpoints.auth.getCurrentUser, {
        method: 'GET',
      });

      if (response.status === 'success' && response.user) {
        setState({
          user: response.user as User,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      }
      return false;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: false,
      }));
      return false;
    }
  }, []);

  // Login step 1: Send email and password
  const login = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiRequest(endpoints.auth.login, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (response.status !== 'success') {
        throw new Error(response.message || 'Login failed');
      }

      return { success: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Login failed';
      setState(prev => ({ ...prev, error: errorMsg }));
      return { success: false, error: errorMsg };
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Login step 2: Confirm with code
  const confirmLogin = useCallback(async (email: string, code: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiRequest(endpoints.auth.confirmLogin, {
        method: 'POST',
        body: JSON.stringify({ email, code }),
      });

      if (response.status !== 'success') {
        throw new Error(response.message || 'Confirmation failed');
      }

      // Fetch current user data
      // Note: You may need to add a GET /api/users/me/ endpoint
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        user: {
          id: email, // Placeholder - adjust based on actual response
          email,
          is_staff: false,
          is_superuser: false,
          is_active: true,
          is_verified: true,
          is_blocked: false,
        },
      }));

      return { success: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Confirmation failed';
      setState(prev => ({ ...prev, error: errorMsg }));
      return { success: false, error: errorMsg };
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      // TODO: Add logout endpoint to api.ts endpoints
      // await apiRequest(endpoints.auth.logout, { method: 'POST' });
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      return { success: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Logout failed';
      setState(prev => ({ ...prev, error: errorMsg }));
      return { success: false, error: errorMsg };
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Resend confirmation code
  const resendCode = useCallback(async (email: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiRequest(endpoints.auth.resendConfirmationCode, {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      if (response.status !== 'success') {
        throw new Error(response.message || 'Resend failed');
      }

      return { success: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Resend failed';
      setState(prev => ({ ...prev, error: errorMsg }));
      return { success: false, error: errorMsg };
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  return {
    ...state,
    login,
    confirmLogin,
    logout,
    resendCode,
    checkAuth,
  };
};
