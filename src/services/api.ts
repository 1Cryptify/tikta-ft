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
  // Users
  auth: {
    login: '/users/login/',
    confirmLogin: '/users/confirm-login/',
    getCurrentUser: '/users/get-current-user/',
    createUser: '/users/create-user/',
    confirmUserCreation: '/users/confirm-user-creation/',
    activateUser: '/users/activate-user/',
    resendConfirmationCode: '/users/resend-confirmation-code/',
    setActiveCompany: '/users/set-active-company/',
  },
  company: {
    list: '/users/list-companies/',
    create: '/users/create-company/',
    detail: (id: string) => `/users/company-detail/${id}/`,
    update: (id: string) => `/users/update-company/${id}/`,
    delete: (id: string) => `/users/delete-company/${id}/`,
    uploadDocuments: '/users/upload-company-documents/',
    verify: '/users/verify-company/',
    ownerCreate: '/users/owner-create/',
    ownerList: (companyId: string) => `/users/owner-list/${companyId}/`,
  },
  // Payments
  payment: {
    initiate: '/payments/initiate-payment/',
    list: '/payments/payment-list/',
    detail: (id: string) => `/payments/payment-detail/${id}/`,
    complete: (id: string) => `/payments/payment-complete/${id}/`,
    cancel: (id: string) => `/payments/payment-cancel/${id}/`,
    processPayment: (id: string) => `/payments/process-payment/${id}/`,
  },
  transaction: {
    list: '/payments/transaction-list/',
    detail: (id: string) => `/payments/transaction-detail/${id}/`,
    create: '/payments/transaction-create/',
    update: (id: string) => `/payments/transaction-update/${id}/`,
    delete: (id: string) => `/payments/transaction-delete/${id}/`,
  },
  balance: {
    list: '/payments/balance-list/',
    detail: (companyId: string) => `/payments/balance-detail/${companyId}/`,
  },
  currency: {
    list: '/payments/currency-list/',
    detail: (id: string) => `/payments/currency-detail/${id}/`,
    create: '/payments/currency-create/',
    update: (id: string) => `/payments/currency-update/${id}/`,
  },
  paymentMethod: {
    list: '/payments/payment-method-list/',
    detail: (id: string) => `/payments/payment-method-detail/${id}/`,
    create: '/payments/payment-method-create/',
    update: (id: string) => `/payments/payment-method-update/${id}/`,
    delete: (id: string) => `/payments/payment-method-delete/${id}/`,
  },
  offer: {
    list: (companyId: string) => `/payments/offer-list/${companyId}/`,
    detail: (id: string) => `/payments/offer-detail/${id}/`,
    create: '/payments/offer-create/',
    update: (id: string) => `/payments/offer-update/${id}/`,
    delete: (id: string) => `/payments/offer-delete/${id}/`,
  },
  offerGroup: {
    list: (companyId: string) => `/payments/offer-group-list/${companyId}/`,
    detail: (id: string) => `/payments/offer-group-detail/${id}/`,
    create: '/payments/offer-group-create/',
    update: (id: string) => `/payments/offer-group-update/${id}/`,
    delete: (id: string) => `/payments/offer-group-delete/${id}/`,
  },
  product: {
    list: (companyId: string) => `/payments/product-list/${companyId}/`,
    detail: (id: string) => `/payments/product-detail/${id}/`,
    create: '/payments/product-create/',
    update: (id: string) => `/payments/product-update/${id}/`,
    delete: (id: string) => `/payments/product-delete/${id}/`,
  },
  ticket: {
    list: (companyId: string) => `/payments/ticket-list/${companyId}/`,
    detail: (id: string) => `/payments/ticket-detail/${id}/`,
    create: '/payments/ticket-create/',
    verify: (id: string) => `/payments/ticket-verify/${id}/`,
  },
  withdrawalAccount: {
    list: (companyId: string) => `/payments/withdrawal-account-list/${companyId}/`,
    detail: (id: string) => `/payments/withdrawal-account-detail/${id}/`,
    create: '/payments/withdrawal-account-create/',
    update: (id: string) => `/payments/withdrawal-account-update/${id}/`,
    delete: (id: string) => `/payments/withdrawal-account-delete/${id}/`,
  },
  paymentAPI: {
    list: (companyId: string) => `/payments/payment-api-list/${companyId}/`,
    detail: (id: string) => `/payments/payment-api-detail/${id}/`,
    create: '/payments/payment-api-create/',
    update: (id: string) => `/payments/payment-api-update/${id}/`,
    revoke: (id: string) => `/payments/payment-api-revoke/${id}/`,
  },
  paymentLog: {
    list: (companyId: string) => `/payments/payment-log-list/${companyId}/`,
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
