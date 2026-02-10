import React from 'react';
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

export const TransactionsPage: React.FC = () => {
  return (
    <ContentSection>
      <PageHeader>
        <h1>Transaction History</h1>
        <p>View your complete transaction history</p>
      </PageHeader>
    </ContentSection>
  );
};
