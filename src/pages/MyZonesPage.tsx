import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { colors, spacing, borderRadius, shadows } from '../config/theme';
import { zonesApi, MyZoneItem, ZoneWithdrawal, ZoneWithdrawalContact, AssociateStats } from '../services/zoneService';
import { BarChart } from '../components/Charts/BarChart';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';

const ContentSection = styled.div`
  padding: ${spacing.xl};
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

const PageHeader = styled.div`
  margin-bottom: ${spacing.xl};
  h1 { font-size: 1.8rem; color: ${colors.textPrimary}; margin-bottom: ${spacing.xs}; }
  p { color: ${colors.textSecondary}; font-size: 0.875rem; }
`;

const SectionTitle = styled.h2`
  font-size: 1.1rem;
  color: ${colors.textPrimary};
  margin: ${spacing.xl} 0 ${spacing.md};
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${spacing.lg};
`;

const Card = styled.div`
  background: white;
  border: 1px solid ${colors.border};
  border-radius: ${borderRadius.md};
  padding: ${spacing.lg};
  box-shadow: ${shadows.sm};
`;

const ColorDot = styled.span<{ color: string }>`
  display: inline-block;
  width: 14px; height: 14px; border-radius: 50%;
  background: ${(props) => props.color}; margin-right: ${spacing.xs};
`;

const ZoneName = styled.h3`
  font-size: 1rem; color: ${colors.textPrimary}; margin: 0 0 ${spacing.xs} 0;
  display: flex; align-items: center;
`;

const CardMeta = styled.div`
  display: flex; flex-direction: column; gap: ${spacing.xs};
  font-size: 0.82rem; color: ${colors.textSecondary}; margin-bottom: ${spacing.md};
  strong { color: ${colors.textPrimary}; }
`;

const PrimaryButton = styled.button`
  padding: ${spacing.sm} ${spacing.lg};
  background: ${colors.primary}; color: white; border: none;
  border-radius: ${borderRadius.md}; cursor: pointer; font-weight: 600;
  font-size: 0.875rem;
  &:hover { background: ${colors.primaryLight}; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const GhostButton = styled.button`
  padding: ${spacing.sm} ${spacing.lg};
  background: white; color: ${colors.textSecondary};
  border: 1px solid ${colors.border}; border-radius: ${borderRadius.md};
  cursor: pointer; font-weight: 600; font-size: 0.875rem;
  &:hover { background: ${colors.neutral}; color: ${colors.textPrimary}; }
  &.success { color: ${colors.success}; border-color: ${colors.success}; &:hover { background: ${colors.success}10; } }
  &.danger { color: ${colors.error}; border-color: ${colors.error}; &:hover { background: ${colors.error}10; } }
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: ${spacing.xs} ${spacing.sm};
  border-radius: 4px;
  font-size: 0.72rem;
  font-weight: 700;
  width: fit-content;
  background-color: ${(props) =>
    props.status === 'active' || props.status === 'completed' ? `${colors.success}20` :
    props.status === 'rejected' ? `${colors.error}20` :
    props.status === 'approved' ? `${colors.info}20` :
    props.status === 'processing' ? `${colors.primary}20` : `${colors.warning}20`};
  color: ${(props) =>
    props.status === 'active' || props.status === 'completed' ? colors.success :
    props.status === 'rejected' ? colors.error :
    props.status === 'approved' ? colors.info :
    props.status === 'processing' ? colors.primary : colors.warning};
`;

const EmptyState = styled.div`
  padding: ${spacing.xl};
  text-align: center;
  color: ${colors.textSecondary};
  border: 1px dashed ${colors.border};
  border-radius: ${borderRadius.md};
`;

const MenuNav = styled.div`
  display: flex; gap: ${spacing.md}; margin-bottom: ${spacing.lg};
  border-bottom: 1px solid ${colors.border};
`;

const MenuButton = styled.button<{ isActive: boolean }>`
  background: none; border: none; padding: ${spacing.md} ${spacing.lg};
  font-size: 0.95rem; cursor: pointer;
  color: ${(p) => (p.isActive ? colors.primary : colors.textSecondary)};
  border-bottom: 3px solid ${(p) => (p.isActive ? colors.primary : 'transparent')};
  font-weight: ${(p) => (p.isActive ? '600' : '400')};
  &:hover { color: ${colors.textPrimary}; }
`;

const Table = styled.table`
  width: 100%; border-collapse: collapse; font-size: 0.82rem;
  th { text-align: left; color: ${colors.textSecondary}; font-weight: 600; padding: ${spacing.sm}; border-bottom: 2px solid ${colors.border}; }
  td { padding: ${spacing.sm}; border-bottom: 1px solid ${colors.border}; color: ${colors.textPrimary}; }
  tr:hover td { background: ${colors.neutral}; }
`;

const MiniStat = styled.div`
  display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${spacing.md}; margin-bottom: ${spacing.lg};
`;

const StatBox = styled.div`
  background: linear-gradient(135deg, ${colors.primary}12, ${colors.primary}04);
  border: 1px solid ${colors.primary}30; border-radius: ${borderRadius.md}; padding: ${spacing.md};
  .lbl { font-size: 0.72rem; color: ${colors.textSecondary}; text-transform: uppercase; letter-spacing: .5px; font-weight: 600; }
  .val { font-size: 1.25rem; font-weight: 700; color: ${colors.primary}; }
`;

const ErrorMsg = styled.div`
  padding: ${spacing.md}; background: ${colors.error}15; border: 1px solid ${colors.error};
  border-radius: ${borderRadius.md}; color: ${colors.error}; margin-bottom: ${spacing.lg};
  font-size: 0.875rem;
`;

const SuccessMsg = styled.div`
  padding: ${spacing.md}; background: ${colors.success}15; border: 1px solid ${colors.success};
  border-radius: ${borderRadius.md}; color: ${colors.success}; margin-bottom: ${spacing.lg};
  font-size: 0.875rem;
`;

const ModalOverlay = styled.div`
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center; z-index: 2000;
`;

const ModalContent = styled.div`
  background: white; border-radius: ${borderRadius.lg}; padding: ${spacing.xl};
  max-width: 480px; width: 92%; max-height: 90vh; overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
`;

const ModalHeader = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: ${spacing.lg}; border-bottom: 1px solid ${colors.border}; padding-bottom: ${spacing.md};
  h2 { margin: 0; font-size: 1.15rem; color: ${colors.textPrimary}; }
`;

const CloseBtn = styled.button`
  background: none; border: none; font-size: 1.5rem; cursor: pointer;
  color: ${colors.textSecondary}; line-height: 1;
  &:hover { color: ${colors.textPrimary}; }
`;

const FormGroup = styled.div`
  margin-bottom: ${spacing.md};
  label { display: block; margin-bottom: ${spacing.xs}; color: ${colors.textPrimary}; font-weight: 500; font-size: 0.85rem; }
  input, select {
    width: 100%; padding: ${spacing.sm};
    border: 1px solid ${colors.border}; border-radius: ${borderRadius.md};
    font-size: 0.9rem; color: ${colors.textPrimary};
    &:focus { outline: none; border-color: ${colors.primary}; box-shadow: 0 0 0 3px ${colors.primary}20; }
  }
  input[type='checkbox'] {
    width: 18px; height: 18px; min-width: 18px; padding: 0; margin: 0;
    accent-color: ${colors.primary}; cursor: pointer; flex: 0 0 auto;
  }
`;

const CheckLine = styled.label`
  display: flex; align-items: center; gap: ${spacing.sm};
  font-size: 0.88rem; color: ${colors.textPrimary}; cursor: pointer;
  padding: ${spacing.xs} 0; user-select: none;
  input[type='checkbox'] {
    width: 18px; height: 18px; min-width: 18px; padding: 0; margin: 0;
    accent-color: ${colors.primary}; cursor: pointer; flex: 0 0 auto;
  }
`;

const FormRow = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: ${spacing.md};
`;

const ModalFooter = styled.div`
  display: flex; justify-content: flex-end; gap: ${spacing.md}; margin-top: ${spacing.xl};
`;

const WithdrawList = styled.div`
  display: flex; flex-direction: column; gap: ${spacing.md};
`;

const WithdrawRow = styled.div`
  display: flex; justify-content: space-between; align-items: center; gap: ${spacing.md};
  padding: ${spacing.md}; border: 1px solid ${colors.border}; border-radius: ${borderRadius.md};
  font-size: 0.85rem;
  .info { font-weight: 600; color: ${colors.textPrimary}; }
  .meta { color: ${colors.textSecondary}; }
`;

const fmt = (v?: string | number | null): string => {
  const n = parseFloat(String(v ?? '0'));
  return Number.isNaN(n) ? '0' : n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const fmtDate = (iso?: string | null): string => {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }); }
  catch { return iso; }
};

export const MyZonesPage: React.FC = () => {
  const { user } = useAuth();
  const [zones, setZones] = useState<MyZoneItem[]>([]);
  const [pending, setPending] = useState<MyZoneItem[]>([]);
  const [withdrawals, setWithdrawals] = useState<ZoneWithdrawal[]>([]);
  const [contacts, setContacts] = useState<ZoneWithdrawalContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [withdrawFor, setWithdrawFor] = useState<MyZoneItem | null>(null);
  const [amount, setAmount] = useState('');
  const [selectedContactId, setSelectedContactId] = useState('');
  const [contactsFor, setContactsFor] = useState<MyZoneItem | null>(null);
  const [contactForm, setContactForm] = useState({ number: '', provider: 'MTN', label: '' });
  const [savingContact, setSavingContact] = useState(false);
  const [autoFor, setAutoFor] = useState<MyZoneItem | null>(null);
  const [autoLoading, setAutoLoading] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [autoExists, setAutoExists] = useState(false);
  const [autoConfigId, setAutoConfigId] = useState<string | null>(null);
  const [autoForm, setAutoForm] = useState({
    is_enabled: false,
    minimum_amount: '',
    withdraw_full_balance: true,
    fixed_amount: '',
    contact_id: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [view, setView] = useState<'zones' | 'stats'>('zones');
  const [stats, setStats] = useState<AssociateStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const { zones: z, pending_confirmations: p } = await zonesApi.myZones();
      setZones(z);
      setPending(p);
      const [wds, contactLists] = await Promise.all([
        zonesApi.withdrawals(),
        Promise.all(z.map((zi) => zonesApi.withdrawalContacts(zi.zone_id).catch(() => [] as ZoneWithdrawalContact[]))),
      ]);
      setWithdrawals(wds);
      setContacts(contactLists.flat());
    } catch (e: any) {
      setError(e.message || 'Impossible de charger vos zones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      setStats(await zonesApi.associateStats(12));
    } catch (e: any) {
      setError(e.message || 'Impossible de charger les statistiques');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (view === 'stats') loadStats();
  }, [view, loadStats]);

  const confirm = async (m: MyZoneItem) => {
    await zonesApi.confirmManager(m.id);
    setSuccess(`Zone "${m.zone_name}" confirmée — vous en gérez désormais les transactions.`);
    setTimeout(() => setSuccess(''), 4000);
    await load();
  };

  const submitWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawFor) return;
    const amt = parseFloat(amount);
    const balance = parseFloat(withdrawFor.associate_balance || '0');
    if (!amt || amt <= 0) { alert('Montant invalide'); return; }
    if (amt % 50 !== 0) { alert('Le montant doit être un multiple de 50.'); return; }
    if (amt > balance) { alert(`Votre solde est de ${fmt(balance)} ${withdrawFor.currency_code}.`); return; }
    const contact = contacts.find((c) => c.id === selectedContactId);
    if (!contact) { alert('Sélectionnez un contact de retrait validé.'); return; }
    setSubmitting(true);
    try {
      const created = await zonesApi.createWithdrawal({
        zone_id: withdrawFor.zone_id,
        amount: amt,
        currency: withdrawFor.currency_code || 'XAF',
        contact_id: contact.id,
        recipient_number: contact.number,
        provider: contact.provider,
      });
      setSuccess(
        created.status === 'completed'
          ? 'Retrait payé automatiquement vers le contact validé.'
          : created.status === 'approved'
            ? 'Retrait initié : le paiement automatique a échoué et sera relancé (fonds bloqués).'
            : 'Retrait initié.'
      );
      setTimeout(() => setSuccess(''), 6000);
      setWithdrawFor(null);
      setAmount('');
      setSelectedContactId('');
      await load();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la demande');
    } finally {
      setSubmitting(false);
    }
  };

  const openAuto = async (m: MyZoneItem) => {
    setAutoFor(m);
    setAutoLoading(true);
    try {
      const cfgs = await zonesApi.getAutoWithdrawals(m.zone_id);
      const cfg = cfgs.find((c) => c.manager_id === m.id) || cfgs[0];
      setAutoConfigId(cfg?.id || null);
      setAutoExists(!!cfg);
      setAutoForm({
        is_enabled: cfg?.is_enabled || false,
        minimum_amount: cfg?.minimum_amount || '',
        withdraw_full_balance: cfg?.withdraw_full_balance ?? true,
        fixed_amount: cfg?.fixed_amount || '',
        contact_id: cfg?.contact_id || '',
      });
    } catch {
      setAutoConfigId(null);
      setAutoExists(false);
      setAutoForm({ is_enabled: false, minimum_amount: '', withdraw_full_balance: true, fixed_amount: '', contact_id: '' });
    } finally {
      setAutoLoading(false);
    }
  };

  const disableAuto = async () => {
    if (!autoFor) return;
    try {
      await zonesApi.saveAutoWithdrawal(autoFor.zone_id, { manager_id: autoFor.id, is_enabled: false });
      setAutoFor(null);
      await load();
    } catch (err: any) {
      alert(err.message || 'Erreur');
    }
  };

  const deleteAuto = async () => {
    if (!autoConfigId) return;
    if (!confirm('Supprimer la configuration de retrait automatique de cette zone ?')) return;
    try {
      await zonesApi.deleteAutoWithdrawal(autoConfigId);
      setAutoFor(null);
      await load();
    } catch (err: any) {
      alert(err.message || 'Erreur');
    }
  };

  const saveAuto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!autoFor) return;
    if (autoForm.is_enabled && !autoForm.contact_id) {
      alert('Sélectionnez un contact de retrait validé pour activer le retrait automatique.');
      return;
    }
    setAutoSaving(true);
    try {
      await zonesApi.saveAutoWithdrawal(autoFor.zone_id, {
        manager_id: autoFor.id,
        is_enabled: autoForm.is_enabled,
        minimum_amount: parseFloat(autoForm.minimum_amount) || 0,
        withdraw_full_balance: autoForm.withdraw_full_balance,
        fixed_amount: autoForm.withdraw_full_balance ? null : (parseFloat(autoForm.fixed_amount) || null),
        contact_id: autoForm.contact_id || null,
      });
      setSuccess('Retrait automatique enregistré.');
      setTimeout(() => setSuccess(''), 5000);
      setAutoFor(null);
      await load();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de l enregistrement');
    } finally {
      setAutoSaving(false);
    }
  };

  const submitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactsFor) return;
    if (contactForm.number.replace(/[^0-9]/g, '').length < 9) { alert('Numéro de retrait invalide'); return; }
    setSavingContact(true);
    try {
      await zonesApi.addWithdrawalContact(contactsFor.zone_id, {
        number: contactForm.number.trim(),
        provider: contactForm.provider,
        label: contactForm.label.trim(),
      });
      setSuccess('Contact de retrait soumis : il attend la validation de l entreprise puis de Tikta.');
      setTimeout(() => setSuccess(''), 6000);
      setContactForm({ number: '', provider: 'MTN', label: '' });
      await load();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de l enregistrement du contact');
    } finally {
      setSavingContact(false);
    }
  };

  return (
    <ContentSection>
      <PageHeader>
        <h1>Mes zones</h1>
        <p>Espace associé <strong>{user?.email}</strong> : consultez vos zones, vos soldes et effectuez des retraits (double validation entreprise puis Tikta).</p>
      </PageHeader>

      {error && <ErrorMsg>{error}</ErrorMsg>}
      {success && <SuccessMsg>{success}</SuccessMsg>}

      <MenuNav>
        <MenuButton isActive={view === 'zones'} onClick={() => setView('zones')}>Mes zones</MenuButton>
        <MenuButton isActive={view === 'stats'} onClick={() => setView('stats')}>Statistiques</MenuButton>
      </MenuNav>

      {view === 'stats' && (
        statsLoading ? <LoadingSpinner /> : !stats ? (
          <EmptyState>Aucune statistique disponible</EmptyState>
        ) : (
          <>
            <SectionTitle>Vue d'ensemble</SectionTitle>
            <MiniStat>
              <StatBox><div className="lbl">Revenus générés</div><div className="val">{fmt(stats.totals.revenue)} {stats.currency_code}</div></StatBox>
              <StatBox><div className="lbl">Total retiré</div><div className="val">{fmt(stats.totals.withdrawn)} {stats.currency_code}</div></StatBox>
              <StatBox><div className="lbl">Solde associé</div><div className="val">{fmt(stats.totals.balance)} {stats.currency_code}</div></StatBox>
            </MiniStat>

            <SectionTitle>Revenus par mois</SectionTitle>
            <Card>
              <BarChart
                labels={stats.months.map((m) => `${m.month.slice(5)}/${m.month.slice(2, 4)}`)}
                series={[
                  { label: 'Revenus', color: colors.primary, values: stats.months.map((m) => parseFloat(m.revenue) || 0) },
                  { label: 'Retraits', color: colors.warning, values: stats.months.map((m) => parseFloat(m.withdrawn) || 0) },
                ]}
                formatValue={(n) => `${Math.round(n).toLocaleString('en-US')} ${stats.currency_code}`}
              />
            </Card>

            <SectionTitle>Historique mensuel</SectionTitle>
            <Table>
              <thead><tr><th>Mois</th><th>Revenus</th><th>Retraits</th></tr></thead>
              <tbody>
                {stats.months.map((m) => (
                  <tr key={m.month}><td>{m.month}</td><td>{fmt(m.revenue)}</td><td>{fmt(m.withdrawn)}</td></tr>
                ))}
              </tbody>
            </Table>

            <SectionTitle>Par zone</SectionTitle>
            {stats.zones.length === 0 ? <EmptyState>Aucune donnée par zone</EmptyState> : (
              <Table>
                <thead><tr><th>Zone</th><th>Revenus</th><th>Retraits</th></tr></thead>
                <tbody>
                  {stats.zones.map((z) => (
                    <tr key={z.zone_id}><td>{z.zone_name || '—'}</td><td>{fmt(z.revenue)}</td><td>{fmt(z.withdrawn)}</td></tr>
                  ))}
                </tbody>
              </Table>
            )}
          </>
        )
      )}

      {view === 'zones' && (loading ? <LoadingSpinner /> : (
        <>
          {pending.length > 0 && (
            <>
              <SectionTitle>Confirmations en attente</SectionTitle>
              <CardGrid>
                {pending.map((m) => (
                  <Card key={m.id}>
                    <ZoneName><ColorDot color={m.zone_color} />{m.zone_name}</ZoneName>
                    <CardMeta>
                      <span>Entreprise : <strong>{m.company_name}</strong></span>
                      <span>Votre part : <strong>{m.percentage}%</strong></span>
                      <span>Statut : <StatusBadge status={m.status}>{m.status_display}</StatusBadge></span>
                    </CardMeta>
                    <PrimaryButton onClick={() => confirm(m)}>Confirmer cette zone</PrimaryButton>
                  </Card>
                ))}
              </CardGrid>
            </>
          )}

          <SectionTitle>Mes zones actives</SectionTitle>
          {zones.length === 0 ? (
            <EmptyState>
              Aucune zone confirmée. L'entreprise doit vous attribuer une zone (votre email) pour que vous la
              voyiez ici et puissiez effectuer des retraits.
            </EmptyState>
          ) : (
            <CardGrid>
              {zones.map((m) => {
                const balance = parseFloat(m.associate_balance || '0');
                return (
                  <Card key={m.id}>
                    <ZoneName><ColorDot color={m.zone_color} />{m.zone_name}</ZoneName>
                    <CardMeta>
                      <span>Entreprise : <strong>{m.company_name}</strong></span>
                      <span>Votre part : <strong>{m.percentage}%</strong></span>
                      <span>Revenus générés : <strong>{fmt(m.total_generated)} {m.currency_code}</strong></span>
                      <span>Solde associé : <strong>{fmt(m.associate_balance)} {m.currency_code}</strong></span>
                      <span>
                        Retrait auto : <strong style={{ color: m.automatic_withdrawal_enabled ? colors.success : colors.textSecondary }}>
                          {m.automatic_withdrawal_enabled ? `Activé → ${m.automatic_withdrawal_contact || 'contact'}` : 'Désactivé'}
                        </strong>
                      </span>
                    </CardMeta>
                    <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap' }}>
                      <GhostButton
                        className="success"
                        disabled={balance <= 0}
                        onClick={() => { setWithdrawFor(m); setSelectedContactId(''); }}
                        title={balance <= 0 ? 'Solde associé vide' : 'Demander un retrait'}
                      >
                        Demander un retrait
                      </GhostButton>
                      <GhostButton onClick={() => setContactsFor(m)}>
                        Contacts de retrait ({contacts.filter((c) => c.zone_id === m.zone_id).length})
                      </GhostButton>
                      <GhostButton onClick={() => openAuto(m)}>Retrait automatique</GhostButton>
                    </div>
                  </Card>
                );
              })}
            </CardGrid>
          )}

          <SectionTitle>Demandes de retrait</SectionTitle>
          {withdrawals.length === 0 ? (
            <EmptyState>Aucune demande de retrait</EmptyState>
          ) : (
            <WithdrawList>
              {withdrawals.map((wd) => (
                <WithdrawRow key={wd.id}>
                  <div>
                    <div className="info">
                      {fmt(wd.amount)} {wd.currency_code} — {wd.zone_name}
                    </div>
                    <div className="meta">
                      Reçu vers {wd.recipient_number || '—'} · {fmtDate(wd.created_at)}
                      {wd.status === 'completed' && ' · Payé automatiquement'}
                      {wd.status === 'approved' && ' · Paiement à relancer (fonds bloqués)'}
                      {wd.status === 'processing' && ' · Paiement en cours'}
                      {wd.status === 'company_approved' && ' · En attente de la validation Tikta'}
                    </div>
                  </div>
                  <StatusBadge status={wd.status}>{wd.status_display}</StatusBadge>
                </WithdrawRow>
              ))}
            </WithdrawList>
          )}
        </>
      )}

      {withdrawFor && (
        <ModalOverlay onClick={() => setWithdrawFor(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>Retrait — {withdrawFor.zone_name}</h2>
              <CloseBtn onClick={() => setWithdrawFor(null)}>×</CloseBtn>
            </ModalHeader>
            <form onSubmit={submitWithdrawal}>
              <FormGroup>
                <label>Montant ({withdrawFor.currency_code}) — disponible : {fmt(withdrawFor.associate_balance)}</label>
                <input type="number" min={50} step={50} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Multiple de 50" required />
              </FormGroup>
              {(() => {
                const validated = contacts.filter((c) => c.zone_id === withdrawFor.zone_id && c.is_validated);
                if (validated.length === 0) {
                  return (
                    <FormGroup>
                      <label>Contact de retrait</label>
                      <div style={{ fontSize: 0.82 + 'rem', color: colors.warning, lineHeight: 1.5 }}>
                        Aucun contact de retrait validé pour cette zone. Enregistrez un numéro via
                        « Contacts de retrait », puis attendez la validation de l'entreprise et de Tikta.
                      </div>
                    </FormGroup>
                  );
                }
                return (
                  <FormGroup>
                    <label>Contact de retrait validé</label>
                    <select value={selectedContactId} onChange={(e) => setSelectedContactId(e.target.value)} required>
                      <option value="">— Sélectionnez un contact —</option>
                      {validated.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.number}{c.label ? ` — ${c.label}` : ''} · frais {c.fee_percentage}%
                        </option>
                      ))}
                    </select>
                  </FormGroup>
                );
              })()}
              <p style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 1.5 }}>
                Ce numéro est déjà validé : le retrait est payé automatiquement vers ce contact, sans
                re-confirmation. Les frais de retrait (fixés par Tikta) sont retenus sur le montant.
              </p>
              <ModalFooter>
                <GhostButton type="button" onClick={() => setWithdrawFor(null)}>Annuler</GhostButton>
                <PrimaryButton
                  type="submit"
                  disabled={submitting || !contacts.some((c) => c.zone_id === withdrawFor.zone_id && c.is_validated)}
                >
                  {submitting ? 'Soumission...' : 'Initier le retrait'}
                </PrimaryButton>
              </ModalFooter>
            </form>
          </ModalContent>
        </ModalOverlay>
      )}

      {contactsFor && (
        <ModalOverlay onClick={() => setContactsFor(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>Contacts de retrait — {contactsFor.zone_name}</h2>
              <CloseBtn onClick={() => setContactsFor(null)}>×</CloseBtn>
            </ModalHeader>
            <p style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 1.5, marginTop: 0 }}>
              Enregistrez un ou plusieurs numéros de retrait. Chaque numéro est validé par l'entreprise
              puis par Tikta (qui fixe les frais). Une fois validé, il est réutilisable sans re-confirmation.
            </p>
            <form onSubmit={submitContact}>
              <FormGroup>
                <label>Numéro (MTN / Orange) *</label>
                <input value={contactForm.number} onChange={(e) => setContactForm({ ...contactForm, number: e.target.value })} placeholder="Ex: +237 6XX XXX XXX" required />
              </FormGroup>
              <FormRow>
                <FormGroup>
                  <label>Opérateur</label>
                  <select value={contactForm.provider} onChange={(e) => setContactForm({ ...contactForm, provider: e.target.value })}>
                    <option value="MTN">MTN Mobile Money</option>
                    <option value="Orange">Orange Money</option>
                    <option value="Autre">Autre</option>
                  </select>
                </FormGroup>
                <FormGroup>
                  <label>Libellé (optionnel)</label>
                  <input value={contactForm.label} onChange={(e) => setContactForm({ ...contactForm, label: e.target.value })} placeholder="Ex: MoMo de Jean" />
                </FormGroup>
              </FormRow>
              <ModalFooter>
                <GhostButton type="button" onClick={() => setContactsFor(null)}>Fermer</GhostButton>
                <PrimaryButton type="submit" disabled={savingContact}>
                  {savingContact ? 'Enregistrement...' : 'Enregistrer le contact'}
                </PrimaryButton>
              </ModalFooter>
            </form>

            <div style={{ marginTop: spacing.lg }}>
              <h4 style={{ margin: `0 0 ${spacing.sm} 0`, color: colors.textPrimary, fontSize: '0.95rem' }}>
                Contacts enregistrés
              </h4>
              {contacts.filter((c) => c.zone_id === contactsFor.zone_id).length === 0 ? (
                <EmptyState>Aucun contact enregistré pour cette zone</EmptyState>
              ) : (
                <WithdrawList>
                  {contacts.filter((c) => c.zone_id === contactsFor.zone_id).map((c) => (
                    <WithdrawRow key={c.id}>
                      <div>
                        <div className="info">{c.number}{c.label ? ` — ${c.label}` : ''}</div>
                        <div className="meta">
                          {c.provider || '—'} · Frais Tikta : {c.fee_percentage}%
                          {c.status === 'pending_company' && ' · En attente de l\'entreprise'}
                          {c.status === 'pending_tikta' && ' · En attente de Tikta'}
                          {c.status === 'validated' && ' · Validé'}
                          {c.rejection_reason ? ` · ${c.rejection_reason}` : ''}
                        </div>
                      </div>
                      <StatusBadge status={c.is_validated ? 'active' : c.status === 'rejected' || c.status === 'revoked' ? 'rejected' : 'pending'}>
                        {c.status_display}
                      </StatusBadge>
                    </WithdrawRow>
                  ))}
                </WithdrawList>
              )}
            </div>
          </ModalContent>
        </ModalOverlay>
      )}

      {autoFor && (
        <ModalOverlay onClick={() => setAutoFor(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>Retrait automatique — {autoFor.zone_name}</h2>
              <CloseBtn onClick={() => setAutoFor(null)}>×</CloseBtn>
            </ModalHeader>
            {autoLoading ? (
              <LoadingSpinner />
            ) : (
              <form onSubmit={saveAuto}>
                <p style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 1.5, marginTop: 0 }}>
                  Dès que le solde associé de la zone atteint le seuil, un retrait est automatiquement
                  envoyé vers le contact validé. Idéal pour les associés sans accès à l'application.
                </p>
                <FormGroup>
                  <label>Contact de retrait validé</label>
                  <select value={autoForm.contact_id} onChange={(e) => setAutoForm({ ...autoForm, contact_id: e.target.value })}>
                    <option value="">— Sélectionnez un contact —</option>
                    {contacts.filter((c) => c.zone_id === autoFor.zone_id && c.is_validated).map((c) => (
                      <option key={c.id} value={c.id}>{c.number}{c.label ? ` — ${c.label}` : ''} · frais {c.fee_percentage}%</option>
                    ))}
                  </select>
                  {(() => {
                    const cur = contacts.find((c) => c.id === autoForm.contact_id);
                    return (
                      <div style={{ marginTop: spacing.xs, fontSize: '0.78rem', color: cur ? colors.success : colors.textSecondary }}>
                        {cur ? `Contact payé : ${cur.number}${cur.label ? ` — ${cur.label}` : ''} (frais ${cur.fee_percentage}%)` : 'Aucun contact sélectionné'}
                      </div>
                    );
                  })()}
                </FormGroup>
                <FormGroup>
                  <label>Seuil de déclenchement ({autoFor.currency_code})</label>
                  <input type="number" min={0} step={50} value={autoForm.minimum_amount}
                    onChange={(e) => setAutoForm({ ...autoForm, minimum_amount: e.target.value })}
                    placeholder="Ex: 5000" />
                </FormGroup>
                {!autoForm.withdraw_full_balance && (
                  <FormGroup>
                    <label>Montant fixe à retirer</label>
                    <input type="number" min={50} step={50} value={autoForm.fixed_amount}
                      onChange={(e) => setAutoForm({ ...autoForm, fixed_amount: e.target.value })} />
                  </FormGroup>
                )}
                <FormGroup>
                  <label>Options</label>
                  <CheckLine>
                    <input type="checkbox" checked={autoForm.withdraw_full_balance}
                      onChange={(e) => setAutoForm({ ...autoForm, withdraw_full_balance: e.target.checked })} />
                    Retirer tout le solde atteint
                  </CheckLine>
                  <CheckLine>
                    <input type="checkbox" checked={autoForm.is_enabled}
                      onChange={(e) => setAutoForm({ ...autoForm, is_enabled: e.target.checked })} />
                    Activer le retrait automatique
                  </CheckLine>
                </FormGroup>
                <ModalFooter>
                  <div style={{ marginRight: 'auto', display: 'flex', gap: spacing.sm }}>
                    {autoExists && autoForm.is_enabled && (
                      <GhostButton type="button" onClick={disableAuto}>Désactiver</GhostButton>
                    )}
                    {autoExists && (
                      <GhostButton type="button" className="danger" onClick={deleteAuto}>Supprimer</GhostButton>
                    )}
                  </div>
                  <GhostButton type="button" onClick={() => setAutoFor(null)}>Annuler</GhostButton>
                  <PrimaryButton type="submit" disabled={autoSaving}>
                    {autoSaving ? 'Enregistrement...' : 'Enregistrer'}
                  </PrimaryButton>
                </ModalFooter>
              </form>
            )}
          </ModalContent>
        </ModalOverlay>
      )}
    </ContentSection>
  );
};