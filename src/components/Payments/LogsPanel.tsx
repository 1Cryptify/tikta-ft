import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { colors, spacing } from '../../config/theme';
import { usePaymentLogs } from '../../hooks/usePaymentLogs';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../LoadingSpinner';

const PanelContainer = styled.div`
  padding: ${spacing.lg} 0;
`;

const ErrorMessage = styled.div`
  padding: ${spacing.md};
  background-color: ${colors.error}20;
  border: 1px solid ${colors.error};
  border-radius: 8px;
  color: ${colors.error};
  margin-bottom: ${spacing.lg};
`;

const FilterSection = styled.div`
  display: flex;
  gap: ${spacing.md};
  margin-bottom: ${spacing.lg};
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FilterButton = styled.button<{ isActive: boolean }>`
  padding: ${spacing.sm} ${spacing.md};
  border: 1px solid ${colors.border};
  background: ${props => (props.isActive ? colors.primary : 'white')};
  color: ${props => (props.isActive ? 'white' : colors.textPrimary)};
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${colors.primary};
    ${props => !props.isActive && `background-color: ${colors.primary}10;`}
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid ${colors.border};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th {
    background-color: ${colors.backgroundSecondary};
    padding: ${spacing.md};
    text-align: left;
    font-weight: 600;
    color: ${colors.textPrimary};
    border-bottom: 2px solid ${colors.border};
    font-size: 0.875rem;
  }

  td {
    padding: ${spacing.md};
    border-bottom: 1px solid ${colors.border};
    color: ${colors.textPrimary};
    font-size: 0.875rem;
  }

  tr:hover {
    background-color: ${colors.backgroundSecondary}40;
  }
`;

const ActionBadge = styled.span`
  display: inline-block;
  padding: ${spacing.xs} ${spacing.sm};
  border-radius: 4px;
  background-color: ${colors.primary}20;
  color: ${colors.primary};
  font-size: 0.75rem;
  font-weight: 600;
`;

const DetailButton = styled.button`
  padding: ${spacing.xs} ${spacing.sm};
  background-color: transparent;
  border: 1px solid ${colors.primary};
  color: ${colors.primary};
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.3s ease;

  &:hover {
    background-color: ${colors.primary}10;
  }
`;

const EmptyState = styled.div`
  padding: ${spacing.xl};
  text-align: center;
  color: ${colors.textSecondary};
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  padding: ${spacing.lg};
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${spacing.lg};
  border-bottom: 1px solid ${colors.border};
  padding-bottom: ${spacing.md};

  h2 {
    margin: 0;
    font-size: 1.25rem;
    color: ${colors.textPrimary};
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${colors.textSecondary};

  &:hover {
    color: ${colors.textPrimary};
  }
`;

const DetailSection = styled.div`
  margin-bottom: ${spacing.lg};
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${spacing.sm} 0;
  border-bottom: 1px solid ${colors.border};

  &:last-child {
    border-bottom: none;
  }

  strong {
    color: ${colors.textPrimary};
  }

  span {
    color: ${colors.textSecondary};
  }
`;

const JsonContainer = styled.pre`
  background-color: ${colors.backgroundSecondary};
  padding: ${spacing.md};
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.75rem;
  color: ${colors.textPrimary};
`;

export const LogsPanel: React.FC = () => {
  const { user } = useAuth();
  const { logs, isLoading, error, getLogs, getCompanyLogs, getUserLogs } = usePaymentLogs();
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'company' | 'user'>('all');

  useEffect(() => {
    if (filterType === 'all') {
      getLogs();
    } else if (filterType === 'company' && user?.active_company) {
      getCompanyLogs(user.active_company.id);
    } else if (filterType === 'user' && user) {
      getUserLogs(user.id);
    }
  }, [filterType, user]);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'payment_initiated':
        return colors.info || colors.primary;
      case 'complete':
        return colors.success;
      case 'cancel':
        return colors.error;
      default:
        return colors.primary;
    }
  };

  return (
    <PanelContainer>
      {error && <ErrorMessage>{error}</ErrorMessage>}

      <FilterSection>
        <FilterButton
          isActive={filterType === 'all'}
          onClick={() => setFilterType('all')}
        >
          All Logs
        </FilterButton>
        {user?.active_company && (
          <FilterButton
            isActive={filterType === 'company'}
            onClick={() => setFilterType('company')}
          >
            Company Logs
          </FilterButton>
        )}
        <FilterButton
          isActive={filterType === 'user'}
          onClick={() => setFilterType('user')}
        >
          My Logs
        </FilterButton>
      </FilterSection>

      {isLoading ? (
        <LoadingSpinner />
      ) : logs.length === 0 ? (
        <EmptyState>No logs found</EmptyState>
      ) : (
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <th>Action</th>
                <th>User</th>
                <th>Company</th>
                <th>Date</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td>
                    <ActionBadge>{log.action}</ActionBadge>
                  </td>
                  <td>{log.user_id?.substring(0, 8)}...</td>
                  <td>{log.company_id?.substring(0, 8)}...</td>
                  <td>{log.created_at ? new Date(log.created_at).toLocaleString() : '-'}</td>
                  <td>
                    <DetailButton onClick={() => setSelectedLog(log)}>
                      View
                    </DetailButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      )}

      {selectedLog && (
        <ModalOverlay onClick={() => setSelectedLog(null)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <h2>Log Details</h2>
              <CloseButton onClick={() => setSelectedLog(null)}>×</CloseButton>
            </ModalHeader>

            <DetailSection>
              <DetailRow>
                <strong>Log ID</strong>
                <span>{selectedLog.id}</span>
              </DetailRow>
              <DetailRow>
                <strong>Action</strong>
                <span>{selectedLog.action}</span>
              </DetailRow>
              <DetailRow>
                <strong>User ID</strong>
                <span>{selectedLog.user_id}</span>
              </DetailRow>
              <DetailRow>
                <strong>Company ID</strong>
                <span>{selectedLog.company_id}</span>
              </DetailRow>
              {selectedLog.payment_id && (
                <DetailRow>
                  <strong>Payment ID</strong>
                  <span>{selectedLog.payment_id}</span>
                </DetailRow>
              )}
              <DetailRow>
                <strong>Timestamp</strong>
                <span>
                  {selectedLog.created_at
                    ? new Date(selectedLog.created_at).toLocaleString()
                    : '-'}
                </span>
              </DetailRow>
            </DetailSection>

            {selectedLog.details && (
              <DetailSection>
                <h3 style={{ marginTop: 0, marginBottom: spacing.md }}>Additional Details</h3>
                <JsonContainer>
                  {typeof selectedLog.details === 'string'
                    ? selectedLog.details
                    : JSON.stringify(selectedLog.details, null, 2)}
                </JsonContainer>
              </DetailSection>
            )}
          </ModalContent>
        </ModalOverlay>
      )}
    </PanelContainer>
  );
};
