import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiMail, FiRefreshCw, FiX } from 'react-icons/fi';
import '../styles/payment.css';
import '../styles/order-flow.css';

export const PaymentFailedPage: React.FC = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const errorMessage: string | undefined = location.state?.errorMessage;
  const returnTo: string | undefined = location.state?.returnTo;

  const handleTryAgain = () => {
    if (returnTo) navigate(returnTo);
    else if (groupId) navigate(`/pay/g/${groupId}`);
    else navigate('/');
  };

  const handleBackToPayment = () => {
    if (groupId) navigate(`/pay/g/${groupId}`);
    else navigate('/');
  };

  return (
    <div className="of-center">
      <div className="of-card of-card--center">
        <div className="of-status-icon of-status-icon--error">
          <FiX aria-hidden="true" />
        </div>
        <h1 className="of-title">Paiement échoué</h1>
        <p className="of-subtitle">
          {errorMessage ||
            "Votre paiement n'a pas pu être traité. Aucun montant ne vous sera débité tant que la confirmation n'est pas reçue."}
        </p>

        <div className="of-reasons">
          <p className="of-reasons__title">Causes possibles</p>
          <ul>
            <li>Le paiement a été annulé ou refusé sur le téléphone.</li>
            <li>Solde Mobile Money insuffisant.</li>
            <li>Code PIN incorrect ou demande expirée.</li>
            <li>Numéro de téléphone ou opérateur incorrect.</li>
          </ul>
        </div>

        <div className="of-actions">
          <button type="button" className="of-btn of-btn--primary of-btn--block" onClick={handleTryAgain}>
            <FiRefreshCw aria-hidden="true" />
            Réessayer le paiement
          </button>
          <button type="button" className="of-btn of-btn--outline of-btn--block" onClick={handleBackToPayment}>
            <FiArrowLeft aria-hidden="true" />
            Retour aux offres
          </button>
        </div>

        <div className="of-notice of-notice--info">
          <FiMail aria-hidden="true" />
          <span>
            Besoin d'aide ? Écrivez-nous à{' '}
            <a href="mailto:contact@tikta.xyz" className="of-link" style={{ display: 'inline' }}>
              contact@tikta.xyz
            </a>{' '}
            en précisant la référence de la transaction.
          </span>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailedPage;
