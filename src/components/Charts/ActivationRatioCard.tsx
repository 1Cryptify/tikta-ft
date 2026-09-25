import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { API_PAYMENTS_BASE_URL } from '../../services/api';
import { colors, spacing, borderRadius, shadows } from '../../config/theme';

const api = axios.create({ baseURL: API_PAYMENTS_BASE_URL, withCredentials: true });

type RatioPeriod = 'all' | 'year' | 'month';

interface RatioData {
  purchased: number;
  activated: number;
  not_activated: number;
  ratio_percent: number;
}

const Card = styled.div`
  background: white;
  border: 1px solid ${colors.border};
  border-radius: ${borderRadius.md};
  padding: ${spacing.lg};
  box-shadow: ${shadows.sm};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${spacing.sm};
  margin-bottom: ${spacing.md};

  h3 {
    margin: 0;
    color: ${colors.textPrimary};
    font-size: 1.05rem;
  }
`;

const Controls = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${spacing.sm};
  flex-wrap: wrap;
`;

const Segmented = styled.div`
  display: inline-flex;
  gap: 2px;
  padding: 2px;
  background: ${colors.neutral};
  border: 1px solid ${colors.border};
  border-radius: ${borderRadius.md};
`;

const SegBtn = styled.button<{ active: boolean }>`
  border: none;
  background: ${(p) => (p.active ? 'white' : 'transparent')};
  color: ${(p) => (p.active ? colors.primary : colors.textSecondary)};
  font-weight: ${(p) => (p.active ? '700' : '500')};
  font-size: 0.78rem;
  padding: ${spacing.xs} ${spacing.md};
  border-radius: ${borderRadius.sm};
  cursor: pointer;
  box-shadow: ${(p) => (p.active ? '0 1px 3px rgba(0,0,0,0.12)' : 'none')};
  &:hover { color: ${colors.textPrimary}; }
`;

const Input = styled.input`
  padding: ${spacing.xs} ${spacing.sm};
  border: 1px solid ${colors.border};
  border-radius: ${borderRadius.sm};
  font-size: 0.8rem;
  color: ${colors.textPrimary};
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.1);
  }
`;

const Kpis = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${spacing.md};
  margin-bottom: ${spacing.lg};
`;

const Kpi = styled.div<{ accent?: string }>`
  border: 1px solid ${colors.border};
  border-left: 4px solid ${(p) => p.accent || colors.primary};
  border-radius: ${borderRadius.sm};
  padding: ${spacing.md};
  .v { font-size: 1.5rem; font-weight: 800; color: ${colors.textPrimary}; }
  .l { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.4px; color: ${colors.textSecondary}; }
`;

const Stack = styled.div`
  display: flex;
  height: 34px;
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid ${colors.border};
  background: ${colors.neutral};
`;

const SegActivated = styled.div<{ width: number }>`
  width: ${(p) => p.width}%;
  background: linear-gradient(135deg, #047857, #10b981);
  transition: width 0.4s ease;
`;

const SegPending = styled.div<{ width: number }>`
  width: ${(p) => p.width}%;
  background: repeating-linear-gradient(
    45deg,
    #e5e7eb,
    #e5e7eb 8px,
    #f3f4f6 8px,
    #f3f4f6 16px
  );
  transition: width 0.4s ease;
`;

const Legend = styled.div`
  display: flex;
  gap: ${spacing.lg};
  flex-wrap: wrap;
  margin-top: ${spacing.sm};
  font-size: 0.8rem;
  color: ${colors.textSecondary};

  span.item { display: inline-flex; align-items: center; gap: 6px; }
  span.dot { width: 12px; height: 12px; border-radius: 3px; display: inline-block; }
  strong { color: ${colors.textPrimary}; }
`;

const Empty = styled.div`
  padding: ${spacing.xl};
  text-align: center;
  color: ${colors.textSecondary};
  border: 1px dashed ${colors.border};
  border-radius: ${borderRadius.md};
  font-size: 0.85rem;
`;

const now = new Date();
const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

export const ActivationRatioCard: React.FC = () => {
  const [period, setPeriod] = useState<RatioPeriod>('all');
  const [year, setYear] = useState(String(now.getFullYear()));
  const [month, setMonth] = useState(defaultMonth);
  const [data, setData] = useState<RatioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string> = { period };
      if (period === 'year') {
        params.year = year;
      } else if (period === 'month') {
        const [y, m] = month.split('-');
        params.year = y;
        params.month = String(Number(m));
      }
      const res = await api.get('/ticket-activation-stats/', { params });
      if (res.data?.status === 'success') {
        setData(res.data);
      } else {
        setError(res.data?.message || 'Erreur');
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Impossible de charger le ratio');
    } finally {
      setLoading(false);
    }
  }, [period, year, month]);

  useEffect(() => {
    load();
  }, [load]);

  const purchased = data?.purchased ?? 0;
  const activated = data?.activated ?? 0;
  const notActivated = data?.not_activated ?? 0;
  const percent = data?.ratio_percent ?? 0;
  const pendingPercent = purchased > 0 ? Math.round((notActivated / purchased) * 1000) / 10 : 0;

  return (
    <Card>
      <Header>
        <h3>Taux d'activation des tickets</h3>
        <Controls>
          <Segmented>
            <SegBtn active={period === 'all'} onClick={() => setPeriod('all')}>Tout</SegBtn>
            <SegBtn active={period === 'year'} onClick={() => setPeriod('year')}>Année</SegBtn>
            <SegBtn active={period === 'month'} onClick={() => setPeriod('month')}>Mois</SegBtn>
          </Segmented>
          {period === 'year' && (
            <Input
              type="number"
              min="2000"
              max="2100"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          )}
          {period === 'month' && (
            <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          )}
        </Controls>
      </Header>

      {loading ? (
        <Empty>Chargement…</Empty>
      ) : error ? (
        <Empty>{error}</Empty>
      ) : purchased === 0 ? (
        <Empty>Aucun ticket acheté sur la période sélectionnée</Empty>
      ) : (
        <>
          <Kpis>
            <Kpi>
              <div className="v">{purchased.toLocaleString('fr-FR')}</div>
              <div className="l">Tickets achetés</div>
            </Kpi>
            <Kpi accent="#059669">
              <div className="v">{activated.toLocaleString('fr-FR')}</div>
              <div className="l">Tickets activés</div>
            </Kpi>
            <Kpi accent="#d97706">
              <div className="v">{percent}%</div>
              <div className="l">Taux d'activation</div>
            </Kpi>
          </Kpis>

          <Stack role="img" aria-label={`Taux d'activation ${percent}%`}>
            <SegActivated width={percent} />
            <SegPending width={pendingPercent} />
          </Stack>

          <Legend>
            <span className="item">
              <span className="dot" style={{ background: '#059669' }} />
              Activés · <strong>{activated.toLocaleString('fr-FR')}</strong> ({percent}%)
            </span>
            <span className="item">
              <span className="dot" style={{ background: '#e5e7eb' }} />
              Achetés non activés · <strong>{notActivated.toLocaleString('fr-FR')}</strong> ({pendingPercent}%)
            </span>
          </Legend>
        </>
      )}
    </Card>
  );
};

export default ActivationRatioCard;
