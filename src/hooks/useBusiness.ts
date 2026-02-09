import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { API_USERS_BASE_URL} from '../services/api';

const axiosInstance = axios.create({
    baseURL: API_USERS_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercepteur pour gérer les FormData
axiosInstance.interceptors.request.use((config) => {
    if (config.data instanceof FormData) {
        // Supprimer Content-Type pour FormData, axios le définira automatiquement
        delete config.headers['Content-Type'];
    }
    return config;
});

export interface Business {
    id: string;
    name: string;
    nui?: string;
    commerce_register?: string;
    website?: string;
    logo?: string;
    is_active: boolean;
    is_blocked: boolean;
    is_verified: boolean;
    nui_document?: string;
    commerce_register_document?: string;
    website_document?: string;
    creation_document?: string;
    created_at?: string;
    updated_at?: string;
    status_message?: string;
    status_type?: 'positive' | 'negative';
}

export interface BusinessUser {
    user_id: string;
    email: string;
    is_verified: boolean;
    is_active: boolean;
    is_staff: boolean;
    is_blocked: boolean;
    created_at: string;
    updated_at: string;
}

export interface BusinessAssociation {
    company_id: string;
    company_name: string;
    is_verified: boolean;
    is_blocked: boolean;
    is_deleted: boolean;
    user_count: number;
    is_active_company: boolean;
    created_at: string;
    updated_at: string;
}

interface BusinessState {
    businesses: Business[];
    isLoading: boolean;
    error: string | null;
}

interface UseBusinessReturn extends BusinessState {
    getBusinesses: () => Promise<void>;
    getBusinessById: (id: string) => Promise<Business | null>;
    createBusiness: (data: Partial<Business>) => Promise<Business | null>;
    updateBusiness: (id: string, data: Partial<Business>) => Promise<Business | null>;
    deleteBusiness: (id: string) => Promise<boolean>;
    blockBusiness: (id: string, reason?: string) => Promise<boolean>;
    unblockBusiness: (id: string) => Promise<boolean>;
    markActiveCompany: (id: string) => Promise<boolean>;
    uploadDocuments: (id: string, documents: FormData) => Promise<boolean>;
    uploadLogo: (id: string, file: File) => Promise<boolean>;
    getUsers: () => Promise<any[]>;
    getDocumentPreviewUrl: (documentPath: string) => string;
    associateUserToBusiness: (userId: string, companyId: string) => Promise<boolean>;
    disassociateUserFromBusiness: (userId: string, companyId: string) => Promise<boolean>;
    listUserBusinessAssociations: () => Promise<BusinessAssociation[]>;
    listBusinessUsers: (companyId: string) => Promise<BusinessUser[]>;
}

export const useBusiness = (): UseBusinessReturn => {
    const [state, setState] = useState<BusinessState>({
        businesses: [],
        isLoading: false,
        error: null,
    });

    // Get all businesses for current company
    const getBusinesses = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.get('/list-companies/');
            if (response.data.status === 'success') {
                setState(prev => ({
                    ...prev,
                    businesses: response.data.companies || [],
                    isLoading: false,
                }));
            }
        } catch (error) {
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || 'Failed to fetch businesses'
                : 'An error occurred';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
        }
    }, []);

    // Get single business by ID
    const getBusinessById = useCallback(async (id: string): Promise<Business | null> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.get(`/${id}/`);
            if (response.data.status === 'success') {
                setState(prev => ({ ...prev, isLoading: false }));
                return response.data.company;
            }
            return null;
        } catch (error) {
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || 'Failed to fetch business'
                : 'An error occurred';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return null;
        }
    }, []);

    // Create new business
    const createBusiness = useCallback(async (data: Partial<Business>): Promise<Business | null> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.post('/create/', data);
            if (response.data.status === 'success') {
                const newBusiness = response.data.company;
                setState(prev => ({
                    ...prev,
                    businesses: [...prev.businesses, newBusiness],
                    isLoading: false,
                }));
                return newBusiness;
            }
            return null;
        } catch (error) {
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || 'Failed to create business'
                : 'An error occurred';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return null;
        }
    }, []);

    // Update business
    const updateBusiness = useCallback(async (id: string, data: Partial<Business>): Promise<Business | null> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.post(`/${id}/update/`, data);
            if (response.data.status === 'success') {
                const updatedBusiness = response.data.company;
                setState(prev => ({
                    ...prev,
                    businesses: prev.businesses.map(b => b.id === id ? updatedBusiness : b),
                    isLoading: false,
                }));
                return updatedBusiness;
            }
            return null;
        } catch (error) {
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || 'Failed to update business'
                : 'An error occurred';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return null;
        }
    }, []);

    // Delete business
    const deleteBusiness = useCallback(async (id: string): Promise<boolean> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.delete(`/${id}/delete/`);
            if (response.data.status === 'success') {
                setState(prev => ({
                    ...prev,
                    businesses: prev.businesses.filter(b => b.id !== id),
                    isLoading: false,
                }));
                return true;
            }
            return false;
        } catch (error) {
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || 'Failed to delete business'
                : 'An error occurred';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return false;
        }
    }, []);

    // Block business
    const blockBusiness = useCallback(async (id: string, reason?: string): Promise<boolean> => {
        setState(prev => ({
            ...prev,
            businesses: prev.businesses.map(b => b.id === id ? { ...b, is_blocked: true } : b),
        }));
        try {
            await axiosInstance.post('/block-company/', { company_id: id, is_blocked: true, reason });
            return true;
        } catch (error) {
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || 'Failed to block business'
                : 'An error occurred';
            setState(prev => ({
                ...prev,
                error: errorMessage,
            }));
            return false;
        }
    }, []);

    // Unblock business
    const unblockBusiness = useCallback(async (id: string): Promise<boolean> => {
        setState(prev => ({
            ...prev,
            businesses: prev.businesses.map(b => b.id === id ? { ...b, is_blocked: false } : b),
        }));
        try {
            await axiosInstance.post('/block-company/', { company_id: id, is_blocked: false });
            return true;
        } catch (error) {
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || 'Failed to unblock business'
                : 'An error occurred';
            setState(prev => ({
                ...prev,
                error: errorMessage,
            }));
            return false;
        }
    }, []);

    // Mark company as active
    const markActiveCompany = useCallback(async (id: string): Promise<boolean> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.post('/set-active-company/', { company_id: id });
            if (response.data.status === 'success') {
                setState(prev => ({ ...prev, isLoading: false }));
                return true;
            }
            return false;
        } catch (error) {
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || 'Failed to set active company'
                : 'An error occurred';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return false;
        }
    }, []);

    // Upload business documents
    const uploadDocuments = useCallback(async (id: string, documents: FormData): Promise<boolean> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            documents.append('company_id', id);
            const response = await axiosInstance.post('/upload-documents/', documents);
            if (response.data.status === 'success') {
                const updatedBusiness = response.data.company;
                setState(prev => ({
                    ...prev,
                    businesses: prev.businesses.map(b => b.id === id ? updatedBusiness : b),
                    isLoading: false,
                }));
                return true;
            } else if (response.data.status === 'error') {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Failed to upload documents',
                }));
                return false;
            }
            return false;
        } catch (error) {
            let errorMessage = 'Failed to upload documents';
            if (error instanceof axios.AxiosError) {
                errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || errorMessage;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return false;
        }
    }, []);

    // Upload business logo
    const uploadLogo = useCallback(async (id: string, file: File): Promise<boolean> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const formData = new FormData();
            formData.append('company_id', id);
            formData.append('logo', file);

            const response = await axiosInstance.post('/upload-documents/', formData);
            if (response.data.status === 'success') {
                const updatedBusiness = response.data.company;
                setState(prev => ({
                    ...prev,
                    businesses: prev.businesses.map(b => b.id === id ? updatedBusiness : b),
                    isLoading: false,
                }));
                return true;
            } else if (response.data.status === 'error') {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Failed to upload logo',
                }));
                return false;
            }
            return false;
        } catch (error) {
            let errorMessage = 'Failed to upload logo';
            if (error instanceof axios.AxiosError) {
                errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || errorMessage;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return false;
        }
        }, []);

    // Get all users list
    const getUsers = useCallback(async (): Promise<any[]> => {
       try {
           const response = await axiosInstance.get('/list-users/');
           if (response.data.status === 'success') {
               return response.data.users || [];
           }
           return [];
       } catch (error) {
           const errorMessage = error instanceof axios.AxiosError
               ? error.response?.data?.message || 'Failed to fetch users'
               : 'An error occurred';
           console.error('Error fetching users:', errorMessage);
           return [];
       }
    }, []);

    // Retourne l'URL du document (le backend retourne déjà des URLs complètes /media/...)
    const getDocumentPreviewUrl = useCallback((documentUrl: string): string => {
       if (!documentUrl) return '';
       // Si c'est déjà une URL complète (http://...), la retourner telle quelle
       if (documentUrl.startsWith('http')) {
           return documentUrl;
       }
       // Si c'est un chemin /media/, ajouter le domaine
       if (documentUrl.startsWith('/media/')) {
           const API_BASE_URL = API_USERS_BASE_URL.split('/api/users')[0]; // http://localhost:8000
           return API_BASE_URL + documentUrl;
       }
       // Sinon retourner tel quel (chemin relatif costumer_doc/...)
       return documentUrl;
    }, []);

     // Associate user to business
     const associateUserToBusiness = useCallback(async (userId: string, companyId: string): Promise<boolean> => {
         setState(prev => ({ ...prev, isLoading: true, error: null }));
         try {
             const response = await axiosInstance.post('/associate-user-business/', {
                 user_id: userId,
                 company_id: companyId
             });
             if (response.data.status === 'success') {
                 setState(prev => ({ ...prev, isLoading: false }));
                 return true;
             }
             return false;
         } catch (error) {
             const errorMessage = error instanceof axios.AxiosError
                 ? error.response?.data?.message || 'Failed to associate user to business'
                 : 'An error occurred';
             setState(prev => ({
                 ...prev,
                 isLoading: false,
                 error: errorMessage,
             }));
             return false;
         }
     }, []);

     // Disassociate user from business
     const disassociateUserFromBusiness = useCallback(async (userId: string, companyId: string): Promise<boolean> => {
         setState(prev => ({ ...prev, isLoading: true, error: null }));
         try {
             const response = await axiosInstance.post('/disassociate-user-business/', {
                 user_id: userId,
                 company_id: companyId
             });
             if (response.data.status === 'success') {
                 setState(prev => ({ ...prev, isLoading: false }));
                 return true;
             }
             return false;
         } catch (error) {
             const errorMessage = error instanceof axios.AxiosError
                 ? error.response?.data?.message || 'Failed to disassociate user from business'
                 : 'An error occurred';
             setState(prev => ({
                 ...prev,
                 isLoading: false,
                 error: errorMessage,
             }));
             return false;
         }
     }, []);

     // List user business associations
     const listUserBusinessAssociations = useCallback(async (): Promise<BusinessAssociation[]> => {
         setState(prev => ({ ...prev, isLoading: true, error: null }));
         try {
             const response = await axiosInstance.get('/list-user-business-associations/');
             if (response.data.status === 'success') {
                 setState(prev => ({ ...prev, isLoading: false }));
                 return response.data.associations || [];
             }
             return [];
         } catch (error) {
             const errorMessage = error instanceof axios.AxiosError
                 ? error.response?.data?.message || 'Failed to fetch business associations'
                 : 'An error occurred';
             setState(prev => ({
                 ...prev,
                 isLoading: false,
                 error: errorMessage,
             }));
             return [];
         }
     }, []);

     // List business users
     const listBusinessUsers = useCallback(async (companyId: string): Promise<BusinessUser[]> => {
         setState(prev => ({ ...prev, isLoading: true, error: null }));
         try {
             const response = await axiosInstance.get(`/list-business-users/?company_id=${companyId}`);
             if (response.data.status === 'success') {
                 setState(prev => ({ ...prev, isLoading: false }));
                 return response.data.users || [];
             }
             return [];
         } catch (error) {
             const errorMessage = error instanceof axios.AxiosError
                 ? error.response?.data?.message || 'Failed to fetch business users'
                 : 'An error occurred';
             setState(prev => ({
                 ...prev,
                 isLoading: false,
                 error: errorMessage,
             }));
             return [];
         }
     }, []);

     // Initialize - fetch businesses on mount
     useEffect(() => {
         getBusinesses();
     }, [getBusinesses]);

     return {
         ...state,
         getBusinesses,
         getBusinessById,
         createBusiness,
         updateBusiness,
         deleteBusiness,
         blockBusiness,
         unblockBusiness,
         markActiveCompany,
         uploadDocuments,
         uploadLogo,
         getUsers,
         getDocumentPreviewUrl,
         associateUserToBusiness,
         disassociateUserFromBusiness,
         listUserBusinessAssociations,
         listBusinessUsers,
     };
     };
