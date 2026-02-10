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

export const OffersPage: React.FC = () => {
  return (
    <ContentSection>
      <PageHeader>
        <h1>Offers & Products</h1>
        <p>Manage your offers and products</p>
      </PageHeader>
    </ContentSection>
  );
};
