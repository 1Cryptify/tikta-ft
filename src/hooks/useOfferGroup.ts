import { useState, useCallback } from 'react';
import { endpoints, apiGet, apiPost, apiPut, apiDelete } from '../services/api';

export interface OfferGroup {
  id: string;
  name: string;
  description?: string;
  is_active?: boolean;
  company_id?: string;
  created_at?: string;
  updated_at?: string;
}

interface OfferGroupState {
  offerGroups: OfferGroup[];
  currentOfferGroup: OfferGroup | null;
  isLoading: boolean;
  error: string | null;
}

export const useOfferGroup = () => {
  const [state, setState] = useState<OfferGroupState>({
    offerGroups: [],
    currentOfferGroup: null,
    isLoading: false,
    error: null,
  });

  const listOfferGroups = useCallback(async (companyId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiGet(endpoints.offerGroup.list(companyId));
      setState(prev => ({
        ...prev,
        offerGroups: response.data || response.offerGroups || response.offer_groups || [],
        isLoading: false,
      }));
      return { success: true, data: response.data || response.offerGroups || response.offer_groups };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to list offer groups';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  const getOfferGroupDetail = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiGet(endpoints.offerGroup.detail(id));
      setState(prev => ({
        ...prev,
        currentOfferGroup: response.data || response.offerGroup || response.offer_group,
        isLoading: false,
      }));
      return { success: true, data: response.data || response.offerGroup || response.offer_group };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to get offer group details';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  const createOfferGroup = useCallback(async (data: Partial<OfferGroup>) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiPost(endpoints.offerGroup.create, data);
      const newOfferGroup = response.data || response.offerGroup || response.offer_group;
      setState(prev => ({
        ...prev,
        offerGroups: [...prev.offerGroups, newOfferGroup],
        isLoading: false,
      }));
      return { success: true, data: newOfferGroup };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to create offer group';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  const updateOfferGroup = useCallback(async (id: string, data: Partial<OfferGroup>) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiPut(endpoints.offerGroup.update(id), data);
      const updatedOfferGroup = response.data || response.offerGroup || response.offer_group;
      setState(prev => ({
        ...prev,
        offerGroups: prev.offerGroups.map(og => og.id === id ? updatedOfferGroup : og),
        currentOfferGroup: prev.currentOfferGroup?.id === id ? updatedOfferGroup : prev.currentOfferGroup,
        isLoading: false,
      }));
      return { success: true, data: updatedOfferGroup };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to update offer group';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  const deleteOfferGroup = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await apiDelete(endpoints.offerGroup.delete(id));
      setState(prev => ({
        ...prev,
        offerGroups: prev.offerGroups.filter(og => og.id !== id),
        currentOfferGroup: prev.currentOfferGroup?.id === id ? null : prev.currentOfferGroup,
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to delete offer group';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  return {
    ...state,
    listOfferGroups,
    getOfferGroupDetail,
    createOfferGroup,
    updateOfferGroup,
    deleteOfferGroup,
  };
};
