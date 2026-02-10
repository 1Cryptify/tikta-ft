import React from 'react';
import styled from 'styled-components';
import { colors, spacing } from '../config/theme';
import { User } from '../hooks/useAuth';

const ContentSection = styled.div`
  padding: ${spacing.xl};
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
`;

const PageHeader = styled.div`
  margin-bottom: ${spacing.xxl};

  h1 {
    font-size: 2rem;
    color: ${colors.textPrimary};
    margin-bottom: ${spacing.sm};
  }

  p {
    color: ${colors.textSecondary};
    font-size: 0.875rem;
  }
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${spacing.xl};
  margin-bottom: ${spacing.xxl};
`;

const Card = styled.div`
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: 8px;
  padding: ${spacing.xl};

  h3 {
    color: ${colors.textSecondary};
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: ${spacing.md};
  }

  .value {
    font-size: 2rem;
    font-weight: 700;
    color: ${colors.primary};
    margin-bottom: ${spacing.sm};
  }

  .subtitle {
    font-size: 0.875rem;
    color: ${colors.textSecondary};
  }
`;

const TransactionsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: 8px;
  overflow: hidden;

  thead {
    background-color: #f3f4f6;
    border-bottom: 1px solid ${colors.border};
  }

  th {
    padding: ${spacing.lg};
    text-align: left;
    font-weight: 600;
    font-size: 0.875rem;
    color: ${colors.textPrimary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  td {
    padding: ${spacing.lg};
    border-bottom: 1px solid ${colors.border};
    font-size: 0.875rem;
    color: ${colors.textPrimary};

    &:first-child {
      color: ${colors.primary};
      font-weight: 500;
    }
  }

  tbody tr:last-child td {
    border-bottom: none;
  }
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: ${spacing.sm} ${spacing.md};
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  background-color: ${props => {
    switch (props.status) {
      case 'completed':
        return '#d1f2e8';
      case 'pending':
        return '#fef3c7';
      case 'failed':
        return '#fee2e2';
      default:
        return colors.border;
    }
  }};

  color: ${props => {
    switch (props.status) {
      case 'completed':
        return colors.success;
      case 'pending':
        return '#b45309';
      case 'failed':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  }};
`;

interface OverviewPageProps {
  user: User;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ user }) => {
  const maskEmail = (email: string): string => {
    if (!email) return '';
    const [localPart, domain] = email.split('@');
    if (!domain) return email;

    const visibleChars = Math.max(1, Math.ceil(localPart.length / 3));
    const maskedPart = localPart.substring(0, visibleChars) + 'xxxxx';
    return `${maskedPart}@${domain}`;
  };

  const mockTransactions = [
    { id: 'TXN-001', type: 'Deposit', amount: '50,000 XAF', date: '2024-02-01', status: 'completed' },
    { id: 'TXN-002', type: 'Withdrawal', amount: '25,000 XAF', date: '2024-02-02', status: 'pending' },
    { id: 'TXN-003', type: 'Deposit', amount: '100,000 XAF', date: '2024-02-03', status: 'completed' },
    { id: 'TXN-004', type: 'Refund', amount: '10,000 XAF', date: '2024-02-04', status: 'failed' },
  ];

  return (
    <ContentSection>
      <PageHeader>
        <h1>Dashboard</h1>
        <p>Welcome back, {maskEmail(user.email)}</p>
      </PageHeader>

      <CardsGrid>
        <Card>
          <h3>Available Balance</h3>
          <div className="value">250,000</div>
          <div className="subtitle">XAF</div>
        </Card>
        <Card>
          <h3>Total Payments</h3>
          <div className="value">1,234,500</div>
          <div className="subtitle">XAF</div>
        </Card>
        <Card>
          <h3>Pending Transactions</h3>
          <div className="value">2</div>
          <div className="subtitle">In Progress</div>
        </Card>
      </CardsGrid>

      <div>
        <h2 style={{ color: colors.textPrimary, marginBottom: spacing.lg }}>
          Recent Transactions
        </h2>
        <TransactionsTable>
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {mockTransactions.map(txn => (
              <tr key={txn.id}>
                <td>{txn.id}</td>
                <td>{txn.type}</td>
                <td>{txn.amount}</td>
                <td>{txn.date}</td>
                <td>
                  <StatusBadge status={txn.status}>
                    {txn.status}
                  </StatusBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </TransactionsTable>
      </div>
    </ContentSection>
  );
};
