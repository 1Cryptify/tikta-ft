/**
 * Currency Service
 * Handles all currency related API calls
 */

import { apiGet, endpoints, ApiResponse } from './api';

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  is_active: boolean;
  exchange_rate?: string;
  created_at: string;
  updated_at: string;
}

/**
 * List all currencies
 */
export async function listCurrencies(): Promise<ApiResponse<Currency[]>> {
  try {
    return await apiGet(endpoints.currencies.list);
  } catch (error) {
    console.error('Failed to fetch currencies:', error);
    throw error;
  }
}

/**
 * Get currency details
 */
export async function getCurrencyDetail(currencyId: string): Promise<ApiResponse<Currency>> {
  try {
    return await apiGet(endpoints.currencies.detail(currencyId));
  } catch (error) {
    console.error('Failed to fetch currency details:', error);
    throw error;
  }
}

/**
 * Type guard for currency
 */
export function isCurrency(data: any): data is Currency {
  return (
    data &&
    typeof data === 'object' &&
    'id' in data &&
    'code' in data &&
    'symbol' in data
  );
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(code: string): string {
  const symbols: Record<string, string> = {
    XAF: 'FCFA',
    EUR: '€',
    USD: '$',
    GBP: '£',
    CNY: '¥',
    JPY: '¥',
    INR: '₹',
  };
  return symbols[code] || code;
}

/**
 * Format amount with currency
 */
export function formatCurrency(amount: string | number, currencyCode: string): string {
  const symbol = getCurrencySymbol(currencyCode);
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `${numAmount.toLocaleString()} ${symbol}`;
}
