import React from 'react';
import styled from 'styled-components';
import { colors, spacing, borderRadius, transitions } from '../../config/theme';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}

const StyledButton = styled.button<Omit<ButtonProps, 'loading'>>`
  padding: ${props => {
    switch (props.size) {
      case 'sm':
        return `${spacing.sm} ${spacing.md}`;
      case 'lg':
        return `${spacing.lg} ${spacing.xl}`;
      default:
        return `${spacing.md} ${spacing.lg}`;
    }
  }};
  
  border-radius: ${borderRadius.md};
  font-weight: 600;
  font-size: ${props => (props.size === 'sm' ? '0.75rem' : '0.875rem')};
  transition: ${transitions.fast};
  width: ${props => (props.fullWidth ? '100%' : 'auto')};
  
  background-color: ${props => {
    switch (props.variant) {
      case 'secondary':
        return colors.border;
      case 'danger':
        return colors.error;
      default:
        return colors.primary;
    }
  }};
  
  color: ${props => {
    switch (props.variant) {
      case 'secondary':
        return colors.textPrimary;
      default:
        return colors.surface;
    }
  }};

  &:hover:not(:disabled) {
    background-color: ${props => {
      switch (props.variant) {
        case 'secondary':
          return colors.border;
        case 'danger':
          return '#b91c1c';
        default:
          return colors.primaryDark;
      }
    }};
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    background-color: ${colors.disabled};
    color: ${props => (props.variant === 'secondary' ? colors.disabled : colors.surface)};
    cursor: not-allowed;
    opacity: 0.6;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.2);
  }
`;

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  ...props
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </StyledButton>
  );
};
