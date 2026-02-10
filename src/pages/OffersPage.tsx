import React, { useState } from 'react';
import styled from 'styled-components';
import { colors, spacing } from '../config/theme';
import { OffersList } from './OffersList';
import { ProductsList } from './ProductsList';

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

export const OffersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'offers' | 'products'>('offers');

  return (
    <ContentSection>
      <PageHeader>
        <h1>Offers & Products</h1>
        <p>Manage your offers and products</p>
      </PageHeader>

      <MenuNav>
        <MenuButton
          isActive={activeTab === 'offers'}
          onClick={() => setActiveTab('offers')}
        >
          Offers
        </MenuButton>
        <MenuButton
          isActive={activeTab === 'products'}
          onClick={() => setActiveTab('products')}
        >
          Products
        </MenuButton>
      </MenuNav>

      <PanelContent>
        {activeTab === 'offers' && <OffersList />}
        {activeTab === 'products' && <ProductsList />}
      </PanelContent>
    </ContentSection>
  );
};
