/**
 * Custom Hook: useTickets
 * Manages ticket-related state and operations
 */

import { useState, useCallback } from 'react';
import {
  Ticket,
  CreateTicketPayload,
  UpdateTicketPayload,
  listTickets,
  getTicketDetail,
  createTicket,
  updateTicket,
  deleteTicket,
} from '../services/tickets';
import { getErrorMessage } from '../services/api';

export interface UseTicketsState {
  tickets: Ticket[];
  selectedTicket: Ticket | null;
  loading: boolean;
  error: string | null;
}

export interface UseTicketsActions {
  fetchTickets: (companyId: string) => Promise<void>;
  fetchTicketDetail: (ticketId: string) => Promise<void>;
  createNewTicket: (payload: CreateTicketPayload) => Promise<Ticket>;
  updateTicketData: (payload: UpdateTicketPayload) => Promise<Ticket>;
  deleteTicketData: (ticketId: string) => Promise<void>;
  clearError: () => void;
  clearSelection: () => void;
}

export function useTickets(): UseTicketsState & UseTicketsActions {
  const [state, setState] = useState<UseTicketsState>({
    tickets: [],
    selectedTicket: null,
    loading: false,
    error: null,
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const fetchTickets = useCallback(async (companyId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await listTickets(companyId);
      const tickets = response.tickets || response.data || [];
      setState(prev => ({ ...prev, tickets: Array.isArray(tickets) ? tickets : [] }));
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTicketDetail = useCallback(async (ticketId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTicketDetail(ticketId);
      const ticket = response.ticket || response.data;
      if (ticket) {
        setState(prev => ({ ...prev, selectedTicket: ticket }));
      }
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  const createNewTicket = useCallback(async (payload: CreateTicketPayload) => {
    try {
      setLoading(true);
      setError(null);
      const response = await createTicket(payload);
      const ticket = response.ticket || response.data;
      if (ticket) {
        setState(prev => ({
          ...prev,
          tickets: [...prev.tickets, ticket],
        }));
        return ticket;
      }
      throw new Error('Failed to create ticket');
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      setError(errorMsg);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTicketData = useCallback(async (payload: UpdateTicketPayload) => {
    try {
      setLoading(true);
      setError(null);
      const response = await updateTicket(payload);
      const ticket = response.ticket || response.data;
      if (ticket) {
        setState(prev => ({
          ...prev,
          tickets: prev.tickets.map(t => (t.id === ticket.id ? ticket : t)),
          selectedTicket: prev.selectedTicket?.id === ticket.id ? ticket : prev.selectedTicket,
        }));
        return ticket;
      }
      throw new Error('Failed to update ticket');
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      setError(errorMsg);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTicketData = useCallback(async (ticketId: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteTicket(ticketId);
      setState(prev => ({
        ...prev,
        tickets: prev.tickets.filter(t => t.id !== ticketId),
        selectedTicket: prev.selectedTicket?.id === ticketId ? null : prev.selectedTicket,
      }));
    } catch (error) {
      setError(getErrorMessage(error));
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearSelection = useCallback(() => {
    setState(prev => ({ ...prev, selectedTicket: null }));
  }, []);

  return {
    ...state,
    fetchTickets,
    fetchTicketDetail,
    createNewTicket,
    updateTicketData,
    deleteTicketData,
    clearError,
    clearSelection,
  };
}
