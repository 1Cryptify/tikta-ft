import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { API_PAYMENTS_BASE_URL } from '../services/api';
import { useAuth } from './useAuth';

// Délai minimum du loader en millisecondes
const LOADER_DURATION = 1000;

const axiosInstance = axios.create({
    baseURL: API_PAYMENTS_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface Currency {
    id: string;
    code: string;
    name: string;
    symbol: string;
    value_in_usd: number;
    decimal_places: number;
    is_active: boolean;
    is_default: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface Product {
    id: string;
    company: string;
    name: string;
    description?: string;
    price: number;
    currency_id?: string;
    currency?: Currency;
    is_active: boolean;
    is_deleted?: boolean;
    created_at?: string;
    updated_at?: string;
}

interface ProductState {
    products: Product[];
    currencies: Currency[];
    isLoading: boolean;
    error: string | null;
}

interface UseProductReturn extends ProductState {
    getCurrencies: () => Promise<void>;
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
    const { user } = useAuth();
    const [state, setState] = useState<ProductState>({
        products: [],
        currencies: [],
        isLoading: false,
        error: null,
    });

    // Get all currencies
    const getCurrencies = useCallback(async () => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await axiosInstance.get('/currencies/');
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);

            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }

            if (response.data.status === 'success') {
                setState(prev => ({
                    ...prev,
                    currencies: response.data.currencies || [],
                    isLoading: false,
                }));
            } else if (response.data.status === 'error') {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Failed to fetch currencies',
                }));
            }
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to fetch currencies',
            }));
        }
    }, []);

    // Get all products
    const getProducts = useCallback(async () => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
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
        } else if (response.data.status === 'error') {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: response.data.message || 'Failed to fetch products',
            }));
        }
    }, []);

    // Get single product by ID
    const getProductById = useCallback(async (id: string): Promise<Product | null> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
        const response = await axiosInstance.get(`/products/${id}/`);
        const elapsed = Date.now() - startTime;
        const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
        
        if (delayNeeded > 0) {
            await new Promise(resolve => setTimeout(resolve, delayNeeded));
        }
        
        if (response.data.status === 'success') {
            setState(prev => ({ ...prev, isLoading: false }));
            return response.data.product;
        } else if (response.data.status === 'error') {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: response.data.message || 'Failed to fetch product',
            }));
        }
        return null;
    }, []);

    // Create new product (auto-selects active company for non-superusers)
    const createProduct = useCallback(async (data: Partial<Product>): Promise<Product | null> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
        // Auto-add company_id from active company if not a superuser
        const productData = { ...data };
        if (user && !user.is_superuser && user.active_company) {
            productData.company_id = user.active_company.id;
        }

        const response = await axiosInstance.post('/products/create/', productData);
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
        } else if (response.data.status === 'error') {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: response.data.message || 'Failed to create product',
            }));
        }
        return null;
    }, [user]);

    // Update product
    const updateProduct = useCallback(async (id: string, data: Partial<Product>): Promise<Product | null> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
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
        } else if (response.data.status === 'error') {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: response.data.message || 'Failed to update product',
            }));
        }
        return null;
    }, []);

    // Delete product
    const deleteProduct = useCallback(async (id: string): Promise<boolean> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
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
        } else if (response.data.status === 'error') {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: response.data.message || 'Failed to delete product',
            }));
        }
        return false;
    }, []);

    // Activate product
    const activateProduct = useCallback(async (id: string): Promise<boolean> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
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
        } else if (response.data.status === 'error') {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: response.data.message || 'Failed to activate product',
            }));
        }
        return false;
    }, []);

    // Deactivate product
    const deactivateProduct = useCallback(async (id: string): Promise<boolean> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
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
        } else if (response.data.status === 'error') {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: response.data.message || 'Failed to deactivate product',
            }));
        }
        return false;
    }, []);

    // Get company products
    const getCompanyProducts = useCallback(async (companyId: string): Promise<Product[]> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
        const response = await axiosInstance.get(`/companies/${companyId}/products/`);
        const elapsed = Date.now() - startTime;
        const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
        
        if (delayNeeded > 0) {
            await new Promise(resolve => setTimeout(resolve, delayNeeded));
        }
        
        if (response.data.status === 'success') {
            setState(prev => ({ ...prev, isLoading: false }));
            return response.data.products || [];
        } else if (response.data.status === 'error') {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: response.data.message || 'Failed to fetch company products',
            }));
        }
        return [];
    }, []);

    // Initialize - fetch products and currencies on mount
    useEffect(() => {
        getCurrencies();
        getProducts();
    }, [getCurrencies, getProducts]);

    return {
        ...state,
        getCurrencies,
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
