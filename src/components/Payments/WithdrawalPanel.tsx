import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { colors, spacing } from '../../config/theme';
import { useWithdrawal } from '../../hooks/useWithdrawal';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../LoadingSpinner';

const PanelContainer = styled.div`
  padding: ${spacing.lg} 0;
`;

const StatsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${spacing.lg};
  margin-bottom: ${spacing.xl};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, ${colors.primary}15 0%, ${colors.primary}05 100%);
  border: 1px solid ${colors.primary}30;
  border-radius: 12px;
  padding: ${spacing.lg};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .stat-label {
    font-size: 0.85rem;
    color: ${colors.textSecondary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: ${spacing.sm};
    font-weight: 600;
  }

  .stat-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: ${colors.primary};
    margin-bottom: ${spacing.xs};
  }

  .stat-subtext {
    font-size: 0.75rem;
    color: ${colors.textSecondary};
  }
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

interface WithdrawalStats {
    balance: number;
    totalPayments: number;
    lastWithdrawal: string | null;
}

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
    const [stats, setStats] = useState<WithdrawalStats>({
        balance: 100000,
        totalPayments: 0,
        lastWithdrawal: null,
    });
    const [formData, setFormData] = useState({
        account_type: 'bank_account',
        provider: '',
        account_number: '',
        account_name: '',
        details: {},
    });

    useEffect(() => {
        getWithdrawalAccounts();

        // Calculate stats
        if (withdrawalAccounts.length > 0) {
            // Find last withdrawal (most recent created_at)
            const sortedByDate = [...withdrawalAccounts].sort((a, b) => {
                const dateA = new Date(a.created_at || 0).getTime();
                const dateB = new Date(b.created_at || 0).getTime();
                return dateB - dateA;
            });

            const lastDate = sortedByDate[0]?.created_at;

            setStats(prev => ({
                ...prev,
                totalPayments: withdrawalAccounts.length,
                lastWithdrawal: lastDate ? new Date(lastDate).toLocaleDateString() : null,
            }));
        }
    }, [withdrawalAccounts.length]);

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
                account_type: 'bank_account',
                provider: '',
                account_number: '',
                account_name: '',
                details: {},
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
            <StatsSection>
                <StatCard>
                    <div className="stat-label">Balance</div>
                    <div className="stat-value">${stats.balance.toLocaleString()}</div>
                    <div className="stat-subtext">Available balance</div>
                </StatCard>
                <StatCard>
                    <div className="stat-label">Total Payments</div>
                    <div className="stat-value">{stats.totalPayments}</div>
                    <div className="stat-subtext">Withdrawal accounts</div>
                </StatCard>
                <StatCard>
                    <div className="stat-label">Last Withdrawal</div>
                    <div className="stat-value">{stats.lastWithdrawal || 'N/A'}</div>
                    <div className="stat-subtext">Most recent account</div>
                </StatCard>
            </StatsSection>

            {error && <ErrorMessage>{error}</ErrorMessage>}
            {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}

            {showForm && (
                <FormContainer>
                    <Title>Add Withdrawal Account</Title>
                    <form onSubmit={handleSubmit}>
                        <FormGroup>
                            <label>Account Type *</label>
                            <select
                                name="account_type"
                                value={formData.account_type}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="mobile_money">Mobile Money</option>
                                <option value="bank_account">Bank Account</option>
                                <option value="wallet">Wallet</option>
                                <option value="other">Other</option>
                            </select>
                        </FormGroup>

                        <FormGroup>
                            <label>Provider/Bank Name *</label>
                            <input
                                type="text"
                                name="provider"
                                value={formData.provider}
                                onChange={handleInputChange}
                                placeholder="e.g., MTN Mobile Money, Orange Money, Bank Name"
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
                            <label>Account Name</label>
                            <input
                                type="text"
                                name="account_name"
                                value={formData.account_name}
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
                            <CardTitle>{account.account_name || account.provider}</CardTitle>
                            <CardInfo>
                                <InfoRow>
                                    <span>Type:</span>
                                    <strong>{account.account_type}</strong>
                                </InfoRow>
                                <InfoRow>
                                    <span>Provider:</span>
                                    <strong>{account.provider}</strong>
                                </InfoRow>
                                <InfoRow>
                                    <span>Account:</span>
                                    <strong>{account.account_number}</strong>
                                </InfoRow>
                                <InfoRow>
                                    <span>Status:</span>
                                    <StatusBadge status={account.verification_status}>
                                        {account.verification_status}
                                    </StatusBadge>
                                </InfoRow>
                                {account.is_verified && (
                                    <InfoRow>
                                        <span>Verified:</span>
                                        <strong>✓</strong>
                                    </InfoRow>
                                )}
                            </CardInfo>
                            <CardActions>
                                {account.verification_status === 'pending' && user?.is_superuser && (
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
