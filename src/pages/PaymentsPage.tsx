import React, { useState } from 'react';
import styled from 'styled-components';
import { colors, spacing } from '../config/theme';

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

const MenuNav = styled.div`
  display: flex;
  gap: ${spacing.md};
  margin-bottom: ${spacing.lg};
  border-bottom: 1px solid ${colors.border};
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

  &:hover {
    color: ${colors.textPrimary};
  }
`;

const PanelContent = styled.div`
  padding: ${spacing.lg} 0;
  min-height: 200px;
`;

export const PaymentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'withdrawal' | 'transactions' | 'logs'>('withdrawal');

  return (
    <ContentSection>
      <PageHeader>
        <h1>Payments</h1>
        <p>Manage and track your payments</p>
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
        {activeTab === 'withdrawal' && <div>Withdrawal content</div>}
        {activeTab === 'transactions' && <div>Transactions content</div>}
        {activeTab === 'logs' && <div>Logs content</div>}
      </PanelContent>
    </ContentSection>
  );
};
