import { apiPost, apiGet, endpoints, ApiResponse } from './api';

export interface Ticket {
  id: string;
  company: string;
  offer: string;
  ticket_id: string;
  password: string;
  gateway_transaction_id?: string;
  payment?: string;
  valid_from: string;
  valid_until: string;
  is_valid: boolean;
  is_used: boolean;
  used_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTicketRequest {
  offer_id: string;
  ticket_id: string;
  password: string;
  valid_from?: string;
  valid_until: string;
  is_valid?: boolean;
}

export interface VerifyTicketRequest {
  ticket_id: string;
  password: string;
}

export const ticketService = {
  list: (companyId: string) =>
    apiGet<ApiResponse<{ tickets: Ticket[] }>>(endpoints.ticket.list(companyId)),

  detail: (id: string) =>
    apiGet<ApiResponse<{ ticket: Ticket }>>(endpoints.ticket.detail(id)),

  create: (data: CreateTicketRequest) =>
    apiPost<ApiResponse<{ ticket: Ticket }>>(endpoints.ticket.create, data),

  verify: (id: string, data: VerifyTicketRequest) =>
    apiPost<ApiResponse<{ ticket: Ticket }>>(endpoints.ticket.verify(id), data),
};
