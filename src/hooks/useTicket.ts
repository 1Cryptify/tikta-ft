import { useState, useCallback } from 'react';
import { endpoints, apiGet, apiPost } from '../services/api';

export interface Ticket {
  id: string;
  code: string;
  amount: number;
  status: 'pending' | 'verified' | 'used' | 'expired';
  description?: string;
  company_id?: string;
  created_at?: string;
  updated_at?: string;
}

interface TicketState {
  tickets: Ticket[];
  currentTicket: Ticket | null;
  isLoading: boolean;
  error: string | null;
}

export const useTicket = () => {
  const [state, setState] = useState<TicketState>({
    tickets: [],
    currentTicket: null,
    isLoading: false,
    error: null,
  });

  const listTickets = useCallback(async (companyId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiGet(endpoints.ticket.list(companyId));
      setState(prev => ({
        ...prev,
        tickets: response.data || response.tickets || [],
        isLoading: false,
      }));
      return { success: true, data: response.data || response.tickets };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to list tickets';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  const getTicketDetail = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiGet(endpoints.ticket.detail(id));
      setState(prev => ({
        ...prev,
        currentTicket: response.data || response.ticket,
        isLoading: false,
      }));
      return { success: true, data: response.data || response.ticket };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to get ticket details';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  const createTicket = useCallback(async (data: Partial<Ticket>) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiPost(endpoints.ticket.create, data);
      const newTicket = response.data || response.ticket;
      setState(prev => ({
        ...prev,
        tickets: [...prev.tickets, newTicket],
        isLoading: false,
      }));
      return { success: true, data: newTicket };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to create ticket';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  const verifyTicket = useCallback(async (id: string, data?: any) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiPost(endpoints.ticket.verify(id), data);
      const verifiedTicket = response.data || response.ticket;
      setState(prev => ({
        ...prev,
        tickets: prev.tickets.map(t => t.id === id ? verifiedTicket : t),
        currentTicket: prev.currentTicket?.id === id ? verifiedTicket : prev.currentTicket,
        isLoading: false,
      }));
      return { success: true, data: verifiedTicket };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to verify ticket';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  return {
    ...state,
    listTickets,
    getTicketDetail,
    createTicket,
    verifyTicket,
  };
};
