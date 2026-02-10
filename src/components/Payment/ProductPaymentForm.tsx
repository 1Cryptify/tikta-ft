import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { colors, spacing } from '../../config/theme';
import  LoadingSpinner  from '../LoadingSpinner';

const Container = styled.div`
  padding: ${spacing.lg};
  max-width: 600px;
  margin: 0 auto;
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

const Card = styled.div`
  background: white;
  border: 1px solid ${colors.border};
  border-radius: 8px;
  padding: ${spacing.lg};
`;

const SummarySection = styled.div`
  background: #f9f9f9;
  padding: ${spacing.md};
  border-radius: 4px;
  margin-bottom: ${spacing.lg};
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${spacing.sm};
  color: ${colors.textPrimary};

  &:last-child {
    margin-bottom: 0;
    font-weight: bold;
    font-size: 1.1rem;
    border-top: 1px solid ${colors.border};
    padding-top: ${spacing.sm};
  }
`;

const FormGroup = styled.div`
  margin-bottom: ${spacing.lg};

  label {
    display: block;
    font-weight: 600;
    color: ${colors.textPrimary};
    margin-bottom: ${spacing.sm};
  }

  select,
  input {
    width: 100%;
    padding: ${spacing.md};
    border: 1px solid ${colors.border};
    border-radius: 4px;
    font-size: 0.9rem;

    &:focus {
      outline: none;
      border-color: ${colors.primary};
      box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${spacing.md};
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: ${spacing.md};
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

const PaymentMethods = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${spacing.md};
  margin-bottom: ${spacing.lg};
`;

const MethodButton = styled.button<{ isSelected: boolean }>`
  padding: ${spacing.md};
  border: 2px solid
    ${(props) => (props.isSelected ? colors.primary : colors.border)};
  background-color: ${(props) =>
    props.isSelected ? `${colors.primary}20` : 'white'};
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  color: ${colors.textPrimary};
  transition: all 0.3s ease;

  &:hover {
    border-color: ${colors.primary};
  }
`;

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
}

interface ProductPaymentFormProps {
  productId: string;
  onPaymentInitiated?: (data: any) => void;
  onCancel?: () => void;
}

export const ProductPaymentForm: React.FC<ProductPaymentFormProps> = ({
  productId,
  onPaymentInitiated,
  onCancel,
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/payments/products/${productId}/`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to load product');
        }

        const data = await response.json();
        setProduct(data.data || data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !phone) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const payload = {
        product_id: productId,
        email,
        phone,
        payment_method: selectedMethod,
        amount: product?.price,
        currency: product?.currency,
      };

      // Use product payment endpoint
      const response = await fetch(
        `${API_BASE}/payments/product-payment/initiate/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to initiate payment');
      }

      const data = await response.json();

      // Store payment info for later verification
      sessionStorage.setItem(
        'paymentInfo',
        JSON.stringify({
          reference: data.reference,
          gatewayReference: data.gateway_reference,
          productId,
        })
      );

      if (onPaymentInitiated) {
        onPaymentInitiated(data);
      }

      // Redirect if payment_url is available
      if (data.payment_url) {
        window.location.href = data.payment_url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate payment');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error && !product) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <Container>
      <Title>Complete Your Purchase</Title>
      <Description>Product Details & Payment Information</Description>

      <Card>
        <SummarySection>
          <SummaryRow>
            <span>{product.name}</span>
            <span>
              {product.price} {product.currency}
            </span>
          </SummaryRow>
          <SummaryRow>
            <span>Total Amount:</span>
            <span>
              {product.price} {product.currency}
            </span>
          </SummaryRow>
        </SummarySection>

        {error && (
          <div style={{ color: 'red', marginBottom: spacing.lg }}>
            {error}
          </div>
        )}

        <form onSubmit={handleInitiatePayment}>
          <FormGroup>
            <label>Payment Method</label>
            <PaymentMethods>
              <MethodButton
                type="button"
                isSelected={selectedMethod === 'card'}
                onClick={() => setSelectedMethod('card')}
              >
                💳 Card
              </MethodButton>
              <MethodButton
                type="button"
                isSelected={selectedMethod === 'mobile_money'}
                onClick={() => setSelectedMethod('mobile_money')}
              >
                📱 Mobile Money
              </MethodButton>
              <MethodButton
                type="button"
                isSelected={selectedMethod === 'bank_transfer'}
                onClick={() => setSelectedMethod('bank_transfer')}
              >
                🏦 Bank Transfer
              </MethodButton>
            </PaymentMethods>
          </FormGroup>

          <FormGroup>
            <label htmlFor="email">Email Address *</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={processing}
            />
          </FormGroup>

          <FormGroup>
            <label htmlFor="phone">Phone Number *</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1234567890"
              required
              disabled={processing}
            />
          </FormGroup>

          <ButtonGroup>
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={processing}
            >
              {processing ? 'Processing...' : 'Proceed to Payment'}
            </Button>
          </ButtonGroup>
        </form>
      </Card>
    </Container>
  );
};
