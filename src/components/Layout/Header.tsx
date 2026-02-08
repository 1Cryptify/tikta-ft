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
  position: relative;
  z-index: 1000;

  @media (max-width: 768px) {
    padding: ${spacing.md} ${spacing.lg};
  }
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${spacing.lg};

  @media (max-width: 480px) {
    gap: ${spacing.md};
  }
`;

const Logo = styled.h1`
  font-size: 1.5rem;
  color: ${colors.primary};
  font-weight: 700;
  margin: 0;
  flex-shrink: 0;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }

  @media (max-width: 480px) {
    font-size: 1.125rem;
  }
`;

const MenuToggleButton = styled.button`
  display: none;
  background: transparent;
  border: none;
  color: ${colors.textPrimary};
  font-size: 1.5rem;
  cursor: pointer;
  padding: ${spacing.sm};
  margin-left: auto;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const NavContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.xl};

  @media (max-width: 768px) {
    gap: ${spacing.lg};
  }

  @media (max-width: 480px) {
    gap: ${spacing.md};
  }
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  text-align: right;

  @media (max-width: 480px) {
    display: none;
  }
`;

const UserEmail = styled.span`
  font-weight: 600;
  color: ${colors.textPrimary};
  font-size: 0.875rem;

  @media (max-width: 768px) {
    font-size: 0.8125rem;
  }
`;

const UserRole = styled.span`
  font-size: 0.75rem;
  color: ${colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (max-width: 768px) {
    font-size: 0.7rem;
  }
`;

interface HeaderProps {
    user?: User;
    onLogout?: () => void;
    title?: string;
    onMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
    user,
    onLogout,
    title = 'Tikta',
    onMenuToggle,
}) => {
    const getRoleLabel = () => {
        if (user?.is_superuser) return 'Super Administrator';
        if (user?.is_staff) return 'Staff';
        return 'User';
    };

    return (
        <HeaderWrapper>
            <HeaderContent>
                <Logo>{title}</Logo>
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
                {onMenuToggle && (
                    <MenuToggleButton onClick={onMenuToggle} aria-label="Toggle menu">
                        ☰
                    </MenuToggleButton>
                )}
            </HeaderContent>
        </HeaderWrapper>
    );
};
