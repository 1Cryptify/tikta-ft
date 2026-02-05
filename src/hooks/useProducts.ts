/**
 * Custom Hook: useProducts
 * Manages product-related state and operations
 */

import { useState, useCallback } from 'react';
import {
  Product,
  CreateProductPayload,
  UpdateProductPayload,
  listProducts,
  getProductDetail,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../services/products';
import { getErrorMessage } from '../services/api';

export interface UseProductsState {
  products: Product[];
  selectedProduct: Product | null;
  loading: boolean;
  error: string | null;
}

export interface UseProductsActions {
  fetchProducts: (companyId: string) => Promise<void>;
  fetchProductDetail: (productId: string) => Promise<void>;
  createNewProduct: (payload: CreateProductPayload) => Promise<Product>;
  updateProductData: (payload: UpdateProductPayload) => Promise<Product>;
  deleteProductData: (productId: string) => Promise<void>;
  clearError: () => void;
  clearSelection: () => void;
}

export function useProducts(): UseProductsState & UseProductsActions {
  const [state, setState] = useState<UseProductsState>({
    products: [],
    selectedProduct: null,
    loading: false,
    error: null,
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const fetchProducts = useCallback(async (companyId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await listProducts(companyId);
      const products = response.products || response.data || [];
      setState(prev => ({ ...prev, products: Array.isArray(products) ? products : [] }));
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProductDetail = useCallback(async (productId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getProductDetail(productId);
      const product = response.product || response.data;
      if (product) {
        setState(prev => ({ ...prev, selectedProduct: product }));
      }
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  const createNewProduct = useCallback(async (payload: CreateProductPayload) => {
    try {
      setLoading(true);
      setError(null);
      const response = await createProduct(payload);
      const product = response.product || response.data;
      if (product) {
        setState(prev => ({
          ...prev,
          products: [...prev.products, product],
        }));
        return product;
      }
      throw new Error('Failed to create product');
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      setError(errorMsg);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProductData = useCallback(async (payload: UpdateProductPayload) => {
    try {
      setLoading(true);
      setError(null);
      const response = await updateProduct(payload);
      const product = response.product || response.data;
      if (product) {
        setState(prev => ({
          ...prev,
          products: prev.products.map(p => (p.id === product.id ? product : p)),
          selectedProduct: prev.selectedProduct?.id === product.id ? product : prev.selectedProduct,
        }));
        return product;
      }
      throw new Error('Failed to update product');
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      setError(errorMsg);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProductData = useCallback(async (productId: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteProduct(productId);
      setState(prev => ({
        ...prev,
        products: prev.products.filter(p => p.id !== productId),
        selectedProduct: prev.selectedProduct?.id === productId ? null : prev.selectedProduct,
      }));
    } catch (error) {
      setError(getErrorMessage(error));
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearSelection = useCallback(() => {
    setState(prev => ({ ...prev, selectedProduct: null }));
  }, []);

  return {
    ...state,
    fetchProducts,
    fetchProductDetail,
    createNewProduct,
    updateProductData,
    deleteProductData,
    clearError,
    clearSelection,
  };
}
