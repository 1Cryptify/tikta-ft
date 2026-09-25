import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  FiAlertTriangle,
  FiArrowLeft,
  FiCheck,
  FiCopy,
  FiDownload,
  FiInfo,
  FiWifi,
} from 'react-icons/fi';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from '@react-pdf/renderer';
import LoadingSpinner from '../components/LoadingSpinner';
import WifiLoader from '../components/Payment/WifiLoader';
import '../styles/payment.css';
import '../styles/order-flow.css';

interface TicketInfo {
  ticket_id: string;
  password: string;
  valid_from?: string;
  valid_until?: string;
  offer_name: string;
  offer_id?: string;
  callback_url?: string;
}

interface PaymentInfo {
  paymentId: string;
  transactionId: string;
  reference: string;
  gatewayReference: string;
  amount: string;
  currency: string;
}

interface StoredPaymentData {
  paymentInfo: PaymentInfo;
  tickets?: TicketInfo[];
  offerName?: string;
  offerType?: string;
  adminContactMessage?: string;
  ticketAvailable?: boolean;
  allTicketsAvailable?: boolean;
  offersWithoutTickets?: string[];
  callbackUrl?: string;
  timeout?: boolean;
}

/* ------------------------------------------------------------------ */
/*  PDF documents                                                      */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: '#ffffff', fontFamily: 'Helvetica' },
  header: { marginBottom: 30, borderBottom: '2px solid #1e3a5f', paddingBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1f2937', marginBottom: 10 },
  subtitle: { fontSize: 14, color: '#6b7280' },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#374151', marginBottom: 15, backgroundColor: '#f3f4f6', padding: 10 },
  row: { flexDirection: 'row', marginBottom: 10 },
  label: { width: '40%', fontSize: 12, color: '#6b7280', fontWeight: 'bold' },
  value: { width: '60%', fontSize: 12, color: '#1f2937' },
  ticketBox: { border: '2px solid #e5e7eb', borderRadius: 8, padding: 20, marginBottom: 20, backgroundColor: '#fafafa' },
  ticketTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e3a5f', marginBottom: 15 },
  divider: { borderBottom: '1px solid #e5e7eb', marginVertical: 15 },
  warning: { backgroundColor: '#fef3c7', padding: 15, borderRadius: 6, marginTop: 30 },
  warningText: { fontSize: 11, color: '#92400e', textAlign: 'center' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 10, color: '#9ca3af' },
  credentialsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  credentialBlock: { width: '48%' },
  credentialLabel: { fontSize: 10, color: '#6b7280', marginBottom: 5 },
  credentialValue: { fontSize: 14, fontWeight: 'bold', color: '#1f2937', backgroundColor: '#e5e7eb', padding: 10, borderRadius: 4, fontFamily: 'Courier' },
});

const SingleTicketPDF: React.FC<{ ticket: TicketInfo; index?: number }> = ({ ticket, index }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>TICKET</Text>
        <Text style={styles.subtitle}>{ticket.offer_name}</Text>
      </View>
      <View style={styles.ticketBox}>
        <Text style={styles.ticketTitle}>Informations du Ticket {index !== undefined ? `#${index + 1}` : ''}</Text>
        <View style={styles.credentialsGrid}>
          <View style={styles.credentialBlock}>
            <Text style={styles.credentialLabel}>Identifiant Ticket</Text>
            <Text style={styles.credentialValue}>{ticket.ticket_id}</Text>
          </View>
          <View style={styles.credentialBlock}>
            <Text style={styles.credentialLabel}>Mot de passe</Text>
            <Text style={styles.credentialValue}>{ticket.password}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>Offre:</Text>
          <Text style={styles.value}>{ticket.offer_name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Date d'achat:</Text>
          <Text style={styles.value}>{new Date().toLocaleDateString('fr-FR')}</Text>
        </View>
        {ticket.valid_from && (
          <View style={styles.row}>
            <Text style={styles.label}>Valide à partir du:</Text>
            <Text style={styles.value}>{ticket.valid_from}</Text>
          </View>
        )}
        {ticket.valid_until && (
          <View style={styles.row}>
            <Text style={styles.label}>Valide jusqu'au:</Text>
            <Text style={styles.value}>{ticket.valid_until}</Text>
          </View>
        )}
      </View>
      <View style={styles.warning}>
        <Text style={styles.warningText}>ATTENTION: Conservez ces informations precieusement.</Text>
      </View>
      <Text style={styles.footer}>Généré le {new Date().toLocaleDateString('fr-FR')} - Tikta</Text>
    </Page>
  </Document>
);

const AllTicketsPDF: React.FC<{ paymentData: StoredPaymentData }> = ({ paymentData }) => {
  const formatPrice = (amount: string, currency: string): string =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: currency || 'XAF' }).format(parseFloat(amount) || 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>VOS IDENTIFIANTS</Text>
          <Text style={styles.subtitle}>{paymentData.offerName || 'Achat'}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Récapitulatif de l'achat</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{new Date().toLocaleDateString('fr-FR')}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Référence:</Text>
            <Text style={styles.value}>{paymentData.paymentInfo?.reference}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Montant:</Text>
            <Text style={styles.value}>{formatPrice(paymentData.paymentInfo?.amount, paymentData.paymentInfo?.currency)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Nombre de tickets:</Text>
            <Text style={styles.value}>{paymentData.tickets?.length || 0}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Détails des Tickets</Text>
        {paymentData.tickets?.map((ticket, index) => (
          <View key={ticket.ticket_id} style={styles.ticketBox}>
            <Text style={styles.ticketTitle}>Ticket #{index + 1} - {ticket.offer_name}</Text>
            <View style={styles.credentialsGrid}>
              <View style={styles.credentialBlock}>
                <Text style={styles.credentialLabel}>Identifiant</Text>
                <Text style={styles.credentialValue}>{ticket.ticket_id}</Text>
              </View>
              <View style={styles.credentialBlock}>
                <Text style={styles.credentialLabel}>Mot de passe</Text>
                <Text style={styles.credentialValue}>{ticket.password}</Text>
              </View>
            </View>
          </View>
        ))}
        <View style={styles.warning}>
          <Text style={styles.warningText}>ATTENTION: Conservez precieusement vos identifiants.</Text>
        </View>
        <Text style={styles.footer}>Généré le {new Date().toLocaleDateString('fr-FR')} - Tikta</Text>
      </Page>
    </Document>
  );
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const buildConnectUrl = (base: string, ticket: TicketInfo): string => {
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}login=${encodeURIComponent(ticket.ticket_id)}&password=${encodeURIComponent(ticket.password)}`;
};

export const PaymentSuccessPage: React.FC = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentData, setPaymentData] = useState<StoredPaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  useEffect(() => {
    const stateData = location.state?.paymentData;
    if (stateData) {
      setPaymentData(stateData);
      localStorage.setItem('pendingPayment', JSON.stringify(stateData));
      setLoading(false);
      return;
    }
    const storedPayment = localStorage.getItem('pendingPayment');
    if (storedPayment) {
      try {
        setPaymentData(JSON.parse(storedPayment));
      } catch (e) {
        console.error('Error parsing payment info:', e);
      }
    }
    setLoading(false);
  }, [location.state]);

  const formatPrice = (amount: string, currency: string): string =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: currency || 'XAF' }).format(parseFloat(amount) || 0);

  const handleContinue = () => {
    if (groupId) navigate(`/pay/g/${groupId}`);
    else navigate('/');
  };

  const downloadTicketPDF = async (ticket: TicketInfo, index: number) => {
    const blob = await pdf(<SingleTicketPDF ticket={ticket} index={index} />).toBlob();
    triggerDownload(blob, `ticket-${ticket.ticket_id}.pdf`);
  };

  const downloadAllTickets = async () => {
    if (!paymentData?.tickets || paymentData.tickets.length === 0) return;
    const blob = await pdf(<AllTicketsPDF paymentData={paymentData} />).toBlob();
    triggerDownload(blob, `identifiants-${paymentData.paymentInfo?.reference || 'tikta'}.pdf`);
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey((current) => (current === key ? null : current)), 2000);
    }).catch(() => {});
  };

  const handleConnect = (ticket: TicketInfo) => {
    const base = ticket.callback_url || paymentData?.callbackUrl;
    if (!base) return;

    const url = buildConnectUrl(base, ticket);
    setConnectingId(ticket.ticket_id);

    // Redirection directe vers le portail opérateur (auto-connexion), après
    // un court instant pour laisser l'animation WiFi se voir.
    window.setTimeout(() => {
      window.location.href = url;
    }, 1200);
  };

  if (loading) {
    return (
      <div className="of-center">
        <LoadingSpinner />
      </div>
    );
  }

  const tickets = paymentData?.tickets || [];
  const hasTickets = tickets.length > 0;
  const callbackUrl = paymentData?.callbackUrl;
  const hasCallback = Boolean(callbackUrl) || tickets.some((t) => t.callback_url);
  const shouldShowAdminMessage = Boolean(paymentData?.adminContactMessage) && !hasTickets;

  return (
    <div className="of-center">
      <div className="of-card of-card--center">
        <div className="of-status-icon of-status-icon--success">
          <FiCheck aria-hidden="true" />
        </div>
        <h1 className="of-title">Paiement réussi</h1>
        <p className="of-subtitle">Merci ! Votre paiement a été confirmé.</p>
        {paymentData?.paymentInfo && (
          <div className="of-amount">
            {formatPrice(paymentData.paymentInfo.amount, paymentData.paymentInfo.currency)}
          </div>
        )}

        {paymentData?.timeout && (
          <div className="of-notice of-notice--info" style={{ marginTop: 16 }}>
            <FiInfo aria-hidden="true" />
            <span>La vérification a pris plus de temps que prévu. Vos identifiants apparaîtront dès confirmation.</span>
          </div>
        )}

        {shouldShowAdminMessage && (
          <div className="of-notice of-notice--error" style={{ marginTop: 16 }}>
            <FiAlertTriangle aria-hidden="true" />
            <span>{paymentData?.adminContactMessage}</span>
          </div>
        )}

        {/* Primary actions: connect + download */}
        {hasTickets && (
          <div className="of-actions">
            {tickets.length === 1 && hasCallback && (
              <button
                type="button"
                className="of-btn of-btn--success of-btn--block"
                onClick={() => handleConnect(tickets[0])}
                disabled={Boolean(connectingId)}
              >
                {connectingId ? (
                  <WifiLoader label="Connexion en cours…" />
                ) : (
                  <>
                    <FiWifi aria-hidden="true" />
                    CONNECT ME
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              className="of-btn of-btn--outline of-btn--block"
              onClick={downloadAllTickets}
            >
              <FiDownload aria-hidden="true" />
              {tickets.length > 1 ? 'Télécharger mes identifiants' : 'Télécharger mon ticket'}
            </button>
          </div>
        )}

        {/* Tickets */}
        {hasTickets && (
          <div style={{ marginTop: 22, textAlign: 'left' }}>
            <div className="of-section-title">Vos identifiants</div>
            {tickets.map((ticket, index) => {
              const canConnect = Boolean(ticket.callback_url || callbackUrl);
              const isConnecting = connectingId === ticket.ticket_id;
              return (
                <div key={ticket.ticket_id} className="of-ticket">
                  <div className="of-ticket__head">
                    <span className="of-ticket__num">{index + 1}</span>
                    <h3 className="of-ticket__name">{ticket.offer_name}</h3>
                  </div>

                  <div className="of-cred">
                    <code className="of-cred__value">{ticket.ticket_id}</code>
                    <button
                      type="button"
                      className="of-cred__copy"
                      onClick={() => copyToClipboard(ticket.ticket_id, `${ticket.ticket_id}-id`)}
                      title="Copier l'identifiant"
                    >
                      {copiedKey === `${ticket.ticket_id}-id` ? <FiCheck /> : <FiCopy />}
                    </button>
                  </div>

                  <div className="of-cred">
                    <code className="of-cred__value">{ticket.password}</code>
                    <button
                      type="button"
                      className="of-cred__copy"
                      onClick={() => copyToClipboard(ticket.password, `${ticket.ticket_id}-pwd`)}
                      title="Copier le mot de passe"
                    >
                      {copiedKey === `${ticket.ticket_id}-pwd` ? <FiCheck /> : <FiCopy />}
                    </button>
                  </div>

                  {(ticket.valid_from || ticket.valid_until) && (
                    <p className="of-offer__validity" style={{ marginTop: 4 }}>
                      {ticket.valid_from && `Valide à partir du ${ticket.valid_from}`}
                      {ticket.valid_from && ticket.valid_until && ' — '}
                      {ticket.valid_until && `jusqu'au ${ticket.valid_until}`}
                    </p>
                  )}

                  {canConnect && (
                    <button
                      type="button"
                      className="of-btn of-btn--success of-btn--block"
                      style={{ marginTop: 10 }}
                      onClick={() => handleConnect(ticket)}
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
                    </button>
                  )}

                  {tickets.length > 1 && (
                    <button
                      type="button"
                      className="of-link"
                      style={{ marginTop: 8 }}
                      onClick={() => downloadTicketPDF(ticket, index)}
                    >
                      <FiDownload /> Télécharger ce ticket
                    </button>
                  )}
                </div>
              );
            })}

            <div className="of-notice of-notice--warn">
              <FiAlertTriangle aria-hidden="true" />
              <span>Conservez précieusement vos identifiants. Ils vous seront également envoyés par SMS et/ou email.</span>
            </div>
          </div>
        )}

        {/* Transaction details */}
        {paymentData?.paymentInfo && (
          <div className="of-details">
            <div className="of-detail-row">
              <span className="of-detail-row__label">Référence</span>
              <span className="of-detail-row__value">{paymentData.paymentInfo.reference || 'N/A'}</span>
            </div>
            <div className="of-detail-row">
              <span className="of-detail-row__label">Montant payé</span>
              <span className="of-detail-row__value">
                {formatPrice(paymentData.paymentInfo.amount, paymentData.paymentInfo.currency)}
              </span>
            </div>
            <div className="of-detail-row">
              <span className="of-detail-row__label">Statut</span>
              <span className="of-detail-row__value" style={{ color: 'var(--color-success)' }}>
                Complété
              </span>
            </div>
            <div className="of-detail-row">
              <span className="of-detail-row__label">Date</span>
              <span className="of-detail-row__value">{new Date().toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
        )}

        <div className="of-actions">
          <button type="button" className="of-btn of-btn--outline of-btn--block" onClick={handleContinue}>
            <FiArrowLeft aria-hidden="true" />
            Continuer
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
