import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiDownload, FiZoomIn, FiZoomOut } from 'react-icons/fi';

// TODO: Implement PDF support

interface DocumentViewerProps {
  documentUrl: string;
  type?: 'pdf' | 'image' | 'word' | 'auto';
  title?: string;
  height?: string | number;
  width?: string | number;
  showControls?: boolean;
  onError?: (error: Error) => void;
}

const ViewerContainer = styled.div<{ height?: string | number; width?: string | number }>`
  display: flex;
  flex-direction: column;
  height: ${(props) => (typeof props.height === 'number' ? `${props.height}px` : props.height || '600px')};
  width: ${(props) => (typeof props.width === 'number' ? `${props.width}px` : props.width || '100%')};
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  gap: 1rem;
  flex-wrap: wrap;
`;

const ControlGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ControlButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  color: #333;
  transition: all 0.2s ease;

  &:hover {
    background: #f0f0f0;
    border-color: #999;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PageInfo = styled.span`
  font-size: 0.9rem;
  color: #666;
  min-width: 100px;
  text-align: center;
`;

const Content = styled.div`
  flex: 1;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: #fafafa;

  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;

    &:hover {
      background: #555;
    }
  }
`;

const ImageContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 100%;
  max-height: 100%;

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  background: #ffe0e0;
  color: #d32f2f;
  padding: 2rem;
  text-align: center;
  border-radius: 4px;
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
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

const WordContainer = styled.div`
  width: 100%;
  height: 100%;
  padding: 2rem;
  overflow: auto;
  background: white;

  font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;
  line-height: 1.6;
  color: #333;

  h1, h2, h3, h4, h5, h6 {
    margin-top: 1rem;
    margin-bottom: 0.5rem;
    color: #1a1a1a;
  }

  p {
    margin-bottom: 1rem;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 1rem;

    th, td {
      border: 1px solid #ddd;
      padding: 0.5rem;
      text-align: left;
    }

    th {
      background-color: #f0f0f0;
      font-weight: bold;
    }
  }
`;

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documentUrl,
  type = 'auto',
  title,
  height,
  width,
  showControls = true,
  onError,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [documentType, setDocumentType] = useState<'pdf' | 'image' | 'word' | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [wordContent, setWordContent] = useState<string | null>(null);

  // Determine document type
  useEffect(() => {
    const determineType = () => {
      if (type !== 'auto') {
        setDocumentType(type);
        return;
      }

      const extension = documentUrl.split('.').pop()?.toLowerCase() || '';

      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
        setDocumentType('image');
      } else if (['doc', 'docx'].includes(extension)) {
        setDocumentType('word');
      } else {
        setDocumentType('image');
      }
    };

    determineType();
  }, [documentUrl, type]);

  // Load document based on type
  useEffect(() => {
    const loadDocument = async () => {
      try {
        setLoading(true);
        setError(null);

        if (documentType === 'image') {
          setImageData(documentUrl);
          setLoading(false);
        } else if (documentType === 'word') {
          try {
            const response = await fetch(documentUrl);
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            const mammoth = await import('mammoth');
            const result = await mammoth.convertToHtml({ arrayBuffer });
            setWordContent(result.value);
            setLoading(false);
          } catch (err) {
            console.error('Word document load error:', err);
            throw new Error('Failed to load Word document');
          }
        } else {
          setLoading(false);
          setError('Unsupported document type');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load document';
        console.error('Document loading error:', errorMessage);
        setError(errorMessage);
        setLoading(false);
        onError?.(new Error(errorMessage));
      }
    };

    if (documentType) {
      loadDocument();
    }
  }, [documentUrl, documentType, onError]);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, numPages));
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = title || 'document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ViewerContainer height={height} width={width}>
      {showControls && documentType && (
        <Controls>
          <ControlGroup>
            {documentType === 'image' && (
              <>
                <ControlButton onClick={handleZoomOut} disabled={scale <= 0.5} title="Zoom out">
                  <FiZoomOut size={18} />
                </ControlButton>
                <span style={{ fontSize: '0.9rem', color: '#666', minWidth: '50px', textAlign: 'center' }}>
                  {Math.round(scale * 100)}%
                </span>
                <ControlButton onClick={handleZoomIn} disabled={scale >= 3} title="Zoom in">
                  <FiZoomIn size={18} />
                </ControlButton>
              </>
            )}
          </ControlGroup>

          <ControlButton onClick={handleDownload} title="Download document">
            <FiDownload size={18} />
          </ControlButton>
        </Controls>
      )}

      <Content>
        {loading && <LoadingSpinner />}

        {error && !loading && (
          <ErrorMessage>
            <div>
              <strong>Error loading document</strong>
              <p>{error}</p>
            </div>
          </ErrorMessage>
        )}

        {!loading && !error && documentType === 'image' && imageData && (
          <ImageContainer>
            <img src={imageData} alt={title || 'Document'} style={{ transform: `scale(${scale})` }} />
          </ImageContainer>
        )}

        {!loading && !error && documentType === 'word' && wordContent && (
          <WordContainer dangerouslySetInnerHTML={{ __html: wordContent }} />
        )}
      </Content>
    </ViewerContainer>
  );
};

export default DocumentViewer;
