import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiSearch, FiCopy, FiCheckCircle, FiAlertCircle, FiShield, FiClock, FiDownload, FiWifi } from 'react-icons/fi';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { AuthLayout } from '../components/Auth/AuthLayout';
import { Button } from '../components/Form/Button';
import WifiLoader from '../components/Payment/WifiLoader';
import { colors, spacing, borderRadius } from '../config/theme';
import { paymentService } from '../services/paymentService';
import { getCanvasFingerprint } from '../utils/fingerprint';

interface RecoveredTicket {
    ticket_id: string;
    password: string;
    offer_name?: string;
    valid_from?: string;
    valid_until?: string;
    callback_url?: string;
}

/* ---------- PDF ---------- */
const pdfStyles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Helvetica', backgroundColor: '#ffffff' },
    title: { fontSize: 26, fontWeight: 'bold', color: '#1e3a5f', marginBottom: 4 },
    subtitle: { fontSize: 13, color: '#6b7280', marginBottom: 24 },
    box: { border: '2px solid #e5e7eb', borderRadius: 8, padding: 20, backgroundColor: '#fafafa' },
    label: { fontSize: 11, color: '#6b7280', marginBottom: 4, marginTop: 10 },
    value: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', backgroundColor: '#e5e7eb', padding: 10, borderRadius: 4, fontFamily: 'Courier' },
    footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 10, color: '#9ca3af' },
});

const RecoveredTicketPDF: React.FC<{ ticket: RecoveredTicket }> = ({ ticket }) => (
    <Document>
        <Page size="A4" style={pdfStyles.page}>
            <Text style={pdfStyles.title}>TICKET WIFI</Text>
            <Text style={pdfStyles.subtitle}>{ticket.offer_name || 'Accès WiFi'}</Text>
            <View style={pdfStyles.box}>
                <Text style={pdfStyles.label}>Identifiant</Text>
                <Text style={pdfStyles.value}>{ticket.ticket_id}</Text>
                <Text style={pdfStyles.label}>Mot de passe</Text>
                <Text style={pdfStyles.value}>{ticket.password}</Text>
            </View>
            <Text style={pdfStyles.footer}>Généré le {new Date().toLocaleDateString('fr-FR')} - Tikta</Text>
        </Page>
    </Document>
);

/* ---------- Styles ---------- */
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const Label = styled.label`
  font-size: 0.82rem;
  font-weight: 600;
  color: ${colors.textPrimary};
`;

const InputWrap = styled.div<{ $hasError?: boolean; $disabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0 1rem;
  border: 1px solid ${p => (p.$hasError ? colors.error : colors.border)};
  border-radius: ${borderRadius.md};
  background: ${p => (p.$disabled ? '#f5f6f8' : colors.surface)};
  transition: border-color 150ms ease, box-shadow 150ms ease;

  &:focus-within {
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.12);
  }
`;

const FieldIcon = styled.span`
  color: ${colors.textSecondary};
  display: flex;
  flex: 0 0 auto;
  pointer-events: none;
`;

const TextInput = styled.input`
  flex: 1;
  min-width: 0;
  padding: 0.8rem 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.95rem;
  color: ${colors.textPrimary};
  text-transform: uppercase;

  &::placeholder {
    color: ${colors.textSecondary};
    opacity: 0.7;
    text-transform: none;
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const Alert = styled.div<{ $tone: 'error' | 'success' }>`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.8rem 1rem;
  border-radius: ${borderRadius.md};
  font-size: 0.85rem;
  font-weight: 500;
  line-height: 1.45;
  background: ${p => (p.$tone === 'error' ? '#fef2f2' : '#ecfdf5')};
  color: ${p => (p.$tone === 'error' ? colors.error : colors.success)};
  border: 1px solid ${p => (p.$tone === 'error' ? '#fecaca' : '#a7f3d0')};
`;

const TicketCard = styled.div`
  border: 1px solid ${colors.border};
  border-radius: ${borderRadius.md};
  padding: ${spacing.lg};
  background: #f9fafb;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const TicketRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
`;

const TicketLabel = styled.span`
  color: ${colors.textSecondary};
  font-weight: 500;
`;

const TicketValue = styled.span`
  font-weight: 700;
  color: ${colors.textPrimary};
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  letter-spacing: 0.03em;
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const CopyBtn = styled.button`
  background: none;
  border: none;
  color: ${colors.textSecondary};
  cursor: pointer;
  display: flex;
  padding: 0.15rem;

  &:hover {
    color: ${colors.primary};
  }
`;

const ConnectBtn = styled.button`
  margin-top: 0.4rem;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.85rem 1rem;
  border: none;
  border-radius: ${borderRadius.md};
  background: linear-gradient(135deg, #047857, #10b981);
  color: #fff;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: box-shadow 0.2s, opacity 0.2s;

  &:hover:not(:disabled) {
    box-shadow: 0 10px 22px rgba(5, 150, 105, 0.32);
  }

  &:disabled {
    opacity: 0.7;
    cursor: default;
  }
`;

const DownloadBtn = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.7rem 1rem;
  border: 1px solid ${colors.border};
  border-radius: ${borderRadius.md};
  background: ${colors.surface};
  color: ${colors.textPrimary};
  font-weight: 600;
  font-size: 0.88rem;
  cursor: pointer;

  &:hover {
    background: ${colors.neutral};
  }
`;

const buildConnectUrl = (base: string, ticket: RecoveredTicket): string => {
    const sep = base.includes('?') ? '&' : '?';
    return `${base}${sep}login=${encodeURIComponent(ticket.ticket_id)}&password=${encodeURIComponent(ticket.password)}`;
};

export const RecoverTicketPage: React.FC = () => {
    const [reference, setReference] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [tickets, setTickets] = useState<RecoveredTicket[]>([]);
    const [retryIn, setRetryIn] = useState(0);
    const [copied, setCopied] = useState('');
    const [connectingId, setConnectingId] = useState<string | null>(null);

    useEffect(() => {
        if (retryIn > 0) {
            const timer = setTimeout(() => setRetryIn(retryIn - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [retryIn]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const value = reference.trim();
        if (!value) {
            setError('Veuillez saisir votre identifiant de transaction.');
            return;
        }

        setIsLoading(true);
        setError('');
        setMessage('');
        setTickets([]);

        try {
            const fingerprint = getCanvasFingerprint();
            const result: any = await paymentService.recoverTicket(value, fingerprint);

            if (result?.status === 'success') {
                setTickets(result.tickets || []);
                setMessage(result.message || 'Ticket(s) retrouvé(s).');
            } else if (result?.status === 'pending') {
                setMessage(result.message || 'Paiement en cours de traitement.');
            } else if (result?.status === 'rate_limited') {
                setError(result.message || 'Trop de tentatives.');
                setRetryIn(result.retryAfter || 60);
            } else {
                setError(result?.message || 'Aucun ticket trouvé pour cet identifiant.');
            }
        } catch {
            setError('Une erreur est survenue. Veuillez réessayer.');
        } finally {
            setIsLoading(false);
        }
    };

    const copy = (value: string, key: string) => {
        navigator.clipboard?.writeText(value).then(() => {
            setCopied(key);
            setTimeout(() => setCopied(''), 1500);
        });
    };

    const handleConnect = (ticket: RecoveredTicket) => {
        if (!ticket.callback_url) return;
        setConnectingId(ticket.ticket_id);
        window.setTimeout(() => {
            window.location.href = buildConnectUrl(ticket.callback_url as string, ticket);
        }, 1200);
    };

    const downloadTicket = async (ticket: RecoveredTicket) => {
        const blob = await pdf(<RecoveredTicketPDF ticket={ticket} />).toBlob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ticket-${ticket.ticket_id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    return (
        <AuthLayout
          title="Récupérer mon ticket"
          subtitle="Saisissez l'identifiant de transaction reçu par SMS (opérateur Mobile Money) pour retrouver votre ticket WiFi."
          brandHeadline="Un ticket égaré ? Retrouvez-le en quelques secondes."
          brandLede="Saisissez l'identifiant de transaction reçu par SMS Mobile Money pour réafficher vos identifiants WiFi, même si vous avez fermé la page après le paiement."
          brandFeatures={[
            <><FiSearch size={18} /> Recherche par identifiant de transaction</>,
            <><FiCheckCircle size={18} /> Identifiant et mot de passe réaffichés aussitôt</>,
            <><FiClock size={18} /> Fonctionne même après un paiement interrompu</>,
            <><FiShield size={18} /> Accès sécurisé, protégé contre les abus</>,
          ]}
        >
          <Form onSubmit={handleSubmit}>
            {error && (
              <Alert $tone="error">
                <FiAlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>
                  {error}
                  {retryIn > 0 ? ` Réessayez dans ${retryIn}s.` : ''}
                </span>
              </Alert>
            )}
            {message && !error && (
              <Alert $tone="success">
                <FiCheckCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{message}</span>
              </Alert>
            )}

            <Field>
              <Label htmlFor="reference">Identifiant de transaction</Label>
              <InputWrap $hasError={!!error} $disabled={isLoading || retryIn > 0}>
                <FieldIcon><FiSearch size={18} /></FieldIcon>
                <TextInput
                  id="reference"
                  type="text"
                  placeholder="ex. MP260924.2005.A80535"
                  value={reference}
                  onChange={e => setReference(e.target.value)}
                  disabled={isLoading || retryIn > 0}
                  autoFocus
                />
              </InputWrap>
            </Field>

            <Button type="submit" fullWidth loading={isLoading} size="lg" disabled={retryIn > 0}>
              Retrouver mon ticket
            </Button>

            {tickets.map((t, i) => {
              const isConnecting = connectingId === t.ticket_id;
              return (
                <TicketCard key={`${t.ticket_id}-${i}`}>
                  {t.offer_name && (
                    <TicketRow>
                      <TicketLabel>Offre</TicketLabel>
                      <TicketValue>{t.offer_name}</TicketValue>
                    </TicketRow>
                  )}
                  <TicketRow>
                    <TicketLabel>Identifiant</TicketLabel>
                    <TicketValue>
                      {t.ticket_id}
                      <CopyBtn type="button" title="Copier" onClick={() => copy(t.ticket_id, `id-${i}`)}>
                        {copied === `id-${i}` ? <FiCheckCircle color={colors.success} /> : <FiCopy />}
                      </CopyBtn>
                    </TicketValue>
                  </TicketRow>
                  <TicketRow>
                    <TicketLabel>Mot de passe</TicketLabel>
                    <TicketValue>
                      {t.password}
                      <CopyBtn type="button" title="Copier" onClick={() => copy(t.password, `pw-${i}`)}>
                        {copied === `pw-${i}` ? <FiCheckCircle color={colors.success} /> : <FiCopy />}
                      </CopyBtn>
                    </TicketValue>
                  </TicketRow>

                  {t.callback_url && (
                    <ConnectBtn
                      type="button"
                      onClick={() => handleConnect(t)}
                      disabled={Boolean(connectingId)}
                    >
                      {isConnecting ? (
                        <WifiLoader label="Connexion en cours…" />
                      ) : (
                        <>
                          <FiWifi aria-hidden="true" />
                          CONNECT ME
                        </>
                      )}
                    </ConnectBtn>
                  )}

                  <DownloadBtn type="button" onClick={() => downloadTicket(t)}>
                    <FiDownload aria-hidden="true" />
                    Télécharger mon ticket
                  </DownloadBtn>
                </TicketCard>
              );
            })}
          </Form>
        </AuthLayout>
    );
};

export default RecoverTicketPage;
