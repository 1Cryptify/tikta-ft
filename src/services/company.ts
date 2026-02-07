import { apiPost, apiGet, apiPut, apiDelete, apiPostFormData, endpoints, ApiResponse } from './api';

export interface Company {
  id: string;
  users: string[];
  name: string;
  logo?: string;
  nui?: string;
  commerce_register?: string;
  website?: string;
  nui_document?: string;
  commerce_register_document?: string;
  website_document?: string;
  creation_document?: string;
  is_verified: boolean;
  is_blocked: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCompanyRequest {
  name: string;
  nui?: string;
  commerce_register?: string;
  website?: string;
  user_ids?: string[];
}

export interface UpdateCompanyRequest {
  name?: string;
  nui?: string;
  commerce_register?: string;
  website?: string;
}

export interface UploadCompanyDocumentsRequest {
  company_id: string;
}

export interface VerifyCompanyRequest {
  company_id: string;
}

export interface CreateOwnerRequest {
  company_id: string;
  cni?: File;
  cni_video?: File;
}

export interface Owner {
  id: string;
  company: string;
  cni: string;
  cni_video: string;
  created_at: string;
  updated_at: string;
}

export const companyService = {
  list: () =>
    apiGet<ApiResponse<{ companies: Company[] }>>(endpoints.company.list),

  create: (data: CreateCompanyRequest) =>
    apiPost<ApiResponse<{ company: Company }>>(endpoints.company.create, data),

  detail: (id: string) =>
    apiGet<ApiResponse<{ company: Company }>>(endpoints.company.detail(id)),

  update: (id: string, data: UpdateCompanyRequest) =>
    apiPut<ApiResponse<{ company: Company }>>(endpoints.company.update(id), data),

  delete: (id: string) =>
    apiDelete<ApiResponse>(endpoints.company.delete(id)),

  uploadDocuments: (formData: FormData) =>
    apiPostFormData<ApiResponse>(endpoints.company.uploadDocuments, formData),

  verify: (data: VerifyCompanyRequest) =>
    apiPost<ApiResponse<{ company: Company }>>(endpoints.company.verify, data),

  createOwner: async (companyId: string, cni?: File, cniVideo?: File) => {
    const formData = new FormData();
    formData.append('company_id', companyId);
    if (cni) formData.append('cni', cni);
    if (cniVideo) formData.append('cni_video', cniVideo);
    return apiPostFormData<ApiResponse<{ owner: Owner }>>(
      endpoints.company.ownerCreate,
      formData
    );
  },

  listOwners: (companyId: string) =>
    apiGet<ApiResponse<{ owners: Owner[] }>>(endpoints.company.ownerList(companyId)),
};
