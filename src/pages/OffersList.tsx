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
  FiEye,
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
    font-size: 0.875rem;
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

const DetailsModalOverlay = styled.div<{ isOpen: boolean }>`
  display: ${(props) => (props.isOpen ? 'flex' : 'none')};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const DetailsModalContent = styled.div`
  background: ${colors.surface};
  border-radius: ${borderRadius.lg};
  padding: ${spacing.xl};
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${shadows.lg};

  h2 {
    color: ${colors.textPrimary};
    margin: 0 0 ${spacing.lg} 0;
  }
`;

const DetailsSection = styled.div`
  margin-bottom: ${spacing.lg};

  &:last-child {
    margin-bottom: 0;
  }

  h3 {
    font-size: 0.875rem;
    font-weight: 600;
    color: ${colors.textSecondary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0 0 ${spacing.sm} 0;
  }

  p {
    color: ${colors.textPrimary};
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.6;
    word-break: break-word;
  }
`;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${spacing.lg};
  margin-bottom: ${spacing.lg};
`;

const DetailItem = styled.div`
  h3 {
    font-size: 0.875rem;
    font-weight: 600;
    color: ${colors.textSecondary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0 0 ${spacing.xs} 0;
  }

  p {
    color: ${colors.textPrimary};
    margin: 0;
    font-size: 0.95rem;
  }
`;

const DetailsCloseButton = styled.button`
  width: 100%;
  padding: ${spacing.md} ${spacing.lg};
  background-color: ${colors.primary};
  color: ${colors.surface};
  border: none;
  border-radius: ${borderRadius.md};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
    box-shadow: ${shadows.md};
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
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

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

  const handleOpenDetails = (offer: Offer) => {
    setSelectedOffer(offer);
    setDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsModalOpen(false);
    setSelectedOffer(null);
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
                     {offer.currency?.symbol || '$'}{parseFloat(String(offer.price || 0)).toFixed(offer.currency?.decimal_places || 2)}
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
                   onClick={() => handleOpenDetails(offer)}
                   disabled={isSaving}
                 >
                   <FiEye /> Details
                 </ActionButton>
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

      <DetailsModalOverlay isOpen={detailsModalOpen} onClick={handleCloseDetails}>
        <DetailsModalContent onClick={(e) => e.stopPropagation()}>
          {selectedOffer && (
            <>
              <h2>{selectedOffer.name}</h2>

              {selectedOffer.description && (
                <DetailsSection>
                  <h3>Description</h3>
                  <p>{selectedOffer.description}</p>
                </DetailsSection>
              )}

              <DetailsGrid>
                <DetailItem>
                  <h3>Offer ID</h3>
                  <p style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>{selectedOffer.id}</p>
                </DetailItem>
                <DetailItem>
                  <h3>Company ID</h3>
                  <p style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>{selectedOffer.company_id}</p>
                </DetailItem>
              </DetailsGrid>

              <DetailsGrid>
                <DetailItem>
                  <h3>Price</h3>
                  <p>
                    {selectedOffer.currency?.symbol || '$'}
                    {parseFloat(String(selectedOffer.price || 0)).toFixed(
                      selectedOffer.currency?.decimal_places || 2
                    )}
                  </p>
                </DetailItem>
                <DetailItem>
                  <h3>Currency</h3>
                  <p>{selectedOffer.currency?.code || 'N/A'}</p>
                </DetailItem>
              </DetailsGrid>

              {selectedOffer.currency && (
                <DetailsGrid>
                  <DetailItem>
                    <h3>Currency Name</h3>
                    <p>{selectedOffer.currency.name}</p>
                  </DetailItem>
                  <DetailItem>
                    <h3>Decimal Places</h3>
                    <p>{selectedOffer.currency.decimal_places}</p>
                  </DetailItem>
                </DetailsGrid>
              )}

              {selectedOffer.discount_value && selectedOffer.discount_value > 0 && (
                <>
                  <DetailsGrid>
                    <DetailItem>
                      <h3>
                        {selectedOffer.discount_type === 'percentage'
                          ? 'Discount Percentage'
                          : 'Discount Amount'}
                      </h3>
                      <p>
                        {selectedOffer.discount_value}
                        {selectedOffer.discount_type === 'percentage' ? '%' : selectedOffer.currency?.symbol || '$'}
                      </p>
                    </DetailItem>
                    <DetailItem>
                      <h3>Discount Type</h3>
                      <p style={{ textTransform: 'capitalize' }}>
                        {selectedOffer.discount_type === 'percentage' ? 'Percentage' : 'Fixed'}
                      </p>
                    </DetailItem>
                  </DetailsGrid>

                  {selectedOffer.discount_type === 'percentage' && (
                    <DetailsGrid>
                      <DetailItem>
                        <h3>Discounted Price</h3>
                        <p>
                          {selectedOffer.currency?.symbol || '$'}
                          {(
                            (parseFloat(String(selectedOffer.price || 0)) *
                              (100 - selectedOffer.discount_value)) /
                            100
                          ).toFixed(selectedOffer.currency?.decimal_places || 2)}
                        </p>
                      </DetailItem>
                      {selectedOffer.discount_currency_id && (
                        <DetailItem>
                          <h3>Discount Currency ID</h3>
                          <p style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>{selectedOffer.discount_currency_id}</p>
                        </DetailItem>
                      )}
                    </DetailsGrid>
                  )}
                </>
              )}

              {selectedOffer.original_price && (
                <DetailsGrid>
                  <DetailItem>
                    <h3>Original Price</h3>
                    <p>
                      {selectedOffer.currency?.symbol || '$'}
                      {parseFloat(String(selectedOffer.original_price)).toFixed(
                        selectedOffer.currency?.decimal_places || 2
                      )}
                    </p>
                  </DetailItem>
                  {selectedOffer.final_price && (
                    <DetailItem>
                      <h3>Final Price</h3>
                      <p>
                        {selectedOffer.currency?.symbol || '$'}
                        {parseFloat(String(selectedOffer.final_price)).toFixed(
                          selectedOffer.currency?.decimal_places || 2
                        )}
                      </p>
                    </DetailItem>
                  )}
                </DetailsGrid>
              )}

              <DetailsGrid>
                <DetailItem>
                  <h3>Status</h3>
                  <p>
                    {selectedOffer.is_active ? (
                      <span style={{ color: '#065f46', fontWeight: '600' }}>Active</span>
                    ) : (
                      <span style={{ color: '#991b1b', fontWeight: '600' }}>Inactive</span>
                    )}
                  </p>
                </DetailItem>
                {selectedOffer.is_deleted !== undefined && (
                  <DetailItem>
                    <h3>Deleted</h3>
                    <p>
                      {selectedOffer.is_deleted ? (
                        <span style={{ color: '#991b1b' }}>Yes</span>
                      ) : (
                        <span style={{ color: '#065f46' }}>No</span>
                      )}
                    </p>
                  </DetailItem>
                )}
              </DetailsGrid>

              {selectedOffer.offer_type && (
                <DetailsGrid>
                  <DetailItem>
                    <h3>Offer Type</h3>
                    <p style={{ textTransform: 'capitalize' }}>
                      {selectedOffer.offer_type.replace(/_/g, ' ')}
                    </p>
                  </DetailItem>
                  {selectedOffer.category && (
                    <DetailItem>
                      <h3>Category</h3>
                      <p>{selectedOffer.category}</p>
                    </DetailItem>
                  )}
                </DetailsGrid>
              )}

              {selectedOffer.group_id && (
                <DetailsSection>
                  <h3>Group ID</h3>
                  <p style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>{selectedOffer.group_id}</p>
                </DetailsSection>
              )}

              {selectedOffer.tags && selectedOffer.tags.length > 0 && (
                <DetailsSection>
                  <h3>Tags</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {selectedOffer.tags.map((tag, index) => (
                      <span
                        key={index}
                        style={{
                          backgroundColor: 'rgba(30, 58, 95, 0.1)',
                          color: colors.primary,
                          padding: '0.25rem 0.75rem',
                          borderRadius: '1rem',
                          fontSize: '0.85rem',
                          fontWeight: '500',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </DetailsSection>
              )}

              <DetailsGrid>
                <DetailItem>
                  <h3>Created At</h3>
                  <p style={{ fontSize: '0.85rem' }}>
                    {selectedOffer.created_at
                      ? new Date(selectedOffer.created_at).toLocaleString()
                      : 'N/A'}
                  </p>
                </DetailItem>
                <DetailItem>
                  <h3>Updated At</h3>
                  <p style={{ fontSize: '0.85rem' }}>
                    {selectedOffer.updated_at
                      ? new Date(selectedOffer.updated_at).toLocaleString()
                      : 'N/A'}
                  </p>
                </DetailItem>
              </DetailsGrid>

              <DetailsCloseButton onClick={handleCloseDetails}>
                Close
              </DetailsCloseButton>
            </>
          )}
        </DetailsModalContent>
      </DetailsModalOverlay>
    </>
  );
};
