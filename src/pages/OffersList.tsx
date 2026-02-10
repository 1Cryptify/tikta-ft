import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiAlertCircle,
  FiCheck,
  FiX,
} from 'react-icons/fi';
import { useOffer, Offer } from '../hooks/useOffer';
import { OfferModal } from '../components/OfferModal';
import { colors, spacing, borderRadius, shadows } from '../config/theme';

const Header = styled.div`
  margin-bottom: ${spacing.xxl};

  h2 {
    font-size: 1.5rem;
    color: ${colors.textPrimary};
    margin: 0;
  }

  p {
    color: ${colors.textSecondary};
    font-size: 0.875rem;
    margin: ${spacing.sm} 0 0 0;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: ${spacing.lg};
  align-items: center;
  margin-bottom: ${spacing.lg};
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchBox = styled.div`
  flex: 1;
  min-width: 250px;
  position: relative;

  input {
    width: 100%;
    padding: ${spacing.md} ${spacing.lg};
    padding-left: 2.5rem;
    border: 1px solid ${colors.border};
    border-radius: ${borderRadius.md};
    font-size: 0.875rem;
    transition: border-color 0.3s ease;

    &:focus {
      outline: none;
      border-color: ${colors.primary};
      box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.1);
    }
  }

  svg {
    position: absolute;
    left: ${spacing.lg};
    top: 50%;
    transform: translateY(-50%);
    color: ${colors.textSecondary};
    pointer-events: none;
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.md} ${spacing.lg};
  background-color: ${colors.primary};
  color: ${colors.surface};
  border: none;
  border-radius: ${borderRadius.md};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
    box-shadow: ${shadows.md};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorBanner = styled.div`
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: ${borderRadius.md};
  padding: ${spacing.lg};
  margin-bottom: ${spacing.lg};
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  color: ${colors.error};
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: ${colors.textSecondary};

  div {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: ${colors.textSecondary};

  svg {
    font-size: 3rem;
    margin-bottom: ${spacing.lg};
    opacity: 0.5;
  }

  p {
    margin-bottom: ${spacing.md};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${spacing.lg};
  margin-bottom: ${spacing.lg};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: ${borderRadius.lg};
  padding: ${spacing.lg};
  transition: all 0.3s ease;
  box-shadow: ${shadows.sm};

  &:hover {
    box-shadow: ${shadows.md};
    transform: translateY(-2px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${spacing.md};
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 1.125rem;
  color: ${colors.textPrimary};
  word-break: break-word;
`;

const Badge = styled.span<{ variant: 'active' | 'inactive' }>`
  display: inline-flex;
  align-items: center;
  gap: ${spacing.xs};
  padding: ${spacing.xs} ${spacing.sm};
  border-radius: ${borderRadius.full};
  font-size: 0.75rem;
  font-weight: 600;
  background-color: ${(props) =>
    props.variant === 'active' ? '#d1fae5' : '#fee2e2'};
  color: ${(props) => (props.variant === 'active' ? '#065f46' : '#991b1b')};
`;

const Description = styled.p`
  color: ${colors.textSecondary};
  font-size: 0.875rem;
  margin: 0 0 ${spacing.md} 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PriceSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${spacing.md};
  margin-bottom: ${spacing.lg};
  padding: ${spacing.md};
  background-color: ${colors.neutral};
  border-radius: ${borderRadius.md};

  div {
    display: flex;
    flex-direction: column;
  }

  label {
    font-size: 0.75rem;
    font-weight: 600;
    color: ${colors.textSecondary};
    margin-bottom: ${spacing.xs};
  }

  span {
    font-size: 1rem;
    font-weight: 600;
    color: ${colors.textPrimary};
  }
`;

const DiscountSection = styled.div`
  background-color: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: ${borderRadius.md};
  padding: ${spacing.md};
  margin-bottom: ${spacing.lg};
  display: flex;
  gap: ${spacing.md};
  align-items: center;

  label {
    font-size: 0.75rem;
    font-weight: 600;
    color: #b45309;
  }

  span {
    font-size: 1rem;
    font-weight: 600;
    color: #b45309;
  }
`;

const CardActions = styled.div`
  display: flex;
  gap: ${spacing.sm};
  border-top: 1px solid ${colors.border};
  padding-top: ${spacing.md};
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'danger' }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.xs};
  padding: ${spacing.md};
  border: 1px solid
    ${(props) => (props.variant === 'danger' ? colors.error : colors.border)};
  background-color: transparent;
  color: ${(props) =>
    props.variant === 'danger' ? colors.error : colors.primary};
  border-radius: ${borderRadius.md};
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background-color: ${(props) =>
      props.variant === 'danger'
        ? 'rgba(220, 38, 38, 0.05)'
        : 'rgba(30, 58, 95, 0.05)'};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

interface OffersListProps {
  onTabChange?: (tab: 'offers' | 'products') => void;
}

export const OffersList: React.FC<OffersListProps> = ({ onTabChange }) => {
  const {
    offers,
    currencies,
    isLoading,
    error,
    createOffer,
    updateOffer,
    deleteOffer,
    activateOffer,
    deactivateOffer,
  } = useOffer();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const filteredOffers = useMemo(() => {
    return offers.filter(
      (offer) =>
        offer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [offers, searchTerm]);

  const handleOpenModal = (offer?: Offer) => {
    if (offer) {
      setEditingOffer(offer);
    } else {
      setEditingOffer(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingOffer(null);
  };

  const handleSubmit = async (data: Partial<Offer>) => {
    setIsSaving(true);
    try {
      if (editingOffer) {
        await updateOffer(editingOffer.id, data);
      } else {
        await createOffer(data);
      }
      handleCloseModal();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (offerId: string) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) {
      return;
    }

    try {
      await deleteOffer(offerId);
    } catch (error) {
      console.error('Failed to delete offer:', error);
    }
  };

  const handleToggleActive = async (offer: Offer) => {
    try {
      if (offer.is_active) {
        await deactivateOffer(offer.id);
      } else {
        await activateOffer(offer.id);
      }
    } catch (error) {
      console.error('Failed to toggle offer status:', error);
    }
  };

  return (
    <>
      <Header>
        <h2>Offers</h2>
      </Header>

      {error && (
        <ErrorBanner>
          <FiAlertCircle /> {error}
        </ErrorBanner>
      )}

      <HeaderActions>
        <SearchBox>
          <FiSearch />
          <input
            type="text"
            placeholder="Search offers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading}
          />
        </SearchBox>
        <AddButton
          onClick={() => handleOpenModal()}
          disabled={isLoading}
        >
          <FiPlus /> New Offer
        </AddButton>
      </HeaderActions>

      {isLoading && !offers.length ? (
        <LoadingSpinner>
          <div>Loading offers...</div>
        </LoadingSpinner>
      ) : filteredOffers.length === 0 ? (
        <EmptyState>
          <FiX size={48} />
          <p>{offers.length === 0 ? 'No offers yet' : 'No matching offers'}</p>
          {offers.length === 0 && (
            <AddButton onClick={() => handleOpenModal()}>
              <FiPlus /> Create Your First Offer
            </AddButton>
          )}
        </EmptyState>
      ) : (
        <Grid>
          {filteredOffers.map((offer) => (
            <Card key={offer.id}>
              <CardHeader>
                <CardTitle>{offer.name}</CardTitle>
                <Badge variant={offer.is_active ? 'active' : 'inactive'}>
                  {offer.is_active ? (
                    <>
                      <FiCheck size={12} /> Active
                    </>
                  ) : (
                    <>
                      <FiX size={12} /> Inactive
                    </>
                  )}
                </Badge>
              </CardHeader>

              {offer.description && (
                <Description>{offer.description}</Description>
              )}

              <PriceSection>
                 <div>
                   <label>Price</label>
                   <span>
                     {offer.currency?.symbol || '$'}{offer.price?.toFixed(offer.currency?.decimal_places || 2) || '0.00'}
                   </span>
                 </div>
                 <div>
                   <label>Currency</label>
                   <span>{offer.currency?.code || 'N/A'}</span>
                 </div>
               </PriceSection>

              {offer.discount_value && offer.discount_value > 0 && (
                <DiscountSection>
                  <div>
                    <label>
                      {offer.discount_type === 'percentage'
                        ? 'Discount'
                        : 'Discount Amount'}
                    </label>
                    <span>
                      {offer.discount_value}
                      {offer.discount_type === 'percentage' ? '%' : '$'}
                    </span>
                  </div>
                </DiscountSection>
              )}

              <CardActions>
                <ActionButton
                  variant="primary"
                  onClick={() => handleOpenModal(offer)}
                  disabled={isSaving}
                >
                  <FiEdit2 /> Edit
                </ActionButton>
                <ActionButton
                  onClick={() => handleToggleActive(offer)}
                  disabled={isSaving}
                >
                  {offer.is_active ? 'Deactivate' : 'Activate'}
                </ActionButton>
                <ActionButton
                  variant="danger"
                  onClick={() => handleDelete(offer.id)}
                  disabled={isSaving}
                >
                  <FiTrash2 /> Delete
                </ActionButton>
              </CardActions>
            </Card>
          ))}
        </Grid>
      )}

      <OfferModal
        isOpen={isModalOpen}
        offer={editingOffer}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        isLoading={isSaving}
        currencies={currencies}
      />
    </>
  );
};
