import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { API_PAYMENTS_BASE_URL } from '../services/api';
import { useAuth } from './useAuth';

const LOADER_DURATION = 1000;

const axiosInstance = axios.create({
    baseURL: API_PAYMENTS_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface Ticket {
    id: string;
    company: string;
    company_name?: string;
    offer?: string;
    offer_name?: string;
    ticket_code: string;
    ticket_secret: string;
    gateway_transaction_id?: string;
    payment?: string;
    ticket_type?: string;
    description?: string;
    valid_from: string;
    valid_until: string;
    is_valid: boolean;
    status: 'active' | 'used' | 'expired' | 'cancelled';
    is_used: boolean;
    used_at?: string;
    used_by?: string;
    used_by_name?: string;
    metadata?: Record<string, any>;
    created_at?: string;
    updated_at?: string;
}

interface TicketState {
    tickets: Ticket[];
    isLoading: boolean;
    error: string | null;
    successMessage: string | null;
}

interface UseTicketReturn extends TicketState {
     getTickets: () => Promise<void>;
     getTicketById: (id: string) => Promise<Ticket | null>;
     createTicket: (data: Partial<Ticket> & { valid_until: string; offer_id?: string; payment_id?: string; company_id?: string; ticket_id?: string; password?: string }) => Promise<Ticket | null>;
    bulkImportTickets: (tickets: Array<{ ticket_id: string; password: string; valid_until: string }>, offer_id?: string, company_id?: string) => Promise<{ status: string; summary: { total: number; created: number; failed: number }; tickets: any[] } | null>;
     updateTicket: (id: string, data: Partial<Ticket>) => Promise<Ticket | null>;
     deleteTicket: (id: string) => Promise<boolean>;
     validateTicket: (id: string, ticket_code: string, ticket_secret: string) => Promise<Ticket | null>;
     useTicket: (id: string, ticket_code: string, ticket_secret: string) => Promise<Ticket | null>;
     getCompanyTickets: (companyId: string, filters?: { status?: string; offer_id?: string }) => Promise<Ticket[]>;
     validateTicketFields: () => Promise<any>;
 }

export const useTicket = (): UseTicketReturn => {
     const { user } = useAuth();
     const [state, setState] = useState<TicketState>({
         tickets: [],
         isLoading: false,
         error: null,
         successMessage: null,
     });

     // Validation helper
     const validateTicketFields = useCallback(async () => {
         try {
             const response = await axiosInstance.get('/tickets/validate-fields/');
             if (response.data.status === 'success') {
                 return response.data;
             }
             return null;
         } catch (error) {
             console.error('Error validating ticket fields:', error);
             return null;
         }
     }, []);

    // Get all tickets
    const getTickets = useCallback(async () => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await axiosInstance.get('/tickets/');
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);

            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }

            if (response.data.status === 'success') {
                setState(prev => ({
                    ...prev,
                    tickets: response.data.tickets || [],
                    isLoading: false,
                }));
            } else if (response.data.status === 'error') {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Failed to fetch tickets',
                }));
            }
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to fetch tickets',
            }));
        }
    }, []);

    // Get single ticket by ID
    const getTicketById = useCallback(async (id: string): Promise<Ticket | null> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await axiosInstance.get(`/tickets/${id}/`);
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);

            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }

            if (response.data.status === 'success') {
                setState(prev => ({ ...prev, isLoading: false }));
                return response.data.ticket;
            } else if (response.data.status === 'error') {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Failed to fetch ticket',
                }));
            }
            return null;
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to fetch ticket',
            }));
            return null;
        }
    }, []);

    // Create new ticket
    const createTicket = useCallback(async (data: Partial<Ticket> & { valid_until: string; offer_id?: string; payment_id?: string; company_id?: string; ticket_id?: string; password?: string }): Promise<Ticket | null> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            // Prepare ticket data for creation
            const ticketData: any = {
                ticket_id: data.ticket_id || data.ticket_code,
                password: data.password || data.ticket_secret,
                valid_until: data.valid_until,
                offer_id: data.offer_id
            };

            // Add company_id for superusers if provided, otherwise from active company
            if (user && user.is_superuser && data.company_id) {
                ticketData.company_id = data.company_id;
            } else if (user && !user.is_superuser && user.active_company) {
                ticketData.company_id = user.active_company.id;
            }

            const response = await axiosInstance.post('/tickets/create/', ticketData);
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);

            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }

            if (response.data.status === 'success') {
                const newTicket = response.data.ticket;
                setState(prev => ({
                    ...prev,
                    tickets: [...prev.tickets, newTicket],
                    isLoading: false,
                    successMessage: response.data.message || 'Ticket created successfully',
                }));
                return newTicket;
            } else if (response.data.status === 'error') {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Failed to create ticket',
                }));
            }
            return null;
        } catch (error) {
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || error.message
                : error instanceof Error
                    ? error.message
                    : 'Failed to create ticket';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return null;
        }
    }, [user]);

    // Bulk import tickets
    const bulkImportTickets = useCallback(async (
        tickets: Array<{ ticket_id: string; password: string; valid_until: string }>,
        offer_id?: string,
        company_id?: string
    ): Promise<{ status: string; summary: { total: number; created: number; failed: number }; tickets: any[] } | null> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const bulkData: any = { tickets };

            // Add offer_id if provided
            if (offer_id) {
                bulkData.offer_id = offer_id;
            }

            // Add company_id for superusers if provided, otherwise from active company
            if (user && user.is_superuser && company_id) {
                bulkData.company_id = company_id;
            } else if (user && !user.is_superuser && user.active_company) {
                bulkData.company_id = user.active_company.id;
            }

            const response = await axiosInstance.post('/tickets/bulk-import/', bulkData);
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);

            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }

            if (response.data.status === 'success') {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    successMessage: response.data.message || 'Bulk import completed successfully',
                }));
                return response.data;
            } else if (response.data.status === 'error') {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Failed to import tickets',
                }));
            }
            return null;
        } catch (error) {
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || error.message
                : error instanceof Error
                    ? error.message
                    : 'Failed to import tickets';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return null;
        }
    }, [user]);

    // Validate ticket
    const validateTicket = useCallback(async (id: string, ticket_code: string, ticket_secret: string): Promise<Ticket | null> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await axiosInstance.post(`/tickets/${id}/validate/`, {
                ticket_code,
                ticket_secret,
            });
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);

            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }

            if (response.data.status === 'success') {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    successMessage: response.data.message || 'Ticket is valid',
                }));
                return response.data.ticket;
            } else if (response.data.status === 'error') {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Ticket validation failed',
                }));
            }
            return null;
        } catch (error) {
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || error.message
                : error instanceof Error
                    ? error.message
                    : 'Ticket validation failed';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return null;
        }
    }, []);

    // Use ticket (mark as used)
    const useTicket = useCallback(async (id: string, ticket_code: string, ticket_secret: string): Promise<Ticket | null> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await axiosInstance.post(`/tickets/${id}/use/`, {
                ticket_code,
                ticket_secret,
            });
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);

            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }

            if (response.data.status === 'success') {
                const updatedTicket = response.data.ticket;
                setState(prev => ({
                    ...prev,
                    tickets: prev.tickets.map(t => t.id === id ? updatedTicket : t),
                    isLoading: false,
                    successMessage: response.data.message || 'Ticket marked as used',
                }));
                return updatedTicket;
            } else if (response.data.status === 'error') {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Failed to use ticket',
                }));
            }
            return null;
        } catch (error) {
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || error.message
                : error instanceof Error
                    ? error.message
                    : 'Failed to use ticket';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return null;
        }
    }, []);

    // Update ticket
    const updateTicket = useCallback(async (id: string, data: Partial<Ticket>): Promise<Ticket | null> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await axiosInstance.patch(`/tickets/${id}/update/`, data);
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);

            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }

            if (response.data.status === 'success') {
                const updatedTicket = response.data.ticket;
                setState(prev => ({
                    ...prev,
                    tickets: prev.tickets.map(t => t.id === id ? updatedTicket : t),
                    isLoading: false,
                    successMessage: response.data.message || 'Ticket updated successfully',
                }));
                return updatedTicket;
            } else if (response.data.status === 'error') {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Failed to update ticket',
                }));
            }
            return null;
        } catch (error) {
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || error.message
                : error instanceof Error
                    ? error.message
                    : 'Failed to update ticket';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return null;
        }
    }, []);

    // Delete ticket
    const deleteTicket = useCallback(async (id: string): Promise<boolean> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await axiosInstance.delete(`/tickets/${id}/delete/`);
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);

            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }

            if (response.data.status === 'success') {
                setState(prev => ({
                    ...prev,
                    tickets: prev.tickets.filter(t => t.id !== id),
                    isLoading: false,
                    successMessage: response.data.message || 'Ticket deleted successfully',
                }));
                return true;
            } else if (response.data.status === 'error') {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Failed to delete ticket',
                }));
            }
            return false;
        } catch (error) {
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || error.message
                : error instanceof Error
                    ? error.message
                    : 'Failed to delete ticket';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return false;
        }
    }, []);

    // Get company tickets
    const getCompanyTickets = useCallback(async (companyId: string, filters?: { status?: string; offer_id?: string }): Promise<Ticket[]> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            let url = `/companies/${companyId}/tickets/`;
            if (filters) {
                const params = new URLSearchParams();
                if (filters.status) params.append('status', filters.status);
                if (filters.offer_id) params.append('offer_id', filters.offer_id);
                if (params.toString()) {
                    url += '?' + params.toString();
                }
            }

            const response = await axiosInstance.get(url);
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);

            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }

            if (response.data.status === 'success') {
                setState(prev => ({ ...prev, isLoading: false }));
                return response.data.tickets || [];
            } else if (response.data.status === 'error') {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Failed to fetch company tickets',
                }));
            }
            return [];
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to fetch company tickets',
            }));
            return [];
        }
    }, []);

    // Initialize - fetch data on mount
    useEffect(() => {
        getTickets();
    }, [getTickets]);

    return {
        ...state,
        getTickets,
        getTicketById,
        createTicket,
        bulkImportTickets,
        updateTicket,
        deleteTicket,
        validateTicket,
        useTicket,
        getCompanyTickets,
        validateTicketFields,
    };
    };
