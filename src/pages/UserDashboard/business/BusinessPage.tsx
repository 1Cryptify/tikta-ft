import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useCompany, Company } from '../../../hooks/useCompany';
import { colors, spacing, borderRadius, shadows, transitions } from '../../../config/theme';

// ==================== STYLED COMPONENTS ====================

const PageWrapper = styled.div`
  min-height: 100vh;
  background: ${colors.neutral};
  padding: ${spacing.xl};
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  margin-bottom: ${spacing.xxl};
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  color: ${colors.textPrimary};
  font-weight: 700;
  margin: 0 0 ${spacing.sm} 0;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const PageSubtitle = styled.p`
  color: ${colors.textSecondary};
  font-size: 1rem;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${spacing.xl};
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: ${spacing.lg};
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: ${spacing.lg};
  }
`;

const BusinessCard = styled.div<{ isActive: boolean }>`
  position: relative;
  background: ${colors.surface};
  border: 2px solid ${props => props.isActive ? colors.primary : colors.border};
  border-radius: ${borderRadius.lg};
  padding: ${spacing.xl};
  cursor: pointer;
  transition: all ${transitions.base};
  box-shadow: ${props => props.isActive ? shadows.lg : shadows.sm};
  overflow: hidden;

  &:hover {
    border-color: ${colors.primary};
    box-shadow: ${shadows.md};
    transform: translateY(-2px);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.isActive ? colors.primary : 'transparent'};
    transition: background ${transitions.base};
  }

  @media (max-width: 480px) {
    padding: ${spacing.lg};
  }
`;

const CardContent = styled.div`
  position: relative;
  z-index: 1;
`;

const CardLogo = styled.div<{ bgColor?: string }>`
  width: 60px;
  height: 60px;
  background: ${props => props.bgColor || colors.primaryLight};
  border-radius: ${borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${colors.surface};
  margin-bottom: ${spacing.lg};
  transition: all ${transitions.base};

  @media (max-width: 480px) {
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
  }
`;

const CardName = styled.h3`
  font-size: 1.25rem;
  color: ${colors.textPrimary};
  margin: 0 0 ${spacing.sm} 0;
  font-weight: 600;
  word-break: break-word;

  @media (max-width: 480px) {
    font-size: 1.125rem;
  }
`;

const CardDescription = styled.p`
  color: ${colors.textSecondary};
  font-size: 0.875rem;
  margin: 0 0 ${spacing.lg} 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CardMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
  padding-top: ${spacing.lg};
  border-top: 1px solid ${colors.border};
`;

const MetaItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: ${colors.textSecondary};

  @media (max-width: 480px) {
    font-size: 0.7rem;
  }
`;

const MetaLabel = styled.span`
  font-weight: 500;
`;

const MetaValue = styled.span`
  color: ${colors.textPrimary};
`;

const ActiveBadge = styled.div`
  position: absolute;
  top: ${spacing.lg};
  right: ${spacing.lg};
  background: ${colors.success};
  color: ${colors.surface};
  padding: ${spacing.xs} ${spacing.sm};
  border-radius: ${borderRadius.full};
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (max-width: 480px) {
    top: ${spacing.md};
    right: ${spacing.md};
    padding: 3px 6px;
    font-size: 0.6rem;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  color: ${colors.textSecondary};
  font-size: 1rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${spacing.xxl};
  color: ${colors.textSecondary};

  h3 {
    font-size: 1.25rem;
    color: ${colors.textPrimary};
    margin-bottom: ${spacing.lg};
  }

  p {
    margin: 0;
  }
`;

const ErrorMessage = styled.div`
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid ${colors.error};
  border-radius: ${borderRadius.md};
  padding: ${spacing.lg};
  color: ${colors.error};
  margin-bottom: ${spacing.xl};

  @media (max-width: 480px) {
    padding: ${spacing.md};
    font-size: 0.875rem;
  }
`;

// ==================== COMPONENT ====================

interface BusinessPageProps {
  onCompanySelect?: (company: Company) => void;
  onHeaderTitleChange?: (title: string) => void;
}

export const BusinessPage: React.FC<BusinessPageProps> = ({
  onCompanySelect,
  onHeaderTitleChange,
}) => {
  const { companies, currentCompany, isLoading, error, listCompanies, getCompanyDetail } = useCompany();
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(currentCompany || null);

  // Load companies on mount
  useEffect(() => {
    listCompanies();
  }, [listCompanies]);

  // Update header title when selected company changes
  useEffect(() => {
    if (selectedCompany && onHeaderTitleChange) {
      onHeaderTitleChange(selectedCompany.name);
    } else if (!selectedCompany && onHeaderTitleChange) {
      onHeaderTitleChange('Tikta');
    }
  }, [selectedCompany, onHeaderTitleChange]);

  const handleCompanySelect = async (company: Company) => {
    setSelectedCompany(company);
    
    // Fetch company details
    await getCompanyDetail(company.id);
    
    // Call parent callback if provided
    if (onCompanySelect) {
      onCompanySelect(company);
    }
  };

  const getCompanyInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getColorForCompany = (index: number): string => {
    const colors_array = [
      colors.primary,
      colors.primaryLight,
      colors.info,
      colors.success,
      colors.warning,
    ];
    return colors_array[index % colors_array.length];
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <PageWrapper>
      <Container>
        <PageHeader>
          <PageTitle>Mes Entreprises</PageTitle>
          <PageSubtitle>
            Sélectionnez une entreprise pour gérer ses opérations
          </PageSubtitle>
        </PageHeader>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        {isLoading ? (
          <LoadingContainer>
            <span>Chargement de vos entreprises...</span>
          </LoadingContainer>
        ) : companies.length === 0 ? (
          <EmptyState>
            <h3>Aucune entreprise trouvée</h3>
            <p>Vous n'avez pas encore créé d'entreprise.</p>
          </EmptyState>
        ) : (
          <CardsGrid>
            {companies.map((company, index) => (
              <BusinessCard
                key={company.id}
                isActive={selectedCompany?.id === company.id}
                onClick={() => handleCompanySelect(company)}
              >
                {selectedCompany?.id === company.id && (
                  <ActiveBadge>Actif</ActiveBadge>
                )}

                <CardContent>
                  <CardLogo bgColor={getColorForCompany(index)}>
                    {getCompanyInitials(company.name)}
                  </CardLogo>

                  <CardName>{company.name}</CardName>

                  {company.description && (
                    <CardDescription>{company.description}</CardDescription>
                  )}

                  <CardMeta>
                    {company.is_verified !== undefined && (
                      <MetaItem>
                        <MetaLabel>Statut</MetaLabel>
                        <MetaValue>
                          {company.is_verified ? '✓ Vérifiée' : 'En attente'}
                        </MetaValue>
                      </MetaItem>
                    )}

                    {company.is_active !== undefined && (
                      <MetaItem>
                        <MetaLabel>Activité</MetaLabel>
                        <MetaValue>
                          {company.is_active ? 'Active' : 'Inactive'}
                        </MetaValue>
                      </MetaItem>
                    )}

                    {company.created_at && (
                      <MetaItem>
                        <MetaLabel>Créée le</MetaLabel>
                        <MetaValue>{formatDate(company.created_at)}</MetaValue>
                      </MetaItem>
                    )}
                  </CardMeta>
                </CardContent>
              </BusinessCard>
            ))}
          </CardsGrid>
        )}
      </Container>
    </PageWrapper>
  );
};

export default BusinessPage;
