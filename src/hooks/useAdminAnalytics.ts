import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { API_PAYMENTS_BASE_URL } from '../services/api';

export interface AnalyticsMonth {
    month: string;
    inflow: string;
    withdrawal: string;
    fees: string;
    net: string;
    payments_count: number;
}

export interface AnalyticsCompany {
    company_id: string;
    company_name: string;
    inflow: string;
    withdrawal: string;
    fees: string;
    net: string;
    payments_count: number;
    avg_ticket: string;
    share_pct: number;
    last_payment_at: string | null;
    month_inflow: string;
    prev_month_inflow: string;
    mom_pct: number | null;
}

export interface ForecastPoint {
    month: string;
    value: string;
    lower: string;
    upper: string;
}

export interface ForecastBlock {
    method: string;
    n: number;
    slope: number;
    intercept: number;
    r2: number;
    residual_std: number;
    trend: 'up' | 'down' | 'flat';
    last_value: number;
    moving_average: number;
    history: { month: string; value: string }[];
    forecast: ForecastPoint[];
}

export interface FeeLedgerEntry {
    company_id: string;
    company_name: string;
    total_fees_collected: string;
    total_marked_as_withdrawn: string;
    available_balance: string;
}

export interface AnalyticsKpi {
    gross_inflow: string;
    total_withdrawn: string;
    net_inflow: string;
    fees_window: string;
    payments_count: number;
    companies_count: number;
    avg_ticket: string;
    fees_total_all_time: string;
    fees_marked_all_time: string;
    fees_available_all_time: string;
}

export interface AdminAnalytics {
    status: string;
    generated_at: string;
    currency: { code: string; symbol: string; decimal_places: number } | null;
    available_currencies: { code: string; symbol: string; decimal_places: number; is_default: boolean }[];
    window: { months: number; from: string; to: string };
    kpi: AnalyticsKpi;
    months: AnalyticsMonth[];
    companies: AnalyticsCompany[];
    forecast: { horizon_months: number; inflow: ForecastBlock; fees: ForecastBlock };
    fee_ledger: FeeLedgerEntry[];
}

export interface AdminAnalyticsParams {
    months?: number;
    forecastMonths?: number;
    currency?: string;
    companyId?: string;
    enabled?: boolean;
}

interface UseAdminAnalyticsReturn {
    data: AdminAnalytics | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    markWithdrawn: (companyId: string) => Promise<void>;
}

const axiosInstance = axios.create({
    baseURL: API_PAYMENTS_BASE_URL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

export const useAdminAnalytics = (params: AdminAnalyticsParams = {}): UseAdminAnalyticsReturn => {
    const { months = 12, forecastMonths = 3, currency, companyId, enabled = true } = params;
    const [data, setData] = useState<AdminAnalytics | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAnalytics = useCallback(async () => {
        if (!enabled) return;
        setIsLoading(true);
        setError(null);
        try {
            const res = await axiosInstance.get('/admin-analytics/', {
                params: {
                    months,
                    forecast_months: forecastMonths,
                    ...(currency ? { currency } : {}),
                    ...(companyId ? { company_id: companyId } : {}),
                },
            });
            if (res.data.status === 'success') {
                setData(res.data);
            } else {
                setError(res.data.message || 'Impossible de charger les statistiques');
            }
        } catch (err) {
            const message = err instanceof axios.AxiosError
                ? err.response?.data?.message || 'Impossible de charger les statistiques administrateur'
                : 'Une erreur est survenue';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, [months, forecastMonths, currency, companyId, enabled]);

    useEffect(() => {
        if (enabled) {
            fetchAnalytics();
        }
    }, [fetchAnalytics, enabled]);

    const markWithdrawn = useCallback(async (companyIdToMark: string) => {
        await axiosInstance.post('/admin-revenue/mark-withdrawn/', { company_id: companyIdToMark });
        await fetchAnalytics();
    }, [fetchAnalytics]);

    return {
        data,
        isLoading,
        error,
        refetch: fetchAnalytics,
        markWithdrawn,
    };
};

export default useAdminAnalytics;
