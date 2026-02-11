import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import '../styles/payment.css';
import '../styles/payment-failed.css';

export const PaymentFailedPage: React.FC = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine if we're in a group context or direct route
  const isDirectRoute = !groupId;

  const handleTryAgain = () => {
    window.history.back();
  };

  const handleBackToPayment = () => {
    if (groupId) {
      navigate(`/pay/g/${groupId}`);
    } else {
      navigate('/');
    }
  };

  // Get error message from navigation state if available
  const errorMessage = location.state?.errorMessage;

  return (
    <div className="payment-failed">
      <div className="failed-container">
        <div className="failed-icon" />
        <h1 className="failed-title">Payment Failed</h1>
        <p className="failed-message">
          {errorMessage || 'Unfortunately, your payment could not be processed. Please try again or use a different payment method.'}
        </p>



        <div className="">
          <button
            className="btn-primary"
            onClick={handleTryAgain}
          >
            Try Again
          </button>
        </div>

        <div className="support-contact">
          <div className="support-title">Need Help?</div>
          <p className="support-text">
            If you continue to experience issues, our support team is here to help.
          </p>
          <a href="mailto:support@example.com" className="support-link">
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailedPage;
