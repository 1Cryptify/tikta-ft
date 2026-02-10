import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { colors, spacing } from '../config/theme';
import { OfferGroupPayment } from '../components/Payment/OfferGroupPayment';
import { OfferPaymentForm } from '../components/Payment/OfferPaymentForm';
import { ProductPaymentForm } from '../components/Payment/ProductPaymentForm';
import { PaymentVerification } from '../components/Payment/PaymentVerification';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: ${spacing.xl} ${spacing.lg};
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Breadcrumb = styled.div`
  color: white;
  margin-bottom: ${spacing.lg};
  font-size: 0.9rem;

  a {
    color: white;
    text-decoration: none;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }

  span {
    margin: 0 ${spacing.sm};
  }
`;

type PaymentStep = 'group' | 'offer' | 'product' | 'form' | 'verify';

interface PaymentPageProps {
  groupId?: string;
  offerId?: string;
  productId?: string;
}

export const PaymentCheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams<{
    groupId?: string;
    offerId?: string;
    productId?: string;
  }>();

  const [currentStep, setCurrentStep] = useState<PaymentStep>(
    params.groupId ? 'group' : params.offerId ? 'form' : params.productId ? 'form' : 'group'
  );

  const handleSelectOffer = (offerId: string) => {
    navigate(`/pay/offer/${offerId}`);
    setCurrentStep('form');
  };

  const handlePaymentInitiated = (data: any) => {
    setCurrentStep('verify');
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const getBreadcrumbPath = () => {
    const items = ['Payment'];

    if (params.groupId) {
      items.push('Offer Group');
    }

    if (params.offerId) {
      items.push('Offer Payment');
    }

    if (params.productId) {
      items.push('Product Payment');
    }

    if (currentStep === 'verify') {
      items.push('Verification');
    }

    return items;
  };

  return (
    <PageContainer>
      <ContentWrapper>
        <Breadcrumb>
          {getBreadcrumbPath().map((item, index, array) => (
            <React.Fragment key={item}>
              <span>{item}</span>
              {index < array.length - 1 && <span>›</span>}
            </React.Fragment>
          ))}
        </Breadcrumb>

        {params.groupId && currentStep !== 'form' && currentStep !== 'verify' && (
          <OfferGroupPayment
            groupId={params.groupId}
            onSelectOffer={handleSelectOffer}
          />
        )}

        {params.offerId && currentStep === 'form' && (
          <OfferPaymentForm
            offerId={params.offerId}
            onPaymentInitiated={handlePaymentInitiated}
            onCancel={handleCancel}
          />
        )}

        {params.productId && currentStep === 'form' && (
          <ProductPaymentForm
            productId={params.productId}
            onPaymentInitiated={handlePaymentInitiated}
            onCancel={handleCancel}
          />
        )}

        {currentStep === 'verify' && (
          <PaymentVerification
            onSuccess={() => {
              setTimeout(() => {
                navigate('/dashboard/payments');
              }, 2000);
            }}
            onError={(error) => {
              console.error('Payment verification error:', error);
            }}
          />
        )}
      </ContentWrapper>
    </PageContainer>
  );
};
