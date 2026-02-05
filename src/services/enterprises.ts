/**
 * Enterprise Service
 * Handles all company/enterprise related API calls
 */

import { apiGet, apiPost, apiPostFormData, apiDelete, endpoints, ApiResponse } from './api';

export interface CompanyInfo {
  id: string;
  name: string;
  nui: string;
  commerce_register: string;
  website?: string;
  logo?: string;
  is_verified: boolean;
  is_active: boolean;
  is_deleted: boolean;
  is_blocked: boolean;
  created_at: string;
  updated_at: string;
  users?: Array<{
    id: string;
    email: string;
  }>;
}

export interface CompanyDocuments {
  logo?: File;
  nui_document?: File;
  commerce_register_document?: File;
  website_document?: File;
  creation_document?: File;
}

export interface UploadDocumentsPayload extends CompanyDocuments {
  company_id: string;
  name?: string;
  website?: string;
}

/**
 * Get company information
 */
export async function getCompanyInfo(companyId: string): Promise<ApiResponse<CompanyInfo>> {
  try {
    return await apiGet(endpoints.companies.info(companyId));
  } catch (error) {
    console.error('Failed to fetch company info:', error);
    throw error;
  }
}

/**
 * Upload company documents
 */
export async function uploadCompanyDocuments(
  payload: UploadDocumentsPayload
): Promise<ApiResponse<CompanyInfo>> {
  try {
    const formData = new FormData();
    
    // Add company_id
    formData.append('company_id', payload.company_id);
    
    // Add optional string fields
    if (payload.name) {
      formData.append('name', payload.name);
    }
    if (payload.website) {
      formData.append('website', payload.website);
    }
    
    // Add files
    if (payload.logo) {
      formData.append('logo', payload.logo);
    }
    if (payload.nui_document) {
      formData.append('nui_document', payload.nui_document);
    }
    if (payload.commerce_register_document) {
      formData.append('commerce_register_document', payload.commerce_register_document);
    }
    if (payload.website_document) {
      formData.append('website_document', payload.website_document);
    }
    if (payload.creation_document) {
      formData.append('creation_document', payload.creation_document);
    }
    
    return await apiPostFormData(endpoints.companies.uploadDocuments, formData);
  } catch (error) {
    console.error('Failed to upload company documents:', error);
    throw error;
  }
}

/**
 * Delete company
 */
export async function deleteCompany(companyId: string): Promise<ApiResponse> {
  try {
    return await apiPost(endpoints.companies.delete(companyId));
  } catch (error) {
    console.error('Failed to delete company:', error);
    throw error;
  }
}

/**
 * Verify company (admin only)
 */
export async function verifyCompany(companyId: string): Promise<ApiResponse<CompanyInfo>> {
  try {
    return await apiPost(endpoints.companies.verify, { company_id: companyId });
  } catch (error) {
    console.error('Failed to verify company:', error);
    throw error;
  }
}

/**
 * Type guard for company info
 */
export function isCompanyInfo(data: any): data is CompanyInfo {
  return (
    data &&
    typeof data === 'object' &&
    'id' in data &&
    'name' in data &&
    'nui' in data &&
    'commerce_register' in data
  );
}
