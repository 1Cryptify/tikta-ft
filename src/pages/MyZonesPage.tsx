import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { colors, spacing, borderRadius, shadows } from '../config/theme';
import { zonesApi, MyZoneItem, ZoneWithdrawal } from '../services/zoneService';
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
    border: 1px solid ${colors.border}; border-radius: ${borderRadius.sm};
    font-size: 0.9rem; color: ${colors.textPrimary};
    &:focus { outline: none; border-color: ${colors.primary}; box-shadow: 0 0 0 3px ${colors.primary}20; }
  }
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [withdrawFor, setWithdrawFor] = useState<MyZoneItem | null>(null);
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [provider, setProvider] = useState('MTN');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const { zones: z, pending_confirmations: p } = await zonesApi.myZones();
      setZones(z);
      setPending(p);
      const wds = await zonesApi.withdrawals();
      setWithdrawals(wds);
    } catch (e: any) {
      setError(e.message || 'Impossible de charger vos zones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

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
    if (amt > balance) { alert(`Votre solde est de ${fmt(balance)} ${withdrawFor.currency_code}.`); return; }
    if (recipient.replace(/[^0-9+]/g, '').length < 9) { alert('Numéro de retrait invalide'); return; }
    setSubmitting(true);
    try {
      await zonesApi.createWithdrawal({
        zone_id: withdrawFor.zone_id,
        amount: amt,
        currency: withdrawFor.currency_code || 'XAF',
        recipient_number: recipient.trim(),
        provider,
      });
      setSuccess('Demande de retrait soumise : elle attend la validation de l entreprise puis de Tikta.');
      setTimeout(() => setSuccess(''), 6000);
      setWithdrawFor(null);
      setAmount('');
      setRecipient('');
      await load();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la demande');
    } finally {
      setSubmitting(false);
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

      {loading ? <LoadingSpinner /> : (
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
                    </CardMeta>
                    <GhostButton
                      className="success"
                      disabled={balance <= 0}
                      onClick={() => setWithdrawFor(m)}
                      title={balance <= 0 ? 'Solde associé vide' : 'Demander un retrait'}
                    >
                      Demander un retrait
                    </GhostButton>
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
                      {wd.status === 'company_approved' && ` · En attente de la validation finale Tikta`}
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
                <input type="number" min={1} step="50" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Montant du retrait" required />
              </FormGroup>
              <FormGroup>
                <label>Numéro de retrait (MTN / Orange)</label>
                <input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Ex: +237 6XX XXX XXX" required />
              </FormGroup>
              <FormGroup>
                <label>Opérateur</label>
                <select value={provider} onChange={(e) => setProvider(e.target.value)}>
                  <option value="MTN">MTN Mobile Money</option>
                  <option value="Orange">Orange Money</option>
                  <option value="Autre">Autre</option>
                </select>
              </FormGroup>
              <p style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 1.5 }}>
                Double validation : l'entreprise confirme d'abord (elle peut ajuster le % qui vous revient),
                puis Tikta valide et déclenche le paiement.
              </p>
              <ModalFooter>
                <GhostButton type="button" onClick={() => setWithdrawFor(null)}>Annuler</GhostButton>
                <PrimaryButton type="submit" disabled={submitting}>
                  {submitting ? 'Soumission...' : 'Soumettre la demande'}
                </PrimaryButton>
              </ModalFooter>
            </form>
          </ModalContent>
        </ModalOverlay>
      )}
    </ContentSection>
  );
};