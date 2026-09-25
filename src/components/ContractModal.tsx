import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
    FiX,
    FiDownload,
    FiUpload,
    FiCheck,
    FiAlertCircle,
    FiFileText,
    FiExternalLink,
} from 'react-icons/fi';
import { API_USERS_BASE_URL } from '../services/api';
import { ContractTemplate } from '../hooks/useContract';

interface ContractModalProps {
    isOpen: boolean;
    businessName: string;
    currentTemplate: ContractTemplate | null;
    contractDocument?: string;
    contractVersion?: number | null;
    contractStatus?: 'missing' | 'outdated' | 'signed';
    onClose: () => void;
    onSubmit: (file: File) => Promise<void> | void;
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
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 620px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 1rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.35rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
`;

const SubTitle = styled.p`
  margin: 0.35rem 0 0 0;
  color: #999;
  font-size: 0.9rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
  padding: 0;
  display: flex;
  align-items: center;

  &:hover {
    color: #1a1a1a;
  }
`;

const Alert = styled.div<{ type: 'info' | 'warning' | 'success' }>`
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.9rem 1rem;
  border-radius: 8px;
  margin-bottom: 1.25rem;
  font-size: 0.9rem;
  line-height: 1.4;

  svg {
    flex-shrink: 0;
    margin-top: 1px;
  }

  ${(props) => {
        switch (props.type) {
            case 'success':
                return 'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;';
            case 'warning':
                return 'background: #fff3cd; color: #856404; border: 1px solid #ffeeba;';
            default:
                return 'background: #e7f3ff; color: #0b4a7a; border: 1px solid #bcdffb;';
        }
    }}
`;

const TemplateBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
`;

const TemplateInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;

  .icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: #e3f2fd;
    color: #1565c0;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  strong {
    display: block;
    color: #1a1a1a;
    font-size: 0.9rem;
  }

  small {
    color: #6b7280;
    font-size: 0.8rem;
  }
`;

const FileInputBox = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s ease;
  margin-bottom: 1.25rem;

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
    font-size: 0.9rem;
  }
`;

const LinkedContract = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: #007bff;
  text-decoration: none;
  margin-bottom: 1rem;

  &:hover {
    text-decoration: underline;
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  background: ${(props) => (props.variant === 'primary' ? '#28a745' : 'white')};
  color: ${(props) => (props.variant === 'primary' ? 'white' : '#495057')};
  border: ${(props) => (props.variant === 'primary' ? 'none' : '1px solid #dee2e6')};

  &:hover:not(:disabled) {
    opacity: 0.92;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const DownloadButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1rem;
  border-radius: 6px;
  background: #1e3a5f;
  color: white;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    opacity: 0.92;
  }
`;

const ErrorText = styled.div`
  color: #c62828;
  background: #ffebee;
  border-left: 4px solid #dc3545;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  font-size: 0.88rem;
  margin-bottom: 1rem;
`;

const SUPPORTED_FORMATS = '.pdf, .docx, .jpg, .jpeg, .png';
const MAX_SIZE = 10 * 1024 * 1024;

export const ContractModal: React.FC<ContractModalProps> = ({
    isOpen,
    businessName,
    currentTemplate,
    contractDocument,
    contractVersion,
    contractStatus = 'missing',
    onClose,
    onSubmit,
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFile(null);
            setError(null);
        }
    }, [isOpen]);

    const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selected = event.target.files?.[0];
        if (!selected) return;

        const extension = selected.name.split('.').pop()?.toLowerCase() || '';
        if (!['pdf', 'docx', 'jpg', 'jpeg', 'png'].includes(extension)) {
            setError(`Format non supporté (${extension || 'inconnu'}). Formats autorisés : ${SUPPORTED_FORMATS}`);
            setFile(null);
            return;
        }
        if (selected.size > MAX_SIZE) {
            setError(`Fichier trop volumineux (max 10MB). Taille : ${(selected.size / 1024 / 1024).toFixed(2)}MB`);
            setFile(null);
            return;
        }
        setError(null);
        setFile(selected);
    };

    const handleSubmit = async () => {
        if (!file) {
            setError('Veuillez sélectionner le contrat signé.');
            return;
        }
        setIsSubmitting(true);
        setError(null);
        try {
            await onSubmit(file);
            setFile(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Échec de l\'upload du contrat.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const templateUrl = resolveMediaUrl(currentTemplate?.file);
    const contractUrl = resolveMediaUrl(contractDocument);

    return (
        <ModalOverlay isOpen={isOpen} onClick={onClose}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                    <div>
                        <ModalTitle>Contrat Tikta</ModalTitle>
                        <SubTitle>{businessName}</SubTitle>
                    </div>
                    <CloseButton onClick={onClose} title="Fermer">
                        <FiX />
                    </CloseButton>
                </ModalHeader>

                {contractStatus === 'signed' && (
                    <Alert type="success">
                        <FiCheck size={18} />
                        <span>
                            Contrat signé à jour{contractVersion ? ` (version v${contractVersion})` : ''}. Vous
                            pouvez toutefois re-uploader une nouvelle version.
                        </span>
                    </Alert>
                )}
                {contractStatus === 'outdated' && (
                    <Alert type="warning">
                        <FiAlertCircle size={18} />
                        <span>
                            Une nouvelle version du contrat Tikta est disponible. Merci de télécharger la
                            souche, la signer puis la re-uploader.
                            {contractVersion && currentTemplate ? ` (signé v${contractVersion} · courante v${currentTemplate.version})` : ''}
                        </span>
                    </Alert>
                )}
                {contractStatus === 'missing' && (
                    <Alert type="warning">
                        <FiAlertCircle size={18} />
                        <span>
                            Aucun contrat signé pour cette entreprise. Le contrat Tikta est obligatoire pour
                            valider le business.
                        </span>
                    </Alert>
                )}

                <TemplateBox>
                    <TemplateInfo>
                        <div className="icon">
                            <FiFileText />
                        </div>
                        <div>
                            <strong>
                                {currentTemplate
                                    ? currentTemplate.title || `Souche Tikta v${currentTemplate.version}`
                                    : 'Aucune souche publiée'}
                            </strong>
                            <small>
                                {currentTemplate ? `Version courante v${currentTemplate.version}` : 'Contactez un administrateur'}
                            </small>
                        </div>
                    </TemplateInfo>
                    {templateUrl && (
                        <DownloadButton href={templateUrl} target="_blank" rel="noopener noreferrer">
                            <FiDownload /> Télécharger la souche
                        </DownloadButton>
                    )}
                </TemplateBox>

                {contractUrl && (
                    <LinkedContract href={contractUrl} target="_blank" rel="noopener noreferrer">
                        <FiExternalLink /> Voir le contrat actuellement uploadé
                    </LinkedContract>
                )}

                {error && <ErrorText>{error}</ErrorText>}

                <FileInputBox>
                    <input
                        type="file"
                        accept=".pdf,.docx,.jpg,.jpeg,.png"
                        onChange={handleFile}
                    />
                    <FiUpload size={22} />
                    <div>
                        <strong>{file ? file.name : 'Cliquez pour sélectionner le contrat signé'}</strong>
                        <div style={{ fontSize: '0.8rem' }}>
                            Formats : {SUPPORTED_FORMATS} (max 10MB)
                        </div>
                    </div>
                </FileInputBox>

                <FormActions>
                    <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
                        <FiX /> Annuler
                    </Button>
                    <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting || !file}>
                        <FiCheck /> {isSubmitting ? 'Envoi...' : 'Uploader le contrat'}
                    </Button>
                </FormActions>
            </ModalContent>
        </ModalOverlay>
    );
};

export default ContractModal;
