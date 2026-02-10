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

export const PaymentsPage: React.FC = () => {
  return (
    <ContentSection>
      <PageHeader>
        <h1>Payments</h1>
        <p>Manage and track your payments</p>
      </PageHeader>
    </ContentSection>
  );
};
