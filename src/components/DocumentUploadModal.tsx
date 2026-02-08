import React, { useState } from 'react';
import styled from 'styled-components';
import { FiX, FiUpload, FiCheck, FiAlertCircle } from 'react-icons/fi';

interface DocumentUploadModalProps {
  isOpen: boolean;
  businessName: string;
  documents?: {
    nui_document?: string;
    commerce_register_document?: string;
    website_document?: string;
    creation_document?: string;
  };
  onClose: () => void;
  onSubmit: (documents: FormData) => void;
}

const ModalOverlay = styled.div<{ isOpen: boolean }>`
  display: ${(props) => (props.isOpen ? 'flex' : 'none')};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${(props) => (props.isOpen ? 'fadeIn' : 'fadeOut')} 0.3s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from {
      transform: translateY(30px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
    width: 95%;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 1rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
  transition: color 0.3s ease;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #1a1a1a;
  }
`;

const DocumentsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const DocumentCard = styled.div`
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8f9fa;
  position: relative;

  &:hover {
    border-color: #007bff;
    background: #f0f6ff;
  }

  input[type='file'] {
    display: none;
  }
`;

const DocumentCardComplete = styled(DocumentCard)<{ isComplete: boolean }>`
  border-color: ${(props) => (props.isComplete ? '#28a745' : '#dee2e6')};
  background: ${(props) => (props.isComplete ? '#f1f9f5' : '#f8f9fa')};

  &:hover {
    border-color: ${(props) => (props.isComplete ? '#28a745' : '#007bff')};
    background: ${(props) => (props.isComplete ? '#e8f5f0' : '#f0f6ff')};
  }
`;

const DocumentIcon = styled.div<{ isComplete: boolean }>`
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: ${(props) => (props.isComplete ? '#28a745' : '#007bff')};
`;

const DocumentLabel = styled.label`
  font-weight: 600;
  color: #1a1a1a;
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.95rem;
`;

const DocumentDescription = styled.p`
  font-size: 0.8rem;
  color: #999;
  margin: 0.5rem 0 0 0;
`;

const FileName = styled.div`
  font-size: 0.8rem;
  color: #28a745;
  margin-top: 0.5rem;
  word-break: break-word;
  font-weight: 500;
`;

const ProgressBar = styled.div`
  margin: 2rem 0;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
`;

const ProgressTitle = styled.h4`
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #495057;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ProgressSteps = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const ProgressStep = styled.div<{ completed: boolean; active?: boolean }>`
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: ${(props) =>
    props.completed
      ? '#28a745'
      : props.active
        ? '#007bff'
        : '#dee2e6'};
  transition: all 0.3s ease;
`;

const FormActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  ${(props) => {
    switch (props.variant) {
      case 'primary':
        return `
          background-color: #28a745;
          color: white;
          border: none;

          &:hover:not(:disabled) {
            background-color: #218838;
            box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
          }

          &:disabled {
            background-color: #ccc;
            cursor: not-allowed;
          }
        `;
      default:
        return `
          background-color: white;
          color: #495057;
          border: 1px solid #dee2e6;

          &:hover {
            background-color: #f8f9fa;
            border-color: #999;
          }
        `;
    }
  }}

  @media (max-width: 480px) {
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
  }
`;

const WarningMessage = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  padding: 1rem;
  background: #fff3cd;
  border-left: 4px solid #ffc107;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  color: #856404;

  svg {
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const DOCUMENT_TYPES = [
  {
    key: 'nui_document',
    label: 'NUI Document',
    description: 'Unique Identification Number',
  },
  {
    key: 'commerce_register_document',
    label: 'Commerce Registry',
    description: 'Official commerce registry',
  },
  {
    key: 'website_document',
    label: 'Website Certificate',
    description: 'Domain or website proof',
  },
  {
    key: 'creation_document',
    label: 'Creation Document',
    description: 'Creation act or incorporation',
  },
];

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  businessName,
  documents = {},
  onClose,
  onSubmit,
}) => {
  const [files, setFiles] = useState<Record<string, File | null>>({
    nui_document: null,
    commerce_register_document: null,
    website_document: null,
    creation_document: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileSelect = (
    docKey: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setFiles((prev) => ({
        ...prev,
        [docKey]: file,
      }));
    }
  };

  const handleCardClick = (docKey: string) => {
    const input = document.getElementById(`file-${docKey}`) as HTMLInputElement;
    input?.click();
  };

  const isDocumentComplete = (docKey: string): boolean => {
    return !!(files[docKey] || documents[docKey as keyof typeof documents]);
  };

  const completedCount = DOCUMENT_TYPES.filter((doc) =>
    isDocumentComplete(doc.key)
  ).length;

  const isFormComplete = completedCount === DOCUMENT_TYPES.length;

  const handleSubmit = async () => {
    if (!isFormComplete) {
      alert('Veuillez compléter tous les documents');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(files).forEach(([key, file]) => {
        if (file) {
          formData.append(key, file);
        }
      });

      onSubmit(formData);
      // Reset after successful submission
      setFiles({
        nui_document: null,
        commerce_register_document: null,
        website_document: null,
        creation_document: null,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <div>
            <ModalTitle>Document Management</ModalTitle>
            <p style={{ margin: '0.5rem 0 0 0', color: '#999', fontSize: '0.9rem' }}>
              {businessName}
            </p>
          </div>
          <CloseButton onClick={onClose}>
            <FiX />
          </CloseButton>
        </ModalHeader>

        <WarningMessage>
          <FiAlertCircle size={20} />
          <span>
            All 4 documents must be uploaded to validate the business verification.
          </span>
        </WarningMessage>

        <ProgressBar>
          <ProgressTitle>
            Progress: {completedCount} / {DOCUMENT_TYPES.length}
          </ProgressTitle>
          <ProgressSteps>
            {DOCUMENT_TYPES.map((doc) => (
              <ProgressStep
                key={doc.key}
                completed={isDocumentComplete(doc.key)}
                active={
                  !isDocumentComplete(doc.key) && completedCount < DOCUMENT_TYPES.length
                }
              />
            ))}
          </ProgressSteps>
        </ProgressBar>

        <DocumentsContainer>
          {DOCUMENT_TYPES.map((doc) => {
            const isComplete = isDocumentComplete(doc.key);
            const fileName = files[doc.key]?.name;

            return (
              <DocumentCardComplete
                key={doc.key}
                isComplete={isComplete}
                onClick={() => handleCardClick(doc.key)}
              >
                <input
                  id={`file-${doc.key}`}
                  type="file"
                  onChange={(e) => handleFileSelect(doc.key, e)}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <DocumentIcon isComplete={isComplete}>
                  {isComplete ? <FiCheck /> : <FiUpload />}
                </DocumentIcon>
                <DocumentLabel>{doc.label}</DocumentLabel>
                <DocumentDescription>{doc.description}</DocumentDescription>
                {fileName && <FileName>✓ {fileName}</FileName>}
              </DocumentCardComplete>
            );
          })}
        </DocumentsContainer>

        <FormActions>
          <Button variant="secondary" onClick={onClose}>
            <FiX /> Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!isFormComplete || isSubmitting}
          >
            <FiCheck /> {isSubmitting ? 'Validating...' : 'Validate'}
          </Button>
        </FormActions>
      </ModalContent>
    </ModalOverlay>
  );
};

export default DocumentUploadModal;
