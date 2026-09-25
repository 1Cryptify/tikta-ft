import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FiX } from 'react-icons/fi';
import '../styles/payment.css';
import '../styles/payment-failed.css';

export const PaymentFailedPage: React.FC = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const errorMessage: string | undefined = location.state?.errorMessage;
  const returnTo: string | undefined = location.state?.returnTo;

  const handleTryAgain = () => {
    if (returnTo) {
      navigate(returnTo);
    } else if (groupId) {
      navigate(`/pay/g/${groupId}`);
    } else {
      navigate('/');
    }
  };

  const handleBackToPayment = () => {
    if (groupId) {
      navigate(`/pay/g/${groupId}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="payment-failed">
      <div className="failed-container">
        <div className="failed-icon"><FiX aria-hidden="true" /></div>
        <h1 className="failed-title">Paiement échoué</h1>
        <p className="failed-message">
          {errorMessage ||
            "Votre paiement n'a pas pu être traité. Aucun montant ne vous a été débité tant que la confirmation n'est pas reçue."}
        </p>

        <div className="failure-reasons">
          <div className="failure-reasons-title">Causes possibles</div>
          <ul>
            <li>Le paiement a été annulé ou refusé sur le téléphone.</li>
            <li>Solde Mobile Money insuffisant.</li>
            <li>Le code PIN saisi est incorrect ou la demande a expiré.</li>
            <li>Numéro de téléphone ou opérateur incorrect.</li>
          </ul>
        </div>

        <div className="recovery-guide">
          <div className="recovery-title">Comment réessayer</div>
          <div className="recovery-steps">
            <div className="recovery-step">
              <span className="step-number">1</span>
              <div className="step-content">
                <div className="step-title">Vérifiez votre numéro</div>
                <p className="step-desc">Assurez-vous que le numéro et l'opérateur (MTN / Orange) correspondent à votre Mobile Money.</p>
              </div>
            </div>
            <div className="recovery-step">
              <span className="step-number">2</span>
              <div className="step-content">
                <div className="step-title">Vérifiez votre solde</div>
                <p className="step-desc">Le compte Mobile Money doit disposer du montant total à régler.</p>
              </div>
            </div>
            <div className="recovery-step">
              <span className="step-number">3</span>
              <div className="step-content">
                <div className="step-title">Relancez le paiement</div>
                <p className="step-desc">Appuyez sur « Réessayer » et validez la demande avec votre code PIN dès sa réception.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="failed-actions">
          <button className="btn-primary" onClick={handleTryAgain}>
            Réessayer le paiement
          </button>
          <button className="btn-secondary" onClick={handleBackToPayment}>
            Retour aux offres
          </button>
        </div>

        <div className="support-contact">
          <div className="support-title">Besoin d'aide ?</div>
          <p className="support-text">
            Si le problème persiste, contactez notre équipe de support en précisant la référence
            de votre transaction.
          </p>
          <a href="mailto:contact@tikta.xyz" className="support-link">
            Contacter le support
          </a>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailedPage;
