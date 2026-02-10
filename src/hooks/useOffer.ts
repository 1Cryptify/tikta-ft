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

export interface Offer {
    id: string;
    group_id?: string;
    company_id: string;
    name: string;
    description?: string;
    discount_type?: 'percentage' | 'fixed';
    discount_value?: number;
    original_price?: number;
    final_price?: number;
    is_active: boolean;
    is_deleted: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface OfferGroup {
    id: string;
    company_id: string;
    name: string;
    description?: string;
    offers?: Offer[];
    created_at?: string;
    updated_at?: string;
}

interface OfferState {
    offers: Offer[];
    offerGroups: OfferGroup[];
    isLoading: boolean;
    error: string | null;
}

interface UseOfferReturn extends OfferState {
    getOffers: () => Promise<void>;
    getOfferById: (id: string) => Promise<Offer | null>;
    createOffer: (data: Partial<Offer>) => Promise<Offer | null>;
    updateOffer: (id: string, data: Partial<Offer>) => Promise<Offer | null>;
    deleteOffer: (id: string) => Promise<boolean>;
    activateOffer: (id: string) => Promise<boolean>;
    deactivateOffer: (id: string) => Promise<boolean>;
    getCompanyOffers: (companyId: string) => Promise<Offer[]>;
    getOfferGroups: () => Promise<void>;
    getOfferGroupById: (id: string) => Promise<OfferGroup | null>;
    createOfferGroup: (data: Partial<OfferGroup>) => Promise<OfferGroup | null>;
    updateOfferGroup: (id: string, data: Partial<OfferGroup>) => Promise<OfferGroup | null>;
    deleteOfferGroup: (id: string) => Promise<boolean>;
    getCompanyOfferGroups: (companyId: string) => Promise<OfferGroup[]>;
}

export const useOffer = (): UseOfferReturn => {
    const [state, setState] = useState<OfferState>({
        offers: [],
        offerGroups: [],
        isLoading: false,
        error: null,
    });

    // Get all offers
    const getOffers = useCallback(async () => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.get('/offers/');
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
            
            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }
            
            if (response.data.status === 'success') {
                setState(prev => ({
                    ...prev,
                    offers: response.data.offers || [],
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
                ? error.response?.data?.message || 'Failed to fetch offers'
                : 'An error occurred';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
        }
    }, []);

    // Get single offer by ID
    const getOfferById = useCallback(async (id: string): Promise<Offer | null> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.get(`/offers/${id}/`);
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
            
            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }
            
            if (response.data.status === 'success') {
                setState(prev => ({ ...prev, isLoading: false }));
                return response.data.offer;
            }
            return null;
        } catch (error) {
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
            
            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }
            
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || 'Failed to fetch offer'
                : 'An error occurred';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return null;
        }
    }, []);

    // Create new offer
    const createOffer = useCallback(async (data: Partial<Offer>): Promise<Offer | null> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.post('/offers/create/', data);
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
            
            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }
            
            if (response.data.status === 'success') {
                const newOffer = response.data.offer;
                setState(prev => ({
                    ...prev,
                    offers: [...prev.offers, newOffer],
                    isLoading: false,
                }));
                return newOffer;
            }
            return null;
        } catch (error) {
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
            
            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }
            
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || 'Failed to create offer'
                : 'An error occurred';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return null;
        }
    }, []);

    // Update offer
    const updateOffer = useCallback(async (id: string, data: Partial<Offer>): Promise<Offer | null> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.post(`/offers/${id}/update/`, data);
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
            
            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }
            
            if (response.data.status === 'success') {
                const updatedOffer = response.data.offer;
                setState(prev => ({
                    ...prev,
                    offers: prev.offers.map(o => o.id === id ? updatedOffer : o),
                    isLoading: false,
                }));
                return updatedOffer;
            }
            return null;
        } catch (error) {
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
            
            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }
            
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || 'Failed to update offer'
                : 'An error occurred';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return null;
        }
    }, []);

    // Delete offer
    const deleteOffer = useCallback(async (id: string): Promise<boolean> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.post(`/offers/${id}/delete/`);
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
            
            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }
            
            if (response.data.status === 'success') {
                setState(prev => ({
                    ...prev,
                    offers: prev.offers.filter(o => o.id !== id),
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
                ? error.response?.data?.message || 'Failed to delete offer'
                : 'An error occurred';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return false;
        }
    }, []);

    // Activate offer
    const activateOffer = useCallback(async (id: string): Promise<boolean> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.post(`/offers/${id}/activate/`);
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
            
            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }
            
            if (response.data.status === 'success') {
                const updatedOffer = response.data.offer;
                setState(prev => ({
                    ...prev,
                    offers: prev.offers.map(o => o.id === id ? updatedOffer : o),
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
                ? error.response?.data?.message || 'Failed to activate offer'
                : 'An error occurred';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return false;
        }
    }, []);

    // Deactivate offer
    const deactivateOffer = useCallback(async (id: string): Promise<boolean> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.post(`/offers/${id}/deactivate/`);
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
            
            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }
            
            if (response.data.status === 'success') {
                const updatedOffer = response.data.offer;
                setState(prev => ({
                    ...prev,
                    offers: prev.offers.map(o => o.id === id ? updatedOffer : o),
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
                ? error.response?.data?.message || 'Failed to deactivate offer'
                : 'An error occurred';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return false;
        }
    }, []);

    // Get company offers
    const getCompanyOffers = useCallback(async (companyId: string): Promise<Offer[]> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.get(`/companies/${companyId}/offers/`);
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
            
            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }
            
            if (response.data.status === 'success') {
                setState(prev => ({ ...prev, isLoading: false }));
                return response.data.offers || [];
            }
            return [];
        } catch (error) {
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
            
            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }
            
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || 'Failed to fetch company offers'
                : 'An error occurred';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return [];
        }
    }, []);

    // Get all offer groups
    const getOfferGroups = useCallback(async () => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.get('/offer-groups/');
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
            
            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }
            
            if (response.data.status === 'success') {
                setState(prev => ({
                    ...prev,
                    offerGroups: response.data.offer_groups || [],
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
                ? error.response?.data?.message || 'Failed to fetch offer groups'
                : 'An error occurred';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
        }
    }, []);

    // Get single offer group by ID
    const getOfferGroupById = useCallback(async (id: string): Promise<OfferGroup | null> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.get(`/offer-groups/${id}/`);
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
            
            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }
            
            if (response.data.status === 'success') {
                setState(prev => ({ ...prev, isLoading: false }));
                return response.data.offer_group;
            }
            return null;
        } catch (error) {
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
            
            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }
            
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || 'Failed to fetch offer group'
                : 'An error occurred';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return null;
        }
    }, []);

    // Create new offer group
    const createOfferGroup = useCallback(async (data: Partial<OfferGroup>): Promise<OfferGroup | null> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.post('/offer-groups/create/', data);
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
            
            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }
            
            if (response.data.status === 'success') {
                const newGroup = response.data.offer_group;
                setState(prev => ({
                    ...prev,
                    offerGroups: [...prev.offerGroups, newGroup],
                    isLoading: false,
                }));
                return newGroup;
            }
            return null;
        } catch (error) {
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
            
            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }
            
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || 'Failed to create offer group'
                : 'An error occurred';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return null;
        }
    }, []);

    // Update offer group
    const updateOfferGroup = useCallback(async (id: string, data: Partial<OfferGroup>): Promise<OfferGroup | null> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.post(`/offer-groups/${id}/update/`, data);
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
            
            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }
            
            if (response.data.status === 'success') {
                const updatedGroup = response.data.offer_group;
                setState(prev => ({
                    ...prev,
                    offerGroups: prev.offerGroups.map(g => g.id === id ? updatedGroup : g),
                    isLoading: false,
                }));
                return updatedGroup;
            }
            return null;
        } catch (error) {
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
            
            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }
            
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || 'Failed to update offer group'
                : 'An error occurred';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return null;
        }
    }, []);

    // Delete offer group
    const deleteOfferGroup = useCallback(async (id: string): Promise<boolean> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.post(`/offer-groups/${id}/delete/`);
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
            
            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }
            
            if (response.data.status === 'success') {
                setState(prev => ({
                    ...prev,
                    offerGroups: prev.offerGroups.filter(g => g.id !== id),
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
                ? error.response?.data?.message || 'Failed to delete offer group'
                : 'An error occurred';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return false;
        }
    }, []);

    // Get company offer groups
    const getCompanyOfferGroups = useCallback(async (companyId: string): Promise<OfferGroup[]> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await axiosInstance.get(`/companies/${companyId}/offer-groups/`);
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
            
            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }
            
            if (response.data.status === 'success') {
                setState(prev => ({ ...prev, isLoading: false }));
                return response.data.offer_groups || [];
            }
            return [];
        } catch (error) {
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);
            
            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }
            
            const errorMessage = error instanceof axios.AxiosError
                ? error.response?.data?.message || 'Failed to fetch company offer groups'
                : 'An error occurred';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return [];
        }
    }, []);

    // Initialize - fetch offers on mount
    useEffect(() => {
        getOffers();
        getOfferGroups();
    }, [getOffers, getOfferGroups]);

    return {
        ...state,
        getOffers,
        getOfferById,
        createOffer,
        updateOffer,
        deleteOffer,
        activateOffer,
        deactivateOffer,
        getCompanyOffers,
        getOfferGroups,
        getOfferGroupById,
        createOfferGroup,
        updateOfferGroup,
        deleteOfferGroup,
        getCompanyOfferGroups,
    };
};
