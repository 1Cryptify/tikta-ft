import React from 'react';
import styled from 'styled-components';
import { colors, spacing, borderRadius } from '../../config/theme';

export interface PieDatum {
  label: string;
  value: number;
  color?: string;
}

const PALETTE = ['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#db2777', '#65a30d', '#ea580c', '#4f46e5'];

const Wrap = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.xl};
  flex-wrap: wrap;
`;

const Circle = styled.div<{ bg: string }>`
  width: 190px;
  height: 190px;
  border-radius: 50%;
  background: ${(p) => p.bg};
  position: relative;
  flex: 0 0 auto;
  &::after {
    content: '';
    position: absolute;
    inset: 34%;
    background: white;
    border-radius: 50%;
    box-shadow: inset 0 0 0 1px ${colors.border};
  }
`;

const Center = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1;
  .v { font-size: 1.3rem; font-weight: 700; color: ${colors.textPrimary}; }
  .l { font-size: 0.68rem; color: ${colors.textSecondary}; text-transform: uppercase; }
`;

const Legend = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xs};
  min-width: 200px;
  flex: 1;
`;

const LegendRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  font-size: 0.82rem;
  color: ${colors.textPrimary};
  .dot { width: 12px; height: 12px; border-radius: 3px; flex: 0 0 auto; }
  .name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .pct { color: ${colors.textSecondary}; font-weight: 600; }
`;

const Empty = styled.div`
  padding: ${spacing.xl};
  text-align: center;
  color: ${colors.textSecondary};
  border: 1px dashed ${colors.border};
  border-radius: ${borderRadius.md};
  font-size: 0.85rem;
`;

export const PieChart: React.FC<{ data: PieDatum[]; centerLabel?: string }> = ({ data, centerLabel }) => {
  const items = data.filter((d) => d.value > 0);
  const total = items.reduce((s, d) => s + d.value, 0);
  if (total <= 0) return <Empty>Aucune donnée sur la période</Empty>;

  let acc = 0;
  const stops: string[] = [];
  items.forEach((d, i) => {
    const start = (acc / total) * 100;
    acc += d.value;
    const end = (acc / total) * 100;
    const color = d.color || PALETTE[i % PALETTE.length];
    stops.push(`${color} ${start}% ${end}%`);
  });

  return (
    <Wrap>
      <Circle bg={`conic-gradient(${stops.join(', ')})`}>
        <Center>
          <span className="v">{total.toLocaleString('en-US')}</span>
          <span className="l">{centerLabel || 'Total'}</span>
        </Center>
      </Circle>
      <Legend>
        {items.map((d, i) => (
          <LegendRow key={d.label}>
            <span className="dot" style={{ background: d.color || PALETTE[i % PALETTE.length] }} />
            <span className="name" title={d.label}>{d.label}</span>
            <span className="pct">{Math.round((d.value / total) * 100)}% · {d.value.toLocaleString('en-US')}</span>
          </LegendRow>
        ))}
      </Legend>
    </Wrap>
  );
};

export default PieChart;
