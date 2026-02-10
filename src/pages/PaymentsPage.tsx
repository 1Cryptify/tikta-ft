import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { colors, spacing } from '../config/theme';
import { useAuth } from '../hooks/useAuth';
import { TransactionsPanel } from '../components/Payments/TransactionsPanel';
import { WithdrawalPanel } from '../components/Payments/WithdrawalPanel';
import { LogsPanel } from '../components/Payments/LogsPanel';

const ContentSection = styled.div`
  padding: ${spacing.xl};
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;

  @media (max-width: 768px) {
    padding: ${spacing.lg};
  }
`;

const PageHeader = styled.div`
  margin-bottom: ${spacing.xxl};
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${spacing.md};
  }

  h1 {
    font-size: 2rem;
    color: ${colors.textPrimary};
    margin-bottom: ${spacing.sm};
    margin: 0;

    @media (max-width: 768px) {
      font-size: 1.5rem;
    }
  }

  p {
    color: ${colors.textSecondary};
    font-size: 0.875rem;
    margin: 0;
  }
`;

const HeaderLeft = styled.div`
  flex: 1;
`;

const HeaderRight = styled.div`
  display: flex;
  gap: ${spacing.md};
  align-items: center;

  @media (max-width: 768px) {
    width: 100%;
    flex-direction: column;
  }
`;

const StatCard = styled.div`
  background: white;
  border: 1px solid ${colors.border};
  border-radius: 8px;
  padding: ${spacing.md};
  text-align: center;
  min-width: 150px;

  @media (max-width: 768px) {
    min-width: auto;
    width: 100%;
  }

  .label {
    font-size: 0.75rem;
    color: ${colors.textSecondary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .value {
    font-size: 1.5rem;
    font-weight: 700;
    color: ${colors.primary};
    margin-top: ${spacing.xs};
  }
`;

const MenuNav = styled.div`
  display: flex;
  gap: ${spacing.md};
  margin-bottom: ${spacing.lg};
  border-bottom: 1px solid ${colors.border};
  overflow-x: auto;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${colors.border};
    border-radius: 2px;
  }
`;

const MenuButton = styled.button<{ isActive: boolean }>`
  background: none;
  border: none;
  padding: ${spacing.md} ${spacing.lg};
  font-size: 1rem;
  color: ${(props) =>
    props.isActive ? colors.primary : colors.textSecondary};
  cursor: pointer;
  border-bottom: 3px solid
    ${(props) => (props.isActive ? colors.primary : 'transparent')};
  transition: all 0.3s ease;
  font-weight: ${(props) => (props.isActive ? '600' : '400')};
  white-space: nowrap;

  &:hover {
    color: ${colors.textPrimary};
  }

  @media (max-width: 768px) {
    padding: ${spacing.md} ${spacing.md};
    font-size: 0.9rem;
  }
`;

const PanelContent = styled.div`
  padding: ${spacing.lg} 0;
  min-height: 200px;
  animation: fadeIn 0.3s ease-in;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

interface PaymentStats {
  totalTransactions: number;
  totalWithdrawals: number;
  pendingWithdrawals: number;
}

export const PaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'withdrawal' | 'transactions' | 'logs'>('withdrawal');
  const [stats, setStats] = useState<PaymentStats>({
    totalTransactions: 0,
    totalWithdrawals: 0,
    pendingWithdrawals: 0,
  });

  useEffect(() => {
    // Stats would be fetched from API in real implementation
    // This is a placeholder for now
  }, [user]);

  return (
    <ContentSection>
      <PageHeader>
        <HeaderLeft>
          <h1>Payments</h1>
          <p>Manage and track your payments, transactions, and withdrawals</p>
        </HeaderLeft>
        <HeaderRight>
          <StatCard>
            <div className="label">Transactions</div>
            <div className="value">{stats.totalTransactions}</div>
          </StatCard>
          <StatCard>
            <div className="label">Pending</div>
            <div className="value">{stats.pendingWithdrawals}</div>
          </StatCard>
        </HeaderRight>
      </PageHeader>

      <MenuNav>
        <MenuButton
          isActive={activeTab === 'withdrawal'}
          onClick={() => setActiveTab('withdrawal')}
        >
          Withdrawal
        </MenuButton>
        <MenuButton
          isActive={activeTab === 'transactions'}
          onClick={() => setActiveTab('transactions')}
        >
          Transactions
        </MenuButton>
        <MenuButton
          isActive={activeTab === 'logs'}
          onClick={() => setActiveTab('logs')}
        >
          Logs
        </MenuButton>
      </MenuNav>

      <PanelContent>
        {activeTab === 'withdrawal' && <WithdrawalPanel />}
        {activeTab === 'transactions' && <TransactionsPanel />}
        {activeTab === 'logs' && <LogsPanel />}
      </PanelContent>
    </ContentSection>
  );
};
