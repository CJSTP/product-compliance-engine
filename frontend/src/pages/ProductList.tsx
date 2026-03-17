import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import type { Product, WorkflowStage } from '../types';
import RiskBadge from '../components/RiskBadge';
import StageBadge from '../components/StageBadge';

const STAGES: { value: string; label: string }[] = [
  { value: '', label: 'All Stages' },
  { value: 'intake', label: 'Intake' },
  { value: 'regulatory_assessment', label: 'Regulatory Assessment' },
  { value: 'legal_review', label: 'Legal Review' },
  { value: 'compliance_signoff', label: 'Compliance Sign-off' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const TYPE_LABELS: Record<string, string> = {
  bnpl: 'BNPL', crypto_exchange: 'Crypto Exchange', prepaid_card: 'Prepaid Card',
  money_transfer: 'Money Transfer', personal_lending: 'Personal Lending',
  payment_app: 'Payment App', savings_deposit: 'Savings / Deposit',
  foreign_remittance: 'Foreign Remittance',
};

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const stageFilter = searchParams.get('stage') || '';

  useEffect(() => {
    api.listProducts(stageFilter || undefined)
      .then(setProducts)
      .catch(e => setError(e.message));
  }, [stageFilter]);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.product_id.toLowerCase().includes(search.toLowerCase()) ||
    p.submitted_by.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Products</h1>
        <button className="btn btn-primary" onClick={() => navigate('/new')}>+ Submit Product</button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <input
          placeholder="Search by name, ID, or submitter..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 320 }}
        />
        <select
          value={stageFilter}
          onChange={e => setSearchParams(e.target.value ? { stage: e.target.value } : {})}
          style={{ maxWidth: 220 }}
        >
          {STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {error && <p style={{ color: 'var(--high)', marginBottom: 16 }}>{error}</p>}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--navy)', color: '#fff' }}>
              {['Product', 'Type', 'States', 'Stage', 'Risk', 'Score', 'Requirements', 'Submitted By', 'Launch Date'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11, fontWeight: 600, letterSpacing: '.06em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={9} style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>No products found.</td></tr>
            )}
            {filtered.map(p => {
              const pending = p.requirements.filter(r => r.status === 'pending' && r.is_blocking).length;
              const total = p.requirements.length;
              const done = p.requirements.filter(r => r.status === 'complete' || r.status === 'waived').length;
              return (
                <tr
                  key={p.id}
                  onClick={() => navigate(`/products/${p.id}`)}
                  style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                >
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--navy)' }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.product_id}</div>
                  </td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{TYPE_LABELS[p.product_type]}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: 12 }}>
                    {p.target_states.split(', ').length} states
                  </td>
                  <td style={{ padding: '12px 14px' }}><StageBadge stage={p.current_stage as WorkflowStage} /></td>
                  <td style={{ padding: '12px 14px' }}><RiskBadge level={p.risk_level} /></td>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--navy)' }}>{p.risk_score}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ fontSize: 12, color: pending > 0 ? 'var(--high)' : 'var(--low)' }}>
                      {done}/{total} complete
                    </div>
                    {pending > 0 && (
                      <div style={{ fontSize: 11, color: 'var(--high)' }}>{pending} blocking</div>
                    )}
                  </td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>{p.submitted_by}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: 12 }}>{p.target_launch_date || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
