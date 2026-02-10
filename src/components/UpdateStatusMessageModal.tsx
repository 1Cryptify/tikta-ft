import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiX, FiCheck } from 'react-icons/fi';

interface UpdateStatusMessageModalProps {
    isOpen: boolean;
    business: { id: string; status_message?: string; status_type?: 'positive' | 'negative' } | null;
    onClose: () => void;
    onSubmit: (message: string, type: 'positive' | 'negative') => Promise<void>;
    isLoading?: boolean;
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

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
`;

const TypeButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const TypeButton = styled.button<{ isSelected: boolean; messageType: 'positive' | 'negative' }>`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.95rem;

  ${(props) => {
    if (props.messageType === 'positive') {
      return `
        border-color: #155724;
        background-color: ${props.isSelected ? '#d4edda' : 'white'};
        color: #155724;
        
        &:hover {
          background-color: #d4edda;
        }
      `;
    } else {
      return `
        border-color: #721c24;
        background-color: ${props.isSelected ? '#f8d7da' : 'white'};
        color: #721c24;
        
        &:hover {
          background-color: #f8d7da;
        }
      `;
    }
  }}
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  min-height: 120px;
  transition: border-color 0.3s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const CharacterCount = styled.div<{ isNearLimit: boolean }>`
  display: flex;
  justify-content: flex-end;
  margin-top: 0.5rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: ${(props) => (props.isNearLimit ? '#dc3545' : '#999')};
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

          &:hover:not(:disabled) {
            background-color: #f8f9fa;
            border-color: #999;
          }

          &:disabled {
            background-color: #f5f5f5;
            cursor: not-allowed;
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

const MAX_CHARACTERS = 500;

export const UpdateStatusMessageModal: React.FC<UpdateStatusMessageModalProps> = ({
    isOpen,
    business,
    onClose,
    onSubmit,
    isLoading = false,
}) => {
    const [message, setMessage] = useState('');
    const [type, setType] = useState<'positive' | 'negative'>('positive');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (business && isOpen) {
            setMessage(business.status_message || '');
            setType(business.status_type || 'positive');
            setError(null);
        }
    }, [business, isOpen]);

    const characterCount = message.length;
    const isNearLimit = characterCount > MAX_CHARACTERS * 0.8;

    const handleSubmit = async (e: React.FormEvent) => {
        // e.preventDefault();

        if (!message.trim()) {
            setError('Le message ne peut pas être vide');
            return;
        }

        if (message.length > MAX_CHARACTERS) {
            setError(`Le message ne peut pas dépasser ${MAX_CHARACTERS} caractères`);
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await onSubmit(message, type);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du message');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ModalOverlay isOpen={isOpen} onClick={onClose}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                    <ModalTitle>Modifier le message de statut</ModalTitle>
                    <CloseButton onClick={onClose} disabled={isSubmitting || isLoading}>
                        <FiX />
                    </CloseButton>
                </ModalHeader>

                {error && <ErrorMessage>{error}</ErrorMessage>}

                <form onSubmit={handleSubmit}>
                    <FormGroup>
                      <Label>Type de message</Label>
                      <TypeButtonsContainer>
                        <TypeButton
                          type="button"
                          messageType="positive"
                          isSelected={type === 'positive'}
                          onClick={() => setType('positive')}
                          disabled={isSubmitting || isLoading}
                        >
                          <FiCheck /> Positif
                        </TypeButton>
                        <TypeButton
                          type="button"
                          messageType="negative"
                          isSelected={type === 'negative'}
                          onClick={() => setType('negative')}
                          disabled={isSubmitting || isLoading}
                        >
                          <FiX /> Négatif
                        </TypeButton>
                      </TypeButtonsContainer>
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="message">Message</Label>
                        <TextArea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Entrez votre message (max 500 caractères)"
                            disabled={isSubmitting || isLoading}
                            maxLength={MAX_CHARACTERS}
                        />
                        <CharacterCount isNearLimit={isNearLimit}>
                            {characterCount} / {MAX_CHARACTERS}
                        </CharacterCount>
                    </FormGroup>

                    <FormActions>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            disabled={isSubmitting || isLoading}
                        >
                            <FiX /> Annuler
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={isSubmitting || isLoading || !message.trim()}
                        >
                            {isSubmitting || isLoading ? 'Mise à jour...' : 'Mettre à jour'}
                        </Button>
                    </FormActions>
                </form>
            </ModalContent>
        </ModalOverlay>
    );
};

export default UpdateStatusMessageModal;
