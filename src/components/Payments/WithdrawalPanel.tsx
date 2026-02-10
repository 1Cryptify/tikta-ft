import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { colors, spacing } from '../../config/theme';
import { useWithdrawal } from '../../hooks/useWithdrawal';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../LoadingSpinner';

const PanelContainer = styled.div`
  padding: ${spacing.lg} 0;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${spacing.lg};
`;

const Title = styled.h2`
  font-size: 1.25rem;
  color: ${colors.textPrimary};
  margin: 0;
`;

const AddButton = styled.button`
  padding: ${spacing.sm} ${spacing.md};
  background-color: ${colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    background-color: ${colors.primaryDark || colors.primary}99;
  }
`;

const ErrorMessage = styled.div`
  padding: ${spacing.md};
  background-color: ${colors.error}20;
  border: 1px solid ${colors.error};
  border-radius: 8px;
  color: ${colors.error};
  margin-bottom: ${spacing.lg};
`;

const SuccessMessage = styled.div`
  padding: ${spacing.md};
  background-color: ${colors.success}20;
  border: 1px solid ${colors.success};
  border-radius: 8px;
  color: ${colors.success};
  margin-bottom: ${spacing.lg};
`;

const CardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${spacing.lg};
`;

const Card = styled.div`
  background: white;
  border: 1px solid ${colors.border};
  border-radius: 8px;
  padding: ${spacing.lg};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }
`;

const CardTitle = styled.h3`
  font-size: 1rem;
  color: ${colors.textPrimary};
  margin: 0 0 ${spacing.sm} 0;
`;

const CardInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
  margin-bottom: ${spacing.lg};
  font-size: 0.875rem;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  color: ${colors.textSecondary};

  strong {
    color: ${colors.textPrimary};
  }
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: ${spacing.xs} ${spacing.sm};
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  width: fit-content;
  background-color: ${props => {
    switch (props.status) {
      case 'verified':
        return `${colors.success}20`;
      case 'pending':
        return `${colors.warning}20`;
      case 'rejected':
        return `${colors.error}20`;
      default:
        return colors.backgroundSecondary;
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'verified':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'rejected':
        return colors.error;
      default:
        return colors.textPrimary;
    }
  }};
`;

const CardActions = styled.div`
  display: flex;
  gap: ${spacing.sm};
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  padding: ${spacing.xs} ${spacing.sm};
  border: 1px solid ${colors.border};
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.3s ease;

  &:hover {
    background-color: ${colors.backgroundSecondary};
  }

  &.danger {
    border-color: ${colors.error};
    color: ${colors.error};

    &:hover {
      background-color: ${colors.error}10;
    }
  }

  &.success {
    border-color: ${colors.success};
    color: ${colors.success};

    &:hover {
      background-color: ${colors.success}10;
    }
  }
`;

const EmptyState = styled.div`
  padding: ${spacing.xl};
  text-align: center;
  color: ${colors.textSecondary};
`;

const FormContainer = styled.div`
  background: white;
  border: 1px solid ${colors.border};
  border-radius: 8px;
  padding: ${spacing.lg};
  margin-bottom: ${spacing.lg};
`;

const FormGroup = styled.div`
  margin-bottom: ${spacing.md};

  label {
    display: block;
    margin-bottom: ${spacing.xs};
    color: ${colors.textPrimary};
    font-weight: 500;
  }

  input,
  select {
    width: 100%;
    padding: ${spacing.sm};
    border: 1px solid ${colors.border};
    border-radius: 4px;
    font-size: 1rem;
    color: ${colors.textPrimary};

    &:focus {
      outline: none;
      border-color: ${colors.primary};
      box-shadow: 0 0 0 3px ${colors.primary}20;
    }
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: ${spacing.md};
`;

const SubmitButton = styled.button`
  padding: ${spacing.sm} ${spacing.md};
  background-color: ${colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    background-color: ${colors.primaryDark || colors.primary}99;
  }
`;

const CancelButton = styled.button`
  padding: ${spacing.sm} ${spacing.md};
  background-color: transparent;
  color: ${colors.textSecondary};
  border: 1px solid ${colors.border};
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    background-color: ${colors.backgroundSecondary};
  }
`;

export const WithdrawalPanel: React.FC = () => {
  const { user } = useAuth();
  const {
    withdrawalAccounts,
    isLoading,
    error,
    successMessage,
    getWithdrawalAccounts,
    createWithdrawalAccount,
    deleteWithdrawalAccount,
    verifyWithdrawalAccount,
  } = useWithdrawal();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    account_holder_name: '',
    account_number: '',
    bank_name: '',
    bank_code: '',
    branch_code: '',
    swift_code: '',
    iban: '',
    currency_code: '',
  });

  useEffect(() => {
    getWithdrawalAccounts();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createWithdrawalAccount(formData);
    if (result) {
      setFormData({
        account_holder_name: '',
        account_number: '',
        bank_name: '',
        bank_code: '',
        branch_code: '',
        swift_code: '',
        iban: '',
        currency_code: '',
      });
      setShowForm(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this withdrawal account?')) {
      await deleteWithdrawalAccount(id);
    }
  };

  const handleVerify = async (id: string) => {
    const result = await verifyWithdrawalAccount(id);
    if (result) {
      await getWithdrawalAccounts();
    }
  };

  return (
    <PanelContainer>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}

      {showForm && (
        <FormContainer>
          <Title>Add Withdrawal Account</Title>
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <label>Account Holder Name *</label>
              <input
                type="text"
                name="account_holder_name"
                value={formData.account_holder_name}
                onChange={handleInputChange}
                required
              />
            </FormGroup>

            <FormGroup>
              <label>Account Number *</label>
              <input
                type="text"
                name="account_number"
                value={formData.account_number}
                onChange={handleInputChange}
                required
              />
            </FormGroup>

            <FormGroup>
              <label>Bank Name *</label>
              <input
                type="text"
                name="bank_name"
                value={formData.bank_name}
                onChange={handleInputChange}
                required
              />
            </FormGroup>

            <FormGroup>
              <label>Bank Code</label>
              <input
                type="text"
                name="bank_code"
                value={formData.bank_code}
                onChange={handleInputChange}
              />
            </FormGroup>

            <FormGroup>
              <label>Branch Code</label>
              <input
                type="text"
                name="branch_code"
                value={formData.branch_code}
                onChange={handleInputChange}
              />
            </FormGroup>

            <FormGroup>
              <label>SWIFT Code</label>
              <input
                type="text"
                name="swift_code"
                value={formData.swift_code}
                onChange={handleInputChange}
              />
            </FormGroup>

            <FormGroup>
              <label>IBAN</label>
              <input
                type="text"
                name="iban"
                value={formData.iban}
                onChange={handleInputChange}
              />
            </FormGroup>

            <FormGroup>
              <label>Currency Code</label>
              <input
                type="text"
                name="currency_code"
                value={formData.currency_code}
                onChange={handleInputChange}
              />
            </FormGroup>

            <FormActions>
              <SubmitButton type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Account'}
              </SubmitButton>
              <CancelButton type="button" onClick={() => setShowForm(false)}>
                Cancel
              </CancelButton>
            </FormActions>
          </form>
        </FormContainer>
      )}

      <HeaderSection>
        <Title>Withdrawal Accounts</Title>
        {!showForm && (
          <AddButton onClick={() => setShowForm(true)}>
            + Add Account
          </AddButton>
        )}
      </HeaderSection>

      {isLoading ? (
        <LoadingSpinner />
      ) : withdrawalAccounts.length === 0 ? (
        <EmptyState>No withdrawal accounts found</EmptyState>
      ) : (
        <CardContainer>
          {withdrawalAccounts.map(account => (
            <Card key={account.id}>
              <CardTitle>{account.account_holder_name}</CardTitle>
              <CardInfo>
                <InfoRow>
                  <span>Account:</span>
                  <strong>{account.account_number}</strong>
                </InfoRow>
                <InfoRow>
                  <span>Bank:</span>
                  <strong>{account.bank_name}</strong>
                </InfoRow>
                <InfoRow>
                  <span>Status:</span>
                  <StatusBadge status={account.status}>
                    {account.status}
                  </StatusBadge>
                </InfoRow>
                {account.currency_code && (
                  <InfoRow>
                    <span>Currency:</span>
                    <strong>{account.currency_code}</strong>
                  </InfoRow>
                )}
              </CardInfo>
              <CardActions>
                {account.status === 'pending' && user?.is_superuser && (
                  <ActionButton
                    className="success"
                    onClick={() => handleVerify(account.id)}
                  >
                    Verify
                  </ActionButton>
                )}
                <ActionButton
                  className="danger"
                  onClick={() => handleDelete(account.id)}
                >
                  Delete
                </ActionButton>
              </CardActions>
            </Card>
          ))}
        </CardContainer>
      )}
    </PanelContainer>
  );
};
