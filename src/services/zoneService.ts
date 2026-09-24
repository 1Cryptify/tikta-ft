import axios from 'axios';
import { API_ZONES_BASE_URL } from './api';

const api = axios.create({ baseURL: API_ZONES_BASE_URL, withCredentials: true });

export interface Zone {
  id: string;
  company_id: string;
  company_name: string;
  name: string;
  description: string;
  color: string;
  center_lat: string;
  center_lng: string;
  radius_m: number;
  area_sqm: string;
  is_closed: boolean;
  is_active: boolean;
  total_generated: string;
  associate_balance: string;
  created_at: string;
  updated_at: string;
  polygon: [number, number][];
}

export interface ZoneRouter {
  id: string;
  zone_id: string;
  name: string;
  mac_address: string;
  serial_number: string;
  model: string;
  ip_address: string | null;
  status: string;
  is_active: boolean;
  created_at: string;
}

export interface ZoneManager {
  id: string;
  zone_id: string;
  zone_name: string;
  company_id: string;
  email: string;
  user_id: string | null;
  has_account: boolean;
  percentage: number;
  status: string;
  status_display: string;
  created_at: string;
  confirmed_at: string | null;
}

export interface ZoneWithdrawal {
  id: string;
  zone_id: string;
  zone_name: string;
  company_id: string;
  company_name: string;
  manager_id: string | null;
  manager_email: string | null;
  requested_by: string | null;
  amount: string;
  currency_code: string;
  associate_percentage: number;
  associate_amount: string;
  company_amount: string;
  fee_percentage: string;
  fee_amount: string;
  recipient_number: string;
  provider: string;
  payout_reference: string;
  status: string;
  status_display: string;
  approved_by_company: string | null;
  approved_by: string | null;
  company_approved_at: string | null;
  approved_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface ZonePayment {
  payment_id: string;
  amount: string;
  currency: string;
  status: string;
  description: string;
  customer_email: string;
  customer_phone: string;
  completed_at: string | null;
}

export interface ZoneDetail extends Zone {
  routers: ZoneRouter[];
  managers: ZoneManager[];
  withdrawals: ZoneWithdrawal[];
}

export interface ZonePaymentsData {
  payments: ZonePayment[];
  summary: { total_amount: string; total_payments: number };
  kpi: {
    total_generated: string;
    associate_balance: string;
    area_sqm: string;
    routers_count: number;
  };
}

export interface MyZoneItem extends ZoneManager {
  zone_color: string;
  total_generated: string;
  associate_balance: string;
  company_name: string;
  currency_code: string;
}

const handle = <T>(res: { data: T }, fallback: T): T => {
  const d = res.data as any;
  if (d && d.status === 'success') return res.data;
  throw new Error((d && d.message) || 'Erreur serveur');
};

export const zonesApi = {
  async list(company_id?: string): Promise<Zone[]> {
    const res = await api.get('/zones/', { params: company_id ? { company_id } : {} });
    return handle(res, [] as any).zones || [];
  },

  async myZones(): Promise<{ zones: MyZoneItem[]; pending_confirmations: any[] }> {
    const res = await api.get('/my-zones/');
    const d = handle(res, {} as any);
    return { zones: d.zones || [], pending_confirmations: d.pending_confirmations || [] };
  },

  async create(data: {
    name: string;
    description?: string;
    color: string;
    polygon: [number, number][];
    center_lat?: number;
    center_lng?: number;
    radius_m?: number;
    is_closed?: boolean;
    company_id?: string;
  }): Promise<Zone> {
    const res = await api.post('/zones/create/', data);
    return handle(res, {} as any).zone;
  },

  async detail(id: string): Promise<ZoneDetail> {
    const res = await api.get(`/zones/${id}/`);
    return handle(res, {} as any).zone;
  },

  async update(id: string, data: Partial<Omit<Zone, 'id'>>): Promise<Zone> {
    const res = await api.post(`/zones/${id}/update/`, data);
    return handle(res, {} as any).zone;
  },

  async close(id: string): Promise<Zone> {
    const res = await api.post(`/zones/${id}/close/`);
    return handle(res, {} as any).zone;
  },

  async toggle(id: string): Promise<Zone> {
    const res = await api.post(`/zones/${id}/toggle/`);
    return handle(res, {} as any).zone;
  },

  async delete(id: string): Promise<void> {
    const res = await api.delete(`/zones/${id}/delete/`);
    handle(res, {} as any);
  },

  async payments(id: string): Promise<ZonePaymentsData> {
    const res = await api.get(`/zones/${id}/payments/`);
    const d = handle(res, {} as any);
    return { payments: d.payments || [], summary: d.summary, kpi: d.kpi };
  },

  async report(id: string): Promise<any> {
    const res = await api.get(`/zones/${id}/report/`);
    return handle(res, {} as any).report;
  },

  // Routeurs
  async addRouter(zoneId: string, data: Partial<ZoneRouter>): Promise<ZoneRouter> {
    const res = await api.post(`/zones/${zoneId}/routers/`, data);
    return handle(res, {} as any).router;
  },

  async updateRouter(routerId: string, data: Partial<ZoneRouter>): Promise<ZoneRouter> {
    const res = await api.post(`/routers/${routerId}/update/`, data);
    return handle(res, {} as any).router;
  },

  async deleteRouter(routerId: string): Promise<void> {
    const res = await api.delete(`/routers/${routerId}/delete/`);
    handle(res, {} as any);
  },

  // Associés
  async addManager(zoneId: string, data: { email: string; percentage?: number; initial_password?: string }): Promise<ZoneManager> {
    const res = await api.post(`/zones/${zoneId}/managers/`, data);
    return handle(res, {} as any).manager;
  },

  async updateManager(managerId: string, data: { percentage?: number; status?: 'active' | 'pending' | 'removed' }): Promise<ZoneManager> {
    const res = await api.post(`/managers/${managerId}/update/`, data);
    return handle(res, {} as any).manager;
  },

  async deleteManager(managerId: string): Promise<void> {
    const res = await api.delete(`/managers/${managerId}/delete/`);
    handle(res, {} as any);
  },

  async confirmManager(managerId: string): Promise<ZoneManager> {
    const res = await api.post(`/managers/${managerId}/confirm/`);
    return handle(res, {} as any).manager;
  },

  // Retraits
  async withdrawals(status?: string): Promise<ZoneWithdrawal[]> {
    const res = await api.get('/zone-withdrawals/', { params: status ? { status } : {} });
    return handle(res, {} as any).withdrawals || [];
  },

  async createWithdrawal(data: {
    zone_id: string;
    amount: number;
    currency?: string;
    recipient_number: string;
    provider?: string;
  }): Promise<ZoneWithdrawal> {
    const res = await api.post('/zone-withdrawals/create/', data);
    return handle(res, {} as any).withdrawal;
  },

  async companyApprove(withdrawalId: string, associate_percentage: number): Promise<ZoneWithdrawal> {
    const res = await api.post(`/zone-withdrawals/${withdrawalId}/company-approve/`, { associate_percentage });
    return handle(res, {} as any).withdrawal;
  },

  async adminApprove(withdrawalId: string, fee_percentage?: number): Promise<ZoneWithdrawal> {
    const res = await api.post(`/zone-withdrawals/${withdrawalId}/admin-approve/`, { fee_percentage });
    return handle(res, {} as any).withdrawal;
  },

  async rejectWithdrawal(withdrawalId: string): Promise<ZoneWithdrawal> {
    const res = await api.post(`/zone-withdrawals/${withdrawalId}/reject/`);
    return handle(res, {} as any).withdrawal;
  },
};