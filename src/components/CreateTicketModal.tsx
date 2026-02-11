import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiX, FiPlus } from 'react-icons/fi';
import { colors, spacing } from '../config/theme';
import { Ticket } from '../hooks/useTicket';
import { useOffer, Offer } from '../hooks/useOffer';
import { useAuth } from '../hooks/useAuth';
import { useBusiness, Business } from '../hooks/useBusiness';

interface CreateTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<Ticket> & { valid_until: string; offer_id?: string; payment_id?: string; company_id?: string }) => Promise<void>;
    isLoading: boolean;
}

const Overlay = styled.div<{ isOpen: boolean }>`
    display: ${props => props.isOpen ? 'block' : 'none'};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
`;

const Modal = styled.div`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border-radius: 8px;
    padding: ${spacing.lg};
    max-width: 500px;
    width: 90%;
    z-index: 1000;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    max-height: 90vh;
    overflow-y: auto;
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${spacing.lg};
    padding-bottom: ${spacing.md};
    border-bottom: 1px solid #e0e0e0;

    h2 {
        margin: 0;
        color: ${colors.textPrimary};
        font-size: 1.25rem;
    }
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    color: ${colors.textSecondary};
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        color: ${colors.textPrimary};
    }

    svg {
        width: 20px;
        height: 20px;
    }
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: ${spacing.md};
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const Label = styled.label`
    color: ${colors.textPrimary};
    font-weight: 600;
    font-size: 0.875rem;
`;

const Input = styled.input`
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.875rem;
    font-family: inherit;

    &:focus {
        outline: none;
        border-color: ${colors.primary};
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    }

    &:disabled {
        background: #f5f5f5;
        cursor: not-allowed;
    }
`;

const Select = styled.select`
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.875rem;
    font-family: inherit;

    &:focus {
        outline: none;
        border-color: ${colors.primary};
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    }

    &:disabled {
        background: #f5f5f5;
        cursor: not-allowed;
    }
`;

const TextArea = styled.textarea`
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.875rem;
    font-family: inherit;
    resize: vertical;
    min-height: 80px;

    &:focus {
        outline: none;
        border-color: ${colors.primary};
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    }

    &:disabled {
        background: #f5f5f5;
        cursor: not-allowed;
    }
`;

const FormActions = styled.div`
    display: flex;
    gap: ${spacing.sm};
    justify-content: flex-end;
    margin-top: ${spacing.lg};
    padding-top: ${spacing.md};
    border-top: 1px solid #e0e0e0;
`;

const CancelButton = styled.button`
    padding: 8px 16px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
    color: ${colors.textPrimary};
    cursor: pointer;
    font-weight: 600;
    font-size: 0.875rem;
    transition: all 0.2s ease;

    &:hover {
        background: #f5f5f5;
        border-color: #999;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const SubmitButton = styled.button`
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    background: #007bff;
    color: white;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: all 0.2s ease;

    &:hover {
        background: #0056b3;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    svg {
        width: 16px;
        height: 16px;
    }
`;

const ErrorMessage = styled.div`
    color: #d32f2f;
    background: #ffebee;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 0.875rem;
`;

const SuccessMessage = styled.div`
    color: #155724;
    background: #d4edda;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 0.875rem;
`;

const CreateTicketModal: React.FC<CreateTicketModalProps> = ({ isOpen, onClose, onSubmit, isLoading }) => {
    const { offers } = useOffer();
    const { user } = useAuth();
    const { businesses, getBusinesses } = useBusiness();
    const [formData, setFormData] = useState({
        ticket_id: '',
        password: '',
        valid_until: '',
        offer_id: '',
        payment_id: '',
        company_id: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [selectedOfferName, setSelectedOfferName] = useState<string>('');

    const isSuperuser = user?.is_superuser || false;

    // Fetch companies when modal opens for superusers
    useEffect(() => {
        if (isOpen && isSuperuser) {
            getBusinesses();
        }
    }, [isOpen, isSuperuser, getBusinesses]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCompanyId = e.target.value;
        setFormData(prev => ({ ...prev, company_id: selectedCompanyId }));
    };

    const handleOfferChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOfferId = e.target.value;
        const selectedOffer = offers.find(o => o.id === selectedOfferId);

        if (selectedOffer) {
            setFormData(prev => ({ ...prev, offer_id: selectedOfferId }));
            setSelectedOfferName(selectedOffer.name);
        } else {
            setFormData(prev => ({ ...prev, offer_id: '' }));
            setSelectedOfferName('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        // Clear autofill on form submission
        const formElement = e.currentTarget as HTMLFormElement;
        const inputs = formElement.querySelectorAll('input');
        inputs.forEach(input => {
            if (input.id === 'ticket_id' || input.id === 'password') {
                setTimeout(() => {
                    input.value = '';
                }, 0);
            }
        });

        // Validation
        if (!formData.ticket_id.trim()) {
            setError('Ticket ID is required');
            return;
        }
        if (!formData.password.trim()) {
            setError('Password is required');
            return;
        }
        if (!formData.valid_until) {
            setError('Valid until date is required');
            return;
        }
        if (isSuperuser && !formData.company_id) {
            setError('Company is required for superusers');
            return;
        }

        try {
            await onSubmit(formData);
            setSuccess('Ticket created successfully');
            setFormData({
                ticket_id: '',
                password: '',
                valid_until: '',
                offer_id: '',
                payment_id: '',
                company_id: '',
            });
            setSelectedOfferName('');
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create ticket');
        }
    };

    return (
        <>
            <Overlay isOpen={isOpen} onClick={onClose} />
            {isOpen && (
                <Modal>
                    <ModalHeader>
                        <h2>Create New Ticket</h2>
                        <CloseButton onClick={onClose} disabled={isLoading}>
                            <FiX />
                        </CloseButton>
                    </ModalHeader>

                    {error && <ErrorMessage>{error}</ErrorMessage>}
                    {success && <SuccessMessage>{success}</SuccessMessage>}

                    <Form onSubmit={handleSubmit} autoComplete="off" data-lpignore="true" data-form-type="other">
                        <FormGroup>
                            <Label htmlFor="ticket_id">Ticket ID (User Identifier) *</Label>
                            <Input
                                id="ticket_id"
                                type="text"
                                name="ticket_id"
                                value={formData.ticket_id}
                                onChange={handleChange}
                                placeholder="Enter user identifier"
                                disabled={isLoading}
                                autoComplete="off"
                                data-lpignore="true"
                                spellCheck="false"
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="password">Password *</Label>
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter password"
                                disabled={isLoading}
                                autoComplete="new-password"
                                data-lpignore="true"
                            />
                        </FormGroup>

                        {isSuperuser && (
                            <FormGroup>
                                <Label htmlFor="company_id">Company *</Label>
                                <Select
                                    id="company_id"
                                    name="company_id"
                                    value={formData.company_id}
                                    onChange={handleCompanyChange}
                                    disabled={isLoading}
                                >
                                    <option value="">-- Select a company --</option>
                                    {businesses.map(company => (
                                        <option key={company.id} value={company.id}>
                                            {company.name}
                                        </option>
                                    ))}
                                </Select>
                            </FormGroup>
                        )}

                        <FormGroup>
                            <Label htmlFor="valid_until">Valid Until Date *</Label>
                            <Input
                                id="valid_until"
                                type="date"
                                name="valid_until"
                                value={formData.valid_until}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="offer_select">Select Offer (Auto-fill ID)</Label>
                            <Select
                                id="offer_select"
                                value={formData.offer_id}
                                onChange={handleOfferChange}
                                disabled={isLoading}
                            >
                                <option value="">-- Choose an offer --</option>
                                {offers.map(offer => (
                                    <option key={offer.id} value={offer.id}>
                                        {offer.name} {offer.price ? `($${offer.price})` : ''}
                                    </option>
                                ))}
                            </Select>
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="offer_id">Offer ID (Manual Entry)</Label>
                            <Input
                                id="offer_id"
                                type="text"
                                name="offer_id"
                                value={formData.offer_id}
                                onChange={handleChange}
                                placeholder="Or enter Offer ID manually"
                                disabled={isLoading}
                            />
                        </FormGroup>

                        <FormActions>
                            <CancelButton
                                type="button"
                                onClick={onClose}
                                disabled={isLoading}
                            >
                                Cancel
                            </CancelButton>
                            <SubmitButton type="submit" disabled={isLoading}>
                                <FiPlus /> Create Ticket
                            </SubmitButton>
                        </FormActions>
                    </Form>
                </Modal>
            )}
        </>
    );
};

export default CreateTicketModal;
