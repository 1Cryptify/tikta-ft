import React from 'react';
import styled from 'styled-components';
import { colors, spacing, borderRadius, transitions } from '../../config/theme';

interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    active?: boolean;
    onClick?: () => void;
    badge?: string;
    disabled?: boolean;
}

interface SidebarProps {
    items: NavItem[];
    title?: string;
    onItemClick?: () => void;
}

const SidebarWrapper = styled.aside`
  width: 280px;
  height: 100%;
  background: ${colors.surface};
  border-right: 1px solid ${colors.border};
  padding: ${spacing.xl} 0;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    width: 280px;
    border-right: none;
    border-bottom: 1px solid ${colors.border};
  }
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

  @media (max-width: 480px) {
    padding: 0 ${spacing.lg};
    margin-bottom: ${spacing.lg};

    h3 {
      font-size: 0.7rem;
    }
  }
`;

const NavList = styled.nav`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
  padding: 0 ${spacing.md};
  flex: 1;
  overflow: hidden;

  @media (max-width: 768px) {
    overflow-y: auto;
    max-height: calc(100vh - 200px);
  }

  @media (max-width: 480px) {
    padding: 0 ${spacing.sm};
    gap: ${spacing.xs};
    overflow-y: auto;
    max-height: calc(100vh - 180px);
  }
`;

const NavItemButton = styled.button<{ active?: boolean; disabled?: boolean }>`
  width: 100%;
  padding: ${spacing.md} ${spacing.lg};
  background: ${props => 
    props.disabled ? colors.neutral : 
    props.active ? colors.primary : 'transparent'
  };
  color: ${props => 
    props.disabled ? colors.textSecondary :
    props.active ? colors.surface : colors.textPrimary
  };
  border: none;
  border-radius: ${borderRadius.md};
  text-align: left;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  transition: ${transitions.fast};
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  justify-content: space-between;
  opacity: ${props => (props.disabled ? 0.6 : 1)};

  &:hover {
    background: ${props => 
      props.disabled ? colors.neutral :
      props.active ? colors.primaryDark : colors.neutral
    };
  }

  span:first-child {
    display: flex;
    align-items: center;
    justify-content: center;
    color: currentColor;
    flex-shrink: 0;
  }

  .label-container {
    display: flex;
    align-items: center;
    gap: ${spacing.md};
    flex: 1;
    overflow: hidden;
  }

  span.label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .badge {
    display: inline-block;
    padding: 0.25rem ${spacing.sm};
    background: #fbbf24;
    color: #000;
    border-radius: ${borderRadius.sm};
    font-size: 0.65rem;
    font-weight: 700;
    white-space: nowrap;
    text-transform: uppercase;
    flex-shrink: 0;
  }

  @media (max-width: 480px) {
    padding: ${spacing.sm} ${spacing.md};
    font-size: 0.8125rem;
    gap: ${spacing.sm};

    .badge {
      font-size: 0.6rem;
      padding: 0.2rem ${spacing.xs};
    }
  }
`;

export const Sidebar: React.FC<SidebarProps> = ({ items, title = 'Menu', onItemClick }) => {
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
                        disabled={item.disabled}
                        onClick={() => {
                            if (!item.disabled) {
                                item.onClick?.();
                                onItemClick?.();
                            }
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                            <span>{item.icon}</span>
                            <span className="label">{item.label}</span>
                        </div>
                        {item.badge && <span className="badge">{item.badge}</span>}
                    </NavItemButton>
                ))}
            </NavList>
        </SidebarWrapper>
    );
};
