import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { colors, spacing } from '../config/theme';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  animation: bounce 1s ease-in-out;

  @keyframes bounce {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  color: ${colors.textPrimary};
  margin-bottom: ${spacing.md};
`;

const Message = styled.p`
  color: ${colors.textSecondary};
  font-size: 1rem;
  margin-bottom: ${spacing.lg};
  line-height: 1.6;
`;

const Button = styled.button`
  background-color: ${colors.primary};
  color: white;
  border: none;
  padding: ${spacing.md} ${spacing.xl};
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }
`;

const Countdown = styled.p`
  color: ${colors.textSecondary};
  font-size: 0.875rem;
  margin-top: ${spacing.lg};
`;

export const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = React.useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      navigate('/dashboard/payments');
    }
  }, [countdown, navigate]);

  return (
    <Container>
      <Card>
        <Icon>✓</Icon>
        <Title>Payment Successful!</Title>
        <Message>
          Your payment has been processed successfully. Your payment details
          have been recorded and you can view them in your dashboard.
        </Message>
        <Button onClick={() => navigate('/dashboard/payments')}>
          Go to Payments
        </Button>
        <Countdown>
          Redirecting in {countdown} seconds...
        </Countdown>
      </Card>
    </Container>
  );
};
