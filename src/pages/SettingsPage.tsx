import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { colors, spacing } from '../config/theme';
import { useAuth } from '../hooks/useAuth';
import { FiUser, FiLock, FiMonitor, FiTrash2, FiSave, FiLoader, FiBell } from 'react-icons/fi';

const ContentSection = styled.div`
  padding: ${spacing.xl};
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
`;

const PageHeader = styled.div`
  margin-bottom: ${spacing.xxl};

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

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: ${spacing.xl};
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: ${spacing.xl};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid ${colors.border};
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  margin-bottom: ${spacing.lg};

  h2 {
    font-size: 1.25rem;
    color: ${colors.textPrimary};
    margin: 0;
  }

  svg {
    color: ${colors.primary};
    font-size: 1.5rem;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
  margin-bottom: ${spacing.lg};
`;

const Label = styled.label`
  font-weight: 600;
  color: ${colors.textPrimary};
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: ${spacing.md};
  border: 1px solid ${colors.border};
  border-radius: 8px;
  font-size: 0.95rem;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.1);
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'danger' }>`
  display: inline-flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.md} ${spacing.lg};
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${(props) => (props.variant === 'danger' ? colors.error : colors.primary)};
  color: white;

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const Alert = styled.div<{ type: 'success' | 'error' }>`
  padding: ${spacing.md};
  border-radius: 8px;
  margin-bottom: ${spacing.lg};
  background-color: ${(props) => (props.type === 'success' ? '#d4edda' : '#f8d7da')};
  color: ${(props) => (props.type === 'success' ? '#155724' : '#721c24')};
  font-size: 0.9rem;
`;

const SessionsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
`;

const SessionItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${spacing.md};
  border: 1px solid ${colors.border};
  border-radius: 8px;
  background: #fafafa;
`;

const SessionInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xs};

  strong {
    color: ${colors.textPrimary};
  }

  small {
    color: ${colors.textSecondary};
  }
`;

const EmptyState = styled.p`
  color: ${colors.textSecondary};
  font-style: italic;
  margin: 0;
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  padding: ${spacing.sm} 0;
  border-bottom: 1px solid ${colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  font-size: 0.95rem;
  color: ${colors.textPrimary};
  cursor: pointer;
  flex: 1;
`;

const formatDate = (value: string | null | undefined) => {
    if (!value) return 'Unknown';
    return new Date(value).toLocaleString();
};

export const SettingsPage: React.FC = () => {
    const { user, updateProfile, changePassword, getSessions, revokeSession, getNotificationPreferences, updateNotificationPreferences } = useAuth();

    const [profile, setProfile] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
    });
    const [profileStatus, setProfileStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [profileLoading, setProfileLoading] = useState(false);

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [passwordLoading, setPasswordLoading] = useState(false);

    const [sessions, setSessions] = useState<any[]>([]);
    const [sessionsLoading, setSessionsLoading] = useState(false);

    const [notificationTypes, setNotificationTypes] = useState<{ key: string; label: string }[]>([]);
    const [notificationPrefs, setNotificationPrefs] = useState<Record<string, boolean>>({});
    const [notificationPrefsLoading, setNotificationPrefsLoading] = useState(false);
    const [notificationPrefsStatus, setNotificationPrefsStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    useEffect(() => {
        setProfile({
            first_name: user?.first_name || '',
            last_name: user?.last_name || '',
        });
    }, [user]);

    useEffect(() => {
        fetchSessions();
        fetchNotificationPreferences();
    }, []);

    const fetchSessions = async () => {
        setSessionsLoading(true);
        const result = await getSessions();
        setSessions(result.sessions);
        setSessionsLoading(false);
    };

    const fetchNotificationPreferences = async () => {
        setNotificationPrefsLoading(true);
        const result = await getNotificationPreferences();
        if (result.preferences) {
            setNotificationPrefs(result.preferences);
        }
        if (result.types) {
            setNotificationTypes(result.types);
        }
        setNotificationPrefsLoading(false);
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileStatus(null);
        const result = await updateProfile(profile);
        setProfileLoading(false);
        if (result.success) {
            setProfileStatus({ type: 'success', message: 'Profile updated successfully.' });
        } else {
            setProfileStatus({ type: 'error', message: result.error || 'Failed to update profile.' });
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordStatus(null);

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordStatus({ type: 'error', message: 'New passwords do not match.' });
            return;
        }

        if (passwordForm.newPassword.length < 8) {
            setPasswordStatus({ type: 'error', message: 'Password must be at least 8 characters long.' });
            return;
        }

        setPasswordLoading(true);
        const result = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
        setPasswordLoading(false);

        if (result.success) {
            setPasswordStatus({ type: 'success', message: 'Password changed successfully.' });
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } else {
            setPasswordStatus({ type: 'error', message: result.error || 'Failed to change password.' });
        }
    };

    const handleRevokeSession = async (sessionKeyPrefix: string) => {
        const result = await revokeSession(sessionKeyPrefix);
        if (result.success) {
            await fetchSessions();
        }
    };

    const handleNotificationPreferenceChange = async (key: string, enabled: boolean) => {
        const updated = { ...notificationPrefs, [key]: enabled };
        setNotificationPrefs(updated);
        setNotificationPrefsStatus(null);
        const result = await updateNotificationPreferences(updated);
        if (result.success) {
            setNotificationPrefsStatus({ type: 'success', message: 'Notification preferences updated.' });
        } else {
            setNotificationPrefsStatus({ type: 'error', message: result.error || 'Failed to update preferences.' });
        }
    };

    return (
        <ContentSection>
            <PageHeader>
                <h1>Settings</h1>
                <p>Manage your profile, password, and active sessions</p>
            </PageHeader>

            <CardsGrid>
                <Card>
                    <CardHeader>
                        <FiUser />
                        <h2>Profile</h2>
                    </CardHeader>
                    {profileStatus && <Alert type={profileStatus.type}>{profileStatus.message}</Alert>}
                    <form onSubmit={handleProfileSubmit}>
                        <FormGroup>
                            <Label htmlFor="first_name">First Name</Label>
                            <Input
                                id="first_name"
                                value={profile.first_name}
                                onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                                disabled={profileLoading}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label htmlFor="last_name">Last Name</Label>
                            <Input
                                id="last_name"
                                value={profile.last_name}
                                onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                                disabled={profileLoading}
                            />
                        </FormGroup>
                        <Button type="submit" disabled={profileLoading}>
                            {profileLoading ? <FiLoader className="spin" /> : <FiSave />} Save Profile
                        </Button>
                    </form>
                </Card>

                <Card>
                    <CardHeader>
                        <FiLock />
                        <h2>Change Password</h2>
                    </CardHeader>
                    {passwordStatus && <Alert type={passwordStatus.type}>{passwordStatus.message}</Alert>}
                    <form onSubmit={handlePasswordSubmit}>
                        <FormGroup>
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <Input
                                id="currentPassword"
                                type="password"
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                disabled={passwordLoading}
                                required
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                disabled={passwordLoading}
                                required
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                disabled={passwordLoading}
                                required
                            />
                        </FormGroup>
                        <Button type="submit" disabled={passwordLoading}>
                            {passwordLoading ? <FiLoader className="spin" /> : <FiLock />} Change Password
                        </Button>
                    </form>
                </Card>

                <Card>
                    <CardHeader>
                        <FiBell />
                        <h2>Notification Preferences</h2>
                    </CardHeader>
                    {notificationPrefsStatus && <Alert type={notificationPrefsStatus.type}>{notificationPrefsStatus.message}</Alert>}
                    {notificationPrefsLoading ? (
                        <EmptyState>Loading preferences...</EmptyState>
                    ) : notificationTypes.length === 0 ? (
                        <EmptyState>No notification preferences available.</EmptyState>
                    ) : (
                        <form>
                            {notificationTypes.map((type) => (
                                <CheckboxGroup key={type.key}>
                                    <Checkbox
                                        id={`notif-${type.key}`}
                                        type="checkbox"
                                        checked={notificationPrefs[type.key] !== false}
                                        onChange={(e) => handleNotificationPreferenceChange(type.key, e.target.checked)}
                                        disabled={notificationPrefsLoading}
                                    />
                                    <CheckboxLabel htmlFor={`notif-${type.key}`}>{type.label}</CheckboxLabel>
                                </CheckboxGroup>
                            ))}
                        </form>
                    )}
                </Card>

                <Card>
                    <CardHeader>
                        <FiMonitor />
                        <h2>Active Sessions</h2>
                    </CardHeader>
                    {sessionsLoading ? (
                        <EmptyState>Loading sessions...</EmptyState>
                    ) : sessions.length === 0 ? (
                        <EmptyState>No active sessions found.</EmptyState>
                    ) : (
                        <SessionsList>
                            {sessions.map((session, index) => (
                                <SessionItem key={index}>
                                    <SessionInfo>
                                        <strong>{session.device || 'Unknown device'}</strong>
                                        <small>IP: {session.ip || 'Unknown'} · {formatDate(session.last_activity)}</small>
                                        {session.current && <small><strong>Current session</strong></small>}
                                    </SessionInfo>
                                    {!session.current && (
                                        <Button variant="danger" onClick={() => handleRevokeSession(session.session_key_prefix)}>
                                            <FiTrash2 /> Revoke
                                        </Button>
                                    )}
                                </SessionItem>
                            ))}
                        </SessionsList>
                    )}
                </Card>
            </CardsGrid>
        </ContentSection>
    );
};

export default SettingsPage;
