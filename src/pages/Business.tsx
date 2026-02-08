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
import {
  FiEdit,
  FiTrash2,
  FiLock,
  FiUnlock,
  FiUpload,
  FiCheck,
  FiPlus,
  FiSearch,
} from 'react-icons/fi';

interface BusinessPageProps {
  userRole: UserRole;
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

const TableContainer = styled.div`
  overflow-x: auto;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    border-radius: 6px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;

  thead {
    background-color: #f8f9fa;
    border-bottom: 2px solid #dee2e6;
  }

  th {
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    color: #495057;
    font-size: 0.95rem;
    white-space: nowrap;

    @media (max-width: 768px) {
      padding: 0.75rem;
      font-size: 0.85rem;
    }
  }

  td {
    padding: 1rem;
    border-bottom: 1px solid #dee2e6;
    color: #495057;
    font-size: 0.95rem;

    @media (max-width: 768px) {
      padding: 0.75rem;
      font-size: 0.85rem;
    }
  }

  tbody tr {
    transition: background-color 0.2s ease;

    &:hover {
      background-color: #f8f9fa;
    }
  }
`;

const LogoCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Logo = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 4px;
  background: #f0f0f0;
  object-fit: cover;

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
  }
`;

const LogoPlaceholder = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 4px;
  background: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 0.8rem;
  font-weight: bold;

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
  }
`;

const Status = styled.span<{ status: 'verified' | 'pending' | 'blocked' }>`
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;

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

const ActionsCell = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const IconButton = styled.button<{ variant?: 'default' | 'danger' | 'success' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
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

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    font-size: 0.85rem;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #999;
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

export const Business: React.FC<BusinessPageProps> = ({ userRole }) => {
  const [businesses, setBusinesses] = useState<BusinessType[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<BusinessType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  }, [searchTerm, businesses]);

  const filterBusinesses = () => {
    const term = searchTerm.toLowerCase();
    const filtered = businesses.filter(
      (b) =>
        b.name?.toLowerCase().includes(term) ||
        b.nui?.toLowerCase().includes(term) ||
        b.commerce_register?.toLowerCase().includes(term)
    );
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

  const handleUploadDocuments = (id: string) => {
    console.log('Uploader documents pour:', id);
    // TODO: Implémenter upload de documents
  };

  const handleMarkActive = (id: string) => {
    setBusinesses(
      businesses.map((b) =>
        b.id === id ? { ...b, is_verified: true } : b
      )
    );
  };

  const handleAssociate = (id: string) => {
    console.log('Associer à client:', id);
    // TODO: Implémenter association
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
        <Title>Entreprises</Title>
        {hasPermission(userRole, MenuName.BUSINESS, ActionType.BUSINESS_CREATE) && (
          <Button variant="primary" onClick={handleCreate}>
            <FiPlus /> Créer
          </Button>
        )}
      </Header>

      <SearchContainer>
        <SearchIcon>
          <FiSearch />
        </SearchIcon>
        <SearchInput
          type="text"
          placeholder="Rechercher par nom, NUI ou registre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SearchContainer>

      {error && (
        <div style={{ color: '#dc3545', marginBottom: '1rem', padding: '1rem', backgroundColor: '#f8d7da', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <LoadingContainer>Chargement en cours...</LoadingContainer>
      ) : filteredBusinesses.length === 0 ? (
        <EmptyState>
          <h3>Aucune entreprise trouvée</h3>
          <p>{searchTerm ? 'Aucun résultat pour votre recherche' : 'Commencez par créer une nouvelle entreprise'}</p>
        </EmptyState>
      ) : (
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <th>Entreprise</th>
                <th>NUI</th>
                <th>Registre de Commerce</th>
                <th>Statut</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBusinesses.map((business) => (
                <tr key={business.id}>
                  <td>
                    <LogoCell>
                      {business.logo ? (
                        <Logo src={business.logo} alt={business.name} />
                      ) : (
                        <LogoPlaceholder>
                          {business.name?.charAt(0).toUpperCase()}
                        </LogoPlaceholder>
                      )}
                      <span>{business.name}</span>
                    </LogoCell>
                  </td>
                  <td>{business.nui || '-'}</td>
                  <td>{business.commerce_register || '-'}</td>
                  <td>
                    <Status status={getStatus(business)}>
                      {getStatus(business) === 'verified'
                        ? 'Vérifiée'
                        : getStatus(business) === 'blocked'
                          ? 'Bloquée'
                          : 'En attente'}
                    </Status>
                  </td>
                  <td>
                    <ActionsCell>
                      {hasPermission(
                        userRole,
                        MenuName.BUSINESS,
                        ActionType.BUSINESS_EDIT
                      ) && (
                        <IconButton
                          title="Éditer"
                          onClick={() => handleEdit(business.id)}
                        >
                          <FiEdit />
                        </IconButton>
                      )}

                      {hasPermission(
                        userRole,
                        MenuName.BUSINESS,
                        ActionType.BUSINESS_BLOQUER
                      ) && (
                        <IconButton
                          title={
                            business.is_blocked ? 'Débloquer' : 'Bloquer'
                          }
                          variant={business.is_blocked ? 'success' : 'danger'}
                          onClick={() =>
                            handleBlock(business.id, business.is_blocked)
                          }
                        >
                          {business.is_blocked ? <FiUnlock /> : <FiLock />}
                        </IconButton>
                      )}

                      {hasPermission(
                        userRole,
                        MenuName.BUSINESS,
                        ActionType.BUSINESS_DELETE
                      ) && (
                        <IconButton
                          title="Supprimer"
                          variant="danger"
                          onClick={() => handleDelete(business.id)}
                        >
                          <FiTrash2 />
                        </IconButton>
                      )}

                      {hasPermission(
                        userRole,
                        MenuName.BUSINESS,
                        ActionType.BUSINESS_UPLOADER_DOCUMENTS
                      ) && (
                        <IconButton
                          title="Uploader documents"
                          onClick={() => handleUploadDocuments(business.id)}
                        >
                          <FiUpload />
                        </IconButton>
                      )}

                      {hasPermission(
                        userRole,
                        MenuName.BUSINESS,
                        ActionType.BUSINESS_MARQUER_ACTIVE
                      ) && (
                        <IconButton
                          title="Marquer comme actif"
                          variant="success"
                          onClick={() => handleMarkActive(business.id)}
                          disabled={business.is_verified}
                        >
                          <FiCheck />
                        </IconButton>
                      )}

                      {hasPermission(
                        userRole,
                        MenuName.BUSINESS,
                        ActionType.BUSINESS_ASSOCIER
                      ) && (
                        <Button
                          onClick={() => handleAssociate(business.id)}
                          style={{
                            padding: '0.4rem 0.8rem',
                            fontSize: '0.75rem',
                          }}
                        >
                          Associer
                        </Button>
                      )}
                    </ActionsCell>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default Business;
