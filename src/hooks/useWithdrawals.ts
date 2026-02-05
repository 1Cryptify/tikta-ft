/**
 * Custom Hook: useWithdrawals
 * Manages withdrawal account and withdrawal-related state and operations
 */

import { useState, useCallback } from 'react';
import {
  WithdrawalAccount,
  Withdrawal,
  CreateWithdrawalAccountPayload,
  UpdateWithdrawalAccountPayload,
  InitiateWithdrawalPayload,
  listWithdrawalAccounts,
  createWithdrawalAccount,
  updateWithdrawalAccount,
  deleteWithdrawalAccount,
  initiateWithdrawal,
  getWithdrawalHistory,
} from '../services/withdrawals';
import { getErrorMessage } from '../services/api';

export interface UseWithdrawalsState {
  accounts: WithdrawalAccount[];
  withdrawals: Withdrawal[];
  selectedAccount: WithdrawalAccount | null;
  loading: boolean;
  error: string | null;
}

export interface UseWithdrawalsActions {
  fetchAccounts: (companyId: string) => Promise<void>;
  fetchWithdrawalHistory: (companyId: string) => Promise<void>;
  createNewAccount: (payload: CreateWithdrawalAccountPayload) => Promise<WithdrawalAccount>;
  updateAccountData: (payload: UpdateWithdrawalAccountPayload) => Promise<WithdrawalAccount>;
  deleteAccountData: (accountId: string) => Promise<void>;
  initiateNewWithdrawal: (payload: InitiateWithdrawalPayload) => Promise<Withdrawal>;
  clearError: () => void;
  clearSelection: () => void;
}

export function useWithdrawals(): UseWithdrawalsState & UseWithdrawalsActions {
  const [state, setState] = useState<UseWithdrawalsState>({
    accounts: [],
    withdrawals: [],
    selectedAccount: null,
    loading: false,
    error: null,
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const fetchAccounts = useCallback(async (companyId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await listWithdrawalAccounts(companyId);
      const accounts = response.accounts || response.data || [];
      setState(prev => ({
        ...prev,
        accounts: Array.isArray(accounts) ? accounts : [],
      }));
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWithdrawalHistory = useCallback(async (companyId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getWithdrawalHistory(companyId);
      const withdrawals = response.withdrawals || response.data || [];
      setState(prev => ({
        ...prev,
        withdrawals: Array.isArray(withdrawals) ? withdrawals : [],
      }));
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  const createNewAccount = useCallback(async (payload: CreateWithdrawalAccountPayload) => {
    try {
      setLoading(true);
      setError(null);
      const response = await createWithdrawalAccount(payload);
      const account = response.account || response.data;
      if (account) {
        setState(prev => ({
          ...prev,
          accounts: [...prev.accounts, account],
        }));
        return account;
      }
      throw new Error('Failed to create account');
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      setError(errorMsg);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAccountData = useCallback(async (payload: UpdateWithdrawalAccountPayload) => {
    try {
      setLoading(true);
      setError(null);
      const response = await updateWithdrawalAccount(payload);
      const account = response.account || response.data;
      if (account) {
        setState(prev => ({
          ...prev,
          accounts: prev.accounts.map(a => (a.id === account.id ? account : a)),
          selectedAccount: prev.selectedAccount?.id === account.id ? account : prev.selectedAccount,
        }));
        return account;
      }
      throw new Error('Failed to update account');
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      setError(errorMsg);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAccountData = useCallback(async (accountId: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteWithdrawalAccount(accountId);
      setState(prev => ({
        ...prev,
        accounts: prev.accounts.filter(a => a.id !== accountId),
        selectedAccount: prev.selectedAccount?.id === accountId ? null : prev.selectedAccount,
      }));
    } catch (error) {
      setError(getErrorMessage(error));
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const initiateNewWithdrawal = useCallback(async (payload: InitiateWithdrawalPayload) => {
    try {
      setLoading(true);
      setError(null);
      const response = await initiateWithdrawal(payload);
      const withdrawal = response.withdrawal || response.data;
      if (withdrawal) {
        setState(prev => ({
          ...prev,
          withdrawals: [...prev.withdrawals, withdrawal],
        }));
        return withdrawal;
      }
      throw new Error('Failed to initiate withdrawal');
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      setError(errorMsg);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearSelection = useCallback(() => {
    setState(prev => ({ ...prev, selectedAccount: null }));
  }, []);

  return {
    ...state,
    fetchAccounts,
    fetchWithdrawalHistory,
    createNewAccount,
    updateAccountData,
    deleteAccountData,
    initiateNewWithdrawal,
    clearError,
    clearSelection,
  };
}
