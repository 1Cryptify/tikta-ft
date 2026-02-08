/**
 * API Service Configuration
 * Centralized API client for all HTTP requests
 */

export const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000/api';

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
    // Roles: all
    login: '/users/login/',
    // Roles: all
    confirmLogin: '/users/confirm-login/',
    // Roles: all
    getCurrentUser: '/users/me/',
    // Roles: all
    createUser: '/users/create-user/',
    // Roles: all
    confirmUserCreation: '/users/confirm-user-creation/',
    // Roles: su admin, staff
    activateUser: '/users/activate-user/',
    // Roles: all
    resendConfirmationCode: '/users/resend-confirmation-code/',
    // Roles: client, staff, su admin
    setActiveCompany: '/users/set-active-company/',
  },
  company: {
    // Roles: client, staff, su admin
    list: '/users/list-companies/',
    // Roles: client, staff, su admin
    userList: '/users/list-companies/',
    // Roles: client, staff, su admin
    create: '/users/create-company/',
    // Roles: client, staff, su admin
    detail: (id: string) => `/users/company-detail/${id}/`,
    // Roles: client, staff, su admin
    update: (id: string) => `/users/update-company/${id}/`,
    // Roles: su admin, staff
    delete: (id: string) => `/users/delete-company/${id}/`,
    // Roles: client, staff, su admin
    uploadDocuments: '/users/upload-company-documents/',
    // Roles: su admin, staff
    verify: '/users/verify-company/',
    // Roles: client, staff, su admin
    ownerCreate: '/users/owner-create/',
    // Roles: client, staff, su admin
    ownerList: (companyId: string) => `/users/owner-list/${companyId}/`,
  },
  // Payments
  payment: {
    // Roles: client, staff, su admin
    initiate: '/payments/initiate-payment/',
    // Roles: client, staff, su admin
    list: '/payments/payment-list/',
    // Roles: client, staff, su admin
    detail: (id: string) => `/payments/payment-detail/${id}/`,
    // Roles: client, staff, su admin
    complete: (id: string) => `/payments/payment-complete/${id}/`,
    // Roles: client, staff, su admin
    cancel: (id: string) => `/payments/payment-cancel/${id}/`,
    // Roles: client, staff, su admin
    processPayment: (id: string) => `/payments/process-payment/${id}/`,
  },
  transaction: {
    // Roles: client, staff, su admin
    list: '/payments/transaction-list/',
    // Roles: client, staff, su admin
    detail: (id: string) => `/payments/transaction-detail/${id}/`,
    // Roles: client, staff, su admin
    create: '/payments/transaction-create/',
    // Roles: client, staff, su admin
    update: (id: string) => `/payments/transaction-update/${id}/`,
    // Roles: su admin, staff
    delete: (id: string) => `/payments/transaction-delete/${id}/`,
  },
  balance: {
    // Roles: client, staff, su admin
    list: '/payments/balance-list/',
    // Roles: client, staff, su admin
    detail: (companyId: string) => `/payments/balance-detail/${companyId}/`,
  },
  currency: {
    // Roles: all
    list: '/payments/currency-list/',
    // Roles: all
    detail: (id: string) => `/payments/currency-detail/${id}/`,
    // Roles: su admin, staff
    create: '/payments/currency-create/',
    // Roles: su admin, staff
    update: (id: string) => `/payments/currency-update/${id}/`,
  },
  paymentMethod: {
    // Roles: client, staff, su admin
    list: '/payments/payment-method-list/',
    // Roles: client, staff, su admin
    detail: (id: string) => `/payments/payment-method-detail/${id}/`,
    // Roles: client, staff, su admin
    create: '/payments/payment-method-create/',
    // Roles: client, staff, su admin
    update: (id: string) => `/payments/payment-method-update/${id}/`,
    // Roles: su admin, staff
    delete: (id: string) => `/payments/payment-method-delete/${id}/`,
  },
  offer: {
    // Roles: client, staff, su admin
    list: (companyId: string) => `/payments/offers/${companyId}/`,
    // Roles: client, staff, su admin
    detail: (id: string) => `/payments/offers/${id}/`,
    // Roles: client, staff, su admin
    create: '/payments/offers/create/', 
    // Roles: client, staff, su admin
    update: (id: string) => `/payments/offers/${id}/update/`,
    // Roles: su admin, staff
    delete: (id: string) => `/payments/offers/${id}/delete/`,

    activate : (id: string) => `/payments/offers/${id}/activate/`,
    deactivate : (id: string) => `/payments/offers/${id}/deactivate/`,
  },
  offerGroup: {
    // Roles: client, staff, su admin
    list: (companyId: string) => `/payments/offer-groups/${companyId}/`,
    // Roles: client, staff, su admin
    detail: (id: string) => `/payments/offer-groups/${id}/`,
    // Roles: client, staff, su admin
    create: '/payments/offer-groups/create/',
    // Roles: client, staff, su admin
    update: (id: string) => `/payments/offer-groups/${id}/update/`,
    // Roles: su admin, staff
    delete: (id: string) => `/payments/offer-groups/${id}/delete/`,
  },
  product: {
    // Roles: client, staff, su admin
    list: (companyId: string) => `/payments/product-list/${companyId}/`,
    // Roles: client, staff, su admin
    detail: (id: string) => `/payments/product-detail/${id}/`,
    // Roles: client, staff, su admin
    create: '/payments/product-create/',
    // Roles: client, staff, su admin
    update: (id: string) => `/payments/product-update/${id}/`,
    // Roles: su admin, staff
    delete: (id: string) => `/payments/product-delete/${id}/`,
  },
  ticket: {
    // Roles: client, staff, su admin
    list: (companyId: string) => `/payments/ticket-list/${companyId}/`,
    // Roles: client, staff, su admin
    detail: (id: string) => `/payments/ticket-detail/${id}/`,
    // Roles: client, staff, su admin
    create: '/payments/ticket-create/',
    // Roles: client, staff, su admin
    verify: (id: string) => `/payments/ticket-verify/${id}/`,
  },
  withdrawalAccount: {
    // Roles: client, staff, su admin
    list: (companyId: string) => `/payments/withdrawal-account-list/${companyId}/`,
    // Roles: client, staff, su admin
    detail: (id: string) => `/payments/withdrawal-account-detail/${id}/`,
    // Roles: client, staff, su admin
    create: '/payments/withdrawal-account-create/',
    // Roles: client, staff, su admin
    update: (id: string) => `/payments/withdrawal-account-update/${id}/`,
    // Roles: su admin, staff
    delete: (id: string) => `/payments/withdrawal-account-delete/${id}/`,
  },
  paymentAPI: {
    // Roles: client, staff, su admin
    list: (companyId: string) => `/payments/payment-api-list/${companyId}/`,
    // Roles: client, staff, su admin
    detail: (id: string) => `/payments/payment-api-detail/${id}/`,
    // Roles: client, staff, su admin
    create: '/payments/payment-api-create/',
    // Roles: client, staff, su admin
    update: (id: string) => `/payments/payment-api-update/${id}/`,
    // Roles: su admin, staff
    revoke: (id: string) => `/payments/payment-api-revoke/${id}/`,
  },
  paymentLog: {
    // Roles: client, staff, su admin
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
