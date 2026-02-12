import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FiCopy, FiCheck } from 'react-icons/fi';
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from '@react-pdf/renderer';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/payment.css';
import '../styles/payment-success.css';

interface TicketInfo {
  ticket_id: string;
  password: string;
  valid_from: string;
  valid_until: string;
  offer_name: string;
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
}

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2px solid #2563eb',
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 15,
    backgroundColor: '#f3f4f6',
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  label: {
    width: '40%',
    fontSize: 12,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  value: {
    width: '60%',
    fontSize: 12,
    color: '#1f2937',
  },
  ticketBox: {
    border: '2px solid #e5e7eb',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    backgroundColor: '#fafafa',
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 15,
  },
  divider: {
    borderBottom: '1px solid #e5e7eb',
    marginVertical: 15,
  },
  warning: {
    backgroundColor: '#fef3c7',
    padding: 15,
    borderRadius: 6,
    marginTop: 30,
  },
  warningText: {
    fontSize: 11,
    color: '#92400e',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 10,
    color: '#9ca3af',
  },
  credentialsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  credentialBlock: {
    width: '48%',
  },
  credentialLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 5,
  },
  credentialValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    backgroundColor: '#e5e7eb',
    padding: 10,
    borderRadius: 4,
    fontFamily: 'Courier',
  },
});

// Single Ticket PDF Document
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
            <Text style={styles.value}>{new Date(ticket.valid_from).toLocaleDateString('fr-FR')}</Text>
          </View>
        )}
        {ticket.valid_until && (
          <View style={styles.row}>
            <Text style={styles.label}>Valide jusqu'au:</Text>
            <Text style={styles.value}>{new Date(ticket.valid_until).toLocaleDateString('fr-FR')}</Text>
          </View>
        )}
      </View>

      <View style={styles.warning}>
        <Text style={styles.warningText}>
          ATTENTION: Conservez ces informations precieusement.
        </Text>
      </View>

      <Text style={styles.footer}>
        Généré le {new Date().toLocaleDateString('fr-FR')} - Tikta
      </Text>
    </Page>
  </Document>
);

// All Tickets PDF Document
const AllTicketsPDF: React.FC<{ paymentData: StoredPaymentData }> = ({ paymentData }) => {
  const formatPrice = (amount: string, currency: string): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency || 'XAF',
    }).format(parseFloat(amount) || 0);
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>VOS TICKETS</Text>
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
            <Text style={styles.value}>{paymentData.paymentInfo.reference}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Montant:</Text>
            <Text style={styles.value}>
              {formatPrice(paymentData.paymentInfo.amount, paymentData.paymentInfo.currency)}
            </Text>
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
          <Text style={styles.warningText}>
            ATTENTION: Conservez precieusement vos identifiants.
          </Text>
        </View>

        <Text style={styles.footer}>
          Généré le {new Date().toLocaleDateString('fr-FR')} - Tikta
        </Text>
      </Page>
    </Document>
  );
};

export const PaymentSuccessPage: React.FC = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentData, setPaymentData] = useState<StoredPaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    // First try to get payment data from navigation state (most reliable)
    const stateData = location.state?.paymentData;
    
    if (stateData) {
      // Use data from navigation state
      setPaymentData(stateData);
      // Also store in localStorage as backup for page refresh
      localStorage.setItem('pendingPayment', JSON.stringify(stateData));
      setLoading(false);
      return;
    }
    
    // Fallback to localStorage if no state data (e.g., page refresh)
    const storedPayment = localStorage.getItem('pendingPayment');
    if (storedPayment) {
      try {
        const parsed = JSON.parse(storedPayment);
        setPaymentData(parsed);
        // Clear the pending payment from localStorage after a delay
        setTimeout(() => {
          localStorage.removeItem('pendingPayment');
        }, 5000);
      } catch (e) {
        console.error('Error parsing payment info:', e);
      }
    }
    setLoading(false);
  }, [location.state]);

  const formatPrice = (amount: string, currency: string): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency || 'XAF',
    }).format(parseFloat(amount) || 0);
  };

  const handleContinueShopping = () => {
    if (groupId) {
      navigate(`/pay/g/${groupId}`);
    } else {
      navigate('/');
    }
  };

  const downloadTicketPDF = async (ticket: TicketInfo, index: number) => {
    const blob = await pdf(<SingleTicketPDF ticket={ticket} index={index} />).toBlob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ticket-${ticket.ticket_id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const downloadAllTickets = async () => {
    if (!paymentData?.tickets || paymentData.tickets.length === 0) return;

    const blob = await pdf(<AllTicketsPDF paymentData={paymentData} />).toBlob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tickets-${paymentData.paymentInfo.reference}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copié dans le presse-papiers !');
    }).catch(err => {
      console.error('Erreur lors de la copie:', err);
    });
  };

  if (loading) {
    return (
      <div className="payment-success">
        <div className="success-container">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  const hasTickets = paymentData?.tickets && paymentData.tickets.length > 0;
  const hasAdminContactMessage = paymentData?.adminContactMessage;
  const isTicketUnavailable = paymentData?.ticketAvailable === false || paymentData?.allTicketsAvailable === false;
  console.log(paymentData)
  return (
    <div className="payment-success">
      <div className="success-container">
        <div className="success-icon" />
        <h1 className="success-title">Paiement Réussi !</h1>
        <p className="success-message">
          Merci ! Votre paiement a été traité avec succès.
          {hasTickets && ' Vos tickets sont disponibles ci-dessous.'}
          {!hasTickets && !isTicketUnavailable && ' Un email de confirmation vous sera envoyé.'}
          {isTicketUnavailable && ' Cependant, nous rencontrons un problème avec vos tickets.'}
        </p>



        {/* Tickets Section */}
        {hasTickets && (
          <div className="tickets-section">
            <div className="tickets-header">
              <h2>Vos Tickets</h2>
              {paymentData.tickets && paymentData.tickets.length > 1 && (
                <button 
                  className="btn-download-all"
                  onClick={downloadAllTickets}
                >
                  Télécharger tous les tickets
                </button>
              )}
            </div>

            <div className="tickets-list">
              {paymentData.tickets?.map((ticket, index) => (
                <div key={ticket.ticket_id} className="ticket-card-success">
                  <div className="ticket-header-success">
                    <span className="ticket-number">{index + 1}</span>
                    <h3>{ticket.offer_name}</h3>
                  </div>
                  
                  <div className="ticket-credentials">
                    <div className="credential-row">
                      <span className="credential-label">Identifiant Ticket:</span>
                      <div className="credential-value-container">
                        <code className="credential-code">{ticket.ticket_id}</code>
                        <button
                          className="btn-copy"
                          onClick={() => copyToClipboard(ticket.ticket_id)}
                          title="Copier"
                        >
                          <FiCopy />
                        </button>
                      </div>
                    </div>
                    
                    <div className="credential-row">
                      <span className="credential-label">Mot de passe:</span>
                      <div className="credential-value-container">
                        <code className="credential-code">{ticket.password}</code>
                        <button
                          className="btn-copy"
                          onClick={() => copyToClipboard(ticket.password)}
                          title="Copier"
                        >
                          <FiCopy />
                        </button>
                      </div>
                    </div>
                  </div>

                  <button 
                    className="btn-download-ticket"
                    onClick={() => downloadTicketPDF(ticket, index)}
                  >
                     Télécharger ce ticket
                  </button>
                </div>
              ))}
            </div>

            <div className="tickets-notice">
              <div className="notice-box warning">
                <strong> Important</strong>
                <p>Conservez précieusement vos identifiants. Chaque ticket ne peut être utilisé qu'une seule fois.</p>
              </div>
              
              <div className="notice-box info">
                <strong> Email envoyé</strong>
                <p>Les identifiants de vos tickets ont également été envoyés à votre adresse email pour plus de sécurité.</p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Details */}
        <div className="success-details">
          <h3>Détails de la transaction</h3>
          <div className="detail-row">
            <span className="detail-label">Référence Transaction</span>
            <span className="detail-value">{paymentData?.paymentInfo.reference || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Montant payé</span>
            <span className="detail-value">
              {paymentData?.paymentInfo ? formatPrice(paymentData.paymentInfo.amount, paymentData.paymentInfo.currency) : 'N/A'}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Statut</span>
            <span className="detail-value" style={{ color: 'var(--color-success)' }}>Complété <FiCheck /></span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Date</span>
            <span className="detail-value">
              {new Date().toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
