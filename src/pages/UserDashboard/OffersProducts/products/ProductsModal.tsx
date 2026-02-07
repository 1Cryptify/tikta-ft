import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useProduct, Product } from '../../../../hooks/useProduct';
import { colors, spacing, borderRadius } from '../../../../config/theme';
import { FiX, FiLoader } from 'react-icons/fi';

const ModalOverlay = styled.div<{ isOpen?: boolean }>`
  display: ${props => props.isOpen ? 'flex' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 200ms ease-in-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalContent = styled.div`
  background: ${colors.surface};
  border-radius: ${borderRadius.lg};
  padding: ${spacing.xxl};
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  animation: slideIn 300ms ease-out;

  @keyframes slideIn {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${spacing.xl};
  border-bottom: 1px solid ${colors.border};
  padding-bottom: ${spacing.lg};

  h2 {
    margin: 0;
    font-size: 1.5rem;
    color: ${colors.textPrimary};
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: ${spacing.sm};
  color: ${colors.textSecondary};
  transition: color 200ms ease-in-out;

  &:hover {
    color: ${colors.textPrimary};
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const FormGroup = styled.div`
  margin-bottom: ${spacing.lg};

  label {
    display: block;
    font-weight: 600;
    color: ${colors.textPrimary};
    margin-bottom: ${spacing.sm};
    font-size: 0.875rem;
  }

  input,
  textarea,
  select {
    width: 100%;
    padding: ${spacing.md} ${spacing.lg};
    border: 1px solid ${colors.border};
    border-radius: ${borderRadius.md};
    font-family: inherit;
    font-size: 0.875rem;
    color: ${colors.textPrimary};
    background: ${colors.neutral};
    transition: all 200ms ease-in-out;

    &:focus {
      outline: none;
      border-color: ${colors.primary};
      background: ${colors.surface};
      box-shadow: 0 0 0 3px ${colors.primaryLight}33;
    }

    &::placeholder {
      color: ${colors.textSecondary};
    }
  }

  textarea {
    resize: vertical;
    min-height: 80px;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  margin-top: ${spacing.md};

  input[type='checkbox'] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  label {
    margin: 0;
    cursor: pointer;
    font-weight: 500;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${spacing.lg};
  margin-top: ${spacing.xxl};
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: ${spacing.lg} ${spacing.xl};
  border: none;
  border-radius: ${borderRadius.md};
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 200ms ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.sm};

  background: ${props => props.variant === 'secondary' ? colors.border : colors.primary};
  color: ${props => props.variant === 'secondary' ? colors.textPrimary : colors.surface};

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const ErrorMessage = styled.div`
  background: #fee2e2;
  border: 1px solid ${colors.error};
  color: ${colors.error};
  padding: ${spacing.md} ${spacing.lg};
  border-radius: ${borderRadius.md};
  font-size: 0.875rem;
  margin-bottom: ${spacing.lg};
`;

interface ProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  companyId: string;
}

export const ProductsModal: React.FC<ProductsModalProps> = ({ isOpen, onClose, product, companyId }) => {
  const { isLoading, error, createProduct, updateProduct } = useProduct();
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    currency: 'XAF',
    sku: '',
    is_active: true,
    company_id: companyId,
  });

  useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        currency: 'XAF',
        sku: '',
        is_active: true,
        company_id: companyId,
      });
    }
  }, [product, companyId, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'price') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (product?.id) {
        await updateProduct(product.id, formData);
      } else {
        await createProduct(formData);
      }
      onClose();
    } catch (err) {
      console.error('Erreur lors de la soumission:', err);
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>{product?.id ? 'Modifier le produit' : 'Créer un produit'}</h2>
          <CloseButton onClick={onClose}>
            <FiX />
          </CloseButton>
        </ModalHeader>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <label htmlFor="name">Nom du produit *</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Ex: Produit Premium"
              value={formData.name || ''}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              placeholder="Décrivez votre produit..."
              value={formData.description || ''}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <label htmlFor="price">Prix *</label>
            <input
              id="price"
              name="price"
              type="number"
              required
              min="0"
              step="0.01"
              placeholder="0.00"
              value={formData.price || ''}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <label htmlFor="currency">Devise</label>
            <select
              id="currency"
              name="currency"
              value={formData.currency || 'XAF'}
              onChange={handleChange}
            >
              <option value="XAF">XAF (Franc CFA)</option>
              <option value="USD">USD (Dollar)</option>
              <option value="EUR">EUR (Euro)</option>
              <option value="GBP">GBP (Livre)</option>
            </select>
          </FormGroup>

          <FormGroup>
            <label htmlFor="sku">SKU</label>
            <input
              id="sku"
              name="sku"
              type="text"
              placeholder="Ex: SKU-001"
              value={formData.sku || ''}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <CheckboxGroup>
              <input
                id="is_active"
                name="is_active"
                type="checkbox"
                checked={formData.is_active || false}
                onChange={handleChange}
              />
              <label htmlFor="is_active">Produit actif</label>
            </CheckboxGroup>
          </FormGroup>

          <ButtonGroup>
            <Button variant="secondary" type="button" onClick={onClose}>
              Annuler
            </Button>
            <Button variant="primary" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <FiLoader /> Traitement...
                </>
              ) : (
                product?.id ? 'Mettre à jour' : 'Créer'
              )}
            </Button>
          </ButtonGroup>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};
