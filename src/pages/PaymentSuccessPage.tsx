import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_PAYMENT_DETAILS, formatPrice } from '../mocks/paymentData';
import '../styles/payment.css';
import '../styles/payment-success.css';

export const PaymentSuccessPage: React.FC = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const details = MOCK_PAYMENT_DETAILS.completed;

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
            <span className="detail-value">{details.transactionId}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Amount Paid</span>
            <span className="detail-value">{formatPrice(details.total)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Payment Method</span>
            <span className="detail-value">{details.paymentMethod}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Date</span>
            <span className="detail-value">
              {details.date.toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="success-guarantee">
          <div className="guarantee-icon">🛡️</div>
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
          📧 A confirmation email with your order details has been sent to your inbox.
          Please check your email and spam folder if you don't see it.
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
