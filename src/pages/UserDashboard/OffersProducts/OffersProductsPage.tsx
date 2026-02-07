import React from 'react';
import styled from 'styled-components';
import { OffersPanel } from './offers/OffersPanel';
import { ProductsPanel } from './products/ProductsPanel';
import { colors, spacing } from '../../../config/theme';

const Container = styled.div`
  padding: ${spacing.xl};
  max-width: 1600px;
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

const PanelsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${spacing.xl};
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

interface OffersProductsPageProps {
  companyId?: string;
}

export const OffersProductsPage: React.FC<OffersProductsPageProps> = ({ companyId }) => {
  return (
    <Container>
      <PageHeader>
         <h1>Offers and Products</h1>
         <p>Manage your offers and products from one place</p>
       </PageHeader>

      <PanelsGrid>
        <OffersPanel companyId={companyId} />
        <ProductsPanel companyId={companyId} />
      </PanelsGrid>
    </Container>
  );
};
