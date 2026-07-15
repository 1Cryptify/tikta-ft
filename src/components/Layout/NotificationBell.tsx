import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FiBell, FiCheck } from 'react-icons/fi';
import { useAuth, NotificationItem } from '../../hooks/useAuth';

const Container = styled.div`
  position: relative;
  display: inline-flex;
`;

const BellButton = styled.button<{ hasUnread: boolean }>`
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
  color: ${(props) => (props.hasUnread ? '#007bff' : '#666')};
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;

  &:hover {
    color: #007bff;
  }

  svg {
    font-size: 1.35rem;
  }
`;

const Badge = styled.span`
  position: absolute;
  top: 2px;
  right: 2px;
  background-color: #dc3545;
  color: white;
  border-radius: 50%;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Dropdown = styled.div<{ isOpen: boolean }>`
  display: ${(props) => (props.isOpen ? 'block' : 'none')};
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 360px;
  max-height: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
  border: 1px solid #eee;

  @media (max-width: 480px) {
    width: 300px;
    right: -50px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;

  h3 {
    margin: 0;
    font-size: 1rem;
    color: #1a1a1a;
  }
`;

const ActionLink = styled.button`
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  font-size: 0.85rem;

  &:hover {
    text-decoration: underline;
  }
`;

const NotificationList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 360px;
  overflow-y: auto;
`;

const NotificationItemStyled = styled.li<{ isRead: boolean }>`
  padding: 0.9rem 1rem;
  border-bottom: 1px solid #f5f5f5;
  background-color: ${(props) => (props.isRead ? 'white' : '#f0f7ff')};
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const NotificationTitle = styled.div`
  font-weight: 600;
  font-size: 0.9rem;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
`;

const NotificationMessage = styled.div`
  font-size: 0.85rem;
  color: #555;
  line-height: 1.4;
  margin-bottom: 0.25rem;
`;

const NotificationMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: #888;
`;

const EmptyState = styled.div`
  padding: 2rem;
  text-align: center;
  color: #888;
  font-size: 0.9rem;
`;

const Footer = styled.div`
  padding: 0.75rem 1rem;
  border-top: 1px solid #eee;
  text-align: center;
  font-size: 0.85rem;
  color: #666;
`;

const formatDistanceToNow = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
};

export const NotificationBell: React.FC = () => {
    const { getNotifications, markNotificationRead } = useAuth();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        const result = await getNotifications(true);
        if (result.notifications) {
            setNotifications(result.notifications);
        }
        setUnreadCount(result.unread_count);
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [getNotifications]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = async () => {
        if (!isOpen) {
            setIsLoading(true);
            await fetchNotifications();
            setIsLoading(false);
        }
        setIsOpen(!isOpen);
    };

    const handleMarkRead = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const result = await markNotificationRead(id);
        if (result.success) {
            await fetchNotifications();
        }
    };

    const handleMarkAllRead = async () => {
        const result = await markNotificationRead(undefined, true);
        if (result.success) {
            await fetchNotifications();
        }
    };

    const handleItemClick = async (notification: NotificationItem) => {
        if (!notification.is_read) {
            await markNotificationRead(notification.id);
        }
        await fetchNotifications();
        setIsOpen(false);
    };

    const formatTime = (dateString: string) => {
        try {
            return formatDistanceToNow(new Date(dateString));
        } catch {
            return dateString;
        }
    };

    return (
        <Container ref={containerRef}>
            <BellButton onClick={handleToggle} hasUnread={unreadCount > 0} aria-label="Notifications">
                <FiBell />
                {unreadCount > 0 && <Badge>{unreadCount > 99 ? '99+' : unreadCount}</Badge>}
            </BellButton>

            <Dropdown isOpen={isOpen}>
                <Header>
                    <h3>Notifications</h3>
                    {notifications.length > 0 && (
                        <ActionLink onClick={handleMarkAllRead}>
                            <FiCheck style={{ verticalAlign: 'middle' }} /> Mark all read
                        </ActionLink>
                    )}
                </Header>

                {isLoading ? (
                    <EmptyState>Loading...</EmptyState>
                ) : notifications.length === 0 ? (
                    <EmptyState>No notifications</EmptyState>
                ) : (
                    <NotificationList>
                        {notifications.map((notification) => (
                            <NotificationItemStyled
                                key={notification.id}
                                isRead={notification.is_read}
                                onClick={() => handleItemClick(notification)}
                            >
                                <NotificationTitle>{notification.title}</NotificationTitle>
                                <NotificationMessage>{notification.message}</NotificationMessage>
                                <NotificationMeta>
                                    <span>{formatTime(notification.created_at)}</span>
                                    {!notification.is_read && (
                                        <ActionLink onClick={(e) => handleMarkRead(e, notification.id)}>
                                            <FiCheck /> Read
                                        </ActionLink>
                                    )}
                                </NotificationMeta>
                            </NotificationItemStyled>
                        ))}
                    </NotificationList>
                )}

                <Footer>
                    {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                </Footer>
            </Dropdown>
        </Container>
    );
};

export default NotificationBell;
