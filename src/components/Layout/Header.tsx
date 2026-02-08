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

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  flex-shrink: 0;
  max-width: 400px;

  @media (max-width: 1024px) {
    max-width: 300px;
  }

  @media (max-width: 768px) {
    max-width: 250px;
  }

  @media (max-width: 480px) {
    max-width: 180px;
  }
`;

const LogoImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
  }
`;

const LogoPlaceholder = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 6px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.8rem;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    font-size: 0.7rem;
  }
`;

const LogoTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
  overflow: hidden;
`;

const Logo = styled.h1`
  font-size: 1.5rem;
  color: ${colors.primary};
  font-weight: 700;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }

  @media (max-width: 480px) {
    font-size: 1.125rem;
  }
`;

const ActiveCompanyName = styled.span`
  font-size: 0.75rem;
  color: ${colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;

  @media (max-width: 480px) {
    display: none;
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
  word-break: break-word;

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
    activeCompany?: { id: string; name: string; logo?: string } | null;
}

export const Header: React.FC<HeaderProps> = ({
    user,
    onLogout,
    title = 'Tikta',
    onMenuToggle,
    activeCompany,
}) => {
    const getRoleLabel = () => {
        if (user?.is_superuser) return 'Super Administrator';
        if (user?.is_staff) return 'Staff';
        return 'User';
    };

    const maskEmail = (email: string): string => {
        if (!email) return '';
        const [localPart, domain] = email.split('@');
        if (!domain) return email;

        const visibleChars = Math.max(1, Math.ceil(localPart.length / 3));
        const maskedPart = localPart.substring(0, visibleChars) + 'xxxxx';
        return `${maskedPart}@${domain}`;
    };

    return (
        <HeaderWrapper>
            <HeaderContent>
                {activeCompany ? (
                    <LogoContainer>
                        {activeCompany.logo ? (
                            <LogoImage src={activeCompany.logo} alt={activeCompany.name} />
                        ) : (
                            <LogoPlaceholder>
                                {activeCompany.name?.charAt(0).toUpperCase()}
                            </LogoPlaceholder>
                        )}
                        <LogoTextContainer>
                            <Logo>{activeCompany.name}</Logo>
                            <ActiveCompanyName>Active Business</ActiveCompanyName>
                        </LogoTextContainer>
                    </LogoContainer>
                ) : (
                    <Logo>{title}</Logo>
                )}
                {user && (
                    <NavContainer>
                        <UserInfo>
                            <UserEmail title={user.email}>{maskEmail(user.email)}</UserEmail>
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
