import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { colors, spacing, borderRadius, shadows } from '../config/theme';
import { zonesApi, Zone, ZoneDetail, ZoneRouter, ZoneManager, ZoneWithdrawal, ZoneWithdrawalContact, ZoneAutomaticWithdrawal, ZonePayment, ZonePaymentsData, ZoneStats } from '../services/zoneService';
import { BarChart } from '../components/Charts/BarChart';
import { PeriodSelector, StatsPeriod } from '../components/Charts/PeriodSelector';
import { useAuth } from '../hooks/useAuth';
import { ZoneTracer } from './ZoneTracer';
import LoadingSpinner from '../components/LoadingSpinner';

const ContentSection = styled.div`
  padding: ${spacing.xl};
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
`;

const PageHeader = styled.div`
  margin-bottom: ${spacing.xl};
  h1 { font-size: 1.8rem; color: ${colors.textPrimary}; margin-bottom: ${spacing.xs}; }
  p { color: ${colors.textSecondary}; font-size: 0.875rem; }
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${spacing.md};
`;

const PrimaryButton = styled.button`
  padding: ${spacing.sm} ${spacing.lg};
  background: ${colors.primary};
  color: white;
  border: none;
  border-radius: ${borderRadius.md};
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  &:hover { background: ${colors.primaryLight}; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const GhostButton = styled.button`
  padding: ${spacing.sm} ${spacing.lg};
  background: white;
  color: ${colors.textSecondary};
  border: 1px solid ${colors.border};
  border-radius: ${borderRadius.md};
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  &:hover { background: ${colors.neutral}; color: ${colors.textPrimary}; }
  &.danger { color: ${colors.error}; border-color: ${colors.error}; &:hover { background: ${colors.error}10; } }
  &.success { color: ${colors.success}; border-color: ${colors.success}; &:hover { background: ${colors.success}10; } }
`;

const MenuNav = styled.div`
  display: flex;
  gap: ${spacing.md};
  margin-bottom: ${spacing.lg};
  border-bottom: 1px solid ${colors.border};
`;

const MenuButton = styled.button<{ isActive: boolean }>`
  background: none;
  border: none;
  padding: ${spacing.md} ${spacing.lg};
  font-size: 0.95rem;
  color: ${(props) => (props.isActive ? colors.primary : colors.textSecondary)};
  cursor: pointer;
  border-bottom: 3px solid ${(props) => (props.isActive ? colors.primary : 'transparent')};
  font-weight: ${(props) => (props.isActive ? '600' : '400')};
  &:hover { color: ${colors.textPrimary}; }
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
  transition: all 0.2s ease;
  &:hover { box-shadow: ${shadows.lg}; transform: translateY(-2px); }
`;

const ColorDot = styled.span<{ color: string }>`
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: ${(props) => props.color};
  margin-right: ${spacing.xs};
`;

const ZoneName = styled.h3`
  font-size: 1rem;
  color: ${colors.textPrimary};
  margin: 0 0 ${spacing.xs} 0;
  display: flex;
  align-items: center;
`;

const CardMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xs};
  font-size: 0.8rem;
  color: ${colors.textSecondary};
  margin-bottom: ${spacing.md};
  strong { color: ${colors.textPrimary}; }
`;

const CardActions = styled.div`
  display: flex;
  gap: ${spacing.sm};
  flex-wrap: wrap;
`;

const SmallBtn = styled.button`
  padding: ${spacing.xs} ${spacing.md};
  border: 1px solid ${colors.border};
  background: white;
  border-radius: ${borderRadius.sm};
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  color: ${colors.textPrimary};
  transition: all 0.2s ease;
  &:hover { background: ${colors.neutral}; }
  &.primary { border-color: ${colors.primary}; color: ${colors.primary}; background: ${colors.primary}08; }
  &.danger { border-color: ${colors.error}; color: ${colors.error}; &:hover { background: ${colors.error}10; } }
  &.success { border-color: ${colors.success}; color: ${colors.success}; &:hover { background: ${colors.success}10; } }
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

const ModalOverlay = styled.div`
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 2000;
`;

const ModalContent = styled.div<{ width?: string }>`
  background: white;
  border-radius: ${borderRadius.lg};
  padding: ${spacing.xl};
  max-width: ${(props) => props.width || '560px'};
  width: 92%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
`;

const ModalHeader = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: ${spacing.lg};
  border-bottom: 1px solid ${colors.border};
  padding-bottom: ${spacing.md};
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
  input, select, textarea {
    width: 100%; padding: ${spacing.sm};
    border: 1px solid ${colors.border}; border-radius: ${borderRadius.md};
    font-size: 0.9rem; color: ${colors.textPrimary};
    &:focus { outline: none; border-color: ${colors.primary}; box-shadow: 0 0 0 3px ${colors.primary}20; }
  }
  input[type='checkbox'] {
    width: 18px; height: 18px; min-width: 18px; padding: 0; margin: 0;
    accent-color: ${colors.primary}; cursor: pointer; flex: 0 0 auto;
  }
  textarea { min-height: 60px; resize: vertical; }
`;

const CheckLine = styled.label`
  display: flex; align-items: center; gap: ${spacing.sm};
  font-size: 0.85rem; color: ${colors.textPrimary}; cursor: pointer;
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

const ErrorMsg = styled.div`
  padding: ${spacing.md}; background: ${colors.error}15; border: 1px solid ${colors.error};
  border-radius: ${borderRadius.md}; color: ${colors.error}; margin-bottom: ${spacing.lg};
  font-size: 0.875rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
  th { text-align: left; color: ${colors.textSecondary}; font-weight: 600; padding: ${spacing.sm}; border-bottom: 2px solid ${colors.border}; }
  td { padding: ${spacing.sm}; border-bottom: 1px solid ${colors.border}; color: ${colors.textPrimary}; }
  tr:hover td { background: ${colors.neutral}; }
`;

const EmptyState = styled.div`
  padding: ${spacing.xl};
  text-align: center;
  color: ${colors.textSecondary};
  border: 1px dashed ${colors.border};
  border-radius: ${borderRadius.md};
`;

const MiniStat = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${spacing.md};
  margin-bottom: ${spacing.lg};
`;

const StatBox = styled.div`
  background: linear-gradient(135deg, ${colors.primary}12, ${colors.primary}04);
  border: 1px solid ${colors.primary}30;
  border-radius: ${borderRadius.md};
  padding: ${spacing.md};
  .lbl { font-size: 0.72rem; color: ${colors.textSecondary}; text-transform: uppercase; letter-spacing: .5px; font-weight: 600; }
  .val { font-size: 1.25rem; font-weight: 700; color: ${colors.primary}; }
`;

const BackButton = styled.button`
  background: none; border: none; color: ${colors.primary}; cursor: pointer;
  font-weight: 600; font-size: 0.85rem; padding: 0;
  &:hover { text-decoration: underline; }
`;

const fmt = (v?: string | number | null, decimal = 2): string => {
  const n = parseFloat(String(v ?? '0'));
  if (Number.isNaN(n)) return '0';
  return n.toLocaleString('en-US', { minimumFractionDigits: decimal, maximumFractionDigits: decimal });
};

const fmtDate = (iso?: string | null): string => {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }); }
  catch { return iso; }
};

// ---------- Mini carte (aperçu du polygone d'une zone) ----------
const MiniMap: React.FC<{ polygon: [number, number][]; color: string }> = ({ polygon, color }) => {
  const el = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!el.current || polygon.length === 0) return;
    const map = L.map(el.current);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OSM' }).addTo(map);
    L.polygon(polygon.map((p) => [p[0], p[1]]), { color, weight: 2, fillColor: color, fillOpacity: 0.2 }).addTo(map);
    map.fitBounds(L.latLngBounds(polygon.map((p) => [p[0], p[1]])), { padding: [20, 20] });
    return () => { map.remove(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <div ref={el} style={{ height: 220, borderRadius: borderRadius.md, overflow: 'hidden', border: `1px solid ${colors.border}`, marginBottom: spacing.md }} />;
};

// ---------- Modal création de zone ----------
const CreateZoneModal: React.FC<{ onClose: () => void; onCreated: (z: Zone) => void }> = ({ onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#059669');
  const [pts, setPts] = useState<{ lat: number; lng: number }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!name.trim()) { setError('Le nom de la zone est requis'); return; }
    if (pts.length < 3) { setError('Tracez au moins 3 points autour de la zone'); return; }
    setSubmitting(true);
    setError('');
    try {
      const zone = await zonesApi.create({
        name: name.trim(),
        description,
        color,
        polygon: pts.map((p) => [p.lat, p.lng] as [number, number]),
        radius_m: 5,
        is_closed: true,
      });
      onCreated(zone);
      onClose();
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent width="720px" onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>Tracer une nouvelle zone</h2>
          <CloseBtn onClick={onClose}>×</CloseBtn>
        </ModalHeader>
        {error && <ErrorMsg>{error}</ErrorMsg>}
        <FormGroup>
          <label>Nom de la zone *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: SUPERMARCHÉ CENTRAL" />
        </FormGroup>
        <FormGroup>
          <label>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description de la zone" />
        </FormGroup>
        <ZoneTracer
          points={pts}
          onPointsChange={setPts}
          color={color}
          onColorChange={setColor}
        />
        <ModalFooter>
          <GhostButton type="button" onClick={onClose}>Annuler</GhostButton>
          <PrimaryButton type="button" disabled={submitting} onClick={submit}>
            {submitting ? 'Création...' : 'Créer la zone'}
          </PrimaryButton>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

// ---------- Carte de retrait automatique par associé ----------
const AutoWithdrawalManagerCard: React.FC<{
  zoneId: string;
  manager: ZoneManager;
  config?: ZoneAutomaticWithdrawal;
  contacts: ZoneWithdrawalContact[];
  currencyCode: string;
  onChanged: () => void;
}> = ({ zoneId, manager, config, contacts, currencyCode, onChanged }) => {
  const validated = contacts.filter((c) => c.manager_id === manager.id && c.is_validated);
  const [form, setForm] = useState({
    contact_id: config?.contact_id || '',
    minimum_amount: config?.minimum_amount || '',
    withdraw_full_balance: config?.withdraw_full_balance ?? true,
    fixed_amount: config?.fixed_amount || '',
    is_enabled: config?.is_enabled || false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      contact_id: config?.contact_id || '',
      minimum_amount: config?.minimum_amount || '',
      withdraw_full_balance: config?.withdraw_full_balance ?? true,
      fixed_amount: config?.fixed_amount || '',
      is_enabled: config?.is_enabled || false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.id]);

  const save = async (e?: React.FormEvent, overrides: Partial<typeof form> = {}) => {
    e?.preventDefault();
    const payload = { ...form, ...overrides };
    if (payload.is_enabled && !payload.contact_id) {
      alert('Sélectionnez un contact de retrait validé pour activer le retrait automatique.');
      return;
    }
    setSaving(true);
    try {
      await zonesApi.saveAutoWithdrawal(zoneId, {
        manager_id: manager.id,
        is_enabled: payload.is_enabled,
        minimum_amount: parseFloat(payload.minimum_amount) || 0,
        withdraw_full_balance: payload.withdraw_full_balance,
        fixed_amount: payload.withdraw_full_balance ? null : (parseFloat(payload.fixed_amount) || null),
        contact_id: payload.contact_id || null,
      });
      onChanged();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de l enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!config) return;
    if (!confirm(`Supprimer le retrait automatique de ${manager.email} ?`)) return;
    try {
      await zonesApi.deleteAutoWithdrawal(config.id);
      onChanged();
    } catch (err: any) {
      alert(err.message || 'Erreur');
    }
  };

  const cfgContact = config ? contacts.find((c) => c.id === config.contact_id) : undefined;

  return (
    <div style={{
      border: `1px solid ${config?.is_enabled ? `${colors.success}55` : colors.border}`,
      borderLeft: `4px solid ${config?.is_enabled ? colors.success : colors.border}`,
      borderRadius: borderRadius.md,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      background: config?.is_enabled ? `${colors.success}06` : 'white',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md }}>
        <div>
          <div style={{ fontWeight: 700, color: colors.textPrimary }}>{manager.email}</div>
          <div style={{ fontSize: '0.8rem', color: colors.textSecondary }}>
            Part {manager.percentage}% · Solde réel : <strong>{fmt(manager.balance)} {currencyCode}</strong>
          </div>
        </div>
        <div style={{ display: 'flex', gap: spacing.xs, flexWrap: 'wrap' }}>
          <StatusBadge status={config?.is_enabled ? 'active' : 'offline'}>{config?.is_enabled ? 'Activé' : 'Désactivé'}</StatusBadge>
          {config?.is_enabled && (
            <StatusBadge status={cfgContact ? 'active' : 'pending'}>
              {cfgContact ? `→ ${cfgContact.number}` : 'Sans contact'}
            </StatusBadge>
          )}
        </div>
      </div>

      {validated.length === 0 && (
        <div style={{ fontSize: '0.8rem', color: colors.warning, marginBottom: spacing.sm }}>
          Aucun contact validé pour cet associé. Enregistrez et faites valider un numéro dans l'onglet
          « Contacts de retrait ».
        </div>
      )}

      <form onSubmit={save} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: spacing.md, alignItems: 'start' }}>
        <FormGroup>
          <label>Contact validé</label>
          <select value={form.contact_id} onChange={(e) => setForm({ ...form, contact_id: e.target.value })}>
            <option value="">— Aucun —</option>
            {validated.map((c) => (
              <option key={c.id} value={c.id}>{c.number}{c.label ? ` — ${c.label}` : ''} · frais {c.fee_percentage}%</option>
            ))}
          </select>
        </FormGroup>
        <FormGroup>
          <label>Seuil de déclenchement</label>
          <input type="number" min={0} step={50} value={form.minimum_amount}
            onChange={(e) => setForm({ ...form, minimum_amount: e.target.value })} placeholder="Ex: 5000" />
        </FormGroup>
        {!form.withdraw_full_balance && (
          <FormGroup>
            <label>Montant fixe</label>
            <input type="number" min={50} step={50} value={form.fixed_amount}
              onChange={(e) => setForm({ ...form, fixed_amount: e.target.value })} />
          </FormGroup>
        )}
        <FormGroup>
          <label>Options</label>
          <CheckLine>
            <input type="checkbox" checked={form.withdraw_full_balance}
              onChange={(e) => setForm({ ...form, withdraw_full_balance: e.target.checked })} />
            Retirer tout le solde atteint
          </CheckLine>
          <CheckLine>
            <input type="checkbox" checked={form.is_enabled}
              onChange={(e) => setForm({ ...form, is_enabled: e.target.checked })} />
            Activer
          </CheckLine>
        </FormGroup>
        <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap' }}>
          <PrimaryButton type="submit" disabled={saving}>{saving ? 'Enregistrement...' : 'Enregistrer'}</PrimaryButton>
          {config?.is_enabled && (
            <GhostButton type="button" onClick={() => save(undefined, { is_enabled: false })}>Désactiver</GhostButton>
          )}
          {config && <GhostButton type="button" className="danger" onClick={remove}>Supprimer</GhostButton>}
        </div>
      </form>

      {config?.last_error && (
        <div style={{ color: colors.error, marginTop: spacing.sm, fontSize: '0.78rem' }}>Dernière erreur : {config.last_error}</div>
      )}
      {config?.last_processed_at && (
        <div style={{ color: colors.textSecondary, marginTop: spacing.xs, fontSize: '0.78rem' }}>
          Dernier traitement : {fmtDate(config.last_processed_at)}
        </div>
      )}
    </div>
  );
};

// ---------- Vue détail d'une zone ----------
const ZoneDetailView: React.FC<{ zoneId: string; onBack: () => void; onChanged: (z: Zone) => void }> = ({ zoneId, onBack, onChanged }) => {
  const { user } = useAuth();
  const [zone, setZone] = useState<ZoneDetail | null>(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'routers' | 'managers' | 'payments' | 'contacts' | 'auto' | 'stats' | 'withdrawals'>('routers');
  const [payments, setPayments] = useState<ZonePaymentsData | null>(null);
  const [zoneStats, setZoneStats] = useState<ZoneStats | null>(null);
  const [statsPeriod, setStatsPeriod] = useState<StatsPeriod>('monthly');
  const [statsLoading, setStatsLoading] = useState(false);
  const [routerForm, setRouterForm] = useState({ name: '', mac_address: '', serial_number: '', model: '', ip_address: '', status: 'active' });
  const [managerForm, setManagerForm] = useState<{ mode: 'email' | 'phone'; email: string; phone: string; percentage: number | string; initial_password: string; create_account: boolean }>({ mode: 'email', email: '', phone: '', percentage: 100, initial_password: '', create_account: true });
  const [wdPercents, setWdPercents] = useState<Record<string, number | string>>({});
  const [contactFees, setContactFees] = useState<Record<string, number | string>>({});
  const [contactForm, setContactForm] = useState({ number: '', provider: 'MTN', label: '', manager_id: '' });

  const load = useCallback(async () => {
    try {
      const d = await zonesApi.detail(zoneId);
      setZone(d);
    } catch (e: any) { setError(e.message || 'Impossible de charger la zone'); }
  }, [zoneId]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (tab === 'payments') {
      zonesApi.payments(zoneId).then(setPayments).catch(() => {});
    }
  }, [tab, zoneId]);

  useEffect(() => {
    if (tab !== 'stats') return;
    setStatsLoading(true);
    zonesApi.zoneStats(zoneId, statsPeriod)
      .then(setZoneStats)
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, [tab, zoneId, statsPeriod]);

  const refresh = () => { load(); if (tab === 'payments') zonesApi.payments(zoneId).then(setPayments).catch(() => {}); };

  if (!zone) {
    return <ContentSection>{error ? <ErrorMsg>{error}</ErrorMsg> : <LoadingSpinner />}</ContentSection>;
  }

  const isStaff = !!user?.is_superuser || !!user?.is_staff;

  const handleToggle = async () => {
    const updated = await zonesApi.toggle(zone.id);
    setZone({ ...zone, ...updated });
    onChanged(updated);
  };

  const handleDelete = async () => {
    if (!confirm(`Supprimer la zone "${zone.name}" ? (Les paiements historiques restent, la zone ne sera plus attribuée)`)) return;
    await zonesApi.delete(zone.id);
    onBack();
  };

  const handlePrintReport = async () => {
    try {
      const report = await zonesApi.report(zone.id);
      const w = window.open('', '_blank');
      if (!w) return;
      const rows = (report.payments || []).map((p: any) =>
        `<tr><td>${fmtDate(p.completed_at)}</td><td>${(p.description || '').replace(/</g, '&lt;')}</td><td>${p.customer_email || p.customer_phone || ''}</td><td style="text-align:right">${fmt(p.amount)} ${p.currency}</td></tr>`
      ).join('');
      w.document.write(`<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>Rapport ${zone.name}</title>
        <style>
          body{font-family:Arial,sans-serif;margin:24px;color:#222}
          h1{color:#1e3a5f;margin-bottom:4px} h2{color:#6b7280;font-size:14px;font-weight:400;margin-top:0}
          table{width:100%;border-collapse:collapse;margin-top:16px}
          th,td{border:1px solid #e0e4e8;padding:8px;text-align:left;font-size:12px}
          th{background:#1e3a5f;color:#fff}
          .sum{margin-top:12px;font-size:14px;font-weight:600}
          .footer{margin-top:24px;font-size:11px;color:#6b7280}
        </style></head><body>
        <h1>Zone : ${zone.name}</h1>
        <h2>${zone.company_name} — Généré le ${new Date(report.generated_at).toLocaleString('fr-FR')}</h2>
        <table><thead><tr><th>Date</th><th>Désignation</th><th>Client</th><th style="text-align:right">Montant</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="4">Aucun paiement</td></tr>'}</tbody></table>
        <div class="sum">Total : ${fmt(report.summary.total_amount)} — ${report.summary.total_payments} paiement(s)</div>
        <div class="footer">Rapport généré par Tikta — Zone ${zone.name}</div>
        </body></html>`);
      w.document.close();
      w.focus();
      setTimeout(() => { try { w.print(); } catch { /* ignore */ } }, 300);
    } catch { alert('Impossible de générer le rapport'); }
  };

  const submitRouter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routerForm.name.trim()) return;
    await zonesApi.addRouter(zone.id, { ...routerForm, ip_address: routerForm.ip_address || undefined });
    setRouterForm({ name: '', mac_address: '', serial_number: '', model: '', ip_address: '', status: 'active' });
    refresh();
  };

  const submitManager = async (e: React.FormEvent) => {
    e.preventDefault();
    const pct = parseInt(String(managerForm.percentage)) || 0;
    if (managerForm.mode === 'phone') {
      if (managerForm.phone.replace(/\D/g, '').length < 9) { alert('Numéro de téléphone invalide'); return; }
      await zonesApi.addManager(zone.id, { phone: managerForm.phone.trim(), percentage: pct, create_account: false });
    } else {
      if (!managerForm.email.trim() || !managerForm.email.includes('@')) return;
      await zonesApi.addManager(zone.id, {
        email: managerForm.email.trim(),
        percentage: pct,
        initial_password: managerForm.create_account ? (managerForm.initial_password || undefined) : undefined,
        create_account: managerForm.create_account,
      });
    }
    setManagerForm({ mode: 'email', email: '', phone: '', percentage: 100, initial_password: '', create_account: true });
    refresh();
  };

  const companyApprove = async (wd: ZoneWithdrawal) => {
    const raw = wdPercents[wd.id];
    const pct = raw === undefined || raw === '' ? wd.associate_percentage : Number(raw) || 0;
    await zonesApi.companyApprove(wd.id, pct);
    refresh();
  };

  const adminApprove = async (wd: ZoneWithdrawal) => {
    // Les frais sont fixés par Tikta sur le contact de retrait, plus par l'entreprise.
    await zonesApi.adminApprove(wd.id);
    refresh();
  };

  const reject = async (wd: ZoneWithdrawal) => {
    if (!confirm('Rejeter cette demande de retrait ?')) return;
    await zonesApi.rejectWithdrawal(wd.id);
    refresh();
  };

  const submitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (contactForm.number.replace(/[^0-9]/g, '').length < 9) { alert('Numéro de retrait invalide'); return; }
    await zonesApi.addWithdrawalContact(zone.id, {
      number: contactForm.number.trim(),
      provider: contactForm.provider,
      label: contactForm.label.trim(),
      manager_id: contactForm.manager_id || undefined,
    });
    setContactForm({ number: '', provider: 'MTN', label: '', manager_id: '' });
    refresh();
  };

  const companyApproveContact = async (c: ZoneWithdrawalContact) => {
    await zonesApi.companyApproveContact(c.id);
    refresh();
  };

  const validateContact = async (c: ZoneWithdrawalContact) => {
    const raw = contactFees[c.id];
    const fee = raw === undefined || raw === '' ? parseFloat(c.fee_percentage || '0') || 0 : Number(raw) || 0;
    await zonesApi.validateContact(c.id, fee);
  };

  const rejectContact = async (c: ZoneWithdrawalContact) => {
    const reason = prompt('Motif du rejet (optionnel)') || undefined;
    await zonesApi.rejectContact(c.id, reason);
    refresh();
  };

  const revokeContact = async (c: ZoneWithdrawalContact) => {
    if (!confirm(`Révoquer le contact ${c.number} ? Il ne pourra plus être utilisé pour un retrait.`)) return;
    await zonesApi.revokeContact(c.id);
    refresh();
  };

  const runAuto = async () => {
    if (!zone) return;
    try {
      await zonesApi.runAutoWithdrawal(zone.id);
      refresh();
    } catch (err: any) {
      alert(err.message || 'Aucun retrait automatique déclenché');
    }
  };

  return (
    <ContentSection>
      <BackButton onClick={onBack}>← Retour aux zones</BackButton>
      <PageHeader>
        <HeaderRow>
          <div>
            <h1>
              <ColorDot color={zone.color} /> {zone.name}
              <StatusBadge status={zone.is_active ? 'active' : 'offline'} style={{ marginLeft: spacing.md }}>
                {zone.is_active ? 'Active' : 'Désactivée'}
              </StatusBadge>
            </h1>
            <p>{zone.company_name} · Créée le {fmtDate(zone.created_at)} · Tracé {zone.is_closed ? 'validé' : 'non validé'}</p>
          </div>
          <CardActions>
            <SmallBtn className="primary" onClick={handleToggle}>{zone.is_active ? 'Désactiver' : 'Activer'}</SmallBtn>
            <SmallBtn className="primary" onClick={handlePrintReport}>Imprimer le rapport</SmallBtn>
            <SmallBtn className="danger" onClick={handleDelete}>Supprimer</SmallBtn>
          </CardActions>
        </HeaderRow>
      </PageHeader>

      {zone.polygon?.length >= 3 && <MiniMap polygon={zone.polygon} color={zone.color} />}

      <MiniStat>
        <StatBox><div className="lbl">Revenus générés</div><div className="val">{fmt(zone.total_generated)}</div></StatBox>
        <StatBox><div className="lbl">Solde associé</div><div className="val">{fmt(zone.associate_balance)}</div></StatBox>
        <StatBox><div className="lbl">Surface</div><div className="val">{fmt(zone.area_sqm, 0)} m²</div></StatBox>
        <StatBox><div className="lbl">Routeurs</div><div className="val">{zone.routers?.length || 0}</div></StatBox>
      </MiniStat>

      <MenuNav>
        <MenuButton isActive={tab === 'routers'} onClick={() => setTab('routers')}>Routeurs ({zone.routers?.length || 0})</MenuButton>
        <MenuButton isActive={tab === 'managers'} onClick={() => setTab('managers')}>Associés ({zone.managers?.length || 0})</MenuButton>
        <MenuButton isActive={tab === 'contacts'} onClick={() => setTab('contacts')}>Contacts de retrait ({zone.withdrawal_contacts?.length || 0})</MenuButton>
        <MenuButton isActive={tab === 'auto'} onClick={() => setTab('auto')}>Retrait auto</MenuButton>
        <MenuButton isActive={tab === 'stats'} onClick={() => setTab('stats')}>Stats</MenuButton>
        <MenuButton isActive={tab === 'payments'} onClick={() => setTab('payments')}>Paiements</MenuButton>
        <MenuButton isActive={tab === 'withdrawals'} onClick={() => setTab('withdrawals')}>Retraits ({zone.withdrawals?.length || 0})</MenuButton>
      </MenuNav>

      {/* -------- Routeurs -------- */}
      {tab === 'routers' && (
        <div>
          <form onSubmit={submitRouter} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr auto', gap: spacing.md, alignItems: 'end', marginBottom: spacing.lg }}>
            <FormGroup><label>Nom *</label><input value={routerForm.name} onChange={(e) => setRouterForm({ ...routerForm, name: e.target.value })} /></FormGroup>
            <FormGroup><label>MAC</label><input value={routerForm.mac_address} onChange={(e) => setRouterForm({ ...routerForm, mac_address: e.target.value })} /></FormGroup>
            <FormGroup><label>Série</label><input value={routerForm.serial_number} onChange={(e) => setRouterForm({ ...routerForm, serial_number: e.target.value })} /></FormGroup>
            <FormGroup><label>IP</label><input value={routerForm.ip_address} onChange={(e) => setRouterForm({ ...routerForm, ip_address: e.target.value })} /></FormGroup>
            <PrimaryButton type="submit">Ajouter</PrimaryButton>
          </form>
          {zone.routers?.length ? (
            <Table>
              <thead><tr><th>Nom</th><th>MAC</th><th>IP</th><th>Statut</th><th>Actif</th><th></th></tr></thead>
              <tbody>
                {zone.routers.map((r: ZoneRouter) => (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td>{r.mac_address || '—'}</td>
                    <td>{r.ip_address || '—'}</td>
                    <td>
                      <select
                        value={r.status}
                        onChange={async (e) => {
                          await zonesApi.updateRouter(r.id, { status: e.target.value });
                          refresh();
                        }}
                      >
                        <option value="active">Active</option>
                        <option value="offline">Hors ligne</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </td>
                    <td><StatusBadge status={r.is_active ? 'active' : 'offline'}>{r.is_active ? 'Oui' : 'Non'}</StatusBadge></td>
                    <td>
                      <SmallBtn className="primary" onClick={async () => { await zonesApi.updateRouter(r.id, { is_active: !r.is_active }); refresh(); }}>
                        {r.is_active ? 'Désactiver' : 'Activer'}
                      </SmallBtn>
                      <SmallBtn className="danger" onClick={async () => { if (confirm('Supprimer ce routeur ?')) { await zonesApi.deleteRouter(r.id); refresh(); } }}>✕</SmallBtn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : <EmptyState>Aucun routeur sur cette zone</EmptyState>}
        </div>
      )}

      {/* -------- Associés -------- */}
      {tab === 'managers' && (
        <div>
          <form onSubmit={submitManager} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr auto', gap: spacing.md, alignItems: 'end', marginBottom: spacing.sm }}>
            <FormGroup>
              <label>Type d'associé</label>
              <select value={managerForm.mode} onChange={(e) => setManagerForm({ ...managerForm, mode: e.target.value as 'email' | 'phone' })}>
                <option value="email">Avec email (compte)</option>
                <option value="phone">Par téléphone (sans compte)</option>
              </select>
            </FormGroup>
            {managerForm.mode === 'email' ? (
              <FormGroup><label>Email *</label><input value={managerForm.email} onChange={(e) => setManagerForm({ ...managerForm, email: e.target.value })} placeholder="associe@exemple.com" /></FormGroup>
            ) : (
              <FormGroup><label>Téléphone *</label><input value={managerForm.phone} onChange={(e) => setManagerForm({ ...managerForm, phone: e.target.value })} placeholder="Ex: +237 6XX XXX XXX" /></FormGroup>
            )}
            <FormGroup><label>% associé *</label><input type="number" min={0} max={100} value={managerForm.percentage} onChange={(e) => setManagerForm({ ...managerForm, percentage: e.target.value === '' ? '' : parseInt(e.target.value) || 0 })} /></FormGroup>
            {managerForm.mode === 'email' && managerForm.create_account ? (
              <FormGroup><label>Mot de passe (optionnel)</label><input value={managerForm.initial_password} onChange={(e) => setManagerForm({ ...managerForm, initial_password: e.target.value })} /></FormGroup>
            ) : (
              <FormGroup><label>&nbsp;</label><div style={{ fontSize: '0.78rem', color: colors.textSecondary }}>Aucun compte créé</div></FormGroup>
            )}
            <PrimaryButton type="submit">Ajouter</PrimaryButton>
          </form>
          {managerForm.mode === 'email' ? (
            <CheckLine style={{ marginBottom: spacing.lg }}>
              <input type="checkbox" checked={!managerForm.create_account} onChange={(e) => setManagerForm({ ...managerForm, create_account: !e.target.checked })} />
              <span>Associé <strong>sans compte</strong> (dividendes payés automatiquement via un contact de retrait)</span>
            </CheckLine>
          ) : (
            <div style={{ fontSize: '0.78rem', color: colors.textSecondary, marginBottom: spacing.lg }}>
              Associé identifié uniquement par son numéro : aucun compte, aucun email. Sa part lui est versée
              automatiquement via un contact de retrait validé.
            </div>
          )}
          {zone.managers?.length ? (
            <Table>
              <thead><tr><th>Associé</th><th>Compte</th><th>% Associé</th><th>Statut</th><th>Confirmé le</th><th></th></tr></thead>
              <tbody>
                {zone.managers.map((m: ZoneManager) => (
                  <tr key={m.id}>
                    <td>{m.phone ? `📞 ${m.phone}` : (m.email || '—')}</td>
                    <td>{m.has_account ? 'Créé' : 'Sans compte'}</td>
                    <td>
                      <input type="number" min={0} max={100} style={{ width: 70, padding: 4 }} defaultValue={m.percentage}
                        onBlur={async (e) => { const v = parseInt(e.target.value) || 0; if (v !== m.percentage) { await zonesApi.updateManager(m.id, { percentage: v }); refresh(); } }} />
                    </td>
                    <td><StatusBadge status={m.status}>{m.status_display}</StatusBadge></td>
                    <td>{fmtDate(m.confirmed_at)}</td>
                    <td>
                      <SmallBtn className="danger" onClick={async () => { if (confirm('Retirer cet associé ?')) { await zonesApi.deleteManager(m.id); refresh(); } }}>Retirer</SmallBtn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : <EmptyState>Aucun associé — ajoutez son email pour qu'il confirme depuis son menu « Mes Zones »</EmptyState>}
        </div>
      )}

      {/* -------- Contacts de retrait -------- */}
      {tab === 'contacts' && (
        <div>
          <form onSubmit={submitContact} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 2fr auto', gap: spacing.md, alignItems: 'end', marginBottom: spacing.lg }}>
            <FormGroup><label>Numéro de retrait *</label><input value={contactForm.number} onChange={(e) => setContactForm({ ...contactForm, number: e.target.value })} placeholder="Ex: +237 6XX XXX XXX" /></FormGroup>
            <FormGroup><label>Opérateur</label>
              <select value={contactForm.provider} onChange={(e) => setContactForm({ ...contactForm, provider: e.target.value })}>
                <option value="MTN">MTN</option>
                <option value="Orange">Orange</option>
                <option value="Autre">Autre</option>
              </select>
            </FormGroup>
            <FormGroup><label>Libellé</label><input value={contactForm.label} onChange={(e) => setContactForm({ ...contactForm, label: e.target.value })} placeholder="Ex: MoMo de Jean" /></FormGroup>
            <FormGroup>
              <label>Associé</label>
              <select value={contactForm.manager_id} onChange={(e) => setContactForm({ ...contactForm, manager_id: e.target.value })}>
                <option value="">— Entreprise —</option>
                {(zone.managers || []).filter((m) => m.status === 'active').map((m) => (
                  <option key={m.id} value={m.id}>{m.phone || m.email} ({m.percentage}%)</option>
                ))}
              </select>
            </FormGroup>
            <PrimaryButton type="submit">Enregistrer</PrimaryButton>
          </form>
          <p style={{ fontSize: 12, color: colors.textSecondary, marginTop: 0 }}>
            L'entreprise peut enregistrer un numéro pour un associé, valider les numéros, ou les révoquer.
            Tikta fixe les frais de retrait sur chaque numéro validé.
          </p>
          {zone.withdrawal_contacts?.length ? (
            <Table>
              <thead><tr><th>Numéro</th><th>Libellé</th><th>Associé</th><th>Frais</th><th>Statut</th><th>Actions</th></tr></thead>
              <tbody>
                {zone.withdrawal_contacts.map((c: ZoneWithdrawalContact) => (
                  <tr key={c.id}>
                    <td><strong>{c.number}</strong></td>
                    <td>{c.label || '—'}</td>
                    <td>{c.manager_display || c.manager_email || 'Entreprise'}</td>
                    <td>{c.status === 'validated' ? `${c.fee_percentage}%` : '—'}</td>
                    <td><StatusBadge status={c.is_validated ? 'active' : c.status === 'rejected' || c.status === 'revoked' ? 'rejected' : 'pending'}>{c.status_display}</StatusBadge></td>
                    <td>
                      <span style={{ display: 'flex', gap: spacing.xs, alignItems: 'center', flexWrap: 'wrap' }}>
                        {c.status === 'pending_company' && (
                          <>
                            <SmallBtn className="success" onClick={() => companyApproveContact(c)}>Valider (entreprise)</SmallBtn>
                            <SmallBtn className="danger" onClick={() => rejectContact(c)}>Rejeter</SmallBtn>
                          </>
                        )}
                        {isStaff && (c.status === 'pending_company' || c.status === 'pending_tikta') && (
                          <>
                            <input type="number" min={0} max={100} style={{ width: 64, padding: 4 }} placeholder="Frais %"
                              value={contactFees[c.id] ?? ''} onChange={(e) => setContactFees({ ...contactFees, [c.id]: e.target.value === '' ? '' : parseFloat(e.target.value) || 0 })} title="Frais Tikta %" />
                            <SmallBtn className="primary" onClick={() => validateContact(c)}>Valider Tikta</SmallBtn>
                          </>
                        )}
                        {c.status !== 'revoked' && c.status !== 'rejected' && (
                          <SmallBtn className="danger" onClick={() => revokeContact(c)}>Révoquer</SmallBtn>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : <EmptyState>Aucun contact de retrait pour cette zone. L'associé peut aussi en enregistrer depuis « Mes zones ».</EmptyState>}
        </div>
      )}

      {/* -------- Retrait automatique (un par associé) -------- */}
      {tab === 'auto' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm }}>
            <p style={{ fontSize: 13, color: colors.textSecondary, margin: 0, lineHeight: 1.5, maxWidth: 720 }}>
              Chaque associé a son <strong>solde réel</strong> et son propre retrait automatique vers son
              contact validé. Lorsque son solde atteint son seuil, sa part est payée sur son numéro.
            </p>
            <SmallBtn className="primary" onClick={runAuto}>Déclencher maintenant</SmallBtn>
          </div>

          <div style={{ marginTop: spacing.lg }}>
            {(zone.managers || []).filter((m) => m.status === 'active').length === 0 ? (
              <EmptyState>Aucun associé actif. Ajoutez un associé dans l'onglet « Associés ».</EmptyState>
            ) : (
              (zone.managers || [])
                .filter((m) => m.status === 'active')
                .map((m) => (
                  <AutoWithdrawalManagerCard
                    key={m.id}
                    zoneId={zone.id}
                    manager={m}
                    config={(zone.automatic_withdrawals || []).find((c) => c.manager_id === m.id)}
                    contacts={zone.withdrawal_contacts || []}
                    currencyCode="XAF"
                    onChanged={refresh}
                  />
                ))
            )}
          </div>
        </div>
      )}

      {/* -------- Statistiques -------- */}
      {tab === 'stats' && (
        <div>
          {statsLoading ? <LoadingSpinner /> : !zoneStats ? (
            <EmptyState>Aucune statistique disponible pour cette zone</EmptyState>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: spacing.md }}>
                <PeriodSelector value={statsPeriod} onChange={setStatsPeriod} />
              </div>

              <MiniStat>
                <StatBox><div className="lbl">Revenus (période)</div><div className="val">{fmt(zoneStats.totals.revenue)}</div></StatBox>
                <StatBox><div className="lbl">Retraits (période)</div><div className="val">{fmt(zoneStats.totals.withdrawn)}</div></StatBox>
                <StatBox><div className="lbl">Paiements</div><div className="val">{zoneStats.totals.payments_count}</div></StatBox>
                <StatBox><div className="lbl">Solde associés</div><div className="val">{fmt(zoneStats.totals.associate_balance)}</div></StatBox>
              </MiniStat>

              <h3 style={{ fontSize: '1rem', color: colors.textPrimary, margin: `${spacing.lg} 0 ${spacing.md}` }}>Revenus &amp; retraits</h3>
              <BarChart
                labels={(zoneStats.labels && zoneStats.labels.length ? zoneStats.labels : zoneStats.months.map((m) => m.month))}
                series={[
                  { label: 'Revenus', color: colors.primary, values: zoneStats.months.map((m) => parseFloat(m.revenue) || 0) },
                  { label: 'Retraits', color: colors.warning, values: zoneStats.months.map((m) => parseFloat(m.withdrawn) || 0) },
                ]}
                formatValue={(n) => `${Math.round(n).toLocaleString('en-US')} ${zoneStats.currency_code}`}
              />

              <h3 style={{ fontSize: '1rem', color: colors.textPrimary, margin: `${spacing.xl} 0 ${spacing.md}` }}>Associés</h3>
              {zoneStats.associates.length === 0 ? (
                <EmptyState>Aucun associé actif sur cette zone</EmptyState>
              ) : (
                <Table>
                  <thead><tr><th>Associé</th><th>%</th><th>Revenus (période)</th><th>Solde réel</th></tr></thead>
                  <tbody>
                    {zoneStats.associates.map((a) => (
                      <tr key={a.manager_id}>
                        <td>{a.display || '—'}</td>
                        <td>{a.percentage}%</td>
                        <td><strong>{fmt(a.revenue)} {zoneStats.currency_code}</strong></td>
                        <td>{fmt(a.balance)} {zoneStats.currency_code}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </>
          )}
        </div>
      )}

      {/* -------- Paiements -------- */}
      {tab === 'payments' && (
        <div>
          {payments?.summary && (
            <MiniStat>
              <StatBox><div className="lbl">Total payé</div><div className="val">{fmt(payments.summary.total_amount)}</div></StatBox>
              <StatBox><div className="lbl">Nb de paiements</div><div className="val">{payments.summary.total_payments}</div></StatBox>
            </MiniStat>
          )}
          {payments?.payments?.length ? (
            <Table>
              <thead><tr><th>Date</th><th>Désignation</th><th>Client</th><th>Montant</th><th>Statut</th></tr></thead>
              <tbody>
                {payments.payments.map((p: ZonePayment) => (
                  <tr key={p.payment_id}>
                    <td>{fmtDate(p.completed_at)}</td>
                    <td>{p.description || '—'}</td>
                    <td>{p.customer_email || p.customer_phone || '—'}</td>
                    <td><strong>{fmt(p.amount)} {p.currency}</strong></td>
                    <td><StatusBadge status={p.status}>{p.status}</StatusBadge></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : <EmptyState>Aucun paiement attribué à cette zone pour le moment</EmptyState>}
        </div>
      )}

      {/* -------- Retraits -------- */}
      {tab === 'withdrawals' && (
        <div>
          {zone.withdrawals?.length ? (
            <Table>
              <thead><tr><th>Date</th><th>Montant</th><th>Associé</th><th>Numéro</th><th>Statut</th><th>Actions</th></tr></thead>
              <tbody>
                {zone.withdrawals.map((wd: ZoneWithdrawal) => (
                  <tr key={wd.id}>
                    <td>{fmtDate(wd.created_at)}</td>
                    <td><strong>{fmt(wd.amount)} {wd.currency_code}</strong></td>
                    <td>{wd.manager_email || wd.requested_by || '—'}</td>
                    <td>{wd.recipient_number || '—'}</td>
                    <td><StatusBadge status={wd.status}>{wd.status_display}</StatusBadge></td>
                    <td>
                      {wd.status === 'submitted' && (
                        <span style={{ display: 'flex', gap: spacing.xs, alignItems: 'center', flexWrap: 'wrap' }}>
                          <input type="number" min={0} max={100} style={{ width: 64, padding: 4 }}
                            value={wdPercents[wd.id] ?? wd.associate_percentage}
                            onChange={(e) => setWdPercents({ ...wdPercents, [wd.id]: e.target.value === '' ? '' : parseInt(e.target.value) || 0 })} title="% associé" />
                          <SmallBtn className="success" onClick={() => companyApprove(wd)}>Valider (entreprise)</SmallBtn>
                          <SmallBtn className="danger" onClick={() => reject(wd)}>Rejeter</SmallBtn>
                        </span>
                      )}
                      {(wd.status === 'company_approved' || wd.status === 'approved') && isStaff && (
                        <span style={{ display: 'flex', gap: spacing.xs, alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 11, color: colors.textSecondary }}>
                            Frais Tikta : {wd.contact_fee_percentage ?? wd.fee_percentage}%
                          </span>
                          <SmallBtn className="primary" onClick={() => adminApprove(wd)}>
                            {wd.status === 'approved' ? 'Relancer le paiement' : 'Valider Tikta & payer'}
                          </SmallBtn>
                          <SmallBtn className="danger" onClick={() => reject(wd)}>Rejeter</SmallBtn>
                        </span>
                      )}
                      {(wd.status === 'processing' || wd.status === 'completed') && (
                        <span style={{ fontSize: 11, color: colors.textSecondary }}>{wd.payout_reference || wd.gateway_response ? 'Payé' : ''}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : <EmptyState>Aucun retrait sur cette zone</EmptyState>}
        </div>
      )}
    </ContentSection>
  );
};

// ---------- Page Zones ----------
export const ZonesPage: React.FC = () => {
  const { user } = useAuth();
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingContacts, setPendingContacts] = useState<ZoneWithdrawalContact[]>([]);
  const [contactFees, setContactFees] = useState<Record<string, number | string>>({});
  const isStaff = !!user?.is_superuser || !!user?.is_staff;

  const load = useCallback(async () => {
    setError('');
    try {
      const list = await zonesApi.list();
      setZones(list);
    } catch (e: any) {
      setError(e.message || 'Impossible de charger les zones');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadContacts = useCallback(async () => {
    try {
      const [pc, pt] = await Promise.all([
        zonesApi.allWithdrawalContacts('pending_company'),
        zonesApi.allWithdrawalContacts('pending_tikta'),
      ]);
      setPendingContacts([...pc, ...pt]);
    } catch {
      /* silencieux */
    }
  }, []);

  useEffect(() => { load(); loadContacts(); }, [load, loadContacts]);

  const approveContact = async (c: ZoneWithdrawalContact) => {
    await zonesApi.companyApproveContact(c.id);
    loadContacts();
  };

  const validateContact = async (c: ZoneWithdrawalContact) => {
    const raw = contactFees[c.id];
    const fee = raw === undefined || raw === '' ? parseFloat(c.fee_percentage || '0') || 0 : Number(raw) || 0;
    await zonesApi.validateContact(c.id, fee);
  };

  const rejectContact = async (c: ZoneWithdrawalContact) => {
    const reason = prompt('Motif du rejet (optionnel)') || undefined;
    await zonesApi.rejectContact(c.id, reason);
    loadContacts();
  };

  if (selectedId) {
    return (
      <ZoneDetailView
        zoneId={selectedId}
        onBack={() => setSelectedId(null)}
        onChanged={(z) => setZones((prev) => prev.map((p) => (p.id === z.id ? z : p)))}
      />
    );
  }

  return (
    <ContentSection>
      <PageHeader>
        <HeaderRow>
          <div>
            <h1>Zones</h1>
            <p>Tracez vos zones sur la carte : chaque paiement est attribué à la zone la plus proche du client.</p>
          </div>
          <PrimaryButton onClick={() => setShowCreate(true)}>+ Nouvelle zone</PrimaryButton>
        </HeaderRow>
      </PageHeader>

      {error && <ErrorMsg>{error}</ErrorMsg>}

      {pendingContacts.length > 0 && (
        <div style={{ marginBottom: spacing.xl }}>
          <h2 style={{ fontSize: '1.05rem', color: colors.textPrimary, margin: `0 0 ${spacing.md} 0` }}>
            Contacts de retrait à valider ({pendingContacts.length})
          </h2>
          <Table>
            <thead><tr><th>Zone</th><th>Numéro</th><th>Associé</th><th>Libellé</th><th>Statut</th><th>Actions</th></tr></thead>
            <tbody>
              {pendingContacts.map((c) => (
                <tr key={c.id}>
                  <td>{c.zone_name}</td>
                  <td><strong>{c.number}</strong></td>
                  <td>{c.manager_email || 'Entreprise'}</td>
                  <td>{c.label || '—'}</td>
                  <td><StatusBadge status="pending">{c.status_display}</StatusBadge></td>
                  <td>
                    <span style={{ display: 'flex', gap: spacing.xs, alignItems: 'center', flexWrap: 'wrap' }}>
                      {c.status === 'pending_company' && (
                        <>
                          <SmallBtn className="success" onClick={() => approveContact(c)}>Valider (entreprise)</SmallBtn>
                          <SmallBtn className="danger" onClick={() => rejectContact(c)}>Rejeter</SmallBtn>
                        </>
                      )}
                      {isStaff && (
                        <>
                          <input type="number" min={0} max={100} style={{ width: 64, padding: 4 }} placeholder="Frais %"
                            value={contactFees[c.id] ?? ''} onChange={(e) => setContactFees({ ...contactFees, [c.id]: e.target.value === '' ? '' : parseFloat(e.target.value) || 0 })} />
                          <SmallBtn className="primary" onClick={() => validateContact(c)}>Valider Tikta</SmallBtn>
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : zones.length === 0 ? (
        <EmptyState>
          Aucune zone pour le moment. Cliquez sur « + Nouvelle zone » et tracez votre première zone
          (activez la localisation, posez au moins 3 points autour de l'espace couvert).
        </EmptyState>
      ) : (
        <CardGrid>
          {zones.map((z: Zone) => (
            <Card key={z.id}>
              <ZoneName><ColorDot color={z.color} />{z.name}</ZoneName>
              <CardMeta>
                <span>Entreprise : <strong>{z.company_name}</strong></span>
                <span>Surface : <strong>{fmt(z.area_sqm, 0)} m²</strong></span>
                <span>Revenus générés : <strong>{fmt(z.total_generated)}</strong></span>
                <span>Solde associé : <strong>{fmt(z.associate_balance)}</strong></span>
                <span>Statut : <StatusBadge status={z.is_active ? 'active' : 'offline'}>{z.is_active ? 'Active' : 'Désactivée'}</StatusBadge> <StatusBadge status={z.is_closed ? 'active' : 'pending'}>{z.is_closed ? 'Tracé validé' : 'Tracé non validé'}</StatusBadge> {z.automatic_withdrawal_enabled && <StatusBadge status="active">Retrait auto → {(z.automatic_withdrawal_contacts?.length ? z.automatic_withdrawal_contacts.join(', ') : (z.automatic_withdrawal_contact || '—'))}</StatusBadge>}</span>
              </CardMeta>
              <CardActions>
                <SmallBtn className="primary" onClick={() => setSelectedId(z.id)}>Détail</SmallBtn>
                <SmallBtn onClick={async () => { const updated = await zonesApi.toggle(z.id); setZones((prev) => prev.map((p) => (p.id === z.id ? updated : p))); }}>
                  {z.is_active ? 'Désactiver' : 'Activer'}
                </SmallBtn>
                {!z.is_closed && (
                  <SmallBtn onClick={async () => { const updated = await zonesApi.close(z.id); setZones((prev) => prev.map((p) => (p.id === z.id ? updated : p))); }}>
                    Valider tracé
                  </SmallBtn>
                )}
              </CardActions>
            </Card>
          ))}
        </CardGrid>
      )}

      {showCreate && (
        <CreateZoneModal
          onClose={() => setShowCreate(false)}
          onCreated={(z) => { setZones((prev) => [z, ...prev]); }}
        />
      )}
    </ContentSection>
  );
};