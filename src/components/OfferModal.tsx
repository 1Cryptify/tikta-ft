import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiX, FiSave, FiAlertCircle, FiUpload, FiEdit3, FiImage } from 'react-icons/fi';
import { Offer, Currency } from '../hooks/useOffer';
import { useAuth } from '../hooks/useAuth';
import { useBusiness } from '../hooks/useBusiness';
import { colors, spacing, borderRadius, shadows } from '../config/theme';
import { getMediaUrl } from '../services/api';
import { OfferVisual } from './OfferVisual';
import {
  OFFER_ILLUSTRATIONS,
  OFFER_BACKGROUNDS,
  DEFAULT_OFFER_BACKGROUND_ID,
  getOfferBackground,
} from '../config/offerIllustrations';

interface OfferModalProps {
  isOpen: boolean;
  offer: Offer | null;
  onClose: () => void;
  onSubmit: (data: Partial<Offer>, imageFile?: File | null) => Promise<void>;
  isLoading?: boolean;
  currencies?: Currency[];
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

const WarningBanner = styled.div`
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: ${borderRadius.md};
  padding: 1rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  color: #856404;
  font-size: 0.875rem;

  svg {
    flex-shrink: 0;
  }
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

const TripleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr 1fr;
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

const VisualModeTabs = styled.div`
  display: inline-flex;
  padding: 4px;
  gap: 4px;
  background-color: ${colors.neutral};
  border: 1px solid ${colors.border};
  border-radius: ${borderRadius.md};
  margin-bottom: ${spacing.md};
`;

const VisualModeTab = styled.button<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
  padding: ${spacing.sm} ${spacing.md};
  border: none;
  border-radius: ${borderRadius.sm};
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${(props) => (props.isActive ? colors.surface : 'transparent')};
  color: ${(props) => (props.isActive ? colors.primary : colors.textSecondary)};
  box-shadow: ${(props) => (props.isActive ? shadows.sm : 'none')};

  &:hover {
    color: ${colors.primary};
  }
`;

const VisualPreview = styled.div`
  width: 100%;
  height: 140px;
  border-radius: ${borderRadius.md};
  overflow: hidden;
  border: 1px solid ${colors.border};
  background-color: ${colors.neutral};
  margin-bottom: ${spacing.md};
`;

const ThemeBlock = styled.div`
  margin-bottom: ${spacing.md};

  &:last-child {
    margin-bottom: 0;
  }
`;

const ThemeTitle = styled.p`
  margin: 0 0 ${spacing.sm} 0;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: ${colors.textSecondary};
`;

const IconGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(58px, 1fr));
  gap: ${spacing.sm};
`;

const IconButton = styled.button<{ isSelected: boolean }>`
  position: relative;
  aspect-ratio: 1 / 1;
  border-radius: ${borderRadius.md};
  border: 2px solid ${(props) => (props.isSelected ? colors.primary : 'transparent')};
  box-shadow: ${(props) => (props.isSelected ? shadows.md : 'none')};
  cursor: pointer;
  padding: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${shadows.md};
  }
`;

const BackgroundGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.sm};
`;

const BackgroundSwatch = styled.button<{ isSelected: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: ${borderRadius.full};
  border: 2px solid ${(props) => (props.isSelected ? colors.primary : 'transparent')};
  outline: 1px solid ${colors.border};
  cursor: pointer;
  padding: 0;
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: scale(1.08);
    box-shadow: ${shadows.sm};
  }
`;

const ImageUploadArea = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${spacing.sm};
  width: 100%;
  padding: ${spacing.xl};
  border: 2px dashed ${colors.border};
  border-radius: ${borderRadius.md};
  color: ${colors.textSecondary};
  font-size: 0.8rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease;

  &:hover {
    border-color: ${colors.primary};
    background-color: rgba(30, 58, 95, 0.03);
  }

  input {
    display: none;
  }
`;

const FieldHint = styled.p`
  color: ${colors.textSecondary};
  font-size: 0.75rem;
  margin: ${spacing.sm} 0 0 0;
`;

const ClearVisualLink = styled.button`
  margin-top: ${spacing.sm};
  border: none;
  background: none;
  padding: 0;
  color: ${colors.error};
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

export const OfferModal: React.FC<OfferModalProps> = ({
  isOpen,
  offer,
  onClose,
  onSubmit,
  isLoading = false,
  currencies = [],
}) => {
  const { user } = useAuth();
  const { businesses } = useBusiness();

  const [formData, setFormData] = useState<Partial<Offer>>({
    name: '',
    description: '',
    price: undefined,
    currency_id: '',
    discount_type: 'percentage',
    discount_value: undefined,
    duration_days: 0,
    duration_hours: 0,
    duration_minutes: 0,
    is_active: true,
    is_deleted: false,
    icon: null,
    icon_background: DEFAULT_OFFER_BACKGROUND_ID,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [visualMode, setVisualMode] = useState<'image' | 'illustration'>('illustration');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (offer) {
      setFormData({
        ...offer,
        icon_background: offer.icon_background || DEFAULT_OFFER_BACKGROUND_ID,
      });
      setVisualMode(offer.image ? 'image' : 'illustration');
    } else {
      // For new offers, auto-select active company if user is not superuser
      const initialCompanyId = 
        user && !user.is_superuser && user.active_company
          ? user.active_company.id
          : undefined;

      setFormData({
        name: '',
        description: '',
        company_id: initialCompanyId,
        price: undefined,
        currency_id: currencies.length > 0 ? currencies[0].id : '',
        discount_type: 'percentage',
        discount_value: undefined,
        duration_days: 0,
        duration_hours: 0,
        duration_minutes: 0,
        callback_url: '',
        is_active: true,
        is_deleted: false,
        icon: null,
        icon_background: DEFAULT_OFFER_BACKGROUND_ID,
      });
      setVisualMode('illustration');
    }
    setImageFile(null);
    setImagePreview(null);
    setErrors({});
  }, [offer, isOpen, user, currencies]);

  const handleVisualImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    // Une image téléversée remplace l'illustration.
    setFormData((prev) => ({ ...prev, icon: null }));
  };

  const handleSelectIllustration = (iconId: string) => {
    setFormData((prev) => ({
      ...prev,
      icon: prev.icon === iconId ? null : iconId,
      icon_background: prev.icon_background || DEFAULT_OFFER_BACKGROUND_ID,
    }));
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSelectBackground = (backgroundId: string) => {
    setFormData((prev) => ({ ...prev, icon_background: backgroundId }));
  };

  const handleClearVisual = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, icon: null, icon_background: DEFAULT_OFFER_BACKGROUND_ID }));
  };


  const selectedCompany = businesses.find(b => b.id === formData.company_id);
  const isSelectedCompanyVerified = !!selectedCompany?.is_verified;
  const selectedBackground = getOfferBackground(formData.icon_background);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.company_id?.trim()) {
      newErrors.company_id = 'Company ID is required';
    } else if (!isSelectedCompanyVerified) {
      newErrors.company_id = 'Selected company is not verified. Verification is required to create an offer.';
    }
    if (formData.price === undefined || formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }
    if (!formData.currency_id?.trim()) {
      newErrors.currency_id = 'Currency is required';
    }
    if (formData.discount_value != null && formData.discount_value < 0) {
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
      const parsed = parseFloat(value);
      setFormData((prev) => ({
        ...prev,
        [name]: value === '' || Number.isNaN(parsed) ? undefined : parsed,
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
      await onSubmit(formData, imageFile);
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
          {formData.company_id && !isSelectedCompanyVerified && (
            <WarningBanner>
              <FiAlertCircle size={20} />
              <span>The selected company is not verified. You cannot create or edit an offer for a non-verified company.</span>
            </WarningBanner>
          )}

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
            <Label>Company *</Label>
            {user?.is_superuser ? (
              <Select
                name="company_id"
                value={formData.company_id || ''}
                onChange={handleChange}
                disabled={isLoading || businesses.length === 0}
              >
                <option value="">Select a company</option>
                {businesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.name} {business.nui ? `(${business.nui})` : ''}
                  </option>
                ))}
              </Select>
            ) : (
              <Input
                type="text"
                name="company_display"
                value={
                  user?.active_company
                    ? `${user.active_company.name}`
                    : 'No active company'
                }
                disabled
                title="Your active company is selected automatically"
                style={{ backgroundColor: colors.neutral, cursor: 'not-allowed' }}
              />
            )}
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

          {/* Visuel : image ou illustration */}
          <FormGroup>
            <Label>Visuel de l'offre</Label>

            <VisualModeTabs>
              <VisualModeTab
                type="button"
                isActive={visualMode === 'illustration'}
                onClick={() => setVisualMode('illustration')}
              >
                <FiEdit3 size={14} /> Illustration
              </VisualModeTab>
              <VisualModeTab
                type="button"
                isActive={visualMode === 'image'}
                onClick={() => setVisualMode('image')}
              >
                <FiImage size={14} /> Image
              </VisualModeTab>
            </VisualModeTabs>

            <VisualPreview>
              {visualMode === 'image' ? (
                imagePreview || offer?.image ? (
                  <img
                    src={imagePreview || getMediaUrl(offer?.image)}
                    alt="Aperçu"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '100%',
                      color: colors.textSecondary,
                      fontSize: '0.8rem',
                    }}
                  >
                    Aucune image
                  </div>
                )
              ) : (
                <OfferVisual
                  icon={formData.icon}
                  background={formData.icon_background}
                  placeholder={
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%',
                        color: colors.textSecondary,
                        fontSize: '0.8rem',
                      }}
                    >
                      Choisissez une illustration
                    </div>
                  }
                />
              )}
            </VisualPreview>

            {visualMode === 'illustration' ? (
              <>
                <FieldHint>
                  À défaut d'image, choisissez une icône et un fond cohérent. La galerie compte{' '}
                  {OFFER_ILLUSTRATIONS.length} illustrations.
                </FieldHint>

                <IconGrid style={{ marginTop: spacing.md }}>
                  {OFFER_ILLUSTRATIONS.map((illustration) => {
                    const Icon = illustration.Icon;
                    return (
                      <IconButton
                        key={illustration.id}
                        type="button"
                        title={illustration.label}
                        aria-label={illustration.label}
                        isSelected={formData.icon === illustration.id}
                        style={{
                          background: selectedBackground.gradient,
                          color: selectedBackground.iconColor,
                        }}
                        onClick={() => handleSelectIllustration(illustration.id)}
                        disabled={isLoading}
                      >
                        <Icon size="62%" aria-hidden="true" />
                      </IconButton>
                    );
                  })}
                </IconGrid>

                <ThemeBlock style={{ marginTop: spacing.md }}>
                  <ThemeTitle>Fond</ThemeTitle>
                  <BackgroundGrid>
                    {OFFER_BACKGROUNDS.map((bg) => (
                      <BackgroundSwatch
                        key={bg.id}
                        type="button"
                        title={bg.label}
                        aria-label={bg.label}
                        isSelected={formData.icon_background === bg.id}
                        style={{ background: bg.gradient }}
                        onClick={() => handleSelectBackground(bg.id)}
                        disabled={isLoading}
                      />
                    ))}
                  </BackgroundGrid>
                </ThemeBlock>

                {(formData.icon || imageFile || offer?.image) && (
                  <ClearVisualLink type="button" onClick={handleClearVisual} disabled={isLoading}>
                    Retirer le visuel
                  </ClearVisualLink>
                )}
              </>
            ) : (
              <>
                <ImageUploadArea>
                  <FiUpload size={20} />
                  <span>{imagePreview || offer?.image ? "Changer l'image" : 'Téléverser une image'}</span>
                  <span style={{ fontSize: '0.72rem' }}>JPEG, PNG, GIF ou WebP — max 5 Mo</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleVisualImageChange}
                    disabled={isLoading}
                  />
                </ImageUploadArea>
                <FieldHint>
                  Une image téléversée remplace l'illustration. Vous pouvez aussi changer l'image
                  depuis la carte de l'offre.
                </FieldHint>
              </>
            )}
          </FormGroup>

          {/* Pricing */}
          <RowGrid>
            <FormGroup>
              <Label>Price *</Label>
              <Input
                type="number"
                name="price"
                value={formData.price ?? ''}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                disabled={isLoading}
              />
              {errors.price && (
                <p style={{ color: colors.error, fontSize: '0.75rem', marginTop: spacing.sm }}>
                  {errors.price}
                </p>
              )}
            </FormGroup>

            <FormGroup>
              <Label>Currency *</Label>
              <Select
                name="currency_id"
                value={formData.currency_id || ''}
                onChange={handleChange}
                disabled={isLoading || currencies.length === 0}
              >
                <option value="">Select a currency</option>
                {currencies.map((currency) => (
                  <option key={currency.id} value={currency.id}>
                    {currency.name} ({currency.symbol})
                  </option>
                ))}
              </Select>
              {errors.currency_id && (
                <p style={{ color: colors.error, fontSize: '0.75rem', marginTop: spacing.sm }}>
                  {errors.currency_id}
                </p>
              )}
            </FormGroup>
          </RowGrid>

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
                value={formData.discount_value ?? ''}
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

          {/* Validité / durée du ticket */}
          <FormGroup>
            <Label>Durée de validité du ticket</Label>
            <TripleGrid>
              <div>
                <Input
                  type="number"
                  name="duration_days"
                  value={formData.duration_days ?? 0}
                  onChange={handleChange}
                  placeholder="Jours"
                  step="1"
                  min="0"
                  disabled={isLoading}
                />
                <p style={{ color: colors.textSecondary, fontSize: '0.7rem', marginTop: 4 }}>Jours</p>
              </div>
              <div>
                <Input
                  type="number"
                  name="duration_hours"
                  value={formData.duration_hours ?? 0}
                  onChange={handleChange}
                  placeholder="Heures"
                  step="1"
                  min="0"
                  disabled={isLoading}
                />
                <p style={{ color: colors.textSecondary, fontSize: '0.7rem', marginTop: 4 }}>Heures</p>
              </div>
              <div>
                <Input
                  type="number"
                  name="duration_minutes"
                  value={formData.duration_minutes ?? 0}
                  onChange={handleChange}
                  placeholder="Minutes"
                  step="1"
                  min="0"
                  disabled={isLoading}
                />
                <p style={{ color: colors.textSecondary, fontSize: '0.7rem', marginTop: 4 }}>Minutes</p>
              </div>
            </TripleGrid>
            <p style={{ color: colors.textSecondary, fontSize: '0.75rem', marginTop: spacing.sm }}>
              Durée accordée au ticket à partir de sa première activation (ex. 2 jours, 1 heure et 30 minutes).
            </p>
          </FormGroup>

          {/* Callback URL */}
          <FormGroup>
            <Label>Callback URL</Label>
            <Input
              type="url"
              name="callback_url"
              value={formData.callback_url || ''}
              onChange={handleChange}
              placeholder="http://192.168.1.1/login"
              disabled={isLoading}
            />
            <p style={{ color: colors.textSecondary, fontSize: '0.75rem', marginTop: spacing.sm }}>
              URL du portail de connexion vers lequel le client est redirigé automatiquement après paiement.
              Exemple avec une IP locale : <code>http://192.168.1.1/login</code> — ou un nom de domaine local :{' '}
              <code>http://portail.local/login</code>. Les identifiants (<code>login</code> et <code>password</code>)
              sont ajoutés automatiquement à l'URL.
            </p>
          </FormGroup>

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
