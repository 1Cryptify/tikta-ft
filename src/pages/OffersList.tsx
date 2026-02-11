import React, { useState, useMemo, useRef } from 'react';
import styled from 'styled-components';
import {
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiSearch,
    FiAlertCircle,
    FiCheck,
    FiX,
    FiEye,
    FiFolder,
    FiChevronRight,
    FiCopy,
    FiImage,
} from 'react-icons/fi';
import { useOffer, Offer, OfferGroup } from '../hooks/useOffer';
import { OfferModal } from '../components/OfferModal';
import { colors, spacing, borderRadius, shadows } from '../config/theme';
import { getMediaUrl } from '../services/api';

const Header = styled.div`
  margin-bottom: ${spacing.xxl};

  h2 {
    font-size: 1.5rem;
    color: ${colors.textPrimary};
    margin: 0;
  }

  p {
    color: ${colors.textSecondary};
    font-size: 0.875rem;
    margin: ${spacing.sm} 0 0 0;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: ${spacing.lg};
  align-items: center;
  margin-bottom: ${spacing.lg};
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchBox = styled.div`
  flex: 1;
  min-width: 250px;
  position: relative;

  input {
    width: 100%;
    padding: ${spacing.md} ${spacing.lg};
    padding-left: 2.5rem;
    border: 1px solid ${colors.border};
    border-radius: ${borderRadius.md};
    font-size: 0.875rem;
    transition: border-color 0.3s ease;

    &:focus {
      outline: none;
      border-color: ${colors.primary};
      box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.1);
    }
  }

  svg {
    position: absolute;
    left: ${spacing.lg};
    top: 50%;
    transform: translateY(-50%);
    color: ${colors.textSecondary};
    pointer-events: none;
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.md} ${spacing.lg};
  background-color: ${colors.primary};
  color: ${colors.surface};
  border: none;
  border-radius: ${borderRadius.md};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
    box-shadow: ${shadows.md};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorBanner = styled.div`
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: ${borderRadius.md};
  padding: ${spacing.lg};
  margin-bottom: ${spacing.lg};
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  color: ${colors.error};
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: ${colors.textSecondary};

  div {
    font-size: 0.875rem;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: ${colors.textSecondary};

  svg {
    font-size: 3rem;
    margin-bottom: ${spacing.lg};
    opacity: 0.5;
  }

  p {
    margin-bottom: ${spacing.md};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${spacing.lg};
  margin-bottom: ${spacing.lg};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: ${borderRadius.lg};
  padding: ${spacing.lg};
  transition: all 0.3s ease;
  box-shadow: ${shadows.sm};

  &:hover {
    box-shadow: ${shadows.md};
    transform: translateY(-2px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${spacing.md};
`;

const OfferImageContainer = styled.div`
  width: 100%;
  height: 160px;
  border-radius: ${borderRadius.md};
  overflow: hidden;
  margin-bottom: ${spacing.md};
  background-color: ${colors.neutral};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const OfferImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const OfferImagePlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${colors.textSecondary};
  font-size: 0.875rem;
  
  svg {
    font-size: 2rem;
    margin-bottom: ${spacing.sm};
    opacity: 0.5;
  }
`;

const ImageUploadButton = styled.button`
  position: absolute;
  bottom: ${spacing.sm};
  right: ${spacing.sm};
  background-color: rgba(30, 58, 95, 0.9);
  color: ${colors.surface};
  border: none;
  border-radius: ${borderRadius.md};
  padding: ${spacing.sm} ${spacing.md};
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${colors.primary};
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 1.125rem;
  color: ${colors.textPrimary};
  word-break: break-word;
`;

const Badge = styled.span<{ variant: 'active' | 'inactive' }>`
  display: inline-flex;
  align-items: center;
  gap: ${spacing.xs};
  padding: ${spacing.xs} ${spacing.sm};
  border-radius: ${borderRadius.full};
  font-size: 0.75rem;
  font-weight: 600;
  background-color: ${(props) =>
        props.variant === 'active' ? '#d1fae5' : '#fee2e2'};
  color: ${(props) => (props.variant === 'active' ? '#065f46' : '#991b1b')};
`;

const Description = styled.p`
  color: ${colors.textSecondary};
  font-size: 0.875rem;
  margin: 0 0 ${spacing.md} 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PriceSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${spacing.md};
  margin-bottom: ${spacing.lg};
  padding: ${spacing.md};
  background-color: ${colors.neutral};
  border-radius: ${borderRadius.md};

  div {
    display: flex;
    flex-direction: column;
  }

  label {
    font-size: 0.75rem;
    font-weight: 600;
    color: ${colors.textSecondary};
    margin-bottom: ${spacing.xs};
  }

  span {
    font-size: 1rem;
    font-weight: 600;
    color: ${colors.textPrimary};
  }
`;

const DiscountSection = styled.div`
  background-color: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: ${borderRadius.md};
  padding: ${spacing.md};
  margin-bottom: ${spacing.lg};
  display: flex;
  gap: ${spacing.md};
  align-items: center;

  label {
    font-size: 0.75rem;
    font-weight: 600;
    color: #b45309;
  }

  span {
    font-size: 1rem;
    font-weight: 600;
    color: #b45309;
  }
`;

const CardActions = styled.div`
  display: flex;
  gap: ${spacing.sm};
  border-top: 1px solid ${colors.border};
  padding-top: ${spacing.md};
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'danger' }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.xs};
  padding: ${spacing.md};
  border: 1px solid
    ${(props) => (props.variant === 'danger' ? colors.error : colors.border)};
  background-color: transparent;
  color: ${(props) =>
        props.variant === 'danger' ? colors.error : colors.primary};
  border-radius: ${borderRadius.md};
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background-color: ${(props) =>
        props.variant === 'danger'
            ? 'rgba(220, 38, 38, 0.05)'
            : 'rgba(30, 58, 95, 0.05)'};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const TabContainer = styled.div`
  display: flex;
  gap: ${spacing.md};
  margin-bottom: ${spacing.lg};
  border-bottom: 2px solid ${colors.border};
`;

const Tab = styled.button<{ isActive: boolean }>`
  padding: ${spacing.md} ${spacing.lg};
  background: none;
  border: none;
  border-bottom: 3px solid
    ${(props) => (props.isActive ? colors.primary : 'transparent')};
  color: ${(props) =>
        props.isActive ? colors.primary : colors.textSecondary};
  font-size: 0.95rem;
  font-weight: ${(props) => (props.isActive ? '600' : '500')};
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: -2px;
  display: flex;
  align-items: center;
  gap: ${spacing.sm};

  &:hover {
    color: ${(props) =>
        props.isActive ? colors.primary : colors.textPrimary};
  }
`;

const GroupCard = styled.div`
  background: ${colors.surface};
  border: 2px solid ${colors.border};
  border-radius: ${borderRadius.lg};
  padding: ${spacing.lg};
  transition: all 0.3s ease;
  box-shadow: ${shadows.sm};

  &:hover {
    box-shadow: ${shadows.md};
    transform: translateY(-2px);
    border-color: ${colors.primary};
  }
`;

const GroupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${spacing.lg};
  padding-bottom: ${spacing.lg};
  border-bottom: 1px solid ${colors.border};
`;

const GroupInfo = styled.div`
  flex: 1;

  h3 {
    margin: 0 0 ${spacing.xs} 0;
    font-size: 1.25rem;
    color: ${colors.textPrimary};
    display: flex;
    align-items: center;
    gap: ${spacing.sm};

    svg {
      color: ${colors.primary};
    }
  }

  p {
    color: ${colors.textSecondary};
    font-size: 0.875rem;
    margin: 0;
    line-height: 1.5;
  }
`;

const OfferCount = styled.span`
  display: inline-block;
  background-color: rgba(30, 58, 95, 0.1);
  color: ${colors.primary};
  padding: ${spacing.xs} ${spacing.sm};
  border-radius: ${borderRadius.full};
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: ${spacing.xs};
`;

const GroupActions = styled.div`
  display: flex;
  gap: ${spacing.sm};
  flex-direction: column;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const NestedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${spacing.lg};
  margin-top: ${spacing.lg};
`;

const NestedOfferCard = styled.div`
  background: ${colors.neutral};
  border: 1px solid ${colors.border};
  border-radius: ${borderRadius.md};
  padding: ${spacing.md};
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    background: ${colors.surface};
    box-shadow: ${shadows.sm};
    border-color: ${colors.primary};
  }

  h4 {
    margin: 0 0 ${spacing.sm} 0;
    font-size: 0.95rem;
    color: ${colors.textPrimary};
    word-break: break-word;
  }

  p {
    margin: 0 0 ${spacing.sm} 0;
    font-size: 0.8rem;
    color: ${colors.textSecondary};
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .price-badge {
    display: inline-block;
    background-color: rgba(30, 58, 95, 0.05);
    color: ${colors.primary};
    padding: ${spacing.xs} ${spacing.sm};
    border-radius: ${borderRadius.sm};
    font-size: 0.75rem;
    font-weight: 600;
  }
`;

const GroupModalOverlay = styled.div<{ isOpen: boolean }>`
  display: ${(props) => (props.isOpen ? 'flex' : 'none')};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  z-index: 1001;
`;

const GroupModalContent = styled.div`
  background: ${colors.surface};
  border-radius: ${borderRadius.lg};
  padding: ${spacing.xl};
  max-width: 700px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${shadows.lg};

  h2 {
    color: ${colors.textPrimary};
    margin: 0 0 ${spacing.lg} 0;
  }
`;

const FormGroup = styled.div`
  margin-bottom: ${spacing.lg};

  label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: ${colors.textPrimary};
    margin-bottom: ${spacing.sm};
  }

  input,
  textarea {
    width: 100%;
    padding: ${spacing.md};
    border: 1px solid ${colors.border};
    border-radius: ${borderRadius.md};
    font-size: 0.875rem;
    font-family: inherit;
    transition: border-color 0.3s ease;

    &:focus {
      outline: none;
      border-color: ${colors.primary};
      box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.1);
    }
  }

  textarea {
    resize: vertical;
    min-height: 80px;
  }
`;

const OffersSelector = styled.div`
  label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: ${colors.textPrimary};
    margin-bottom: ${spacing.sm};
  }

  .offers-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: ${spacing.md};
    max-height: 300px;
    overflow-y: auto;
    padding: ${spacing.md};
    border: 1px solid ${colors.border};
    border-radius: ${borderRadius.md};
    background-color: ${colors.neutral};
  }
`;

const OfferCheckbox = styled.label`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.sm};
  cursor: pointer;
  border-radius: ${borderRadius.sm};
  transition: background-color 0.3s ease;

  &:hover {
    background-color: rgba(30, 58, 95, 0.05);
  }

  input {
    width: auto;
    cursor: pointer;
  }

  span {
    font-size: 0.85rem;
    color: ${colors.textPrimary};
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: ${spacing.md};
  margin-top: ${spacing.lg};
  border-top: 1px solid ${colors.border};
  padding-top: ${spacing.lg};

  button {
    flex: 1;
    padding: ${spacing.md} ${spacing.lg};
    border: none;
    border-radius: ${borderRadius.md};
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  .submit {
    background-color: ${colors.primary};
    color: ${colors.surface};

    &:hover:not(:disabled) {
      opacity: 0.9;
      transform: translateY(-2px);
      box-shadow: ${shadows.md};
    }
  }

  .cancel {
    background-color: transparent;
    color: ${colors.primary};
    border: 1px solid ${colors.border};

    &:hover:not(:disabled) {
      background-color: ${colors.neutral};
    }
  }
`;

const DetailsModalOverlay = styled.div<{ isOpen: boolean }>`
  display: ${(props) => (props.isOpen ? 'flex' : 'none')};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const DetailsModalContent = styled.div`
  background: ${colors.surface};
  border-radius: ${borderRadius.lg};
  padding: ${spacing.xl};
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${shadows.lg};

  h2 {
    color: ${colors.textPrimary};
    margin: 0 0 ${spacing.lg} 0;
  }
`;

const DetailsSection = styled.div`
  margin-bottom: ${spacing.lg};

  &:last-child {
    margin-bottom: 0;
  }

  h3 {
    font-size: 0.875rem;
    font-weight: 600;
    color: ${colors.textSecondary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0 0 ${spacing.sm} 0;
  }

  p {
    color: ${colors.textPrimary};
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.6;
    word-break: break-word;
  }
`;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${spacing.lg};
  margin-bottom: ${spacing.lg};
`;

const DetailItem = styled.div`
  h3 {
    font-size: 0.875rem;
    font-weight: 600;
    color: ${colors.textSecondary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0 0 ${spacing.xs} 0;
  }

  p {
    color: ${colors.textPrimary};
    margin: 0;
    font-size: 0.95rem;
  }
`;

const DetailsCloseButton = styled.button`
  width: 100%;
  padding: ${spacing.md} ${spacing.lg};
  background-color: ${colors.primary};
  color: ${colors.surface};
  border: none;
  border-radius: ${borderRadius.md};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
    box-shadow: ${shadows.md};
  }
`;

interface OffersListProps {
    // onTabChange?: (tab: 'offers' | 'products') => void; // For future use
}

export const OffersList: React.FC<OffersListProps> = () => {
    const {
        offers,
        offerGroups,
        currencies,
        isLoading,
        error,
        createOffer,
        updateOffer,
        deleteOffer,
        activateOffer,
        deactivateOffer,
        uploadOfferImage,
        createOfferGroup,
        updateOfferGroup,
        deleteOfferGroup,
        getOfferGroups,
        uploadOfferGroupImage,
    } = useOffer();
    
    // Refs for file inputs
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
    const groupFileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    // Offers tab state
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Groups tab state
    const [activeTab, setActiveTab] = useState<'offers' | 'groups'>('offers');
    const [groupModalOpen, setGroupModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<OfferGroup | null>(null);
    const [groupFormData, setGroupFormData] = useState({
        name: '',
        description: '',
        price: '',
        currency_id: '',
        is_package: false,
        is_active: true,
        is_featured: false,
    });
    const [selectedOfferIds, setSelectedOfferIds] = useState<string[]>([]);
    const [groupSearchTerm, setGroupSearchTerm] = useState('');
    const [copiedGroupId, setCopiedGroupId] = useState<string | null>(null);

    const filteredOffers = useMemo(() => {
        return offers.filter(
            (offer) =>
                offer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                offer.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [offers, searchTerm]);

    const handleOpenModal = (offer?: Offer) => {
        if (offer) {
            setEditingOffer(offer);
        } else {
            setEditingOffer(null);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingOffer(null);
    };

    const handleSubmit = async (data: Partial<Offer>) => {
        setIsSaving(true);
        try {
            if (editingOffer) {
                await updateOffer(editingOffer.id, data);
            } else {
                await createOffer(data);
            }
            handleCloseModal();
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (offerId: string) => {
        if (!window.confirm('Are you sure you want to delete this offer?')) {
            return;
        }

        try {
            await deleteOffer(offerId);
        } catch (error) {
            console.error('Failed to delete offer:', error);
        }
    };

    const handleToggleActive = async (offer: Offer) => {
        try {
            if (offer.is_active) {
                await deactivateOffer(offer.id);
            } else {
                await activateOffer(offer.id);
            }
        } catch (error) {
            console.error('Failed to toggle offer status:', error);
        }
    };

    const handleOpenDetails = (offer: Offer) => {
        setSelectedOffer(offer);
        setDetailsModalOpen(true);
    };

    const handleCloseDetails = () => {
        setDetailsModalOpen(false);
        setSelectedOffer(null);
    };

    // Group handlers
    const handleOpenGroupModal = (group?: OfferGroup) => {
        if (group) {
            setEditingGroup(group);
            setGroupFormData({
                name: group.name,
                description: group.description || '',
                price: group.price ? String(group.price) : '',
                currency_id: group.currency_id || '',
                is_package: group.is_package || false,
                is_active: group.is_active ?? true,
                is_featured: group.is_featured ?? false,
            });
            setSelectedOfferIds(group.offers?.map(o => o.id) || []);
        } else {
            setEditingGroup(null);
            setGroupFormData({
                name: '',
                description: '',
                price: '',
                currency_id: '',
                is_package: false,
                is_active: true,
                is_featured: false,
            });
            setSelectedOfferIds([]);
        }
        setGroupModalOpen(true);
    };

    const handleCloseGroupModal = () => {
        setGroupModalOpen(false);
        setEditingGroup(null);
        setGroupFormData({
            name: '',
            description: '',
            price: '',
            currency_id: '',
            is_package: false,
            is_active: true,
            is_featured: false,
        });
        setSelectedOfferIds([]);
    };

    const handleSubmitGroup = async () => {
        if (!groupFormData.name.trim()) {
            alert('Group name is required');
            return;
        }

        // Validation: if is_package is true, price and currency are required
        if (groupFormData.is_package) {
            if (!groupFormData.price || parseFloat(groupFormData.price) <= 0) {
                alert('Price is required and must be greater than 0 when the group is a package');
                return;
            }
            if (!groupFormData.currency_id) {
                alert('Currency is required when the group is a package');
                return;
            }
        }

        setIsSaving(true);
        try {
            const data: Record<string, unknown> = {
                name: groupFormData.name,
                description: groupFormData.description,
                offer_ids: selectedOfferIds,
                is_package: groupFormData.is_package,
                is_active: groupFormData.is_active,
                is_featured: groupFormData.is_featured,
            };

            // Only include price and currency if it's a package
            if (groupFormData.is_package) {
                data.price = parseFloat(groupFormData.price);
                data.currency_id = groupFormData.currency_id;
            }

            if (editingGroup) {
                await updateOfferGroup(editingGroup.id, data);
            } else {
                await createOfferGroup(data);
            }
            handleCloseGroupModal();
            await getOfferGroups();
        } catch (error) {
            console.error('Failed to save group:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteGroup = async (groupId: string) => {
        if (!window.confirm('Are you sure you want to delete this group?')) {
            return;
        }

        try {
            await deleteOfferGroup(groupId);
            await getOfferGroups();
        } catch (error) {
            console.error('Failed to delete group:', error);
        }
    };

    const handleToggleOfferSelection = (offerId: string) => {
        setSelectedOfferIds((prev) =>
            prev.includes(offerId) ? prev.filter(id => id !== offerId) : [...prev, offerId]
        );
    };

    const filteredGroups = useMemo(() => {
        return offerGroups.filter(
            (group) =>
                group.name.toLowerCase().includes(groupSearchTerm.toLowerCase()) ||
                group.description?.toLowerCase().includes(groupSearchTerm.toLowerCase())
        );
    }, [offerGroups, groupSearchTerm]);

    const handleCopyOfferLink = (offerId: string) => {
        const paymentUrl = `${window.location.origin}/pay/offer/${offerId}`;
        navigator.clipboard.writeText(paymentUrl).then(() => {
            setCopiedId(offerId);
            setTimeout(() => setCopiedId(null), 2000);
        });
    };

    const handleCopyGroupLink = (groupId: string) => {
        const paymentUrl = `${window.location.origin}/pay/g/${groupId}`;
        navigator.clipboard.writeText(paymentUrl).then(() => {
            setCopiedGroupId(groupId);
            setTimeout(() => setCopiedGroupId(null), 2000);
        });
    };

    const handleImageUploadClick = (offerId: string) => {
        fileInputRefs.current[offerId]?.click();
    };

    const handleFileChange = async (offerId: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
            return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB');
            return;
        }
        
        await uploadOfferImage(offerId, file);
        
        // Reset file input
        if (fileInputRefs.current[offerId]) {
            fileInputRefs.current[offerId]!.value = '';
        }
    };

    const handleGroupImageUploadClick = (groupId: string) => {
        groupFileInputRefs.current[groupId]?.click();
    };

    const handleGroupFileChange = async (groupId: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
            return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB');
            return;
        }
        
        await uploadOfferGroupImage(groupId, file);
        
        // Reset file input
        if (groupFileInputRefs.current[groupId]) {
            groupFileInputRefs.current[groupId]!.value = '';
        }
    };

    return (
        <>
            <Header>
                <h2>Offers & Groups</h2>
            </Header>

            {error && (
                <ErrorBanner>
                    <FiAlertCircle /> {error}
                </ErrorBanner>
            )}

            <TabContainer>
                <Tab isActive={activeTab === 'offers'} onClick={() => setActiveTab('offers')}>
                    <FiChevronRight /> Offers
                </Tab>
                <Tab isActive={activeTab === 'groups'} onClick={() => setActiveTab('groups')}>
                    <FiFolder /> Groups
                </Tab>
            </TabContainer>

            {activeTab === 'offers' ? (
                <>
                    <HeaderActions>
                        <SearchBox>
                            <FiSearch />
                            <input
                                type="text"
                                placeholder="Search offers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                disabled={isLoading}
                            />
                        </SearchBox>
                        <AddButton
                            onClick={() => handleOpenModal()}
                            disabled={isLoading}
                        >
                            <FiPlus /> New Offer
                        </AddButton>
                    </HeaderActions>
                </>
            ) : (
                <>
                    <HeaderActions>
                        <SearchBox>
                            <FiSearch />
                            <input
                                type="text"
                                placeholder="Search groups..."
                                value={groupSearchTerm}
                                onChange={(e) => setGroupSearchTerm(e.target.value)}
                                disabled={isLoading}
                            />
                        </SearchBox>
                        <AddButton
                            onClick={() => handleOpenGroupModal()}
                            disabled={isLoading}
                        >
                            <FiPlus /> New Group
                        </AddButton>
                    </HeaderActions>
                </>
            )}

            {activeTab === 'offers' ? (
                <>
                    {isLoading && !offers.length ? (
                        <LoadingSpinner>
                            <div>Loading offers...</div>
                        </LoadingSpinner>
                    ) : filteredOffers.length === 0 ? (
                        <EmptyState>
                            <FiX size={48} />
                            <p>{offers.length === 0 ? 'No offers yet' : 'No matching offers'}</p>
                            {offers.length === 0 && (
                                <AddButton onClick={() => handleOpenModal()}>
                                    <FiPlus /> Create Your First Offer
                                </AddButton>
                            )}
                        </EmptyState>
                    ) : (
                        <Grid>
                            {filteredOffers.map((offer) => (
                                <Card key={offer.id}>
                                    <CardHeader>
                                        <CardTitle>{offer.name}</CardTitle>
                                        <Badge variant={offer.is_active ? 'active' : 'inactive'}>
                                            {offer.is_active ? (
                                                <>
                                                    <FiCheck size={12} /> Active
                                                </>
                                            ) : (
                                                <>
                                                    <FiX size={12} /> Inactive
                                                </>
                                            )}
                                        </Badge>
                                    </CardHeader>

                                    <OfferImageContainer>
                                        {offer.image ? (
                                            <OfferImage
                                                src={getMediaUrl(offer.image)}
                                                alt={offer.name}
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <OfferImagePlaceholder>
                                                <FiImage />
                                                <span>No image</span>
                                            </OfferImagePlaceholder>
                                        )}
                                        <ImageUploadButton
                                            onClick={() => handleImageUploadClick(offer.id)}
                                            disabled={isLoading}
                                            title="Upload image"
                                        >
                                            <FiImage size={14} /> {offer.image ? 'Change' : 'Add'}
                                        </ImageUploadButton>
                                        <HiddenFileInput
                                            ref={(el) => { fileInputRefs.current[offer.id] = el; }}
                                            type="file"
                                            accept="image/jpeg,image/png,image/gif,image/webp"
                                            onChange={(e) => handleFileChange(offer.id, e)}
                                        />
                                    </OfferImageContainer>

                                    {offer.description && (
                                        <Description>{offer.description}</Description>
                                    )}

                                    <PriceSection>
                                        <div>
                                            <label>Price</label>
                                            <span>
                                                {offer.currency?.symbol || '$'}{parseFloat(String(offer.price || 0)).toFixed(offer.currency?.decimal_places || 2)}
                                            </span>
                                        </div>
                                        <div>
                                            <label>Currency</label>
                                            <span>{offer.currency?.code || 'N/A'}</span>
                                        </div>
                                    </PriceSection>

                                    {offer.discount_value && offer.discount_value > 0 && (
                                        <DiscountSection>
                                            <div>
                                                <label>
                                                    {offer.discount_type === 'percentage'
                                                        ? 'Discount'
                                                        : 'Discount Amount'}
                                                </label>
                                                <span>
                                                    {offer.discount_value}
                                                    {offer.discount_type === 'percentage' ? '%' : '$'}
                                                </span>
                                            </div>
                                        </DiscountSection>
                                    )}

                                    <CardActions>
                                        <ActionButton
                                            onClick={() => handleOpenDetails(offer)}
                                            disabled={isSaving}
                                        >
                                            <FiEye /> Details
                                        </ActionButton>
                                        <ActionButton
                                            variant="primary"
                                            onClick={() => handleCopyOfferLink(offer.id)}
                                            disabled={isSaving}
                                            title={copiedId === offer.id ? 'Copied!' : 'Copy payment link'}
                                        >
                                            <FiCopy /> {copiedId === offer.id ? 'Copied' : 'Copy'}
                                        </ActionButton>
                                        <ActionButton
                                            variant="primary"
                                            onClick={() => handleOpenModal(offer)}
                                            disabled={isSaving}
                                        >
                                            <FiEdit2 /> Edit
                                        </ActionButton>
                                        <ActionButton
                                            onClick={() => handleToggleActive(offer)}
                                            disabled={isSaving}
                                        >
                                            {offer.is_active ? 'Deactivate' : 'Activate'}
                                        </ActionButton>
                                        <ActionButton
                                            variant="danger"
                                            onClick={() => handleDelete(offer.id)}
                                            disabled={isSaving}
                                        >
                                            <FiTrash2 /> Delete
                                        </ActionButton>
                                    </CardActions>
                                </Card>
                            ))}
                        </Grid>
                    )}
                </>
            ) : (
                <>
                    {isLoading && !offerGroups.length ? (
                        <LoadingSpinner>
                            <div>Loading offer groups...</div>
                        </LoadingSpinner>
                    ) : filteredGroups.length === 0 ? (
                        <EmptyState>
                            <FiFolder size={48} />
                            <p>{offerGroups.length === 0 ? 'No groups yet' : 'No matching groups'}</p>
                            {offerGroups.length === 0 && (
                                <AddButton onClick={() => handleOpenGroupModal()}>
                                    <FiPlus /> Create Your First Group
                                </AddButton>
                            )}
                        </EmptyState>
                    ) : (
                        <div>
                            {filteredGroups.map((group) => (
                                <GroupCard key={group.id}>
                                    {/* Group Image */}
                                    <OfferImageContainer style={{ marginBottom: spacing.lg }}>
                                        {group.image ? (
                                            <OfferImage
                                                src={getMediaUrl(group.image)}
                                                alt={group.name}
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <OfferImagePlaceholder>
                                                <FiFolder size={32} />
                                                <span>No image</span>
                                            </OfferImagePlaceholder>
                                        )}
                                        <ImageUploadButton
                                            onClick={() => handleGroupImageUploadClick(group.id)}
                                            disabled={isLoading}
                                            title="Upload group image"
                                        >
                                            <FiImage size={14} /> {group.image ? 'Change' : 'Add'}
                                        </ImageUploadButton>
                                        <HiddenFileInput
                                            ref={(el) => { groupFileInputRefs.current[group.id] = el; }}
                                            type="file"
                                            accept="image/jpeg,image/png,image/gif,image/webp"
                                            onChange={(e) => handleGroupFileChange(group.id, e)}
                                        />
                                    </OfferImageContainer>

                                    <GroupHeader>
                                        <GroupInfo>
                                            <h3>
                                                <FiFolder size={20} />
                                                {group.name}
                                                {group.is_package && (
                                                    <span
                                                        style={{
                                                            backgroundColor: '#dbeafe',
                                                            color: '#1e40af',
                                                            padding: `${spacing.xs} ${spacing.sm}`,
                                                            borderRadius: borderRadius.full,
                                                            fontSize: '0.7rem',
                                                            fontWeight: 600,
                                                            marginLeft: spacing.sm,
                                                        }}
                                                    >
                                                        PACKAGE
                                                    </span>
                                                )}
                                                {!group.is_active && (
                                                    <span
                                                        style={{
                                                            backgroundColor: '#fee2e2',
                                                            color: '#991b1b',
                                                            padding: `${spacing.xs} ${spacing.sm}`,
                                                            borderRadius: borderRadius.full,
                                                            fontSize: '0.7rem',
                                                            fontWeight: 600,
                                                            marginLeft: spacing.sm,
                                                        }}
                                                    >
                                                        INACTIVE
                                                    </span>
                                                )}
                                                {group.is_featured && (
                                                    <span
                                                        style={{
                                                            backgroundColor: '#fef3c7',
                                                            color: '#b45309',
                                                            padding: `${spacing.xs} ${spacing.sm}`,
                                                            borderRadius: borderRadius.full,
                                                            fontSize: '0.7rem',
                                                            fontWeight: 600,
                                                            marginLeft: spacing.sm,
                                                        }}
                                                    >
                                                        FEATURED
                                                    </span>
                                                )}
                                            </h3>
                                            {group.description && <p>{group.description}</p>}
                                            <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap', marginTop: spacing.xs }}>
                                                <OfferCount>{group.offers?.length || 0} Offers</OfferCount>
                                                {group.is_package && group.price && group.currency && (
                                                    <span
                                                        style={{
                                                            display: 'inline-block',
                                                            backgroundColor: 'rgba(30, 58, 95, 0.1)',
                                                            color: colors.primary,
                                                            padding: `${spacing.xs} ${spacing.sm}`,
                                                            borderRadius: borderRadius.full,
                                                            fontSize: '0.75rem',
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {group.currency.symbol}
                                                        {parseFloat(String(group.price)).toFixed(group.currency.decimal_places || 2)}
                                                    </span>
                                                )}
                                            </div>
                                        </GroupInfo>
                                        <GroupActions>
                                            <ActionButton
                                                variant="primary"
                                                onClick={() => handleCopyGroupLink(group.id)}
                                                disabled={isSaving}
                                                title={copiedGroupId === group.id ? 'Copied!' : 'Copy payment link'}
                                            >
                                                <FiCopy /> {copiedGroupId === group.id ? 'Copied' : 'Copy'}
                                            </ActionButton>
                                            <ActionButton
                                                variant="primary"
                                                onClick={() => handleOpenGroupModal(group)}
                                                disabled={isSaving}
                                            >
                                                <FiEdit2 /> Edit
                                            </ActionButton>
                                            <ActionButton
                                                variant="danger"
                                                onClick={() => handleDeleteGroup(group.id)}
                                                disabled={isSaving}
                                            >
                                                <FiTrash2 /> Delete
                                            </ActionButton>
                                        </GroupActions>
                                    </GroupHeader>

                                    {group.offers && group.offers.length > 0 ? (
                                        <NestedGrid>
                                            {group.offers.map((offer) => (
                                                <NestedOfferCard
                                                    key={offer.id}
                                                    onClick={() => handleOpenDetails(offer)}
                                                >
                                                    <h4>{offer.name}</h4>
                                                    {offer.description && <p>{offer.description}</p>}
                                                    <div className="price-badge">
                                                        {offer.currency?.symbol || '$'}
                                                        {parseFloat(String(offer.price || 0)).toFixed(
                                                            offer.currency?.decimal_places || 2
                                                        )}
                                                    </div>
                                                </NestedOfferCard>
                                            ))}
                                        </NestedGrid>
                                    ) : (
                                        <div style={{ padding: '2rem', textAlign: 'center', color: colors.textSecondary }}>
                                            <p>No offers in this group yet</p>
                                        </div>
                                    )}
                                </GroupCard>
                            ))}
                        </div>
                    )}
                </>
            )}

            <OfferModal
                isOpen={isModalOpen}
                offer={editingOffer}
                onClose={handleCloseModal}
                onSubmit={handleSubmit}
                isLoading={isSaving}
                currencies={currencies}
            />

            <DetailsModalOverlay isOpen={detailsModalOpen} onClick={handleCloseDetails}>
                <DetailsModalContent onClick={(e) => e.stopPropagation()}>
                    {selectedOffer && (
                        <>
                            <h2>{selectedOffer.name}</h2>

                            {selectedOffer.description && (
                                <DetailsSection>
                                    <h3>Description</h3>
                                    <p>{selectedOffer.description}</p>
                                </DetailsSection>
                            )}

                            <DetailsGrid>
                                <DetailItem>
                                    <h3>Offer ID</h3>
                                    <p style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>{selectedOffer.id}</p>
                                </DetailItem>
                                <DetailItem>
                                    <h3>Company ID</h3>
                                    <p style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>{selectedOffer.company_id}</p>
                                </DetailItem>
                            </DetailsGrid>

                            <DetailsGrid>
                                <DetailItem>
                                    <h3>Price</h3>
                                    <p>
                                        {selectedOffer.currency?.symbol || '$'}
                                        {parseFloat(String(selectedOffer.price || 0)).toFixed(
                                            selectedOffer.currency?.decimal_places || 2
                                        )}
                                    </p>
                                </DetailItem>
                                <DetailItem>
                                    <h3>Currency</h3>
                                    <p>{selectedOffer.currency?.code || 'N/A'}</p>
                                </DetailItem>
                            </DetailsGrid>

                            {selectedOffer.currency && (
                                <DetailsGrid>
                                    <DetailItem>
                                        <h3>Currency Name</h3>
                                        <p>{selectedOffer.currency.name}</p>
                                    </DetailItem>
                                    <DetailItem>
                                        <h3>Decimal Places</h3>
                                        <p>{selectedOffer.currency.decimal_places}</p>
                                    </DetailItem>
                                </DetailsGrid>
                            )}

                            {selectedOffer.discount_value && selectedOffer.discount_value > 0 && (
                                <>
                                    <DetailsGrid>
                                        <DetailItem>
                                            <h3>
                                                {selectedOffer.discount_type === 'percentage'
                                                    ? 'Discount Percentage'
                                                    : 'Discount Amount'}
                                            </h3>
                                            <p>
                                                {selectedOffer.discount_value}
                                                {selectedOffer.discount_type === 'percentage' ? '%' : selectedOffer.currency?.symbol || '$'}
                                            </p>
                                        </DetailItem>
                                        <DetailItem>
                                            <h3>Discount Type</h3>
                                            <p style={{ textTransform: 'capitalize' }}>
                                                {selectedOffer.discount_type === 'percentage' ? 'Percentage' : 'Fixed'}
                                            </p>
                                        </DetailItem>
                                    </DetailsGrid>

                                    {selectedOffer.discount_type === 'percentage' && (
                                        <DetailsGrid>
                                            <DetailItem>
                                                <h3>Discounted Price</h3>
                                                <p>
                                                    {selectedOffer.currency?.symbol || '$'}
                                                    {(
                                                        (parseFloat(String(selectedOffer.price || 0)) *
                                                            (100 - selectedOffer.discount_value)) /
                                                        100
                                                    ).toFixed(selectedOffer.currency?.decimal_places || 2)}
                                                </p>
                                            </DetailItem>
                                            {selectedOffer.discount_currency_id && (
                                                <DetailItem>
                                                    <h3>Discount Currency ID</h3>
                                                    <p style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>{selectedOffer.discount_currency_id}</p>
                                                </DetailItem>
                                            )}
                                        </DetailsGrid>
                                    )}
                                </>
                            )}

                            {selectedOffer.original_price && (
                                <DetailsGrid>
                                    <DetailItem>
                                        <h3>Original Price</h3>
                                        <p>
                                            {selectedOffer.currency?.symbol || '$'}
                                            {parseFloat(String(selectedOffer.original_price)).toFixed(
                                                selectedOffer.currency?.decimal_places || 2
                                            )}
                                        </p>
                                    </DetailItem>
                                    {selectedOffer.final_price && (
                                        <DetailItem>
                                            <h3>Final Price</h3>
                                            <p>
                                                {selectedOffer.currency?.symbol || '$'}
                                                {parseFloat(String(selectedOffer.final_price)).toFixed(
                                                    selectedOffer.currency?.decimal_places || 2
                                                )}
                                            </p>
                                        </DetailItem>
                                    )}
                                </DetailsGrid>
                            )}

                            <DetailsGrid>
                                <DetailItem>
                                    <h3>Status</h3>
                                    <p>
                                        {selectedOffer.is_active ? (
                                            <span style={{ color: '#065f46', fontWeight: '600' }}>Active</span>
                                        ) : (
                                            <span style={{ color: '#991b1b', fontWeight: '600' }}>Inactive</span>
                                        )}
                                    </p>
                                </DetailItem>
                                {selectedOffer.is_deleted !== undefined && (
                                    <DetailItem>
                                        <h3>Deleted</h3>
                                        <p>
                                            {selectedOffer.is_deleted ? (
                                                <span style={{ color: '#991b1b' }}>Yes</span>
                                            ) : (
                                                <span style={{ color: '#065f46' }}>No</span>
                                            )}
                                        </p>
                                    </DetailItem>
                                )}
                            </DetailsGrid>

                            {selectedOffer.offer_type && (
                                <DetailsGrid>
                                    <DetailItem>
                                        <h3>Offer Type</h3>
                                        <p style={{ textTransform: 'capitalize' }}>
                                            {selectedOffer.offer_type.replace(/_/g, ' ')}
                                        </p>
                                    </DetailItem>
                                    {selectedOffer.category && (
                                        <DetailItem>
                                            <h3>Category</h3>
                                            <p>{selectedOffer.category}</p>
                                        </DetailItem>
                                    )}
                                </DetailsGrid>
                            )}

                            {selectedOffer.group_id && (
                                <DetailsSection>
                                    <h3>Group ID</h3>
                                    <p style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>{selectedOffer.group_id}</p>
                                </DetailsSection>
                            )}

                            {selectedOffer.tags && selectedOffer.tags.length > 0 && (
                                <DetailsSection>
                                    <h3>Tags</h3>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {selectedOffer.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                style={{
                                                    backgroundColor: 'rgba(30, 58, 95, 0.1)',
                                                    color: colors.primary,
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '1rem',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '500',
                                                }}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </DetailsSection>
                            )}

                            <DetailsGrid>
                                <DetailItem>
                                    <h3>Created At</h3>
                                    <p style={{ fontSize: '0.85rem' }}>
                                        {selectedOffer.created_at
                                            ? new Date(selectedOffer.created_at).toLocaleString()
                                            : 'N/A'}
                                    </p>
                                </DetailItem>
                                <DetailItem>
                                    <h3>Updated At</h3>
                                    <p style={{ fontSize: '0.85rem' }}>
                                        {selectedOffer.updated_at
                                            ? new Date(selectedOffer.updated_at).toLocaleString()
                                            : 'N/A'}
                                    </p>
                                </DetailItem>
                            </DetailsGrid>

                            <DetailsCloseButton onClick={handleCloseDetails}>
                                Close
                            </DetailsCloseButton>
                        </>
                    )}
                </DetailsModalContent>
            </DetailsModalOverlay>

            <GroupModalOverlay isOpen={groupModalOpen} onClick={handleCloseGroupModal}>
                <GroupModalContent onClick={(e) => e.stopPropagation()}>
                    <h2>{editingGroup ? 'Edit Group' : 'Create New Group'}</h2>

                    <FormGroup>
                        <label>Group Name *</label>
                        <input
                            type="text"
                            value={groupFormData.name}
                            onChange={(e) =>
                                setGroupFormData({ ...groupFormData, name: e.target.value })
                            }
                            placeholder="e.g., Premium Packages"
                            disabled={isSaving}
                        />
                    </FormGroup>

                    <FormGroup>
                        <label>Description</label>
                        <textarea
                            value={groupFormData.description}
                            onChange={(e) =>
                                setGroupFormData({ ...groupFormData, description: e.target.value })
                            }
                            placeholder="Enter a description for this group..."
                            disabled={isSaving}
                        />
                    </FormGroup>

                    {/* Package Toggle */}
                    <FormGroup>
                        <label style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={groupFormData.is_package}
                                onChange={(e) =>
                                    setGroupFormData({ ...groupFormData, is_package: e.target.checked })
                                }
                                disabled={isSaving}
                            />
                            <span>This group is a payable package</span>
                        </label>
                        <p style={{ fontSize: '0.8rem', color: colors.textSecondary, margin: `${spacing.xs} 0 0 0` }}>
                            If checked, customers can pay for the entire package. If unchecked, customers will only see the individual offers.
                        </p>
                    </FormGroup>

                    {/* Price and Currency - Only shown when is_package is true */}
                    {groupFormData.is_package && (
                        <>
                            <FormGroup>
                                <label>Price *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={groupFormData.price}
                                    onChange={(e) =>
                                        setGroupFormData({ ...groupFormData, price: e.target.value })
                                    }
                                    placeholder="Enter package price"
                                    disabled={isSaving}
                                />
                            </FormGroup>

                            <FormGroup>
                                <label>Currency *</label>
                                <select
                                    value={groupFormData.currency_id}
                                    onChange={(e) =>
                                        setGroupFormData({ ...groupFormData, currency_id: e.target.value })
                                    }
                                    disabled={isSaving}
                                    style={{
                                        width: '100%',
                                        padding: spacing.md,
                                        border: `1px solid ${colors.border}`,
                                        borderRadius: borderRadius.md,
                                        fontSize: '0.875rem',
                                    }}
                                >
                                    <option value="">Select a currency</option>
                                    {currencies.map((currency) => (
                                        <option key={currency.id} value={currency.id}>
                                            {currency.name} ({currency.code} - {currency.symbol})
                                        </option>
                                    ))}
                                </select>
                            </FormGroup>
                        </>
                    )}

                    {/* Status Toggles */}
                    <FormGroup>
                        <label style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={groupFormData.is_active}
                                onChange={(e) =>
                                    setGroupFormData({ ...groupFormData, is_active: e.target.checked })
                                }
                                disabled={isSaving}
                            />
                            <span>Active</span>
                        </label>
                    </FormGroup>

                    <FormGroup>
                        <label style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={groupFormData.is_featured}
                                onChange={(e) =>
                                    setGroupFormData({ ...groupFormData, is_featured: e.target.checked })
                                }
                                disabled={isSaving}
                            />
                            <span>Featured</span>
                        </label>
                    </FormGroup>

                    <OffersSelector>
                        <label>Select Offers ({selectedOfferIds.length})</label>
                        <div className="offers-list">
                            {offers.length === 0 ? (
                                <p style={{ color: colors.textSecondary, margin: 0 }}>
                                    No offers available. Create an offer first.
                                </p>
                            ) : (
                                offers.map((offer) => (
                                    <OfferCheckbox key={offer.id}>
                                        <input
                                            type="checkbox"
                                            checked={selectedOfferIds.includes(offer.id)}
                                            onChange={() => handleToggleOfferSelection(offer.id)}
                                            disabled={isSaving}
                                        />
                                        <span>
                                            {offer.name}
                                            {offer.currency && (
                                                <div style={{ fontSize: '0.75rem', color: colors.textSecondary, marginTop: '0.25rem' }}>
                                                    {offer.currency.symbol}
                                                    {parseFloat(String(offer.price || 0)).toFixed(offer.currency.decimal_places || 2)}
                                                </div>
                                            )}
                                        </span>
                                    </OfferCheckbox>
                                ))
                            )}
                        </div>
                    </OffersSelector>

                    <FormActions>
                        <button
                            className="submit"
                            onClick={handleSubmitGroup}
                            disabled={isSaving}
                        >
                            {editingGroup ? 'Update Group' : 'Create Group'}
                        </button>
                        <button
                            className="cancel"
                            onClick={handleCloseGroupModal}
                            disabled={isSaving}
                        >
                            Cancel
                        </button>
                    </FormActions>
                </GroupModalContent>
            </GroupModalOverlay>
        </>
    );
};
