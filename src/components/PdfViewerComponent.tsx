import React, { Suspense } from 'react';
import styled from 'styled-components';
import { Worker } from '@react-pdf-viewer/core';
import { Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';

interface PdfViewerComponentProps {
  fileUrl: string;
  height?: string | number;
  width?: string | number;
  onError?: (error: Error) => void;
}

const Container = styled.div<{ height?: string | number; width?: string | number }>`
  width: ${(props) => (typeof props.width === 'number' ? `${props.width}px` : props.width || '100%')};
  height: ${(props) => (typeof props.height === 'number' ? `${props.height}px` : props.height || '600px')};
  background: white;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  .rpv-core__viewer {
    width: 100%;
    height: 100%;
  }

  .rpv-core__page {
    margin: 1rem auto;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .rpv-core__page-layer {
    background: white;
  }

  .rpv-core__text-layer-text {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  color: #666;

  &::after {
    content: '';
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #ffe0e0;
  color: #d32f2f;
  padding: 2rem;
  text-align: center;
  font-size: 0.95rem;
`;

const PdfViewerComponent: React.FC<PdfViewerComponentProps> = ({
  fileUrl,
  height = '600px',
  width = '100%',
  onError,
}) => {
  return (
    <Container height={height} width={width}>
      <Suspense fallback={<LoadingContainer />}>
        <Worker workerUrl="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js">
          <Viewer fileUrl={fileUrl} />
        </Worker>
      </Suspense>
    </Container>
  );
};

export default PdfViewerComponent;
