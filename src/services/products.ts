/**
 * Product Service
 * Handles all product related API calls
 */

import { apiGet, apiPost, apiDelete, endpoints, ApiResponse } from './api';

export interface Product {
  id: string;
  company: string;
  name: string;
  description: string;
  price: string;
  currency: string;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProductPayload {
  company_id: string;
  name: string;
  description: string;
  price: string;
  currency: string;
}

export interface UpdateProductPayload {
  product_id: string;
  name?: string;
  description?: string;
  price?: string;
  currency?: string;
}

/**
 * List products for a company
 */
export async function listProducts(companyId: string): Promise<ApiResponse<Product[]>> {
  try {
    return await apiGet(endpoints.products.list(companyId));
  } catch (error) {
    console.error('Failed to fetch products:', error);
    throw error;
  }
}

/**
 * Get product details
 */
export async function getProductDetail(productId: string): Promise<ApiResponse<Product>> {
  try {
    return await apiGet(endpoints.products.detail(productId));
  } catch (error) {
    console.error('Failed to fetch product details:', error);
    throw error;
  }
}

/**
 * Create a new product
 */
export async function createProduct(payload: CreateProductPayload): Promise<ApiResponse<Product>> {
  try {
    return await apiPost(endpoints.products.create, payload);
  } catch (error) {
    console.error('Failed to create product:', error);
    throw error;
  }
}

/**
 * Update product
 */
export async function updateProduct(payload: UpdateProductPayload): Promise<ApiResponse<Product>> {
  try {
    const { product_id, ...data } = payload;
    return await apiPost(endpoints.products.update(product_id), data);
  } catch (error) {
    console.error('Failed to update product:', error);
    throw error;
  }
}

/**
 * Delete product
 */
export async function deleteProduct(productId: string): Promise<ApiResponse> {
  try {
    return await apiPost(endpoints.products.delete(productId));
  } catch (error) {
    console.error('Failed to delete product:', error);
    throw error;
  }
}

/**
 * Type guard for product
 */
export function isProduct(data: any): data is Product {
  return (
    data &&
    typeof data === 'object' &&
    'id' in data &&
    'name' in data &&
    'price' in data
  );
}
