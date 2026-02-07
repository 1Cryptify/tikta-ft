import { useState, useCallback } from 'react';
import { endpoints, apiGet, apiPost, apiPut, apiDelete } from '../services/api';

export interface Offer {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  is_active?: boolean;
  company_id?: string;
  created_at?: string;
  updated_at?: string;
}

interface OfferState {
  offers: Offer[];
  currentOffer: Offer | null;
  isLoading: boolean;
  error: string | null;
}

export const useOffer = () => {
  const [state, setState] = useState<OfferState>({
    offers: [],
    currentOffer: null,
    isLoading: false,
    error: null,
  });

  const listOffers = useCallback(async (companyId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiGet(endpoints.offer.list(companyId));
      setState(prev => ({
        ...prev,
        offers: response.data || response.offers || [],
        isLoading: false,
      }));
      return { success: true, data: response.data || response.offers };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to list offers';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  const getOfferDetail = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiGet(endpoints.offer.detail(id));
      setState(prev => ({
        ...prev,
        currentOffer: response.data || response.offer,
        isLoading: false,
      }));
      return { success: true, data: response.data || response.offer };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to get offer details';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  const createOffer = useCallback(async (data: Partial<Offer>) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiPost(endpoints.offer.create, data);
      const newOffer = response.data || response.offer;
      setState(prev => ({
        ...prev,
        offers: [...prev.offers, newOffer],
        isLoading: false,
      }));
      return { success: true, data: newOffer };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to create offer';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  const updateOffer = useCallback(async (id: string, data: Partial<Offer>) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiPut(endpoints.offer.update(id), data);
      const updatedOffer = response.data || response.offer;
      setState(prev => ({
        ...prev,
        offers: prev.offers.map(o => o.id === id ? updatedOffer : o),
        currentOffer: prev.currentOffer?.id === id ? updatedOffer : prev.currentOffer,
        isLoading: false,
      }));
      return { success: true, data: updatedOffer };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to update offer';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  const deleteOffer = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await apiDelete(endpoints.offer.delete(id));
      setState(prev => ({
        ...prev,
        offers: prev.offers.filter(o => o.id !== id),
        currentOffer: prev.currentOffer?.id === id ? null : prev.currentOffer,
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to delete offer';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  return {
    ...state,
    listOffers,
    getOfferDetail,
    createOffer,
    updateOffer,
    deleteOffer,
  };
};
