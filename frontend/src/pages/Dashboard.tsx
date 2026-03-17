import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { DashboardStats } from '../types';
import RiskBadge from '../components/RiskBadge';
import StageBadge from '../components/StageBadge';
import type { RiskLevel, WorkflowStage } from '../types';

const STAGE_ORDER: WorkflowStage[] = [
  'intake', 'regulatory_assessment', 'legal_review', 'compliance_signoff', 'approved', 'rejected'
];

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  bnpl: 'BNPL',
  crypto_exchange: 'Crypto Exchange',
  prepaid_card: 'Prepaid Card',
  money_transfer: 'Money Transfer',
  personal_lending: 'Personal Lending',
  payment_app: 'Payment App',
  savings_deposit: 'Savings / Deposit',
  foreign_remittance: 'Foreign Remittance',
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.getDashboard().then(setStats).catch(e => setError(e.message));
  }, []);

  if (error) return <div className="page"><p style={{ color: 'var(--high)' }}>{error}</p></div>;
  if (!stats) return <div className="page"><p style={{ color: 'var(--text-muted)' }}>Loading...</p></div>;

  const riskColors: Record<RiskLevel, string> = {
    low: '#16a34a', medium: '#d97706', high: '#dc2626', critical: '#7c3aed'
  };

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Compliance Pipeline Dashboard</h1>
        <button className="btn btn-primary" onClick={() => navigate('/new')}>+ Submit Product</button>
      </div>

      {/* Stat cards */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--navy)' }}>{stats.total}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Total Products</div>
        </div>
        {(['critical', 'high', 'medium', 'low'] as RiskLevel[]).map(r => (
          <div key={r} className="card" style={{ textAlign: 'center', borderTop: `3px solid ${riskColors[r]}` }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: riskColors[r] }}>
              {stats.by_risk[r] || 0}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4, textTransform: 'capitalize' }}>
              {r} Risk
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline stages */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: 'var(--navy)' }}>
          Pipeline by Stage
        </h2>
        <div style={{ display: 'flex', gap: 0, overflowX: 'auto' }}>
          {STAGE_ORDER.filter(s => s !== 'rejected').map((stage, i) => {
            const count = stats.by_stage[stage] || 0;
            const labels: Record<string, string> = {
              intake: 'Intake',
              regulatory_assessment: 'Regulatory\nAssessment',
              legal_review: 'Legal\nReview',
              compliance_signoff: 'Compliance\nSign-off',
              approved: 'Approved',
            };
            return (
              <div key={stage} style={{ flex: 1, display: 'flex', alignItems: 'center', minWidth: 100 }}>
                <div
                  onClick={() => navigate(`/products?stage=${stage}`)}
                  style={{
                    flex: 1, textAlign: 'center', padding: '16px 8px',
                    background: count > 0 ? 'var(--navy)' : 'var(--bg)',
                    color: count > 0 ? '#fff' : 'var(--text-muted)',
                    borderRadius: 8, cursor: 'pointer',
                    transition: 'opacity .15s',
                  }}
                >
                  <div style={{ fontSize: 28, fontWeight: 800 }}>{count}</div>
                  <div style={{ fontSize: 11, marginTop: 4, whiteSpace: 'pre-line', lineHeight: 1.3 }}>
                    {labels[stage]}
                  </div>
                </div>
                {i < 4 && (
                  <div style={{ color: 'var(--border)', fontSize: 20, padding: '0 4px' }}>›</div>
                )}
              </div>
            );
          })}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, minWidth: 80 }}>
            <div style={{ color: 'var(--border)', fontSize: 20, padding: '0 4px' }}>·</div>
            <div style={{
              flex: 1, textAlign: 'center', padding: '16px 8px',
              background: (stats.by_stage['rejected'] || 0) > 0 ? '#fee2e2' : 'var(--bg)',
              color: (stats.by_stage['rejected'] || 0) > 0 ? 'var(--high)' : 'var(--text-muted)',
              borderRadius: 8,
            }}>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{stats.by_stage['rejected'] || 0}</div>
              <div style={{ fontSize: 11, marginTop: 4 }}>Rejected</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent products */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)' }}>Recent Products</h2>
          <button className="btn btn-ghost" onClick={() => navigate('/products')}>View All</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Product', 'Type', 'Stage', 'Risk', 'Score', 'Submitted By'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '6px 12px', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stats.recent_products.map(p => (
              <tr
                key={p.id}
                onClick={() => navigate(`/products/${p.id}`)}
                style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg)')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}
              >
                <td style={{ padding: '12px', fontWeight: 600, color: 'var(--navy)' }}>
                  {p.name}
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>{p.product_id}</div>
                </td>
                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{PRODUCT_TYPE_LABELS[p.product_type] || p.product_type}</td>
                <td style={{ padding: '12px' }}><StageBadge stage={p.current_stage} /></td>
                <td style={{ padding: '12px' }}><RiskBadge level={p.risk_level} /></td>
                <td style={{ padding: '12px', fontWeight: 700, color: 'var(--navy)' }}>{p.risk_score}</td>
                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{p.submitted_by}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
