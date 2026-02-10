import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { colors, spacing } from '../../config/theme';
import { LoadingSpinner } from '../LoadingSpinner';

const Container = styled.div`
  padding: ${spacing.lg};
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

const OfferGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${spacing.lg};
`;

const OfferCard = styled.div`
  background: white;
  border: 1px solid ${colors.border};
  border-radius: 8px;
  padding: ${spacing.lg};
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const OfferName = styled.h3`
  font-size: 1.25rem;
  color: ${colors.textPrimary};
  margin-bottom: ${spacing.md};
`;

const OfferDescription = styled.p`
  color: ${colors.textSecondary};
  font-size: 0.875rem;
  margin-bottom: ${spacing.md};
`;

const Price = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${colors.primary};
  margin-bottom: ${spacing.md};
`;

const Button = styled.button`
  width: 100%;
  background-color: ${colors.primary};
  color: white;
  border: none;
  padding: ${spacing.md};
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s ease;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

interface Offer {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
}

interface OfferGroupPaymentProps {
  groupId: string;
  onSelectOffer: (offerId: string) => void;
}

export const OfferGroupPayment: React.FC<OfferGroupPaymentProps> = ({
  groupId,
  onSelectOffer,
}) => {
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/payments/offer-groups/${groupId}/`,
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
        setGroup(data.data || data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [groupId]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  if (!group) {
    return <div>No offer group found</div>;
  }

  return (
    <Container>
      <Title>{group.name}</Title>
      <Description>{group.description}</Description>

      <OfferGrid>
        {group.offers?.map((offer: Offer) => (
          <OfferCard key={offer.id}>
            <OfferName>{offer.name}</OfferName>
            <OfferDescription>{offer.description}</OfferDescription>
            <Price>
              {offer.price} {offer.currency}
            </Price>
            <Button onClick={() => onSelectOffer(offer.id)}>
              Select This Offer
            </Button>
          </OfferCard>
        ))}
      </OfferGrid>
    </Container>
  );
};
