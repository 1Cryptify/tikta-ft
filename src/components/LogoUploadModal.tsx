import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { FiX, FiUpload, FiCheck } from 'react-icons/fi';

interface LogoUploadModalProps {
  isOpen: boolean;
  businessName: string;
  currentLogo?: string;
  onClose: () => void;
  onSubmit: (file: File) => void;
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
  max-width: 500px;
  width: 90%;
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

const PreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
`;

const PreviewLabel = styled.p`
  font-size: 0.85rem;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 1rem 0;
`;

const PreviewImage = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 8px;
  object-fit: cover;
  margin-bottom: 1rem;
  border: 2px solid #f0f0f0;
`;

const PreviewPlaceholder = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1rem;
`;

const UploadZone = styled.div<{ isDragging?: boolean }>`
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${(props) => (props.isDragging ? '#f0f6ff' : '#f8f9fa')};
  border-color: ${(props) => (props.isDragging ? '#007bff' : '#dee2e6')};

  &:hover {
    border-color: #007bff;
    background: #f0f6ff;
  }

  input[type='file'] {
    display: none;
  }
`;

const UploadIcon = styled.div`
  font-size: 2.5rem;
  color: #007bff;
  margin-bottom: 0.5rem;
`;

const UploadText = styled.p`
  font-weight: 600;
  color: #1a1a1a;
  margin: 0.5rem 0 0 0;
`;

const UploadHelper = styled.p`
  font-size: 0.8rem;
  color: #999;
  margin: 0.5rem 0 0 0;
`;

const FileName = styled.div`
  font-size: 0.85rem;
  color: #28a745;
  margin-top: 1rem;
  word-break: break-word;
  font-weight: 500;
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
          background-color: #007bff;
          color: white;
          border: none;

          &:hover:not(:disabled) {
            background-color: #0056b3;
            box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
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

export const LogoUploadModal: React.FC<LogoUploadModalProps> = ({
  isOpen,
  businessName,
  currentLogo,
  onClose,
  onSubmit,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileSelect = (file: File) => {
    if (file.type.startsWith('image/')) {
      setSelectedFile(file);
    } else {
      alert('Please select an image file');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      alert('Please select a logo');
      return;
    }

    setIsSubmitting(true);
    try {
      onSubmit(selectedFile);
      setSelectedFile(null);
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
            <ModalTitle>Upload Logo</ModalTitle>
            <p style={{ margin: '0.5rem 0 0 0', color: '#999', fontSize: '0.9rem' }}>
              {businessName}
            </p>
          </div>
          <CloseButton onClick={onClose}>
            <FiX />
          </CloseButton>
        </ModalHeader>

        <PreviewContainer>
          <PreviewLabel>Current Logo</PreviewLabel>
          {currentLogo ? (
            <PreviewImage src={currentLogo} alt={businessName} />
          ) : (
            <PreviewPlaceholder>
              {businessName?.charAt(0).toUpperCase()}
            </PreviewPlaceholder>
          )}
        </PreviewContainer>

        <UploadZone
          isDragging={isDragging}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
          />
          <UploadIcon>
            <FiUpload />
          </UploadIcon>
          <UploadText>Drag and drop your logo here</UploadText>
          <UploadHelper>or click to browse</UploadHelper>
          <UploadHelper>Recommended: PNG, JPG (max 5MB)</UploadHelper>
        </UploadZone>

        {selectedFile && <FileName>✓ {selectedFile.name}</FileName>}

        <FormActions>
          <Button variant="secondary" onClick={onClose}>
            <FiX /> Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!selectedFile || isSubmitting}
          >
            <FiCheck /> {isSubmitting ? 'Uploading...' : 'Upload'}
          </Button>
        </FormActions>
      </ModalContent>
    </ModalOverlay>
  );
};

export default LogoUploadModal;
