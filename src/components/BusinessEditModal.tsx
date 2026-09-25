import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiX, FiSave, FiDownload, FiUpload, FiFileText } from 'react-icons/fi';
import { Business, BusinessFormData } from '../hooks/useBusiness';
import { ContractTemplate } from '../hooks/useContract';
import { API_USERS_BASE_URL } from '../services/api';

interface BusinessEditModalProps {
  isOpen: boolean;
  business: Business | null;
  contractTemplate?: ContractTemplate | null;
  requireContract?: boolean;
  onClose: () => void;
  onSubmit: (data: BusinessFormData) => Promise<void>;
}

const resolveMediaUrl = (path?: string | null): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/media/')) return `${API_USERS_BASE_URL.split('/api/users')[0]}${path}`;
  const clean = path.startsWith('media/') ? path.substring(6) : path;
  return `${API_USERS_BASE_URL.split('/api/users')[0]}/media/${clean}`;
};

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

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d7dde3;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.3s ease;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #1e3a5f;
    box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.12);
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d7dde3;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #1e3a5f;
    box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.12);
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
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
  border-radius: 8px;
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
          background-color: #1e3a5f;
          color: white;
          border: none;

          &:hover:not(:disabled) {
            background-color: #152d47;
            box-shadow: 0 4px 12px rgba(30, 58, 95, 0.3);
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
          border: 1px solid #d7dde3;

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

const ErrorMessage = styled.div`
  padding: 1rem;
  background: #f8d7da;
  color: #721c24;
  border-left: 4px solid #dc3545;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
`;

const ContractBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 1rem;
  flex-wrap: wrap;

  .info {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    color: #1a1a1a;
    font-size: 0.88rem;

    svg {
      color: #1565c0;
      flex-shrink: 0;
    }

    small {
      display: block;
      color: #6b7280;
      font-size: 0.78rem;
    }
  }
`;

const DownloadLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.9rem;
  border-radius: 6px;
  background: #1e3a5f;
  color: white;
  font-size: 0.82rem;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    opacity: 0.92;
  }
`;

const FileInputBox = styled.label<{ hasFile?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 2px dashed ${(props) => (props.hasFile ? '#28a745' : '#dee2e6')};
  border-radius: 8px;
  cursor: pointer;
  color: ${(props) => (props.hasFile ? '#28a745' : '#6b7280')};
  transition: all 0.2s ease;

  &:hover {
    border-color: #007bff;
    background: #f0f6ff;
    color: #007bff;
  }

  input {
    display: none;
  }

  strong {
    color: #1a1a1a;
    font-size: 0.88rem;
  }
`;

export const BusinessEditModal: React.FC<BusinessEditModalProps> = ({
  isOpen,
  business,
  contractTemplate,
  requireContract = false,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<BusinessFormData>({});
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCreating = !business;

  useEffect(() => {
    if (business) {
      setFormData({
        name: business.name,
        description: business.description,
        nui: business.nui,
        commerce_register: business.commerce_register,
        website: business.website,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        nui: '',
        commerce_register: '',
        website: '',
      });
    }
    setContractFile(null);
    setError(null);
  }, [business, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleContractFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    if (!selected) {
      setContractFile(null);
      return;
    }
    const extension = selected.name.split('.').pop()?.toLowerCase() || '';
    if (!['pdf', 'docx', 'jpg', 'jpeg', 'png'].includes(extension)) {
      setError('Format de contrat non supporté. Formats autorisés : .pdf, .docx, .jpg, .jpeg, .png');
      setContractFile(null);
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      setError('Fichier trop volumineux (max 10MB).');
      setContractFile(null);
      return;
    }
    setError(null);
    setContractFile(selected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      setError('Business name is required');
      return;
    }

    if (!formData.description?.trim()) {
      setError('Business description is required');
      return;
    }

    if (isCreating && requireContract && !contractFile) {
      setError('Le contrat Tikta signé est obligatoire pour créer un business.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        ...formData,
        contract_file: contractFile || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update business');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{business ? 'Edit Business' : 'Create Business'}</ModalTitle>
          <CloseButton onClick={onClose}>
            <FiX />
          </CloseButton>
        </ModalHeader>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="name">Business Name *</Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name || ''}
              onChange={handleChange}
              placeholder="Enter business name"
              disabled={isSubmitting}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="description">Description *</Label>
            <TextArea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              placeholder="Décrivez votre business (activité, offres, localisation...)"
              disabled={isSubmitting}
              required
            />
          </FormGroup>

          {isCreating && (
            <FormGroup>
              <Label>Contrat Tikta signé{requireContract ? ' *' : ''}</Label>
              <ContractBox>
                <div className="info">
                  <FiFileText />
                  <div>
                    {contractTemplate
                      ? contractTemplate.title || `Souche Tikta v${contractTemplate.version}`
                      : 'Aucune souche publiée par Tikta'}
                    <small>
                      {contractTemplate
                        ? `Version courante v${contractTemplate.version} — téléchargez, remplissez et signez.`
                        : 'Contactez un administrateur pour publier le contrat.'}
                    </small>
                  </div>
                </div>
                {contractTemplate?.file && (
                  <DownloadLink
                    href={resolveMediaUrl(contractTemplate.file)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FiDownload /> Télécharger
                  </DownloadLink>
                )}
              </ContractBox>
              <FileInputBox hasFile={!!contractFile}>
                <input
                  type="file"
                  accept=".pdf,.docx,.jpg,.jpeg,.png"
                  onChange={handleContractFile}
                  disabled={isSubmitting}
                />
                <FiUpload size={20} />
                <div>
                  <strong>{contractFile ? contractFile.name : 'Uploader le contrat signé'}</strong>
                  <div style={{ fontSize: '0.78rem' }}>
                    Formats : .pdf, .docx, .jpg, .jpeg, .png (max 10MB)
                  </div>
                </div>
              </FileInputBox>
            </FormGroup>
          )}

          <FormGroup>
            <Label htmlFor="nui">NUI</Label>
            <Input
              id="nui"
              name="nui"
              type="text"
              value={formData.nui || ''}
              onChange={handleChange}
              placeholder="Enter NUI number"
              disabled={isSubmitting}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="commerce_register">Commerce Register</Label>
            <Input
              id="commerce_register"
              name="commerce_register"
              type="text"
              value={formData.commerce_register || ''}
              onChange={handleChange}
              placeholder="Enter commerce register number"
              disabled={isSubmitting}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              type="url"
              value={formData.website || ''}
              onChange={handleChange}
              placeholder="https://example.com"
              disabled={isSubmitting}
            />
          </FormGroup>

          <FormActions>
            <Button variant="secondary" type="button" onClick={onClose} disabled={isSubmitting}>
              <FiX /> Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              <FiSave /> {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </FormActions>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default BusinessEditModal;
