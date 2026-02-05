import React from 'react';
import styled from 'styled-components';
import { colors, spacing, borderRadius, transitions } from '../../config/theme';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const InputWrapper = styled.div<{ fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
  width: ${props => (props.fullWidth ? '100%' : 'auto')};
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${colors.textPrimary};
`;

const StyledInput = styled.input<{ hasError?: boolean }>`
  padding: ${spacing.md} ${spacing.lg};
  border: 1px solid ${props => (props.hasError ? colors.error : colors.border)};
  border-radius: ${borderRadius.md};
  font-size: 0.875rem;
  transition: ${transitions.fast};
  background-color: ${colors.surface};

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.1);
  }

  &:disabled {
    background-color: #f3f4f6;
    color: ${colors.disabled};
    cursor: not-allowed;
  }

  &::placeholder {
    color: ${colors.textSecondary};
  }
`;

const ErrorMessage = styled.span`
  font-size: 0.75rem;
  color: ${colors.error};
  font-weight: 500;
`;

export const Input: React.FC<InputProps> = ({
  label,
  error,
  fullWidth = true,
  ...props
}) => {
  return (
    <InputWrapper fullWidth={fullWidth}>
      {label && <Label htmlFor={props.id}>{label}</Label>}
      <StyledInput hasError={!!error} {...props} />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </InputWrapper>
  );
};
