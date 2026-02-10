import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { colors, spacing } from '../../config/theme';
import { LoadingSpinner } from '../LoadingSpinner';

const Container = styled.div`
  padding: ${spacing.xl};
  max-width: 600px;
  margin: 0 auto;
`;

const Card = styled.div`
  background: white;
  border: 1px solid ${colors.border};
  border-radius: 8px;
  padding: ${spacing.lg};
  text-align: center;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  color: ${colors.textPrimary};
  margin-bottom: ${spacing.lg};
`;

const Description = styled.p`
  color: ${colors.textSecondary};
  margin-bottom: ${spacing.lg};
`;

const StatusIcon = styled.div`
  font-size: 3rem;
  margin-bottom: ${spacing.lg};
`;

const StatusMessage = styled.p<{ type: 'success' | 'error' | 'pending' }>`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: ${spacing.lg};
  color: ${(props) => {
    switch (props.type) {
      case 'success':
        return '#4caf50';
      case 'error':
        return '#f44336';
      case 'pending':
        return '#ff9800';
      default:
        return colors.textPrimary;
    }
  }};
`;

const PaymentDetails = styled.div`
  background: #f9f9f9;
  padding: ${spacing.md};
  border-radius: 4px;
  text-align: left;
  margin-bottom: ${spacing.lg};
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${spacing.sm} 0;
  border-bottom: 1px solid ${colors.border};
  color: ${colors.textPrimary};

  &:last-child {
    border-bottom: none;
  }

  strong {
    font-weight: 600;
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: ${spacing.md} ${spacing.lg};
  margin-top: ${spacing.md};
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: ${(props) =>
    props.variant === 'secondary' ? colors.border : colors.primary};
  color: ${(props) =>
    props.variant === 'secondary' ? colors.textPrimary : 'white'};

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

interface PaymentInfo {
  reference: string;
  gatewayReference: string;
  status?: string;
  amount?: string;
  currency?: string;
}

interface PaymentVerificationProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  autoVerify?: boolean;
}

export const PaymentVerification: React.FC<PaymentVerificationProps> = ({
  onSuccess,
  onError,
  autoVerify = true,
}) => {
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState('');

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  useEffect(() => {
    const info = sessionStorage.getItem('paymentInfo');
    if (info) {
      setPaymentInfo(JSON.parse(info));
      setLoading(false);

      if (autoVerify) {
        verifyPayment(JSON.parse(info));
      }
    } else {
      setMessage('No payment information found');
      setStatus('error');
      setLoading(false);
    }
  }, [autoVerify]);

  const verifyPayment = async (info: PaymentInfo) => {
    try {
      setVerifying(true);
      setMessage('Verifying payment...');

      const response = await fetch(
        `${API_BASE}/payments/offers-payment/verify/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            reference: info.reference,
            gateway_reference: info.gatewayReference,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setStatus('success');
        setMessage('Payment verified successfully!');
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setStatus('error');
        setMessage(data.message || 'Payment verification failed');
        if (onError) {
          onError(data.message || 'Payment verification failed');
        }
      }
    } catch (err) {
      setStatus('error');
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to verify payment';
      setMessage(errorMsg);
      if (onError) {
        onError(errorMsg);
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleRetryVerification = () => {
    if (paymentInfo) {
      verifyPayment(paymentInfo);
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner />
      </Container>
    );
  }

  return (
    <Container>
      <Card>
        <Title>Payment Verification</Title>
        <Description>Checking your payment status...</Description>

        <StatusIcon>
          {status === 'success' && '✓'}
          {status === 'error' && '✗'}
          {status === 'pending' && '⏳'}
        </StatusIcon>

        <StatusMessage type={status}>{message}</StatusMessage>

        {paymentInfo && (
          <PaymentDetails>
            <DetailRow>
              <strong>Reference:</strong>
              <span>{paymentInfo.reference}</span>
            </DetailRow>
            <DetailRow>
              <strong>Gateway Ref:</strong>
              <span>{paymentInfo.gatewayReference}</span>
            </DetailRow>
            {paymentInfo.amount && paymentInfo.currency && (
              <DetailRow>
                <strong>Amount:</strong>
                <span>
                  {paymentInfo.amount} {paymentInfo.currency}
                </span>
              </DetailRow>
            )}
          </PaymentDetails>
        )}

        {status === 'pending' && (
          <Button onClick={handleRetryVerification} disabled={verifying}>
            {verifying ? 'Verifying...' : 'Verify Payment'}
          </Button>
        )}

        {status === 'error' && (
          <>
            <Button onClick={handleRetryVerification} disabled={verifying}>
              {verifying ? 'Retrying...' : 'Retry Verification'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => (window.location.href = '/dashboard/payments')}
            >
              Back to Dashboard
            </Button>
          </>
        )}

        {status === 'success' && (
          <Button onClick={() => (window.location.href = '/dashboard/payments')}>
            View Payments
          </Button>
        )}
      </Card>
    </Container>
  );
};
