import type { RequirementCategory } from '../types';

const config: Record<RequirementCategory, { label: string; color: string; bg: string }> = {
  federal_regulation:   { label: 'Federal Reg',     color: '#1d4ed8', bg: '#dbeafe' },
  state_licensing:      { label: 'State License',   color: '#0369a1', bg: '#e0f2fe' },
  consumer_disclosure:  { label: 'Disclosure',      color: '#059669', bg: '#d1fae5' },
  aml_bsa:              { label: 'AML / BSA',       color: '#dc2626', bg: '#fee2e2' },
  data_privacy:         { label: 'Data Privacy',    color: '#7c3aed', bg: '#ede9fe' },
  prohibited_practices: { label: 'UDAAP',           color: '#d97706', bg: '#fef3c7' },
};

export default function CategoryBadge({ category }: { category: RequirementCategory }) {
  const c = config[category];
  return (
    <span style={{
      background: c.bg, color: c.color,
      padding: '2px 8px', borderRadius: 4,
      fontSize: 11, fontWeight: 600, letterSpacing: '.03em', whiteSpace: 'nowrap',
    }}>
      {c.label}
    </span>
  );
}
