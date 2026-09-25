import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { zonesApi, OfferStats } from '../services/zoneService';
import { colors, spacing, borderRadius, shadows } from '../config/theme';
import { PieChart } from './Charts/PieChart';
import { BarChart } from './Charts/BarChart';
import { PeriodSelector, StatsPeriod } from './Charts/PeriodSelector';

const Wrap = styled.div`display: flex; flex-direction: column; gap: ${spacing.lg};`;

const Card = styled.div`
  background: white; border: 1px solid ${colors.border}; border-radius: ${borderRadius.md};
  padding: ${spacing.lg}; box-shadow: ${shadows.sm};
  h3 { margin: 0 0 ${spacing.md} 0; color: ${colors.textPrimary}; font-size: 1.05rem; }
`;

const Table = styled.table`
  width: 100%; border-collapse: collapse; font-size: 0.82rem;
  th { text-align: left; color: ${colors.textSecondary}; font-weight: 600; padding: ${spacing.sm}; border-bottom: 2px solid ${colors.border}; }
  td { padding: ${spacing.sm}; border-bottom: 1px solid ${colors.border}; color: ${colors.textPrimary}; }
  tr:hover td { background: ${colors.neutral}; }
`;

const Bar = styled.div`
  height: 8px; background: ${colors.neutral}; border-radius: 999px; overflow: hidden; min-width: 90px;
  .fill { height: 100%; background: ${colors.primary}; border-radius: 999px; }
`;

const Header = styled.div`
  display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: ${spacing.sm};
`;

const Empty = styled.div`
  padding: ${spacing.xl}; text-align: center; color: ${colors.textSecondary};
  border: 1px dashed ${colors.border}; border-radius: ${borderRadius.md};
`;

const OfferStatsPanel: React.FC = () => {
  const [stats, setStats] = useState<OfferStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState<StatsPeriod>('monthly');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setStats(await zonesApi.offerStats(period));
    } catch (e: any) {
      setError(e?.message || 'Impossible de charger les statistiques');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Empty>Chargement…</Empty>;
  if (error) return <Empty>{error}</Empty>;
  if (!stats) return <Empty>Aucune statistique disponible</Empty>;

  const maxSales = Math.max(1, ...stats.offers.map((o) => o.sales));
  const pieData = stats.offers.slice(0, 10).map((o) => ({ label: o.name, value: o.sales }));

  return (
    <Wrap>
      <Header>
        <div style={{ fontSize: '0.9rem', color: colors.textSecondary }}>
          <strong style={{ color: colors.textPrimary }}>{stats.total_sales}</strong> vente(s) sur la période ·{' '}
          {stats.offers_count} offre(s)
        </div>
        <PeriodSelector value={period} onChange={setPeriod} />
      </Header>

      {stats.total_sales === 0 ? (
        <Empty>Aucune vente sur la période sélectionnée</Empty>
      ) : (
        <>
          <Card>
            <h3>Répartition des ventes par offre</h3>
            <PieChart data={pieData} centerLabel="ventes" />
          </Card>

          <Card>
            <h3>Ventes par période</h3>
            <BarChart
              labels={(stats.labels && stats.labels.length ? stats.labels : stats.months.map((m) => m.month))}
              series={[{ label: 'Ventes', color: colors.primary, values: stats.months.map((m) => parseFloat(m.revenue) || 0) }]}
              formatValue={(n) => `${Math.round(n)} vente(s)`}
            />
          </Card>

          <Card>
            <h3>Détail par offre</h3>
            <Table>
              <thead>
                <tr><th>Offre</th><th>Type</th><th>Ventes</th><th>Part</th></tr>
              </thead>
              <tbody>
                {stats.offers.map((o) => (
                  <tr key={o.offer_id}>
                    <td>{o.name}{!o.is_active ? ' (inactive)' : ''}</td>
                    <td>{o.offer_type === 'digital_product' ? 'Produit' : 'Ticket'}</td>
                    <td><strong>{o.sales}</strong></td>
                    <td>
                      <Bar><div className="fill" style={{ width: `${(o.sales / maxSales) * 100}%` }} /></Bar>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </>
      )}
    </Wrap>
  );
};

export default OfferStatsPanel;
