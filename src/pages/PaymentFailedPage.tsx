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
      navigate(`/pay/${groupId}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="payment-failed">
      <div className="failed-container">
        <div className="failed-icon" />
        <h1 className="failed-title">Payment Failed</h1>
        <p className="failed-message">
          Unfortunately, your payment could not be processed. Please try again or
          use a different payment method.
        </p>

        <div className="failure-reasons">
          <div className="failure-reasons-title">Common reasons:</div>
          <ul>
            <li>Insufficient funds in your account</li>
            <li>Incorrect card or payment details</li>
            <li>Card blocked by your bank for security reasons</li>
            <li>Network connectivity issues</li>
          </ul>
        </div>

        <div className="recovery-guide">
          <div className="recovery-title">What you can do:</div>
          <div className="recovery-steps">
            <div className="recovery-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <div className="step-title">Verify your payment details</div>
                <p className="step-desc">
                  Check that your card number, expiration date, and CVV are correct.
                </p>
              </div>
            </div>
            <div className="recovery-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <div className="step-title">Try a different payment method</div>
                <p className="step-desc">
                  Use PayPal, bank transfer, or another credit card.
                </p>
              </div>
            </div>
            <div className="recovery-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <div className="step-title">Contact your bank</div>
                <p className="step-desc">
                  Your bank may have blocked the transaction for security reasons.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="failed-actions">
          <button
            className="btn-primary"
            onClick={handleTryAgain}
          >
            Try Again
          </button>
          <button
            className="btn-secondary"
            onClick={handleBackToPayment}
          >
            {groupId ? 'Back to Payment Options' : 'Back to Home'}
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
