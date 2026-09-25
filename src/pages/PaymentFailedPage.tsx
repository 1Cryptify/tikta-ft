import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiLogOut, FiMail, FiRefreshCw, FiX } from 'react-icons/fi';
import { closePaymentTab } from '../utils/closeTab';
import '../styles/payment.css';
import '../styles/order-flow.css';

const offersPathFromStorage = (): string | null => {
  try {
    const raw = localStorage.getItem('pendingPayment');
    if (!raw) return null;
    const stored = JSON.parse(raw);
    return stored?.groupId ? `/pay/g/${stored.groupId}` : null;
  } catch {
    return null;
  }
};

export const PaymentFailedPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const errorMessage: string | undefined = location.state?.errorMessage;
  const returnTo: string | undefined = location.state?.returnTo;
  const offersPath: string | undefined = location.state?.offersPath;

  // Page des offres d'origine : état de navigation, sinon déduite du stockage.
  const resolvedOffersPath = useMemo(
    () => offersPath || offersPathFromStorage(),
    [offersPath]
  );

  const handleTryAgain = () => {
    if (returnTo) navigate(returnTo);
    else if (resolvedOffersPath) navigate(resolvedOffersPath);
    else closePaymentTab();
  };

  const handleBackToOffers = () => {
    if (resolvedOffersPath) navigate(resolvedOffersPath);
    else if (returnTo) navigate(returnTo);
    else closePaymentTab();
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
          <button type="button" className="of-btn of-btn--outline of-btn--block" onClick={handleBackToOffers}>
            <FiArrowLeft aria-hidden="true" />
            Retour aux offres
          </button>
          <button type="button" className="of-link" style={{ alignSelf: 'center' }} onClick={closePaymentTab}>
            <FiLogOut aria-hidden="true" /> Sortir
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
