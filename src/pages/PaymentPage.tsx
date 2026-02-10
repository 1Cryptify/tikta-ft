import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { colors, spacing } from '../config/theme';
import { LoadingSpinner } from '../components/LoadingSpinner';

const PageContainer = styled.div`
  padding: ${spacing.xl};
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

const PageHeader = styled.div`
  margin-bottom: ${spacing.xxl};

  h1 {
    font-size: 2rem;
    color: ${colors.textPrimary};
    margin-bottom: ${spacing.sm};
  }

  p {
    color: ${colors.textSecondary};
    font-size: 0.875rem;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${spacing.lg};
  margin-top: ${spacing.lg};
`;

const Card = styled.div`
  background: ${colors.background};
  border: 1px solid ${colors.border};
  border-radius: 8px;
  padding: ${spacing.lg};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${colors.primary};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  color: ${colors.textPrimary};
  margin-bottom: ${spacing.md};
`;

const CardDescription = styled.p`
  color: ${colors.textSecondary};
  font-size: 0.875rem;
  margin-bottom: ${spacing.md};
`;

const CardPrice = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${colors.primary};
  margin-bottom: ${spacing.md};
`;

const PrimaryButton = styled.button`
  background-color: ${colors.primary};
  color: white;
  border: none;
  padding: ${spacing.sm} ${spacing.md};
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    background-color: ${colors.primaryDark || colors.primary};
  }

  &:disabled {
    background-color: ${colors.disabled || '#ccc'};
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background-color: #fee;
  color: #c33;
  padding: ${spacing.md};
  border-radius: 4px;
  margin-bottom: ${spacing.lg};
`;

const SuccessMessage = styled.div`
  background-color: #efe;
  color: #3c3;
  padding: ${spacing.md};
  border-radius: 4px;
  margin-bottom: ${spacing.lg};
`;

interface OfferData {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
}

interface ProductData {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
}

interface OfferGroupData {
  id: string;
  name: string;
  description: string;
  offers: OfferData[];
}

type PaymentMode = 'group' | 'offer' | 'product' | 'checkout';

export const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams<{ 
    groupId?: string; 
    offerId?: string; 
    productId?: string;
  }>();

  const [mode, setMode] = useState<PaymentMode>('group');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [offerGroup, setOfferGroup] = useState<OfferGroupData | null>(null);
  const [offer, setOffer] = useState<OfferData | null>(null);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  // Determine mode and load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (params.groupId) {
          // Load offer group
          setMode('group');
          const response = await fetch(
            `${API_BASE}/payments/offer-groups/${params.groupId}/`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error('Failed to load offer group');
          }

          const data = await response.json();
          setOfferGroup(data.data || data);
        } else if (params.offerId) {
          // Load single offer
          setMode('offer');
          const response = await fetch(
            `${API_BASE}/payments/offers/${params.offerId}/`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error('Failed to load offer');
          }

          const data = await response.json();
          setOffer(data.data || data);
        } else if (params.productId) {
          // Load single product
          setMode('product');
          const response = await fetch(
            `${API_BASE}/payments/products/${params.productId}/`,
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
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params.groupId, params.offerId, params.productId]);

  const handleSelectOffer = (offerId: string) => {
    navigate(`/pay/offer/${offerId}`);
  };

  const handleInitiatePayment = async (itemId: string, itemType: 'offer' | 'product') => {
    try {
      setLoading(true);
      setError(null);

      const payload = {
        [`${itemType}_id`]: itemId,
        amount: itemType === 'offer' ? offer?.price : product?.price,
        currency: itemType === 'offer' ? offer?.currency : product?.currency,
        payment_method: selectedPaymentMethod,
      };

      const response = await fetch(
        `${API_BASE}/payments/offers-payment/initiate/`,
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
      setSuccess('Payment initiated successfully');
      setMode('checkout');
      
      // Store payment info for verification
      sessionStorage.setItem(
        'paymentInfo',
        JSON.stringify({
          reference: data.reference,
          gatewayReference: data.gateway_reference,
          amount: data.amount,
          currency: data.currency,
        })
      );

      // Redirect to payment gateway or next step
      if (data.payment_url) {
        window.location.href = data.payment_url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async () => {
    try {
      setLoading(true);
      setError(null);

      const paymentInfo = JSON.parse(
        sessionStorage.getItem('paymentInfo') || '{}'
      );

      const response = await fetch(
        `${API_BASE}/payments/offers-payment/verify/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            reference: paymentInfo.reference,
            gateway_reference: paymentInfo.gatewayReference,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to verify payment');
      }

      const data = await response.json();
      setSuccess('Payment verified successfully!');
      
      // Clear session storage
      sessionStorage.removeItem('paymentInfo');

      // Redirect to success page or dashboard after a delay
      setTimeout(() => {
        navigate('/dashboard/payments');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify payment');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingSpinner />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}

      {mode === 'group' && offerGroup && (
        <>
          <PageHeader>
            <h1>{offerGroup.name}</h1>
            <p>{offerGroup.description}</p>
          </PageHeader>

          <Grid>
            {offerGroup.offers?.map((item) => (
              <Card key={item.id} onClick={() => handleSelectOffer(item.id)}>
                <CardTitle>{item.name}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
                <CardPrice>
                  {item.price} {item.currency}
                </CardPrice>
                <PrimaryButton>Select Offer</PrimaryButton>
              </Card>
            ))}
          </Grid>
        </>
      )}

      {mode === 'offer' && offer && (
        <>
          <PageHeader>
            <h1>{offer.name}</h1>
            <p>{offer.description}</p>
          </PageHeader>

          <Card style={{ maxWidth: '500px', margin: '0 auto' }}>
            <CardTitle>{offer.name}</CardTitle>
            <CardDescription>{offer.description}</CardDescription>
            <CardPrice>
              {offer.price} {offer.currency}
            </CardPrice>

            <PaymentMethodSelector>
              <label>
                Select Payment Method:
                <select
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                >
                  <option value="">-- Select --</option>
                  <option value="card">Credit Card</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </label>
            </PaymentMethodSelector>

            <PrimaryButton
              onClick={() => handleInitiatePayment(offer.id, 'offer')}
              disabled={!selectedPaymentMethod}
            >
              Proceed to Payment
            </PrimaryButton>
          </Card>
        </>
      )}

      {mode === 'product' && product && (
        <>
          <PageHeader>
            <h1>{product.name}</h1>
            <p>{product.description}</p>
          </PageHeader>

          <Card style={{ maxWidth: '500px', margin: '0 auto' }}>
            <CardTitle>{product.name}</CardTitle>
            <CardDescription>{product.description}</CardDescription>
            <CardPrice>
              {product.price} {product.currency}
            </CardPrice>

            <PaymentMethodSelector>
              <label>
                Select Payment Method:
                <select
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                >
                  <option value="">-- Select --</option>
                  <option value="card">Credit Card</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </label>
            </PaymentMethodSelector>

            <PrimaryButton
              onClick={() => handleInitiatePayment(product.id, 'product')}
              disabled={!selectedPaymentMethod}
            >
              Proceed to Payment
            </PrimaryButton>
          </Card>
        </>
      )}

      {mode === 'checkout' && (
        <>
          <PageHeader>
            <h1>Payment Confirmation</h1>
            <p>Verify your payment status</p>
          </PageHeader>

          <Card style={{ maxWidth: '500px', margin: '0 auto' }}>
            <CardTitle>Payment in Progress</CardTitle>
            <CardDescription>
              Please wait while we process your payment. Click the button below to
              verify the payment status.
            </CardDescription>

            <PrimaryButton onClick={handleVerifyPayment}>
              Verify Payment
            </PrimaryButton>
          </Card>
        </>
      )}
    </PageContainer>
  );
};

const PaymentMethodSelector = styled.div`
  margin: ${spacing.lg} 0;

  label {
    display: flex;
    flex-direction: column;
    gap: ${spacing.sm};
    font-weight: 600;
    color: ${colors.textPrimary};
  }

  select {
    padding: ${spacing.sm};
    border: 1px solid ${colors.border};
    border-radius: 4px;
    font-size: 0.9rem;
    cursor: pointer;

    &:focus {
      outline: none;
      border-color: ${colors.primary};
      box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
    }
  }
`;
