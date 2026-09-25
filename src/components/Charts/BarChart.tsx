import React from 'react';
import styled from 'styled-components';
import { colors, spacing, borderRadius } from '../../config/theme';

export interface BarSeries {
  label: string;
  color: string;
  values: number[];
}

interface BarChartProps {
  labels: string[];
  series: BarSeries[];
  height?: number;
  formatValue?: (n: number) => string;
}

const Chart = styled.div<{ height: number }>`
  display: flex;
  align-items: flex-end;
  gap: ${spacing.xs};
  height: ${(p) => p.height}px;
  padding: ${spacing.sm} 0 0;
  border-bottom: 1px solid ${colors.border};
  overflow-x: auto;
`;

const Column = styled.div`
  flex: 1 0 34px;
  min-width: 34px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
`;

const Bars = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 2px;
  width: 100%;
  height: 100%;
`;

const Bar = styled.div<{ h: number; color: string }>`
  width: 42%;
  max-width: 18px;
  height: ${(p) => p.h}%;
  min-height: ${(p) => (p.h > 0 ? '3px' : '0')};
  background: ${(p) => p.color};
  border-radius: 3px 3px 0 0;
  transition: height 0.3s ease;
`;

const Label = styled.span`
  font-size: 0.6rem;
  color: ${colors.textSecondary};
  margin-top: 4px;
  white-space: nowrap;
  transform: rotate(-35deg);
  transform-origin: top center;
  height: 18px;
`;

const Legend = styled.div`
  display: flex;
  gap: ${spacing.lg};
  flex-wrap: wrap;
  margin-top: ${spacing.sm};
  font-size: 0.78rem;
  color: ${colors.textSecondary};
`;

const Item = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${spacing.xs};
  .dot { width: 10px; height: 10px; border-radius: 2px; display: inline-block; }
`;

const Empty = styled.div`
  padding: ${spacing.xl};
  text-align: center;
  color: ${colors.textSecondary};
  border: 1px dashed ${colors.border};
  border-radius: ${borderRadius.md};
  font-size: 0.85rem;
`;

export const BarChart: React.FC<BarChartProps> = ({ labels, series, height = 220, formatValue }) => {
  const max = Math.max(1, ...series.flatMap((s) => s.values.map((v) => (Number.isFinite(v) ? v : 0))));
  const fmt = formatValue || ((n: number) => Math.round(n).toLocaleString('en-US'));

  if (labels.length === 0) {
    return <Empty>Aucune donnée sur la période</Empty>;
  }

  return (
    <div>
      <Chart height={height}>
        {labels.map((label, i) => (
          <Column key={label}>
            <Bars>
              {series.map((s) => {
                const v = s.values[i] || 0;
                const h = (v / max) * 100;
                return <Bar key={s.label} h={h} color={s.color} title={`${s.label} · ${label}: ${fmt(v)}`} />;
              })}
            </Bars>
            <Label>{label}</Label>
          </Column>
        ))}
      </Chart>
      <Legend>
        {series.map((s) => (
          <Item key={s.label}><span className="dot" style={{ background: s.color }} />{s.label}</Item>
        ))}
      </Legend>
    </div>
  );
};

export default BarChart;
