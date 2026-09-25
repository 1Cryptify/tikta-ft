import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { colors, spacing } from '../config/theme';
import { useAuth, NotificationItem } from '../hooks/useAuth';
import { FiBell, FiCheck, FiCheckCircle, FiTrash2, FiRefreshCw } from 'react-icons/fi';

const ContentSection = styled.div`
  padding: ${spacing.xl};
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
`;

const PageHeader = styled.div`
  margin-bottom: ${spacing.xxl};
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: ${spacing.md};

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

const HeaderActions = styled.div`
  display: flex;
  gap: ${spacing.md};
`;

const NotificationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
`;

const NotificationCard = styled.div<{ isRead: boolean }>`
  background: ${props => (props.isRead ? 'white' : '#f0f7ff')};
  border-radius: 12px;
  padding: ${spacing.lg};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid ${props => (props.isRead ? colors.border : '#dbeafe')};
  display: flex;
  gap: ${spacing.md};
  align-items: flex-start;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const NotificationIcon = styled.div<{ isRead: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => (props.isRead ? colors.neutral : '#dbeafe')};
  color: ${props => (props.isRead ? colors.textSecondary : colors.primary)};
  flex-shrink: 0;
`;

const NotificationContent = styled.div`
  flex: 1;
  min-width: 0;

  h3 {
    font-size: 1rem;
    color: ${colors.textPrimary};
    margin: 0 0 ${spacing.xs} 0;
  }

  p {
    color: ${colors.textSecondary};
    font-size: 0.9rem;
    margin: 0 0 ${spacing.sm} 0;
    line-height: 1.4;
  }

  .meta {
    font-size: 0.75rem;
    color: ${colors.textSecondary};
  }
`;

const NotificationActions = styled.div`
  display: flex;
  gap: ${spacing.sm};
  flex-shrink: 0;
`;

const IconButton = styled.button<{ variant?: 'primary' | 'danger' | 'ghost' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.sm};
  padding: ${spacing.sm};
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => {
        if (props.variant === 'danger') return colors.error;
        if (props.variant === 'primary') return colors.primary;
        return 'transparent';
    }};
  color: ${props => (props.variant === 'ghost' ? colors.textSecondary : 'white')};

  &:hover:not(:disabled) {
    opacity: 0.85;
    background: ${props => props.variant === 'ghost' ? colors.neutral : undefined};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${spacing.xxl};
  color: ${colors.textSecondary};

  svg {
    font-size: 3rem;
    margin-bottom: ${spacing.md};
    color: ${colors.border};
  }

  h3 {
    font-size: 1.25rem;
    color: ${colors.textPrimary};
    margin-bottom: ${spacing.sm};
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'danger' | 'secondary' }>`
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

const FilterTabs = styled.div`
  display: flex;
  gap: ${spacing.sm};
  margin-bottom: ${spacing.lg};
`;

const FilterTab = styled.button<{ active: boolean }>`
  padding: ${spacing.sm} ${spacing.md};
  border-radius: 20px;
  border: 1px solid ${colors.border};
  background: ${props => (props.active ? colors.primary : 'white')};
  color: ${props => (props.active ? 'white' : colors.textPrimary)};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${colors.primary};
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.md};
  margin-top: ${spacing.lg};
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

export const NotificationsPage: React.FC = () => {
    const { getNotifications, markNotificationRead, deleteNotification } = useAuth();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchNotifications = async (unreadOnly?: boolean, targetPage = 1) => {
        setIsLoading(true);
        const result = await getNotifications(unreadOnly, targetPage);
        if (result.notifications) {
            setNotifications(result.notifications);
        }
        setUnreadCount(result.unread_count || 0);
        setPage(result.page || 1);
        setTotalPages(result.total_pages || 1);
        setTotalCount(result.total_count || 0);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchNotifications(filter === 'unread' ? true : undefined, page);
    }, [filter, page]);

    const handleFilterChange = (next: 'all' | 'unread') => {
        setFilter(next);
        setPage(1);
    };

    const handleMarkRead = async (id: string) => {
        const result = await markNotificationRead(id);
        if (result.success) {
            if (filter === 'unread') {
                fetchNotifications(true, page);
                return;
            }
            setNotifications(prev =>
                prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    };

    const handleMarkAllRead = async () => {
        const result = await markNotificationRead(undefined, true);
        if (result.success) {
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
            if (filter === 'unread') {
                fetchNotifications(true, page);
            }
        }
    };

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        const result = await deleteNotification(id);
        setDeletingId(null);
        if (result.success) {
            const remaining = totalCount - 1;
            const lastPage = Math.max(1, Math.ceil(remaining / 10));
            const targetPage = Math.min(page, lastPage);
            if (targetPage !== page) {
                setPage(targetPage);
            } else {
                fetchNotifications(filter === 'unread' ? true : undefined, targetPage);
            }
        }
    };

    const handleDeleteRead = async () => {
        const result = await deleteNotification(undefined, true);
        if (result.success) {
            if (page !== 1) {
                setPage(1);
            } else {
                fetchNotifications(filter === 'unread' ? true : undefined, 1);
            }
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <ContentSection>
            <PageHeader>
                <div>
                    <h1>Notifications</h1>
                    <p>You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}.</p>
                </div>
                <HeaderActions>
                    <Button variant="secondary" onClick={() => fetchNotifications(filter === 'unread' ? true : undefined, page)} disabled={isLoading}>
                        <FiRefreshCw /> Refresh
                    </Button>
                    {unreadCount > 0 && (
                        <Button onClick={handleMarkAllRead} disabled={isLoading}>
                            <FiCheckCircle /> Mark all read
                        </Button>
                    )}
                    <Button variant="danger" onClick={handleDeleteRead} disabled={isLoading}>
                        <FiTrash2 /> Delete read
                    </Button>
                </HeaderActions>
            </PageHeader>

            <FilterTabs>
                <FilterTab active={filter === 'all'} onClick={() => handleFilterChange('all')}>All</FilterTab>
                <FilterTab active={filter === 'unread'} onClick={() => handleFilterChange('unread')}>Unread ({unreadCount})</FilterTab>
            </FilterTabs>

            {isLoading && notifications.length === 0 ? (
                <EmptyState>
                    <FiBell />
                    <h3>Loading notifications...</h3>
                </EmptyState>
            ) : notifications.length === 0 ? (
                <EmptyState>
                    <FiBell />
                    <h3>No notifications</h3>
                    <p>You will see your notifications here.</p>
                </EmptyState>
            ) : (
                <>
                    <NotificationList>
                        {notifications.map(notification => (
                            <NotificationCard key={notification.id} isRead={notification.is_read}>
                                <NotificationIcon isRead={notification.is_read}>
                                    <FiBell size={20} />
                                </NotificationIcon>
                                <NotificationContent>
                                    <h3>{notification.title}</h3>
                                    <p>{notification.message}</p>
                                    <div className="meta">{formatDate(notification.created_at)}</div>
                                </NotificationContent>
                                <NotificationActions>
                                    {!notification.is_read && (
                                        <IconButton variant="primary" onClick={() => handleMarkRead(notification.id)} title="Mark as read">
                                            <FiCheck size={18} />
                                        </IconButton>
                                    )}
                                    <IconButton
                                        variant="danger"
                                        onClick={() => handleDelete(notification.id)}
                                        disabled={deletingId === notification.id}
                                        title="Delete"
                                    >
                                        <FiTrash2 size={18} />
                                    </IconButton>
                                </NotificationActions>
                            </NotificationCard>
                        ))}
                    </NotificationList>

                    <PaginationContainer>
                        <PaginationControls>
                            <PaginationButton
                                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                                disabled={page <= 1 || isLoading}
                            >
                                Previous
                            </PaginationButton>
                            <PaginationInfo>
                                Page {page} of {totalPages}
                            </PaginationInfo>
                            <PaginationButton
                                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={page >= totalPages || isLoading}
                            >
                                Next
                            </PaginationButton>
                        </PaginationControls>
                        <PaginationInfo>
                            {totalCount} notification{totalCount !== 1 ? 's' : ''}
                        </PaginationInfo>
                    </PaginationContainer>
                </>
            )}
        </ContentSection>
    );
};
