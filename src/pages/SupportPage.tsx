import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { colors, spacing } from '../config/theme';
import { useAuth, User } from '../hooks/useAuth';
import { useSupport, SupportTicket, SupportMessage } from '../hooks/useSupport';
import { FiMessageSquare, FiSend, FiCheck, FiRefreshCw, FiPlus, FiX, FiCheckCircle, FiRotateCcw } from 'react-icons/fi';

const ContentSection = styled.div`
  padding: ${spacing.xl};
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  height: calc(100vh - 80px);
`;

const PageHeader = styled.div`
  margin-bottom: ${spacing.xl};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${spacing.md};

  h1 {
    font-size: 2rem;
    color: ${colors.textPrimary};
    margin: 0;
  }

  p {
    color: ${colors.textSecondary};
    font-size: 0.875rem;
    margin: ${spacing.xs} 0 0 0;
  }
`;

const SupportLayout = styled.div`
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: ${spacing.xl};
  height: calc(100% - 100px);

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const TicketListPanel = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid ${colors.border};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const PanelHeader = styled.div`
  padding: ${spacing.lg};
  border-bottom: 1px solid ${colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    font-size: 1.1rem;
    color: ${colors.textPrimary};
    margin: 0;
  }
`;

const TicketList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
`;

const TicketCard = styled.div<{ active: boolean; unread: boolean }>`
  padding: ${spacing.md};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => {
        if (props.active) return '#f0f7ff';
        return props.unread ? '#fffbeb' : 'white';
    }};
  border: 1px solid ${props => {
        if (props.active) return colors.primary;
        return props.unread ? '#fde68a' : colors.border;
    }};

  &:hover {
    border-color: ${colors.primary};
  }

  .subject {
    font-weight: 600;
    color: ${colors.textPrimary};
    margin-bottom: ${spacing.xs};
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${spacing.sm};
  }

  .preview {
    font-size: 0.8rem;
    color: ${colors.textSecondary};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .meta {
    font-size: 0.7rem;
    color: ${colors.textSecondary};
    margin-top: ${spacing.sm};
    display: flex;
    justify-content: space-between;
  }
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 12px;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  background: ${props => {
        switch (props.status) {
            case 'open': return '#dbeafe';
            case 'waiting_admin': return '#fee2e2';
            case 'waiting_user': return '#dcfce7';
            case 'resolved': return '#e5e7eb';
            case 'closed': return '#f3f4f6';
            default: return colors.neutral;
        }
    }};
  color: ${props => {
        switch (props.status) {
            case 'open': return '#1e40af';
            case 'waiting_admin': return '#991b1b';
            case 'waiting_user': return '#166534';
            case 'resolved': return '#374151';
            case 'closed': return '#6b7280';
            default: return colors.textPrimary;
        }
    }};
`;

const ChatPanel = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid ${colors.border};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ChatHeader = styled.div`
  padding: ${spacing.lg};
  border-bottom: 1px solid ${colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    font-size: 1.1rem;
    color: ${colors.textPrimary};
    margin: 0;
  }

  .user-info {
    font-size: 0.8rem;
    color: ${colors.textSecondary};
  }
`;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
  background: #f8f9fa;
`;

const MessageBubble = styled.div<{ isAdmin: boolean; isMine: boolean }>`
  max-width: 75%;
  padding: ${spacing.md};
  border-radius: 12px;
  align-self: ${props => (props.isMine ? 'flex-end' : 'flex-start')};
  background: ${props => {
        if (props.isMine) return colors.primary;
        if (props.isAdmin) return '#fee2e2';
        return 'white';
    }};
  color: ${props => (props.isMine ? 'white' : colors.textPrimary)};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);

  .sender {
    font-size: 0.7rem;
    font-weight: 700;
    margin-bottom: ${spacing.xs};
    color: ${props => (props.isMine ? 'rgba(255,255,255,0.8)' : colors.textSecondary)};
  }

  .content {
    font-size: 0.9rem;
    line-height: 1.4;
  }

  .time {
    font-size: 0.65rem;
    margin-top: ${spacing.xs};
    text-align: right;
    color: ${props => (props.isMine ? 'rgba(255,255,255,0.7)' : colors.textSecondary)};
  }
`;

const ChatInputArea = styled.div`
  padding: ${spacing.lg};
  border-top: 1px solid ${colors.border};
  display: flex;
  gap: ${spacing.md};
`;

const ChatInput = styled.textarea`
  flex: 1;
  padding: ${spacing.md};
  border: 1px solid ${colors.border};
  border-radius: 8px;
  resize: none;
  font-family: inherit;
  font-size: 0.9rem;
  min-height: 50px;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'danger' | 'secondary' | 'success' }>`
  display: inline-flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.md} ${spacing.lg};
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${(props) => {
        if (props.variant === 'danger') return colors.error;
        if (props.variant === 'success') return '#16a34a';
        if (props.variant === 'secondary') return colors.neutral;
        return colors.primary;
    }};
  color: ${(props) => (props.variant === 'secondary' ? colors.textPrimary : 'white')};

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const IconButton = styled(Button)`
  padding: ${spacing.sm};
`;

const EmptyChat = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${colors.textSecondary};
  text-align: center;
  padding: ${spacing.xl};

  svg {
    font-size: 3rem;
    margin-bottom: ${spacing.md};
    color: ${colors.border};
  }

  h3 {
    color: ${colors.textPrimary};
    margin-bottom: ${spacing.sm};
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${spacing.lg};
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: ${spacing.xl};
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);

  h2 {
    margin: 0 0 ${spacing.lg} 0;
    color: ${colors.textPrimary};
  }
`;

const FormGroup = styled.div`
  margin-bottom: ${spacing.lg};

  label {
    display: block;
    font-weight: 600;
    margin-bottom: ${spacing.sm};
    color: ${colors.textPrimary};
  }

  input,
  textarea {
    width: 100%;
    padding: ${spacing.md};
    border: 1px solid ${colors.border};
    border-radius: 8px;
    font-size: 0.95rem;
    font-family: inherit;

    &:focus {
      outline: none;
      border-color: ${colors.primary};
    }
  }

  textarea {
    min-height: 120px;
    resize: vertical;
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${spacing.md};
`;

const ErrorMessage = styled.div`
  color: ${colors.error};
  font-size: 0.875rem;
  margin-bottom: ${spacing.md};
`;

export const SupportPage: React.FC = () => {
    const { user } = useAuth();
    const {
        tickets,
        selectedTicket,
        isLoading,
        error,
        getTickets,
        getTicketMessages,
        createTicket,
        sendMessage,
        closeTicket,
        reopenTicket,
    } = useSupport();

    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newSubject, setNewSubject] = useState('');
    const [newTicketMessage, setNewTicketMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const isAdmin = user?.is_superuser || user?.is_staff;

    useEffect(() => {
        getTickets();
    }, [getTickets]);

    useEffect(() => {
        if (selectedTicketId) {
            getTicketMessages(selectedTicketId);
        }
    }, [selectedTicketId, getTicketMessages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedTicket?.messages]);

    const handleSelectTicket = (ticketId: string) => {
        setSelectedTicketId(ticketId);
    };

    const handleSendMessage = async () => {
        if (!selectedTicketId || !newMessage.trim()) return;
        await sendMessage(selectedTicketId, newMessage.trim());
        setNewMessage('');
        await getTickets();
    };

    const handleCreateTicket = async () => {
        if (!newSubject.trim() || !newTicketMessage.trim()) return;
        const ticket = await createTicket(newSubject.trim(), newTicketMessage.trim());
        if (ticket) {
            setIsCreateModalOpen(false);
            setNewSubject('');
            setNewTicketMessage('');
            setSelectedTicketId(ticket.id);
        }
    };

    const handleCloseTicket = async () => {
        if (!selectedTicketId) return;
        await closeTicket(selectedTicketId);
        await getTickets();
    };

    const handleReopenTicket = async () => {
        if (!selectedTicketId) return;
        await reopenTicket(selectedTicketId);
        await getTickets();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('fr-FR', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'open': return 'Open';
            case 'waiting_admin': return 'Waiting admin';
            case 'waiting_user': return 'Waiting you';
            case 'resolved': return 'Resolved';
            case 'closed': return 'Closed';
            default: return status;
        }
    };

    return (
        <ContentSection>
            <PageHeader>
                <div>
                    <h1>Support</h1>
                    <p>Open a ticket to get help from our team.</p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                    <FiPlus /> New ticket
                </Button>
            </PageHeader>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <SupportLayout>
                <TicketListPanel>
                    <PanelHeader>
                        <h2>Tickets</h2>
                        <IconButton variant="secondary" onClick={() => getTickets()} disabled={isLoading}>
                            <FiRefreshCw />
                        </IconButton>
                    </PanelHeader>
                    <TicketList>
                        {tickets.map(ticket => (
                            <TicketCard
                                key={ticket.id}
                                active={selectedTicketId === ticket.id}
                                unread={ticket.unread_count > 0}
                                onClick={() => handleSelectTicket(ticket.id)}
                            >
                                <div className="subject">
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ticket.subject}</span>
                                    <StatusBadge status={ticket.status}>{getStatusLabel(ticket.status)}</StatusBadge>
                                </div>
                                <div className="preview">{ticket.last_message?.content || 'No messages yet'}</div>
                                <div className="meta">
                                    <span>{formatDate(ticket.updated_at)}</span>
                                    {ticket.unread_count > 0 && <strong>{ticket.unread_count} new</strong>}
                                </div>
                            </TicketCard>
                        ))}
                        {tickets.length === 0 && !isLoading && (
                            <EmptyChat style={{ flex: 1 }}>
                                <FiMessageSquare />
                                <h3>No tickets</h3>
                                <p>Create a new ticket to start.</p>
                            </EmptyChat>
                        )}
                    </TicketList>
                </TicketListPanel>

                <ChatPanel>
                    {selectedTicket ? (
                        <>
                            <ChatHeader>
                                <div>
                                    <h2>{selectedTicket.subject}</h2>
                                    <div className="user-info">
                                        {isAdmin ? `Opened by ${selectedTicket.user.name || 'User'}` : `Ticket #${selectedTicket.id.slice(0, 8)}`}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: spacing.sm }}>
                                    {selectedTicket.status === 'resolved' || selectedTicket.status === 'closed' ? (
                                        <Button variant="secondary" onClick={handleReopenTicket}>
                                            <FiRotateCcw /> Reopen
                                        </Button>
                                    ) : (
                                        <Button variant="success" onClick={handleCloseTicket}>
                                            <FiCheckCircle /> Resolve
                                        </Button>
                                    )}
                                </div>
                            </ChatHeader>
                            <ChatMessages>
                                {selectedTicket.messages.map((msg: SupportMessage) => {
                                    const mine = msg.sender.id === user?.id;
                                    return (
                                        <MessageBubble key={msg.id} isAdmin={msg.is_admin} isMine={mine}>
                                            <div className="sender">
                                                {msg.sender.name || 'User'}
                                                {msg.is_admin && ' (Admin)'}
                                            </div>
                                            <div className="content">{msg.content}</div>
                                            <div className="time">{formatDate(msg.created_at)}</div>
                                        </MessageBubble>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </ChatMessages>
                            {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                                <ChatInputArea>
                                    <ChatInput
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                        placeholder="Type your message..."
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                    />
                                    <Button onClick={handleSendMessage} disabled={!newMessage.trim() || isLoading}>
                                        <FiSend /> Send
                                    </Button>
                                </ChatInputArea>
                            )}
                        </>
                    ) : (
                        <EmptyChat>
                            <FiMessageSquare />
                            <h3>Select a ticket</h3>
                            <p>Choose a ticket from the list to view the conversation.</p>
                        </EmptyChat>
                    )}
                </ChatPanel>
            </SupportLayout>

            {isCreateModalOpen && (
                <ModalOverlay onClick={() => setIsCreateModalOpen(false)}>
                    <ModalContent onClick={e => e.stopPropagation()}>
                        <h2>New support ticket</h2>
                        <FormGroup>
                            <label>Subject</label>
                            <input
                                type="text"
                                value={newSubject}
                                onChange={e => setNewSubject(e.target.value)}
                                placeholder="What is your issue about?"
                            />
                        </FormGroup>
                        <FormGroup>
                            <label>Message</label>
                            <textarea
                                value={newTicketMessage}
                                onChange={e => setNewTicketMessage(e.target.value)}
                                placeholder="Describe your problem in detail..."
                            />
                        </FormGroup>
                        <ModalActions>
                            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreateTicket} disabled={!newSubject.trim() || !newTicketMessage.trim()}>
                                Create ticket
                            </Button>
                        </ModalActions>
                    </ModalContent>
                </ModalOverlay>
            )}
        </ContentSection>
    );
};
