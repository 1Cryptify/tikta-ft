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
      const response = await fetch(`${API_USERS_BASE_URL}/me/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }

      const data = await response.json();

      if (data && data.id) {
        setState({
          user: data as User,
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
      const response = await fetch(`${API_USERS_BASE_URL}/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
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
      const response = await fetch(`${API_USERS_BASE_URL}/login/confirm/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Confirmation failed');
      }

      // Fetch current user data
      const userResponse = await fetch(`${API_USERS_BASE_URL}/me/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setState(prev => ({
          ...prev,
          isAuthenticated: true,
          user: userData as User,
        }));
      } else {
        setState(prev => ({
          ...prev,
          isAuthenticated: true,
          user: {
            id: email,
            email,
            is_staff: false,
            is_superuser: false,
            is_active: true,
            is_verified: true,
            is_blocked: false,
          },
        }));
      }

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
      await fetch(`${API_USERS_BASE_URL}/logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

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
      const response = await fetch(`${API_USERS_BASE_URL}/login/resend-code/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Resend failed');
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
