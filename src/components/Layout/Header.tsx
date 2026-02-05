import React from 'react';
import styled from 'styled-components';
import { colors, spacing, borderRadius, shadows } from '../../config/theme';
import { Button } from '../Form/Button';
import { User } from '../../hooks/useAuth';

const HeaderWrapper = styled.header`
  background: ${colors.surface};
  border-bottom: 1px solid ${colors.border};
  padding: ${spacing.lg} ${spacing.xl};
  box-shadow: ${shadows.sm};
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.h1`
  font-size: 1.5rem;
  color: ${colors.primary};
  font-weight: 700;
  margin: 0;
`;

const NavContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.xl};
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  text-align: right;
`;

const UserEmail = styled.span`
  font-weight: 600;
  color: ${colors.textPrimary};
  font-size: 0.875rem;
`;

const UserRole = styled.span`
  font-size: 0.75rem;
  color: ${colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

interface HeaderProps {
  user?: User;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const getRoleLabel = () => {
    if (user?.is_superuser) return 'Super Administrator';
    if (user?.is_staff) return 'Staff';
    return 'User';
  };

  return (
    <HeaderWrapper>
      <HeaderContent>
        <Logo>Tikta</Logo>
        {user && (
          <NavContainer>
            <UserInfo>
              <UserEmail>{user.email}</UserEmail>
              <UserRole>{getRoleLabel()}</UserRole>
            </UserInfo>
            <Button
              variant="secondary"
              size="sm"
              onClick={onLogout}
            >
              Logout
            </Button>
          </NavContainer>
        )}
      </HeaderContent>
    </HeaderWrapper>
  );
};
