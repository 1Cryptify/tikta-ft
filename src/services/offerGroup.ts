import { apiPost, apiGet, apiPut, apiDelete, endpoints, ApiResponse } from './api';
import { Offer } from './offer';

export interface OfferGroup {
  id: string;
  company: string;
  name: string;
  description?: string;
  offers: Offer[];
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateOfferGroupRequest {
  name: string;
  description?: string;
  offers?: string[];
  is_active?: boolean;
  is_featured?: boolean;
}

export interface UpdateOfferGroupRequest {
  name?: string;
  description?: string;
  offers?: string[];
  is_active?: boolean;
  is_featured?: boolean;
}

export const offerGroupService = {
  list: (companyId: string) =>
    apiGet<ApiResponse<{ offer_groups: OfferGroup[] }>>(
      endpoints.offerGroup.list(companyId)
    ),

  detail: (id: string) =>
    apiGet<ApiResponse<{ offer_group: OfferGroup }>>(
      endpoints.offerGroup.detail(id)
    ),

  create: (data: CreateOfferGroupRequest) =>
    apiPost<ApiResponse<{ offer_group: OfferGroup }>>(
      endpoints.offerGroup.create,
      data
    ),

  update: (id: string, data: UpdateOfferGroupRequest) =>
    apiPut<ApiResponse<{ offer_group: OfferGroup }>>(
      endpoints.offerGroup.update(id),
      data
    ),

  delete: (id: string) =>
    apiDelete<ApiResponse>(endpoints.offerGroup.delete(id)),
};
