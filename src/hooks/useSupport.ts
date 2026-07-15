import { useState, useCallback } from 'react';
import axios from 'axios';
import { API_USERS_BASE_URL } from '../services/api';

const LOADER_DURATION = 800;

const axiosInstance = axios.create({
    baseURL: API_USERS_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface SupportTicketUser {
    id: string;
    email: string;
    name: string;
}

export interface SupportTicketLastMessage {
    content: string | null;
    created_at: string | null;
    is_admin: boolean | null;
}

export interface SupportTicket {
    id: string;
    subject: string;
    status: 'open' | 'waiting_admin' | 'waiting_user' | 'resolved' | 'closed';
    created_at: string;
    updated_at: string;
    resolved_at: string | null;
    closed_at: string | null;
    user: SupportTicketUser;
    last_message: SupportTicketLastMessage | null;
    unread_count: number;
}

export interface SupportMessage {
    id: string;
    content: string;
    is_admin: boolean;
    is_read: boolean;
    sender: SupportTicketUser;
    created_at: string;
}

export interface SupportTicketDetail extends SupportTicket {
    messages: SupportMessage[];
}

interface SupportState {
    tickets: SupportTicket[];
    selectedTicket: SupportTicketDetail | null;
    unreadCount: number;
    isLoading: boolean;
    error: string | null;
}

interface UseSupportReturn extends SupportState {
    getTickets: () => Promise<void>;
    getTicketMessages: (ticketId: string) => Promise<SupportTicketDetail | null>;
    createTicket: (subject: string, message: string) => Promise<SupportTicket | null>;
    sendMessage: (ticketId: string, content: string) => Promise<SupportMessage | null>;
    closeTicket: (ticketId: string) => Promise<boolean>;
    reopenTicket: (ticketId: string) => Promise<boolean>;
    getUnreadCount: () => Promise<number>;
}

export const useSupport = (): UseSupportReturn => {
    const [state, setState] = useState<SupportState>({
        tickets: [],
        selectedTicket: null,
        unreadCount: 0,
        isLoading: false,
        error: null,
    });

    const setLoading = useCallback((loading: boolean) => {
        setState(prev => ({ ...prev, isLoading: loading, error: null }));
    }, []);

    const handleDelay = useCallback(async (startTime: number) => {
        const elapsed = Date.now() - startTime;
        const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
        if (delayNeeded > 0) {
            await new Promise(resolve => setTimeout(resolve, delayNeeded));
        }
    }, []);

    const getTickets = useCallback(async () => {
        const startTime = Date.now();
        setLoading(true);
        try {
            const response = await axiosInstance.get('/support/tickets/');
            await handleDelay(startTime);

            if (response.data.status === 'success') {
                setState(prev => ({
                    ...prev,
                    tickets: response.data.tickets || [],
                    isLoading: false,
                }));
            } else {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Failed to fetch tickets',
                }));
            }
        } catch (error: any) {
            await handleDelay(startTime);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error.response?.data?.message || 'Failed to fetch tickets',
            }));
        }
    }, [setLoading, handleDelay]);

    const getTicketMessages = useCallback(async (ticketId: string): Promise<SupportTicketDetail | null> => {
        const startTime = Date.now();
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/support/tickets/${ticketId}/messages/`);
            await handleDelay(startTime);

            if (response.data.status === 'success') {
                const ticketDetail: SupportTicketDetail = {
                    ...response.data.ticket,
                    messages: response.data.messages || [],
                };
                setState(prev => ({
                    ...prev,
                    selectedTicket: ticketDetail,
                    isLoading: false,
                }));
                return ticketDetail;
            } else {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Failed to fetch messages',
                }));
            }
        } catch (error: any) {
            await handleDelay(startTime);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error.response?.data?.message || 'Failed to fetch messages',
            }));
        }
        return null;
    }, [setLoading, handleDelay]);

    const createTicket = useCallback(async (subject: string, message: string): Promise<SupportTicket | null> => {
        const startTime = Date.now();
        setLoading(true);
        try {
            const response = await axiosInstance.post('/support/tickets/create/', { subject, message });
            await handleDelay(startTime);

            if (response.data.status === 'success') {
                const newTicket = response.data.ticket as SupportTicket;
                setState(prev => ({
                    ...prev,
                    tickets: [newTicket, ...prev.tickets],
                    isLoading: false,
                }));
                return newTicket;
            } else {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Failed to create ticket',
                }));
            }
        } catch (error: any) {
            await handleDelay(startTime);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error.response?.data?.message || 'Failed to create ticket',
            }));
        }
        return null;
    }, [setLoading, handleDelay]);

    const sendMessage = useCallback(async (ticketId: string, content: string): Promise<SupportMessage | null> => {
        const startTime = Date.now();
        setLoading(true);
        try {
            const response = await axiosInstance.post(`/support/tickets/${ticketId}/messages/create/`, { content });
            await handleDelay(startTime);

            if (response.data.status === 'success') {
                const newMessage = response.data.support_message as SupportMessage;
                setState(prev => ({
                    ...prev,
                    selectedTicket: prev.selectedTicket
                        ? { ...prev.selectedTicket, messages: [...prev.selectedTicket.messages, newMessage] }
                        : null,
                    isLoading: false,
                }));
                return newMessage;
            } else {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Failed to send message',
                }));
            }
        } catch (error: any) {
            await handleDelay(startTime);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error.response?.data?.message || 'Failed to send message',
            }));
        }
        return null;
    }, [setLoading, handleDelay]);

    const closeTicket = useCallback(async (ticketId: string): Promise<boolean> => {
        const startTime = Date.now();
        setLoading(true);
        try {
            const response = await axiosInstance.post(`/support/tickets/${ticketId}/close/`);
            await handleDelay(startTime);

            if (response.data.status === 'success') {
                setState(prev => ({
                    ...prev,
                    tickets: prev.tickets.map(t =>
                        t.id === ticketId ? { ...t, status: 'resolved' as const } : t
                    ),
                    selectedTicket: prev.selectedTicket && prev.selectedTicket.id === ticketId
                        ? { ...prev.selectedTicket, status: 'resolved' as const }
                        : prev.selectedTicket,
                    isLoading: false,
                }));
                return true;
            } else {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Failed to close ticket',
                }));
            }
        } catch (error: any) {
            await handleDelay(startTime);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error.response?.data?.message || 'Failed to close ticket',
            }));
        }
        return false;
    }, [setLoading, handleDelay]);

    const reopenTicket = useCallback(async (ticketId: string): Promise<boolean> => {
        const startTime = Date.now();
        setLoading(true);
        try {
            const response = await axiosInstance.post(`/support/tickets/${ticketId}/reopen/`);
            await handleDelay(startTime);

            if (response.data.status === 'success') {
                setState(prev => ({
                    ...prev,
                    tickets: prev.tickets.map(t =>
                        t.id === ticketId ? { ...t, status: 'open' as const } : t
                    ),
                    selectedTicket: prev.selectedTicket && prev.selectedTicket.id === ticketId
                        ? { ...prev.selectedTicket, status: 'open' as const }
                        : prev.selectedTicket,
                    isLoading: false,
                }));
                return true;
            } else {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Failed to reopen ticket',
                }));
            }
        } catch (error: any) {
            await handleDelay(startTime);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error.response?.data?.message || 'Failed to reopen ticket',
            }));
        }
        return false;
    }, [setLoading, handleDelay]);

    const getUnreadCount = useCallback(async (): Promise<number> => {
        try {
            const response = await axiosInstance.get('/support/unread-count/');
            if (response.data.status === 'success') {
                const count = response.data.unread_count || 0;
                setState(prev => ({ ...prev, unreadCount: count }));
                return count;
            }
        } catch (error: any) {
            console.error('Failed to fetch support unread count:', error);
        }
        return 0;
    }, []);

    return {
        ...state,
        getTickets,
        getTicketMessages,
        createTicket,
        sendMessage,
        closeTicket,
        reopenTicket,
        getUnreadCount,
    };
};
