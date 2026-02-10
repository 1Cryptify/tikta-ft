import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { API_PAYMENTS_BASE_URL } from '../services/api';

// Délai minimum du loader en millisecondes
const LOADER_DURATION = 1000;

const axiosInstance = axios.create({
    baseURL: API_PAYMENTS_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface Product {
    id: string;
    company_id: string;
    name: string;
    description?: string;
    price: number;
    currency_id?: string;
    currency_code?: string;
    is_active: boolean;
    is_deleted: boolean;
    created_at?: string;
    updated_at?: string;
}

interface ProductState {
    products: Product[];
    isLoading: boolean;
    error: string | null;
}

interface UseProductReturn extends ProductState {
    getProducts: () => Promise<void>;
    getProductById: (id: string) => Promise<Product | null>;
    createProduct: (data: Partial<Product>) => Promise<Product | null>;
    updateProduct: (id: string, data: Partial<Product>) => Promise<Product | null>;
    deleteProduct: (id: string) => Promise<boolean>;
    activateProduct: (id: string) => Promise<boolean>;
    deactivateProduct: (id: string) => Promise<boolean>;
    getCompanyProducts: (companyId: string) => Promise<Product[]>;
}

export const useProduct = (): UseProductReturn => {
    const [state, setState] = useState<ProductState>({
        products: [],
        isLoading: false,
        error: null,
    });

    // Get all products
    const getProducts = useCallback(async () => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.get('/products/');
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
            
            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }
            
            if (response.data.status === 'success') {
                setState(prev => ({
                    ...prev,
                    products: response.data.products || [],
                    isLoading: false,
                }));
            }
        } catch (error) {
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
            
            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }
            
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || 'Failed to fetch products'
                : 'An error occurred';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
        }
    }, []);

    // Get single product by ID
    const getProductById = useCallback(async (id: string): Promise<Product | null> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.get(`/products/${id}/`);
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
            
            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }
            
            if (response.data.status === 'success') {
                setState(prev => ({ ...prev, isLoading: false }));
                return response.data.product;
            }
            return null;
        } catch (error) {
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
            
            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }
            
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || 'Failed to fetch product'
                : 'An error occurred';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return null;
        }
    }, []);

    // Create new product
    const createProduct = useCallback(async (data: Partial<Product>): Promise<Product | null> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.post('/products/create/', data);
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
            
            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }
            
            if (response.data.status === 'success') {
                const newProduct = response.data.product;
                setState(prev => ({
                    ...prev,
                    products: [...prev.products, newProduct],
                    isLoading: false,
                }));
                return newProduct;
            }
            return null;
        } catch (error) {
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
            
            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }
            
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || 'Failed to create product'
                : 'An error occurred';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return null;
        }
    }, []);

    // Update product
    const updateProduct = useCallback(async (id: string, data: Partial<Product>): Promise<Product | null> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.post(`/products/${id}/update/`, data);
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
            
            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }
            
            if (response.data.status === 'success') {
                const updatedProduct = response.data.product;
                setState(prev => ({
                    ...prev,
                    products: prev.products.map(p => p.id === id ? updatedProduct : p),
                    isLoading: false,
                }));
                return updatedProduct;
            }
            return null;
        } catch (error) {
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
            
            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }
            
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || 'Failed to update product'
                : 'An error occurred';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return null;
        }
    }, []);

    // Delete product
    const deleteProduct = useCallback(async (id: string): Promise<boolean> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.post(`/products/${id}/delete/`);
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
            
            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }
            
            if (response.data.status === 'success') {
                setState(prev => ({
                    ...prev,
                    products: prev.products.filter(p => p.id !== id),
                    isLoading: false,
                }));
                return true;
            }
            return false;
        } catch (error) {
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
            
            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }
            
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || 'Failed to delete product'
                : 'An error occurred';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return false;
        }
    }, []);

    // Activate product
    const activateProduct = useCallback(async (id: string): Promise<boolean> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.post(`/products/${id}/activate/`);
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
            
            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }
            
            if (response.data.status === 'success') {
                const updatedProduct = response.data.product;
                setState(prev => ({
                    ...prev,
                    products: prev.products.map(p => p.id === id ? updatedProduct : p),
                    isLoading: false,
                }));
                return true;
            }
            return false;
        } catch (error) {
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
            
            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }
            
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || 'Failed to activate product'
                : 'An error occurred';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return false;
        }
    }, []);

    // Deactivate product
    const deactivateProduct = useCallback(async (id: string): Promise<boolean> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.post(`/products/${id}/deactivate/`);
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
            
            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }
            
            if (response.data.status === 'success') {
                const updatedProduct = response.data.product;
                setState(prev => ({
                    ...prev,
                    products: prev.products.map(p => p.id === id ? updatedProduct : p),
                    isLoading: false,
                }));
                return true;
            }
            return false;
        } catch (error) {
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
            
            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }
            
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || 'Failed to deactivate product'
                : 'An error occurred';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return false;
        }
    }, []);

    // Get company products
    const getCompanyProducts = useCallback(async (companyId: string): Promise<Product[]> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.get(`/companies/${companyId}/products/`);
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
            
            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }
            
            if (response.data.status === 'success') {
                setState(prev => ({ ...prev, isLoading: false }));
                return response.data.products || [];
            }
            return [];
        } catch (error) {
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
            
            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }
            
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || 'Failed to fetch company products'
                : 'An error occurred';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return [];
        }
    }, []);

    // Initialize - fetch products on mount
    useEffect(() => {
        getProducts();
    }, [getProducts]);

    return {
        ...state,
        getProducts,
        getProductById,
        createProduct,
        updateProduct,
        deleteProduct,
        activateProduct,
        deactivateProduct,
        getCompanyProducts,
    };
};
