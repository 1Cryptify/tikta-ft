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

export interface Offer {
    id: string;
    group_id?: string;
    company_id: string;
    name: string;
    description?: string;
    price?: number;
    currency_id?: string;
    currency?: Currency;
    discount_type?: 'percentage' | 'fixed';
    discount_value?: number;
    discount_currency_id?: string;
    original_price?: number;
    final_price?: number;
    is_active: boolean;
    is_deleted?: boolean;
    offer_type?: 'ticket' | 'digital_product';
    category?: string;
    tags?: string[];
    image?: string; // Image URL path
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
    currencies: Currency[];
    isLoading: boolean;
    error: string | null;
    successMessage: string | null;
    successStatus: string | null;
}

interface UseOfferReturn extends OfferState {
    getCurrencies: () => Promise<void>;
    getOffers: () => Promise<void>;
    getOfferById: (id: string) => Promise<Offer | null>;
    createOffer: (data: Partial<Offer>) => Promise<Offer | null>;
    updateOffer: (id: string, data: Partial<Offer>) => Promise<Offer | null>;
    deleteOffer: (id: string) => Promise<boolean>;
    activateOffer: (id: string) => Promise<boolean>;
    deactivateOffer: (id: string) => Promise<boolean>;
    uploadOfferImage: (id: string, file: File) => Promise<string | null>;
    getCompanyOffers: (companyId: string) => Promise<Offer[]>;
    getOfferGroups: () => Promise<void>;
    getOfferGroupById: (id: string) => Promise<OfferGroup | null>;
    createOfferGroup: (data: Partial<OfferGroup>) => Promise<OfferGroup | null>;
    updateOfferGroup: (id: string, data: Partial<OfferGroup>) => Promise<OfferGroup | null>;
    deleteOfferGroup: (id: string) => Promise<boolean>;
    getCompanyOfferGroups: (companyId: string) => Promise<OfferGroup[]>;
}

export const useOffer = (): UseOfferReturn => {
    const { user } = useAuth();
    const [state, setState] = useState<OfferState>({
        offers: [],
        offerGroups: [],
        currencies: [],
        isLoading: false,
        error: null,
        successMessage: null,
        successStatus: null,
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

    // Get all offers
    const getOffers = useCallback(async () => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

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
                successMessage: response.data.message || null,
                successStatus: response.data.status || null,
            }));
        } else if (response.data.status === 'error') {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: response.data.message || 'Failed to fetch offers',
            }));
        }
    }, []);

    // Get single offer by ID
    const getOfferById = useCallback(async (id: string): Promise<Offer | null> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        const response = await axiosInstance.get(`/offers/${id}/`);
        const elapsed = Date.now() - startTime;
        const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);

        if (delayNeeded > 0) {
            await new Promise(resolve => setTimeout(resolve, delayNeeded));
        }

        if (response.data.status === 'success') {
            setState(prev => ({ ...prev, isLoading: false }));
            return response.data.offer;
        } else if (response.data.status === 'error') {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: response.data.message || 'Failed to fetch offer',
            }));
        }
        return null;
    }, []);

    // Create new offer (auto-selects active company for non-superusers)
    const createOffer = useCallback(async (data: Partial<Offer>): Promise<Offer | null> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        // Auto-add company_id from active company if not a superuser
        const offerData = { ...data };
        if (user && !user.is_superuser && user.active_company) {
            offerData.company_id = user.active_company.id;
        }

        const response = await axiosInstance.post('/offers/create/', offerData);
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
        } else if (response.data.status === 'error') {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: response.data.message || 'Failed to create offer',
            }));
        }
        return null;
    }, [user]);

    // Update offer
    const updateOffer = useCallback(async (id: string, data: Partial<Offer>): Promise<Offer | null> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

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
        } else if (response.data.status === 'error') {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: response.data.message || 'Failed to update offer',
            }));
        }
        return null;
    }, []);

    // Delete offer
    const deleteOffer = useCallback(async (id: string): Promise<boolean> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

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
        } else if (response.data.status === 'error') {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: response.data.message || 'Failed to delete offer',
            }));
        }
        return false;
    }, []);

    // Activate offer
    const activateOffer = useCallback(async (id: string): Promise<boolean> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

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
        } else if (response.data.status === 'error') {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: response.data.message || 'Failed to activate offer',
            }));
        }
        return false;
    }, []);

    // Deactivate offer
    const deactivateOffer = useCallback(async (id: string): Promise<boolean> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

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
        } else if (response.data.status === 'error') {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: response.data.message || 'Failed to deactivate offer',
            }));
        }
        return false;
    }, []);

    // Upload offer image
    const uploadOfferImage = useCallback(async (id: string, file: File): Promise<string | null> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await axiosInstance.post(`/offers/${id}/upload-image/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            const elapsed = Date.now() - startTime;
            const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);

            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }

            if (response.data.status === 'success') {
                const imageUrl = response.data.image_url;
                // Update the offer in state with the new image
                setState(prev => ({
                    ...prev,
                    offers: prev.offers.map(o =>
                        o.id === id ? { ...o, image: imageUrl } : o
                    ),
                    isLoading: false,
                }));
                return imageUrl;
            } else if (response.data.status === 'error') {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Failed to upload image',
                }));
            }
        } catch (error: any) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error.response?.data?.message || 'Failed to upload image',
            }));
        }
        return null;
    }, []);

    // Get company offers
    const getCompanyOffers = useCallback(async (companyId: string): Promise<Offer[]> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        const response = await axiosInstance.get(`/companies/${companyId}/offers/`);
        const elapsed = Date.now() - startTime;
        const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);

        if (delayNeeded > 0) {
            await new Promise(resolve => setTimeout(resolve, delayNeeded));
        }

        if (response.data.status === 'success') {
            setState(prev => ({ ...prev, isLoading: false }));
            return response.data.offers || [];
        } else if (response.data.status === 'error') {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: response.data.message || 'Failed to fetch company offers',
            }));
        }
        return [];
    }, []);

    // Get all offer groups
    const getOfferGroups = useCallback(async () => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

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
                successMessage: response.data.message || null,
                successStatus: response.data.status || null,
            }));
        } else if (response.data.status === 'error') {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: response.data.message || 'Failed to fetch offer groups',
            }));
        }
    }, []);

    // Get single offer group by ID
    const getOfferGroupById = useCallback(async (id: string): Promise<OfferGroup | null> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        const response = await axiosInstance.get(`/offer-groups/${id}/`);
        const elapsed = Date.now() - startTime;
        const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);

        if (delayNeeded > 0) {
            await new Promise(resolve => setTimeout(resolve, delayNeeded));
        }

        if (response.data.status === 'success') {
            setState(prev => ({ ...prev, isLoading: false }));
            return response.data.offer_group;
        } else if (response.data.status === 'error') {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: response.data.message || 'Failed to fetch offer group',
            }));
        }
        return null;
    }, []);

    // Create new offer group (auto-selects active company for non-superusers)
    const createOfferGroup = useCallback(async (data: Partial<OfferGroup>): Promise<OfferGroup | null> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        // Auto-add company_id from active company if not a superuser
        const groupData = { ...data };
        if (user && !user.is_superuser && user.active_company) {
            groupData.company_id = user.active_company.id;
        }

        const response = await axiosInstance.post('/offer-groups/create/', groupData);
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
        } else if (response.data.status === 'error') {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: response.data.message || 'Failed to create offer group',
            }));
        }
        return null;
    }, [user]);

    // Update offer group
    const updateOfferGroup = useCallback(async (id: string, data: Partial<OfferGroup>): Promise<OfferGroup | null> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

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
        } else if (response.data.status === 'error') {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: response.data.message || 'Failed to update offer group',
            }));
        }
        return null;
    }, []);

    // Delete offer group
    const deleteOfferGroup = useCallback(async (id: string): Promise<boolean> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

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
        } else if (response.data.status === 'error') {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: response.data.message || 'Failed to delete offer group',
            }));
        }
        return false;
    }, []);

    // Get company offer groups
    const getCompanyOfferGroups = useCallback(async (companyId: string): Promise<OfferGroup[]> => {
        const startTime = Date.now();
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        const response = await axiosInstance.get(`/companies/${companyId}/offer-groups/`);
        const elapsed = Date.now() - startTime;
        const delayNeeded = Math.max(0, LOADER_DURATION - elapsed);

        if (delayNeeded > 0) {
            await new Promise(resolve => setTimeout(resolve, delayNeeded));
        }

        if (response.data.status === 'success') {
            setState(prev => ({ ...prev, isLoading: false }));
            return response.data.offer_groups || [];
        } else if (response.data.status === 'error') {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: response.data.message || 'Failed to fetch company offer groups',
            }));
        }
        return [];
    }, []);

    // Initialize - fetch data on mount
    useEffect(() => {
        getCurrencies();
        getOffers();
        getOfferGroups();
    }, [getCurrencies, getOffers, getOfferGroups]);

    return {
        ...state,
        getCurrencies,
        getOffers,
        getOfferById,
        createOffer,
        updateOffer,
        deleteOffer,
        activateOffer,
        deactivateOffer,
        uploadOfferImage,
        getCompanyOffers,
        getOfferGroups,
        getOfferGroupById,
        createOfferGroup,
        updateOfferGroup,
        deleteOfferGroup,
        getCompanyOfferGroups,
    };
};
