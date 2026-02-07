import { useState, useCallback } from 'react';
import { endpoints, apiGet, apiPost, apiPut, apiDelete } from '../services/api';

export interface WithdrawalAccount {
  id: string;
  account_number: string;
  account_holder: string;
  bank_name: string;
  is_active?: boolean;
  company_id?: string;
  created_at?: string;
  updated_at?: string;
}

interface WithdrawalAccountState {
  withdrawalAccounts: WithdrawalAccount[];
  currentWithdrawalAccount: WithdrawalAccount | null;
  isLoading: boolean;
  error: string | null;
}

export const useWithdrawalAccount = () => {
  const [state, setState] = useState<WithdrawalAccountState>({
    withdrawalAccounts: [],
    currentWithdrawalAccount: null,
    isLoading: false,
    error: null,
  });

  const listWithdrawalAccounts = useCallback(async (companyId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiGet(endpoints.withdrawalAccount.list(companyId));
      setState(prev => ({
        ...prev,
        withdrawalAccounts: response.data || response.withdrawalAccounts || response.withdrawal_accounts || [],
        isLoading: false,
      }));
      return { success: true, data: response.data || response.withdrawalAccounts || response.withdrawal_accounts };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to list withdrawal accounts';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  const getWithdrawalAccountDetail = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiGet(endpoints.withdrawalAccount.detail(id));
      setState(prev => ({
        ...prev,
        currentWithdrawalAccount: response.data || response.withdrawalAccount || response.withdrawal_account,
        isLoading: false,
      }));
      return { success: true, data: response.data || response.withdrawalAccount || response.withdrawal_account };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to get withdrawal account details';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  const createWithdrawalAccount = useCallback(async (data: Partial<WithdrawalAccount>) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiPost(endpoints.withdrawalAccount.create, data);
      const newWithdrawalAccount = response.data || response.withdrawalAccount || response.withdrawal_account;
      setState(prev => ({
        ...prev,
        withdrawalAccounts: [...prev.withdrawalAccounts, newWithdrawalAccount],
        isLoading: false,
      }));
      return { success: true, data: newWithdrawalAccount };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to create withdrawal account';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  const updateWithdrawalAccount = useCallback(async (id: string, data: Partial<WithdrawalAccount>) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiPut(endpoints.withdrawalAccount.update(id), data);
      const updatedWithdrawalAccount = response.data || response.withdrawalAccount || response.withdrawal_account;
      setState(prev => ({
        ...prev,
        withdrawalAccounts: prev.withdrawalAccounts.map(wa => wa.id === id ? updatedWithdrawalAccount : wa),
        currentWithdrawalAccount: prev.currentWithdrawalAccount?.id === id ? updatedWithdrawalAccount : prev.currentWithdrawalAccount,
        isLoading: false,
      }));
      return { success: true, data: updatedWithdrawalAccount };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to update withdrawal account';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  const deleteWithdrawalAccount = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await apiDelete(endpoints.withdrawalAccount.delete(id));
      setState(prev => ({
        ...prev,
        withdrawalAccounts: prev.withdrawalAccounts.filter(wa => wa.id !== id),
        currentWithdrawalAccount: prev.currentWithdrawalAccount?.id === id ? null : prev.currentWithdrawalAccount,
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to delete withdrawal account';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      return { success: false, error: errorMsg };
    }
  }, []);

  return {
    ...state,
    listWithdrawalAccounts,
    getWithdrawalAccountDetail,
    createWithdrawalAccount,
    updateWithdrawalAccount,
    deleteWithdrawalAccount,
  };
};
