import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiX, FiLink2, FiMinusCircle, FiSearch, FiUsers } from 'react-icons/fi';
import { Business, BusinessUser } from '../hooks/useBusiness';

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  is_associated?: boolean;
}

interface BusinessAssociateModalProps {
  isOpen: boolean;
  business: Business | null;
  onClose: () => void;
  onAssociate?: (userId: string) => Promise<void>;
  onDisassociate?: (userId: string) => Promise<void>;
  clients?: Client[];
  associatedUsers?: BusinessUser[];
  showExistingUsers?: boolean;
}

const ModalOverlay = styled.div<{ isOpen: boolean }>`
  display: ${(props) => (props.isOpen ? 'flex' : 'none')};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${(props) => (props.isOpen ? 'fadeIn' : 'fadeOut')} 0.3s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from {
      transform: translateY(30px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
    width: 95%;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 1rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
`;

const ModalSubtitle = styled.p`
  margin: 0.5rem 0 0 0;
  color: #999;
  font-size: 0.9rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
  transition: color 0.3s ease;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #1a1a1a;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 2rem;
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

const ClientsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const ClientCard = styled.div<{ selected?: boolean }>`
  padding: 1rem;
  border: 2px solid ${(props) => (props.selected ? '#007bff' : '#ddd')};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${(props) => (props.selected ? '#f0f6ff' : 'white')};

  &:hover {
    border-color: #007bff;
    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.1);
  }
`;

const ClientName = styled.h4`
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  color: #1a1a1a;
  font-weight: 600;
`;

const ClientInfo = styled.p`
  margin: 0.25rem 0 0 0;
  font-size: 0.85rem;
  color: #999;
`;

const AssociatedBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: #d4edda;
  color: #155724;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 0.5rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #999;

  h4 {
    margin: 0 0 0.5rem 0;
    color: #495057;
  }

  p {
    margin: 0;
    font-size: 0.9rem;
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: 1rem;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  ${(props) => {
    switch (props.variant) {
      case 'primary':
        return `
          background-color: #007bff;
          color: white;
          border: none;

          &:hover:not(:disabled) {
            background-color: #0056b3;
            box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
          }

          &:disabled {
            background-color: #ccc;
            cursor: not-allowed;
          }
        `;
      default:
        return `
          background-color: white;
          color: #495057;
          border: 1px solid #dee2e6;

          &:hover {
            background-color: #f8f9fa;
            border-color: #999;
          }
        `;
    }
  }}

  @media (max-width: 480px) {
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
  }
`;

const ErrorMessage = styled.div`
  padding: 1rem;
  background: #f8d7da;
  color: #721c24;
  border-left: 4px solid #dc3545;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
`;

const SuccessMessage = styled.div`
  padding: 1rem;
  background: #d4edda;
  color: #155724;
  border-left: 4px solid #28a745;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #f0f0f0;
`;

const Tab = styled.button<{ active?: boolean }>`
  flex: 1;
  padding: 1rem;
  border: none;
  background: ${(props) => (props.active ? '#007bff' : 'transparent')};
  color: ${(props) => (props.active ? 'white' : '#666')};
  cursor: pointer;
  border-radius: 6px 6px 0 0;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background: ${(props) => (props.active ? '#0056b3' : '#f0f0f0')};
  }
`;

const UserCard = styled.div<{ isAssociated?: boolean }>`
  padding: 1rem;
  border: 2px solid ${(props) => (props.isAssociated ? '#28a745' : '#ddd')};
  border-radius: 8px;
  background: ${(props) => (props.isAssociated ? '#f1f9f5' : 'white')};
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${(props) => (props.isAssociated ? '#28a745' : '#007bff')};
    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.1);
  }
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserEmail = styled.p`
  margin: 0;
  font-weight: 600;
  color: #1a1a1a;
`;

const UserMeta = styled.p`
  margin: 0.25rem 0 0 0;
  font-size: 0.85rem;
  color: #999;
`;

const UserActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export const BusinessAssociateModal: React.FC<BusinessAssociateModalProps> = ({
  isOpen,
  business,
  onClose,
  onAssociate,
  onDisassociate,
  clients = [],
  associatedUsers = [],
  showExistingUsers = false,
}) => {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'add' | 'list'>('add');

  useEffect(() => {
    if (isOpen) {
      setSelectedClientId(null);
      setSearchTerm('');
      setError(null);
      setSuccess(null);
      // Si on a des utilisateurs existants, montrer l'onglet "list"
      if (showExistingUsers && associatedUsers.length > 0) {
        setActiveTab('list');
      } else {
        setActiveTab('add');
      }
    }
  }, [isOpen, associatedUsers.length, showExistingUsers]);

  const filteredClients = clients.filter(
    (client) =>
      client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.includes(searchTerm)
  );

  const handleAssociate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClientId) {
      setError('Please select a user');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (onAssociate) {
        await onAssociate(selectedClientId);
        setSuccess(`User successfully associated with ${business?.name}`);
        setSelectedClientId(null);
        setSearchTerm('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to associate user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisassociate = async (userId: string) => {
    if (!window.confirm('Are you sure you want to disassociate this user?')) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (onDisassociate) {
        await onDisassociate(userId);
        setSuccess('User successfully disassociated');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disassociate user');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <div>
            <ModalTitle>Manage Business Users</ModalTitle>
            <ModalSubtitle>{business?.name}</ModalSubtitle>
          </div>
          <CloseButton onClick={onClose}>
            <FiX />
          </CloseButton>
        </ModalHeader>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        {showExistingUsers && associatedUsers.length > 0 && (
          <TabContainer>
            <Tab
              active={activeTab === 'add'}
              onClick={() => setActiveTab('add')}
            >
              <FiLink2 /> Add User
            </Tab>
            <Tab
              active={activeTab === 'list'}
              onClick={() => setActiveTab('list')}
            >
              <FiUsers /> {associatedUsers.length} Associated
            </Tab>
          </TabContainer>
        )}

        {activeTab === 'add' && (
          <form onSubmit={handleAssociate}>
            <SearchContainer>
              <SearchIcon>
                <FiSearch />
              </SearchIcon>
              <SearchInput
                type="text"
                placeholder="Search users by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isSubmitting || clients.length === 0}
              />
            </SearchContainer>

            <ClientsList>
              {filteredClients.length === 0 ? (
                <EmptyState>
                  <h4>No users found</h4>
                  <p>
                    {clients.length === 0
                      ? 'No users available.'
                      : 'No users match your search.'}
                  </p>
                </EmptyState>
              ) : (
                filteredClients.map((client) => (
                  <ClientCard
                    key={client.id}
                    selected={selectedClientId === client.id}
                    onClick={() => {
                      if (!isSubmitting) {
                        setSelectedClientId(client.id);
                      }
                    }}
                  >
                    <ClientName>
                      {client.name}
                      {client.is_associated && <AssociatedBadge>Associated</AssociatedBadge>}
                    </ClientName>
                    {client.email && <ClientInfo>Email: {client.email}</ClientInfo>}
                    {client.phone && <ClientInfo>Phone: {client.phone}</ClientInfo>}
                  </ClientCard>
                ))
              )}
            </ClientsList>

            <FormActions>
              <Button
                variant="secondary"
                type="button"
                onClick={onClose}
                disabled={isSubmitting || clients.length === 0}
              >
                <FiX /> Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={isSubmitting || !selectedClientId || clients.length === 0}
              >
                <FiLink2 /> {isSubmitting ? 'Adding...' : 'Add User'}
              </Button>
            </FormActions>
          </form>
        )}

        {activeTab === 'list' && (
          <div>
            <ClientsList>
              {associatedUsers.length === 0 ? (
                <EmptyState>
                  <h4>No associated users</h4>
                  <p>No users are currently associated with this business.</p>
                </EmptyState>
              ) : (
                associatedUsers.map((user) => (
                  <UserCard key={user.user_id} isAssociated={true}>
                    <UserInfo>
                      <UserEmail>{user.email}</UserEmail>
                      <UserMeta>
                        {user.is_staff && '👤 Staff'} {user.is_verified && '✓ Verified'}
                      </UserMeta>
                    </UserInfo>
                    <UserActions>
                      <Button
                        variant="secondary"
                        type="button"
                        onClick={() => handleDisassociate(user.user_id)}
                        disabled={isSubmitting}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                      >
                        <FiMinusCircle /> Remove
                      </Button>
                    </UserActions>
                  </UserCard>
                ))
              )}
            </ClientsList>

            <FormActions>
              <Button
                variant="secondary"
                type="button"
                onClick={onClose}
                style={{ flex: 1 }}
              >
                <FiX /> Close
              </Button>
            </FormActions>
          </div>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

export default BusinessAssociateModal;
