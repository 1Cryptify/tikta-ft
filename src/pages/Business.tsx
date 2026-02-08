import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
    hasPermission,
    getPermittedActions,
    canAccessMenu,
    UserRole,
    MenuName,
    ActionType,
} from '../config/menuPermissions';
import { mockBusinesses, Business as BusinessType } from '../mocks/businessMocks';
import DocumentUploadModal from '../components/DocumentUploadModal';
import LogoUploadModal from '../components/LogoUploadModal';
import {
    FiEdit,
    FiTrash2,
    FiLock,
    FiUnlock,
    FiUpload,
    FiCheck,
    FiPlus,
    FiSearch,
    FiFileText,
} from 'react-icons/fi';

interface BusinessPageProps {
    userRole: UserRole;
    onCompanyActivated?: (company: { id: string; name: string; logo?: string } | null) => void;
}

const Container = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, sans-serif;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #1a1a1a;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-start;
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;

  background-color: ${(props) => {
        switch (props.variant) {
            case 'primary':
                return '#007bff';
            case 'danger':
                return '#dc3545';
            default:
                return '#6c757d';
        }
    }};
  color: white;

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
  }
`;

const SearchContainer = styled.div`
  width: 100%;
  max-width: 400px;
  position: relative;

  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  pointer-events: none;
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const BusinessCard = styled.div`
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;

  &:hover {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
    border-color: #007bff;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const LogoImage = styled.img<{ isClickable?: boolean }>`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: #f0f0f0;
  object-fit: cover;
  cursor: ${(props) => (props.isClickable ? 'pointer' : 'default')};
  transition: all 0.3s ease;

  ${(props) =>
        props.isClickable &&
        `
    &:hover {
      opacity: 0.8;
      transform: scale(1.05);
    }
  `}
`;

const LogoPlaceholder = styled.div<{ isClickable?: boolean }>`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
  flex-shrink: 0;
  cursor: ${(props) => (props.isClickable ? 'pointer' : 'default')};
  transition: all 0.3s ease;

  ${(props) =>
        props.isClickable &&
        `
    &:hover {
      opacity: 0.8;
      transform: scale(1.05);
    }
  `}
`;

const StatusCircleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
`;

const StatusCircle = styled.button<{ isActive: boolean }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background-color: ${(props) => (props.isActive ? '#28a745' : '#f5f5f5')};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  flex-shrink: 0;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    color: ${(props) => (props.isActive ? 'white' : '#333')};
    font-size: 1.5rem;
  }
`;

const StatusLabel = styled.span<{ isActive: boolean }>`
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${(props) => (props.isActive ? '#28a745' : '#333')};
  white-space: nowrap;
`;

const CardTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
  word-break: break-word;
`;

const CardInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  label {
    font-size: 0.75rem;
    font-weight: 600;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  span {
    font-size: 0.9rem;
    color: #495057;
    word-break: break-word;
  }
`;

const DocumentsProgress = styled.div`
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const DocumentsProgressTitle = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
`;

const DocumentsProgressBar = styled.div`
  display: flex;
  gap: 0.25rem;
`;

const DocumentIndicator = styled.div<{ completed: boolean }>`
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background-color: ${(props) => (props.completed ? '#28a745' : '#dee2e6')};
  transition: all 0.3s ease;
`;

const DocumentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const DocumentItem = styled.div<{ completed: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  font-size: 0.8rem;
  color: ${(props) => (props.completed ? '#28a745' : '#999')};

  svg {
    color: ${(props) => (props.completed ? '#28a745' : '#dee2e6')};
    flex-shrink: 0;
  }
`;

const StatusBadge = styled.span<{ status: 'verified' | 'pending' | 'blocked' }>`
  display: inline-block;
  padding: 0.4rem 0.8rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  width: fit-content;

  ${(props) => {
        switch (props.status) {
            case 'verified':
                return 'background-color: #d4edda; color: #155724;';
            case 'blocked':
                return 'background-color: #f8d7da; color: #721c24;';
            default:
                return 'background-color: #fff3cd; color: #856404;';
        }
    }}
`;

const CardActions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
`;

const ActionButton = styled.button<{ variant?: 'default' | 'danger' | 'success' | 'secondary' }>`
  flex: 1;
  min-width: 60px;
  padding: 0.6rem 0.8rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.8rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  color: ${(props) => {
        switch (props.variant) {
            case 'danger':
                return '#dc3545';
            case 'success':
                return '#28a745';
            default:
                return '#495057';
        }
    }};

  &:hover {
    background-color: ${(props) => {
        switch (props.variant) {
            case 'danger':
                return '#f8d7da';
            case 'success':
                return '#d4edda';
            default:
                return '#f8f9fa';
        }
    }};
    border-color: currentColor;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    padding: 0.5rem;
    font-size: 0.75rem;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #999;
`;

const StatsBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 0.75rem;
    padding: 0.75rem;
  }
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  label {
    font-size: 0.75rem;
    font-weight: 600;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  span {
    font-size: 1.1rem;
    font-weight: 700;
    color: #1a1a1a;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    margin-left: 0;
    width: 100%;
  }
`;

const FilterButton = styled.button<{ active?: boolean }>`
  padding: 0.5rem 1rem;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background: ${(props) => (props.active ? '#007bff' : 'white')};
  color: ${(props) => (props.active ? 'white' : '#495057')};
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #007bff;
    background: ${(props) => (props.active ? '#0056b3' : '#f8f9fa')};
  }

  @media (max-width: 480px) {
    padding: 0.4rem 0.8rem;
    font-size: 0.75rem;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #999;

  h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.2rem;
    color: #495057;
  }

  p {
    margin: 0;
  }
`;

interface BusinessWithDocuments extends BusinessType {
    nui_document?: string;
    commerce_register_document?: string;
    website_document?: string;
    creation_document?: string;
}

export const Business: React.FC<BusinessPageProps> = ({ userRole, onCompanyActivated }) => {
    const [businesses, setBusinesses] = useState<BusinessWithDocuments[]>([]);
    const [filteredBusinesses, setFilteredBusinesses] = useState<BusinessWithDocuments[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
    const [selectedBusinessForDocs, setSelectedBusinessForDocs] = useState<BusinessWithDocuments | null>(null);
    const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
    const [selectedBusinessForLogo, setSelectedBusinessForLogo] = useState<BusinessWithDocuments | null>(null);
    const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'pending' | 'blocked'>('all');

    // Vérifier l'accès au menu
    const canAccess = canAccessMenu(userRole, MenuName.BUSINESS);

    useEffect(() => {
        if (canAccess) {
            // Simuler un délai de chargement
            setTimeout(() => {
                setBusinesses(mockBusinesses);
                setLoading(false);
            }, 500);
        }
    }, [canAccess, userRole]);

    useEffect(() => {
        filterBusinesses();
    }, [searchTerm, businesses, statusFilter]);

    const filterBusinesses = () => {
        const term = searchTerm.toLowerCase();
        let filtered = businesses.filter(
            (b) =>
                b.name?.toLowerCase().includes(term) ||
                b.nui?.toLowerCase().includes(term) ||
                b.commerce_register?.toLowerCase().includes(term)
        );

        // Apply status filter
        if (statusFilter === 'verified') {
            filtered = filtered.filter((b) => b.is_verified && !b.is_blocked);
        } else if (statusFilter === 'pending') {
            filtered = filtered.filter((b) => !b.is_verified && !b.is_blocked);
        } else if (statusFilter === 'blocked') {
            filtered = filtered.filter((b) => b.is_blocked);
        }

        setFilteredBusinesses(filtered);
    };

    const getStatus = (business: Business): 'verified' | 'pending' | 'blocked' => {
        if (business.is_blocked) return 'blocked';
        if (business.is_verified) return 'verified';
        return 'pending';
    };

    const handleCreate = () => {
        console.log('Créer nouvelle entreprise');
        // TODO: Implémenter modal/page de création
    };

    const handleEdit = (id: string) => {
        console.log('Éditer entreprise:', id);
        // TODO: Implémenter modal/page d'édition
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette entreprise ?')) {
            setBusinesses(businesses.filter((b) => b.id !== id));
        }
    };

    const handleBlock = (id: string, isBlocked: boolean) => {
        setBusinesses(
            businesses.map((b) =>
                b.id === id ? { ...b, is_blocked: !isBlocked } : b
            )
        );
    };

    const handleUploadDocuments = (business: BusinessWithDocuments) => {
        setSelectedBusinessForDocs(business);
        setIsDocumentModalOpen(true);
    };

    const handleDocumentsSubmit = (formData: FormData) => {
        if (!selectedBusinessForDocs) return;

        // Mettre à jour l'état local avec les documents
        setBusinesses(
            businesses.map((b) =>
                b.id === selectedBusinessForDocs.id
                    ? {
                        ...b,
                        nui_document: formData.has('nui_document')
                            ? 'uploaded'
                            : b.nui_document,
                        commerce_register_document: formData.has(
                            'commerce_register_document'
                        )
                            ? 'uploaded'
                            : b.commerce_register_document,
                        website_document: formData.has('website_document')
                            ? 'uploaded'
                            : b.website_document,
                        creation_document: formData.has('creation_document')
                            ? 'uploaded'
                            : b.creation_document,
                        is_verified: true, // Marquer comme vérifiée après upload
                    }
                    : b
            )
        );

        console.log('Documents uploadés pour:', selectedBusinessForDocs.name);
    };

    const getDocumentsProgress = (business: BusinessWithDocuments): number => {
        const documents = [
            business.nui_document,
            business.commerce_register_document,
            business.website_document,
            business.creation_document,
        ];
        const completed = documents.filter((doc) => !!doc).length;
        return (completed / documents.length) * 100;
    };

    const handleMarkActive = (id: string) => {
        const business = businesses.find((b) => b.id === id);
        if (!business) return;

        // Si on clique sur une entreprise active, on la désactive
        // Si on clique sur une entreprise inactive, on désactive les autres et on l'active
        const updatedBusinesses = businesses.map((b) =>
            b.id === id
                ? { ...b, is_active: !b.is_active }
                : { ...b, is_active: false }
        );

        setBusinesses(updatedBusinesses);

        // Notifier le parent de l'entreprise active
        const activeCompany = updatedBusinesses.find((b) => b.is_active);
        if (onCompanyActivated) {
            if (activeCompany) {
                onCompanyActivated({
                    id: activeCompany.id,
                    name: activeCompany.name,
                    logo: activeCompany.logo,
                });
            } else {
                onCompanyActivated(null);
            }
        }
    };

    const handleAssociate = (id: string) => {
        console.log('Associer à client:', id);
        // TODO: Implémenter association
    };

    const handleUploadLogo = (business: BusinessWithDocuments) => {
        setSelectedBusinessForLogo(business);
        setIsLogoModalOpen(true);
    };

    const handleLogoSubmit = (file: File) => {
        if (!selectedBusinessForLogo) return;

        // Créer une URL d'aperçu pour le fichier
        const logoUrl = URL.createObjectURL(file);

        setBusinesses(
            businesses.map((b) =>
                b.id === selectedBusinessForLogo.id ? { ...b, logo: logoUrl } : b
            )
        );

        console.log('Logo uploaded for:', selectedBusinessForLogo.name);
    };

    if (!canAccess) {
        return (
            <Container>
                <EmptyState>
                    <h3>Accès refusé</h3>
                    <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
                </EmptyState>
            </Container>
        );
    }

    return (
        <Container>
            <Header>
                <Title>Businesses</Title>
                {hasPermission(userRole, MenuName.BUSINESS, ActionType.BUSINESS_CREATE) && (
                    <Button variant="primary" onClick={handleCreate}>
                        <FiPlus /> Create
                    </Button>
                )}
            </Header>

            <SearchContainer>
                <SearchIcon>
                    <FiSearch />
                </SearchIcon>
                <SearchInput
                    type="text"
                    placeholder="Search by name, NUI or registry..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </SearchContainer>

            <StatsBar>
                <StatItem>
                    <label>Total</label>
                    <span>{businesses.length}</span>
                </StatItem>
                <StatItem>
                    <label>Verified</label>
                    <span>{businesses.filter((b) => b.is_verified && !b.is_blocked).length}</span>
                </StatItem>
                <StatItem>
                    <label>Pending</label>
                    <span>{businesses.filter((b) => !b.is_verified && !b.is_blocked).length}</span>
                </StatItem>
                <StatItem>
                    <label>Blocked</label>
                    <span>{businesses.filter((b) => b.is_blocked).length}</span>
                </StatItem>

                <FilterGroup>
                    <FilterButton
                        active={statusFilter === 'all'}
                        onClick={() => setStatusFilter('all')}
                    >
                        All
                    </FilterButton>
                    <FilterButton
                        active={statusFilter === 'verified'}
                        onClick={() => setStatusFilter('verified')}
                    >
                        Verified
                    </FilterButton>
                    <FilterButton
                        active={statusFilter === 'pending'}
                        onClick={() => setStatusFilter('pending')}
                    >
                        Pending
                    </FilterButton>
                    <FilterButton
                        active={statusFilter === 'blocked'}
                        onClick={() => setStatusFilter('blocked')}
                    >
                        Blocked
                    </FilterButton>
                </FilterGroup>
            </StatsBar>

            {error && (
                <div style={{ color: '#dc3545', marginBottom: '1rem', padding: '1rem', backgroundColor: '#f8d7da', borderRadius: '4px' }}>
                    {error}
                </div>
            )}

            {loading ? (
                <LoadingContainer>Loading...</LoadingContainer>
            ) : filteredBusinesses.length === 0 ? (
                <EmptyState>
                    <h3>No businesses found</h3>
                    <p>{searchTerm ? 'No results for your search' : 'Start by creating a new business'}</p>
                </EmptyState>
            ) : (
                <CardsGrid>
                    {filteredBusinesses.map((business) => (
                        <BusinessCard key={business.id}>
                            <CardHeader>
                                <div style={{ flex: 1 }}>
                                    {business.logo ? (
                                        <LogoImage
                                            src={business.logo}
                                            alt={business.name}
                                            isClickable={true}
                                            onClick={() => handleUploadLogo(business)}
                                            title="Click to change logo"
                                        />
                                    ) : (
                                        <LogoPlaceholder
                                            isClickable={true}
                                            onClick={() => handleUploadLogo(business)}
                                            title="Click to add logo"
                                        >
                                            {business.name?.charAt(0).toUpperCase()}
                                        </LogoPlaceholder>
                                    )}
                                </div>
                                {hasPermission(
                                    userRole,
                                    MenuName.BUSINESS,
                                    ActionType.BUSINESS_MARQUER_ACTIVE
                                ) && (
                                        <StatusCircleWrapper>
                                            <StatusCircle
                                                isActive={business.is_active}
                                                onClick={() => handleMarkActive(business.id)}
                                                title={business.is_active ? 'Deactivate' : 'Activate'}
                                            >
                                                <FiCheck />
                                            </StatusCircle>
                                            <StatusLabel isActive={business.is_active}>
                                                {business.is_active ? 'Active' : 'Inactive'}
                                            </StatusLabel>
                                        </StatusCircleWrapper>
                                    )}
                            </CardHeader>

                            <CardTitle>{business.name}</CardTitle>

                            <CardInfo>
                                {business.nui && (
                                    <InfoItem>
                                        <label>NUI</label>
                                        <span>{business.nui}</span>
                                    </InfoItem>
                                )}
                                {business.commerce_register && (
                                    <InfoItem>
                                        <label>Registre de Commerce</label>
                                        <span>{business.commerce_register}</span>
                                    </InfoItem>
                                )}
                                {business.website && (
                                    <InfoItem>
                                        <label>Site Web</label>
                                        <span style={{ color: '#007bff' }}>{business.website}</span>
                                    </InfoItem>
                                )}
                            </CardInfo>

                            {hasPermission(
                                userRole,
                                MenuName.BUSINESS,
                                ActionType.BUSINESS_UPLOADER_DOCUMENTS
                            ) && (
                                    <DocumentsProgress>
                                        <DocumentsProgressTitle>Documents ({Math.round(getDocumentsProgress(business))}%)</DocumentsProgressTitle>
                                        <DocumentsProgressBar>
                                            <DocumentIndicator completed={!!business.nui_document} />
                                            <DocumentIndicator completed={!!business.commerce_register_document} />
                                            <DocumentIndicator completed={!!business.website_document} />
                                            <DocumentIndicator completed={!!business.creation_document} />
                                        </DocumentsProgressBar>
                                        <DocumentsList style={{ marginTop: '0.75rem' }}>
                                            <DocumentItem completed={!!business.nui_document}>
                                                <FiCheck size={14} /> NUI Document
                                            </DocumentItem>
                                            <DocumentItem completed={!!business.commerce_register_document}>
                                                <FiCheck size={14} /> Commerce Registry
                                            </DocumentItem>
                                            <DocumentItem completed={!!business.website_document}>
                                                <FiCheck size={14} /> Website Certificate
                                            </DocumentItem>
                                            <DocumentItem completed={!!business.creation_document}>
                                                <FiCheck size={14} /> Creation Document
                                            </DocumentItem>
                                        </DocumentsList>
                                    </DocumentsProgress>
                                )}

                            <StatusBadge status={getStatus(business)}>
                                {getStatus(business) === 'verified'
                                    ? 'Verified'
                                    : getStatus(business) === 'blocked'
                                        ? 'Blocked'
                                        : 'Pending'}
                            </StatusBadge>

                            <CardActions>
                                {hasPermission(
                                    userRole,
                                    MenuName.BUSINESS,
                                    ActionType.BUSINESS_EDIT
                                ) && (
                                        <ActionButton
                                            title="Edit"
                                            onClick={() => handleEdit(business.id)}
                                        >
                                            <FiEdit /> Edit
                                        </ActionButton>
                                    )}

                                {hasPermission(
                                    userRole,
                                    MenuName.BUSINESS,
                                    ActionType.BUSINESS_BLOQUER
                                ) && (
                                        <ActionButton
                                            title={
                                                business.is_blocked ? 'Unblock' : 'Block'
                                            }
                                            variant={business.is_blocked ? 'success' : 'danger'}
                                            onClick={() =>
                                                handleBlock(business.id, business.is_blocked)
                                            }
                                        >
                                            {business.is_blocked ? <FiUnlock /> : <FiLock />}
                                            {business.is_blocked ? 'Unblock' : 'Block'}
                                        </ActionButton>
                                    )}

                                {hasPermission(
                                    userRole,
                                    MenuName.BUSINESS,
                                    ActionType.BUSINESS_DELETE
                                ) && (
                                        <ActionButton
                                            title="Delete"
                                            variant="danger"
                                            onClick={() => handleDelete(business.id)}
                                        >
                                            <FiTrash2 /> Delete
                                        </ActionButton>
                                    )}

                                {hasPermission(
                                    userRole,
                                    MenuName.BUSINESS,
                                    ActionType.BUSINESS_UPLOADER_DOCUMENTS
                                ) && (
                                        <ActionButton
                                            title="Upload documents"
                                            onClick={() => handleUploadDocuments(business)}
                                        >
                                            <FiUpload /> Documents
                                        </ActionButton>
                                    )}

                                {hasPermission(
                                    userRole,
                                    MenuName.BUSINESS,
                                    ActionType.BUSINESS_ASSOCIER
                                ) && (
                                        <ActionButton
                                            onClick={() => handleAssociate(business.id)}
                                        >
                                            Associate
                                        </ActionButton>
                                    )}
                            </CardActions>
                        </BusinessCard>
                    ))}
                </CardsGrid>
            )}

            <DocumentUploadModal
                isOpen={isDocumentModalOpen}
                businessName={selectedBusinessForDocs?.name || ''}
                documents={{
                    nui_document: selectedBusinessForDocs?.nui_document,
                    commerce_register_document: selectedBusinessForDocs?.commerce_register_document,
                    website_document: selectedBusinessForDocs?.website_document,
                    creation_document: selectedBusinessForDocs?.creation_document,
                }}
                onClose={() => {
                    setIsDocumentModalOpen(false);
                    setSelectedBusinessForDocs(null);
                }}
                onSubmit={handleDocumentsSubmit}
            />

            <LogoUploadModal
                isOpen={isLogoModalOpen}
                businessName={selectedBusinessForLogo?.name || ''}
                currentLogo={selectedBusinessForLogo?.logo}
                onClose={() => {
                    setIsLogoModalOpen(false);
                    setSelectedBusinessForLogo(null);
                }}
                onSubmit={handleLogoSubmit}
            />
        </Container>
    );
};

export default Business;
