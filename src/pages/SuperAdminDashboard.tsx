import React, { useState } from 'react';
import styled from 'styled-components';
import { MainLayout } from '../components/Layout/MainLayout';
import { colors, spacing } from '../config/theme';
import { User } from '../hooks/useAuth';
import {
  FiLayout,
  FiUsers,
  FiBriefcase,
  FiUserCheck,
  FiDollarSign,
  FiLock,
  FiSettings,
} from 'react-icons/fi';

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
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${spacing.xl};
  margin-bottom: ${spacing.xxl};
`;

const Card = styled.div`
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: 8px;
  padding: ${spacing.xl};

  h3 {
    color: ${colors.textPrimary};
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: ${spacing.md};
    color: ${colors.textSecondary};
  }

  .value {
    font-size: 2rem;
    font-weight: 700;
    color: ${colors.primary};
    margin-bottom: ${spacing.sm};
  }

  .subtitle {
    font-size: 0.875rem;
    color: ${colors.textSecondary};
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: 8px;
  overflow: hidden;

  thead {
    background-color: #f3f4f6;
    border-bottom: 1px solid ${colors.border};
  }

  th {
    padding: ${spacing.lg};
    text-align: left;
    font-weight: 600;
    font-size: 0.875rem;
    color: ${colors.textPrimary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  td {
    padding: ${spacing.lg};
    border-bottom: 1px solid ${colors.border};
    font-size: 0.875rem;
    color: ${colors.textPrimary};
  }

  tbody tr:hover {
    background-color: #f9fafb;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: ${spacing.sm} ${spacing.md};
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  background-color: ${props => {
    switch (props.status) {
      case 'active':
      case 'verified':
        return '#d1f2e8';
      case 'pending':
        return '#fef3c7';
      case 'blocked':
      case 'inactive':
        return '#fee2e2';
      default:
        return colors.border;
    }
  }};

  color: ${props => {
    switch (props.status) {
      case 'active':
      case 'verified':
        return colors.success;
      case 'pending':
        return '#b45309';
      case 'blocked':
      case 'inactive':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  }};
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: ${colors.primary};
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0;
  transition: color 150ms ease-in-out;
  margin-right: ${spacing.lg};

  &:hover {
    color: ${colors.primaryDark};
    text-decoration: underline;
  }
`;

const DangerButton = styled(ActionButton)`
  color: ${colors.error};

  &:hover {
    color: #b91c1c;
  }
`;

interface SuperAdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  user,
  onLogout,
}) => {
  const [activeNav, setActiveNav] = useState('overview');

  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <FiLayout size={20} />,
      active: activeNav === 'overview',
      onClick: () => setActiveNav('overview'),
    },
    {
      id: 'users',
      label: 'Users Management',
      icon: <FiUsers size={20} />,
      active: activeNav === 'users',
      onClick: () => setActiveNav('users'),
    },
    {
      id: 'companies',
      label: 'Companies',
      icon: <FiBriefcase size={20} />,
      active: activeNav === 'companies',
      onClick: () => setActiveNav('companies'),
    },
    {
      id: 'staff',
      label: 'Staff Management',
      icon: <FiUserCheck size={20} />,
      active: activeNav === 'staff',
      onClick: () => setActiveNav('staff'),
    },
    {
      id: 'payments',
      label: 'Payments System',
      icon: <FiDollarSign size={20} />,
      active: activeNav === 'payments',
      onClick: () => setActiveNav('payments'),
    },
    {
      id: 'security',
      label: 'Security & Logs',
      icon: <FiLock size={20} />,
      active: activeNav === 'security',
      onClick: () => setActiveNav('security'),
    },
    {
      id: 'system',
      label: 'System Settings',
      icon: <FiSettings size={20} />,
      active: activeNav === 'system',
      onClick: () => setActiveNav('system'),
    },
  ];

  const mockUsers = [
    { id: 'U-001', email: 'user1@example.com', role: 'User', status: 'active', created: '2024-01-15' },
    { id: 'U-002', email: 'staff1@example.com', role: 'Staff', status: 'active', created: '2024-01-10' },
    { id: 'U-003', email: 'blocked@example.com', role: 'User', status: 'blocked', created: '2024-01-05' },
    { id: 'U-004', email: 'user2@example.com', role: 'User', status: 'active', created: '2024-02-01' },
  ];

  const mockCompanies = [
    { id: 'C-001', name: 'TechCorp', nui: 'NUI-001234', users: 5, status: 'verified', revenue: '5,000,000 XAF' },
    { id: 'C-002', name: 'StartupX', nui: 'NUI-005678', users: 2, status: 'pending', revenue: '500,000 XAF' },
    { id: 'C-003', name: 'PayFlow', nui: 'NUI-009012', users: 8, status: 'verified', revenue: '12,500,000 XAF' },
  ];

  const mockStaffAccounts = [
    { id: 'S-001', email: 'admin1@tikta.com', role: 'Staff Moderator', status: 'active', created: '2023-12-01' },
    { id: 'S-002', email: 'admin2@tikta.com', role: 'Staff Verifier', status: 'active', created: '2024-01-10' },
  ];

  return (
    <MainLayout
      user={user}
      navItems={navItems}
      navTitle="ADMINISTRATOR MENU"
      onLogout={onLogout}
    >
      <ContentSection>
        {activeNav === 'overview' && (
          <>
            <PageHeader>
              <h1>System Overview</h1>
              <p>Complete platform management and monitoring</p>
            </PageHeader>

            <CardsGrid>
              <Card>
                <h3>Total Users</h3>
                <div className="value">2,847</div>
                <div className="subtitle">Active Accounts</div>
              </Card>
              <Card>
                <h3>Total Companies</h3>
                <div className="value">456</div>
                <div className="subtitle">Registered</div>
              </Card>
              <Card>
                <h3>Staff Members</h3>
                <div className="value">24</div>
                <div className="subtitle">Active</div>
              </Card>
              <Card>
                <h3>Platform Revenue</h3>
                <div className="value">125.4M</div>
                <div className="subtitle">XAF</div>
              </Card>
            </CardsGrid>
          </>
        )}

        {activeNav === 'users' && (
          <>
            <PageHeader>
              <h1>Users Management</h1>
              <p>View, manage, and control all user accounts</p>
            </PageHeader>

            <Table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockUsers.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      <StatusBadge status={user.status}>
                        {user.status}
                      </StatusBadge>
                    </td>
                    <td>{user.created}</td>
                    <td>
                      <ActionButton>Edit</ActionButton>
                      <DangerButton>Block</DangerButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        )}

        {activeNav === 'companies' && (
          <>
            <PageHeader>
              <h1>Companies Management</h1>
              <p>Manage all company accounts and subscriptions</p>
            </PageHeader>

            <Table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Company Name</th>
                  <th>NUI</th>
                  <th>Users</th>
                  <th>Status</th>
                  <th>Revenue</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockCompanies.map(company => (
                  <tr key={company.id}>
                    <td>{company.id}</td>
                    <td>{company.name}</td>
                    <td>{company.nui}</td>
                    <td>{company.users}</td>
                    <td>
                      <StatusBadge status={company.status}>
                        {company.status}
                      </StatusBadge>
                    </td>
                    <td>{company.revenue}</td>
                    <td>
                      <ActionButton>View</ActionButton>
                      <ActionButton>Verify</ActionButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        )}

        {activeNav === 'staff' && (
          <>
            <PageHeader>
              <h1>Staff Management</h1>
              <p>Manage internal staff accounts and permissions</p>
            </PageHeader>

            <Table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockStaffAccounts.map(staff => (
                  <tr key={staff.id}>
                    <td>{staff.id}</td>
                    <td>{staff.email}</td>
                    <td>{staff.role}</td>
                    <td>
                      <StatusBadge status={staff.status}>
                        {staff.status}
                      </StatusBadge>
                    </td>
                    <td>{staff.created}</td>
                    <td>
                      <ActionButton>Edit</ActionButton>
                      <DangerButton>Remove</DangerButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        )}

        {activeNav === 'payments' && (
          <PageHeader>
            <h1>Payments System</h1>
            <p>Monitor and manage payment processing</p>
          </PageHeader>
        )}

        {activeNav === 'security' && (
          <PageHeader>
            <h1>Security & Logs</h1>
            <p>View activity logs and security events</p>
          </PageHeader>
        )}

        {activeNav === 'system' && (
          <PageHeader>
            <h1>System Settings</h1>
            <p>Configure platform settings and configurations</p>
          </PageHeader>
        )}
      </ContentSection>
    </MainLayout>
  );
};
