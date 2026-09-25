import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { colors, spacing, borderRadius, shadows } from '../../config/theme';
import { BarChart } from '../Charts/BarChart';
import {
    useAdminAnalytics,
    AnalyticsCompany,
    ForecastBlock,
    FeeLedgerEntry,
} from '../../hooks/useAdminAnalytics';

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
`;

const Toolbar = styled.div`
  display: flex;
  gap: ${spacing.md};
  flex-wrap: wrap;
  align-items: flex-end;
  background: white;
  border: 1px solid ${colors.border};
  border-radius: ${borderRadius.md};
  padding: ${spacing.md};
  box-shadow: ${shadows.sm};
`;

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${colors.textSecondary};

  select {
    padding: 8px 10px;
    border: 1px solid ${colors.border};
    border-radius: 6px;
    font-size: 0.85rem;
    background: white;
    color: ${colors.textPrimary};
  }
`;

const Spacer = styled.div`flex: 1;`;

const GhostButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid ${colors.border};
  border-radius: 6px;
  background: white;
  color: ${colors.textPrimary};
  font-weight: 600;
  font-size: 0.82rem;
  cursor: pointer;

  &:hover { background: ${colors.neutral}; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: ${spacing.md};
`;

const Kpi = styled.div<{ accent?: string }>`
  background: linear-gradient(135deg, ${(p) => p.accent || colors.primary}12, ${(p) => p.accent || colors.primary}04);
  border: 1px solid ${(p) => p.accent || colors.primary}30;
  border-radius: ${borderRadius.md};
  padding: ${spacing.lg};

  .lbl {
    font-size: 0.7rem;
    color: ${colors.textSecondary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
  }

  .val {
    font-size: 1.35rem;
    font-weight: 700;
    color: ${(p) => p.accent || colors.primary};
    margin-top: 4px;
  }

  .hint {
    font-size: 0.72rem;
    color: ${colors.textSecondary};
    margin-top: 2px;
  }
`;

const Card = styled.div`
  background: white;
  border: 1px solid ${colors.border};
  border-radius: ${borderRadius.md};
  padding: ${spacing.lg};
  box-shadow: ${shadows.sm};

  h3 {
    margin: 0 0 ${spacing.md} 0;
    color: ${colors.textPrimary};
    font-size: 1.05rem;
  }

  .sub {
    font-size: 0.8rem;
    color: ${colors.textSecondary};
    margin: -${spacing.sm} 0 ${spacing.md};
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;

  th {
    text-align: left;
    color: ${colors.textSecondary};
    font-weight: 600;
    padding: ${spacing.sm};
    border-bottom: 2px solid ${colors.border};
    white-space: nowrap;
  }

  td {
    padding: ${spacing.sm};
    border-bottom: 1px solid ${colors.border};
    color: ${colors.textPrimary};
    white-space: nowrap;
  }

  tr:hover td { background: ${colors.neutral}; }
`;

const RightHead = styled.th`text-align: right !important;`;

const TrendBadge = styled.span<{ dir: 'up' | 'down' | 'flat' }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;

  background: ${(p) => (p.dir === 'up' ? '#d4edda' : p.dir === 'down' ? '#f8d7da' : '#eef1f4')};
  color: ${(p) => (p.dir === 'up' ? '#155724' : p.dir === 'down' ? '#721c24' : colors.textSecondary)};
`;

const TwoCols = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${spacing.lg};

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const ForecastStat = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${spacing.md};
  padding: 6px 0;
  border-bottom: 1px dashed ${colors.border};
  font-size: 0.82rem;

  &:last-child { border-bottom: none; }

  span:first-child { color: ${colors.textSecondary}; }
  span:last-child { font-weight: 600; color: ${colors.textPrimary}; }
`;

const MarkButton = styled.button`
  background: ${colors.success};
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.78rem;
  cursor: pointer;

  &:hover { opacity: 0.9; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const Empty = styled.div`
  padding: ${spacing.xl};
  text-align: center;
  color: ${colors.textSecondary};
  border: 1px dashed ${colors.border};
  border-radius: ${borderRadius.md};
`;

const Banner = styled.div`
  padding: ${spacing.md};
  background: ${colors.error}12;
  border: 1px solid ${colors.error};
  border-radius: ${borderRadius.md};
  color: ${colors.error};
  font-size: 0.85rem;
`;

const monthLabel = (key: string) => `${key.slice(5)}/${key.slice(2, 4)}`;

const AdminAnalyticsPanel: React.FC = () => {
    const [months, setMonths] = useState(12);
    const [horizon, setHorizon] = useState(3);
    const [currency, setCurrency] = useState<string | undefined>(undefined);
    const [markingId, setMarkingId] = useState<string | null>(null);

    const { data, isLoading, error, refetch, markWithdrawn } = useAdminAnalytics({
        months,
        forecastMonths: horizon,
        currency,
    });

    const symbol = data?.currency?.symbol || data?.currency?.code || 'XAF';
    const decimals = data?.currency?.decimal_places ?? 0;

    const fmt = useMemo(() => (value: string | number | null | undefined) => {
        const n = parseFloat(String(value ?? '0'));
        if (Number.isNaN(n)) return `0 ${symbol}`;
        return `${n.toLocaleString('fr-FR', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        })} ${symbol}`;
    }, [symbol, decimals]);

    const handleMark = async (companyId: string, companyName: string) => {
        if (!window.confirm(`Marquer les frais disponibles de « ${companyName} » comme retirés ?`)) {
            return;
        }
        setMarkingId(companyId);
        try {
            await markWithdrawn(companyId);
        } catch {
            // handled by refetch/error
        } finally {
            setMarkingId(null);
        }
    };

    const buildForecastChart = (block?: ForecastBlock) => {
        if (!block) return null;
        const historyLabels = block.history.map((h) => monthLabel(h.month));
        const forecastLabels = block.forecast.map((f) => monthLabel(f.month));
        const labels = [...historyLabels, ...forecastLabels];
        const realized = [
            ...block.history.map((h) => parseFloat(h.value) || 0),
            ...block.forecast.map(() => 0),
        ];
        const projected = [
            ...block.history.map(() => 0),
            ...block.forecast.map((f) => parseFloat(f.value) || 0),
        ];
        return (
            <BarChart
                labels={labels}
                series={[
                    { label: 'Réalisé', color: colors.primary, values: realized },
                    { label: 'Prévision (OLS)', color: colors.warning, values: projected },
                ]}
                height={200}
                formatValue={(n) => fmt(n)}
            />
        );
    };

    if (isLoading && !data) return <Empty>Chargement des statistiques…</Empty>;
    if (error && !data) return <Banner>{error}</Banner>;
    if (!data) return <Empty>Aucune donnée</Empty>;

    const kpi = data.kpi;
    const inflowForecast = data.forecast.inflow;
    const feesForecast = data.forecast.fees;

    return (
        <Wrap>
            <Toolbar>
                <Field>
                    Période
                    <select value={months} onChange={(e) => setMonths(Number(e.target.value))}>
                        <option value={3}>3 mois</option>
                        <option value={6}>6 mois</option>
                        <option value={12}>12 mois</option>
                        <option value={24}>24 mois</option>
                    </select>
                </Field>
                <Field>
                    Horizon prévision
                    <select value={horizon} onChange={(e) => setHorizon(Number(e.target.value))}>
                        <option value={1}>1 mois</option>
                        <option value={3}>3 mois</option>
                        <option value={6}>6 mois</option>
                    </select>
                </Field>
                <Field>
                    Devise
                    <select
                        value={currency || data.currency?.code || ''}
                        onChange={(e) => setCurrency(e.target.value || undefined)}
                    >
                        {data.available_currencies.map((c) => (
                            <option key={c.code} value={c.code}>
                                {c.code}{c.is_default ? ' (défaut)' : ''}
                            </option>
                        ))}
                    </select>
                </Field>
                <Spacer />
                <GhostButton onClick={() => refetch()} disabled={isLoading}>
                    {isLoading ? 'Actualisation…' : 'Actualiser'}
                </GhostButton>
            </Toolbar>

            <KpiGrid>
                <Kpi accent={colors.primary}>
                    <div className="lbl">Encaissements bruts</div>
                    <div className="val">{fmt(kpi.gross_inflow)}</div>
                    <div className="hint">{data.window.from} → {data.window.to}</div>
                </Kpi>
                <Kpi accent={colors.success}>
                    <div className="lbl">Frais admin (période)</div>
                    <div className="val">{fmt(kpi.fees_window)}</div>
                    <div className="hint">Seul revenu de Tikta</div>
                </Kpi>
                <Kpi accent={colors.warning}>
                    <div className="lbl">Frais disponibles (cumul)</div>
                    <div className="val">{fmt(kpi.fees_available_all_time)}</div>
                    <div className="hint">Collectés {fmt(kpi.fees_total_all_time)}</div>
                </Kpi>
                <Kpi accent={colors.info}>
                    <div className="lbl">Retraits</div>
                    <div className="val">{fmt(kpi.total_withdrawn)}</div>
                    <div className="hint">Net encaissé {fmt(kpi.net_inflow)}</div>
                </Kpi>
                <Kpi>
                    <div className="lbl">Paiements</div>
                    <div className="val">{kpi.payments_count.toLocaleString('fr-FR')}</div>
                    <div className="hint">Panier moyen {fmt(kpi.avg_ticket)}</div>
                </Kpi>
                <Kpi>
                    <div className="lbl">Entreprises actives</div>
                    <div className="val">{kpi.companies_count}</div>
                    <div className="hint">Sur la période</div>
                </Kpi>
            </KpiGrid>

            <TwoCols>
                <Card>
                    <h3>Prévision des encaissements</h3>
                    <div className="sub">
                        {inflowForecast.method.toUpperCase()} · tendance{' '}
                        <TrendBadge dir={inflowForecast.trend}>
                            {inflowForecast.trend === 'up' ? '↑ hausse' : inflowForecast.trend === 'down' ? '↓ baisse' : '→ stable'}
                        </TrendBadge>{' '}
                        · R² {inflowForecast.r2}
                    </div>
                    {buildForecastChart(inflowForecast)}
                    <ForecastStat><span>Pente mensuelle</span><span>{fmt(inflowForecast.slope)}</span></ForecastStat>
                    <ForecastStat><span>Dernier mois</span><span>{fmt(inflowForecast.last_value)}</span></ForecastStat>
                    <ForecastStat><span>Moyenne mobile (3)</span><span>{fmt(inflowForecast.moving_average)}</span></ForecastStat>
                    {inflowForecast.forecast.map((f) => (
                        <ForecastStat key={f.month}>
                            <span>{f.month} (IC 95%)</span>
                            <span>{fmt(f.value)} · [{fmt(f.lower)} – {fmt(f.upper)}]</span>
                        </ForecastStat>
                    ))}
                </Card>

                <Card>
                    <h3>Prévision des frais admin</h3>
                    <div className="sub">
                        {feesForecast.method.toUpperCase()} · tendance{' '}
                        <TrendBadge dir={feesForecast.trend}>
                            {feesForecast.trend === 'up' ? '↑ hausse' : feesForecast.trend === 'down' ? '↓ baisse' : '→ stable'}
                        </TrendBadge>{' '}
                        · R² {feesForecast.r2}
                    </div>
                    {buildForecastChart(feesForecast)}
                    <ForecastStat><span>Pente mensuelle</span><span>{fmt(feesForecast.slope)}</span></ForecastStat>
                    <ForecastStat><span>Dernier mois</span><span>{fmt(feesForecast.last_value)}</span></ForecastStat>
                    <ForecastStat><span>Moyenne mobile (3)</span><span>{fmt(feesForecast.moving_average)}</span></ForecastStat>
                    {feesForecast.forecast.map((f) => (
                        <ForecastStat key={f.month}>
                            <span>{f.month} (IC 95%)</span>
                            <span>{fmt(f.value)} · [{fmt(f.lower)} – {fmt(f.upper)}]</span>
                        </ForecastStat>
                    ))}
                </Card>
            </TwoCols>

            <Card>
                <h3>Montants entrés par entreprise</h3>
                <div className="sub">Classement sur la période {data.window.from} → {data.window.to}</div>
                {data.companies.length === 0 ? (
                    <Empty>Aucun encaissement sur la période</Empty>
                ) : (
                    <Table>
                        <thead>
                            <tr>
                                <th>Entreprise</th>
                                <RightHead>Encaissements</RightHead>
                                <RightHead>Retraits</RightHead>
                                <RightHead>Frais</RightHead>
                                <RightHead>Paiements</RightHead>
                                <RightHead>Panier moyen</RightHead>
                                <RightHead>Part</RightHead>
                                <RightHead>MoM</RightHead>
                                <th>Dernier paiement</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.companies.map((c: AnalyticsCompany) => (
                                <tr key={c.company_id}>
                                    <td><strong>{c.company_name}</strong></td>
                                    <td style={{ textAlign: 'right' }}>{fmt(c.inflow)}</td>
                                    <td style={{ textAlign: 'right' }}>{fmt(c.withdrawal)}</td>
                                    <td style={{ textAlign: 'right' }}>{fmt(c.fees)}</td>
                                    <td style={{ textAlign: 'right' }}>{c.payments_count}</td>
                                    <td style={{ textAlign: 'right' }}>{fmt(c.avg_ticket)}</td>
                                    <td style={{ textAlign: 'right' }}>{c.share_pct}%</td>
                                    <td style={{ textAlign: 'right' }}>
                                        {c.mom_pct === null ? '—' : `${c.mom_pct > 0 ? '+' : ''}${c.mom_pct}%`}
                                    </td>
                                    <td>{c.last_payment_at ? new Date(c.last_payment_at).toLocaleDateString('fr-FR') : '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </Card>

            <Card>
                <h3>Détail mensuel</h3>
                <Table>
                    <thead>
                        <tr>
                            <th>Mois</th>
                            <RightHead>Encaissements</RightHead>
                            <RightHead>Retraits</RightHead>
                            <RightHead>Net</RightHead>
                            <RightHead>Frais</RightHead>
                            <RightHead>Paiements</RightHead>
                        </tr>
                    </thead>
                    <tbody>
                        {data.months.map((m) => (
                            <tr key={m.month}>
                                <td>{m.month}</td>
                                <td style={{ textAlign: 'right' }}>{fmt(m.inflow)}</td>
                                <td style={{ textAlign: 'right' }}>{fmt(m.withdrawal)}</td>
                                <td style={{ textAlign: 'right' }}>{fmt(m.net)}</td>
                                <td style={{ textAlign: 'right' }}>{fmt(m.fees)}</td>
                                <td style={{ textAlign: 'right' }}>{m.payments_count}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>

            <Card>
                <h3>Frais de retrait — collecte & reversement</h3>
                <div className="sub">
                    Unique source de revenus administrateur. « Disponible » = frais non encore marqués comme retirés.
                </div>
                {data.fee_ledger.length === 0 ? (
                    <Empty>Aucun frais de retrait collecté pour le moment.</Empty>
                ) : (
                    <Table>
                        <thead>
                            <tr>
                                <th>Entreprise</th>
                                <RightHead>Frais collectés</RightHead>
                                <RightHead>Déjà retirés</RightHead>
                                <RightHead>Disponible</RightHead>
                                <RightHead>Action</RightHead>
                            </tr>
                        </thead>
                        <tbody>
                            {data.fee_ledger.map((entry: FeeLedgerEntry) => (
                                <tr key={entry.company_id}>
                                    <td><strong>{entry.company_name}</strong></td>
                                    <td style={{ textAlign: 'right' }}>{fmt(entry.total_fees_collected)}</td>
                                    <td style={{ textAlign: 'right' }}>{fmt(entry.total_marked_as_withdrawn)}</td>
                                    <td style={{ textAlign: 'right' }}>{fmt(entry.available_balance)}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        {parseFloat(entry.available_balance) > 0 && (
                                            <MarkButton
                                                onClick={() => handleMark(entry.company_id, entry.company_name)}
                                                disabled={markingId === entry.company_id}
                                            >
                                                {markingId === entry.company_id ? '…' : 'Marquer retiré'}
                                            </MarkButton>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </Card>
        </Wrap>
    );
};

export default AdminAnalyticsPanel;
