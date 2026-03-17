import type { RiskLevel } from '../types';

const config: Record<RiskLevel, { label: string; color: string; bg: string }> = {
  low:      { label: 'Low',      color: '#16a34a', bg: '#dcfce7' },
  medium:   { label: 'Medium',   color: '#d97706', bg: '#fef3c7' },
  high:     { label: 'High',     color: '#dc2626', bg: '#fee2e2' },
  critical: { label: 'Critical', color: '#7c3aed', bg: '#ede9fe' },
};

export default function RiskBadge({ level }: { level: RiskLevel }) {
  const c = config[level];
  return (
    <span style={{
      background: c.bg, color: c.color,
      padding: '2px 10px', borderRadius: 20,
      fontSize: 12, fontWeight: 700, letterSpacing: '.04em', whiteSpace: 'nowrap',
    }}>
      {c.label}
    </span>
  );
}
