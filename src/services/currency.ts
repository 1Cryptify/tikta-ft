import { apiPost, apiGet, apiPut, apiDelete, endpoints, ApiResponse } from './api';

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  value_in_usd: string;
  decimal_places: number;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  last_updated_rate?: string;
}

export interface CreateCurrencyRequest {
  code: string;
  name: string;
  symbol: string;
  value_in_usd: number;
  decimal_places?: number;
  is_active?: boolean;
  is_default?: boolean;
}

export interface UpdateCurrencyRequest {
  code?: string;
  name?: string;
  symbol?: string;
  value_in_usd?: number;
  decimal_places?: number;
  is_active?: boolean;
  is_default?: boolean;
}

export const currencyService = {
  list: () =>
    apiGet<ApiResponse<{ currencies: Currency[] }>>(endpoints.currency.list),

  detail: (id: string) =>
    apiGet<ApiResponse<{ currency: Currency }>>(endpoints.currency.detail(id)),

  create: (data: CreateCurrencyRequest) =>
    apiPost<ApiResponse<{ currency: Currency }>>(endpoints.currency.create, data),

  update: (id: string, data: UpdateCurrencyRequest) =>
    apiPut<ApiResponse<{ currency: Currency }>>(
      endpoints.currency.update(id),
      data
    ),
};
