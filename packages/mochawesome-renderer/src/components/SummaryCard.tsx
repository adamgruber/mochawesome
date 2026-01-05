import type { ReactNode } from 'react';

type SummaryCardProps = {
  label: string;
  value: ReactNode;
  tone?: 'neutral' | 'pass' | 'fail' | 'warn' | 'info';
};

export const SummaryCard = ({ label, value, tone = 'neutral' }: SummaryCardProps) => (
  <div className={`summary-card summary-card--${tone}`}>
    <div className="summary-card__label">{label}</div>
    <div className="summary-card__value">{value}</div>
  </div>
);
