import React from 'react';
import styled from 'styled-components';
import { FiBox } from 'react-icons/fi';
import { colors, spacing } from '../config/theme';

const Header = styled.div`
  margin-bottom: ${spacing.xxl};

  h2 {
    font-size: 1.5rem;
    color: ${colors.textPrimary};
    margin: 0;
  }

  p {
    color: ${colors.textSecondary};
    font-size: 0.875rem;
    margin: ${spacing.sm} 0 0 0;
  }
`;

const PlaceholderBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: ${colors.textSecondary};
  text-align: center;

  svg {
    font-size: 4rem;
    margin-bottom: ${spacing.lg};
    opacity: 0.3;
  }

  h3 {
    margin: 0 0 ${spacing.md} 0;
    color: ${colors.textPrimary};
    font-size: 1.125rem;
  }

  p {
    margin: 0;
    max-width: 400px;
  }
`;

export const ProductsList: React.FC = () => {
  return (
    <>
      <Header>
        <h2>Products</h2>
      </Header>

      <PlaceholderBox>
        <FiBox />
        <h3>Products Feature Coming Soon</h3>
        <p>Product management will be available soon. Focus on offers for now.</p>
      </PlaceholderBox>
    </>
  );
};
