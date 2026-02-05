import React from 'react';
import styled from 'styled-components';
import { colors, spacing, borderRadius, transitions } from '../../config/theme';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

interface SidebarProps {
  items: NavItem[];
  title?: string;
}

const SidebarWrapper = styled.aside`
  width: 280px;
  height: 100%;
  background: ${colors.surface};
  border-right: 1px solid ${colors.border};
  padding: ${spacing.xl} 0;
  display: flex;
  flex-direction: column;
`;

const SidebarTitle = styled.div`
  padding: 0 ${spacing.xl};
  margin-bottom: ${spacing.xl};
  padding-bottom: ${spacing.lg};
  border-bottom: 1px solid ${colors.border};

  h3 {
    font-size: 0.75rem;
    font-weight: 700;
    color: ${colors.textSecondary};
    text-transform: uppercase;
    letter-spacing: 1px;
    margin: 0;
  }
`;

const NavList = styled.nav`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
  padding: 0 ${spacing.md};
  flex: 1;
  overflow-y: auto;
`;

const NavItemButton = styled.button<{ active?: boolean }>`
  width: 100%;
  padding: ${spacing.md} ${spacing.lg};
  background: ${props => (props.active ? colors.primary : 'transparent')};
  color: ${props => (props.active ? colors.surface : colors.textPrimary)};
  border: none;
  border-radius: ${borderRadius.md};
  text-align: left;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: ${transitions.fast};
  display: flex;
  align-items: center;
  gap: ${spacing.md};

  &:hover {
    background: ${props => (props.active ? colors.primaryDark : colors.neutral)};
  }

  span:first-child {
    display: flex;
    align-items: center;
    justify-content: center;
    color: currentColor;
  }
`;

export const Sidebar: React.FC<SidebarProps> = ({ items, title = 'Menu' }) => {
  return (
    <SidebarWrapper>
      <SidebarTitle>
        <h3>{title}</h3>
      </SidebarTitle>
      <NavList>
        {items.map(item => (
          <NavItemButton
            key={item.id}
            active={item.active}
            onClick={item.onClick}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavItemButton>
        ))}
      </NavList>
    </SidebarWrapper>
  );
};
