import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import {
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
  FiSearch,
  FiSliders,
} from 'react-icons/fi';
import { API_PAYMENTS_BASE_URL } from '../services/api';
import '../styles/activated-tickets.css';

const axiosInstance = axios.create({
  baseURL: API_PAYMENTS_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

interface ActivatedTicket {
  ticket_id: string;
  activated_at: string | null;
  valid_until: string | null;
  offer_id: string | null;
  offer_name: string;
  amount: string | null;
  currency: string | null;
  status: 'active' | 'expired';
}

interface OfferOption {
  id: string;
  name: string;
}

interface ActivatedTicketsResponse {
  status: string;
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  results: ActivatedTicket[];
}

type Period = 'all' | 'day' | 'month' | 'year';

interface Filters {
  offerId: string;
  activationPeriod: Period;
  activationValue: string;
  expirationPeriod: Period;
  expirationValue: string;
  status: 'all' | 'active' | 'expired';
  amountMin: string;
  amountMax: string;
  search: string;
}

const EMPTY_FILTERS: Filters = {
  offerId: 'all',
  activationPeriod: 'all',
  activationValue: '',
  expirationPeriod: 'all',
  expirationValue: '',
  status: 'all',
  amountMin: '',
  amountMax: '',
  search: '',
};

const formatDateTime = (iso?: string | null): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatAmount = (amount?: string | null, currency?: string | null): string => {
  if (amount == null) return '—';
  const value = parseFloat(amount) || 0;
  return `${new Intl.NumberFormat('fr-FR').format(value)} ${currency || ''}`.trim();
};

export const ActivatedTicketsPanel: React.FC = () => {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ActivatedTicketsResponse | null>(null);
  const [offers, setOffers] = useState<OfferOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axiosInstance
      .get('/my-offers/')
      .then((res) => {
        if (res.data?.status === 'success') setOffers(res.data.offers || []);
      })
      .catch(() => {});
  }, []);

  const buildParams = useCallback((): Record<string, string> => {
    const params: Record<string, string> = { page: String(page) };

    if (filters.offerId !== 'all') params.offer_id = filters.offerId;

    const applyPeriod = (prefix: 'activation' | 'expiration', period: Period, value: string) => {
      if (!value) return;
      if (period === 'day') {
        const [y, m, d] = value.split('-');
        if (y) params[`${prefix}_year`] = y;
        if (m) params[`${prefix}_month`] = String(Number(m));
        if (d) params[`${prefix}_day`] = String(Number(d));
      } else if (period === 'month') {
        const [y, m] = value.split('-');
        if (y) params[`${prefix}_year`] = y;
        if (m) params[`${prefix}_month`] = String(Number(m));
      } else if (period === 'year') {
        params[`${prefix}_year`] = value;
      }
    };

    applyPeriod('activation', filters.activationPeriod, filters.activationValue);
    applyPeriod('expiration', filters.expirationPeriod, filters.expirationValue);

    if (filters.amountMin) params.amount_min = filters.amountMin;
    if (filters.amountMax) params.amount_max = filters.amountMax;
    if (filters.status !== 'all') params.status = filters.status;
    if (filters.search.trim()) params.search = filters.search.trim();

    return params;
  }, [filters, page]);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get('/activated-tickets/', { params: buildParams() });
      if (res.data?.status === 'success') {
        setData(res.data);
      } else {
        setError(res.data?.message || 'Impossible de charger les tickets.');
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Impossible de charger les tickets activés.');
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  };

  const results = data?.results || [];
  const totalPages = data?.total_pages || 1;

  return (
    <div className="at-panel">
      {/* Filters */}
      <div className="at-filters">
        <div className="at-filters__head">
          <span className="at-filters__title">
            <FiSliders aria-hidden="true" /> Filtres
          </span>
          <button type="button" className="at-reset" onClick={resetFilters}>
            <FiRefreshCw aria-hidden="true" /> Réinitialiser
          </button>
        </div>

        <div className="at-filters__grid">
          <label className="at-field">
            <span>Offre</span>
            <select value={filters.offerId} onChange={(e) => updateFilter('offerId', e.target.value)}>
              <option value="all">Toutes les offres</option>
              {offers.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </label>

          <div className="at-field">
            <span>Date d'activation</span>
            <div className="at-range">
              <select
                value={filters.activationPeriod}
                onChange={(e) => updateFilter('activationPeriod', e.target.value as Period)}
              >
                <option value="all">Toutes</option>
                <option value="day">Par jour</option>
                <option value="month">Par mois</option>
                <option value="year">Par année</option>
              </select>
              {filters.activationPeriod === 'day' && (
                <input
                  type="date"
                  value={filters.activationValue}
                  onChange={(e) => updateFilter('activationValue', e.target.value)}
                />
              )}
              {filters.activationPeriod === 'month' && (
                <input
                  type="month"
                  value={filters.activationValue}
                  onChange={(e) => updateFilter('activationValue', e.target.value)}
                />
              )}
              {filters.activationPeriod === 'year' && (
                <input
                  type="number"
                  placeholder="2026"
                  min="2000"
                  max="2100"
                  value={filters.activationValue}
                  onChange={(e) => updateFilter('activationValue', e.target.value)}
                />
              )}
            </div>
          </div>

          <div className="at-field">
            <span>Date d'expiration</span>
            <div className="at-range">
              <select
                value={filters.expirationPeriod}
                onChange={(e) => updateFilter('expirationPeriod', e.target.value as Period)}
              >
                <option value="all">Toutes</option>
                <option value="day">Par jour</option>
                <option value="month">Par mois</option>
                <option value="year">Par année</option>
              </select>
              {filters.expirationPeriod === 'day' && (
                <input
                  type="date"
                  value={filters.expirationValue}
                  onChange={(e) => updateFilter('expirationValue', e.target.value)}
                />
              )}
              {filters.expirationPeriod === 'month' && (
                <input
                  type="month"
                  value={filters.expirationValue}
                  onChange={(e) => updateFilter('expirationValue', e.target.value)}
                />
              )}
              {filters.expirationPeriod === 'year' && (
                <input
                  type="number"
                  placeholder="2026"
                  min="2000"
                  max="2100"
                  value={filters.expirationValue}
                  onChange={(e) => updateFilter('expirationValue', e.target.value)}
                />
              )}
            </div>
          </div>

          <label className="at-field">
            <span>Statut</span>
            <select
              value={filters.status}
              onChange={(e) => updateFilter('status', e.target.value as Filters['status'])}
            >
              <option value="all">Tous</option>
              <option value="active">En cours</option>
              <option value="expired">Expirés</option>
            </select>
          </label>

          <div className="at-field">
            <span>Montant</span>
            <div className="at-range">
              <input
                type="number"
                placeholder="Min"
                min="0"
                value={filters.amountMin}
                onChange={(e) => updateFilter('amountMin', e.target.value)}
              />
              <input
                type="number"
                placeholder="Max"
                min="0"
                value={filters.amountMax}
                onChange={(e) => updateFilter('amountMax', e.target.value)}
              />
            </div>
          </div>

          <label className="at-field">
            <span>Code ticket</span>
            <div className="at-search">
              <FiSearch aria-hidden="true" />
              <input
                type="text"
                placeholder="Rechercher…"
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
              />
            </div>
          </label>
        </div>
      </div>

      {/* Table */}
      {error && <div className="at-error">{error}</div>}

      <div className="at-table-wrap">
        <table className="at-table">
          <thead>
            <tr>
              <th>Code ticket</th>
              <th>Activation</th>
              <th>Expiration</th>
              <th>Offre</th>
              <th className="at-right">Montant</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="at-empty">Chargement…</td>
              </tr>
            ) : results.length === 0 ? (
              <tr>
                <td colSpan={6} className="at-empty">Aucun ticket activé pour ces filtres.</td>
              </tr>
            ) : (
              results.map((t) => (
                <tr key={t.ticket_id}>
                  <td className="at-code">{t.ticket_id}</td>
                  <td>{formatDateTime(t.activated_at)}</td>
                  <td>{formatDateTime(t.valid_until)}</td>
                  <td>{t.offer_name || '—'}</td>
                  <td className="at-right">{formatAmount(t.amount, t.currency)}</td>
                  <td>
                    <span className={`at-status at-status--${t.status}`}>
                      {t.status === 'expired' ? 'Expiré' : 'En cours'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="at-pagination">
        <span className="at-pagination__info">
          {data ? `${data.count} ticket(s) — page ${data.page} / ${totalPages}` : '—'}
        </span>
        <div className="at-pagination__controls">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <FiChevronLeft aria-hidden="true" /> Précédent
          </button>
          <button
            type="button"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Suivant <FiChevronRight aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivatedTicketsPanel;
