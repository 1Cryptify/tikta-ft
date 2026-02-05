// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: `${API_BASE_URL}/users/login/`,
    CONFIRM: `${API_BASE_URL}/users/confirm/`,
    LOGOUT: `${API_BASE_URL}/users/logout/`,
    RESEND_CODE: `${API_BASE_URL}/users/resend-code-create-user/`,
  },
  
  // Users
  USERS: {
    CREATE: `${API_BASE_URL}/users/create-user/`,
    CONFIRM_CREATE: `${API_BASE_URL}/users/confirm-user-creation/`,
    BLOCK: `${API_BASE_URL}/users/block-user/`,
    ACTIVATE: `${API_BASE_URL}/users/activate-user/`,
  },
  
  // Companies
  COMPANIES: {
    CREATE: `${API_BASE_URL}/users/create-company/`,
    UPLOAD_DOCS: `${API_BASE_URL}/users/upload-company-documents/`,
    VERIFY: `${API_BASE_URL}/users/verify-company/`,
    DELETE: `${API_BASE_URL}/users/delete-company/`,
  },
  
  // Payments
  PAYMENTS: {
    INITIATE: `${API_BASE_URL}/payments/initiate/`,
    VERIFY: `${API_BASE_URL}/payments/verify/`,
    CANCEL: `${API_BASE_URL}/payments/cancel/`,
    LIST: `${API_BASE_URL}/payments/`,
    DETAIL: (id: string) => `${API_BASE_URL}/payments/${id}/`,
  },
};

export const apiCall = async (
  url: string,
  options: RequestInit = {}
): Promise<any> => {
  const defaultOptions: RequestInit = {
    credentials: 'include', // Include cookies for session
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, defaultOptions);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
};
