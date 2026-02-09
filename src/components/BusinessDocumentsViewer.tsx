import React, { useState } from 'react';
import styled from 'styled-components';
import { FiEye, FiDownload, FiFile, FiImage, FiFileText } from 'react-icons/fi';
import DocumentViewer from './DocumentViewer';

interface Document {
  id: string;
  name: string;
  url: string;
  type: 'pdf' | 'image' | 'word' | 'other';
  uploadedAt?: string;
  size?: number;
}

interface BusinessDocumentsViewerProps {
  documents: Document[];
  onView?: (document: Document) => void;
  onDownload?: (document: Document) => void;
  viewerOpen?: boolean;
  selectedDocument?: Document | null;
  onCloseViewer?: () => void;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const DocumentsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 0.75rem;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const DocumentCard = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.25rem;
  transition: all 0.3s ease;
  overflow: hidden;

  &:hover {
    border-color: #007bff;
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);
  }
`;

const DocumentIcon = styled.div<{ type: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  margin-bottom: 1rem;
  background-color: ${(props) => {
    switch (props.type) {
      case 'pdf':
        return '#ffe0e0';
      case 'image':
        return '#e0f2f1';
      case 'word':
        return '#e3f2fd';
      default:
        return '#f5f5f5';
    }
  }};
  color: ${(props) => {
    switch (props.type) {
      case 'pdf':
        return '#d32f2f';
      case 'image':
        return '#00796b';
      case 'word':
        return '#1565c0';
      default:
        return '#616161';
    }
  }};
  font-size: 1.5rem;
`;

const DocumentName = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  color: #1a1a1a;
  word-break: break-word;
`;

const DocumentMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  color: #666;
`;

const DocumentActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;

  background-color: ${(props) => (props.variant === 'primary' ? '#007bff' : '#f0f0f0')};
  color: ${(props) => (props.variant === 'primary' ? 'white' : '#333')};

  &:hover {
    background-color: ${(props) => (props.variant === 'primary' ? '#0056b3' : '#e0e0e0')};
  }

  &:active {
    transform: scale(0.98);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  color: #999;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
`;

const ViewerModal = styled.div<{ isOpen: boolean }>`
  display: ${(props) => (props.isOpen ? 'flex' : 'none')};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 10000;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

const ViewerContent = styled.div`
  background: white;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1200px;
  max-height: 90vh;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ViewerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
`;

const ViewerTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  color: #1a1a1a;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s ease;

  &:hover {
    color: #000;
  }
`;

const ViewerBody = styled.div`
  flex: 1;
  overflow: auto;
  background: #fafafa;
`;

const getDocumentIcon = (type: string) => {
  switch (type) {
    case 'pdf':
      return <FiFile />;
    case 'image':
      return <FiImage />;
    case 'word':
      return <FiFileText />;
    default:
      return <FiFile />;
  }
};

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return 'Unknown size';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

const BusinessDocumentsViewer: React.FC<BusinessDocumentsViewerProps> = ({
  documents,
  onView,
  onDownload,
  viewerOpen = false,
  selectedDocument = null,
  onCloseViewer,
}) => {
  const [internalViewerOpen, setInternalViewerOpen] = useState(false);
  const [internalSelectedDoc, setInternalSelectedDoc] = useState<Document | null>(null);

  const isViewerOpen = viewerOpen !== undefined ? viewerOpen : internalViewerOpen;
  const currentDocument = selectedDocument !== undefined ? selectedDocument : internalSelectedDoc;

  const handleView = (document: Document) => {
    if (onView) {
      onView(document);
    } else {
      setInternalSelectedDoc(document);
      setInternalViewerOpen(true);
    }
  };

  const handleDownload = (doc: Document) => {
    if (onDownload) {
      onDownload(doc);
    } else {
      const link = globalThis.document.createElement('a');
      link.href = doc.url;
      link.download = doc.name;
      globalThis.document.body.appendChild(link);
      link.click();
      globalThis.document.body.removeChild(link);
    }
  };

  const handleCloseViewer = () => {
    if (onCloseViewer) {
      onCloseViewer();
    } else {
      setInternalViewerOpen(false);
      setInternalSelectedDoc(null);
    }
  };

  if (documents.length === 0) {
    return (
      <Container>
        <EmptyState>
          <EmptyIcon>
            <FiFile />
          </EmptyIcon>
          <p>No documents available</p>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <DocumentsList>
        {documents.map((doc) => (
          <DocumentCard key={doc.id}>
            <DocumentIcon type={doc.type}>{getDocumentIcon(doc.type)}</DocumentIcon>
            <DocumentName title={doc.name}>{doc.name}</DocumentName>
            {(doc.uploadedAt || doc.size) && (
              <DocumentMeta>
                {doc.uploadedAt && <span>{formatDate(doc.uploadedAt)}</span>}
                {doc.size && <span>{formatFileSize(doc.size)}</span>}
              </DocumentMeta>
            )}
            <DocumentActions>
              <ActionButton variant="primary" onClick={() => handleView(doc)} title="View document">
                <FiEye />
                View
              </ActionButton>
              <ActionButton onClick={() => handleDownload(doc)} title="Download document">
                <FiDownload />
              </ActionButton>
            </DocumentActions>
          </DocumentCard>
        ))}
      </DocumentsList>

      <ViewerModal isOpen={isViewerOpen} onClick={handleCloseViewer}>
        <ViewerContent onClick={(e) => e.stopPropagation()}>
          <ViewerHeader>
            <ViewerTitle>{currentDocument?.name || 'Document'}</ViewerTitle>
            <CloseButton onClick={handleCloseViewer} title="Close">
              ✕
            </CloseButton>
          </ViewerHeader>
          <ViewerBody>
            {currentDocument && (
              <DocumentViewer
                documentUrl={currentDocument.url}
                type={currentDocument.type as 'pdf' | 'image' | 'word' | 'auto'}
                title={currentDocument.name}
                height="100%"
                width="100%"
                showControls={true}
              />
            )}
          </ViewerBody>
        </ViewerContent>
      </ViewerModal>
    </Container>
  );
};

export default BusinessDocumentsViewer;
