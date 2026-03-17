import type { WorkflowStage } from '../types';

const config: Record<WorkflowStage, { label: string; color: string; bg: string }> = {
  intake:                { label: 'Intake',               color: '#475569', bg: '#f1f5f9' },
  regulatory_assessment: { label: 'Regulatory Assessment', color: '#0369a1', bg: '#e0f2fe' },
  legal_review:          { label: 'Legal Review',          color: '#7c3aed', bg: '#ede9fe' },
  compliance_signoff:    { label: 'Compliance Sign-off',   color: '#d97706', bg: '#fef3c7' },
  approved:              { label: 'Approved',              color: '#16a34a', bg: '#dcfce7' },
  rejected:              { label: 'Rejected',              color: '#dc2626', bg: '#fee2e2' },
};

export default function StageBadge({ stage }: { stage: WorkflowStage }) {
  const c = config[stage];
  return (
    <span style={{
      background: c.bg, color: c.color,
      padding: '3px 10px', borderRadius: 20,
      fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
    }}>
      {c.label}
    </span>
  );
}
