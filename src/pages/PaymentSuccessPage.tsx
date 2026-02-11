import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
}

export const PaymentSuccessPage: React.FC = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState<StoredPaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    // Retrieve payment info from localStorage
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
  }, []);

  const formatPrice = (amount: string, currency: string): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency || 'XAF',
    }).format(parseFloat(amount) || 0);
  };

  const handleContinueShopping = () => {
    if (groupId) {
      navigate(`/pay/${groupId}`);
    } else {
      navigate('/');
    }
  };

  const downloadTicketPDF = (ticket: TicketInfo, index: number) => {
    // Create PDF content
    const content = `
TICKET - ${ticket.offer_name}
=============================

Identifiant Ticket: ${ticket.ticket_id}
Mot de passe: ${ticket.password}

Validité:
Du: ${ticket.valid_from}
Au: ${ticket.valid_until}

Transaction: ${paymentData?.paymentInfo.reference || 'N/A'}
Date d'achat: ${new Date().toLocaleDateString('fr-FR')}

=============================
Conservez ces informations précieusement.
Chaque ticket ne peut être utilisé qu'une seule fois.
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ticket-${ticket.ticket_id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const downloadAllTickets = () => {
    if (!paymentData?.tickets || paymentData.tickets.length === 0) return;

    // Create PDF content for all tickets
    let content = `VOS TICKETS - ${paymentData.offerName || 'Achat'}\n`;
    content += `=============================\n\n`;
    content += `Transaction: ${paymentData.paymentInfo.reference}\n`;
    content += `Date: ${new Date().toLocaleDateString('fr-FR')}\n`;
    content += `Montant: ${formatPrice(paymentData.paymentInfo.amount, paymentData.paymentInfo.currency)}\n\n`;
    content += `=============================\n\n`;

    paymentData.tickets.forEach((ticket, index) => {
      content += `TICKET ${index + 1} - ${ticket.offer_name}\n`;
      content += `-----------------------------\n`;
      content += `Identifiant: ${ticket.ticket_id}\n`;
      content += `Mot de passe: ${ticket.password}\n`;
      content += `Validité: ${ticket.valid_from} au ${ticket.valid_until}\n\n`;
    });

    content += `=============================\n`;
    content += `Conservez ces informations précieusement.\n`;
    content += `Chaque ticket ne peut être utilisé qu'une seule fois.\n`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tickets-${paymentData.paymentInfo.reference}.txt`;
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

  return (
    <div className="payment-success">
      <div className="success-container">
        <div className="success-icon" />
        <h1 className="success-title">Paiement Réussi !</h1>
        <p className="success-message">
          Merci ! Votre paiement a été traité avec succès. 
          {hasTickets && ' Vos tickets sont disponibles ci-dessous.'}
          {!hasTickets && ' Un email de confirmation vous sera envoyé.'}
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
                          📋
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
                          📋
                        </button>
                      </div>
                    </div>

                    <div className="validity-dates">
                      <p><strong> Validité:</strong></p>
                      <p>Du {ticket.valid_from} au {ticket.valid_until}</p>
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
            <span className="detail-value" style={{ color: 'var(--color-success)' }}>Complété ✓</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Date</span>
            <span className="detail-value">
              {new Date().toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>

        <div className="success-actions">
          <button
            className="btn-primary"
            onClick={() => navigate('/dashboard')}
          >
            Tableau de bord
          </button>
          <button
            className="btn-secondary"
            onClick={handleContinueShopping}
          >
            {groupId ? 'Continuer les achats' : 'Retour à l\'accueil'}
          </button>
        </div>

        <p className="email-notice">
          Une confirmation a été envoyée à votre adresse email.
          Vérifiez votre dossier spam si vous ne la voyez pas.
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
