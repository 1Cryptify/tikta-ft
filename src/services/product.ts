import { apiPost, apiGet, apiPut, apiDelete, endpoints, ApiResponse } from './api';

export interface Product {
  id: string;
  company: string;
  name: string;
  description?: string;
  price: string;
  currency: string;
  category?: string;
  tags?: string[];
  is_active: boolean;
  is_featured: boolean;
  stock_quantity: number;
  weight?: string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  images?: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  currency: string;
  category?: string;
  tags?: string[];
  is_active?: boolean;
  is_featured?: boolean;
  stock_quantity?: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  images?: string[];
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  currency?: string;
  category?: string;
  tags?: string[];
  is_active?: boolean;
  is_featured?: boolean;
  stock_quantity?: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  images?: string[];
}

export const productService = {
  list: (companyId: string) =>
    apiGet<ApiResponse<{ products: Product[] }>>(endpoints.product.list(companyId)),

  detail: (id: string) =>
    apiGet<ApiResponse<{ product: Product }>>(endpoints.product.detail(id)),

  create: (data: CreateProductRequest) =>
    apiPost<ApiResponse<{ product: Product }>>(endpoints.product.create, data),

  update: (id: string, data: UpdateProductRequest) =>
    apiPut<ApiResponse<{ product: Product }>>(endpoints.product.update(id), data),

  delete: (id: string) =>
    apiDelete<ApiResponse>(endpoints.product.delete(id)),
};
