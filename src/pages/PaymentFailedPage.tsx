import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { colors, spacing } from '../config/theme';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  padding: ${spacing.lg};
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: ${spacing.xxl};
  text-align: center;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const Icon = styled.div`
  font-size: 4rem;
  margin-bottom: ${spacing.lg};
  animation: shake 0.5s ease-in-out;

  @keyframes shake {
    0%,
    100% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-10px);
    }
    75% {
      transform: translateX(10px);
    }
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #d32f2f;
  margin-bottom: ${spacing.md};
`;

const Message = styled.p`
  color: ${colors.textSecondary};
  font-size: 1rem;
  margin-bottom: ${spacing.lg};
  line-height: 1.6;
`;

const ErrorDetails = styled.div`
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 6px;
  padding: ${spacing.md};
  margin-bottom: ${spacing.lg};
  text-align: left;
  color: #856404;
  font-size: 0.875rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${spacing.md};
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: ${spacing.md} ${spacing.lg};
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  background-color: ${(props) =>
    props.variant === 'secondary' ? colors.border : colors.primary};
  color: ${(props) =>
    props.variant === 'secondary' ? colors.textPrimary : 'white'};

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }
`;

interface PaymentFailedPageProps {
  errorMessage?: string;
  transactionRef?: string;
}

export const PaymentFailedPage: React.FC<PaymentFailedPageProps> = ({
  errorMessage = 'Your payment could not be processed',
  transactionRef,
}) => {
  const navigate = useNavigate();

  return (
    <Container>
      <Card>
        <Icon>✗</Icon>
        <Title>Payment Failed</Title>
        <Message>{errorMessage}</Message>

        {transactionRef && (
          <ErrorDetails>
            <strong>Transaction Reference:</strong> {transactionRef}
            <br />
            Please save this for your records or contact support.
          </ErrorDetails>
        )}

        <ButtonGroup>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Try Again
          </Button>
          <Button onClick={() => navigate('/dashboard/payments')}>
            View Payments
          </Button>
        </ButtonGroup>
      </Card>
    </Container>
  );
};
