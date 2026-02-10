import React from 'react';
import { FiLoader } from 'react-icons/fi';
import styled from 'styled-components';

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 200px;
`;

const SpinnerIcon = styled(FiLoader)`
  font-size: 48px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingSpinner: React.FC = () => {
  return (
    <SpinnerContainer>
      <SpinnerIcon />
    </SpinnerContainer>
  );
};

export default LoadingSpinner;
