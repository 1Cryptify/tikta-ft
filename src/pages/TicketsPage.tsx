import React, { useState, useRef, useMemo, useEffect } from 'react';
import styled from 'styled-components';
// @ts-ignore
import QRCode from 'qrcode.react';
import { FiPrinter, FiEye, FiEyeOff, FiX, FiCopy, FiPlus, FiTrash2, FiXCircle, FiDownload, FiFileText } from 'react-icons/fi';
import { colors, spacing } from '../config/theme';
import { useTicket, Ticket } from '../hooks/useTicket';
import { useOffer } from '../hooks/useOffer';
import { useAuth } from '../hooks/useAuth';
import { useBusiness } from '../hooks/useBusiness';
import LoadingSpinner from '../components/LoadingSpinner';
import CreateTicketModal from '../components/CreateTicketModal';
import A4CouponsPdf from '../components/A4CouponsPdf';
import { pdf } from '@react-pdf/renderer';

// ========== STYLED COMPONENTS ==========

const ContentSection = styled.div`
  padding: ${spacing.xl};
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${spacing.xxl};
  gap: ${spacing.lg};

  > div {
    flex: 1;
  }

  h1 {
    font-size: 2rem;
    color: ${colors.textPrimary};
    margin-bottom: ${spacing.sm};
  }

  p {
    color: ${colors.textSecondary};
    font-size: 0.875rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${spacing.sm};
  flex-wrap: wrap;
`;

const CreateButton = styled.button`
  padding: 10px 16px;
  background: #1e3a5f;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: #152d47;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 16px;
    height: 16px;
  }

  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 0.8rem;
  }
`;

const BulkCreateButton = styled(CreateButton)`
  background: #28a745;
  
  &:hover {
    background: #218838;
  }
`;

const BulkDeleteButton = styled(CreateButton)`
  background: #dc3545;
  
  &:hover {
    background: #c82333;
  }
`;

const TicketsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${spacing.md};
  margin-bottom: ${spacing.xl};
`;

const TicketCard = styled.div`
  background: white;
  border: 1px solid #d7dde3;
  border-radius: 8px;
  padding: ${spacing.md};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`;

const TicketHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${spacing.sm};
  gap: ${spacing.xs};
  flex-wrap: wrap;
`;

const TicketTitle = styled.h3`
  margin: 0;
  color: ${colors.textPrimary};
  font-size: 0.95rem;
  word-break: break-all;
  flex: 1;
  min-width: 0;
`;

const StatusBadge = styled.span<{ status: string }>`
   padding: 3px 8px;
   border-radius: 12px;
   font-size: 0.65rem;
   font-weight: 600;
   text-transform: uppercase;
   white-space: nowrap;
   margin-left: 0;

   ${props => {
        switch (props.status) {
            case 'active':
                return `background: #d4edda; color: #155724;`;
            case 'used':
                return `background: #cfe2ff; color: #084298;`;
            case 'expired':
                return `background: #f8d7da; color: #842029;`;
            case 'cancelled':
                return `background: #e2e3e5; color: #383d41;`;
            default:
                return `background: #e7e7e7; color: #383d41;`;
        }
    }}
`;

const UsedBadge = styled.span<{ isUsed: boolean }>`
   padding: 3px 8px;
   border-radius: 12px;
   font-size: 0.65rem;
   font-weight: 600;
   text-transform: uppercase;
   white-space: nowrap;
   margin-left: 0;
   background: ${props => props.isUsed ? '#cfe2ff' : '#d4edda'};
   color: ${props => props.isUsed ? '#084298' : '#155724'};
`;

const TicketContent = styled.div`
  display: flex;
  gap: ${spacing.md};
  margin-bottom: ${spacing.sm};
`;

const TicketDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.8rem;
`;

const DetailRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DetailLabel = styled.span`
  color: ${colors.textSecondary};
  font-weight: 600;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const DetailValue = styled.span<{ secret?: boolean }>`
  color: ${colors.textPrimary};
  word-break: break-all;
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  background: ${props => (props.secret ? '#f5f5f5' : 'transparent')};
  padding: ${props => (props.secret ? '3px 6px' : '0')};
  border-radius: 3px;
  position: relative;
  line-height: 1.2;
`;

const SecretField = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  position: relative;
`;

const SecretValue = styled.span`
  flex: 1;
  word-break: break-all;
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  background: #f5f5f5;
  padding: 3px 6px;
  border-radius: 3px;
  cursor: text;
  user-select: all;
  line-height: 1.2;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${colors.textSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3px;
  border-radius: 3px;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: #f0f0f0;
    color: ${colors.textPrimary};
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const TicketActions = styled.div`
  display: flex;
  gap: 4px;
  margin-top: ${spacing.sm};
  padding-top: ${spacing.sm};
  border-top: 1px solid #d7dde3;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #d7dde3;
  border-radius: 4px;
  background: white;
  color: ${colors.textPrimary};
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  transition: all 0.2s ease;

  &:hover {
    background: #f5f5f5;
    border-color: #999;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }
`;

const PrintButton = styled(ActionButton)`
  background: #1e3a5f;
  color: white;
  border-color: #1e3a5f;

  &:hover {
    background: #152d47;
    border-color: #152d47;
  }
`;

const DeleteButton = styled(ActionButton)`
  background: #dc3545;
  color: white;
  border-color: #dc3545;

  &:hover {
    background: #c82333;
    border-color: #c82333;
  }
`;

const SelectCheckbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #dc3545;
`;

const SelectAllBar = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.sm} ${spacing.md};
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 6px;
  margin-bottom: ${spacing.md};
  font-size: 0.875rem;
  color: #856404;
`;

const DeletePeriodInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #d7dde3;
  border-radius: 8px;
  font-size: 0.875rem;
  flex: 1;

  &:focus {
    outline: none;
    border-color: #1e3a5f;
    box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.12);
  }
`;

const DeleteFilterRow = styled.div`
  display: flex;
  gap: ${spacing.sm};
  align-items: center;
  margin-bottom: ${spacing.md};
  flex-wrap: wrap;
`;

const DeleteTabBar = styled.div`
  display: flex;
  gap: 0;
  margin-bottom: ${spacing.md};
  border: 1px solid #d7dde3;
  border-radius: 4px;
  overflow: hidden;
`;

const DeleteTabButton = styled.button<{ isActive: boolean }>`
  flex: 1;
  padding: 10px;
  border: none;
  background: ${props => props.isActive ? '#dc3545' : '#f8f9fa'};
  color: ${props => props.isActive ? 'white' : colors.textPrimary};
  font-weight: 600;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.isActive ? '#c82333' : '#e9ecef'};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${spacing.xxl};
  color: ${colors.textSecondary};

  p {
    margin: 0;
  }
`;

const ModalOverlay = styled.div<{ isOpen: boolean }>`
  display: ${props => props.isOpen ? 'flex' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  padding: ${spacing.xl};
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);

  h2 {
    margin: 0 0 ${spacing.md} 0;
    color: ${colors.textPrimary};
    font-size: 1.5rem;
  }

  p {
    margin: 0 0 ${spacing.md} 0;
    color: ${colors.textSecondary};
    font-size: 0.875rem;
  }
`;

const JsonTextarea = styled.textarea`
  width: 100%;
  min-height: 300px;
  padding: ${spacing.md};
  border: 1px solid #d7dde3;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  resize: vertical;
  margin-bottom: ${spacing.md};

  &:focus {
    outline: none;
    border-color: #1e3a5f;
    box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.12);
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: ${spacing.md};
  justify-content: flex-end;

  button {
    padding: 10px 20px;
    border-radius: 4px;
    border: none;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }
`;

const CancelButton = styled.button`
  background: #e9ecef;
  color: ${colors.textPrimary};

  &:hover {
    background: #d7dde3;
  }
`;

const SubmitBulkButton = styled.button`
  background: #28a745;
  color: white;

  &:hover {
    background: #218838;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ConfirmDeleteButton = styled(SubmitBulkButton)`
  background: #dc3545;

  &:hover {
    background: #c82333;
  }
`;

const ErrorMessage = styled.div`
  padding: ${spacing.md};
  background: #f8d7da;
  color: #842029;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  margin-bottom: ${spacing.md};
  font-size: 0.875rem;
`;

const InfoMessage = styled.div<{ variant?: 'success' | 'info' }>`
  padding: ${spacing.md};
  background: ${props => props.variant === 'success' ? '#d4edda' : '#e7f3ff'};
  color: ${props => props.variant === 'success' ? '#155724' : '#084298'};
  border: 1px solid ${props => props.variant === 'success' ? '#c3e6cb' : '#b6d4fe'};
  border-radius: 4px;
  margin-bottom: ${spacing.md};
  font-size: 0.875rem;
`;

const JsonExample = styled.div`
  background: #f5f5f5;
  border: 1px solid #d7dde3;
  border-radius: 4px;
  padding: ${spacing.md};
  margin-bottom: ${spacing.md};
  font-size: 0.8rem;
  font-family: 'Courier New', monospace;
  overflow-x: auto;

  p {
    margin: 0 0 ${spacing.sm} 0;
    color: ${colors.textSecondary};
    font-weight: 600;
  }

  pre {
    margin: 0;
    color: #333;
    line-height: 1.4;
  }
`;

const PrintContainer = styled.div`
  display: none;

  @media print {
    display: block;
  }
`;

const TabContainer = styled.div`
  display: flex;
  gap: ${spacing.sm};
  margin-bottom: ${spacing.md};
  border-bottom: 1px solid #d7dde3;
`;

const TabButton = styled.button<{ isActive: boolean }>`
  padding: 8px 16px;
  border: none;
  background: ${props => props.isActive ? '#1e3a5f' : 'transparent'};
  color: ${props => props.isActive ? 'white' : colors.textPrimary};
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  border-radius: 4px 4px 0 0;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.isActive ? '#152d47' : '#f0f0f0'};
  }
`;

const SelectGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: ${spacing.md};
`;

const SelectLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${colors.textPrimary};
`;

const SelectInput = styled.select`
  padding: 8px 12px;
  border: 1px solid #d7dde3;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  color: ${colors.textPrimary};

  &:focus {
    outline: none;
    border-color: #1e3a5f;
    box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.12);
  }
`;

const CsvTextarea = styled.textarea`
  width: 100%;
  min-height: 200px;
  padding: ${spacing.md};
  border: 1px solid #d7dde3;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  resize: vertical;
  margin-bottom: ${spacing.md};

  &:focus {
    outline: none;
    border-color: #1e3a5f;
    box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.12);
  }
`;

const FileInput = styled.input`
  margin-bottom: ${spacing.md};
`;

const PreviewTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: ${spacing.md};
  font-size: 0.8rem;

  th, td {
    border: 1px solid #d7dde3;
    padding: 6px 8px;
    text-align: left;
  }

  th {
    background: #f5f5f5;
    font-weight: 600;
  }

  tbody tr:nth-child(even) {
    background: #fafafa;
  }
`;

const CounterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  margin-bottom: ${spacing.md};
`;

const CounterButton = styled.button`
  width: 32px;
  height: 32px;
  border: 1px solid #d7dde3;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;

  &:hover {
    background: #f0f0f0;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CounterValue = styled.span`
  font-weight: 600;
  font-size: 1rem;
  min-width: 40px;
  text-align: center;
`;

const InfoText = styled.p`
  font-size: 0.8rem;
  color: ${colors.textSecondary};
  margin-bottom: ${spacing.md};
`;

const PrintA4Button = styled(CreateButton)`
  background: #6f42c1;

  &:hover {
    background: #5a32a3;
  }
`;

// ========== FILTER COMPONENTS ==========

const FilterSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.md};
  margin-bottom: ${spacing.xl};
  padding: ${spacing.md};
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #d7dde3;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xs};
  flex: 1;
  min-width: 180px;
  max-width: 280px;

  @media (max-width: 768px) {
    min-width: 100%;
    max-width: 100%;
  }
`;

const FilterLabel = styled.label`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #d7dde3;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  color: ${colors.textPrimary};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #999;
  }

  &:focus {
    outline: none;
    border-color: #1e3a5f;
    box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.12);
  }
`;

const FilterButtonGroup = styled.div`
  display: flex;
  gap: ${spacing.xs};
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ isActive: boolean }>`
  padding: 8px 16px;
  border: 1px solid ${props => props.isActive ? '#1e3a5f' : '#d7dde3'};
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: ${props => props.isActive ? '600' : '400'};
  background: ${props => props.isActive ? '#1e3a5f' : 'white'};
  color: ${props => props.isActive ? 'white' : colors.textPrimary};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #1e3a5f;
    background: ${props => props.isActive ? '#152d47' : '#f0f7ff'};
  }
`;

const ClearFiltersButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid #dc3545;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 600;
  background: white;
  color: #dc3545;
  cursor: pointer;
  transition: all 0.2s ease;
  align-self: flex-end;

  &:hover {
    background: #dc3545;
    color: white;
  }

  svg {
    width: 16px;
    height: 16px;
  }

  @media (max-width: 768px) {
    align-self: stretch;
    justify-content: center;
  }
`;

const ResultsInfo = styled.div`
  font-size: 0.875rem;
  color: ${colors.textSecondary};
  margin-bottom: ${spacing.md};
`;

const PaginationContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.md};
  margin-bottom: ${spacing.xl};
  padding: ${spacing.md};
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #d7dde3;
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

const PaginationButton = styled.button`
  padding: 6px 12px;
  border: 1px solid #d7dde3;
  border-radius: 4px;
  background: white;
  color: ${colors.textPrimary};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #f0f0f0;
    border-color: #999;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PaginationInfo = styled.span`
  font-size: 0.875rem;
  color: ${colors.textSecondary};
  min-width: 120px;
  text-align: center;
`;

const PageSizeSelector = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  font-size: 0.875rem;
  color: ${colors.textSecondary};

  select {
    padding: 6px 10px;
    border: 1px solid #d7dde3;
    border-radius: 4px;
    background: white;
    color: ${colors.textPrimary};
    font-size: 0.875rem;
    cursor: pointer;

    &:focus {
      outline: none;
      border-color: #1e3a5f;
    }
  }
`;

const ThermalTicketTemplate = styled.div`
  width: 58mm;
  padding: 5mm;
  font-family: 'Courier New', monospace;
  font-size: 9pt;
  line-height: 1.4;
  background: white;
  color: black;
  page-break-after: always;

  @media print {
    margin: 0;
    padding: 5mm;
  }
`;

const ThermalHeader = styled.div`
  text-align: center;
  font-weight: bold;
  margin-bottom: 3mm;
  font-size: 10pt;
  border-bottom: 1px dashed black;
  padding-bottom: 2mm;
`;

const ThermalField = styled.div`
  margin: 2mm 0;
  word-break: break-all;
`;

const ThermalLabel = styled.span`
  font-weight: bold;
  display: block;
  font-size: 8pt;
`;

const ThermalValue = styled.span`
  display: block;
  font-size: 9pt;
`;

const ThermalFooter = styled.div`
  text-align: center;
  margin-top: 3mm;
  padding-top: 2mm;
  border-top: 1px dashed black;
  font-size: 8pt;
`;

// ========== THERMAL PRINT COMPONENT ==========

interface ThermalTicketProps {
    ticket: Ticket;
}

const ThermalTicket: React.FC<ThermalTicketProps> = ({ ticket }: ThermalTicketProps) => {
    return (
        <ThermalTicketTemplate>
            <ThermalHeader>
                {ticket.offer_name || ticket.ticket_code}
            </ThermalHeader>

            <ThermalField>
                <ThermalLabel>ID:</ThermalLabel>
                <ThermalValue>{ticket.id || 'N/A'}</ThermalValue>
            </ThermalField>

            <ThermalField>
                <ThermalLabel>Code:</ThermalLabel>
                <ThermalValue>{ticket.ticket_code || 'N/A'}</ThermalValue>
            </ThermalField>

            {ticket.ticket_secret && (
                <ThermalField>
                    <ThermalLabel>Secret:</ThermalLabel>
                    <ThermalValue>{ticket.ticket_secret}</ThermalValue>
                </ThermalField>
            )}

            {ticket.offer_name && (
                <ThermalField>
                    <ThermalLabel>Offer:</ThermalLabel>
                    <ThermalValue>{ticket.offer_name}</ThermalValue>
                </ThermalField>
            )}

            {ticket.valid_from && (
                <ThermalField>
                    <ThermalLabel>Valid From:</ThermalLabel>
                    <ThermalValue>
                        {new Date(ticket.valid_from).toLocaleDateString()}
                    </ThermalValue>
                </ThermalField>
            )}

            {ticket.valid_until && (
                <ThermalField>
                    <ThermalLabel>Valid Until:</ThermalLabel>
                    <ThermalValue>
                        {new Date(ticket.valid_until).toLocaleDateString()}
                    </ThermalValue>
                </ThermalField>
            )}

            <ThermalFooter>
                Status: {(ticket.status || 'UNKNOWN').toUpperCase()}
                <br />
                {new Date().toLocaleString()}
            </ThermalFooter>
        </ThermalTicketTemplate>
    );
};

// ========== MAIN COMPONENT ==========

export const TicketsPage: React.FC = () => {
    const ticketData = useTicket();
    const offerData = useOffer();
    const authData = useAuth();
    const businessData = useBusiness();
    const tickets = ticketData?.tickets || [];
    const isLoading = ticketData?.isLoading || false;
    const isSuperuser = authData?.user?.is_superuser || false;

    // Load businesses for superuser company selector
    useEffect(() => {
        if (isSuperuser) {
            businessData.getBusinesses();
        }
    }, [isSuperuser]);
    const error = ticketData?.error || null;
    const [revealedSecrets, setRevealedSecrets] = useState<Set<string>>(new Set());

    // Filter states
    const [usedFilter, setUsedFilter] = useState<'all' | 'used' | 'unused'>('all');
    const [selectedOfferId, setSelectedOfferId] = useState<string>('all');

    // Pagination states
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(20);
    const PAGE_SIZE_OPTIONS = [20, 100, 200, 500, 1000, 5000];

    // Load offers on mount
    useEffect(() => {
        offerData.getOffers();
    }, []);

    // Get unique offers from tickets (for dropdown)
    const ticketOffers = useMemo(() => {
        const offerMap = new Map<string, string>();
        tickets.forEach(ticket => {
            if (ticket.offer && ticket.offer_name) {
                offerMap.set(ticket.offer, ticket.offer_name);
            }
        });
        return Array.from(offerMap.entries()).map(([id, name]) => ({ id, name }));
    }, [tickets]);

    // Filter tickets based on selected filters
    const filteredTickets = useMemo(() => {
        return tickets.filter(ticket => {
            // Filter by used status
            if (usedFilter === 'used' && !ticket.is_used) {
                return false;
            }
            if (usedFilter === 'unused' && ticket.is_used) {
                return false;
            }

            // Filter by offer
            if (selectedOfferId !== 'all' && ticket.offer !== selectedOfferId) {
                return false;
            }

            return true;
        });
    }, [tickets, usedFilter, selectedOfferId]);

    // Paginate filtered tickets
    const paginatedTickets = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredTickets.slice(startIndex, startIndex + pageSize);
    }, [filteredTickets, currentPage, pageSize]);

    const totalPages = Math.ceil(filteredTickets.length / pageSize) || 1;

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setUsedFilter('all');
        setSelectedOfferId('all');
        setCurrentPage(1);
    };

    const hasActiveFilters = usedFilter !== 'all' || selectedOfferId !== 'all';
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [bulkJsonInput, setBulkJsonInput] = useState('');
    const [bulkError, setBulkError] = useState<string | null>(null);
    const [bulkLoading, setBulkLoading] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    // CSV Mikrotik import states
    const [bulkTab, setBulkTab] = useState<'json' | 'csv'>('csv');
    const [csvOfferId, setCsvOfferId] = useState<string>('');
    const [csvInput, setCsvInput] = useState<string>('');
    const [csvFileName, setCsvFileName] = useState<string>('');
    const [bulkCompanyId, setBulkCompanyId] = useState<string>('');

    // A4 print states
    const [isA4ModalOpen, setIsA4ModalOpen] = useState(false);
    const [a4OfferId, setA4OfferId] = useState<string>('');
    const [a4TicketCount, setA4TicketCount] = useState<number>(48);
    const [a4InfoMessage, setA4InfoMessage] = useState<string | null>(null);
    const [bulkInfoMessage, setBulkInfoMessage] = useState<string | null>(null);
    const MAX_TICKETS_PER_A4 = 48;

    // Bulk delete states
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTab, setDeleteTab] = useState<'select' | 'period'>('period');
    const [deleteOfferId, setDeleteOfferId] = useState<string>('');
    const [deleteDateFrom, setDeleteDateFrom] = useState<string>('');
    const [deleteDateTo, setDeleteDateTo] = useState<string>('');
    const [deleteIncludeUsed, setDeleteIncludeUsed] = useState<boolean>(false);
    const [selectedTicketIds, setSelectedTicketIds] = useState<Set<string>>(new Set());
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [deleteInfo, setDeleteInfo] = useState<string | null>(null);

    // Auto-adjust A4 ticket count when offer or available tickets change
    useEffect(() => {
        if (!a4OfferId) {
            setA4InfoMessage(null);
            return;
        }
        const available = getAvailableTicketsForOffer(a4OfferId).length;
        if (available === 0) {
            setA4InfoMessage('No available tickets for this offer');
            setA4TicketCount(0);
        } else {
            setA4InfoMessage(null);
            setA4TicketCount(prev => Math.min(prev || 1, available, MAX_TICKETS_PER_A4));
        }
    }, [a4OfferId, tickets]);

    const handleCreateTicket = async (data: Partial<Ticket> & { valid_until?: string; offer_id?: string; payment_id?: string; company_id?: string }) => {
        await ticketData.createTicket(data);
    };

    const handleBulkCreateTickets = async () => {
        setBulkError(null);
        setBulkLoading(true);

        if (isSuperuser && !bulkCompanyId) {
            setBulkError('Superusers must select a company');
            setBulkLoading(false);
            return;
        }

        try {
            const data = JSON.parse(bulkJsonInput);

            // Support both formats: array or object with array
            const ticketsToCreate = Array.isArray(data) ? data : (data.tickets || []);

            if (!Array.isArray(ticketsToCreate) || ticketsToCreate.length === 0) {
                throw new Error('JSON must contain an array of tickets');
            }

            // Use backend bulk import endpoint
            const result = await ticketData.bulkImportTickets(
                ticketsToCreate.map(ticket => ({
                    ticket_code: ticket.ticket_code,
                    ticket_secret: ticket.ticket_secret,
                    valid_until: ticket.valid_until || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    offer_id: ticket.offer_id
                })),
                selectedOfferId !== 'all' ? selectedOfferId : undefined,
                isSuperuser ? bulkCompanyId : undefined
            );

            if (result) {
                if (result.imported_count > 0) {
                    setBulkJsonInput('');
                    setIsBulkModalOpen(false);
                    setBulkInfoMessage(`✓ Successfully created ${result.imported_count}/${result.total_items} tickets!`);
                    // Refresh tickets
                    await ticketData.getTickets();
                }

                if (result.failed_count > 0) {
                    // Show sample errors for debugging
                    const failedItems = result.failed_items?.slice(0, 5) || [];
                    const errorMessages = new Set<string>();
                    failedItems.forEach((item: any) => {
                        errorMessages.add(`[Row ${item.index + 1}] ${item.error}`);
                    });
                    const errorSummary = Array.from(errorMessages).join('\n');
                    setBulkError(`${result.failed_count} ticket(s) failed:\n${errorSummary}`);
                } else if (result.imported_count === 0) {
                    setBulkError('No tickets were created. Please check the JSON format and try again.');
                } else {
                    setBulkError(null);
                }
            }
        } catch (err) {
            setBulkError(err instanceof Error ? err.message : 'Error processing JSON');
        } finally {
            setBulkLoading(false);
        }
    };

    // Parse Mikrotik CSV/HTML format: Login,Password,Uptime Limit,...
    const parseMikrotikCsv = (csvText: string): Array<{ ticket_code: string; ticket_secret: string }> => {
        const lines = csvText.trim().split(/\r?\n/);
        const parsed: Array<{ ticket_code: string; ticket_secret: string }> = [];

        lines.forEach((line, index) => {
            if (index === 0 && line.toLowerCase().includes('login')) {
                // Skip header line
                return;
            }
            if (!line.trim()) return;

            // Remove surrounding quotes and split by comma
            const columns = line.split(',').map(col => col.trim().replace(/^"|"$/g, ''));
            const login = columns[0];
            const password = columns[1];

            if (login && password) {
                parsed.push({
                    ticket_code: login,
                    ticket_secret: password
                });
            }
        });

        return parsed;
    };

    const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setCsvFileName(file.name);
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string || '';
            setCsvInput(text);
        };
        reader.readAsText(file);
    };

    const handleCsvImport = async () => {
        setBulkError(null);

        if (!csvOfferId) {
            setBulkError('Please select an offer for the imported tickets');
            return;
        }

        if (isSuperuser && !bulkCompanyId) {
            setBulkError('Superusers must select a company');
            return;
        }

        const parsedTickets = parseMikrotikCsv(csvInput);
        if (parsedTickets.length === 0) {
            setBulkError('No valid tickets found in the CSV. Expected format: Login,Password,...');
            return;
        }

        setBulkLoading(true);
        try {
            const result = await ticketData.bulkImportTickets(
                parsedTickets.map(ticket => ({
                    ticket_code: ticket.ticket_code,
                    ticket_secret: ticket.ticket_secret
                })),
                csvOfferId,
                isSuperuser ? bulkCompanyId : undefined
            );

            if (result) {
                if (result.imported_count > 0) {
                    setCsvInput('');
                    setCsvFileName('');
                    setCsvOfferId('');
                    setIsBulkModalOpen(false);
                    setBulkInfoMessage(`✓ Successfully imported ${result.imported_count}/${result.total_items} tickets!`);
                    await ticketData.getTickets();
                }

                if (result.failed_count > 0) {
                    const failedItems = result.failed_items?.slice(0, 5) || [];
                    const errorMessages = new Set<string>();
                    failedItems.forEach((item: any) => {
                        errorMessages.add(`[Row ${item.index + 1}] ${item.error}`);
                    });
                    const errorSummary = Array.from(errorMessages).join('\n');
                    setBulkError(`${result.failed_count} ticket(s) failed:\n${errorSummary}`);
                } else if (result.imported_count === 0) {
                    setBulkError('No tickets were imported. Please check the CSV format and try again.');
                } else {
                    setBulkError(null);
                }
            }
        } catch (err) {
            setBulkError(err instanceof Error ? err.message : 'Error processing CSV');
        } finally {
            setBulkLoading(false);
        }
    };

    const getAvailableTicketsForOffer = (offerId: string) => {
        return tickets.filter(ticket =>
            ticket.offer === offerId &&
            !ticket.is_used &&
            ticket.is_valid &&
            (!ticket.valid_until || new Date(ticket.valid_until) > new Date())
        );
    };

    const handlePrintA4 = async () => {
        if (!a4OfferId) {
            setA4InfoMessage('Please select an offer');
            return;
        }

        const availableTickets = getAvailableTicketsForOffer(a4OfferId);
        const count = Math.min(a4TicketCount, availableTickets.length, MAX_TICKETS_PER_A4);

        if (count === 0) {
            setA4InfoMessage('No available tickets for this offer');
            return;
        }

        const selectedTickets = availableTickets.slice(0, count);
        const offerName = offerData.offers.find(o => o.id === a4OfferId)?.name || 'Ticket';
        const ticketIds = selectedTickets.map(t => t.id);

        try {
            const blob = await pdf(
                <A4CouponsPdf offerName={offerName} tickets={selectedTickets} />
            ).toBlob();

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `coupons-${offerName.replace(/\s+/g, '_').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            // Mark tickets as used after download
            await ticketData.bulkUseTickets(ticketIds);
            await ticketData.getTickets();
            setIsA4ModalOpen(false);
            setA4InfoMessage(null);
        } catch (err) {
            console.error('Error generating A4 PDF:', err);
            setA4InfoMessage('Failed to generate PDF. Please try again.');
        }
    };

    const handleDeleteTicket = async (ticketId: string) => {
        if (window.confirm('Are you sure you want to delete this ticket?')) {
            await ticketData.deleteTicket(ticketId);
        }
    };

    // Bulk delete handlers
    const resetDeleteForm = () => {
        setDeleteTab('period');
        setDeleteOfferId('');
        setDeleteDateFrom('');
        setDeleteDateTo('');
        setDeleteIncludeUsed(false);
        setSelectedTicketIds(new Set());
        setDeleteError(null);
        setDeleteInfo(null);
    };

    const openDeleteModal = () => {
        resetDeleteForm();
        setIsDeleteModalOpen(true);
    };

    const toggleTicketSelect = (ticketId: string) => {
        setSelectedTicketIds(prev => {
            const next = new Set(prev);
            if (next.has(ticketId)) {
                next.delete(ticketId);
            } else {
                next.add(ticketId);
            }
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedTicketIds.size === filteredTickets.length) {
            setSelectedTicketIds(new Set());
        } else {
            setSelectedTicketIds(new Set(filteredTickets.map(t => t.id)));
        }
    };

    const handleBulkDelete = async () => {
        setDeleteLoading(true);
        setDeleteError(null);
        setDeleteInfo(null);

        try {
            const payload: any = {};

            if (deleteTab === 'select') {
                if (selectedTicketIds.size === 0) {
                    setDeleteError('Please select at least one ticket to delete.');
                    setDeleteLoading(false);
                    return;
                }
                payload.ticket_ids = Array.from(selectedTicketIds);
            } else {
                if (deleteDateFrom) payload.date_from = deleteDateFrom;
                if (deleteDateTo) payload.date_to = deleteDateTo;
                if (deleteOfferId) payload.offer_id = deleteOfferId;
            }

            payload.include_used = deleteIncludeUsed;

            const result = await ticketData.bulkDeleteTickets(payload);

            if (result) {
                setDeleteInfo(`Successfully deleted ${result.deleted_count} ticket(s).`);
                await ticketData.getTickets();
                setSelectedTicketIds(new Set());
            } else {
                setDeleteError(ticketData.error || 'Delete failed.');
            }
        } catch (err: any) {
            setDeleteError(err?.response?.data?.message || err.message || 'Delete failed.');
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleValidateTicket = async (ticketId: string, ticketCode: string, ticketSecret: string) => {
        await ticketData.validateTicket(ticketId, ticketCode, ticketSecret);
    };

    const handleUseTicket = async (ticketId: string, ticketCode: string, ticketSecret: string) => {
        await ticketData.useTicket(ticketId, ticketCode, ticketSecret);
    };

    const toggleSecretVisibility = (ticketId: string) => {
        setRevealedSecrets(prev => {
            const newSet = new Set(prev);
            if (newSet.has(ticketId)) {
                newSet.delete(ticketId);
            } else {
                newSet.add(ticketId);
            }
            return newSet;
        });
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const handlePrintThermal = (ticket: Ticket) => {
        const printWindow = window.open('', '', 'width=600,height=800');
        if (printWindow) {
            const qrValue = JSON.stringify({
                id: ticket.id || '',
                code: ticket.ticket_code || '',
                secret: ticket.ticket_secret || '',
            });

            const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Print Ticket</title>
          <style>
            * {
              margin: 0;
              padding: 0;
            }
            body {
              font-family: 'Courier New', monospace;
              width: 58mm;
            }
            @page {
              size: 58mm auto;
              margin: 0;
            }
            .ticket {
              width: 58mm;
              max-height: 80mm;
              padding: 4mm;
              font-size: 8pt;
              line-height: 1.3;
              background: white;
              color: black;
              page-break-after: always;
              overflow: hidden;
              display: flex;
              flex-direction: column;
            }
            .header {
              text-align: center;
              font-weight: bold;
              margin-bottom: 2mm;
              font-size: 9pt;
              border-bottom: 1px dashed black;
              padding-bottom: 1.5mm;
            }
            .main-content {
              display: flex;
              gap: 2mm;
              flex: 1;
              overflow: hidden;
            }
            .content {
              flex: 1;
              overflow: hidden;
            }
            .qr {
              display: flex;
              align-items: flex-start;
              justify-content: center;
              flex-shrink: 0;
            }
            .qr img {
              width: 22mm;
              height: 22mm;
            }
            .field {
              margin: 1mm 0;
              word-break: break-all;
            }
            .label {
              font-weight: bold;
              font-size: 9pt;
            }
            .value {
              font-size: 11pt;
              font-weight: bold;
            }
            .value-id {
              font-size: 7pt;
              font-weight: bold;
            }
            .value-code {
              font-size: 15pt;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              margin-top: 1.5mm;
              padding-top: 1.5mm;
              padding-bottom: 1mm;
              border-top: 1px dashed black;
              border-bottom: 2px dashed black;
              font-size: 7pt;
              flex-shrink: 0;
            }
            .cut-line {
              text-align: center;
              font-size: 7pt;
              margin-top: 0.5mm;
              letter-spacing: 2px;
            }
          </style>
        </head>
        <body>
          <div class="ticket">
              <div class="header">${ticket.offer_name || ticket.ticket_code}</div>

              <div class="main-content">
                <div class="content">
                  <div class="field">
                    <div class="label">ID:</div>
                    <div class="value value-id">${ticket.id || 'N/A'}</div>
                  </div>

                  <div class="field">
                    <div class="label">Code:</div>
                    <div class="value value-code">${ticket.ticket_code || 'N/A'}</div>
                  </div>

                  <div class="field">
                    <div class="label">Secret:</div>
                    <div class="value value-code">${ticket.ticket_secret || 'N/A'}</div>
                  </div>

                  ${ticket.offer_name ? `
                    <div class="field">
                      <div class="label">Offer:</div>
                      <div class="value">${ticket.offer_name}</div>
                    </div>
                  ` : ''}
                </div>

                <div class="qr">
                  <img id="qr-image" src="https://api.qrserver.com/v1/create-qr-code/?size=128x128&data=${encodeURIComponent(qrValue)}" />
                </div>
              </div>

             <div class="footer">
               Status: ${(ticket.status || 'UNKNOWN').toUpperCase()}
               <br/>
               ${new Date().toLocaleString()}
             </div>
             <div class="cut-line">✂ ✂ ✂ ✂ ✂</div>
           </div>
        </body>
        </html>
      `;

            printWindow.document.write(html);
            printWindow.document.close();

            // Attendre que le QR code soit chargé avant d'imprimer
            const waitForQrAndPrint = () => {
                const checkAndPrint = () => {
                    // Vérifier si l'image du QR code est chargée
                    const qrImg = printWindow.document.getElementById('qr-image') as HTMLImageElement | null;
                    if (qrImg && qrImg.complete && qrImg.naturalWidth > 0) {
                        printWindow.print();
                    } else {
                        // Attendre un peu et réessayer (max 5 secondes)
                        setTimeout(checkAndPrint, 150);
                    }
                };

                // Délai initial pour laisser le DOM se rendre
                setTimeout(checkAndPrint, 300);
            };

            waitForQrAndPrint();
        }
    };

    if (isLoading && tickets.length === 0) {
        return <LoadingSpinner />;
    }

    return (
        <ContentSection>
            <PageHeader>
                <div>
                    <h1>Tickets & Coupons</h1>
                    <p>View and manage your tickets and discount coupons</p>
                </div>
                <ButtonGroup>
                    <CreateButton onClick={() => setIsCreateModalOpen(true)} disabled={isLoading}>
                        <FiPlus /> Create Ticket
                    </CreateButton>
                    <BulkCreateButton onClick={() => setIsBulkModalOpen(true)} disabled={isLoading}>
                        <FiPlus /> Bulk Create
                    </BulkCreateButton>
                    <BulkDeleteButton onClick={openDeleteModal} disabled={isLoading}>
                        <FiTrash2 /> Bulk Delete
                    </BulkDeleteButton>
                    <PrintA4Button onClick={() => setIsA4ModalOpen(true)} disabled={isLoading}>
                        <FiPrinter /> Print A4
                    </PrintA4Button>
                </ButtonGroup>
            </PageHeader>

            {/* Filters Section */}
            <FilterSection>
                <FilterGroup>
                    <FilterLabel>Status</FilterLabel>
                    <FilterButtonGroup>
                        <FilterButton
                            isActive={usedFilter === 'all'}
                            onClick={() => { setUsedFilter('all'); setCurrentPage(1); }}
                        >
                            All
                        </FilterButton>
                        <FilterButton
                            isActive={usedFilter === 'unused'}
                            onClick={() => { setUsedFilter('unused'); setCurrentPage(1); }}
                        >
                            Available
                        </FilterButton>
                        <FilterButton
                            isActive={usedFilter === 'used'}
                            onClick={() => { setUsedFilter('used'); setCurrentPage(1); }}
                        >
                            Used
                        </FilterButton>
                    </FilterButtonGroup>
                </FilterGroup>

                <FilterGroup>
                    <FilterLabel>Offer</FilterLabel>
                    <FilterSelect
                        value={selectedOfferId}
                        onChange={(e) => { setSelectedOfferId(e.target.value); setCurrentPage(1); }}
                    >
                        <option value="all">All Offers</option>
                        {ticketOffers.map(offer => (
                            <option key={offer.id} value={offer.id}>
                                {offer.name}
                            </option>
                        ))}
                    </FilterSelect>
                </FilterGroup>

                {hasActiveFilters && (
                    <ClearFiltersButton onClick={clearFilters}>
                        <FiXCircle /> Clear Filters
                    </ClearFiltersButton>
                )}
            </FilterSection>

            <PaginationContainer>
                <PaginationControls>
                    <PaginationButton
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage <= 1}
                    >
                        Previous
                    </PaginationButton>
                    <PaginationInfo>
                        Page {currentPage} of {totalPages}
                    </PaginationInfo>
                    <PaginationButton
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage >= totalPages}
                    >
                        Next
                    </PaginationButton>
                </PaginationControls>

                <PageSizeSelector>
                    <span>Items per page:</span>
                    <select
                        value={pageSize}
                        onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    >
                        {PAGE_SIZE_OPTIONS.map(size => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                </PageSizeSelector>

                <PaginationInfo>
                    Showing {Math.min(filteredTickets.length, (currentPage - 1) * pageSize + 1)}-{Math.min(filteredTickets.length, currentPage * pageSize)} of {filteredTickets.length} tickets
                </PaginationInfo>
            </PaginationContainer>

            <ModalOverlay isOpen={isBulkModalOpen} onClick={() => { setIsBulkModalOpen(false); setBulkError(null); setBulkInfoMessage(null); setBulkCompanyId(''); }}>
                <ModalContent onClick={(e) => e.stopPropagation()}>
                    <h2>Create Multiple Tickets</h2>

                    <TabContainer>
                        <TabButton isActive={bulkTab === 'csv'} onClick={() => { setBulkTab('csv'); setBulkError(null); setBulkInfoMessage(null); }}>
                            Mikrotik CSV/HTML
                        </TabButton>
                        <TabButton isActive={bulkTab === 'json'} onClick={() => { setBulkTab('json'); setBulkError(null); setBulkInfoMessage(null); }}>
                            JSON
                        </TabButton>
                    </TabContainer>

                    {bulkError && (
                        <ErrorMessage>
                            {bulkError}
                        </ErrorMessage>
                    )}

                    {bulkInfoMessage && (
                        <InfoMessage variant="success">
                            {bulkInfoMessage}
                        </InfoMessage>
                    )}

                    {bulkTab === 'csv' ? (
                        <>
                            <p>Import tickets directly from a Mikrotik CSV/HTML file. Choose one offer and all imported tickets will be linked to it.</p>

                            {isSuperuser && (
                                <SelectGroup>
                                    <SelectLabel>Company *</SelectLabel>
                                    <SelectInput
                                        value={bulkCompanyId}
                                        onChange={(e) => setBulkCompanyId(e.target.value)}
                                        disabled={bulkLoading}
                                    >
                                        <option value="">-- Select a company --</option>
                                        {businessData.businesses.map(company => (
                                            <option key={company.id} value={company.id}>
                                                {company.name}
                                            </option>
                                        ))}
                                    </SelectInput>
                                </SelectGroup>
                            )}

                            <SelectGroup>
                                <SelectLabel>Target Offer *</SelectLabel>
                                <SelectInput
                                    value={csvOfferId}
                                    onChange={(e) => setCsvOfferId(e.target.value)}
                                    disabled={bulkLoading}
                                >
                                    <option value="">-- Select an offer --</option>
                                    {offerData.offers.map(offer => (
                                        <option key={offer.id} value={offer.id}>
                                            {offer.name}
                                        </option>
                                    ))}
                                </SelectInput>
                            </SelectGroup>

                            <FileInput
                                type="file"
                                accept=".csv,.html,.htm,text/csv,text/html"
                                onChange={handleCsvFileUpload}
                                disabled={bulkLoading}
                            />
                            {csvFileName && <InfoText>Selected file: {csvFileName}</InfoText>}

                            <CsvTextarea
                                placeholder={`Paste Mikrotik CSV content here...\nExample:\nLogin,Password,Uptime Limit,Used Uptime,Used Download,Used Upload\n"F1yz7","dbb6","3h","","",""\n"F1ayy","854d","3h","","",""`}
                                value={csvInput}
                                onChange={(e) => setCsvInput(e.target.value)}
                                disabled={bulkLoading}
                            />

                            {csvInput && (
                                <InfoText>
                                    {parseMikrotikCsv(csvInput).length} valid ticket(s) found
                                </InfoText>
                            )}

                            <ModalActions>
                                <CancelButton
                                    onClick={() => {
                                        setIsBulkModalOpen(false);
                                        setCsvInput('');
                                        setCsvFileName('');
                                        setCsvOfferId('');
                                        setBulkCompanyId('');
                                        setBulkError(null);
                                        setBulkInfoMessage(null);
                                    }}
                                    disabled={bulkLoading}
                                >
                                    Cancel
                                </CancelButton>
                                <SubmitBulkButton
                                    onClick={handleCsvImport}
                                    disabled={bulkLoading || !csvInput.trim() || !csvOfferId || (isSuperuser && !bulkCompanyId)}
                                >
                                    {bulkLoading ? 'Importing...' : 'Import Tickets'}
                                </SubmitBulkButton>
                            </ModalActions>
                        </>
                    ) : (
                        <>
                            <p>Enter a JSON array with ticket data. Each object should contain the form field names and an optional offer_id.</p>

                            {isSuperuser && (
                                <SelectGroup>
                                    <SelectLabel>Company *</SelectLabel>
                                    <SelectInput
                                        value={bulkCompanyId}
                                        onChange={(e) => setBulkCompanyId(e.target.value)}
                                        disabled={bulkLoading}
                                    >
                                        <option value="">-- Select a company --</option>
                                        {businessData.businesses.map(company => (
                                            <option key={company.id} value={company.id}>
                                                {company.name}
                                            </option>
                                        ))}
                                    </SelectInput>
                                </SelectGroup>
                            )}

                            <JsonExample>
                                <p>Example JSON format:</p>
                                <pre>{`[
  {
    "ticket_code": "CODE001",
    "ticket_secret": "secret123",
    "offer_id": "offer-uuid-123",
    "valid_until": "2025-12-31"
  },
  {
    "ticket_code": "CODE002",
    "ticket_secret": "secret456",
    "offer_id": "offer-uuid-123",
    "valid_until": "2025-12-31"
  }
]`}</pre>
                            </JsonExample>

                            <JsonTextarea
                                placeholder="Paste your JSON array here..."
                                value={bulkJsonInput}
                                onChange={(e) => setBulkJsonInput(e.target.value)}
                                disabled={bulkLoading}
                            />

                            <ModalActions>
                                <CancelButton
                                    onClick={() => {
                                        setIsBulkModalOpen(false);
                                        setBulkJsonInput('');
                                        setBulkCompanyId('');
                                        setBulkError(null);
                                        setBulkInfoMessage(null);
                                    }}
                                    disabled={bulkLoading}
                                >
                                    Cancel
                                </CancelButton>
                                <SubmitBulkButton
                                    onClick={handleBulkCreateTickets}
                                    disabled={bulkLoading || !bulkJsonInput.trim() || (isSuperuser && !bulkCompanyId)}
                                >
                                    {bulkLoading ? 'Creating...' : 'Create Tickets'}
                                </SubmitBulkButton>
                            </ModalActions>
                        </>
                    )}
                </ModalContent>
            </ModalOverlay>

            <ModalOverlay isOpen={isA4ModalOpen} onClick={() => { setIsA4ModalOpen(false); setA4InfoMessage(null); }}>
                <ModalContent onClick={(e) => e.stopPropagation()}>
                    <h2>Print A4 Coupons</h2>
                    <p>Generate an A4 sheet with multiple coupons from one offer. The selected tickets will be marked as used after printing.</p>

                    {a4InfoMessage && (
                        <InfoMessage variant={a4InfoMessage.includes('Failed') || a4InfoMessage.includes('No available') || a4InfoMessage.includes('Please select') ? 'info' : 'success'}>
                            {a4InfoMessage}
                        </InfoMessage>
                    )}

                    <SelectGroup>
                        <SelectLabel>Offer *</SelectLabel>
                        <SelectInput
                            value={a4OfferId}
                            onChange={(e) => { setA4OfferId(e.target.value); setA4InfoMessage(null); }}
                        >
                            <option value="">-- Select an offer --</option>
                            {offerData.offers.map(offer => (
                                <option key={offer.id} value={offer.id}>
                                    {offer.name}
                                </option>
                            ))}
                        </SelectInput>
                    </SelectGroup>

                    <InfoText>
                        Available tickets: {a4OfferId ? getAvailableTicketsForOffer(a4OfferId).length : 0} | Maximum per A4: {MAX_TICKETS_PER_A4}
                    </InfoText>

                    <SelectGroup>
                        <SelectLabel>Number of Coupons</SelectLabel>
                        <CounterGroup>
                            <CounterButton
                                onClick={() => {
                                    const available = a4OfferId ? getAvailableTicketsForOffer(a4OfferId).length : 0;
                                    setA4TicketCount(Math.max(1, Math.min(a4TicketCount - 1, available, MAX_TICKETS_PER_A4)));
                                }}
                                disabled={a4TicketCount <= 1}
                            >
                                -
                            </CounterButton>
                            <CounterValue>{a4TicketCount}</CounterValue>
                            <CounterButton
                                onClick={() => {
                                    const available = a4OfferId ? getAvailableTicketsForOffer(a4OfferId).length : 0;
                                    setA4TicketCount(Math.min(a4TicketCount + 1, available, MAX_TICKETS_PER_A4));
                                }}
                                disabled={a4TicketCount >= MAX_TICKETS_PER_A4 || a4TicketCount >= (a4OfferId ? getAvailableTicketsForOffer(a4OfferId).length : 0)}
                            >
                                +
                            </CounterButton>
                        </CounterGroup>
                    </SelectGroup>

                    <ModalActions>
                        <CancelButton onClick={() => { setIsA4ModalOpen(false); setA4InfoMessage(null); }}>
                            Cancel
                        </CancelButton>
                        <PrintA4Button onClick={handlePrintA4}>
                            <FiPrinter /> Generate & Print
                        </PrintA4Button>
                    </ModalActions>
                </ModalContent>
            </ModalOverlay>

            <CreateTicketModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateTicket}
                isLoading={isLoading}
                offers={offerData.offers}
            />

            {/* Bulk Delete Modal */}
            <ModalOverlay isOpen={isDeleteModalOpen} onClick={() => { if (!deleteLoading) { setIsDeleteModalOpen(false); resetDeleteForm(); } }}>
                <ModalContent onClick={e => e.stopPropagation()}>
                    <h2>Bulk Delete Tickets</h2>
                    <p>Choose tickets to delete. This action cannot be undone.</p>

                    <DeleteTabBar>
                        <DeleteTabButton isActive={deleteTab === 'period'} onClick={() => setDeleteTab('period')}>
                            By Date & Offer
                        </DeleteTabButton>
                        <DeleteTabButton isActive={deleteTab === 'select'} onClick={() => setDeleteTab('select')}>
                            Manual Selection
                        </DeleteTabButton>
                    </DeleteTabBar>

                    {deleteTab === 'period' ? (
                        <>
                            <DeleteFilterRow>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, minWidth: 60 }}>From</label>
                                <DeletePeriodInput
                                    type="date"
                                    value={deleteDateFrom}
                                    onChange={e => setDeleteDateFrom(e.target.value)}
                                />
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, minWidth: 30 }}>To</label>
                                <DeletePeriodInput
                                    type="date"
                                    value={deleteDateTo}
                                    onChange={e => setDeleteDateTo(e.target.value)}
                                />
                            </DeleteFilterRow>
                            <DeleteFilterRow>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, minWidth: 60 }}>Offer</label>
                                <FilterSelect
                                    value={deleteOfferId}
                                    onChange={e => setDeleteOfferId(e.target.value)}
                                    style={{ flex: 1 }}
                                >
                                    <option value="">All Offers</option>
                                    {ticketOffers.map(offer => (
                                        <option key={offer.id} value={offer.id}>{offer.name}</option>
                                    ))}
                                </FilterSelect>
                            </DeleteFilterRow>
                        </>
                    ) : (
                        <div style={{ marginBottom: spacing.md }}>
                            <p style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
                                Select tickets from the list using the checkboxes, then click "Delete Selected" or use this button:
                            </p>
                            <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                                {selectedTicketIds.size} ticket(s) currently selected
                            </p>
                        </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md }}>
                        <SelectCheckbox
                            type="checkbox"
                            checked={deleteIncludeUsed}
                            onChange={e => setDeleteIncludeUsed(e.target.checked)}
                        />
                        <label style={{ fontSize: '0.875rem', cursor: 'pointer' }}>
                            Also delete used/expired tickets
                        </label>
                    </div>

                    {deleteError && <ErrorMessage>{deleteError}</ErrorMessage>}
                    {deleteInfo && <InfoMessage variant="success">{deleteInfo}</InfoMessage>}

                    <ModalActions>
                        <CancelButton onClick={() => { setIsDeleteModalOpen(false); resetDeleteForm(); }} disabled={deleteLoading}>
                            Cancel
                        </CancelButton>
                        <ConfirmDeleteButton onClick={handleBulkDelete} disabled={deleteLoading}>
                            {deleteLoading ? 'Deleting...' : <><FiTrash2 /> Confirm Delete</>}
                        </ConfirmDeleteButton>
                    </ModalActions>
                </ModalContent>
            </ModalOverlay>

            {error && (
                <EmptyState>
                    <p style={{ color: '#d32f2f' }}>Error: {error}</p>
                </EmptyState>
            )}

            {!error && filteredTickets.length === 0 && (
                <EmptyState>
                    <p>{hasActiveFilters ? 'No tickets match the selected filters.' : 'No tickets found. Create your first ticket to get started.'}</p>
                </EmptyState>
            )}

            {paginatedTickets.length > 0 && (
                <>
                    <SelectAllBar>
                        <SelectCheckbox
                            type="checkbox"
                            checked={filteredTickets.length > 0 && selectedTicketIds.size === filteredTickets.length}
                            onChange={toggleSelectAll}
                        />
                        <span>Select all {filteredTickets.length} ticket(s) ({selectedTicketIds.size} selected)</span>
                        {selectedTicketIds.size > 0 && (
                            <BulkDeleteButton onClick={openDeleteModal} style={{ marginLeft: 'auto', padding: '6px 12px', fontSize: '0.8rem' }}>
                                <FiTrash2 /> Delete Selected ({selectedTicketIds.size})
                            </BulkDeleteButton>
                        )}
                    </SelectAllBar>
                <TicketsContainer>
                    {paginatedTickets.map(ticket => (
                        <TicketCard key={ticket.id}>
                            <TicketHeader>
                                <SelectCheckbox
                                    type="checkbox"
                                    checked={selectedTicketIds.has(ticket.id)}
                                    onChange={() => toggleTicketSelect(ticket.id)}
                                />
                                <TicketTitle>{ticket.ticket_code}</TicketTitle>
                                <UsedBadge isUsed={ticket.is_used}>
                                    {ticket.is_used ? 'Used' : 'Available'}
                                </UsedBadge>
                                {ticket.status && (
                                    <StatusBadge status={ticket.status}>
                                        {ticket.status}
                                    </StatusBadge>
                                )}
                            </TicketHeader>

                            <TicketContent>
                                <TicketDetails>
                                    <DetailRow>
                                        <DetailLabel>ID</DetailLabel>
                                        <DetailValue>{ticket.id}</DetailValue>
                                    </DetailRow>

                                    {ticket.ticket_code && (
                                        <DetailRow>
                                            <DetailLabel>Code</DetailLabel>
                                            <DetailValue>{ticket.ticket_code}</DetailValue>
                                        </DetailRow>
                                    )}

                                    {ticket.ticket_secret && (
                                        <DetailRow>
                                            <DetailLabel>Secret Key</DetailLabel>
                                            <SecretField>
                                                <SecretValue>
                                                    {revealedSecrets.has(ticket.id)
                                                        ? ticket.ticket_secret
                                                        : '•'.repeat(ticket.ticket_secret.length)}
                                                </SecretValue>
                                                <IconButton
                                                    title={revealedSecrets.has(ticket.id) ? 'Hide' : 'Show'}
                                                    onClick={() => toggleSecretVisibility(ticket.id)}
                                                >
                                                    {revealedSecrets.has(ticket.id) ? <FiEyeOff /> : <FiEye />}
                                                </IconButton>
                                                <IconButton
                                                    title="Copy"
                                                    onClick={() => copyToClipboard(ticket.ticket_secret)}
                                                >
                                                    <FiCopy />
                                                </IconButton>
                                            </SecretField>
                                        </DetailRow>
                                    )}

                                    {ticket.offer_name && (
                                        <DetailRow>
                                            <DetailLabel>Offer</DetailLabel>
                                            <DetailValue>{ticket.offer_name}</DetailValue>
                                        </DetailRow>
                                    )}

                                    {ticket.valid_from && (
                                        <DetailRow>
                                            <DetailLabel>Valid From</DetailLabel>
                                            <DetailValue>
                                                {new Date(ticket.valid_from).toLocaleDateString()}
                                            </DetailValue>
                                        </DetailRow>
                                    )}

                                    {ticket.valid_until && (
                                        <DetailRow>
                                            <DetailLabel>Valid Until</DetailLabel>
                                            <DetailValue>
                                                {new Date(ticket.valid_until).toLocaleDateString()}
                                            </DetailValue>
                                        </DetailRow>
                                    )}

                                    {ticket.is_used && ticket.used_at && (
                                        <DetailRow>
                                            <DetailLabel>Used At</DetailLabel>
                                            <DetailValue>
                                                {new Date(ticket.used_at).toLocaleString()}
                                            </DetailValue>
                                        </DetailRow>
                                    )}
                                </TicketDetails>
                            </TicketContent>

                            <TicketActions>
                                <PrintButton
                                    onClick={() => handlePrintThermal(ticket)}
                                    title="Print on 58mm thermal printer"
                                >
                                    <FiPrinter /> Print
                                </PrintButton>
                                {ticket.is_valid && !ticket.is_used && (
                                    <ActionButton
                                        title="Mark as used"
                                        onClick={() => handleUseTicket(ticket.id, ticket.ticket_code, ticket.ticket_secret)}
                                    >
                                        <FiX /> Use
                                    </ActionButton>
                                )}
                                <DeleteButton
                                    title="Delete ticket"
                                    onClick={() => handleDeleteTicket(ticket.id)}
                                >
                                    <FiTrash2 /> Delete
                                </DeleteButton>
                            </TicketActions>
                        </TicketCard>
                    ))}
                </TicketsContainer>
                </>
            )}

            <PrintContainer ref={printRef}>
                {filteredTickets.map((ticket: Ticket) => (
                    <ThermalTicket key={ticket.id} ticket={ticket} />
                ))}
            </PrintContainer>
        </ContentSection>
    );
};
