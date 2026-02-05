/**
 * Custom Hook: useOffers
 * Manages offer-related state and operations
 */

import { useState, useCallback } from 'react';
import {
  Offer,
  CreateOfferPayload,
  UpdateOfferPayload,
  listOffers,
  getOfferDetail,
  createOffer,
  updateOffer,
  deleteOffer,
} from '../services/offers';
import { getErrorMessage } from '../services/api';

export interface UseOffersState {
  offers: Offer[];
  selectedOffer: Offer | null;
  loading: boolean;
  error: string | null;
}

export interface UseOffersActions {
  fetchOffers: (companyId: string) => Promise<void>;
  fetchOfferDetail: (offerId: string) => Promise<void>;
  createNewOffer: (payload: CreateOfferPayload) => Promise<Offer>;
  updateOfferData: (payload: UpdateOfferPayload) => Promise<Offer>;
  deleteOfferData: (offerId: string) => Promise<void>;
  clearError: () => void;
  clearSelection: () => void;
}

export function useOffers(): UseOffersState & UseOffersActions {
  const [state, setState] = useState<UseOffersState>({
    offers: [],
    selectedOffer: null,
    loading: false,
    error: null,
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const fetchOffers = useCallback(async (companyId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await listOffers(companyId);
      const offers = response.offers || response.data || [];
      setState(prev => ({ ...prev, offers: Array.isArray(offers) ? offers : [] }));
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOfferDetail = useCallback(async (offerId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getOfferDetail(offerId);
      const offer = response.offer || response.data;
      if (offer) {
        setState(prev => ({ ...prev, selectedOffer: offer }));
      }
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  const createNewOffer = useCallback(async (payload: CreateOfferPayload) => {
    try {
      setLoading(true);
      setError(null);
      const response = await createOffer(payload);
      const offer = response.offer || response.data;
      if (offer) {
        setState(prev => ({
          ...prev,
          offers: [...prev.offers, offer],
        }));
        return offer;
      }
      throw new Error('Failed to create offer');
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      setError(errorMsg);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOfferData = useCallback(async (payload: UpdateOfferPayload) => {
    try {
      setLoading(true);
      setError(null);
      const response = await updateOffer(payload);
      const offer = response.offer || response.data;
      if (offer) {
        setState(prev => ({
          ...prev,
          offers: prev.offers.map(o => (o.id === offer.id ? offer : o)),
          selectedOffer: prev.selectedOffer?.id === offer.id ? offer : prev.selectedOffer,
        }));
        return offer;
      }
      throw new Error('Failed to update offer');
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      setError(errorMsg);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteOfferData = useCallback(async (offerId: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteOffer(offerId);
      setState(prev => ({
        ...prev,
        offers: prev.offers.filter(o => o.id !== offerId),
        selectedOffer: prev.selectedOffer?.id === offerId ? null : prev.selectedOffer,
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
    setState(prev => ({ ...prev, selectedOffer: null }));
  }, []);

  return {
    ...state,
    fetchOffers,
    fetchOfferDetail,
    createNewOffer,
    updateOfferData,
    deleteOfferData,
    clearError,
    clearSelection,
  };
}
