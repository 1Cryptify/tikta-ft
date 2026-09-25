import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { colors, spacing, borderRadius, shadows } from '../../config/theme';
import { zonesApi, CompanyStats } from '../../services/zoneService';
import { BarChart } from '../Charts/BarChart';

const Wrap = styled.div`display: flex; flex-direction: column; gap: ${spacing.lg};`;

const KpiGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: ${spacing.md};
`;

const Kpi = styled.div`
  background: linear-gradient(135deg, ${colors.primary}12, ${colors.primary}04);
  border: 1px solid ${colors.primary}30; border-radius: ${borderRadius.md}; padding: ${spacing.lg};
  .lbl { font-size: 0.72rem; color: ${colors.textSecondary}; text-transform: uppercase; letter-spacing: .5px; font-weight: 600; }
  .val { font-size: 1.4rem; font-weight: 700; color: ${colors.primary}; margin-top: 4px; }
`;

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

const GaugeWrap = styled.div`
  height: 8px; background: ${colors.neutral}; border-radius: 999px; overflow: hidden; min-width: 90px;
  .fill { height: 100%; border-radius: 999px; }
`;

const Empty = styled.div`
  padding: ${spacing.xl}; text-align: center; color: ${colors.textSecondary};
  border: 1px dashed ${colors.border}; border-radius: ${borderRadius.md};
`;

const Banner = styled.div`
  padding: ${spacing.md}; background: ${colors.error}12; border: 1px solid ${colors.error};
  border-radius: ${borderRadius.md}; color: ${colors.error}; font-size: 0.85rem;
`;

const fmt = (v?: string | number | null) => {
  const n = parseFloat(String(v ?? '0'));
  return Number.isNaN(n) ? '0' : n.toLocaleString('en-US');
};

const CompanyStatsPanel: React.FC = () => {
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setStats(await zonesApi.companyStats(12));
    } catch (e: any) {
      setError(e?.message || 'Impossible de charger les statistiques');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Empty>Chargement…</Empty>;
  if (error) return <Banner>{error}</Banner>;
  if (!stats) return <Empty>Aucune statistique disponible</Empty>;

  const cur = stats.currency_code || 'XAF';
  const maxZoneRevenue = Math.max(1, ...stats.zones.map((z) => parseFloat(z.revenue) || 0));

  return (
    <Wrap>
      <KpiGrid>
        <Kpi><div className="lbl">Revenus encaissés</div><div className="val">{fmt(stats.kpi.total_revenue)} {cur}</div></Kpi>
        <Kpi><div className="lbl">Total retiré</div><div className="val">{fmt(stats.kpi.total_withdrawn)} {cur}</div></Kpi>
        <Kpi><div className="lbl">Solde disponible</div><div className="val">{fmt(stats.kpi.available_balance)} {cur}</div></Kpi>
        <Kpi><div className="lbl">Paiements</div><div className="val">{stats.kpi.payments_count}</div></Kpi>
        <Kpi><div className="lbl">Zones</div><div className="val">{stats.kpi.zones_count}</div></Kpi>
      </KpiGrid>

      <Card>
        <h3>Revenus & retraits par mois</h3>
        <BarChart
          labels={stats.months.map((m) => `${m.month.slice(5)}/${m.month.slice(2, 4)}`)}
          series={[
            { label: 'Revenus', color: colors.primary, values: stats.months.map((m) => parseFloat(m.revenue) || 0) },
            { label: 'Retraits', color: colors.warning, values: stats.months.map((m) => parseFloat(m.withdrawn) || 0) },
          ]}
          formatValue={(n) => `${Math.round(n).toLocaleString('en-US')} ${cur}`}
        />
      </Card>

      <Card>
        <h3>Zones ({stats.zones.length})</h3>
        {stats.zones.length === 0 ? (
          <Empty>Aucune zone pour cette entreprise</Empty>
        ) : (
          <Table>
            <thead>
              <tr><th>Zone</th><th>Revenus</th><th>Paiements</th><th>Solde associés</th><th>Part du total</th></tr>
            </thead>
            <tbody>
              {stats.zones.map((z) => {
                const rev = parseFloat(z.revenue) || 0;
                return (
                  <tr key={z.zone_id}>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: z.color || colors.primary, display: 'inline-block' }} />
                        {z.name}{!z.is_active ? ' (désactivée)' : ''}
                      </span>
                    </td>
                    <td><strong>{fmt(rev)} {cur}</strong></td>
                    <td>{z.payments_count}</td>
                    <td>{fmt(z.associate_balance)} {cur}</td>
                    <td>
                      <GaugeWrap>
                        <div className="fill" style={{ width: `${(rev / maxZoneRevenue) * 100}%`, background: z.color || colors.primary }} />
                      </GaugeWrap>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>

      <Card>
        <h3>Historique mensuel</h3>
        <Table>
          <thead><tr><th>Mois</th><th>Revenus</th><th>Retraits</th></tr></thead>
          <tbody>
            {stats.months.map((m) => (
              <tr key={m.month}><td>{m.month}</td><td>{fmt(m.revenue)} {cur}</td><td>{fmt(m.withdrawn)} {cur}</td></tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </Wrap>
  );
};

export default CompanyStatsPanel;
