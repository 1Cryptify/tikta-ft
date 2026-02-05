/**
 * Ticket Service
 * Handles all ticket related API calls
 */

import { apiGet, apiPost, endpoints, ApiResponse } from './api';

export interface Ticket {
  id: string;
  company: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_by: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface CreateTicketPayload {
  company_id: string;
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface UpdateTicketPayload {
  ticket_id: string;
  title?: string;
  description?: string;
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
}

/**
 * List tickets for a company
 */
export async function listTickets(companyId: string): Promise<ApiResponse<Ticket[]>> {
  try {
    return await apiGet(endpoints.tickets.list(companyId));
  } catch (error) {
    console.error('Failed to fetch tickets:', error);
    throw error;
  }
}

/**
 * Get ticket details
 */
export async function getTicketDetail(ticketId: string): Promise<ApiResponse<Ticket>> {
  try {
    return await apiGet(endpoints.tickets.detail(ticketId));
  } catch (error) {
    console.error('Failed to fetch ticket details:', error);
    throw error;
  }
}

/**
 * Create a new ticket
 */
export async function createTicket(payload: CreateTicketPayload): Promise<ApiResponse<Ticket>> {
  try {
    return await apiPost(endpoints.tickets.create, payload);
  } catch (error) {
    console.error('Failed to create ticket:', error);
    throw error;
  }
}

/**
 * Update ticket
 */
export async function updateTicket(payload: UpdateTicketPayload): Promise<ApiResponse<Ticket>> {
  try {
    const { ticket_id, ...data } = payload;
    return await apiPost(endpoints.tickets.update(ticket_id), data);
  } catch (error) {
    console.error('Failed to update ticket:', error);
    throw error;
  }
}

/**
 * Delete ticket
 */
export async function deleteTicket(ticketId: string): Promise<ApiResponse> {
  try {
    return await apiPost(endpoints.tickets.delete(ticketId));
  } catch (error) {
    console.error('Failed to delete ticket:', error);
    throw error;
  }
}

/**
 * Type guard for ticket
 */
export function isTicket(data: any): data is Ticket {
  return (
    data &&
    typeof data === 'object' &&
    'id' in data &&
    'title' in data &&
    'status' in data
  );
}

/**
 * Get status color
 */
export function getStatusColor(status: Ticket['status']): string {
  const colors: Record<Ticket['status'], string> = {
    open: '#fef3c7',
    in_progress: '#bfdbfe',
    resolved: '#d1f2e8',
    closed: '#e5e7eb',
  };
  return colors[status] || '#f3f4f6';
}

/**
 * Get status text color
 */
export function getStatusTextColor(status: Ticket['status']): string {
  const colors: Record<Ticket['status'], string> = {
    open: '#b45309',
    in_progress: '#1e40af',
    resolved: '#047857',
    closed: '#374151',
  };
  return colors[status] || '#6b7280';
}

/**
 * Get priority color
 */
export function getPriorityColor(priority: Ticket['priority']): string {
  const colors: Record<Ticket['priority'], string> = {
    low: '#d1fae5',
    medium: '#fef3c7',
    high: '#fecaca',
    urgent: '#fee2e2',
  };
  return colors[priority] || '#f3f4f6';
}

/**
 * Get priority text color
 */
export function getPriorityTextColor(priority: Ticket['priority']): string {
  const colors: Record<Ticket['priority'], string> = {
    low: '#047857',
    medium: '#b45309',
    high: '#dc2626',
    urgent: '#991b1b',
  };
  return colors[priority] || '#6b7280';
}
