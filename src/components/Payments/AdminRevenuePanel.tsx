import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { colors, spacing } from '../../config/theme';
import { API_PAYMENTS_BASE_URL } from '../../services/api';
import axios from 'axios';

const Container = styled.div``;

const Title = styled.h3`
  margin-bottom: ${spacing.lg};
  color: ${colors.primary};
`;

const RevenueCard = styled.div`
  background: white;
  border: 1px solid ${colors.border};
  border-radius: 8px;
  padding: ${spacing.lg};
  margin-bottom: ${spacing.md};
`;

const CompanyName = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: ${spacing.sm};
`;

const StatsRow = styled.div`
  display: flex;
  gap: ${spacing.xl};
  margin-bottom: ${spacing.md};
  flex-wrap: wrap;
`;

const Stat = styled.div`
  .label { font-size: 0.75rem; color: ${colors.textSecondary}; text-transform: uppercase; }
  .value { font-size: 1.2rem; font-weight: 700; }
`;

const MarkButton = styled.button`
  background: ${colors.success};
  color: white;
  border: none;
  padding: ${spacing.sm} ${spacing.lg};
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
  &:hover { opacity: 0.9; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

interface RevenueData {
  id: string;
  company_id: string;
  company_name: string;
  total_fees_collected: string;
  total_marked_as_withdrawn: string;
  available_balance: string;
}

export const AdminRevenuePanel: React.FC = () => {
  const [revenues, setRevenues] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const api = axios.create({
    baseURL: API_PAYMENTS_BASE_URL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  });

  const fetchRevenues = useCallback(async () => {
    try {
      const res = await api.get('/admin-revenue/');
      if (res.data.status === 'success') {
        setRevenues(res.data.revenues || []);
      }
    } catch (err) {
      console.error('Failed to fetch revenues', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRevenues(); }, [fetchRevenues]);

  const handleMarkWithdrawn = async (companyId: string) => {
    setMarkingId(companyId);
    try {
      const res = await api.post('/admin-revenue/mark-withdrawn/', { company_id: companyId });
      if (res.data.status === 'success') {
        await fetchRevenues();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur');
    } finally {
      setMarkingId(null);
    }
  };

  const formatAmount = (amount: string) => {
    return parseFloat(amount).toLocaleString('fr-FR') + ' FCFA';
  };

  if (loading) return <div>Chargement...</div>;

  if (revenues.length === 0) {
    return (
      <Container>
        <Title>Revenus administrateur</Title>
        <p style={{ color: colors.textSecondary }}>Aucun revenu de frais pour le moment. Les frais de retrait seront affiches ici.</p>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Revenus administrateur</Title>
      {revenues.map(rev => (
        <RevenueCard key={rev.id}>
          <CompanyName>{rev.company_name}</CompanyName>
          <StatsRow>
            <Stat>
              <div className="label">Total frais collectes</div>
              <div className="value" style={{ color: colors.primary }}>{formatAmount(rev.total_fees_collected)}</div>
            </Stat>
            <Stat>
              <div className="label">Marques comme retires</div>
              <div className="value" style={{ color: colors.success }}>{formatAmount(rev.total_marked_as_withdrawn)}</div>
            </Stat>
            <Stat>
              <div className="label">Disponible</div>
              <div className="value" style={{ color: parseFloat(rev.available_balance) > 0 ? colors.warning || '#e67e22' : colors.textSecondary }}>
                {formatAmount(rev.available_balance)}
              </div>
            </Stat>
          </StatsRow>
          {parseFloat(rev.available_balance) > 0 && (
            <MarkButton
              onClick={() => handleMarkWithdrawn(rev.company_id)}
              disabled={markingId === rev.company_id}
            >
              {markingId === rev.company_id ? '...' : 'Marquer comme retire'}
            </MarkButton>
          )}
        </RevenueCard>
      ))}
    </Container>
  );
};
