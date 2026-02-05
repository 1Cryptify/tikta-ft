import React, { useState } from 'react';
import styled from 'styled-components';
import { MainLayout } from '../components/Layout/MainLayout';
import { colors, spacing } from '../config/theme';
import { User } from '../hooks/useAuth';

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
      case 'verified':
        return '#d1f2e8';
      case 'pending':
        return '#fef3c7';
      case 'rejected':
        return '#fee2e2';
      case 'active':
        return '#d1f2e8';
      case 'blocked':
        return '#fee2e2';
      default:
        return colors.border;
    }
  }};

  color: ${props => {
    switch (props.status) {
      case 'verified':
      case 'active':
        return colors.success;
      case 'pending':
        return '#b45309';
      case 'rejected':
      case 'blocked':
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

  &:hover {
    color: ${colors.primaryDark};
    text-decoration: underline;
  }
`;

interface StaffDashboardProps {
  user: User;
  onLogout: () => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({ user, onLogout }) => {
  const [activeNav, setActiveNav] = useState('overview');

  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: '📊',
      active: activeNav === 'overview',
      onClick: () => setActiveNav('overview'),
    },
    {
      id: 'companies',
      label: 'Companies',
      icon: '🏢',
      active: activeNav === 'companies',
      onClick: () => setActiveNav('companies'),
    },
    {
      id: 'users',
      label: 'Users',
      icon: '👥',
      active: activeNav === 'users',
      onClick: () => setActiveNav('users'),
    },
    {
      id: 'verifications',
      label: 'Verifications',
      icon: '✓',
      active: activeNav === 'verifications',
      onClick: () => setActiveNav('verifications'),
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: '📋',
      active: activeNav === 'reports',
      onClick: () => setActiveNav('reports'),
    },
  ];

  const mockCompanies = [
    { id: '001', name: 'TechCorp Sarl', nui: 'NUI-001234', status: 'verified', users: 5, balance: '1,500,000 XAF' },
    { id: '002', name: 'Digital Solutions', nui: 'NUI-005678', status: 'pending', users: 3, balance: '750,000 XAF' },
    { id: '003', name: 'Marketing Plus', nui: 'NUI-009012', status: 'verified', users: 8, balance: '2,100,000 XAF' },
  ];

  const mockPendingVerifications = [
    { id: 'VER-001', company: 'StartupX', type: 'KYC', date: '2024-02-01', status: 'pending' },
    { id: 'VER-002', company: 'CloudBiz', type: 'Company Documents', date: '2024-02-02', status: 'pending' },
    { id: 'VER-003', company: 'PayFlow', type: 'Withdrawal Account', date: '2024-02-03', status: 'pending' },
  ];

  return (
    <MainLayout
      user={user}
      navItems={navItems}
      navTitle="STAFF MENU"
      onLogout={onLogout}
    >
      <ContentSection>
        {activeNav === 'overview' && (
          <>
            <PageHeader>
              <h1>Staff Dashboard</h1>
              <p>Monitor and manage platform activities</p>
            </PageHeader>

            <CardsGrid>
              <Card>
                <h3>Total Companies</h3>
                <div className="value">248</div>
                <div className="subtitle">Active & Verified</div>
              </Card>
              <Card>
                <h3>Total Users</h3>
                <div className="value">1,542</div>
                <div className="subtitle">Active Accounts</div>
              </Card>
              <Card>
                <h3>Pending Verifications</h3>
                <div className="value">12</div>
                <div className="subtitle">Awaiting Review</div>
              </Card>
              <Card>
                <h3>Total Transactions</h3>
                <div className="value">45,230</div>
                <div className="subtitle">This Month</div>
              </Card>
            </CardsGrid>

            <div>
              <h2 style={{ color: colors.textPrimary, marginBottom: spacing.lg }}>
                Pending Verifications
              </h2>
              <Table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Company</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mockPendingVerifications.map(ver => (
                    <tr key={ver.id}>
                      <td>{ver.id}</td>
                      <td>{ver.company}</td>
                      <td>{ver.type}</td>
                      <td>{ver.date}</td>
                      <td>
                        <StatusBadge status={ver.status}>
                          {ver.status}
                        </StatusBadge>
                      </td>
                      <td>
                        <ActionButton>Review</ActionButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </>
        )}

        {activeNav === 'companies' && (
          <>
            <PageHeader>
              <h1>Companies Management</h1>
              <p>View and manage all registered companies</p>
            </PageHeader>

            <Table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Company Name</th>
                  <th>NUI</th>
                  <th>Users</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {mockCompanies.map(company => (
                  <tr key={company.id}>
                    <td>{company.id}</td>
                    <td>{company.name}</td>
                    <td>{company.nui}</td>
                    <td>{company.users}</td>
                    <td>{company.balance}</td>
                    <td>
                      <StatusBadge status={company.status}>
                        {company.status}
                      </StatusBadge>
                    </td>
                    <td>
                      <ActionButton>View</ActionButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        )}

        {activeNav === 'users' && (
          <PageHeader>
            <h1>Users Management</h1>
            <p>Manage user accounts and permissions</p>
          </PageHeader>
        )}

        {activeNav === 'verifications' && (
          <PageHeader>
            <h1>Verifications</h1>
            <p>Review and approve pending verifications</p>
          </PageHeader>
        )}

        {activeNav === 'reports' && (
          <PageHeader>
            <h1>Reports</h1>
            <p>View detailed reports and analytics</p>
          </PageHeader>
        )}
      </ContentSection>
    </MainLayout>
  );
};
