/**
 * API Service Configuration
 * Centralized API client for all HTTP requests
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  [key: string]: any; // Allow other response properties
}

export interface ApiError {
  status: 'error';
  message: string;
  details?: any;
}

/**
 * Generic API request handler
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options?: RequestInit,
  baseUrl: string = API_BASE_URL
): Promise<T> {
  const url = `${baseUrl}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for session auth
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options?.headers || {}),
    },
  };

  try {
    const response = await fetch(url, mergedOptions);

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!isJson) {
      throw new Error(`Expected JSON response, got ${contentType || 'unknown'}`);
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP Error: ${response.status}`);
    }

    return data as T;
  } catch (error) {
    console.error(`API Request Failed: ${endpoint}`, error);
    throw error;
  }
}

/**
 * GET Request
 */
export async function apiGet<T = any>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'GET' });
}

/**
 * POST Request
 */
export async function apiPost<T = any>(
  endpoint: string,
  data?: any
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUT Request
 */
export async function apiPut<T = any>(
  endpoint: string,
  data?: any
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PATCH Request
 */
export async function apiPatch<T = any>(
  endpoint: string,
  data?: any
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE Request
 */
export async function apiDelete<T = any>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'DELETE' });
}

/**
 * POST Form Data (for file uploads)
 */
export async function apiPostFormData<T = any>(
  endpoint: string,
  formData: FormData
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      credentials: 'include', // Include cookies
      headers: {
        // Don't set Content-Type, let browser set it with boundary
      },
    });

    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!isJson) {
      throw new Error(`Expected JSON response, got ${contentType || 'unknown'}`);
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP Error: ${response.status}`);
    }

    return data as T;
  } catch (error) {
    console.error(`API FormData Request Failed: ${endpoint}`, error);
    throw error;
  }
}

/**
 * Type-safe API endpoint builder
 */
export const endpoints = {
  // User/Auth endpoints
  auth: {
    login: '/users/login/',
    confirm: '/users/confirm/',
    logout: '/users/logout/',
    getCurrentUser: '/users/get-current-user/',
    activateUser: '/users/activate-user/',
    resendCode: '/users/resend-code-create-user/',
  },

  // Company endpoints
  companies: {
    info: (companyId: string) => `/users/company-info/?company_id=${companyId}`,
    uploadDocuments: '/users/upload-company-documents/',
    delete: (companyId: string) => `/users/delete-company/?company_id=${companyId}`,
    verify: '/users/verify-company/',
  },

  // Product endpoints
  products: {
    list: (companyId: string) => `/payments/companies/${companyId}/products/`,
    create: '/payments/products/create/',
    detail: (productId: string) => `/payments/products/${productId}/`,
    update: (productId: string) => `/payments/products/${productId}/update/`,
    delete: (productId: string) => `/payments/products/${productId}/delete/`,
  },

  // Offer endpoints
  offers: {
    list: (companyId: string) => `/payments/companies/${companyId}/offers/`,
    create: '/payments/offers/create/',
    detail: (offerId: string) => `/payments/offers/${offerId}/`,
    update: (offerId: string) => `/payments/offers/${offerId}/update/`,
    delete: (offerId: string) => `/payments/offers/${offerId}/delete/`,
  },

  // Ticket endpoints
  tickets: {
    list: (companyId: string) => `/payments/companies/${companyId}/tickets/`,
    create: '/payments/tickets/create/',
    detail: (ticketId: string) => `/payments/tickets/${ticketId}/`,
    update: (ticketId: string) => `/payments/tickets/${ticketId}/update/`,
    delete: (ticketId: string) => `/payments/tickets/${ticketId}/delete/`,
  },

  // Payment endpoints
  payments: {
    list: (companyId: string) => `/payments/companies/${companyId}/payments/`,
    initiate: '/payments/initiate/',
    verify: '/payments/verify/',
    detail: (paymentId: string) => `/payments/payments/${paymentId}/`,
    cancel: (paymentId: string) => `/payments/payments/${paymentId}/cancel/`,
  },

  // Transaction endpoints
  transactions: {
    list: '/payments/transactions/',
    detail: (transactionId: string) => `/payments/transactions/${transactionId}/`,
    company: (companyId: string) => `/payments/logs/company/${companyId}/`,
    user: (userId: string) => `/payments/logs/user/${userId}/`,
  },

  // Balance endpoints
  balance: {
    list: '/payments/balances/',
    detail: (companyId: string) => `/payments/companies/${companyId}/balances/`,
  },

  // Withdrawal endpoints
  withdrawals: {
    accounts: (companyId: string) =>
      `/payments/companies/${companyId}/withdrawal-accounts/`,
    createAccount: '/payments/withdrawal-accounts/create/',
    updateAccount: (accountId: string) =>
      `/payments/withdrawal-accounts/${accountId}/update/`,
    deleteAccount: (accountId: string) =>
      `/payments/withdrawal-accounts/${accountId}/delete/`,
    initiate: '/payments/withdrawal/initiate/',
    history: (companyId: string) => `/payments/companies/${companyId}/withdrawals/`,
  },

  // Payment API endpoints
  paymentAPIs: {
    list: '/payments/payment-apis/',
    create: '/payments/payment-apis/create/',
    detail: (apiId: string) => `/payments/payment-apis/${apiId}/`,
    update: (apiId: string) => `/payments/payment-apis/${apiId}/update/`,
    delete: (apiId: string) => `/payments/payment-apis/${apiId}/delete/`,
    logs: (apiId: string) => `/payments/payment-apis/${apiId}/logs/`,
  },

  // Currency endpoints
  currencies: {
    list: '/payments/currencies/',
    detail: (currencyId: string) => `/payments/currencies/${currencyId}/`,
  },
};

/**
 * Error handler with user-friendly messages
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Format API response for easier consumption
 */
export function formatApiResponse<T>(response: any): {
  success: boolean;
  data?: T;
  error?: string;
} {
  if (response.status === 'success') {
    // Extract the actual data from response based on common patterns
    const dataKey = Object.keys(response).find(
      (key) =>
        key !== 'status' &&
        key !== 'message' &&
        (Array.isArray(response[key]) || typeof response[key] === 'object')
    );

    return {
      success: true,
      data: dataKey ? response[dataKey] : response,
    };
  }

  return {
    success: false,
    error: response.message || 'An error occurred',
  };
}
