import React, { useState, useRef } from 'react';
import styled from 'styled-components';
// @ts-ignore
import QRCode from 'qrcode.react';
import { FiPrinter, FiEye, FiEyeOff, FiCheck, FiX, FiCopy, FiPlus, FiTrash2 } from 'react-icons/fi';
import { colors, spacing } from '../config/theme';
import { useTicket, Ticket } from '../hooks/useTicket';
import LoadingSpinner from '../components/LoadingSpinner';
import CreateTicketModal from '../components/CreateTicketModal';

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

const CreateButton = styled.button`
  padding: 10px 16px;
  background: #007bff;
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

  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 0.8rem;
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
  border: 1px solid #e0e0e0;
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
  border-top: 1px solid #e0e0e0;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #ddd;
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
  background: #007bff;
  color: white;
  border-color: #007bff;

  &:hover {
    background: #0056b3;
    border-color: #0056b3;
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

const EmptyState = styled.div`
  text-align: center;
  padding: ${spacing.xxl};
  color: ${colors.textSecondary};

  p {
    margin: 0;
  }
`;

const PrintContainer = styled.div`
  display: none;

  @media print {
    display: block;
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
    const tickets = ticketData?.tickets || [];
    const isLoading = ticketData?.isLoading || false;
    const error = ticketData?.error || null;
    const [revealedSecrets, setRevealedSecrets] = useState<Set<string>>(new Set());
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const handleCreateTicket = async (data: Partial<Ticket> & { valid_until: string; offer_id?: string; payment_id?: string }) => {
        await ticketData.createTicket(data);
    };

    const handleDeleteTicket = async (ticketId: string) => {
        if (window.confirm('Are you sure you want to delete this ticket?')) {
            await ticketData.deleteTicket(ticketId);
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
              font-size: 7pt;
            }
            .value {
              font-size: 8pt;
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
                    <div class="value">${ticket.id || 'N/A'}</div>
                  </div>

                  <div class="field">
                    <div class="label">Code:</div>
                    <div class="value">${ticket.ticket_code || 'N/A'}</div>
                  </div>

                  <div class="field">
                    <div class="label">Secret:</div>
                    <div class="value">${ticket.ticket_secret || 'N/A'}</div>
                  </div>

                  ${ticket.offer_name ? `
                    <div class="field">
                      <div class="label">Offer:</div>
                      <div class="value">${ticket.offer_name}</div>
                    </div>
                  ` : ''}
                </div>

                <div class="qr">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=128x128&data=${encodeURIComponent(qrValue)}" />
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
            setTimeout(() => {
                printWindow.print();
            }, 500);
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
                <CreateButton onClick={() => setIsCreateModalOpen(true)} disabled={isLoading}>
                    <FiPlus /> Create Ticket
                </CreateButton>
            </PageHeader>

            <CreateTicketModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateTicket}
                isLoading={isLoading}
            />

            {error && (
                <EmptyState>
                    <p style={{ color: '#d32f2f' }}>Error: {error}</p>
                </EmptyState>
            )}

            {!error && tickets.length === 0 && (
                <EmptyState>
                    <p>No tickets found. Create your first ticket to get started.</p>
                </EmptyState>
            )}

            {tickets.length > 0 && (
                <TicketsContainer>
                    {tickets.map(ticket => (
                        <TicketCard key={ticket.id}>
                            <TicketHeader>
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
            )}

            <PrintContainer ref={printRef}>
                {tickets.map((ticket: Ticket) => (
                    <ThermalTicket key={ticket.id} ticket={ticket} />
                ))}
            </PrintContainer>
        </ContentSection>
    );
};
