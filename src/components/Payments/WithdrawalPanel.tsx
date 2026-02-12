import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { colors, spacing } from '../../config/theme';
import { useWithdrawal, PaymentMethod, Company, Currency } from '../../hooks/useWithdrawal';
import { useAuth } from '../../hooks/useAuth';
import { API_PAYMENTS_BASE_URL } from '../../services/api';
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

const StatsAction = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-top: ${spacing.lg};
  margin-bottom: ${spacing.xl};
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

const WithdrawalButton = styled(AddButton)`
  padding: ${spacing.md} ${spacing.lg};
  font-size: 1rem;
  font-weight: 600;
  min-width: 250px;
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
                return colors.neutral;
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
   align-items: center;
`;

const LinkMethodSelect = styled.select`
   padding: ${spacing.xs} ${spacing.sm};
   border-radius: 4px;
   border: 1px solid ${colors.primary};
   color: ${colors.primary};
   font-size: 0.875rem;
   cursor: pointer;
   background-color: white;
   transition: all 0.3s ease;

   &:hover {
     background-color: ${colors.primary}10;
   }

   &:focus {
     outline: none;
     box-shadow: 0 0 0 3px ${colors.primary}20;
   }
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
    background-color: ${colors.neutral};
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

   &.primary {
     border-color: ${colors.primary};
     background-color: ${colors.primary};
     color: white;

     &:hover {
       background-color: ${colors.primaryDark || colors.primary}99;
     }
   }
`;

const ModalOverlay = styled.div`
   position: fixed;
   top: 0;
   left: 0;
   right: 0;
   bottom: 0;
   background-color: rgba(0, 0, 0, 0.5);
   display: flex;
   align-items: center;
   justify-content: center;
   z-index: 1000;
`;

const ModalContent = styled.div`
   background: white;
   border-radius: 12px;
   padding: ${spacing.xl};
   max-width: 500px;
   width: 90%;
   max-height: 80vh;
   overflow-y: auto;
   box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
   display: flex;
   justify-content: space-between;
   align-items: center;
   margin-bottom: ${spacing.lg};
   border-bottom: 1px solid ${colors.border};
   padding-bottom: ${spacing.md};

   h2 {
     margin: 0;
     font-size: 1.25rem;
     color: ${colors.textPrimary};
   }
`;

const CloseButton = styled.button`
   background: none;
   border: none;
   font-size: 1.5rem;
   cursor: pointer;
   color: ${colors.textSecondary};

   &:hover {
     color: ${colors.textPrimary};
   }
`;

const ModalFooter = styled.div`
   display: flex;
   gap: ${spacing.md};
   margin-top: ${spacing.lg};
   justify-content: flex-end;
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

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${spacing.md};
  margin-bottom: ${spacing.md};
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
    background-color: ${colors.neutral};
  }
  `;

interface WithdrawalStats {
    availableBalance: number;
    totalDeposits: number;
    totalWithdrawals: number;
    currency: Currency | null;
    currencyCode: string | null;
    currencySymbol: string | null;
    totalPayments: number;
    lastWithdrawal: string | null;
}

interface FormDataType {
    account_type: string;
    provider: string;
    account_number: string;
    account_name: string;
    payment_method: string;
    company_id?: string;
    details: Record<string, any>;
}

interface WithdrawalRequestData {
    account_id: string;
    amount: number;
    currency: string;
}

export const WithdrawalPanel: React.FC = () => {
     const { user } = useAuth();
     const {
         withdrawalAccounts,
         balance,
         isLoading,
         error,
         successMessage,
         getWithdrawalAccounts,
         createWithdrawalAccount,
         deleteWithdrawalAccount,
         verifyWithdrawalAccount,
         linkPaymentMethod,
         unlinkPaymentMethod,
         getCompanies,
         getBalance,
         adminSetRecipientId,
         adminActivatePaymentAccount,
         initiateWithdrawal,
         verifyWithdrawalStatus,
     } = useWithdrawal();

    const [showForm, setShowForm] = useState(false);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);
    const [loadingCompanies, setLoadingCompanies] = useState(false);
    const [loadingCurrencies, setLoadingCurrencies] = useState(false);
    const [linkedPaymentMethod, setLinkedPaymentMethod] = useState<Record<string, string | null>>({});
    const [stats, setStats] = useState<WithdrawalStats>({
        availableBalance: 0,
        totalDeposits: 0,
        totalWithdrawals: 0,
        currency: null,
        currencyCode: null,
        currencySymbol: null,
        totalPayments: 0,
        lastWithdrawal: null,
    });
    const [formData, setFormData] = useState<FormDataType>({
        account_type: 'bank_account',
        provider: '',
        account_number: '',
        account_name: '',
        payment_method: '',
        company_id: undefined,
        details: {},
    });
    const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
    const [withdrawalData, setWithdrawalData] = useState<WithdrawalRequestData>({
        account_id: '',
        amount: 0,
        currency: 'USD',
    });
    const [isProcessingWithdrawal, setIsProcessingWithdrawal] = useState(false);
    const [showAdminActionsModal, setShowAdminActionsModal] = useState(false);
    const [selectedAccountForAdmin, setSelectedAccountForAdmin] = useState<any | null>(null);
    const [adminAction, setAdminAction] = useState<'activate' | 'set_recipient' | null>(null);
    const [adminRecipientId, setAdminRecipientId] = useState('');
    const [withdrawalToVerify, setWithdrawalToVerify] = useState<any | null>(null);

    // Update withdrawal currency when balance currency changes
    useEffect(() => {
        if (stats.currencyCode && withdrawalData.currency === 'USD') {
            setWithdrawalData(prev => ({
                ...prev,
                currency: stats.currencyCode || 'USD',
            }));
        }
    }, [stats.currencyCode]);

    // Fetch available payment methods and currencies
    useEffect(() => {
        const fetchPaymentMethods = async () => {
            setLoadingPaymentMethods(true);
            try {
                const axiosInstance = axios.create({
                    baseURL: API_PAYMENTS_BASE_URL,
                    withCredentials: true,
                });
                const response = await axiosInstance.get('/payment-methods/');
                if (response.data.status === 'success') {
                    setPaymentMethods(response.data.payment_methods || []);
                }
            } catch (err) {
                console.error('Failed to fetch payment methods:', err);
            } finally {
                setLoadingPaymentMethods(false);
            }
        };

        const fetchCurrencies = async () => {
            setLoadingCurrencies(true);
            try {
                const axiosInstance = axios.create({
                    baseURL: API_PAYMENTS_BASE_URL,
                    withCredentials: true,
                });
                const response = await axiosInstance.get('/currencies/');
                if (response.data.status === 'success') {
                    const activeCurrencies = (response.data.currencies || []).filter((c: Currency) => c.is_active);
                    setCurrencies(activeCurrencies);
                }
            } catch (err) {
                console.error('Failed to fetch currencies:', err);
            } finally {
                setLoadingCurrencies(false);
            }
        };

        fetchPaymentMethods();
        fetchCurrencies();
    }, []);

    // Fetch available companies for superusers
    useEffect(() => {
        if (user?.is_superuser) {
            const fetchCompanies = async () => {
                setLoadingCompanies(true);
                try {
                    const companiesList = await getCompanies();
                    setCompanies(companiesList);
                } catch (err) {
                    console.error('Failed to fetch companies:', err);
                } finally {
                    setLoadingCompanies(false);
                }
            };

            fetchCompanies();
        }
    }, [user?.is_superuser, getCompanies]);

    useEffect(() => {
        // Calculate stats from withdrawal accounts and balance data
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

            // Initialize linked payment methods state from API response
            const linked: Record<string, string | null> = {};
            withdrawalAccounts.forEach(account => {
                // Check for linked_payment_methods array from API
                if (account.linked_payment_methods && account.linked_payment_methods.length > 0) {
                    // Get the primary method or the first one
                    const primaryMethod = account.linked_payment_methods.find((m: any) => m.is_primary);
                    linked[account.id] = (primaryMethod || account.linked_payment_methods[0]).name;
                } else if (account.payment_method) {
                    // Fallback to old payment_method field for backwards compatibility
                    linked[account.id] = account.payment_method;
                } else {
                    linked[account.id] = null;
                }
            });
            setLinkedPaymentMethod(linked);
        }
    }, [withdrawalAccounts.length]);

    // Update balance and currency from API data
    useEffect(() => {
        if (balance) {
            setStats(prev => ({
                ...prev,
                availableBalance: balance.available_balance || 0,
                totalDeposits: balance.total_deposits || 0,
                totalWithdrawals: balance.total_withdrawals || 0,
                currency: balance.currency || null,
                currencyCode: balance.currency_code || balance.currency?.code || null,
                currencySymbol: balance.currency?.symbol || null,
            }));
        }
    }, [balance]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updated = {
                ...prev,
                [name]: value,
            };
            // Synchronize payment_method value to provider
            if (name === 'payment_method') {
                updated.provider = value;
            }
            return updated;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const submitData = {
            ...formData,
            // Only include payment_method if one was selected
            ...(formData.payment_method && { payment_method: formData.payment_method }),
        };
        const result = await createWithdrawalAccount(submitData);
        if (result) {
            setFormData({
                account_type: 'bank_account',
                provider: '',
                account_number: '',
                account_name: '',
                payment_method: '',
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

    const handleLinkPaymentMethod = async (accountId: string, paymentMethodName: string) => {
        if (!paymentMethodName) {
            alert('Please select a payment method');
            return;
        }
        const result = await linkPaymentMethod(accountId, paymentMethodName);
        if (result) {
            // Update state with the returned withdrawal account data
            if (result.linked_payment_methods && result.linked_payment_methods.length > 0) {
                const primaryMethod = result.linked_payment_methods.find((m: any) => m.is_primary);
                const methodName = (primaryMethod || result.linked_payment_methods[0]).name;
                setLinkedPaymentMethod(prev => ({
                    ...prev,
                    [accountId]: methodName,
                }));
            } else {
                setLinkedPaymentMethod(prev => ({
                    ...prev,
                    [accountId]: paymentMethodName,
                }));
            }
            // Refresh to ensure state is in sync
            await getWithdrawalAccounts();
        }
    };

    const handleUnlinkPaymentMethod = async (accountId: string) => {
        if (confirm('Are you sure you want to unlink the payment method from this account?')) {
            const result = await unlinkPaymentMethod(accountId);
            if (result) {
                // Clear the linked payment method
                setLinkedPaymentMethod(prev => ({
                    ...prev,
                    [accountId]: null,
                }));
                // Refresh to ensure state is in sync
                await getWithdrawalAccounts();
            }
        }
    };

    const handleWithdrawalInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setWithdrawalData(prev => ({
            ...prev,
            [name]: name === 'amount' ? parseFloat(value) || 0 : value,
        }));
    };

    const handleProcessWithdrawal = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!withdrawalData.account_id || withdrawalData.amount <= 0) {
            alert('Please select an account and enter a valid amount');
            return;
        }

        if (withdrawalData.amount % 50 !== 0) {
            alert('Le montant du retrait doit être un multiple de 50');
            return;
        }

        setIsProcessingWithdrawal(true);
        try {
            // Initiate withdrawal
            const result = await initiateWithdrawal({
                account_id: withdrawalData.account_id,
                amount: withdrawalData.amount,
                currency_code: withdrawalData.currency,
            });

            if (result && result.status === 'success') {
                // Store withdrawal info for verification
                setWithdrawalToVerify(result);
                
                // Reset form
                setWithdrawalData({
                    account_id: '',
                    amount: 0,
                    currency: 'USD',
                });
                setShowWithdrawalModal(false);
                
                // Show success and start polling for status
                alert('Withdrawal initiated! Reference: ' + result.reference);
                
                // Refresh withdrawal accounts and balance
                await getWithdrawalAccounts();
                await getBalance();
            } else {
                alert(result?.message || 'Failed to initiate withdrawal');
            }
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to process withdrawal');
            console.error('Withdrawal error:', err);
        } finally {
            setIsProcessingWithdrawal(false);
        }
    };

    const handleAdminActivateAccount = async () => {
        if (!selectedAccountForAdmin) return;

        try {
            const result = await adminActivatePaymentAccount(selectedAccountForAdmin.id, {
                verification_notes: 'Account activated by admin',
            });

            if (result) {
                alert('Account activated successfully!');
                setShowAdminActionsModal(false);
                setSelectedAccountForAdmin(null);
                await getWithdrawalAccounts();
            }
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to activate account');
            console.error('Error:', err);
        }
    };

    const handleAdminSetRecipient = async () => {
        if (!selectedAccountForAdmin) return;

        try {
            const result = await adminSetRecipientId(selectedAccountForAdmin.id, {
                recipient_id: adminRecipientId || undefined,
            });

            if (result) {
                alert('Recipient ID set successfully! ID: ' + result.recipient_id);
                setShowAdminActionsModal(false);
                setSelectedAccountForAdmin(null);
                setAdminRecipientId('');
                await getWithdrawalAccounts();
            }
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to set recipient ID');
            console.error('Error:', err);
        }
    };

    const handleVerifyWithdrawalStatus = async (paymentId: string) => {
        try {
            const result = await verifyWithdrawalStatus(paymentId);

            if (result && result.status === 'success') {
                const withdrawal = result.withdrawal;
                alert(`Withdrawal status: ${withdrawal.status}\nAmount: ${withdrawal.amount} ${withdrawal.currency.code}`);
                await getBalance();
            } else {
                alert(result?.message || 'Failed to verify withdrawal');
            }
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to verify withdrawal');
            console.error('Error:', err);
        }
    };

    return (
        <PanelContainer>
            <StatsSection>
                <StatCard>
                    <div className="stat-label">Available Balance</div>
                    <div className="stat-value">
                        {stats.currencySymbol || ''} {stats.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="stat-subtext">{stats.currencyCode || 'N/A'}</div>
                </StatCard>
                <StatCard>
                    <div className="stat-label">Total Deposits</div>
                    <div className="stat-value">
                        {stats.currencySymbol || ''} {stats.totalDeposits.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="stat-subtext">Cumulative deposits</div>
                </StatCard>
                <StatCard>
                    <div className="stat-label">Total Withdrawals</div>
                    <div className="stat-value">
                        {stats.currencySymbol || ''} {stats.totalWithdrawals.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="stat-subtext">Cumulative withdrawals</div>
                </StatCard>
                <StatCard>
                    <div className="stat-label">Withdrawal Accounts</div>
                    <div className="stat-value">{stats.totalPayments}</div>
                    <div className="stat-subtext">Active accounts</div>
                </StatCard>
            </StatsSection>
            <StatsAction>
                <WithdrawalButton onClick={() => setShowWithdrawalModal(true)}>
                    ↓ Effectuer un retrait
                </WithdrawalButton>
            </StatsAction>

            {error && <ErrorMessage>{error}</ErrorMessage>}
            {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}

            {showForm && (
                <FormContainer>
                    <Title>Add Withdrawal Account</Title>
                    <form onSubmit={handleSubmit}>
                        {user?.is_superuser && (
                            <FormGroup>
                                <label>Company *</label>
                                <select
                                    name="company_id"
                                    value={formData.company_id || ''}
                                    onChange={handleInputChange}
                                    disabled={loadingCompanies}
                                    required
                                >
                                    <option value="">Select a company...</option>
                                    {companies.map(company => (
                                        <option key={company.id} value={company.id}>
                                            {company.name}
                                        </option>
                                    ))}
                                </select>
                            </FormGroup>
                        )}

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
                            <label>Link Payment Method (Optional)</label>
                            <select
                                name="payment_method"
                                value={formData.payment_method}
                                onChange={handleInputChange}
                                disabled={loadingPaymentMethods}
                            >
                                <option value="">Select a payment method...</option>
                                {paymentMethods.map(method => (
                                    <option key={method.id} value={method.name}>
                                        {method.name}
                                    </option>
                                ))}
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
                                {account.company && (
                                    <InfoRow>
                                        <span>Company:</span>
                                        <strong>{account.company.name}</strong>
                                    </InfoRow>
                                )}
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
                                {account.verified_by && (
                                    <InfoRow>
                                        <span>Verified By:</span>
                                        <strong>
                                            {account.verified_by?.first_name || (account.verified_by as any)?.username || 'Admin'}
                                            {account.verified_by?.last_name && ` ${account.verified_by.last_name}`}
                                        </strong>
                                    </InfoRow>
                                )}
                                <InfoRow>
                                    <span>Payment Method:</span>
                                    <strong>
                                        {linkedPaymentMethod[account.id] || 'Not linked'}
                                    </strong>
                                </InfoRow>
                            </CardInfo>
                            <CardActions>
                                 {user?.is_superuser && account.verification_status === 'pending' && (
                                     <>
                                         <ActionButton
                                             className="success"
                                             onClick={() => {
                                                 setSelectedAccountForAdmin(account);
                                                 setAdminAction('activate');
                                                 setShowAdminActionsModal(true);
                                             }}
                                         >
                                             🔧 Activate Account
                                         </ActionButton>
                                         <ActionButton
                                             className="success"
                                             onClick={() => {
                                                 setSelectedAccountForAdmin(account);
                                                 setAdminAction('set_recipient');
                                                 setShowAdminActionsModal(true);
                                             }}
                                         >
                                             🆔 Set Recipient ID
                                         </ActionButton>
                                     </>
                                 )}
                                 {linkedPaymentMethod[account.id] ? (
                                     <ActionButton
                                         onClick={() => handleUnlinkPaymentMethod(account.id)}
                                     >
                                         Unlink Method
                                     </ActionButton>
                                 ) : (
                                     <LinkMethodSelect
                                         value=""
                                         onChange={(e) => {
                                             if (e.target.value) {
                                                 handleLinkPaymentMethod(account.id, e.target.value);
                                             }
                                         }}
                                     >
                                         <option value="">Link Method...</option>
                                         {paymentMethods.map(method => (
                                             <option key={method.id} value={method.name}>
                                                 {method.name}
                                             </option>
                                         ))}
                                     </LinkMethodSelect>
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

            {showWithdrawalModal && (
                <ModalOverlay onClick={() => setShowWithdrawalModal(false)}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <ModalHeader>
                            <h2>Effectuer un retrait</h2>
                            <CloseButton onClick={() => setShowWithdrawalModal(false)}>
                                ×
                            </CloseButton>
                        </ModalHeader>

                        <form onSubmit={handleProcessWithdrawal}>
                            <FormGroup>
                                <label>Compte de retrait *</label>
                                <select
                                    name="account_id"
                                    value={withdrawalData.account_id}
                                    onChange={handleWithdrawalInputChange}
                                    required
                                >
                                    <option value="">Sélectionner un compte...</option>
                                    {withdrawalAccounts.map(account => (
                                        <option key={account.id} value={account.id}>
                                            {account.account_name || account.provider} - {account.account_number}
                                        </option>
                                    ))}
                                </select>
                            </FormGroup>

                            <FormRow>
                                <FormGroup>
                                    <label>Montant * (multiple de 50)</label>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={withdrawalData.amount || ''}
                                        onChange={handleWithdrawalInputChange}
                                        placeholder="Entrez le montant"
                                        step="50"
                                        min="50"
                                        required
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <label>Devise *</label>
                                    <select
                                        name="currency"
                                        value={withdrawalData.currency}
                                        onChange={handleWithdrawalInputChange}
                                        disabled={loadingCurrencies}
                                        required
                                    >
                                        <option value="">Select a currency...</option>
                                        {currencies.length > 0 ? (
                                            currencies.map(curr => (
                                                <option key={curr.id} value={curr.code}>
                                                    {curr.symbol} {curr.code} - {curr.name}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="USD">USD - Dollar américain</option>
                                        )}
                                    </select>
                                </FormGroup>
                            </FormRow>

                            <ModalFooter>
                                <CancelButton
                                    type="button"
                                    onClick={() => setShowWithdrawalModal(false)}
                                    style={{
                                        padding: `${spacing.sm} ${spacing.md}`,
                                        border: `1px solid ${colors.border}`,
                                        background: 'white',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '0.875rem',
                                    }}
                                >
                                    Annuler
                                </CancelButton>
                                <SubmitButton
                                    type="submit"
                                    disabled={isProcessingWithdrawal}
                                    style={{
                                        padding: `${spacing.sm} ${spacing.md}`,
                                        backgroundColor: colors.primary,
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: isProcessingWithdrawal ? 'not-allowed' : 'pointer',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                    }}
                                >
                                    {isProcessingWithdrawal ? 'Traitement...' : 'Effectuer le retrait'}
                                </SubmitButton>
                            </ModalFooter>
                        </form>
                    </ModalContent>
                    </ModalOverlay>
                    )}

                    {showAdminActionsModal && selectedAccountForAdmin && (
                    <ModalOverlay onClick={() => setShowAdminActionsModal(false)}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <ModalHeader>
                            <h2>
                                {adminAction === 'activate' ? '🔧 Activate Payment Account' : '🆔 Set Recipient ID'}
                            </h2>
                            <CloseButton onClick={() => setShowAdminActionsModal(false)}>
                                ×
                            </CloseButton>
                        </ModalHeader>

                        {adminAction === 'set_recipient' ? (
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                handleAdminSetRecipient();
                            }}>
                                <FormGroup>
                                    <label>Account Provider</label>
                                    <input
                                        type="text"
                                        value={selectedAccountForAdmin.provider}
                                        disabled
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <label>Account Number</label>
                                    <input
                                        type="text"
                                        value={selectedAccountForAdmin.account_number}
                                        disabled
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <label>Recipient ID (auto-generated if empty)</label>
                                    <input
                                        type="text"
                                        value={adminRecipientId}
                                        onChange={(e) => setAdminRecipientId(e.target.value)}
                                        placeholder="Leave empty to auto-generate from payment gateway"
                                    />
                                </FormGroup>

                                <ModalFooter>
                                    <CancelButton
                                        type="button"
                                        onClick={() => setShowAdminActionsModal(false)}
                                    >
                                        Cancel
                                    </CancelButton>
                                    <SubmitButton type="submit" disabled={isLoading}>
                                        {isLoading ? 'Processing...' : 'Set Recipient ID'}
                                    </SubmitButton>
                                </ModalFooter>
                            </form>
                        ) : (
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                handleAdminActivateAccount();
                            }}>
                                <FormGroup>
                                    <label>Account Provider</label>
                                    <input
                                        type="text"
                                        value={selectedAccountForAdmin.provider}
                                        disabled
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <label>Account Number</label>
                                    <input
                                        type="text"
                                        value={selectedAccountForAdmin.account_number}
                                        disabled
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <label>Current Status</label>
                                    <input
                                        type="text"
                                        value={selectedAccountForAdmin.verification_status}
                                        disabled
                                    />
                                </FormGroup>

                                <p style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
                                    This will:
                                    <ul>
                                        <li>Verify the account</li>
                                        <li>Create a recipient ID if needed</li>
                                        <li>Activate the account for withdrawals</li>
                                    </ul>
                                </p>

                                <ModalFooter>
                                    <CancelButton
                                        type="button"
                                        onClick={() => setShowAdminActionsModal(false)}
                                    >
                                        Cancel
                                    </CancelButton>
                                    <SubmitButton type="submit" disabled={isLoading}>
                                        {isLoading ? 'Activating...' : 'Activate Account'}
                                    </SubmitButton>
                                </ModalFooter>
                            </form>
                        )}
                    </ModalContent>
                    </ModalOverlay>
                    )}
                    </PanelContainer>
                    );
                    };
