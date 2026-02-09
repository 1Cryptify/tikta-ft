import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiX } from 'react-icons/fi';

interface UpdateStatusMessageModalProps {
    isOpen: boolean;
    businessName: string;
    currentMessage?: string;
    currentType?: 'positive' | 'negative';
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
    background: rgba(0, 0, 0, 0.5);
    z-index: 9998;
    align-items: center;
    justify-content: center;
    padding: 1rem;
`;

const ModalContent = styled.div`
    background: white;
    border-radius: 12px;
    padding: 2rem;
    max-width: 500px;
    width: 100%;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
    margin: 0;
    font-size: 1.5rem;
    color: #1a1a1a;
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.3s ease;

    &:hover {
        color: #000;
    }
`;

const FormGroup = styled.div`
    margin-bottom: 1.5rem;
`;

const Label = styled.label`
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #1a1a1a;
    font-size: 0.95rem;
`;

const TypeSelector = styled.div`
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
`;

const TypeOption = styled.label<{ selected: boolean }>`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border: 2px solid ${(props) => (props.selected ? '#007bff' : '#ddd')};
    border-radius: 6px;
    cursor: pointer;
    background: ${(props) => (props.selected ? '#e7f3ff' : 'white')};
    transition: all 0.3s ease;

    &:hover {
        border-color: #007bff;
    }

    input {
        margin: 0;
        cursor: pointer;
    }
`;

const Textarea = styled.textarea`
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 0.95rem;
    font-family: inherit;
    resize: vertical;
    min-height: 120px;
    transition: border-color 0.3s ease;

    &:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    }
`;

const CharCount = styled.small`
    display: block;
    margin-top: 0.5rem;
    color: #999;
    font-size: 0.85rem;
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 2rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;

    background-color: ${(props) => (props.variant === 'primary' ? '#007bff' : '#6c757d')};
    color: white;

    &:hover:not(:disabled) {
        opacity: 0.9;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }
`;

const ErrorMessage = styled.div`
    color: #dc3545;
    padding: 0.75rem;
    background: #f8d7da;
    border: 1px solid #f5c6cb;
    border-radius: 6px;
    margin-bottom: 1rem;
    font-size: 0.9rem;
`;

const UpdateStatusMessageModal: React.FC<UpdateStatusMessageModalProps> = ({
    isOpen,
    businessName,
    currentMessage = '',
    currentType = 'positive',
    onClose,
    onSubmit,
    isLoading = false,
}) => {
    const [message, setMessage] = useState(currentMessage);
    const [type, setType] = useState<'positive' | 'negative'>(currentType);
    const [error, setError] = useState('');

    useEffect(() => {
        setMessage(currentMessage);
        setType(currentType);
        setError('');
    }, [currentMessage, currentType, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!message.trim()) {
            setError('Le message ne peut pas être vide');
            return;
        }

        if (message.length > 500) {
            setError('Le message ne doit pas dépasser 500 caractères');
            return;
        }

        try {
            await onSubmit(message, type);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        }
    };

    return (
        <ModalOverlay isOpen={isOpen} onClick={onClose}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                    <ModalTitle>Mettre à jour le statut</ModalTitle>
                    <CloseButton onClick={onClose} title="Close" disabled={isLoading}>
                        <FiX />
                    </CloseButton>
                </ModalHeader>

                <form onSubmit={handleSubmit}>
                    {error && <ErrorMessage>{error}</ErrorMessage>}

                    <FormGroup>
                        <Label>Entreprise</Label>
                        <div style={{ padding: '0.75rem', background: '#f8f9fa', borderRadius: '6px', color: '#666' }}>
                            {businessName}
                        </div>
                    </FormGroup>

                    <FormGroup>
                        <Label>Type de message</Label>
                        <TypeSelector>
                            <TypeOption selected={type === 'positive'}>
                                <input
                                    type="radio"
                                    name="type"
                                    value="positive"
                                    checked={type === 'positive'}
                                    onChange={() => setType('positive')}
                                    disabled={isLoading}
                                />
                                <span>✓ Positif</span>
                            </TypeOption>
                            <TypeOption selected={type === 'negative'}>
                                <input
                                    type="radio"
                                    name="type"
                                    value="negative"
                                    checked={type === 'negative'}
                                    onChange={() => setType('negative')}
                                    disabled={isLoading}
                                />
                                <span>✗ Négatif</span>
                            </TypeOption>
                        </TypeSelector>
                    </FormGroup>

                    <FormGroup>
                        <Label>Message</Label>
                        <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Entrez le message de statut..."
                            disabled={isLoading}
                        />
                        <CharCount>
                            {message.length} / 500 caractères
                        </CharCount>
                    </FormGroup>

                    <ButtonGroup>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Mise à jour...' : 'Mettre à jour'}
                        </Button>
                    </ButtonGroup>
                </form>
            </ModalContent>
        </ModalOverlay>
    );
};

export default UpdateStatusMessageModal;
