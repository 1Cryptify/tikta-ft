import { useState, useCallback } from 'react';
import { endpoints, apiGet, apiPost, apiPut, apiDelete } from '../services/api';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  sku?: string;
  is_active?: boolean;
  company_id?: string;
  created_at?: string;
  updated_at?: string;
}

interface ProductState {
  products: Product[];
  currentProduct: Product | null;
  isLoading: boolean;
  error: string | null;
}

export const useProduct = () => {
  const [state, setState] = useState<ProductState>({
    products: [],
    currentProduct: null,
    isLoading: false,
    error: null,
  });

  const listProducts = useCallback(async (companyId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiGet(endpoints.product.list(companyId));
      setState(prev => ({
        ...prev,
        products: response.data || response.products || [],
        isLoading: false,
      }));
      return { success: true, data: response.data || response.products };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to list products';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  const getProductDetail = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiGet(endpoints.product.detail(id));
      setState(prev => ({
        ...prev,
        currentProduct: response.data || response.product,
        isLoading: false,
      }));
      return { success: true, data: response.data || response.product };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to get product details';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  const createProduct = useCallback(async (data: Partial<Product>) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiPost(endpoints.product.create, data);
      const newProduct = response.data || response.product;
      setState(prev => ({
        ...prev,
        products: [...prev.products, newProduct],
        isLoading: false,
      }));
      return { success: true, data: newProduct };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to create product';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  const updateProduct = useCallback(async (id: string, data: Partial<Product>) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiPut(endpoints.product.update(id), data);
      const updatedProduct = response.data || response.product;
      setState(prev => ({
        ...prev,
        products: prev.products.map(p => p.id === id ? updatedProduct : p),
        currentProduct: prev.currentProduct?.id === id ? updatedProduct : prev.currentProduct,
        isLoading: false,
      }));
      return { success: true, data: updatedProduct };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to update product';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await apiDelete(endpoints.product.delete(id));
      setState(prev => ({
        ...prev,
        products: prev.products.filter(p => p.id !== id),
        currentProduct: prev.currentProduct?.id === id ? null : prev.currentProduct,
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to delete product';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  return {
    ...state,
    listProducts,
    getProductDetail,
    createProduct,
    updateProduct,
    deleteProduct,
  };
};
