import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { colors, spacing, borderRadius, shadows } from '../../config/theme';
import { API_PAYMENTS_BASE_URL } from '../../services/api';

const api = axios.create({ baseURL: API_PAYMENTS_BASE_URL, withCredentials: true });

const FREQUENCIES = [
  { value: 'daily', label: 'Chaque jour' },
  { value: 'every_24h', label: 'Toutes les 24 h' },
  { value: 'weekly', label: 'Chaque semaine' },
  { value: 'every_7days', label: 'Tous les 7 jours' },
  { value: 'monday', label: 'Chaque lundi' },
  { value: 'tuesday', label: 'Chaque mardi' },
  { value: 'wednesday', label: 'Chaque mercredi' },
  { value: 'thursday', label: 'Chaque jeudi' },
  { value: 'friday', label: 'Chaque vendredi' },
  { value: 'saturday', label: 'Chaque samedi' },
  { value: 'sunday', label: 'Chaque dimanche' },
  { value: 'monthly', label: 'Chaque mois' },
];

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
`;

const Card = styled.div`
  background: white;
  border: 1px solid ${colors.border};
  border-radius: ${borderRadius.md};
  padding: ${spacing.lg};
  box-shadow: ${shadows.sm};
`;

const FormGrid = styled.form`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: ${spacing.md};
  align-items: end;
`;

const FormGroup = styled.div`
  label { display: block; margin-bottom: ${spacing.xs}; color: ${colors.textPrimary}; font-weight: 500; font-size: 0.82rem; }
  input, select {
    width: 100%; padding: ${spacing.sm};
    border: 1px solid ${colors.border}; border-radius: ${borderRadius.sm};
    font-size: 0.9rem; color: ${colors.textPrimary};
    &:focus { outline: none; border-color: ${colors.primary}; box-shadow: 0 0 0 3px ${colors.primary}20; }
  }
`;

const CheckRow = styled.label`
  display: flex; align-items: center; gap: ${spacing.sm}; font-size: 0.85rem;
  color: ${colors.textPrimary}; cursor: pointer; margin-top: ${spacing.xs};
  input { width: auto; }
`;

const PrimaryButton = styled.button`
  padding: ${spacing.sm} ${spacing.lg}; background: ${colors.primary}; color: white;
  border: none; border-radius: ${borderRadius.md}; cursor: pointer; font-weight: 600; font-size: 0.875rem;
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const GhostButton = styled.button`
  padding: ${spacing.sm} ${spacing.lg}; background: white; color: ${colors.textSecondary};
  border: 1px solid ${colors.border}; border-radius: ${borderRadius.md}; cursor: pointer;
  font-weight: 600; font-size: 0.85rem;
  &:hover { background: ${colors.neutral}; color: ${colors.textPrimary}; }
`;

const SmallBtn = styled.button`
  padding: ${spacing.xs} ${spacing.md}; border: 1px solid ${colors.border}; background: white;
  border-radius: ${borderRadius.sm}; cursor: pointer; font-size: 0.78rem; font-weight: 600; color: ${colors.textPrimary};
  &:hover { background: ${colors.neutral}; }
  &.danger { color: ${colors.error}; border-color: ${colors.error}; &:hover { background: ${colors.error}10; } }
  &.success { color: ${colors.success}; border-color: ${colors.success}; &:hover { background: ${colors.success}10; } }
  &.primary { color: ${colors.primary}; border-color: ${colors.primary}; &:hover { background: ${colors.primary}10; } }
`;

const List = styled.div`
  display: flex; flex-direction: column; gap: ${spacing.md};
`;

const ScheduleCard = styled.div<{ enabled: boolean }>`
  border: 1px solid ${(p) => (p.enabled ? `${colors.success}55` : colors.border)};
  border-left: 4px solid ${(p) => (p.enabled ? colors.success : colors.border)};
  border-radius: ${borderRadius.md};
  padding: ${spacing.lg};
  background: ${(p) => (p.enabled ? `${colors.success}06` : 'white')};
`;

const CardTop = styled.div`
  display: flex; justify-content: space-between; align-items: flex-start; gap: ${spacing.md};
  flex-wrap: wrap; margin-bottom: ${spacing.md};
`;

const Facts = styled.div`
  display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: ${spacing.md};
  .lbl { font-size: 0.7rem; text-transform: uppercase; letter-spacing: .4px; color: ${colors.textSecondary}; font-weight: 600; }
  .val { font-size: 0.92rem; color: ${colors.textPrimary}; font-weight: 600; }
`;

const CardActions = styled.div`
  display: flex; gap: ${spacing.sm}; flex-wrap: wrap; margin-top: ${spacing.md};
  padding-top: ${spacing.md}; border-top: 1px solid ${colors.border};
`;

const Badge = styled.span<{ tone: 'on' | 'off' | 'warn' | 'muted' }>`
  font-size: 0.7rem; font-weight: 700; padding: 3px 9px; border-radius: 999px;
  background: ${(p) => p.tone === 'on' ? `${colors.success}20` : p.tone === 'warn' ? `${colors.warning}20` : p.tone === 'off' ? `${colors.error}15` : colors.neutral};
  color: ${(p) => p.tone === 'on' ? colors.success : p.tone === 'warn' ? colors.warning : p.tone === 'off' ? colors.error : colors.textSecondary};
`;

const Empty = styled.div`
  padding: ${spacing.xl}; text-align: center; color: ${colors.textSecondary};
  border: 1px dashed ${colors.border}; border-radius: ${borderRadius.md};
`;

const Banner = styled.div<{ tone: 'error' | 'success' | 'info' }>`
  padding: ${spacing.md}; border-radius: ${borderRadius.md}; font-size: 0.85rem;
  background: ${(p) => p.tone === 'error' ? `${colors.error}12` : p.tone === 'success' ? `${colors.success}12` : `${colors.info}12`};
  border: 1px solid ${(p) => p.tone === 'error' ? colors.error : p.tone === 'success' ? colors.success : colors.info};
  color: ${(p) => p.tone === 'error' ? colors.error : p.tone === 'success' ? colors.success : colors.info};
`;

interface Account {
  id: string;
  provider?: string;
  account_number?: string;
  is_verified?: boolean;
  verification_status?: string;
  recipient_id?: string;
  has_recipient_id?: boolean;
}

interface Schedule {
  id: string;
  withdrawal_account?: string;
  withdrawal_account_details?: Account | null;
  is_enabled: boolean;
  is_ready?: boolean;
  minimum_balance_threshold: string;
  frequency: string;
  frequency_display?: string;
  withdraw_full_balance: boolean;
  fixed_amount: string | null;
  currency_details?: { code?: string } | null;
  currency?: string;
  description?: string;
  last_processed_at?: string | null;
  last_processed_amount?: string | null;
  total_processed_amount?: string;
  total_processed_count?: number;
  last_error?: string | null;
  consecutive_failures?: number;
}

const fmt = (v?: string | number | null) => {
  const n = parseFloat(String(v ?? '0'));
  return Number.isNaN(n) ? '0' : n.toLocaleString('en-US');
};

const fmtDate = (iso?: string | null) => {
  if (!iso) return 'Jamais';
  try { return new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }); }
  catch { return iso; }
};

const emptyForm = {
  withdrawal_account_id: '',
  minimum_balance_threshold: '',
  frequency: 'daily',
  withdraw_full_balance: true,
  fixed_amount: '',
  currency_code: 'XAF',
  description: '',
  is_enabled: true,
};

const AutomaticWithdrawalSchedules: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<{ tone: 'error' | 'success' | 'info'; msg: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const notify = (tone: 'error' | 'success' | 'info', msg: string) => {
    setBanner({ tone, msg });
    if (tone !== 'error') setTimeout(() => setBanner(null), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, a, c] = await Promise.all([
        api.get('/withdrawal-schedules/'),
        api.get('/withdrawal-accounts/'),
        api.get('/currencies/').catch(() => ({ data: { currencies: [] } })),
      ]);
      setSchedules(s.data.schedules || []);
      setAccounts(a.data.withdrawal_accounts || []);
      setCurrencies(c.data.currencies || []);
    } catch (e: any) {
      notify('error', e?.response?.data?.message || 'Impossible de charger les retraits automatiques');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
  };

  const startEdit = (s: Schedule) => {
    setEditingId(s.id);
    setForm({
      withdrawal_account_id: s.withdrawal_account || '',
      minimum_balance_threshold: s.minimum_balance_threshold || '',
      frequency: s.frequency || 'daily',
      withdraw_full_balance: s.withdraw_full_balance ?? true,
      fixed_amount: s.fixed_amount || '',
      currency_code: s.currency_details?.code || 'XAF',
      description: s.description || '',
      is_enabled: s.is_enabled,
    });
    setBanner(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.withdrawal_account_id) { notify('error', 'Sélectionnez un compte de retrait.'); return; }
    setSaving(true);
    setBanner(null);
    try {
      const payload: any = {
        minimum_balance_threshold: parseFloat(form.minimum_balance_threshold) || 0,
        frequency: form.frequency,
        withdraw_full_balance: form.withdraw_full_balance,
        fixed_amount: form.withdraw_full_balance ? null : (parseFloat(form.fixed_amount) || null),
        description: form.description || 'Automatic withdrawal',
        is_enabled: form.is_enabled,
        withdrawal_account_id: form.withdrawal_account_id,
      };
      if (editingId) {
        const res = await api.post(`/withdrawal-schedules/${editingId}/update/`, payload);
        if (res.data.status !== 'success') throw new Error(res.data.message);
        notify('success', 'Programmation mise à jour.');
      } else {
        const res = await api.post('/withdrawal-schedules/create/', { ...payload, currency_code: form.currency_code });
        if (res.data.status !== 'success') throw new Error(res.data.message);
        notify('success', 'Programmation créée.');
      }
      resetForm();
      await load();
    } catch (err: any) {
      notify('error', err?.response?.data?.message || err.message || 'Erreur lors de l enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (s: Schedule) => {
    setBanner(null);
    try {
      const res = await api.post(`/withdrawal-schedules/${s.id}/toggle/`);
      if (res.data.status !== 'success') throw new Error(res.data.message);
      notify('success', res.data.message || 'Statut modifié.');
      await load();
    } catch (err: any) {
      notify('error', err?.response?.data?.message || err.message || 'Impossible de changer le statut');
    }
  };

  const remove = async (s: Schedule) => {
    if (!confirm('Supprimer définitivement cette programmation de retrait automatique ?')) return;
    setBanner(null);
    try {
      const res = await api.post(`/withdrawal-schedules/${s.id}/delete/`);
      if (res.data.status !== 'success') throw new Error(res.data.message);
      if (editingId === s.id) resetForm();
      notify('success', 'Programmation supprimée.');
      await load();
    } catch (err: any) {
      notify('error', err?.response?.data?.message || err.message || 'Impossible de supprimer');
    }
  };

  const verifiedAccounts = accounts.filter((a) => a.is_verified || a.verification_status === 'verified');
  const selectableAccounts = verifiedAccounts.length ? verifiedAccounts : accounts;

  return (
    <Wrap>
      {banner && <Banner tone={banner.tone}>{banner.msg}</Banner>}

      {accounts.length > 0 && verifiedAccounts.length === 0 && (
        <Banner tone="info">
          Aucun compte de retrait vérifié. Un administrateur Tikta doit vérifier un compte (Set Recipient ID)
          avant que les retraits automatiques puissent être payés.
        </Banner>
      )}

      <Card>
        <h3 style={{ margin: `0 0 ${spacing.md} 0`, color: colors.textPrimary }}>
          {editingId ? 'Modifier la programmation' : 'Nouveau retrait automatique'}
        </h3>
        <p style={{ fontSize: 0.82 + 'rem', color: colors.textSecondary, marginTop: 0 }}>
          Dès que le solde disponible atteint le seuil, le montant est retiré automatiquement vers le compte vérifié.
        </p>
        <FormGrid onSubmit={submit}>
          <FormGroup>
            <label>Compte de retrait *</label>
            <select value={form.withdrawal_account_id} onChange={(e) => setForm({ ...form, withdrawal_account_id: e.target.value })}>
              <option value="">— Sélectionnez —</option>
              {selectableAccounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.account_number} · {a.provider}{(a.is_verified || a.verification_status === 'verified') ? '' : ' (non vérifié)'}
                </option>
              ))}
            </select>
          </FormGroup>
          <FormGroup>
            <label>Seuil ({form.currency_code})</label>
            <input type="number" min={0} step={50} value={form.minimum_balance_threshold}
              onChange={(e) => setForm({ ...form, minimum_balance_threshold: e.target.value })} placeholder="Ex: 10000" />
          </FormGroup>
          <FormGroup>
            <label>Fréquence</label>
            <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}>
              {FREQUENCIES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </FormGroup>
          {!editingId && (
            <FormGroup>
              <label>Devise</label>
              <select value={form.currency_code} onChange={(e) => setForm({ ...form, currency_code: e.target.value })}>
                {currencies.length === 0 && <option value="XAF">XAF</option>}
                {currencies.map((c) => <option key={c.id} value={c.code}>{c.code}</option>)}
              </select>
            </FormGroup>
          )}
          <FormGroup>
            <CheckRow>
              <input type="checkbox" checked={form.withdraw_full_balance}
                onChange={(e) => setForm({ ...form, withdraw_full_balance: e.target.checked })} />
              Tout le solde
            </CheckRow>
            <CheckRow>
              <input type="checkbox" checked={form.is_enabled}
                onChange={(e) => setForm({ ...form, is_enabled: e.target.checked })} />
              Activé
            </CheckRow>
          </FormGroup>
          {!form.withdraw_full_balance && (
            <FormGroup>
              <label>Montant fixe</label>
              <input type="number" min={50} step={50} value={form.fixed_amount}
                onChange={(e) => setForm({ ...form, fixed_amount: e.target.value })} />
            </FormGroup>
          )}
          <FormGroup>
            <label>Description</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Retrait automatique" />
          </FormGroup>
          <div style={{ display: 'flex', gap: spacing.sm }}>
            <PrimaryButton type="submit" disabled={saving}>
              {saving ? 'Enregistrement...' : editingId ? 'Mettre à jour' : 'Créer'}
            </PrimaryButton>
            {editingId && <GhostButton type="button" onClick={resetForm}>Annuler</GhostButton>}
          </div>
        </FormGrid>
      </Card>

      <Card>
        <h3 style={{ margin: `0 0 ${spacing.md} 0`, color: colors.textPrimary }}>
          Programmations existantes ({schedules.length})
        </h3>
        {loading ? (
          <Empty>Chargement…</Empty>
        ) : schedules.length === 0 ? (
          <Empty>Aucune programmation de retrait automatique pour le moment.</Empty>
        ) : (
          <List>
            {schedules.map((s) => {
              const acct = s.withdrawal_account_details;
              const ready = s.is_ready ?? (s.is_enabled && !!acct?.is_verified && !!acct?.has_recipient_id);
              return (
                <ScheduleCard key={s.id} enabled={s.is_enabled}>
                  <CardTop>
                    <div>
                      <div style={{ fontWeight: 700, color: colors.textPrimary, fontSize: '1rem' }}>
                        {acct?.account_number || 'Compte'} {acct?.provider ? `· ${acct.provider}` : ''}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: colors.textSecondary }}>
                        {s.description || 'Retrait automatique'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: spacing.xs, flexWrap: 'wrap' }}>
                      <Badge tone={s.is_enabled ? 'on' : 'off'}>{s.is_enabled ? 'ACTIVÉ' : 'DÉSACTIVÉ'}</Badge>
                      {s.is_enabled && <Badge tone={ready ? 'on' : 'warn'}>{ready ? 'PRÊT' : 'NON PRÊT'}</Badge>}
                      {acct && !acct.is_verified && <Badge tone="warn">COMPTE NON VÉRIFIÉ</Badge>}
                    </div>
                  </CardTop>

                  <Facts>
                    <div><div className="lbl">Seuil</div><div className="val">{fmt(s.minimum_balance_threshold)} {s.currency_details?.code || ''}</div></div>
                    <div><div className="lbl">Fréquence</div><div className="val">{s.frequency_display || s.frequency}</div></div>
                    <div><div className="lbl">Montant</div><div className="val">{s.withdraw_full_balance ? 'Tout le solde' : fmt(s.fixed_amount)}</div></div>
                    <div><div className="lbl">Dernier retrait</div><div className="val">{fmtDate(s.last_processed_at)}</div></div>
                    <div><div className="lbl">Total retiré</div><div className="val">{fmt(s.total_processed_amount)} ({s.total_processed_count || 0})</div></div>
                  </Facts>

                  {s.last_error && (
                    <div style={{ marginTop: spacing.sm, fontSize: '0.8rem', color: colors.error }}>
                      Dernière erreur : {s.last_error}
                    </div>
                  )}

                  <CardActions>
                    <SmallBtn className="primary" onClick={() => startEdit(s)}>Modifier</SmallBtn>
                    <SmallBtn className={s.is_enabled ? '' : 'success'} onClick={() => toggle(s)}>
                      {s.is_enabled ? 'Désactiver' : 'Activer'}
                    </SmallBtn>
                    <SmallBtn className="danger" onClick={() => remove(s)}>Supprimer</SmallBtn>
                  </CardActions>
                </ScheduleCard>
              );
            })}
          </List>
        )}
      </Card>
    </Wrap>
  );
};

export default AutomaticWithdrawalSchedules;
