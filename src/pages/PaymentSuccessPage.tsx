import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/payment.css';
import '../styles/payment-success.css';

interface PaymentInfo {
  paymentId: string;
  transactionId: string;
  reference: string;
  gatewayReference: string;
  amount: string;
  currency: string;
}

export const PaymentSuccessPage: React.FC = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Retrieve payment info from localStorage
    const storedPayment = localStorage.getItem('pendingPayment');
    if (storedPayment) {
      try {
        const parsed = JSON.parse(storedPayment);
        setPaymentInfo(parsed);
        // Clear the pending payment from localStorage
        localStorage.removeItem('pendingPayment');
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

  if (loading) {
    return (
      <div className="payment-success">
        <div className="success-container">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="payment-success">
      <div className="success-container">
        <div className="success-icon" />
        <h1 className="success-title">Payment Successful</h1>
        <p className="success-message">
          Thank you! Your payment has been processed successfully. A confirmation
          email has been sent to your inbox.
        </p>

        <div className="success-details">
          <div className="detail-row">
            <span className="detail-label">Transaction ID</span>
            <span className="detail-value">{paymentInfo?.reference || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Amount Paid</span>
            <span className="detail-value">
              {paymentInfo ? formatPrice(paymentInfo.amount, paymentInfo.currency) : 'N/A'}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Payment Status</span>
            <span className="detail-value" style={{ color: 'var(--color-success)' }}>Completed</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Date</span>
            <span className="detail-value">
              {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="success-guarantee">
          <div className="guarantee-icon">Shield</div>
          <p className="guarantee-text">
            <strong>30-Day Money-Back Guarantee</strong>
            <br />
            If you are not completely satisfied, we offer a full refund within 30 days.
          </p>
        </div>

        <div className="success-actions">
          <button
            className="btn-primary"
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </button>
          <button
            className="btn-secondary"
            onClick={() => groupId ? navigate(`/pay/${groupId}`) : navigate('/')}
          >
            Continue Shopping
          </button>
        </div>

        <p className="email-notice">
          A confirmation email with your order details has been sent to your inbox.
          Please check your email and spam folder if you don't see it.
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
