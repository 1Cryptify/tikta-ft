import React, { useEffect } from 'react';
import styled from 'styled-components';
import { colors, spacing } from '../../config/theme';
import { useTransaction } from '../../hooks/useTransaction';
import LoadingSpinner from '../LoadingSpinner';

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

const SuccessMessage = styled.div`
  padding: ${spacing.md};
  background-color: ${colors.success}20;
  border: 1px solid ${colors.success};
  border-radius: 8px;
  color: ${colors.success};
  margin-bottom: ${spacing.lg};
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
  }

  td {
    padding: ${spacing.md};
    border-bottom: 1px solid ${colors.border};
    color: ${colors.textPrimary};
  }

  tr:hover {
    background-color: ${colors.backgroundSecondary}40;
  }
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: ${spacing.xs} ${spacing.sm};
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 600;
  background-color: ${props => {
    switch (props.status) {
      case 'completed':
        return `${colors.success}20`;
      case 'pending':
      case 'processing':
        return `${colors.warning}20`;
      case 'failed':
      case 'cancelled':
        return `${colors.error}20`;
      default:
        return colors.backgroundSecondary;
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'completed':
        return colors.success;
      case 'pending':
      case 'processing':
        return colors.warning;
      case 'failed':
      case 'cancelled':
        return colors.error;
      default:
        return colors.textPrimary;
    }
  }};
`;

const EmptyState = styled.div`
  padding: ${spacing.xl};
  text-align: center;
  color: ${colors.textSecondary};
`;

export const TransactionsPanel: React.FC = () => {
  const { transactions, isLoading, error, successMessage, getTransactions } = useTransaction();

  useEffect(() => {
    getTransactions();
  }, []);

  return (
    <PanelContainer>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}

      {isLoading ? (
        <LoadingSpinner />
      ) : transactions.length === 0 ? (
        <EmptyState>No transactions found</EmptyState>
      ) : (
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Amount</th>
                <th>Currency</th>
                <th>Status</th>
                <th>Gateway Reference</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(transaction => (
                <tr key={transaction.id}>
                  <td>{transaction.id.substring(0, 8)}...</td>
                  <td>{transaction.amount}</td>
                  <td>{transaction.currency?.code || '-'}</td>
                  <td>
                    <StatusBadge status={transaction.status}>
                      {transaction.status}
                    </StatusBadge>
                  </td>
                  <td>{transaction.gateway_transaction_id || '-'}</td>
                  <td>{transaction.created_at ? new Date(transaction.created_at).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      )}
    </PanelContainer>
  );
};
