import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiX, FiSave } from 'react-icons/fi';
import { Offer } from '../hooks/useOffer';
import { colors, spacing, borderRadius, shadows } from '../config/theme';

interface OfferModalProps {
  isOpen: boolean;
  offer: Offer | null;
  onClose: () => void;
  onSubmit: (data: Partial<Offer>) => Promise<void>;
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
  background: ${colors.surface};
  border-radius: ${borderRadius.lg};
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${shadows.lg};
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
  border-bottom: 1px solid ${colors.border};
  padding-bottom: 1rem;

  h2 {
    font-size: 1.5rem;
    color: ${colors.textPrimary};
    margin: 0;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${colors.textSecondary};
  font-size: 1.5rem;
  padding: 0;
  transition: color 0.3s ease;

  &:hover {
    color: ${colors.textPrimary};
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${colors.textPrimary};
  margin-bottom: ${spacing.sm};
`;

const Input = styled.input`
  width: 100%;
  padding: ${spacing.md};
  border: 1px solid ${colors.border};
  border-radius: ${borderRadius.md};
  font-size: 0.875rem;
  color: ${colors.textPrimary};
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.1);
  }

  &:disabled {
    background-color: ${colors.neutral};
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: ${spacing.md};
  border: 1px solid ${colors.border};
  border-radius: ${borderRadius.md};
  font-size: 0.875rem;
  color: ${colors.textPrimary};
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.1);
  }

  &:disabled {
    background-color: ${colors.neutral};
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: ${spacing.md};
  border: 1px solid ${colors.border};
  border-radius: ${borderRadius.md};
  font-size: 0.875rem;
  color: ${colors.textPrimary};
  background-color: ${colors.surface};
  cursor: pointer;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.1);
  }

  &:disabled {
    background-color: ${colors.neutral};
    cursor: not-allowed;
  }
`;

const RowGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  gap: ${spacing.md};
  align-items: center;
`;

const Checkbox = styled.input`
  cursor: pointer;
  width: 18px;
  height: 18px;
`;

const ModalFooter = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  border-top: 1px solid ${colors.border};
  padding-top: 1rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.md} ${spacing.lg};
  border: none;
  border-radius: ${borderRadius.md};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  background-color: ${(props) =>
    props.variant === 'secondary' ? colors.neutral : colors.primary};
  color: ${(props) =>
    props.variant === 'secondary' ? colors.textPrimary : colors.surface};

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const OfferModal: React.FC<OfferModalProps> = ({
  isOpen,
  offer,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<Partial<Offer>>({
    name: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 0,
    original_price: 0,
    is_active: true,
    is_deleted: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (offer) {
      setFormData(offer);
    } else {
      setFormData({
        name: '',
        description: '',
        discount_type: 'percentage',
        discount_value: 0,
        original_price: 0,
        is_active: true,
        is_deleted: false,
      });
    }
    setErrors({});
  }, [offer, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.company_id?.trim()) {
      newErrors.company_id = 'Company ID is required';
    }
    if (
      formData.original_price === undefined ||
      formData.original_price <= 0
    ) {
      newErrors.original_price = 'Price must be greater than 0';
    }
    if (
      formData.discount_value === undefined ||
      formData.discount_value < 0
    ) {
      newErrors.discount_value = 'Discount value cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (type === 'number') {
      setFormData((prev) => ({
        ...prev,
        [name]: parseFloat(value) || 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>{offer ? 'Edit Offer' : 'Create New Offer'}</h2>
          <CloseButton onClick={onClose} disabled={isLoading}>
            <FiX />
          </CloseButton>
        </ModalHeader>

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <FormGroup>
            <Label>Offer Name *</Label>
            <Input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              placeholder="e.g., Summer Sale"
              disabled={isLoading}
            />
            {errors.name && (
              <p style={{ color: colors.error, fontSize: '0.75rem', marginTop: spacing.sm }}>
                {errors.name}
              </p>
            )}
          </FormGroup>

          <FormGroup>
            <Label>Company ID *</Label>
            <Input
              type="text"
              name="company_id"
              value={formData.company_id || ''}
              onChange={handleChange}
              placeholder="Your company ID"
              disabled={isLoading}
            />
            {errors.company_id && (
              <p style={{ color: colors.error, fontSize: '0.75rem', marginTop: spacing.sm }}>
                {errors.company_id}
              </p>
            )}
          </FormGroup>

          <FormGroup>
            <Label>Description</Label>
            <TextArea
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              placeholder="Describe your offer..."
              disabled={isLoading}
            />
          </FormGroup>

          {/* Pricing */}
          <FormGroup>
            <Label>Original Price *</Label>
            <Input
              type="number"
              name="original_price"
              value={formData.original_price || 0}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              disabled={isLoading}
            />
            {errors.original_price && (
              <p style={{ color: colors.error, fontSize: '0.75rem', marginTop: spacing.sm }}>
                {errors.original_price}
              </p>
            )}
          </FormGroup>

          {/* Discount */}
          <RowGrid>
            <FormGroup>
              <Label>Discount Type</Label>
              <Select
                name="discount_type"
                value={formData.discount_type || 'percentage'}
                onChange={handleChange}
                disabled={isLoading}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Discount Value</Label>
              <Input
                type="number"
                name="discount_value"
                value={formData.discount_value || 0}
                onChange={handleChange}
                placeholder="0"
                step="0.01"
                min="0"
                disabled={isLoading}
              />
              {errors.discount_value && (
                <p style={{ color: colors.error, fontSize: '0.75rem', marginTop: spacing.sm }}>
                  {errors.discount_value}
                </p>
              )}
            </FormGroup>
          </RowGrid>

          {/* Status */}
          <FormGroup>
            <CheckboxGroup>
              <Checkbox
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active || false}
                onChange={handleChange}
                disabled={isLoading}
              />
              <Label htmlFor="is_active" style={{ margin: 0 }}>
                Active
              </Label>
            </CheckboxGroup>
          </FormGroup>

          {/* Footer */}
          <ModalFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              <FiSave /> {isLoading ? 'Saving...' : 'Save Offer'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};
