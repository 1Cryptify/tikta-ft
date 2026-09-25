import React from 'react';
import styled from 'styled-components';
import { colors, spacing, borderRadius } from '../../config/theme';

export type StatsPeriod = 'daily' | 'monthly' | 'yearly' | 'all';

const OPTIONS: { value: StatsPeriod; label: string }[] = [
  { value: 'daily', label: 'Journalier' },
  { value: 'monthly', label: 'Mensuel' },
  { value: 'yearly', label: 'Annuel' },
  { value: 'all', label: 'Tout' },
];

const Wrap = styled.div`
  display: inline-flex;
  gap: 2px;
  padding: 2px;
  background: ${colors.neutral};
  border: 1px solid ${colors.border};
  border-radius: ${borderRadius.md};
`;

const Btn = styled.button<{ active: boolean }>`
  border: none;
  background: ${(p) => (p.active ? 'white' : 'transparent')};
  color: ${(p) => (p.active ? colors.primary : colors.textSecondary)};
  font-weight: ${(p) => (p.active ? '700' : '500')};
  font-size: 0.78rem;
  padding: ${spacing.xs} ${spacing.md};
  border-radius: ${borderRadius.sm};
  cursor: pointer;
  box-shadow: ${(p) => (p.active ? '0 1px 3px rgba(0,0,0,0.12)' : 'none')};
  &:hover { color: ${colors.textPrimary}; }
`;

export const PeriodSelector: React.FC<{ value: StatsPeriod; onChange: (p: StatsPeriod) => void }> = ({ value, onChange }) => (
  <Wrap>
    {OPTIONS.map((o) => (
      <Btn key={o.value} active={value === o.value} onClick={() => onChange(o.value)}>{o.label}</Btn>
    ))}
  </Wrap>
);

export default PeriodSelector;
