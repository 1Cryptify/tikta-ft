import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useOffer, Offer } from '../../../../hooks/useOffer';
import { useCompany } from '../../../../hooks/useCompany';
import { colors, spacing, borderRadius, shadows } from '../../../../config/theme';
import { FiPlus, FiEdit2, FiTrash2, FiLoader } from 'react-icons/fi';
import { OffersModal } from './OffersModal';

const Panel = styled.div`
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: ${borderRadius.lg};
  padding: ${spacing.xl};
  box-shadow: ${shadows.sm};
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${spacing.xl};
  border-bottom: 1px solid ${colors.border};
  padding-bottom: ${spacing.lg};

  h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: ${colors.textPrimary};
    margin: 0;
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.sm} ${spacing.lg};
  background: ${colors.primary};
  color: ${colors.surface};
  border: none;
  border-radius: ${borderRadius.md};
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 200ms ease-in-out;

  &:hover {
    background: ${colors.primaryDark};
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const OffersList = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${colors.neutral};
  }

  &::-webkit-scrollbar-thumb {
    background: ${colors.border};
    border-radius: 3px;

    &:hover {
      background: ${colors.textSecondary};
    }
  }
`;

const OfferItem = styled.div<{ isActive?: boolean }>`
  background: ${props => props.isActive ? colors.primaryLight : colors.neutral};
  border: 1px solid ${props => props.isActive ? colors.primary : colors.border};
  border-radius: ${borderRadius.md};
  padding: ${spacing.lg};
  cursor: pointer;
  transition: all 200ms ease-in-out;

  &:hover {
    border-color: ${colors.primary};
    background: ${colors.primaryLight};
  }

  h3 {
    margin: 0 0 ${spacing.sm} 0;
    color: ${colors.textPrimary};
    font-weight: 600;
    font-size: 1rem;
  }

  p {
    margin: ${spacing.xs} 0;
    font-size: 0.875rem;
    color: ${colors.textSecondary};
  }

  .price {
    color: ${colors.primary};
    font-weight: 600;
    font-size: 1.125rem;
    margin-top: ${spacing.sm};
  }

  .status {
    display: inline-block;
    padding: ${spacing.xs} ${spacing.md};
    border-radius: ${borderRadius.sm};
    font-size: 0.75rem;
    font-weight: 600;
    margin-top: ${spacing.md};
    background: ${props => props.isActive ? colors.success : colors.warning};
    color: ${colors.surface};
  }
`;

const ItemActions = styled.div`
  display: flex;
  gap: ${spacing.sm};
  margin-top: ${spacing.lg};
`;

const IconButton = styled.button<{ variant?: 'edit' | 'delete' }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.sm};
  padding: ${spacing.sm} ${spacing.md};
  border: none;
  border-radius: ${borderRadius.sm};
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 600;
  transition: all 200ms ease-in-out;

  background: ${props => props.variant === 'delete' ? '#fee2e2' : '#dbeafe'};
  color: ${props => props.variant === 'delete' ? colors.error : colors.info};

  &:hover {
    opacity: 0.8;
    transform: translateY(-1px);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${spacing.xl};
  text-align: center;
  color: ${colors.textSecondary};

  p {
    margin: 0;
    font-size: 0.875rem;
  }
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${spacing.xl};

  svg {
    animation: spin 1s linear infinite;
    width: 24px;
    height: 24px;
    color: ${colors.primary};
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

interface OffersPanelProps {
  companyId?: string;
}

export const OffersPanel: React.FC<OffersPanelProps> = ({ companyId = '' }) => {
  const { offers, isLoading, error, listOffers, deleteOffer } = useOffer();
  const { company } = useCompany();
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  useEffect(() => {
    if (companyId || company?.id) {
      listOffers(companyId || company?.id || '');
    }
  }, [companyId, company?.id, listOffers]);

  const handleAddClick = () => {
    setEditingOffer(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (offer: Offer) => {
    setEditingOffer(offer);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
      await deleteOffer(id);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingOffer(null);
  };

  return (
    <>
      <Panel>
        <PanelHeader>
          <h2>Offres</h2>
          <AddButton onClick={handleAddClick}>
            <FiPlus />
            Ajouter
          </AddButton>
        </PanelHeader>

        {isLoading && (
          <LoadingState>
            <FiLoader />
          </LoadingState>
        )}

        {error && (
          <EmptyState>
            <p>Erreur: {error}</p>
          </EmptyState>
        )}

        {!isLoading && !error && offers.length === 0 && (
          <EmptyState>
            <p>Aucune offre créée</p>
            <p style={{ marginTop: spacing.sm, fontSize: '0.75rem' }}>
              Cliquez sur "Ajouter" pour créer votre première offre
            </p>
          </EmptyState>
        )}

        {!isLoading && offers.length > 0 && (
          <OffersList>
            {offers.map(offer => (
              <OfferItem
                key={offer.id}
                isActive={selectedOfferId === offer.id}
                onClick={() => setSelectedOfferId(offer.id)}
              >
                <h3>{offer.name}</h3>
                {offer.description && <p>{offer.description}</p>}
                <div className="price">
                  {offer.price.toLocaleString()} {offer.currency || 'XAF'}
                </div>
                <span className="status">
                  {offer.is_active ? 'Actif' : 'Inactif'}
                </span>
                <ItemActions>
                  <IconButton
                    variant="edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(offer);
                    }}
                  >
                    <FiEdit2 /> Éditer
                  </IconButton>
                  <IconButton
                    variant="delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(offer.id);
                    }}
                  >
                    <FiTrash2 /> Supprimer
                  </IconButton>
                </ItemActions>
              </OfferItem>
            ))}
          </OffersList>
        )}
      </Panel>

      <OffersModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        offer={editingOffer}
        companyId={companyId || company?.id || ''}
      />
    </>
  );
};
